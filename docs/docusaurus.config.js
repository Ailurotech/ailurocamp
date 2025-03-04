// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'AiluroCamp Documentation',
  tagline: 'Documentation for the AiluroCamp Learning Management System',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://ailurotech.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/ailurocamp/',

  // GitHub pages deployment config.
  organizationName: 'Ailurotech', // Usually your GitHub org/user name.
  projectName: 'ailurocamp', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/Ailurotech/ailurocamp/tree/main/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/ailurocamp-social-card.jpg',
      navbar: {
        title: 'AiluroCamp Docs',
        logo: {
          alt: 'AiluroCamp Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/Ailurotech/ailurocamp',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Setup Guide',
                to: '/docs/setup',
              },
              {
                label: 'API Documentation',
                to: '/docs/api',
              },
              {
                label: 'User Guide',
                to: '/docs/user-guide',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/Ailurotech/ailurocamp/discussions',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} AiluroCamp. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer/themes/github'),
        darkTheme: require('prism-react-renderer/themes/dracula'),
      },
    }),
};

module.exports = config;
