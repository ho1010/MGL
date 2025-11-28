# 최종 파일 복사 안내

큰 파일들(server.ts, code.js 등)은 자동 복사에 문제가 있어 수동 복사가 필요합니다.

## Windows 탐색기에서 복사하는 방법

### 1단계: 소스 폴더 열기
1. Windows 탐색기를 엽니다
2. 다음 경로로 이동:
   ```
   d:\101 program\cursor-talk-to-figma-mcp-main\cursor-talk-to-figma-mcp-main
   ```

### 2단계: 파일 복사

#### A. MCP 서버 파일 복사
1. `src\talk_to_figma_mcp` 폴더를 찾습니다
2. 이 폴더 전체를 복사합니다 (Ctrl+C)
3. 다음 경로로 이동:
   ```
   C:\Users\Seol\Documents\GitHub\MGL\figma-mcp-integration\src\
   ```
4. 붙여넣기합니다 (Ctrl+V)
5. 폴더 이름이 `talk_to_figma_mcp`인지 확인합니다

#### B. Figma 플러그인 파일 복사
1. `src\cursor_mcp_plugin` 폴더를 찾습니다
2. 이 폴더 전체를 복사합니다 (Ctrl+C)
3. 다음 경로로 이동:
   ```
   C:\Users\Seol\Documents\GitHub\MGL\figma-mcp-integration\src\
   ```
4. 붙여넣기합니다 (Ctrl+V)
5. 폴더 이름이 `cursor_mcp_plugin`인지 확인합니다

#### C. 스크립트 파일 복사
1. `scripts` 폴더를 찾습니다
2. 이 폴더의 모든 파일을 복사합니다
3. 다음 경로로 이동:
   ```
   C:\Users\Seol\Documents\GitHub\MGL\figma-mcp-integration\scripts\
   ```
4. 붙여넣기합니다

## 확인해야 할 파일들

복사 후 다음 파일들이 있어야 합니다:

- ✅ `figma-mcp-integration/src/talk_to_figma_mcp/server.ts` (약 3100줄)
- ✅ `figma-mcp-integration/src/cursor_mcp_plugin/code.js` (약 4000줄)
- ✅ `figma-mcp-integration/src/cursor_mcp_plugin/ui.html`
- ✅ `figma-mcp-integration/src/cursor_mcp_plugin/manifest.json` (이미 생성됨)
- ✅ `figma-mcp-integration/src/cursor_mcp_plugin/setcharacters.js`
- ✅ `figma-mcp-integration/scripts/setup.sh` (이미 생성됨)

## 복사 후 다음 단계

파일 복사가 완료되면 다음 명령을 실행하세요:

```powershell
cd figma-mcp-integration
bun install
bun run build
```

그 다음 `QUICK_START.md`를 참고하여 나머지 설정을 완료하세요.

