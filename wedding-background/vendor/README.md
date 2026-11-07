# Local browser dependencies

These scripts are bundled locally so video export works without a CDN or backend.

| File                             | Package                                                | Version | License                     |
| -------------------------------- | ------------------------------------------------------ | ------- | --------------------------- |
| [mp4-muxer.js](./mp4-muxer.js)   | [mp4-muxer](https://www.npmjs.com/package/mp4-muxer)   | 5.2.2   | [MIT](./mp4-muxer.LICENSE)  |
| [webm-muxer.js](./webm-muxer.js) | [webm-muxer](https://www.npmjs.com/package/webm-muxer) | 5.1.4   | [MIT](./webm-muxer.LICENSE) |

Copied from each published npm package's `build/*.js` browser bundle. No runtime package install is required.

## Local WebM duration patch

In `writeBlock_fn`, WebM segment duration includes the final video frame's duration when a constant `video.frameRate` is supplied. Upstream 5.1.4 writes the last frame's start timestamp as total duration. This project exports constant 30 fps, so the patched end timestamp is `(round(timestamp × frameRate / 1,000,000) + 1) × 1000 / frameRate` in milliseconds. This keeps a 30-frame clip exactly one second. Encoded blocks and their timestamps remain unchanged. The patch is marked `Local CFR fix` in the vendored bundle.
