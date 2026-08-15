---
title: "Advanced Class Design"
description: "Master Inner Classes, Anonymous Classes, memory leak traps, and modern Java 14 Records."
category: "level-1"
date: "2026-06-25T10:00:00Z"
---

Up to this point, we have built top-level classes in their own files. However, Java allows you to nest classes *inside* other classes, and even inside methods! 

Understanding these advanced structures is critical for mastering design patterns (like the Builder pattern) and preventing severe memory leaks. 

Furthermore, we will explore the **Java 14 Record**, which revolutionized how we build immutable data carriers in modern Java.

## 1. Nested Classes vs Inner Classes

A class defined within another class is called a Nested Class. However, the terminology is extremely strict:
1. **Static Nested Classes**: Declared with `static`.
2. **Inner Classes**: Non-static.

### Static Nested Classes
A `static` nested class is essentially a normal top-level class that has been tucked inside another class for packaging convenience. 

Because it is `static`, it **does not** hold a reference to an instance of the outer class. Therefore, it **cannot** access non-static fields of the outer class.

```java
public class Outer {
    private String name = "Outer Instance";
    private static int COUNT = 5;

    public static class StaticNested {
        public void print() {
            System.out.println(COUNT); // OK!
            // System.out.println(name); // ERROR! Cannot access instance variables.
        }
    }
}
```
*Usage:* You instantiate it without needing an outer instance: `Outer.StaticNested nested = new Outer.StaticNested();`. This is heavily used in the **Builder Design Pattern**.

### Non-Static Inner Classes
A standard Inner Class is tied to a *specific instance* of the Outer class. 

Under the hood, the Java compiler secretly injects a hidden pointer (named `Outer.this`) into the Inner class, pointing directly to the Outer class instance in memory. Because of this hidden pointer, the Inner class has full access to the Outer class's `private` variables!

```java
public class BankAccount {
    private double balance = 1000.0;

    // INNER CLASS
    public class Transaction {
        public void deduct(double amount) {
            // It has direct access to the outer private 'balance'!
            balance -= amount; 
        }
    }
}
```

*Usage:* You *must* have an instance of the outer class to create an inner class.
```java
BankAccount account = new BankAccount();
BankAccount.Transaction tx = account.new Transaction(); // Notice the weird syntax!
```

### The Synthetic Method Secret
Wait... how can `Transaction` access the `private` variable `balance`? At the JVM bytecode level, classes are strictly forbidden from accessing each other's private variables, even inner classes!
When you compile this code, the Java Compiler secretly generates a hidden, package-private method inside `BankAccount` called a **Synthetic Accessor Method** (usually named something like `access$000()`). The inner class actually calls this hidden generated method to fetch the private variable!

> [!CAUTION]
> **The Memory Leak Trap:** Because Inner classes hold a hidden reference to the Outer class (`Outer.this`), the Garbage Collector *cannot* destroy the Outer class as long as the Inner class is still alive. If you pass an Inner class to a long-running background thread, you will accidentally keep the entire massive Outer class alive in memory forever, causing an `OutOfMemoryError`.

> [!WARNING]
> **The Serialization Trap:** Never implement `Serializable` on a non-static Inner Class. Because it holds a reference to the Outer Class, the JVM will attempt to serialize the *entire* Outer class along with it! If the Outer class is not serializable, it will crash with a `NotSerializableException`.

## 2. Local and Anonymous Inner Classes

### Local Inner Classes
You can actually define a class *inside a method*. The class only exists for the duration of that method.

```java
public void processData(int dataId) {
    // Local Inner Class
    class DataValidator {
        public boolean isValid() { return dataId > 0; }
    }
    
    DataValidator validator = new DataValidator();
    validator.isValid();
}
```
**The Variable Capture Rule**: A local inner class can only access local variables (like `dataId`) if they are `final` or *effectively final* (never modified). Why? Because method variables live on the **Stack** and are destroyed when the method ends, but the inner class object lives on the **Heap**. Java secretly copies the Stack variable into the Heap object, so the variable must be immutable to prevent sync issues!

### Anonymous Inner Classes
Sometimes you need a quick implementation of an Interface, and you don't want to create a whole new file for it. You can instantiate an interface "on the fly" using an Anonymous Inner Class.

```java
public interface ClickListener {
    void onClick();
}

public class UI {
    public void setup() {
        // We are instantiating an interface by providing the body immediately!
        ClickListener buttonLogic = new ClickListener() {
            @Override
            public void onClick() {
                System.out.println("Button was clicked!");
            }
        };
    }
}
```
*Note: In modern Java (Java 8+), Anonymous Inner Classes that implement a single-method interface are almost entirely replaced by Lambdas (`ClickListener logic = () -> System.out.println("Clicked!");`).*

## 3. Java 14 Records: The Modern Data Carrier

For 25 years, Java developers suffered from "Boilerplate Hell". If you wanted to create a simple class just to hold data (a DTO or POJO), you had to write 50 lines of code: `private` fields, a constructor, getters, `equals()`, `hashCode()`, and `toString()`. 

Many developers relied on third-party plugins like Project Lombok (`@Data`) to auto-generate this code.

In Java 14, the language fundamentally solved this with the `record` keyword.

```java
// That's it. This is the entire class.
public record User(int id, String username, String email) { }
```

When you compile this one line of code, the Java compiler automatically generates:
1. `private final` fields for `id`, `username`, and `email`.
2. A canonical constructor requiring all three fields.
3. Public accessor methods exactly matching the field names: `id()`, `username()`, `email()` (Notice: it does *not* use `getUsername()`).
4. A highly optimized, perfectly implemented `equals()` and `hashCode()` method.
5. A `toString()` method that prints `User[id=1, username=alice, email=a@a.com]`.

### Record Rules and Constraints
Because Records are designed to be strictly **immutable data carriers**:
- **Immutability**: All fields are `final`. You cannot create setters. Once a Record is created, it cannot be changed.
- **Inheritance**: Records implicitly `extend java.lang.Record`. Because Java forbids multiple inheritance, a Record **cannot extend any other class**.
- **Interfaces**: Records *can* implement interfaces!
- **State**: You cannot declare additional instance variables inside the body of a Record. You can only declare `static` variables.

### Compact Constructors
If you need to validate the data being passed into a Record (e.g., ensuring `id` is positive), you don't need to rewrite the whole constructor. You use a **Compact Constructor**, which omits the parameters entirely!

```java
public record User(int id, String username, String email) {
    
    // Compact Constructor (No parameters listed!)
    public User {
        if (id < 0) {
            throw new IllegalArgumentException("ID cannot be negative!");
        }
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required!");
        }
        // The compiler automatically assigns this.id = id at the end of this block.
    }
}
```

### Record Patterns (Java 21+)
Because the JVM knows exactly what data makes up a Record, Java 21 introduced **Record Patterns**, allowing you to deconstruct a record directly inside an `if` or `switch` statement!

```java
Object obj = new User(42, "bob", "bob@example.com");

// We check the type AND extract the variables in a single line!
if (obj instanceof User(int id, String name, String email)) {
    System.out.println("Extracted ID: " + id);
    System.out.println("Extracted Name: " + name);
}
```
This entirely eliminates the need to call getter methods!

---

## 🎯 Interview Questions

**1. Why can a Local Inner class only access `effectively final` local variables?**
> *Answer:* Local variables live on the Thread Stack and are destroyed when the method returns. The Inner class object lives on the Heap and might outlive the method execution. To solve this, the compiler secretly copies the local variable into the Heap object. If the variable wasn't `final`, the Stack value and the Heap copy could become out of sync, causing massive data inconsistency.

**2. What is the difference between a Static Nested class and a non-static Inner class?**
> *Answer:* A Static Nested class is just a top-level class placed inside another for namespace grouping; it does not have a reference to the outer instance. A non-static Inner class holds a hidden reference (`Outer.this`) to the specific instance of the outer class, granting it direct access to the outer class's private instance variables.

**3. Can a Java `record` extend another class?**
> *Answer:* No. Every record implicitly extends `java.lang.Record`. Since Java strictly enforces single inheritance of state, it cannot extend any other class. However, a record can implement multiple interfaces.
