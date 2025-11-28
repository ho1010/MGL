@echo off
echo Copying source files...
echo.

set SOURCE=d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main
set DEST=%~dp0

echo Source: %SOURCE%
echo Destination: %DEST%
echo.

if not exist "%SOURCE%\src\talk_to_figma_mcp" (
    echo ERROR: Source directory not found: %SOURCE%\src\talk_to_figma_mcp
    pause
    exit /b 1
)

echo Copying MCP server files...
xcopy "%SOURCE%\src\talk_to_figma_mcp\*" "%DEST%src\talk_to_figma_mcp\" /E /I /Y
if %ERRORLEVEL% EQU 0 (
    echo [OK] MCP server files copied
) else (
    echo [ERROR] Failed to copy MCP server files
)

echo.
echo Copying Figma plugin files...
xcopy "%SOURCE%\src\cursor_mcp_plugin\*" "%DEST%src\cursor_mcp_plugin\" /E /I /Y
if %ERRORLEVEL% EQU 0 (
    echo [OK] Figma plugin files copied
) else (
    echo [ERROR] Failed to copy Figma plugin files
)

echo.
echo Copying scripts...
xcopy "%SOURCE%\scripts\*" "%DEST%scripts\" /E /I /Y
if %ERRORLEVEL% EQU 0 (
    echo [OK] Scripts copied
) else (
    echo [ERROR] Failed to copy scripts
)

echo.
echo Copying README and LICENSE...
copy "%SOURCE%\readme.md" "%DEST%" /Y >nul 2>&1
copy "%SOURCE%\LICENSE" "%DEST%" /Y >nul 2>&1

echo.
echo Done! Checking results...
if exist "%DEST%src\talk_to_figma_mcp\server.ts" (
    echo [OK] server.ts found
) else (
    echo [ERROR] server.ts not found
)

if exist "%DEST%src\cursor_mcp_plugin\code.js" (
    echo [OK] code.js found
) else (
    echo [ERROR] code.js not found
)

echo.
pause

