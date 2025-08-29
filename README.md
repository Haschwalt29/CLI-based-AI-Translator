# 🌍 Tranzio - CLI-based AI Translator

A powerful CLI-based translator application using Google's Gemini API with advanced prompting strategies, RAG support, and structured output.

## ✨ Features

- **Multi-Strategy Prompting**: Zero-shot, one-shot, multi-shot, and dynamic prompting
- **Function Calling**: Structured JSON output using Gemini's function calling capabilities
- **RAG Support**: Local glossary for frequently used translations
- **Token Logging**: Monitor API usage and costs
- **Structured Output**: Consistent JSON response format
- **Auto-language Detection**: Automatically detect source language

## 🏗️ Project Structure

```
tranzio/
│── src/
│ ├── translator.js          # Main translation engine
│ ├── prompts/               # Prompt templates
│ │ ├── zeroShot.js         # Zero-shot prompting
│ │ ├── oneShot.js          # One-shot prompting
│ │ ├── multiShot.js        # Multi-shot prompting
│ │ ├── dynamic.js          # Dynamic strategy selection
│ │ └── chainOfThought.js   # Chain-of-thought prompting
│ ├── functions.js           # Gemini function calling schemas
│ ├── rag.js                # RAG module with local glossary
│ ├── utils/
│ │ ├── tokenLogger.js      # Token usage monitoring
│ │ └── structuredOutput.js # Response formatting
│ └── cli.js                # CLI interface (to be implemented)
│
├── .env                     # Environment configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `env.example` to `.env` and add your Gemini API key:

```bash
cp env.example .env
```

Edit `.env`:
```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-pro
```

### 3. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

## 📚 Usage Examples

### Basic Translation

```javascript
import TranzioTranslator from './src/translator.js';
import dotenv from 'dotenv';

dotenv.config();

const translator = new TranzioTranslator();

// Translate text
const result = await translator.translate(
  "Hello, how are you?",
  "Spanish"
);

console.log(result);
```

### Using Different Prompt Strategies

```javascript
import { getPromptByStrategy } from './src/prompts/dynamic.js';

// Force specific strategy
const prompt = getPromptByStrategy(
  "It's raining cats and dogs",
  "French",
  "English",
  "multi" // Force multi-shot prompting
);
```

### RAG Operations

```javascript
import { checkRAG, addToGlossary, getGlossaryStats } from './src/rag.js';

// Check if translation exists locally
const result = await checkRAG("hello", "Spanish");

// Add new translation
await addToGlossary("good morning", "buenos días", "Spanish", "English");

// Get statistics
const stats = await getGlossaryStats();
```

## 🔧 Core Components

### 1. Translator Engine (`src/translator.js`)
- Main translation logic using Gemini API
- Automatic prompt strategy selection
- Function calling for structured output
- Fallback mechanisms

### 2. Prompt Templates (`src/prompts/`)
- **Zero-shot**: Basic instructions without examples
- **One-shot**: Single example for better understanding
- **Multi-shot**: Multiple examples for complex scenarios
- **Dynamic**: Automatic strategy selection based on text complexity
- **Chain-of-thought**: Step-by-step reasoning prompts

### 3. Function Calling (`src/functions.js`)
- Gemini function schemas for structured output
- Parameter validation
- Multiple schema options (full vs. simplified)

### 4. RAG Module (`src/rag.js`)
- Local glossary for common translations
- Partial matching for phrases
- Persistent storage with fallback to defaults
- Statistics and management functions

### 5. Utilities
- **Token Logger**: Monitor API usage and costs
- **Structured Output**: Consistent response formatting

## 📊 Response Format

All translations return structured JSON:

```json
{
  "source_language": "English",
  "target_language": "Spanish",
  "translated_text": "Hola, ¿cómo estás?",
  "status": "success",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "confidence": 0.95,
  "cultural_notes": "Direct translation",
  "error": null
}
```

## 🎯 Prompting Strategies

### Zero-Shot
- Best for: Simple, straightforward translations
- Use case: Basic phrases, common words

### One-Shot
- Best for: Moderate complexity texts
- Use case: Sentences with context

### Multi-Shot
- Best for: Complex texts, idioms, cultural nuances
- Use case: Professional translations, creative content

### Dynamic
- Automatically selects the best strategy based on text analysis
- Considers word count, idioms, special characters

## 💰 Cost Monitoring

The token logger provides detailed cost estimates:
- Prompt tokens: $0.0005 per 1K tokens
- Completion tokens: $0.0015 per 1K tokens
- Real-time usage statistics

## 🔮 Future Enhancements

- [ ] CLI interface with interactive prompts
- [ ] Batch translation support
- [ ] Translation memory and learning
- [ ] Custom glossary management
- [ ] API rate limiting and caching
- [ ] Web interface
- [ ] Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed description

---

**Built with ❤️ using Google's Gemini API**
