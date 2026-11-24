# JavaHub Short Summary Videos — Production Guide

This guide explains how we turn every chapter in the **16-level, 116-topic JavaHub curriculum** into crisp, multi-part **9:16 vertical YouTube Shorts** (`1080×1920`, 30fps) using the 100% local, open-source video studio in the companion repository: [`java_hub_resources/video-studio`](https://github.com/ravishankar2463/java_hub_resources/tree/main/video-studio).

---

## 1. Architecture Overview

```text
java_hub/content/roadmap/level-<N>/<slug>.md     (Source of truth)
        │
        ▼  Author conversational 2–4 part storyboard JSON
java_hub_resources/video-studio/storyboards/level-<N>/<slug>.json
        │
        ▼  Kokoro-82M (local ONNX TTS) + Procedural SFX + Remotion (9:16)
java_hub_resources/videos/level-<N>/<slug>/part-*.mp4
java_hub_resources/videos/manifest.json
        │
        ▼  Auto-synced to website
java_hub/data/chapter-videos.json  ──>  Rendered on /roadmap/<level>/<slug>
```

---

## 2. What Needs to Be Done for Each Chapter

Follow this 5-step checklist for every chapter in [`VIDEO_PROGRESS.md`](./VIDEO_PROGRESS.md):

1. **Read the full chapter Markdown** in `content/roadmap/level-<N>/<slug>.md`.
2. **Split into 2–4 focused Shorts parts** (~60–90 seconds each) so every major detail is covered crisply without rushing:
   - *Part 1:* Core mental model & line-by-line code walkthrough
   - *Part 2:* Under-the-hood mechanics (JVM / architecture flow diagram / terminal / bytecode)
   - *Part 3:* Production pitfalls (`❌ BUG` vs `✅ SAFE`), modern Java 21–25 syntax, and hands-on lab CTA
3. **Author the storyboard JSON** at `../java_hub_resources/video-studio/storyboards/level-<N>/<slug>.json` using the 6 visual beat types:
   - `hook` — Kinetic slam headline with highlighted keyword & curiosity hook
   - `code-spotlight` — Dark IntelliJ-style IDE with multi-step active line spotlighting & live callout card
   - `flow-diagram` — Sequentially animated vertical architecture/JVM pipeline diagram
   - `terminal` — Simulated bash terminal with typed commands & bytecode/output reveals
   - `compare` — Stacked `❌ BUG / ✅ SAFE` or before/after comparison cards
   - `cta` — Recap checklist, `git checkout topic/<level>/<slug>` lab command, and next-part teaser
4. **Render locally** (generates Kokoro-82M voiceover, procedural SFX, `.mp4` files, updates `videos/manifest.json`, and syncs `java_hub/data/chapter-videos.json`):
   ```powershell
   cd ..\java_hub_resources\video-studio
   npm run generate -- --chapter level-<N>/<slug>
   ```
5. **Verify, update [`VIDEO_PROGRESS.md`](./VIDEO_PROGRESS.md), and push both repos**:
   - Check off the chapter in `VIDEO_PROGRESS.md` with its part count and links.
   - Commit & push `java_hub_resources` (storyboards + MP4s + `videos/manifest.json`).
   - Commit & push `java_hub` (`data/chapter-videos.json` + `VIDEO_PROGRESS.md`).

---

## 3. Quality Bar ("Less AI, More Human")

- **Write for the ear, not the page:** Use contractions (*it's*, *don't*, *here's*), direct "you", and punchy sentences. Never copy-paste dry textbook paragraphs.
- **No static slides:** Every beat should spotlight lines, light up diagram nodes, type terminal commands, or contrast `❌ DON'T` vs `✅ DO`.
- **Natural voice pacing:** Default voice is Kokoro-82M `am_michael` at `1.1x` speed. You can override with `--voice am_adam` (or `bf_emma`, `af_heart`) or drop in your own recorded audio at:
  ```text
  video-studio/public/audio/<level>__<slug>__part-<N>/<beat-id>.human.wav
  ```
- **Respect YouTube Shorts safe zones:** All templates keep primary visuals clear of the bottom title overlay and right-side like/comment/share buttons.

---

## 4. Useful Commands

```powershell
cd ..\java_hub_resources\video-studio

# List all 116 chapters and see which have storyboards
npm run list

# Render all parts of a chapter
npm run generate -- --chapter level-0/anatomy-of-a-java-program

# Render only Part 1
npm run generate -- --chapter level-0/anatomy-of-a-java-program --part 1

# Open interactive Remotion preview in browser
npm run studio
```
