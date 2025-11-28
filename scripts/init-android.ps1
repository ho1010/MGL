# Android 프로젝트 초기화 스크립트 (PowerShell)

Write-Host "🚀 Android 프로젝트 초기화 시작..." -ForegroundColor Green

# Node.js 확인
$nodeVersion = node -v
if (-not $nodeVersion) {
    Write-Host "❌ Node.js가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "Node.js를 먼저 설치하세요: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Node.js 버전: $nodeVersion" -ForegroundColor Green

# React Native CLI 확인
Write-Host "`n📦 React Native CLI 확인 중..." -ForegroundColor Yellow
$rnCli = npx react-native --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  React Native CLI를 설치하는 중..." -ForegroundColor Yellow
    npm install -g react-native-cli
}

# Android 폴더 확인
if (Test-Path "android") {
    Write-Host "`n⚠️  android 폴더가 이미 존재합니다." -ForegroundColor Yellow
    $response = Read-Host "덮어쓰시겠습니까? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "취소되었습니다." -ForegroundColor Yellow
        exit 0
    }
    Write-Host "기존 android 폴더를 백업 중..." -ForegroundColor Yellow
    Rename-Item -Path "android" -NewName "android.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
}

# 프로젝트 이름과 패키지 이름
$projectName = "ManagementGL"
$packageName = "com.managementgl.app"

Write-Host "`n📱 React Native Android 프로젝트 생성 중..." -ForegroundColor Yellow
Write-Host "프로젝트 이름: $projectName" -ForegroundColor Cyan
Write-Host "패키지 이름: $packageName" -ForegroundColor Cyan

# React Native 프로젝트 초기화 (기존 프로젝트에 Android 추가)
Write-Host "`n⚙️  React Native 프로젝트 구조 생성 중..." -ForegroundColor Yellow

# 의존성 설치 확인
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 의존성 설치 중..." -ForegroundColor Yellow
    npm install
}

# React Native CLI로 Android 프로젝트 생성
Write-Host "`n🔧 Android 네이티브 프로젝트 생성 중..." -ForegroundColor Yellow
Write-Host "이 작업은 몇 분이 소요될 수 있습니다..." -ForegroundColor Yellow

# 기존 프로젝트에 Android 추가
npx @react-native-community/cli init $projectName --skip-install --directory temp_init

if ($LASTEXITCODE -eq 0) {
    # Android 폴더 복사
    if (Test-Path "temp_init\android") {
        Copy-Item -Path "temp_init\android" -Destination "android" -Recurse -Force
        Write-Host "✓ Android 폴더 복사 완료" -ForegroundColor Green
    }
    
    # iOS 폴더 복사 (선택사항)
    if (Test-Path "temp_init\ios") {
        Copy-Item -Path "temp_init\ios" -Destination "ios" -Recurse -Force
        Write-Host "✓ iOS 폴더 복사 완료" -ForegroundColor Green
    }
    
    # 임시 폴더 삭제
    Remove-Item -Path "temp_init" -Recurse -Force
} else {
    Write-Host "`n⚠️  자동 생성 실패. 수동으로 진행합니다." -ForegroundColor Yellow
    Write-Host "다음 명령을 실행하세요:" -ForegroundColor Yellow
    Write-Host "npx react-native init ManagementGL --template react-native-template-typescript" -ForegroundColor Cyan
    Write-Host "그 다음 생성된 android 폴더를 현재 프로젝트로 복사하세요." -ForegroundColor Yellow
    exit 1
}

# Android 설정 파일 확인
Write-Host "`n🔍 Android 설정 파일 확인 중..." -ForegroundColor Yellow

if (Test-Path "android\app\src\main\AndroidManifest.xml") {
    Write-Host "✓ AndroidManifest.xml 발견" -ForegroundColor Green
    
    # 앱 이름 설정
    Write-Host "`n📝 앱 이름 설정 중..." -ForegroundColor Yellow
    $stringsPath = "android\app\src\main\res\values\strings.xml"
    if (-not (Test-Path $stringsPath)) {
        New-Item -Path $stringsPath -ItemType File -Force | Out-Null
        $stringsContent = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">혈당 관리</string>
</resources>
"@
        Set-Content -Path $stringsPath -Value $stringsContent -Encoding UTF8
    }
    Write-Host "✓ 앱 이름 설정 완료" -ForegroundColor Green
}

Write-Host "`n✅ Android 프로젝트 초기화 완료!" -ForegroundColor Green
Write-Host "`n다음 단계:" -ForegroundColor Cyan
Write-Host "1. Android Studio에서 android 폴더를 엽니다" -ForegroundColor White
Write-Host "2. 필요한 의존성을 설치합니다: npm install" -ForegroundColor White
Write-Host "3. 빌드를 테스트합니다: npm run build:android:debug" -ForegroundColor White

