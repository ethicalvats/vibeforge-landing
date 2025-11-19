# Core Concepts

At the heart of every Vibekit application lies the `vibespec.md` file. This file is the blueprint for your application, defining its fundamental building blocks in a clear and declarative way. When parsed, this file creates a `VibeSpec` object that the runtime uses to build your application.

## The `VibeSpec`

The `VibeSpec` is the in-memory representation of your `vibespec.md` file. It contains the definitions for all the core components of your application.

### Things

Things are the domain entities of your application, defined by `ThingDefinition`. They represent the data models that your application will manage. For example, in a blogging application, a `Post` or a `User` would be a Thing.

A `ThingDefinition` has the following properties:

*   **`name`:** The name of the Thing (e.g., "Post").
*   **`fields`:** An array of `Field` objects that define the properties of the Thing.
*   **`initialState`:** The initial state of a new Thing instance.
*   **`visibility`:**  Can be `public` or `private`.

Each `Field` has a `name`, `type`, and an array of `modifiers`. Modifiers can be used to add constraints or hints to a field, such as `@required`, `@unique`, or `@default`.

### Fields

A `Field` defines a property within a `Thing` or an `Event`. It has the following properties:

*   **`name`:** The name of the field (e.g., "title").
*   **`type`:** The data type of the field (e.g., "String", "Text", "UUID").
*   **`modifiers`:** An array of `Modifier` objects that apply constraints or special behaviors to the field. Common modifiers include:
    *   `@required`: The field must have a value.
    *   `@unique`: The field's value must be unique across all instances of the `Thing`.
    *   `@min(value)`: Specifies a minimum length for strings or a minimum value for numbers.
    *   `@max(value)`: Specifies a maximum length for strings or a maximum value for numbers.
    *   `@type(typeName)`: Overrides the inferred type.
    *   `@enum([value1, value2])`: Defines a set of allowed values for the field.
    *   `@default(value)`: Provides a default value for the field.
*   **`defaultValue`:** An optional default value for the field.
*   **`relation`:** Defines a relationship to another `Thing`, such as `@relation(User)` for a `belongsTo` relationship or `@relation(Post, inverse: comments)` for a `hasMany` relationship.

### Events

Events represent the actions that can be performed in your application, defined by `EventDefinition`. They are immutable and have a fixed payload shape. For example, `createPost` or `loginUser` would be Events.

An `EventDefinition` has the following properties:

*   **`name`:** The name of the Event (e.g., "createPost").
*   **`fields`:** An array of `Field` objects that define the payload of the Event.

### State

State definitions, represented by `StateDefinition`, declare the legal state transitions for a `Thing`. They act as state machines that control how a `Thing` can be mutated in response to `Events`.

A `StateDefinition` has the following properties:

*   **`name`:** The name of the state machine, which corresponds to a `Thing`.
*   **`states`:** An array of possible states (e.g., "draft", "published").
*   **`transitions`:** An array of `Transition` objects that define how the state changes.

### State Transitions

A `Transition` defines how a `Thing`'s state changes in response to a specific `Event`. Each transition has the following properties:

*   **`onEvent`:** The name of the `Event` that triggers this transition.
*   **`assignments`:** An array of `Assignment` objects, where each assignment specifies a `field` to be updated and its new `value`.
*   **`guardExpression`:** An optional expression that must evaluate to true for the transition to occur. This allows for conditional state changes.

A `Transition` is triggered by an `onEvent` and contains an array of `assignments` that mutate the fields of the `Thing`.

### Example `vibespec.md`

Here is a more complete example for a simple blog that demonstrates how these concepts work together.

```markdown
# VibeSpec for blog
Version 1.0.0

Thing Post {
  id: UUID
  title: String @required
  body: Text @required
  state: PostState = draft
}
Event Post.created { id: UUID, title: String, body: Text }
Event Post.edited { id: UUID, title: String, body: Text }
Event Post.published { id: UUID }
State PostState { states: [draft, reviewing, published]; 
  transitions: [state->reviewing] on Post.edited; [state->published] on Post.published 
}
```

In this example:
- We have a **Thing**: `Post`. A `Post` has a `state` field which is of type `PostState` and defaults to `draft`.
- We have three **Events**: `Post.created` to create a new post, `Post.edited` to modify an existing post, and `Post.published` to change its status.
- We have a **State** machine named `PostState` that is associated with the `Post` Thing. It defines three possible states (`draft`, `reviewing`, `published`) and the transitions between them. An `Post.edited` event will move the post's status to `reviewing`, and a `Post.published` event will move it to `published`.
