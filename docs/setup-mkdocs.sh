#!/bin/bash

# Setup script for AiluroCamp documentation website using MkDocs with Material theme

echo "Setting up AiluroCamp documentation website with MkDocs..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is required but not installed. Please install pip3 and try again."
    exit 1
fi

# Install MkDocs and required packages
echo "Installing MkDocs and required packages..."
pip3 install mkdocs mkdocs-material pymdown-extensions mkdocs-minify-plugin

# Create assets directory
mkdir -p docs/assets

# Create a simple logo
echo "Creating logo and favicon..."
cat > docs/assets/logo.svg << 'EOL'
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3f51b5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
  <path d="M2 2l7.586 7.586"></path>
  <circle cx="11" cy="11" r="2"></circle>
</svg>
EOL

# Copy logo as favicon
cp docs/assets/logo.svg docs/assets/favicon.png

# Ensure all documentation files are in the correct location
echo "Checking documentation files..."
for file in SETUP.md USER_GUIDE.md API.md ARCHITECTURE.md; do
    if [ -f "docs/$file" ]; then
        # Convert to lowercase and replace underscores with hyphens
        new_name=$(echo "$file" | tr '[:upper:]' '[:lower:]' | tr '_' '-')
        echo "Moving docs/$file to docs/$new_name"
        mv "docs/$file" "docs/$new_name"
    else
        echo "Warning: docs/$file not found. Please ensure it exists."
    fi
done

# Create a .gitignore file for MkDocs
echo "Creating .gitignore for MkDocs..."
cat > docs/.gitignore << 'EOL'
site/
.DS_Store
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg
EOL

echo "Setup complete!"
echo "You can now build and serve the documentation with:"
echo "cd docs && mkdocs serve"

# Ask if user wants to start the documentation server
read -p "Do you want to start the documentation server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd docs && mkdocs serve
fi 