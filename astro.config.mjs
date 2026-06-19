// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import expressiveCode from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax/svg';

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const customSite = process.env.SITE_URL;
const customBase = process.env.SITE_BASE;
const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER;
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isProjectPage =
  Boolean(repositoryOwner) &&
  Boolean(repositoryName) &&
  repositoryName !== `${repositoryOwner}.github.io`;

const githubPagesSite =
  repositoryOwner && repositoryName
    ? `https://${repositoryOwner}.github.io${isProjectPage ? `/${repositoryName}` : ''}`
    : undefined;

const resolvedSite =
  customSite || (isGitHubActions && githubPagesSite ? githubPagesSite : 'https://example.com');

const resolvedBase =
  customBase || (isGitHubActions && isProjectPage && repositoryName ? `/${repositoryName}` : '/');

// https://astro.build/config
export default defineConfig({
  site: resolvedSite,
  base: resolvedBase,
  integrations: [expressiveCode(), mdx(), sitemap()],

  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeMathjax],
  },

  redirects: {
    '/learningaboutdotnet/': '/blog/learningaboutdotnet/',
    '/dyeing-linen/': '/blog/dyeing-linen/',
    '/learningaboutrl/': '/blog/learningaboutrl/',
    '/starting-ec2-with-jupyter-hub/': '/blog/starting-ec2-with-jupyter-hub/',
    '/using_githubactions_with_ecr_and_ec2/': '/blog/using_githubactions_with_ecr_and_ec2/',
    '/computer_organization_and_instruction_set_architecture/': '/blog/computer_organization_and_instruction_set_architecture/',
    '/computer_instruction_set_architecture/': '/blog/computer_instruction_set_architecture/',
    '/slicker_python/': '/blog/slicker_python/',
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
