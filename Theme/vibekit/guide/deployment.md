# Deployment

Once you have developed your Vibekit application, you have several options for deploying it to production. The core concept of a Vibekit deployment is a "snapshot," which is a self-contained bundle of your application's code and assets.

## Method 1: Deploying to a Server with SSH

For traditional server deployments, you can use the `deploy push` command to send your application bundle to a remote server via SSH.

### Prerequisites

*   SSH access to your remote server.
*   The `vibekit` executable must be installed on the remote server.

### Steps

1.  **Export and Push:** From your local project directory, run the `deploy push` command, specifying your remote server and the destination path.

    ```bash
    vibekit deploy push \
      --remote user@your-server.com \
      --path /var/www/my-awesome-blog \
      --restart "sudo systemctl restart my-blog-service"
    ```

    This command performs the following actions:
    *   Creates a snapshot bundle of your application.
    *   Archives the bundle into a `.tar.gz` file.
    *   Uploads the archive to the remote server.
    *   Extracts the archive into a new release directory.
    *   Updates a `current` symlink to point to the new release.
    *   (Optional) Runs a restart command to start the new version of your application.

2.  **Run in Production:** On your server, you should have a service manager (like `systemd`) configured to run the `vibekit serve` command from the `current` directory.

    Example `systemd` service file (`/etc/systemd/system/my-blog-service.service`):

    ```ini
    [Unit]
    Description=My Awesome Blog

    [Service]
    User=www-data
    Group=www-data
    WorkingDirectory=/var/www/my-awesome-blog/current
    ExecStart=/usr/local/bin/vibekit serve --host 0.0.0.0
    Restart=always

    [Install]
    WantedBy=multi-user.target
    ```

## Method 2: Deploying to Google Cloud Run

For serverless deployments, Vibekit provides first-class support for Google Cloud Run.

### Prerequisites

*   `gcloud` CLI installed and configured.
*   `docker` installed and running.
*   Billing enabled on your Google Cloud project.

### Steps

1.  **Deploy from the CLI:** From your local project directory, run the `deploy cloud-run` command with your Google Cloud project details.

    ```bash
    vibekit deploy cloud-run \
      --project "my-gcp-project-id" \
      --region "us-central1" \
      --service "my-awesome-blog" \
      --allow-unauthenticated
    ```

    This command automates the entire deployment pipeline:
    *   Creates a snapshot bundle of your application.
    *   Builds a production-ready Docker container image.
    *   Pushes the container image to Google Container Registry (GCR).
    *   Deploys the new container image to Google Cloud Run.

Your application will be available at the URL provided by Cloud Run at the end of the deployment process.
