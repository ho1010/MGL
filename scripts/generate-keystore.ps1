# Android 앱 서명 키 생성 스크립트 (PowerShell)

Write-Host "🔐 Android 앱 서명 키 생성" -ForegroundColor Green
Write-Host ""

# 키 저장소 정보 입력
$keystoreFile = "my-release-key.keystore"
$keyAlias = "my-key-alias"

Write-Host "서명 키 정보를 입력하세요:" -ForegroundColor Yellow
Write-Host "(비밀번호는 화면에 표시되지 않습니다)" -ForegroundColor Gray
Write-Host ""

# 키 저장소 비밀번호
$storePassword = Read-Host "키 저장소 비밀번호 (입력)" -AsSecureString
$storePasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePassword)
)

$keyPassword = Read-Host "키 비밀번호 (입력 - 비워두면 저장소 비밀번호와 동일)" -AsSecureString
if ($keyPassword.Length -eq 0) {
    $keyPasswordText = $storePasswordText
} else {
    $keyPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassword)
    )
}

# 사용자 정보
Write-Host ""
Write-Host "개인 정보를 입력하세요 (예시 값이 제공됩니다):" -ForegroundColor Yellow
$firstName = Read-Host "이름" -Default "Management"
$lastName = Read-Host "성" -Default "GL"
$organizationalUnit = Read-Host "조직 단위" -Default "Development"
$organization = Read-Host "조직" -Default "ManagementGL"
$city = Read-Host "도시" -Default "Seoul"
$state = Read-Host "시/도" -Default "Seoul"
$countryCode = Read-Host "국가 코드 (2자리)" -Default "KR"

$dname = "CN=$firstName $lastName, OU=$organizationalUnit, O=$organization, L=$city, ST=$state, C=$countryCode"

# 키 저장소 생성 경로
$keystorePath = "android\app\$keystoreFile"

# 기존 키 확인
if (Test-Path $keystorePath) {
    Write-Host ""
    Write-Host "⚠️  기존 키 저장소가 있습니다: $keystorePath" -ForegroundColor Yellow
    $overwrite = Read-Host "덮어쓰시겠습니까? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "취소되었습니다." -ForegroundColor Yellow
        exit 0
    }
}

# keytool 명령 실행
Write-Host ""
Write-Host "🔑 키 저장소 생성 중..." -ForegroundColor Yellow

$keytoolArgs = @(
    "-genkeypair",
    "-v",
    "-storetype", "PKCS12",
    "-keystore", $keystorePath,
    "-alias", $keyAlias,
    "-keyalg", "RSA",
    "-keysize", "2048",
    "-validity", "10000",
    "-storepass", $storePasswordText,
    "-keypass", $keyPasswordText,
    "-dname", $dname
)

& keytool $keytoolArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 키 저장소 생성 완료!" -ForegroundColor Green
    Write-Host "  위치: $keystorePath" -ForegroundColor White
    
    # gradle.properties 설정
    Write-Host ""
    Write-Host "📝 gradle.properties 설정 중..." -ForegroundColor Yellow
    
    $gradlePropsPath = "android\gradle.properties"
    $gradleProps = Get-Content $gradlePropsPath -ErrorAction SilentlyContinue
    
    # 기존 설정 제거
    $gradleProps = $gradleProps | Where-Object {
        $_ -notmatch "MYAPP_RELEASE_STORE_FILE" -and
        $_ -notmatch "MYAPP_RELEASE_KEY_ALIAS" -and
        $_ -notmatch "MYAPP_RELEASE_STORE_PASSWORD" -and
        $_ -notmatch "MYAPP_RELEASE_KEY_PASSWORD"
    }
    
    # 새 설정 추가
    $gradleProps += ""
    $gradleProps += "# 앱 서명 설정"
    $gradleProps += "MYAPP_RELEASE_STORE_FILE=$keystoreFile"
    $gradleProps += "MYAPP_RELEASE_KEY_ALIAS=$keyAlias"
    $gradleProps += "MYAPP_RELEASE_STORE_PASSWORD=$storePasswordText"
    $gradleProps += "MYAPP_RELEASE_KEY_PASSWORD=$keyPasswordText"
    
    Set-Content -Path $gradlePropsPath -Value $gradleProps -Encoding UTF8
    
    Write-Host "✅ gradle.properties 설정 완료!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "⚠️  중요:" -ForegroundColor Yellow
    Write-Host "  - 키 저장소 파일과 비밀번호를 안전하게 보관하세요" -ForegroundColor White
    Write-Host "  - 키를 잃어버리면 앱 업데이트가 불가능합니다" -ForegroundColor White
    Write-Host "  - 키 파일을 버전 관리에 포함하지 마세요" -ForegroundColor White
    
    # .gitignore 확인
    $gitignorePath = ".gitignore"
    if (Test-Path $gitignorePath) {
        $gitignore = Get-Content $gitignorePath -ErrorAction SilentlyContinue
        if ($gitignore -notcontains "*.keystore" -and $gitignore -notcontains "*release-key.keystore") {
            Add-Content -Path $gitignorePath -Value "`n# Android signing keys`n*.keystore`n*release-key.keystore"
            Write-Host "✅ .gitignore에 키 파일 추가됨" -ForegroundColor Green
        }
    }
    
} else {
    Write-Host ""
    Write-Host "❌ 키 저장소 생성 실패" -ForegroundColor Red
    exit 1
}

