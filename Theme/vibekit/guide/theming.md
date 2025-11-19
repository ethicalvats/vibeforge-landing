# Theming

Vibekit's theming system allows you to completely customize the look and feel of your application. A theme is a collection of templates, assets, and other files that define the presentation layer of your application.

## Theme Structure

A theme is a directory that contains the following files and directories:

*   **`index.md` or `index.html`:** The main entry point for your theme. This is the file that is rendered when a user visits the root of your application.
*   **`assets/`:** A directory for your theme's static assets, such as CSS, JavaScript, and images.
*   **`partials/`:** A directory for your theme's partial templates. Partials are reusable HTML templates that can be included in other templates. The following partials are automatically included if they exist:
    *   `header.html`
    *   `sidebar.html`
    *   `footer.html`
*   **`__things__/`:** A directory for templates that are used to render `Things`.
    *   `show.html`: Used to render a single `Thing`.
    *   `list.html`: Used to render a list of `Things`.
    *   `item.html`: Used to render a single item in a list of `Things`.
*   **`__private__/`:** A directory for templates that are used to render private `Things`.
    *   `show.html`: Used to render a single private `Thing`.

You can also create directories that correspond to the pluralized name of a `Thing` (e.g., `posts/`) to provide custom templates for that `Thing`.

## Templates

Templates can be written in Markdown or HTML and can contain a simple token syntax for including dynamic data.

### Example Template

Here is an example of a `show.html` template for displaying a single blog post. You would place this file in `Theme/posts/show.html`.

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{ post.title }}</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>

  <main>
    <article>
      <h1>{{ post.title }}</h1>
      <div class="post-body">
        {{ post.bodyHtml }}
      </div>
    </article>
  </main>

</body>
</html>
```

In this example:
- ` post.title ` is used for the page title and the main heading.
- ` post.bodyHtml ` will render the HTML content of the post's body.
- partial templates like `header` and `footer` would typically be included in a full theme. Vibekit's theme renderer automatically composes these if they exist in your `Theme/partials` directory.