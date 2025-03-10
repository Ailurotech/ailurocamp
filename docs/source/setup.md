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

## Deploying to Vercel

AiluroCamp is configured for deployment on Vercel, which offers excellent support for Next.js applications including API routes and server components.

### Deployment Steps

1. **Push your code to GitHub**

   - Ensure your repository is up to date on GitHub

2. **Connect to Vercel**

   - Go to [Vercel](https://vercel.com) and sign up or log in
   - Click "Add New..." and select "Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js settings

3. **Configure Project Settings**

   - Configure environment variables if needed
   - Leave build settings as default (Vercel auto-detects Next.js)
   - Click "Deploy"

4. **Access Your Deployed Site**
   - Once deployment is complete, Vercel provides a URL to access your site
   - You can configure a custom domain in the Vercel project settings

### Benefits of Vercel Deployment

- Full support for Next.js features including API routes and server components
- Automatic HTTPS
- Preview deployments for pull requests
- Easy rollbacks
- Performance monitoring and analytics
- Global CDN for fast content delivery

### Continuous Deployment

Vercel automatically deploys your site when changes are pushed to your main branch. To enable this:

1. Ensure your GitHub repository is connected to Vercel
2. Push changes to your main branch
3. Vercel will automatically build and deploy the changes
