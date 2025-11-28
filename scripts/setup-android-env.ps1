# Android 환경 변수 설정 스크립트 (PowerShell)

Write-Host "⚙️  Android 개발 환경 설정" -ForegroundColor Green
Write-Host ""

# 관리자 권한 확인
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  관리자 권한이 필요합니다." -ForegroundColor Yellow
    Write-Host "이 스크립트는 사용자 환경 변수만 설정합니다." -ForegroundColor Yellow
    Write-Host ""
}

# Android SDK 경로 찾기
Write-Host "🔍 Android SDK 경로 찾는 중..." -ForegroundColor Yellow

$possiblePaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk",
    "$env:ProgramFiles\Android\Sdk"
)

$androidHome = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $androidHome = $path
        Write-Host "✓ Android SDK 발견: $androidHome" -ForegroundColor Green
        break
    }
}

if (-not $androidHome) {
    Write-Host "❌ Android SDK를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "Android Studio를 설치하거나 SDK 경로를 입력하세요:" -ForegroundColor Yellow
    $androidHome = Read-Host "Android SDK 경로"
    
    if (-not (Test-Path $androidHome)) {
        Write-Host "❌ 경로가 유효하지 않습니다." -ForegroundColor Red
        exit 1
    }
}

# Java 경로 찾기
Write-Host ""
Write-Host "🔍 Java Development Kit 경로 찾는 중..." -ForegroundColor Yellow

$javaVersion = java -version 2>&1 | Select-Object -First 1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Java 발견: $javaVersion" -ForegroundColor Green
    
    # JAVA_HOME 찾기
    $javaHome = $env:JAVA_HOME
    if (-not $javaHome) {
        $possibleJavaPaths = @(
            "$env:ProgramFiles\Java",
            "$env:ProgramFiles(x86)\Java",
            "C:\Program Files\Java",
            "C:\Program Files (x86)\Java"
        )
        
        foreach ($basePath in $possibleJavaPaths) {
            if (Test-Path $basePath) {
                $javaDirs = Get-ChildItem -Path $basePath -Directory -ErrorAction SilentlyContinue
                foreach ($dir in $javaDirs) {
                    if (Test-Path "$($dir.FullName)\bin\java.exe") {
                        $javaHome = $dir.FullName
                        Write-Host "✓ JAVA_HOME 발견: $javaHome" -ForegroundColor Green
                        break
                    }
                }
                if ($javaHome) { break }
            }
        }
    }
    
    if (-not $javaHome) {
        Write-Host "⚠️  JAVA_HOME을 찾을 수 없습니다. 수동으로 입력하세요:" -ForegroundColor Yellow
        $javaHome = Read-Host "JAVA_HOME 경로"
    }
} else {
    Write-Host "❌ Java가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "JDK를 설치하세요: https://adoptium.net/" -ForegroundColor Yellow
    $javaHome = Read-Host "JAVA_HOME 경로 (선택사항)"
}

# 환경 변수 설정
Write-Host ""
Write-Host "📝 환경 변수 설정 중..." -ForegroundColor Yellow

# 사용자 환경 변수에 설정
try {
    # ANDROID_HOME
    [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")
    Write-Host "✓ ANDROID_HOME 설정: $androidHome" -ForegroundColor Green
    
    # ANDROID_SDK_ROOT (호환성을 위해)
    [System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidHome, "User")
    Write-Host "✓ ANDROID_SDK_ROOT 설정: $androidHome" -ForegroundColor Green
    
    # JAVA_HOME
    if ($javaHome) {
        [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
        Write-Host "✓ JAVA_HOME 설정: $javaHome" -ForegroundColor Green
    }
    
    # PATH에 Android 도구 추가
    $currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $pathsToAdd = @(
        "$androidHome\platform-tools",
        "$androidHome\tools",
        "$androidHome\tools\bin",
        "$androidHome\emulator"
    )
    
    $newPath = $currentPath
    foreach ($path in $pathsToAdd) {
        if (Test-Path $path) {
            if ($newPath -notlike "*$path*") {
                $newPath = "$newPath;$path"
                Write-Host "✓ PATH에 추가: $path" -ForegroundColor Green
            }
        }
    }
    
    if ($javaHome -and (Test-Path "$javaHome\bin")) {
        if ($newPath -notlike "*$javaHome\bin*") {
            $newPath = "$javaHome\bin;$newPath"
            Write-Host "✓ PATH에 추가: $javaHome\bin" -ForegroundColor Green
        }
    }
    
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    
    Write-Host ""
    Write-Host "✅ 환경 변수 설정 완료!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  중요:" -ForegroundColor Yellow
    Write-Host "  - 새 PowerShell 창을 열어야 환경 변수가 적용됩니다." -ForegroundColor White
    Write-Host "  - 또는 현재 세션에서 다음 명령 실행:" -ForegroundColor White
    Write-Host "    `$env:ANDROID_HOME='$androidHome'" -ForegroundColor Cyan
    if ($javaHome) {
        Write-Host "    `$env:JAVA_HOME='$javaHome'" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ 환경 변수 설정 실패: $_" -ForegroundColor Red
    Write-Host "관리자 권한으로 실행하거나 수동으로 설정하세요." -ForegroundColor Yellow
    exit 1
}

# 현재 세션에도 적용
$env:ANDROID_HOME = $androidHome
$env:ANDROID_SDK_ROOT = $androidHome
if ($javaHome) {
    $env:JAVA_HOME = $javaHome
}

Write-Host ""
Write-Host "🎉 설정 완료! 다음 단계:" -ForegroundColor Green
Write-Host "  1. 새 PowerShell 창을 엽니다" -ForegroundColor White
Write-Host "  2. Android 프로젝트 초기화: .\scripts\init-android.ps1" -ForegroundColor Cyan
Write-Host "  3. 앱 빌드: .\scripts\build-android.ps1" -ForegroundColor Cyan

