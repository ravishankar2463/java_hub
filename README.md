# JavaHub

JavaHub is a Java learning platform built around a 16-level, 116-topic developer roadmap. It covers Core Java and JVM internals through Spring Boot, security, distributed systems, and production architecture, with in-depth articles and companion code labs.

The site is built with Next.js and exported as a static site for GitHub Pages. The roadmap can also be saved for offline reading.

## Getting started

Requirements: Node.js and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) during development.

## Project structure

- `app/` — Next.js routes and page metadata
- `components/` — shared interface components
- `content/articles/<category>/` — standalone Java and Spring articles
- `content/roadmap/level-<number>/` — roadmap topic lessons
- `data/roadmap.ts` — roadmap levels, topic titles, and outlines
- `lib/`, `hooks/`, and `utils/` — shared application logic

## Contributing

Contributions to both learning content and application features are welcome. For substantial changes, open an issue first to discuss the scope.

1. Fork the repository and create a branch from its default branch.
2. Install dependencies with `npm ci`.
3. Make your changes and run the relevant checks:

   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. Open a pull request with a clear summary, motivation, and test results. Include screenshots for visual changes.

### Contributing content

- **Existing roadmap topic:** edit the matching Markdown file in `content/roadmap/level-<number>/`.
- **New roadmap topic:** add its title and outline to the appropriate level in `data/roadmap.ts`, then add a Markdown lesson whose filename matches the topic's generated slug.
- **Article:** add a Markdown file under `content/articles/<category>/`.
- Use the existing files as examples. Content should include `title`, a concise and accurate `description`, `category`, and an ISO-formatted `date` in its YAML frontmatter.
- Write original, technically accurate explanations. Use fenced code blocks with language labels, and include links to authoritative references when useful.

### Contributing features

- Add routes in `app/`, shared UI in `components/`, and reusable logic in `lib/`, `hooks/`, or `utils/`, following nearby project patterns.
- Keep pages responsive and accessible, and preserve the static-export, GitHub Pages base-path, and offline-roadmap behavior.
- Add or update tests for behavior changes. Run `npm test`, `npm run lint`, and `npm run build` before submitting.

By submitting a contribution, you confirm that you have the right to contribute it and agree that it will be distributed under this repository's MIT License.

## License

This project is licensed under the [MIT License](./LICENSE).
