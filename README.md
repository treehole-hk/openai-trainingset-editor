# JSONL Training Data Editor

A powerful tool for managing, editing, and preparing AI training datasets in JSONL format. Perfect for conversation data and DPO dataset preparation.

## About

Originally created as an open-source web-based editor for OpenAI fine-tuning JSONL files, this tool has been enhanced by the PsyTech & Innovation team of [TreeholeHK](https://treehole.hk) for their work on [MindForest.ai](https://mindforest.ai), an AI-powered psychological coaching platform.

For more information about OpenAI's fine-tuning feature, see the [official documentation](https://platform.openai.com/docs/guides/fine-tuning).

## Features

- 💬 Intuitive conversation editor with drag-and-drop message reordering
- 🤖 System message management for guiding AI behavior
- 👍 DPO (Direct Preference Optimization) dataset preparation with chosen/rejected marking
- 📤 Export support for both JSONL and CSV formats
- 🔒 Local file processing (no data sent to any servers)
- ⚡ Real-time validation and error checking
- ✨ Clean interface with syntax highlighting
- 💾 Local file processing (no data sent to any servers)
- ⚡ Real-time validation and error checking
- 📥 Easy import/export of JSONL files

## Usage

1. Visit the editor (hosted version coming soon)
2. Upload your JSONL file
3. Edit conversations and system messages using the visual interface
4. Mark preferences for DPO training if needed
5. Export your modified dataset

## Privacy & Security

This tool runs entirely in your browser. No data is sent to any external servers, making it safe for processing sensitive training data.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Contributing

While this project serves specific needs in AI training data preparation, we're open to suggestions and improvements. If you have ideas or encounter issues:

- Open an issue to discuss what you would like to change
- Submit a pull request
- Reach out with suggestions

## License

MIT License - Feel free to use, modify, and distribute this software. This project is licensed under the permissive MIT License, allowing you to use the code for any purpose, including commercial applications, as long as you include the original copyright notice.

---

*Enhanced by the [PsyTech & Innovation](https://psy.tech) team of [TreeholeHK](https://treehole.hk). Originally created to solve specific needs in AI training data preparation, now powering the development of [MindForest.ai](https://mindforest.ai), an AI-powered psychological coaching platform.*