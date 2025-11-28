# Android 앱 빌드 스크립트 (PowerShell)

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("debug", "release")]
    [string]$BuildType = "release"
)

Write-Host "🚀 Android 앱 빌드 시작..." -ForegroundColor Green
Write-Host "빌드 타입: $BuildType" -ForegroundColor Cyan

# Android 폴더 확인
if (-not (Test-Path "android")) {
    Write-Host "❌ android 폴더를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "먼저 Android 프로젝트를 초기화하세요:" -ForegroundColor Yellow
    Write-Host "  .\scripts\init-android.ps1" -ForegroundColor Cyan
    exit 1
}

# Gradle Wrapper 확인
$gradlewPath = "android\gradlew.bat"
if (-not (Test-Path $gradlewPath)) {
    Write-Host "❌ Gradle Wrapper를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "Android 프로젝트가 제대로 초기화되지 않았습니다." -ForegroundColor Yellow
    exit 1
}

# JDK 확인
Write-Host "`n☕ Java Development Kit 확인 중..." -ForegroundColor Yellow
$javaVersion = java -version 2>&1 | Select-Object -First 1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Java가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "JDK 11 이상을 설치하세요: https://adoptium.net/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ $javaVersion" -ForegroundColor Green

# Android SDK 확인
Write-Host "`n📱 Android SDK 확인 중..." -ForegroundColor Yellow
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    $androidHome = $env:ANDROID_SDK_ROOT
}
if (-not $androidHome) {
    Write-Host "⚠️  ANDROID_HOME 환경 변수가 설정되지 않았습니다." -ForegroundColor Yellow
    Write-Host "Android Studio를 설치하고 환경 변수를 설정하세요." -ForegroundColor Yellow
    Write-Host "계속 진행합니다..." -ForegroundColor Yellow
} else {
    Write-Host "✓ ANDROID_HOME: $androidHome" -ForegroundColor Green
}

# Clean 빌드
Write-Host "`n🧹 이전 빌드 파일 정리 중..." -ForegroundColor Yellow
Push-Location android
& .\gradlew.bat clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Clean 실패" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 빌드
Write-Host "`n📦 $BuildType APK 빌드 중..." -ForegroundColor Yellow
Write-Host "이 작업은 몇 분이 소요될 수 있습니다..." -ForegroundColor Yellow

Push-Location android

if ($BuildType -eq "release") {
    # Release 빌드 전 서명 키 확인
    $keystorePath = "app\my-release-key.keystore"
    if (-not (Test-Path $keystorePath)) {
        Write-Host "`n⚠️  서명 키가 없습니다. Debug 빌드를 진행합니다." -ForegroundColor Yellow
        Write-Host "Release 빌드를 원하면 먼저 서명 키를 생성하세요:" -ForegroundColor Yellow
        Write-Host "  .\scripts\generate-keystore.ps1" -ForegroundColor Cyan
        $BuildType = "debug"
    }
    
    if ($BuildType -eq "release") {
        & .\gradlew.bat assembleRelease
    } else {
        & .\gradlew.bat assembleDebug
    }
} else {
    & .\gradlew.bat assembleDebug
}

$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -eq 0) {
    Write-Host "`n✅ 빌드 성공!" -ForegroundColor Green
    
    # APK 경로 확인
    if ($BuildType -eq "release") {
        $apkPath = "android\app\build\outputs\apk\release\app-release.apk"
        $outputPath = "android\app\build\outputs\apk\release"
    } else {
        $apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
        $outputPath = "android\app\build\outputs\apk\debug"
    }
    
    if (Test-Path $apkPath) {
        $apkInfo = Get-Item $apkPath
        $sizeMB = [math]::Round($apkInfo.Length / 1MB, 2)
        
        Write-Host "`n📱 APK 정보:" -ForegroundColor Cyan
        Write-Host "  위치: $apkPath" -ForegroundColor White
        Write-Host "  크기: $sizeMB MB" -ForegroundColor White
        Write-Host "  날짜: $($apkInfo.LastWriteTime)" -ForegroundColor White
        
        # APK를 프로젝트 루트로 복사
        $copyPath = "builds\app-$BuildType-$(Get-Date -Format 'yyyyMMdd-HHmmss').apk"
        $buildsDir = "builds"
        if (-not (Test-Path $buildsDir)) {
            New-Item -ItemType Directory -Path $buildsDir | Out-Null
        }
        Copy-Item -Path $apkPath -Destination $copyPath -Force
        Write-Host "`n📁 복사본: $copyPath" -ForegroundColor Green
        
        Write-Host "`n✨ 빌드 완료! APK 파일을 확인하세요." -ForegroundColor Green
    } else {
        Write-Host "⚠️  APK 파일을 찾을 수 없습니다." -ForegroundColor Yellow
        Write-Host "출력 경로: $outputPath" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n❌ 빌드 실패" -ForegroundColor Red
    Write-Host "오류 로그를 확인하세요." -ForegroundColor Yellow
    exit 1
}

