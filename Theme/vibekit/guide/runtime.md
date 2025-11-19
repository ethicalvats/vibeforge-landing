# Runtime

The Vibekit runtime is responsible for taking your `vibespec.md` file and turning it into a running web application. It's built on SwiftNIO and consists of several key components that work together to serve your application.

## Server

The core of the runtime is the `Server` class, a lightweight HTTP server built on SwiftNIO. It exposes a RESTful API based on your `vibespec.md` file and also serves your theme's static assets.

### API Endpoints

The server automatically generates the following API endpoints:

*   **`GET /_spec`:** Returns the entire `VibeSpec` object as JSON.
*   **`GET /things`:** Returns a list of all the defined `Thing` types.
*   **`GET /things/:thing`:** Returns a list of all instances of a specific `Thing`.
*   **`GET /things/:thing/:id`:** Returns a single instance of a `Thing`.
*   **`POST /events`:** Creates a new `Event` and adds it to the event log. The body of the request should be a JSON object with a `type` field and a payload.
*   **`GET /events`:** Returns a list of all the events that have been processed by the application.

## SpecState

The `SpecState` class is a thread-safe container for the parsed `VibeSpec`. It holds the current version of your application's schema in memory and can be updated dynamically, for example, when you are running in development mode and the `vibespec.md` file changes.

## EventLog

The `EventLog` is responsible for persisting all the `Events` that have been processed by the application. It can be configured to work in memory or with a file-based persistence layer. The event log is used to rebuild the application's state when it is restarted.

## ThingStore

The `ThingStore` is a protocol that defines the interface for a data store. The default implementation is an `InMemoryStore` that uses the `EventLog` to rebuild its state. You can also provide your own implementation of the `ThingStore` protocol to use a different persistence backend, such as a database.