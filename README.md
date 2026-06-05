# Portfolio CMS & Developer Showcase Platform

A premium, production-grade Developer Portfolio and Git-based Content Management System (CMS) built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, and NextAuth.js.

Designed to be hosted directly on **GitHub Pages** (Option A: Static Export + Client PAT) or as a dynamic server on **Render** (Option B: Server SSR + OAuth).

## Features

- **Dynamic Public Dashboard**: Showcases projects, developers directory, visual timelines, and technology matrix counts.
- **Protected Admin Panel**: Accessible via secure login. Add/edit/delete projects, configure developer records, manage screenshots, and write global configurations.
- **Git-based Persistence**: Zero databases! Stores all configurations inside `data/site-config.json`, `data/projects.json`, and `data/developers.json`. Changes are committed directly to your repository using the GitHub REST API.
- **Command Palette**: Press `Ctrl + K` or `Cmd + K` to search projects, toggle dark/light theme, and quickly jump to sections.
- **PWA Ready**: Offline fallback capabilities, manifest, and background service workers.
- **Analytics Ready**: Abstraction layer for Plausible, Google Analytics, and Umami.

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Languages**: TypeScript, HTML, CSS (Tailwind CSS v4)
- **State & Forms**: React Hook Form, Zod Validators
- **Animations**: Framer Motion
- **Git SDK**: Octokit REST
- **Auth**: NextAuth.js (GitHub OAuth Provider)

## Getting Started

See [Deployment_Guide.md](./Deployment_Guide.md) for detailed instructions on local development, repository settings, OAuth configurations, and deployment strategies.
