# HD Translator

## Browser targets

The root `manifest.json` is the Chrome MV3 build and opens the UI in Chrome Side Panel.

Build browser-specific unpacked folders:

```sh
node scripts/build-extension.js chrome
node scripts/build-extension.js firefox
```

Load `dist/chrome` in Chrome or `dist/firefox` in Firefox.
