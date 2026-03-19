# @void-n-null/phonetik-js

JavaScript/TypeScript bindings for [phonetik](https://crates.io/crates/phonetik), a phonetic analysis engine for English. Rhyme detection, scansion, syllable counting, and phonetic comparison backed by a 126K-word embedded dictionary compiled to WebAssembly.

## Install

```
npm install @void-n-null/phonetik-js
```

## Usage

```javascript
const { Engine } = require("@void-n-null/phonetik-js");

const p = new Engine();

// Lookup
const info = p.lookup("hello");
// { word: 'HELLO', phonemes: ['HH', 'AH0', 'L', 'OW1'], syllableCount: 2, ... }

// Rhymes
p.perfectRhymes("cat");  // [{ word: 'BAT', rhymeType: 'perfect', ... }, ...]
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

- The WASM binary is ~3.8MB (dictionary compiled in). Loaded once at construction.
- All methods are synchronous.
- Full TypeScript definitions included.

## License

MIT
