#!/bin/bash

# Script to clean up npm-related files from the gh-pages branch
git checkout gh-pages

# Remove npm-related files and directories
rm -rf node_modules
rm -rf .next
rm -f package.json package-lock.json
rm -f .env.local

# Commit changes
git add -A
git commit -m "Remove npm-related files from gh-pages branch"

# Push changes
git push origin gh-pages

# Return to main branch
git checkout main

echo "Cleanup complete!"
