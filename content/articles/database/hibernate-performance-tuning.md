---
title: "Hibernate Performance Tuning"
description: "Advanced techniques for optimizing your JPA queries and caching strategies."
category: "database"
date: "2026-06-18T10:00:00Z"
---

# Hibernate Performance Tuning

The dreaded **N+1 Query Problem** is the silent killer of enterprise Java applications. 

## Entity Graphs

Instead of relying on `EAGER` fetching (which is an anti-pattern) or writing custom `JOIN FETCH` queries for everything, you can use `@NamedEntityGraph`.

```java
@Entity
@NamedEntityGraph(name = "Post.comments", attributeNodes = @NamedAttributeNode("comments"))
public class Post {
    @Id
    private Long id;
    
    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY)
    private List<Comment> comments;
}
```

Then in your repository:

```java
@EntityGraph(value = "Post.comments", type = EntityGraph.EntityGraphType.LOAD)
List<Post> findAll();
```
