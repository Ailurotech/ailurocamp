# AiluroCamp Documentation

This folder contains comprehensive documentation for the AiluroCamp Learning Management System.

## Documentation Files

- **api.md**: API endpoints documentation
- **architecture.md**: System architecture and design
- **setup.md**: Setup and installation guide
- **user-guide.md**: User guide for students, instructors, and administrators

## Using MkDocs for Documentation

We use [MkDocs](https://www.mkdocs.org/) with the [Material theme](https://squidfunk.github.io/mkdocs-material/) to convert these Markdown files into a beautiful documentation website.

### Quick Setup

Run the setup script to install and configure MkDocs:

```bash
# Make the script executable
chmod +x setup-mkdocs.sh

# Run the setup script
./setup-mkdocs.sh
```

### Manual Setup

If you prefer to set up MkDocs manually:

1. **Install MkDocs and the Material theme**:

   ```bash
   pip install mkdocs mkdocs-material pymdown-extensions mkdocs-minify-plugin
   ```

2. **Serve the documentation locally**:

   ```bash
   cd docs
   mkdocs serve
   ```

3. **Build the documentation**:

   ```bash
   cd docs
   mkdocs build
   ```

### Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch. This is handled by the GitHub Actions workflow in `.github/workflows/mkdocs.yml`.

You can also manually deploy the documentation:

```bash
cd docs
mkdocs gh-deploy
```

## Writing Documentation

When adding or updating documentation:

1. Create or edit Markdown files in the `docs` directory
2. Use standard Markdown syntax
3. Preview changes locally with `mkdocs serve`
4. Commit and push your changes

### Markdown Features

MkDocs with Material theme supports many advanced Markdown features:

#### Code Blocks with Syntax Highlighting

```python
def hello_world():
    print("Hello, AiluroCamp!")
```

#### Admonitions

!!! note "Note"
This is a note admonition.

!!! tip "Tip"
This is a tip admonition.

!!! warning "Warning"
This is a warning admonition.

#### Tabbed Content

=== "Tab 1"
Content of tab 1

=== "Tab 2"
Content of tab 2

#### And More

See the [Material for MkDocs documentation](https://squidfunk.github.io/mkdocs-material/reference/) for more features.
