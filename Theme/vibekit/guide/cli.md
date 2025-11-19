# CLI

Vibekit comes with a command-line interface (CLI) that you can use to create, manage, and build your applications.

## Commands

The following commands are available in the Vibekit CLI:

### `vibekit new <name>`

Scaffolds a new Vibekit application.

*   **`--theme <theme>`:** Specifies a theme template to use. Defaults to "blog".
*   **`--plugins <plugins>`:** A comma-separated list of plugin templates to include (e.g., "sqlite,mailersend").

**Usage:**
```bash
vibekit new my-blog --theme blog --plugins sqlite
```

### `vibekit serve`

Runs the runtime HTTP server in read-only mode for production snapshots.

*   **`--app <path>`:** Path to the app directory.
*   **`--host <host>`:** Host interface to bind to. Defaults to "0.0.0.0".
*   **`--port <port>`:** Port to bind to. Defaults to the `PORT` environment variable or 8080.
*   **`--spec <path>`:** Overrides the path to `vibespec.md`.
*   **`--snapshot <path>`:** An optional JSON snapshot to bootstrap the data store.
*   **`--base-url <url>`:** A base URL to use during theme rendering.
*   **`--api-only`:** Disables theme rendering and exposes only the JSON API.

**Usage:**
```bash
vibekit serve --port 8888 --snapshot .vibekit/bootstrap.json
```

### `vibekit dev`

Runs the dev server with hot reload and spec auto-versioning. This command is only available on macOS.

*   **`--spec <path>`:** Path to `vibespec.md`.
*   **`--host <host>`:** Host to bind to. Defaults to "127.0.0.1".
*   **`--port <port>`:** Port to bind to. Defaults to 8080.

**Usage:**
```bash
vibekit dev --port 3000
```

### `vibekit snapshot export`

Exports a deployable snapshot bundle of your application.

*   **`--app <path>`:** Path to the app directory.
*   **`--output <path>`:** The destination directory for the snapshot bundle.
*   **`--name <name>`:** The name of the bundle. Defaults to a timestamp.
*   **`--spec <path>`:** Overrides the path to `vibespec.md`.
*   **`--container`:** Builds a Docker container image from the exported snapshot.
*   **`--container-tag <tag>`:** The tag to assign to the generated container image.
*   **`--container-platform <platform>`:** The container platform. Defaults to "linux/amd64".

**Usage:**
```bash
vibekit snapshot export --name "release-v1.0.0" --container --container-tag my-app:latest
```

### `vibekit deploy push`

Exports and deploys a snapshot to a remote host via SSH.

*   **`--app <path>`:** Path to the local app directory.
*   **`--remote <remote>`:** The SSH target in the form `user@host`.
*   **`--path <path>`:** The remote base directory for releases.
*   **`--release <name>`:** Overrides the snapshot name/release identifier.
*   **`--identity <path>`:** The path to an SSH identity key.
*   **`--restart <command>`:** A command to execute remotely after activation to restart the service.

**Usage:**
```bash
vibekit deploy push --remote user@my-server.com --path /var/www/my-app --restart "sudo systemctl restart my-app"
```

### `vibekit deploy cloud-run`

Exports a snapshot, builds a container, and deploys it to Google Cloud Run.

*   **`--app <path>`:** Path to the app directory.
*   **`--project <project>`:** The Google Cloud project ID.
*   **`--region <region>`:** The Google Cloud Run region.
*   **`--service <service>`:** The Cloud Run service name.
*   **`--image <image>`:** The container image tag to build and deploy.
*   **`--env <KEY=VALUE>`:** Environment variables to set on the service.
*   **`--allow-unauthenticated`:** Allows unauthenticated invocations.
*   **`--domain <domain>`:** Maps the deployed service to a custom domain.

**Usage:**
```bash
vibekit deploy cloud-run --project my-gcp-project --region us-central1 --service my-app-service
```

### `vibekit events`

Tails runtime events from the event bus.

**Usage:**
```bash
vibekit events
```

### `vibekit check`

Prints environment diagnostics and dependency availability.

**Usage:**
```bash
vibekit check
```