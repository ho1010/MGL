# Figma MCP Integration - Setup Complete!

This project has been copied to your workspace. Here's what you need to do to complete the setup:

## Quick Start

### 1. Install Bun (if not already installed)

```bash
# Windows PowerShell
powershell -c "irm bun.sh/install.ps1|iex"
```

### 2. Copy remaining source files

The source files are very large. Please copy them manually:

```powershell
# Copy the MCP server code
xcopy "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main\src\talk_to_figma_mcp\*" "figma-mcp-integration\src\talk_to_figma_mcp\" /E /I /Y

# Copy the Figma plugin code
xcopy "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main\src\cursor_mcp_plugin\*" "figma-mcp-integration\src\cursor_mcp_plugin\" /E /I /Y

# Copy README and other files
xcopy "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main\readme.md" "figma-mcp-integration\" /Y
xcopy "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main\scripts\*" "figma-mcp-integration\scripts\" /E /I /Y
xcopy "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main\LICENSE" "figma-mcp-integration\" /Y
```

### 3. Install dependencies

```bash
cd figma-mcp-integration
bun install
```

### 4. Start the WebSocket server

```bash
bun socket
```

### 5. Configure Cursor MCP

Add to `~/.cursor/mcp.json`:

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

### 6. Install Figma Plugin

1. Open Figma
2. Go to Plugins > Development > New Plugin
3. Choose "Link existing plugin"
4. Select `figma-mcp-integration/src/cursor_mcp_plugin/manifest.json`
5. Run the plugin in Figma

## Project Structure

- `src/talk_to_figma_mcp/` - MCP server for Cursor integration
- `src/cursor_mcp_plugin/` - Figma plugin
- `src/socket.ts` - WebSocket server
- `scripts/setup.sh` - Setup script

## Next Steps

1. Copy the remaining source files (see above)
2. Install dependencies with `bun install`
3. Build the project with `bun run build`
4. Start the WebSocket server with `bun socket`
5. Configure Cursor MCP settings
6. Install and run the Figma plugin

For more details, see the README.md file (copy it from the source directory).

