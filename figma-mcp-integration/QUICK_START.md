# Quick Start Guide

## Step 1: Copy Source Files

**CRITICAL**: You must copy the source files first!

Run this PowerShell script from the workspace root:

```powershell
$source = "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main"
$dest = "$PWD\figma-mcp-integration"

# Create directories
New-Item -ItemType Directory -Force -Path "$dest\src\talk_to_figma_mcp" | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\src\cursor_mcp_plugin" | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\scripts" | Out-Null

# Copy files
Copy-Item "$source\src\talk_to_figma_mcp\*" "$dest\src\talk_to_figma_mcp\" -Recurse -Force
Copy-Item "$source\src\cursor_mcp_plugin\*" "$dest\src\cursor_mcp_plugin\" -Recurse -Force
Copy-Item "$source\scripts\*" "$dest\scripts\" -Recurse -Force
Copy-Item "$source\readme.md" "$dest\" -Force
Copy-Item "$source\LICENSE" "$dest\" -Force

Write-Host "Files copied!" -ForegroundColor Green
```

## Step 2: Install Dependencies

```bash
cd figma-mcp-integration
bun install
```

## Step 3: Start WebSocket Server

```bash
bun socket
```

Keep this terminal open!

## Step 4: Configure Cursor

Edit/create `~/.cursor/mcp.json`:

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

## Step 5: Install Figma Plugin

1. Open Figma
2. Plugins > Development > New Plugin
3. Link existing plugin
4. Select: `figma-mcp-integration/src/cursor_mcp_plugin/manifest.json`
5. Run the plugin

## Step 6: Connect & Use!

1. Plugin should auto-connect
2. In Cursor, join a channel: `join_channel` with any channel name
3. Start using MCP tools in Cursor!

## Verify Installation

Check that these files exist:
- ✅ `src/talk_to_figma_mcp/server.ts` (large file, ~3000 lines)
- ✅ `src/cursor_mcp_plugin/code.js` (large file, ~4000 lines)
- ✅ `src/cursor_mcp_plugin/ui.html`
- ✅ `src/cursor_mcp_plugin/manifest.json`
- ✅ `src/socket.ts`

If any are missing, re-run Step 1.

