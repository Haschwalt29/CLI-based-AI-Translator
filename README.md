# Tranzio

> **An AI-powered CLI translator that converts text into your target language using Gemini for accurate, configurable translations.**
---

## Overview

**Tranzio** is a fast, minimal **command‑line translator**. You provide any text (via flag, file, or STDIN) and a **target language**; Tranzio calls the **Gemini API** to produce accurate translations while preserving formatting, code blocks, and domain terminology.

Tranzio is designed around three goals:

* **Correctness** → faithful, context‑aware translation
* **Efficiency** → snappy CLI UX with caching & batching
* **Scalability** → optional server mode + queue to handle many requests

> ✅ Works great for: quick translations, docs localization, logs/tools automation, batch CSV translation, and CI/CD pipelines.

---

## Key Features

* 🧠 **Gemini‑powered** translations with tunable parameters (temperature, style, formality).
* 🧩 **Multiple input modes**: flag (`--text`), file (`--file`), or piped STDIN.
* 🗂️ **Batch mode**: translate a CSV column at once.
* 💾 **Deterministic caching** (content‑addressed) to avoid re‑paying for identical requests.
* 📐 **Format preservation**: keeps Markdown/code blocks and placeholders `{like_this}` intact.
* 🧪 **Quality checks**: back‑translation & glossary support.
* 📦 **Server mode (optional)**: expose HTTP API for parallel requests.
* 🔍 **Verbose/debug mode**: trace prompts, tokens, latency.

---

## Architecture

```
+-------------------------+
|       CLI (Typer)       |  <-- args parsing, UX, help, subcommands
+-----------+-------------+
            |
            v
+-------------------------+      +------------------------+
|  Translator Service     |<---->|  Cache (SQLite / FS)   |
|  - segmentation         |      |  - sha256(text+opts)   |
|  - batching             |      +------------------------+
|  - prompt builder       |
|  - glossary enforcement |
+-----------+-------------+
            |
            v
+-------------------------+
|   Gemini API Adapter    |  <-- retries, rate limits, timeout
+-------------------------+
            |
            v
+-------------------------+
|  Output Renderer        |  <-- text / json / csv, file write
+-------------------------+
```

**Implementation choices**

* Language: **Python 3.10+** (Typer/Argparse), or Node.js (Commander). This README uses Python examples.
* Caching: **SQLite** (default) or **file‑based** (pluggable).
* Concurrency: async batching for paragraphs/sentences.
* Optional HTTP layer: **FastAPI**.

---

## Data Flow

1. **Input**: `--text`, `--file`, `stdin`, or `--csv` with `--col`.
2. **Preprocess**: detect language, segment into sentences/blocks.
3. **Cache check**: hash (text+src+dst+settings+glossary) → hit returns immediately.
4. **Prompt build**: system & user prompts with constraints (tone, format, placeholders).
5. **Call Gemini**: robust retries with backoff; low temperature by default.
6. **Postprocess**: reassemble, preserve formatting, apply glossary, validate.
7. **Optional QA**: back‑translate & compare; log score.
8. **Render**: print to stdout or write to file/CSV/JSON.

---

## Installation & Setup

### Prerequisites

* Python 3.10+
* A **Gemini API key** (from Google AI Studio or Vertex AI)

### Quick Start

```bash
# 1) Clone
git clone https://github.com/yourname/tranzio.git && cd tranzio

# 2) Create env
python -m venv .venv && source .venv/bin/activate   # (Windows: .venv\\Scripts\\activate)

# 3) Install
pip install -r requirements.txt

# 4) Configure API key
cp .env.example .env
# then edit .env to set GEMINI_API_KEY=***

# 5) Smoke test
python -m tranzio --text "Hello world" --lang fr --verbose
```

**`requirements.txt` (suggested)**

```
typer
rich
python-dotenv
httpx
pydantic
orjson
sqlitedict
langdetect
nltk
fastapi
uvicorn
```

**`.env.example`**

```
GEMINI_API_KEY=
DEFAULT_TARGET_LANG=en
CACHE_BACKEND=sqlite  # sqlite | fs | none
```

---

## Usage

### Basic

```bash
# Translate inline text to French
tranzio --text "Good morning" --lang fr

# Same, via STDIN
echo "Good morning" | tranzio --lang fr

# Translate a file to German
tranzio --file notes.md --lang de --out notes.de.md
```

### Batch CSV

```bash
# Translate column "text" to Spanish and write CSV
tranzio --csv data/input.csv --col text --lang es --out data/output.es.csv
```

### Options (common)

```
--lang, -l             Target language code or name (e.g., fr, de, "French")
--source, -s           Source language (auto if omitted)
--style                tone: formal|neutral|casual (default: neutral)
--temperature          0.0–1.0 (default: 0.2)
--glossary             path to JSON glossary {"en": {"GPU": "GPU"}}
--format               text|json|md|csv (default: text)
--out                  output file path
--no-cache             bypass cache for this run
--verbose              print debug info (timings, tokens, cache events)
```

### Server Mode (optional)

```bash
# Start HTTP API on port 8000
tranzio serve --host 0.0.0.0 --port 8000

# Example request
curl -X POST http://localhost:8000/translate \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello","target":"fr"}'
```

---

## Configuration

* **Caching**: SQLite cache keyed on `sha256(text + source + target + options + glossaryHash)`.
* **Segmentation**: NLTK Punkt; falls back to paragraph split for code/markdown.
* **Retries**: exponential backoff (`1s, 2s, 4s`, jitter), max 3 attempts.
* **Rate limits**: token budget & QPS guard; queue when in server mode.
* **Glossary**: JSON mapping per language; applied post‑translation with exact/regex rules.

---

## Prompting Strategy

**System prompt** (abridged):

```
You are Tranzio, an advanced AI-powered translation assistant.
Your goal is to translate text into the target language as accurately as possible.

Rules:
- Maintain original tone and meaning.
- Preserve numbers, dates, names, and code snippets.
- Always return the result in strict JSON format:
{
"translated_text": "<translation>",
"detected_language": "<source language>"
}
```

**User prompt template**:

```
<TARGET>=${target_lang}
<STYLE>=${style}
<CONTEXT>=${optional_context}

TEXT:
${chunk}
```
---
**Zero-Shot Prompt for Tranzio**
```
{
  "system": "You are Tranzio, an AI-powered translation assistant. Your task is to translate the user's input text into the target language accurately, while maintaining tone, context, and meaning. Do not explain anything; only return the translation in structured JSON format.",
  "user": "Translate the following text into French: 'The future belongs to those who believe in their dreams.'",
  "expected_output": {
    "source_language": "English",
    "target_language": "French",
    "translation": "L'avenir appartient à ceux qui croient en leurs rêves."
  }
}
```
---
**One-Shot Prompt for Tranzio**
```
{
  "system": "You are Tranzio, an AI-powered translation assistant. Your job is to translate the user's input text into the target language accurately, preserving tone, context, and meaning. Always return the translation in a structured JSON format.",
  "user": "Translate the following text into Spanish: 'Knowledge is power.'",
  "example": {
    "source_language": "English",
    "target_language": "French",
    "input_text": "Learning never exhausts the mind.",
    "translation": "L'apprentissage n'épuise jamais l'esprit."
  },
  "task": "Translate the following text into German: 'Dream big and dare to fail.'",
  "expected_output": {
    "source_language": "English",
    "target_language": "German",
    "translation": "Träume groß und wage zu scheitern."
  }
}
```
---
**Multi-Shot Prompt for Tranzio**
```
{
  "system": "You are Tranzio, an AI-powered translation assistant. Your task is to translate the user's text into the target language while maintaining context, tone, and accuracy. Always respond in a structured JSON format.",
  "examples": [
    {
      "source_language": "English",
      "target_language": "French",
      "input_text": "Knowledge is power.",
      "translation": "Le savoir, c'est le pouvoir."
    },
    {
      "source_language": "English",
      "target_language": "Spanish",
      "input_text": "Dream big and dare to fail.",
      "translation": "Sueña en grande y atrévete a fracasar."
    },
    {
      "source_language": "English",
      "target_language": "German",
      "input_text": "Learning never exhausts the mind.",
      "translation": "Lernen ermüdet den Geist niemals."
    }
  ],
  "task": "Translate the following text into Italian: 'Success is not final, failure is not fatal.'",
  "expected_output": {
    "source_language": "English",
    "target_language": "Italian",
    "translation": "Il successo non è definitivo, il fallimento non è fatale."
  }
}
```
---
**Dynamic Prompt Implementation in Tranzio**
```
{
  "system": "You are Tranzio, an AI-powered CLI translator. Translate the user's input text into the requested target language accurately, preserving tone and context. Always return the output in structured JSON.",
  "user_dynamic": "Translate the following text from {{source_language}} to {{target_language}}:\n\"{{user_input}}\"",
  "expected_output": {
    "translation": "<dynamic_translation_here>"
  }
}
```
How It Works

* {{source_language}} → dynamically replaced with the language the user inputs

* {{target_language}} → dynamically replaced with the requested target language

* {{user_input}} → dynamically replaced with the actual text the user wants to translate
  
Gemini receives a fresh, personalized prompt every time based on the inputs

Final Prompt Sent to Gemini 👇
```
{
  "system": "You are Tranzio, an AI-powered CLI translator. Translate the user's input text into the requested target language accurately, preserving tone and context. Always return the output in structured JSON.",
  "user": "Translate the following text from English to French:\n\"Keep pushing forward, no matter how hard it gets.\""
}
```

Gemini Response 👇
```
{
  "translation": "Continue d'avancer, peu importe la difficulté."
}
```
---

## Testing Plan

1. **Unit tests**: CLI args, segmentation, hashing, cache, glossary rules.
2. **Integration tests**: stubbed Gemini adapter; golden outputs.
3. **E2E tests**: real API (gated with `RUN_E2E=1`), assert latency & status.
4. **Quality tests**: compute BLEU/ChrF on a tiny parallel set (sanity check).

**Example test matrix**

* Languages: en→fr, en→de, en→hi, hi→en, en→es
* Inputs: plain text, Markdown with code, placeholders `{name}`, CSV batch

---

## Benchmarking & Metrics

* **Latency**: p50, p95 end‑to‑end and model time.
* **Cache hit rate**: % of requests served from cache.
* **Throughput** (server mode): req/s at fixed QPS with concurrency N.
* **Cost per 1k chars** (approx): tracked via counters.

Simple harness:

```
tranzio bench --dataset samples/bench.txt --lang fr --concurrency 8 --repeat 5
```

Outputs CSV with timings and cache stats.

---

## Error Handling & Reliability

* Clear messages for: invalid language, missing key, network timeout, rate limit.
* **Retries** with backoff on transient errors; stop on client errors.
* **Idempotent**: cache prevents double‑work on re‑tries.
* **Safe shutdown**: flush queues, persist partial outputs.

---

## Security & Privacy

* Do not log API keys or full payloads in verbose mode (hash only).
* Optional **redaction** of emails/IDs before sending to API.
* `.env` and cache directory are git‑ignored.

---




