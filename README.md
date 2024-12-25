# OpenAI Fine-tune Training Set Editor

A free, open-source web-based editor for OpenAI fine-tuning JSONL files. This tool allows you to easily view, edit, and validate your training data for OpenAI fine-tuning tasks.

For more information about OpenAI's fine-tuning feature, see the [official documentation](https://platform.openai.com/docs/guides/fine-tuning).

## Motivation

While working with OpenAI's fine-tuning feature, I noticed a lack of user-friendly tools for editing JSONL training sets. Most solutions involved manual text editing or writing custom scripts. This project aims to fill that gap by providing a simple, intuitive interface for managing fine-tuning datasets.

## Features

- 📝 Visual editing of JSONL files with role-based message formatting
- 🔍 Preview conversation flow with system/user/assistant messages
- ✨ Clean interface with syntax highlighting
- 💾 Local file processing (no data sent to any servers)
- ⚡ Real-time validation and error checking
- 📥 Easy import/export of JSONL files

## Usage

1. Visit the editor (hosted version coming soon)
2. Upload your JSONL file
3. Edit messages using the visual interface
4. Download the modified JSONL file

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

This is an internal tool that I'm making freely available to the community. While it serves my needs, I'm open to suggestions and improvements. If you have ideas or encounter issues:

- Open an issue to discuss what you would like to change
- Submit a pull request
- Reach out with suggestions

## License

MIT License - Feel free to use, modify, and distribute this software. This project is licensed under the permissive MIT License, allowing you to use the code for any purpose, including commercial applications, as long as you include the original copyright notice.

---

*Note: This is a personal project created to solve a specific need in the OpenAI fine-tuning workflow. It's provided as-is, without any warranty, but with the hope that others might find it useful too.*