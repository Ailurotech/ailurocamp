#!/bin/bash

# Setup script for AiluroCamp documentation website

echo "Setting up AiluroCamp documentation website..."

# Create a temporary directory for Docusaurus setup
mkdir -p temp-docusaurus
cd temp-docusaurus

# Initialize a new Docusaurus site
echo "Initializing Docusaurus..."
npx @docusaurus/init@latest init docusaurus-site classic

# Create necessary directories in the docs folder
cd ..
mkdir -p docs
mkdir -p static/img
mkdir -p src/css

# Copy configuration files from the temporary site
cp temp-docusaurus/docusaurus-site/docusaurus.config.js .
cp temp-docusaurus/docusaurus-site/sidebars.js .
cp temp-docusaurus/docusaurus-site/babel.config.js .
cp temp-docusaurus/docusaurus-site/package.json .

# Update the docusaurus.config.js file
sed -i '' 's/My Site/AiluroCamp Documentation/g' docusaurus.config.js
sed -i '' 's/Dinosaurs/AiluroCamp/g' docusaurus.config.js
sed -i '' 's/my-site/ailurocamp/g' docusaurus.config.js
sed -i '' 's/my-website/ailurocamp/g' docusaurus.config.js

# Create a simple logo
echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>' > static/img/logo.svg

# Copy favicon
cp static/img/logo.svg static/img/favicon.ico

# Create custom CSS
echo ':root {
  --ifm-color-primary: #3578e5;
  --ifm-color-primary-dark: #1d68e1;
  --ifm-color-primary-darker: #1b62d4;
  --ifm-color-primary-darkest: #1751af;
  --ifm-color-primary-light: #4e89e8;
  --ifm-color-primary-lighter: #5a91ea;
  --ifm-color-primary-lightest: #80aaef;
}' > src/css/custom.css

# Prepare documentation files
mkdir -p docs
cp ../SETUP.md docs/setup.md
cp ../USER_GUIDE.md docs/user-guide.md
cp ../API.md docs/api.md
cp ../ARCHITECTURE.md docs/architecture.md

# Create index.md
echo '---
slug: /
sidebar_position: 1
---

# AiluroCamp Documentation

Welcome to the AiluroCamp Learning Management System documentation.

## Available Documentation

- [Setup Guide](setup.md) - How to set up and deploy AiluroCamp
- [User Guide](user-guide.md) - Instructions for students, instructors, and administrators
- [API Documentation](api.md) - Details about the available API endpoints
- [Architecture](architecture.md) - Technical architecture and design
' > docs/index.md

# Install dependencies
echo "Installing dependencies..."
npm install

# Clean up temporary directory
rm -rf temp-docusaurus

echo "Setup complete! You can now run the documentation site with:"
echo "npm start"

# Ask if user wants to start the documentation server
read -p "Do you want to start the documentation server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    npm start
fi 