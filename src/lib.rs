use phonetik::{Phonetik, StressMode};
use serde::Serialize;
use wasm_bindgen::prelude::*;

/// Phonetic analysis engine backed by a 126K-word embedded dictionary.
///
/// Constructed once; all methods are synchronous and available immediately.
#[wasm_bindgen]
pub struct Engine {
    inner: Phonetik,
}

// Helper: serialize any Serialize type to a JsValue via serde-wasm-bindgen.
fn to_js<T: Serialize>(val: &T) -> JsValue {
    serde_wasm_bindgen::to_value(val).unwrap_or(JsValue::NULL)
}

#[wasm_bindgen]
impl Engine {
    /// Create a new engine. The dictionary is compiled into the WASM binary.
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: Phonetik::new(),
        }
    }

    /// Look up a word's phonetic information.
    /// Returns an object or `undefined` if the word is unknown.
    pub fn lookup(&self, word: &str) -> JsValue {
        match self.inner.lookup(word) {
            Some(info) => to_js(&info),
            None => JsValue::UNDEFINED,
        }
    }

    /// Count syllables in a word. Estimates for unknown words.
    #[wasm_bindgen(js_name = "syllableCount")]
    pub fn syllable_count(&self, word: &str) -> usize {
        self.inner.syllable_count(word)
    }

    /// Count syllables for each word in each line.
    #[wasm_bindgen(js_name = "syllableCounts")]
    pub fn syllable_counts(&self, lines: Vec<String>) -> JsValue {
        let refs: Vec<&str> = lines.iter().map(|s| s.as_str()).collect();
        to_js(&self.inner.syllable_counts(&refs))
    }

    /// Check if a word is in the dictionary.
    pub fn contains(&self, word: &str) -> bool {
        self.inner.contains(word)
    }

    /// Number of words in the dictionary.
    #[wasm_bindgen(js_name = "wordCount")]
    pub fn word_count(&self) -> usize {
        self.inner.word_count()
    }

    /// Find all rhymes for a word, merged across types.
    pub fn rhymes(&self, word: &str, limit: usize) -> JsValue {
        to_js(&self.inner.rhymes(word, limit))
    }

    /// Find perfect rhymes only.
    #[wasm_bindgen(js_name = "perfectRhymes")]
    pub fn perfect_rhymes(&self, word: &str) -> JsValue {
        to_js(&self.inner.perfect_rhymes(word))
    }

    /// Find slant rhymes only.
    #[wasm_bindgen(js_name = "slantRhymes")]
    pub fn slant_rhymes(&self, word: &str, limit: usize) -> JsValue {
        to_js(&self.inner.slant_rhymes(word, limit))
    }

    /// Find near rhymes only.
    #[wasm_bindgen(js_name = "nearRhymes")]
    pub fn near_rhymes(&self, word: &str, limit: usize) -> JsValue {
        to_js(&self.inner.near_rhymes(word, limit))
    }

    /// Perform scansion on a line of text.
    /// Uses natural speech stress by default (function words demoted).
    /// Pass mode = "dictionary" for raw CMUdict stress.
    pub fn scan(&self, line: &str, mode: Option<String>) -> JsValue {
        let stress_mode = match mode.as_deref() {
            Some("dictionary") => StressMode::Dictionary,
            _ => StressMode::Spoken,
        };
        to_js(&self.inner.scan_with_mode(line, stress_mode))
    }

    /// Compare two words phonetically.
    /// Returns an object or `undefined` if either word is unknown.
    pub fn compare(&self, word1: &str, word2: &str) -> JsValue {
        match self.inner.compare(word1, word2) {
            Some(cmp) => to_js(&cmp),
            None => JsValue::UNDEFINED,
        }
    }

    /// Detect phoneme repetition patterns across lines of verse.
    #[wasm_bindgen(js_name = "rhymeMap")]
    pub fn rhyme_map(&self, lines: Vec<String>) -> JsValue {
        let refs: Vec<&str> = lines.iter().map(|s| s.as_str()).collect();
        to_js(&self.inner.rhyme_map(&refs))
    }
}
