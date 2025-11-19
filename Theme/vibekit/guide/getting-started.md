# Getting Started

This guide will walk you through creating and running your first Vibekit application.

## Prerequisites

Before you begin, ensure you have the `vibekit` CLI installed on your system.

## 1. Create a New App

Vibekit provides a `new` command to scaffold a new project. Open your terminal and run the following command:

```bash
vibekit new my-awesome-blog
```

This will create a new directory named `my-awesome-blog` with the following structure:

```
my-awesome-blog/
├── .vibekit/
│   └── config.yml
├── Plugins/
│   └── README.md
├── Theme/
│   └── ...
└── vibespec.md
```

The `vibespec.md` file is pre-populated with a simple blog schema to get you started. Here's what it looks like:

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

## 2. Start the Dev Server

Navigate into the newly created directory and start the development server.

```bash
cd my-awesome-blog
vibekit dev
```

This command starts a local server (usually on `http://127.0.0.1:8080`) with hot-reloading enabled. When you make changes to your `vibespec.md` or theme files, the application will automatically update.

## 3. Explore the API

Your application is now running. You can interact with its automatically generated API.

### View the Spec

To see the parsed schema of your application, open your browser or use a tool like `curl` to access the `/_spec` endpoint:

```bash
curl http://127.0.0.1:8080/_spec
```

### List Things

To see all the "Post" records (which will be empty initially), you can query the `/things` endpoint:

```bash
curl http://127.0.0.1:8080/things/posts
```

## 4. Emit an Event

To create a new post, you need to emit an event. The `vibespec.md` defines a `Post.created` event. You can emit this event by sending a `POST` request to the `/events` endpoint:

```bash
curl -X POST http://127.0.0.1:8080/events \
-H "Content-Type: application/json" \
-d 
'{ 
  "type": "Post.created",
  "id": "11111111-1111-1111-1111-111111111111",
  "title": "My First Post",
  "body": "Hello, world!",
  "authorId": "22222222-2222-2222-2222-222222222222"
}'
```

Now, if you list the posts again, you will see your newly created post.

You have successfully created and interacted with your first Vibekit application! You can now explore modifying the `vibespec.md` to change your application's schema or customize the `Theme/` to change its appearance.
