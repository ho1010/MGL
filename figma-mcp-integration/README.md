# Cursor Talk to Figma MCP

This project implements a Model Context Protocol (MCP) integration between Cursor AI and Figma, allowing Cursor to communicate with Figma for reading designs and modifying them programmatically.

## ⚠️ IMPORTANT: Complete Setup Required

The basic project structure has been created, but you need to copy the large source files from the original location:

### Copy Source Files

Run these commands in PowerShell from your workspace root:

```powershell
# Navigate to workspace
cd "C:\Users\Seol\Documents\GitHub\MGL"

# Copy MCP server source code
Copy-Item -Path "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main\src\talk_to_figma_mcp\*" -Destination "figma-mcp-integration\src\talk_to_figma_mcp\" -Recurse -Force

# Copy Figma plugin source code
Copy-Item -Path "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main\src\cursor_mcp_plugin\*" -Destination "figma-mcp-integration\src\cursor_mcp_plugin\" -Recurse -Force

# Copy README and other files
Copy-Item -Path "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main\readme.md" -Destination "figma-mcp-integration\" -Force
Copy-Item -Path "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main\LICENSE" -Destination "figma-mcp-integration\" -Force
Copy-Item -Path "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main\scripts\*" -Destination "figma-mcp-integration\scripts\" -Recurse -Force
```

## Get Started

### 1. Install Bun

```bash
# Windows PowerShell
powershell -c "irm bun.sh/install.ps1|iex"
```

### 2. Install Dependencies

```bash
cd figma-mcp-integration
bun install
```

### 3. Start the WebSocket Server

```bash
bun socket
```

Keep this running in a terminal.

### 4. Configure Cursor MCP

Edit `~/.cursor/mcp.json` (or create it) and add:

```json
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bun",
      "args": ["run", "src/talk_to_figma_mcp/server.ts"]
    }
  }
}
```

Or for development, use the full path:

```json
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bun",
      "args": ["C:/Users/Seol/Documents/GitHub/MGL/figma-mcp-integration/src/talk_to_figma_mcp/server.ts"]
    }
  }
}
```

### 5. Install Figma Plugin

1. Open Figma Desktop App
2. Go to **Plugins** > **Development** > **New Plugin...**
3. Click **Link existing plugin**
4. Select: `figma-mcp-integration/src/cursor_mcp_plugin/manifest.json`
5. The plugin will appear in your development plugins
6. Run the plugin from the Plugins menu

### 6. Connect Everything

1. Make sure the WebSocket server is running (`bun socket`)
2. Open the Figma plugin in Figma
3. Click "Connect" in the plugin UI
4. Use Cursor AI to interact with Figma!

## Project Structure

```
figma-mcp-integration/
├── src/
│   ├── talk_to_figma_mcp/    # MCP server for Cursor
│   │   └── server.ts         # Main MCP server implementation
│   ├── cursor_mcp_plugin/    # Figma plugin
│   │   ├── code.js          # Plugin code
│   │   ├── ui.html          # Plugin UI
│   │   └── manifest.json    # Plugin manifest
│   └── socket.ts            # WebSocket server
├── scripts/
│   └── setup.sh             # Setup script
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

## Available MCP Tools

### Document & Selection
- `get_document_info` - Get information about the current Figma document
- `get_selection` - Get information about the current selection
- `read_my_design` - Get detailed node information about the current selection
- `get_node_info` - Get detailed information about a specific node
- `get_nodes_info` - Get detailed information about multiple nodes

### Creating Elements
- `create_rectangle` - Create a new rectangle
- `create_frame` - Create a new frame with auto-layout options
- `create_text` - Create a new text element

### Modifying Elements
- `set_fill_color` - Set fill color
- `set_stroke_color` - Set stroke color
- `set_corner_radius` - Set corner radius
- `move_node` - Move a node
- `resize_node` - Resize a node
- `delete_node` - Delete a node
- `clone_node` - Clone a node

### Text Operations
- `scan_text_nodes` - Scan all text nodes in a selection
- `set_text_content` - Update text content
- `set_multiple_text_contents` - Batch update multiple text nodes

### Auto Layout
- `set_layout_mode` - Set layout mode (HORIZONTAL, VERTICAL, NONE)
- `set_padding` - Set padding values
- `set_axis_align` - Set axis alignment
- `set_layout_sizing` - Set sizing modes
- `set_item_spacing` - Set spacing between items

### Components
- `get_local_components` - Get all local components
- `create_component_instance` - Create an instance
- `get_instance_overrides` - Get instance overrides
- `set_instance_overrides` - Apply instance overrides

### Annotations
- `get_annotations` - Get all annotations
- `set_annotation` - Create/update annotation
- `set_multiple_annotations` - Batch create annotations

### Prototyping
- `get_reactions` - Get prototype reactions
- `set_default_connector` - Set default connector style
- `create_connections` - Create connector lines

### Connection
- `join_channel` - Join a WebSocket channel (required first)

## Development

### Build

```bash
bun run build
```

### Watch Mode

```bash
bun run dev
```

## Windows + WSL Setup

If using WSL, uncomment the hostname in `src/socket.ts`:

```typescript
hostname: "0.0.0.0",
```

## Troubleshooting

1. **WebSocket not connecting**: Make sure the server is running on port 3055
2. **Plugin not loading**: Check that manifest.json path is correct
3. **MCP not working**: Verify the path in `~/.cursor/mcp.json` is correct
4. **Channel errors**: Always call `join_channel` first before other commands

## License

MIT

