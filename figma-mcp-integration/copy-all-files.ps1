# Script to copy all remaining files from source to workspace

$sourcePath = "d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main"
$destPath = "figma-mcp-integration"

Write-Host "Copying files from source to workspace..." -ForegroundColor Green

# Copy MCP server files
Write-Host "Copying MCP server files..." -ForegroundColor Yellow
if (Test-Path "$sourcePath\src\talk_to_figma_mcp") {
    Copy-Item -Path "$sourcePath\src\talk_to_figma_mcp\*" -Destination "$destPath\src\talk_to_figma_mcp\" -Recurse -Force
    Write-Host "✓ MCP server files copied" -ForegroundColor Green
} else {
    Write-Host "✗ Source path not found: $sourcePath\src\talk_to_figma_mcp" -ForegroundColor Red
}

# Copy Figma plugin files
Write-Host "Copying Figma plugin files..." -ForegroundColor Yellow
if (Test-Path "$sourcePath\src\cursor_mcp_plugin") {
    Copy-Item -Path "$sourcePath\src\cursor_mcp_plugin\*" -Destination "$destPath\src\cursor_mcp_plugin\" -Recurse -Force
    Write-Host "✓ Figma plugin files copied" -ForegroundColor Green
} else {
    Write-Host "✗ Source path not found: $sourcePath\src\cursor_mcp_plugin" -ForegroundColor Red
}

# Copy README
Write-Host "Copying README..." -ForegroundColor Yellow
if (Test-Path "$sourcePath\readme.md") {
    Copy-Item -Path "$sourcePath\readme.md" -Destination "$destPath\" -Force
    Write-Host "✓ README copied" -ForegroundColor Green
}

# Copy LICENSE
Write-Host "Copying LICENSE..." -ForegroundColor Yellow
if (Test-Path "$sourcePath\LICENSE") {
    Copy-Item -Path "$sourcePath\LICENSE" -Destination "$destPath\" -Force
    Write-Host "✓ LICENSE copied" -ForegroundColor Green
}

# Copy scripts
Write-Host "Copying scripts..." -ForegroundColor Yellow
if (Test-Path "$sourcePath\scripts") {
    Copy-Item -Path "$sourcePath\scripts\*" -Destination "$destPath\scripts\" -Recurse -Force
    Write-Host "✓ Scripts copied" -ForegroundColor Green
}

Write-Host "`nAll files copied successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: cd figma-mcp-integration" -ForegroundColor White
Write-Host "2. Run: bun install" -ForegroundColor White
Write-Host "3. Run: bun run build" -ForegroundColor White

