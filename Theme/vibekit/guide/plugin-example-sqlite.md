# Plugin Example: SQLite Persistence

This guide provides a complete walkthrough of the `SQLitePersistencePlugin`, a bundled plugin that demonstrates how to persist your application's state to a SQLite database.

## Overview

The `SQLitePersistencePlugin` hooks into the lifecycle of `Things` and `Events` to save their data to a SQLite file. This ensures that your application's state is not lost when it restarts.

## `plugin.json` Manifest

The plugin is defined by the following `plugin.json` file:

```json
{
  "name": "SQLitePersistence",
  "packagePath": "../../../PluginPackages/SQLitePersistencePlugin",
  "packageName": "SQLitePersistencePlugin",
  "product": "SQLitePersistencePlugin",
  "entry": "register_sqlite_persistence_plugin",
  "allow-serve": true,
  "library": "libSQLitePersistencePlugin.dylib",
  "config": {
    "database": ".vibekit/sqlite/state.sqlite"
  }
}
```

*   **`name`**: "SQLitePersistence" - The unique name of the plugin.
*   **`product`**: "SQLitePersistencePlugin" - The name of the compiled Swift package product.
*   **`entry`**: "register_sqlite_persistence_plugin" - The C-style function that Vibekit calls to initialize the plugin.
*   **`allow-serve`**: `true` - Opts the plugin into `vibekit serve` so it runs in production.
*   **`config.database`**: ".vibekit/sqlite/state.sqlite" - The default path to the SQLite database file, relative to the application's root directory.

## Implementation Breakdown

The core logic of the plugin is in the `registerVibeKitPlugin` function, which sets up all the necessary hooks.

### Store Hooks

The plugin uses `StoreHooks` to keep the database in sync with the in-memory `ThingStore`.

*   **`onBootstrap`**: When the application starts, this hook is called to load all the records from the `records` table in the SQLite database and populate the in-memory store.
*   **`onDidCreate`**: After a new `Thing` is created, this hook is triggered to insert a new record into the `records` table.
*   **`onDidApply`**: After an `Event` is applied to a `Thing`, this hook updates the corresponding record in the `records` table.
*   **`onDidDelete`**: When a `Thing` is deleted, this hook removes the corresponding record from the `records` table.

### Event Hooks

The plugin also uses `EventHooks` to maintain a log of all events.

*   **`onBootstrap`**: On startup, this hook loads all past events from the `events` table.
*   **`onAppend`**: Every time a new `Event` is processed, this hook appends it to the `events` table in the database.

### Snapshot Exporter

The plugin implements a `registerSnapshotExporter` to allow the CLI to create a portable snapshot of the database. When you run `vibekit snapshot export`, this function is called to:
1.  Read all records from the live SQLite database.
2.  Create a sanitized copy of the database file in the snapshot bundle.
3.  Create a `store-snapshot.json` file containing all the data, which can be used to bootstrap a new instance of the application.

## How to Use

To use this plugin in your project, you can add it with the `vibekit new` command:

```bash
vibekit new my-app --plugins sqlite
```

This will scaffold a new application and automatically include the `SQLitePersistencePlugin` in the `Plugins` directory. When you run your application, the plugin will automatically create and manage the SQLite database file at the path specified in the `config` section of its `plugin.json`.
