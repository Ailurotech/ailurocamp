# Setup Guide

This guide provides instructions for setting up the AiluroCamp Learning Management System.

## Prerequisites

- Node.js 18 or later
- npm or yarn
- Git
- MongoDB (for development)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ailurotech/ailurocamp.git
cd ailurocamp
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Deployment

For deployment instructions, please refer to the [GitHub Pages deployment guide](https://nextjs.org/docs/deployment#github-pages).
