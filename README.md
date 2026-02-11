# Mermaid Zoom

A [SiYuan Note](https://b3log.org/siyuan) plugin that adds **click-to-zoom preview** for Mermaid / Graphviz / PlantUML diagrams.

## Features

- **Double-click** any diagram to open a fullscreen preview dialog
- **Mouse wheel** to zoom in/out
- **Drag** to pan around the diagram
- **Reset zoom** button to restore original view
- **Export to PNG** with 2x resolution for clarity
- **Keyboard shortcut** (`Alt+Shift+Z`) to open preview
- **Hover button** on diagram blocks for quick access
- **Right-click menu** integration

## Supported Diagram Types

- Mermaid
- Graphviz
- PlantUML

## Installation

### From SiYuan Bazaar

1. Open SiYuan Note
2. Go to **Settings → Bazaar → Plugins**
3. Search for "Mermaid Zoom"
4. Click Install

### Manual Installation

1. Download `package.zip` from [Releases](https://github.com/583175694/siyuan-plugin-mermaid-zoom/releases)
2. Extract to `{SiYuan workspace}/data/plugins/siyuan-plugin-mermaid-zoom/`
3. Restart SiYuan or refresh the page

## Usage

1. Create a Mermaid/Graphviz/PlantUML code block in SiYuan
2. Once the diagram renders:
   - **Double-click** the diagram to open fullscreen preview
   - **Hover** over the diagram to see the zoom button in the top-right corner
   - Use **Alt+Shift+Z** shortcut when a diagram block is focused
3. In the preview dialog:
   - Use toolbar buttons to zoom in/out or reset
   - Scroll mouse wheel to zoom
   - Click and drag to pan
   - Click "Export PNG" to download the diagram as an image

## Development

```bash
# Install dependencies
pnpm install

# Start development mode (watch)
pnpm run dev

# Build for production
pnpm run build
```

## License

[MIT](https://github.com/583175694/siyuan-plugin-mermaid-zoom/blob/main/LICENSE)
