# El Pollo Loco

A browser-based 2D side-scroller built with vanilla JavaScript and HTML5 Canvas. You control Pepe through a desert level, collect coins and bottles, fight enemy chickens, and defeat the end boss.

## Highlights

- **Pure front-end stack**: no framework, no bundler, no build step.
- **Canvas game loop** with modular world subsystems (`render`, `collisions`, `audio`).
- **Responsive controls** for desktop keyboard and touch devices.
- **Landscape-first mobile UX** with orientation guard and on-screen controls.
- **Core game systems**: collectibles, throwable bottles, HUD status bars, pause/resume, win/lose overlays, and restart/menu flow.

## Controls

### Desktop
- `←` / `→`: Move
- `↑`: Jump
- `Space`: Throw bottle
- `Esc` or `P`: Pause / Resume
- `Enter`: Start game

### Mobile
- On-screen buttons for move, jump, and throw.
- Game is intended for **landscape orientation**.

## Quick Start

Because assets are loaded via browser requests, run the project through a local HTTP server (not via `file://`).

```bash
# from repository root
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/index.html`

## Project Structure

```text
.
├── index.html                # App shell, UI overlays, script wiring
├── js/
│   ├── assets.js             # Static asset path configuration
│   └── game/                 # App bootstrap + input/audio/pause/UI modules
├── models/                   # Game objects, entities, world logic
│   └── world/                # World subsystem classes (render/audio/collisions)
├── levels/
│   └── level1.js             # Level layout and entity spawn setup
├── style/                    # Split CSS by concern (layout, overlays, mobile, ...)
├── assets/                   # Sprites, audio, favicon, and art resources
├── manifest.json             # PWA metadata (fullscreen, landscape)
└── impressum.html            # Legal notice page
```

## Gameplay Notes

- Coins and bottles are tracked in HUD bars.
- Bottles are consumed when thrown.
- End boss health appears when the boss phase is triggered.
- Defeating the boss triggers the win sequence; player death triggers game over.

## Browser Compatibility

Designed for modern browsers with support for:

- HTML5 Canvas
- `requestAnimationFrame`
- `localStorage`
- Fullscreen API
- Touch events (mobile controls)

## License

No license file is currently included in this repository. If you intend to publish or reuse the code/assets, add an explicit license.
