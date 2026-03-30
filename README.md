# Matteflow

Matteflow is a browser demo for editorial video layout: load a local video, isolate the foreground silhouette, and let article text flow around the moving subject like a magazine spread.

It is a small standalone prototype built on top of [`@chenglou/pretext`](https://github.com/chenglou/pretext) for manual line layout, plus a lightweight matte pass for silhouette extraction. The result is not traditional rectangular text wrap. The text bends around a subject-shaped exclusion zone derived from the video frame itself.

[![Matteflow demo preview](./resource/demo-preview.gif)](./resource/demo.mp4)

Click the preview above to open the full demo video.

## Inspiration

Matteflow is a recreation experiment inspired by this post:

- [EsotericCofe on X](https://x.com/EsotericCofe/status/2038076140661932273)

## What It Does

- Loads a local video file directly in the browser
- Estimates the background color from frame edges
- Builds a soft foreground alpha mask from color distance
- Derives a wrap profile from the detected subject silhouette
- Lays out article text line by line around the moving center subject
- Renders everything in an editorial paper-style composition

## Demo

After starting the local server, open:

`http://localhost:4173`

Then:

1. Choose a local video file.
2. Press `Play`.
3. Adjust the sliders to tune framing, wrap distance, follow, and matte behavior.

Plain or clean backgrounds work best because the foreground mask is estimated from color contrast, not from a full segmentation model.

For a quick first run, this repo includes local sample videos at [`resource/demo.mp4`](./resource/demo.mp4) and [`resource/dance.mp4`](./resource/dance.mp4).

## Quick Start

### Requirements

- `node` 18+ recommended

### Dependencies

- No local npm dependencies are required to run this repo
- Runtime text layout is powered by [`@chenglou/pretext`](https://github.com/chenglou/pretext)
- In the browser, `pretext` is loaded dynamically from `https://esm.sh/@chenglou/pretext`

### Run Locally

```bash
npm start
```

This starts a small local Node-based static server on port `4173`.

### Run Tests

```bash
npm test
```

## Sample Asset

- Inline README preview: [`resource/demo-preview.gif`](./resource/demo-preview.gif)
- Included demo video: [`resource/demo.mp4`](./resource/demo.mp4)
- Included sample clip: [`resource/dance.mp4`](./resource/dance.mp4)
- Source video for `dance.mp4`: [YouTube](https://www.youtube.com/watch?v=M9IcZFo6CBM)

The bundled `demo-preview.gif` is the inline preview shown in the README. The bundled `demo.mp4` is the full showcase video for quick local playback checks. The bundled `dance.mp4` is the sample clip used for local testing and README walkthroughs.

## Controls

- `Choose video`: load a local video file
- `Play`: start or pause playback
- `Scale`: resize the floating video stage
- `Horizontal` / `Vertical`: reposition the subject in the page
- `Wrap distance`: increase or reduce spacing between text and subject
- `Wrap follow`: control how strongly the wrap profile follows subject drift
- `Wrap strength`: widen or tighten the silhouette exclusion envelope
- `Cut threshold`: raise or lower matte sensitivity
- `Soft edge`: feather the matte edge
- `Volume`: control playback volume

## How It Works

Matteflow is built from a few small modules:

- [`src/matte.js`](./src/matte.js): estimates background color, creates a foreground alpha mask, derives subject bounds, and extracts a wrap profile from the frame
- [`src/layout.js`](./src/layout.js): computes wrap regions, loads `@chenglou/pretext` in the browser, and places lines into a single flowing text stream around the silhouette
- [`src/profile.js`](./src/profile.js): provides profile sampling and fallback shape behavior
- [`src/demo.js`](./src/demo.js): wires the UI, render loop, matte processing, and page composition together

The text is positioned line by line rather than relying on DOM text-wrap. `pretext` provides the paragraph preparation and per-line layout primitives, and Matteflow uses those primitives to route each line around the moving subject silhouette.

## Project Structure

```text
.
├── index.html
├── resource/
│   ├── demo-preview.gif
│   ├── demo.mp4
│   └── dance.mp4
├── src/
│   ├── demo.js
│   ├── layout.js
│   ├── main.js
│   ├── matte.js
│   ├── profile.js
│   ├── sampleText.js
│   └── styles.css
├── test/
└── package.json
```

## Notes

- This is a demo, not a production export pipeline.
- It works best with a single foreground subject against a fairly uniform background.
- No upload is required; video files stay local to the browser session.

## Acknowledgements

- Core text layout is powered by [`@chenglou/pretext`](https://github.com/chenglou/pretext)
- The project explores a silhouette-wrapping editorial layout on top of Pretext's manual line-layout APIs

## Roadmap Ideas

- Better contour extraction for difficult backgrounds
- Export stills or short rendered sequences
- Manual mask overrides
- Editable article text and layout presets

## License

The code in this repository is licensed under the [MIT License](./LICENSE).

The sample assets [`resource/demo-preview.gif`](./resource/demo-preview.gif), [`resource/demo.mp4`](./resource/demo.mp4), and [`resource/dance.mp4`](./resource/dance.mp4) are provided as demo asset references and are not covered by the MIT license for the codebase.
