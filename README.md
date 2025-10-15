# VSCode Markdown Automatic Bullet Points

An open-source "mini-extension" which automatically adds bullet points when editing in Markdown.

## Features

- Automatically inserts bullet when moving to the next line with the <kbd>Enter</kbd> key
- Automatically removes the bullet when if the bulleted line contains no other text (typically if you press <kbd>Enter</kbd> twice)
- Supports `-`, `*`, and `+` as bullet characters
- Detects language changes and disposes the type event listener when no longer needed to reduce resource use

## Usage

- Press <kbd>Enter</kbd> to automatically insert a bullet on the next line
- Press <kbd>Enter</kbd> twice to remove the inserted bullet
- To create a new line without a bullet, press <kbd>Ctrl</kbd>+<kbd>Enter</kbd>

## Release Notes

### 1.0.0

Initial release

### 1.1.0

Add backspace feature

### 1.1.1

Bug fix

### 1.2.0

Add detect-duplicate feature

## 1.2.1

Bug fix

## License

- AGPL-3.0-or-later
- See [LICENSE](./LICENSE) for full text

## Author

- Jason Lonsberry (transce080)

## Repository

- [GitHub Repository](https://github.com/transce080/vscode-markdown-auto-bullets/)

## Known Issues

- None

## Acknowledgments

- [vscode-backspace extension](https://github.com/microsoft/vscode-backspace/tree/3c2054df2a7d8af7214ca601014520a17d458fa1) - backspace reference
- [vscode docs](https://code.visualstudio.com/api/references/vscode-api) - basic api reference- [vscode source](https://github.com/microsoft/vscode) - additional api reference
