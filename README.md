# @void-n-null/phonetik-js

JavaScript/TypeScript bindings for [phonetik](https://crates.io/crates/phonetik), a phonetic analysis engine for English. Rhyme detection, scansion, syllable counting, and phonetic comparison backed by a 126K-word embedded dictionary compiled to WebAssembly.

Works in browsers, Node.js, Bun, Deno, and bundlers (Vite, Webpack, etc).

## Install

```
npm install @void-n-null/phonetik-js
```

## Usage

The WASM module must be initialized before use. This is async in browsers and can be sync in Node.js.

### Browser / Bundler

```javascript
import init, { Engine } from "@void-n-null/phonetik-js";

await init();
const p = new Engine();

p.perfectRhymes("cat");  // [{ word: 'BAT', rhymeType: 'perfect', ... }, ...]
```

### Node.js / Bun

```javascript
import { initSync, Engine } from "@void-n-null/phonetik-js";
import { readFileSync } from "fs";

const wasm = readFileSync("node_modules/@void-n-null/phonetik-js/phonetik_js_bg.wasm");
initSync({ module: wasm });
const p = new Engine();

p.perfectRhymes("cat");
```

## API

```javascript
// Lookup
p.lookup("hello");
// { word: 'HELLO', phonemes: ['HH', 'AH0', 'L', 'OW1'], syllableCount: 2, ... }

// Rhymes
p.perfectRhymes("cat");
p.slantRhymes("love", 10);
p.nearRhymes("night", 10);
p.rhymes("cat", 50);  // all types, merged

// Scansion
const scan = p.scan("shall I compare thee to a summer's day");
scan.meter.name;       // 'iambic pentameter'
scan.syllableCount;    // 10

// Compare
p.compare("cat", "bat");
// { similarity: 0.6667, rhymeType: 'perfect', confidence: 1.0, ... }

// Utilities
p.syllableCount("beautiful");  // 3
p.contains("hello");           // true
p.wordCount();                 // 126052
```

## Notes

- The WASM binary is ~3.8MB (dictionary compiled in). Loaded once at initialization.
- All methods are synchronous after init.
- TypeScript definitions included.

## License

MIT
