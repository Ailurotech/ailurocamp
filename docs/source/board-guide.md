# Kanban Board User Guide

The AiluroCamp Kanban board provides an interface to view and manage your GitHub Projects directly from the application. This guide explains how to use the board effectively.

## Overview

The Kanban board integrates with GitHub Projects to display your project columns and issues as cards. This allows you to visualize your workflow and track progress on issues without leaving the application.

![Kanban Board Screenshot](../assets/board-screenshot.png)

## Features

### Project Selection

- Select different GitHub Projects from the dropdown menu in the top-right corner
- If you don't have any projects, you can create a new one using the "Create Project" button

### Viewing Issues

The board displays all columns from your GitHub Project, with each card representing an issue:

- **Card Title**: The issue title
- **Card Content**: A preview of the issue description
- **Issue Number**: The GitHub issue number (e.g., #123)
- **Creation Date**: When the issue was created
- **Link Icon**: Indicates that clicking the card will open the issue in GitHub

### Creating New Issues

1. Click the "New Issue" button in the top-right corner
2. Enter the issue title, description, and optional labels
3. Click "Create" to add the issue to your project

### Creating New Projects

If you don't have any projects:

1. Click the "Create Project" button
2. Enter a project name and description
3. Click "Create" to set up a new GitHub Project

## Column Structure

By default, a new GitHub Project contains the following columns:

- **To Do**: Tasks that are planned but not yet started
- **In Progress**: Tasks that are currently being worked on
- **Done**: Completed tasks

You can customize these columns directly in GitHub, and the changes will be reflected in the AiluroCamp board.

## Best Practices

- Create descriptive issue titles that clearly communicate the task
- Add sufficient details in the issue description
- Use labels to categorize issues (e.g., "bug", "enhancement", "documentation")
- Regularly update your board to reflect current progress

## Troubleshooting

If your board doesn't load:

1. Check that you're logged in with GitHub authentication
2. Verify that your GitHub token has the correct permissions
3. Ensure that GitHub Projects are enabled for your repository

## Related Documentation

- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
- [API Documentation](api.md)
- [Setup Guide](setup.md)
