---
title: "Spring Data JPA"
description: "Build repository abstractions with Spring Data JPA, derived and declared queries, pagination, sorting, transactions, and auditing."
category: "level-8"
date: "2026-10-29T10:00:00Z"
---

JPA lets an application persist objects through an object-relational mapping, but application code still needs a clear place to express queries and persistence operations. Spring Data JPA builds repository implementations from interfaces, so common data access can be declared instead of repeated as boilerplate. The abstraction is convenient, not magic: query methods still execute database queries, and their performance and transaction semantics matter.

The examples use the Spring Data JPA 4.x reference and Java 21. JPA entities and a compatible provider such as Hibernate are assumed; this repository does not include those dependencies or a database, so the snippets are instructional rather than locally compiled or executed.

## Repository interfaces

Spring Data's `Repository<T, ID>` identifies the domain type and its identifier type. `CrudRepository<T, ID>` adds common operations such as `save`, `findById`, `findAll`, `count`, and `delete`. JPA applications often extend `JpaRepository<T, ID>` to use the JPA-specific repository API, including methods for flushing and batch operations. Choose the narrowest interface that exposes what the application needs; broad repositories should not become an excuse for arbitrary persistence access in controllers.

```java
package com.example.orders.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByExternalReference(String externalReference);

    List<PurchaseOrder> findByStatus(OrderStatus status);
}
```

Spring Data creates a proxy implementation when repository scanning is enabled. The application injects the interface; it does not instantiate the repository implementation itself. `save` delegates to persistence behavior and returns the saved entity. With JPA, a new entity is generally persisted, whereas an entity considered existing is merged; when working with detached entities, use the returned value because `merge` returns the managed instance.

## Deriving queries from method names

Spring Data parses repository method names into store-specific queries. A method such as `findByStatusAndCreatedAtAfter` expresses equality on `status` and a greater-than comparison on `createdAt`. Derived methods work well for short, readable predicates:

```java
List<PurchaseOrder> findByStatusAndCreatedAtAfter(
        OrderStatus status, Instant createdAt);

boolean existsByExternalReference(String externalReference);

long countByStatus(OrderStatus status);
```

The parser recognizes property names and keywords such as `And`, `Or`, `Between`, `LessThan`, `Containing`, `IgnoreCase`, `OrderBy`, `First`, and `Top`. The method must correspond to properties in the domain model. Use explicit property paths or an underscore to disambiguate nested property traversal when the parser could read a name in more than one way.

Method-name queries become hard to maintain when they encode many nested conditions or intricate business logic. Prefer a named `@Query`, a reusable `Specification`, or a custom repository fragment rather than growing a method name into an unreadable expression. A startup query-creation exception usually means a property or keyword does not match the entity model; inspect the full exception and verify the exact mapped property names.

## JPQL and native SQL with `@Query`

`@Query` lets a repository declare a query directly. By default, a JPA query string is **JPQL**: it refers to entity names and Java attributes, not physical table and column names:

```java
@Query("""
       select p
       from PurchaseOrder p
       where p.status = :status
         and p.createdAt >= :since
       """)
List<PurchaseOrder> findRecentOrders(
        @Param("status") OrderStatus status,
        @Param("since") Instant since);
```

JPQL is validated and translated by the JPA provider for the target database. A native query is SQL tied more directly to the database schema and dialect:

```java
@Query(value = """
       select *
       from purchase_order
       where status = :status
       """, nativeQuery = true)
List<PurchaseOrder> findByStatusUsingSql(
        @Param("status") String status);
```

Use native SQL only when JPQL or derived queries cannot express the requirement well, or when database-specific features are intentionally part of the design. Native queries are more sensitive to schema changes and portability concerns. For paged native queries, provide or verify a suitable count query when Spring cannot derive one correctly.

Bind values through named or positional parameters. Do not concatenate request data into JPQL or SQL. Parameters bind values, not SQL identifiers such as a column name or sort direction; if clients can choose a sort field, map an allowlisted external option to a known property rather than passing arbitrary text into a query.

For update and delete statements declared with `@Query`, mark the method with `@Modifying` and provide an intentional transaction boundary. Bulk operations execute directly against the database and can leave already-managed entity instances in the persistence context stale; consider whether the persistence context must be flushed or cleared and whether callbacks or entity-level behavior are bypassed.

## Pagination and sorting

Accept a `Pageable` parameter to request a window of data and return a `Page<T>` when clients need page metadata:

```java
Page<PurchaseOrder> findByStatus(
        OrderStatus status, Pageable pageable);
```

```java
Pageable page = PageRequest.of(
        0, 25, Sort.by(Sort.Direction.DESC, "createdAt"));
Page<PurchaseOrder> result = repository.findByStatus(
        OrderStatus.OPEN, page);
```

Page numbers are zero-based. A `Page` includes total-element and total-page information, which can require an additional count query. If the caller only needs to know whether another window exists, `Slice<T>` can avoid requiring an exact total count. For large data sets, offset pagination can become expensive as the offset grows; consider keyset scrolling or cursor-based API design when measurements justify it.

Sorting properties should be entity properties and should be validated against a deliberate allowlist when they come from external input. Stable ordering matters: sorting only by a non-unique field can produce items that move between pages as the data changes. Add a unique tie-breaker, such as the identifier, when consistent paging is important.

Pagination is not a query optimization by itself. Inspect generated SQL, count-query cost, fetch behavior for relationships, and the database execution plan. Avoid returning a page of entities whose lazy relationships trigger an N+1 query during serialization; use a DTO projection or a use-case-specific fetch plan instead.

## Transactions and service boundaries

Spring Data configures transactional behavior for inherited CRUD repository methods. Declared query methods do not necessarily receive transaction configuration automatically. Prefer placing a transaction boundary at the service operation when it coordinates multiple repository calls:

```java
@Service
class OrderManagementService {
    private final PurchaseOrderRepository orders;
    private final InventoryRepository inventory;

    OrderManagementService(
            PurchaseOrderRepository orders,
            InventoryRepository inventory) {
        this.orders = orders;
        this.inventory = inventory;
    }

    @Transactional
    PurchaseOrder reserveAndConfirm(long orderId) {
        PurchaseOrder order = orders.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        inventory.reserve(order.items());
        order.confirm();
        return orders.save(order);
    }
}
```

`OrderNotFoundException`, `InventoryRepository`, and the entity methods are application-defined. An outer service transaction coordinates participating repository operations so the unit of work can commit or roll back together. The example uses explicit `save` for consistency with the repository abstraction; for a managed entity inside a JPA transaction, dirty checking can persist changes without calling `save` again.

A `readOnly = true` transaction is a hint to the transaction infrastructure and provider; it is not a universal enforcement mechanism that makes writes impossible. Transaction annotations on Spring-managed services also depend on proxy-based transaction configuration, so calls made through `this` do not cross the transaction proxy.

## Auditing creation and modification

Spring Data auditing can populate metadata such as creation and last-modified timestamps, and optionally the acting principal. Enable auditing and register the entity listener:

```java
@Configuration
@EnableJpaAuditing
class PersistenceConfiguration {
}
```

```java
@Entity
@EntityListeners(AuditingEntityListener.class)
class PurchaseOrder {
    @Id
    @GeneratedValue
    private Long id;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant lastModifiedAt;
}
```

The snippets omit imports, constructors, accessors, and the remaining entity mapping. `@CreatedBy` and `@LastModifiedBy` can record who created or modified an entity; for those fields, provide an `AuditorAware<T>` implementation that obtains the current actor from the application's authentication or execution context. Avoid copying arbitrary client-supplied actor values into audit fields. Auditing metadata is useful operational history, but it does not replace an append-only audit log when regulatory or tamper-evidence requirements apply.

## When to move beyond a basic repository

Keep a repository interface focused on persistence queries. If query composition grows, Spring Data JPA `Specification` and `JpaSpecificationExecutor` let an application compose predicates using the Criteria API. For custom behavior that does not fit a derived method or declared query, use a custom repository fragment with an application-owned implementation.

Keep business rules and orchestration in a service/domain layer rather than overloading the repository with workflows. Keep API concerns such as JSON DTOs, HTTP status codes, and pagination response shapes at the web boundary rather than exposing repository abstractions directly as the external contract.

## Common failure modes

- **A repository bean is missing:** Verify the persistence starter/provider, entity scanning, repository package scanning, and datasource setup.
- **A derived query fails at startup:** Confirm each parsed name segment matches a mapped property and a supported keyword.
- **A query refers to an unknown attribute:** JPQL uses entity attributes and entity names; native SQL uses physical table and column names.
- **A `Page` endpoint is slow:** Inspect both the result query and its count query; consider `Slice`, keyset scrolling, or a more focused response.
- **Pages contain duplicates or unstable results:** Check fetch joins, sort determinism, unique tie-breakers, and changes made while clients page through results.
- **A custom delete/update leaves stale objects:** Bulk queries bypass normal managed-entity synchronization; flush/clear deliberately or reload affected state.
- **Audit fields stay empty:** Confirm auditing is enabled, the JPA listener is registered, and an `AuditorAware` exists for actor fields.
- **Multiple calls commit separately:** Put the transaction boundary around the application use case, not only individual repository methods.

## Further reading

- Spring Data Commons, [Core Concepts and CRUD Repositories](https://docs.spring.io/spring-data/commons/reference/repositories/core-concepts.html)
- Spring Data JPA, [Query Methods](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)
- Spring Data JPA, [Specifications](https://docs.spring.io/spring-data/jpa/reference/jpa/specifications.html)
- Spring Data JPA, [Transactionality](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)
- Spring Data JPA, [Auditing](https://docs.spring.io/spring-data/jpa/reference/auditing.html)
- [Building RESTful APIs](./building-restful-apis)
