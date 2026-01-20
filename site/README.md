# GSD Website

This folder contains the source for the GitHub Pages site.

## Local Development

From the repo root:

- `npm install`
- `npm run site:dev`

Eleventy serves the site and watches for changes.

## Build

- `npm run site:build`

## GitHub Pages

A workflow under `.github/workflows/pages.yml` builds `site/dist` and deploys it to GitHub Pages.

To make the deployed URLs work under the repository sub-path (`/<repo>/`), the workflow sets `PATH_PREFIX`.
