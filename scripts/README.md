# 📜 스크립트 사용 가이드

이 폴더에는 모바일 앱 배포를 위한 PowerShell 스크립트들이 포함되어 있습니다.

## 📋 스크립트 목록

### 1. `setup-android-env.ps1`
**목적**: Android 개발 환경 변수 자동 설정

**사용법:**
```powershell
.\scripts\setup-android-env.ps1
```

**기능:**
- Android SDK 경로 자동 감지
- Java JDK 경로 자동 감지
- 환경 변수 설정 (ANDROID_HOME, JAVA_HOME)
- PATH에 Android 도구 추가

**주의:** 새 PowerShell 창을 열어야 환경 변수가 적용됩니다.

---

### 2. `init-android.ps1`
**목적**: Android 네이티브 프로젝트 초기화

**사용법:**
```powershell
.\scripts\init-android.ps1
```

**기능:**
- Android 폴더 생성
- React Native 네이티브 프로젝트 구조 생성
- 기본 설정 파일 생성
- 앱 이름 설정

**주의:** 이미 `android` 폴더가 있으면 백업 후 덮어씁니다.

---

### 3. `build-android.ps1`
**목적**: Android APK 빌드

**사용법:**
```powershell
# Debug 빌드
.\scripts\build-android.ps1 -BuildType debug

# Release 빌드
.\scripts\build-android.ps1 -BuildType release
```

**기능:**
- 환경 확인 (Java, Android SDK)
- Clean 빌드
- Debug 또는 Release APK 빌드
- 빌드 결과 정보 출력
- `builds\` 폴더에 복사본 생성

**출력:**
- Debug: `android\app\build\outputs\apk\debug\app-debug.apk`
- Release: `android\app\build\outputs\apk\release\app-release.apk`

---

### 4. `generate-keystore.ps1`
**목적**: Android 앱 서명 키 생성

**사용법:**
```powershell
.\scripts\generate-keystore.ps1
```

**기능:**
- 서명 키 저장소 생성
- 키 비밀번호 설정
- gradle.properties에 서명 정보 자동 설정
- .gitignore에 키 파일 추가

**주의:**
- 생성된 키와 비밀번호를 안전하게 보관하세요
- 키를 잃어버리면 앱 업데이트 불가능

---

## 🚀 사용 순서

### 처음 시작하는 경우

1. **환경 설정**
   ```powershell
   .\scripts\setup-android-env.ps1
   ```

2. **프로젝트 초기화**
   ```powershell
   .\scripts\init-android.ps1
   ```

3. **의존성 설치**
   ```powershell
   npm install
   ```

4. **테스트 빌드**
   ```powershell
   .\scripts\build-android.ps1 -BuildType debug
   ```

### Release 빌드

1. **서명 키 생성** (최초 1회)
   ```powershell
   .\scripts\generate-keystore.ps1
   ```

2. **Release 빌드**
   ```powershell
   .\scripts\build-android.ps1 -BuildType release
   ```

## ⚠️ 주의사항

### 권한 문제

일부 스크립트는 관리자 권한이 필요할 수 있습니다:
- 환경 변수 설정 시
- 시스템 경로 수정 시

### 실행 정책

PowerShell 실행 정책 오류가 발생하면:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 경로 문제

- 모든 스크립트는 프로젝트 루트에서 실행하세요
- 경로에 공백이나 특수문자가 있으면 문제가 발생할 수 있습니다

## 🔧 문제 해결

### 스크립트가 실행되지 않음

```powershell
# 실행 정책 확인
Get-ExecutionPolicy

# 실행 정책 변경 (필요시)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 환경 변수가 적용되지 않음

1. **새 PowerShell 창 열기**
2. **또는 현재 세션에서:**
   ```powershell
   $env:ANDROID_HOME = "C:\Users\Seol\AppData\Local\Android\Sdk"
   ```

### 빌드 실패

- Android Studio에서 프로젝트 열기
- Gradle 동기화
- 오류 메시지 확인

## 📞 도움말

더 자세한 내용은:
- `모바일_배포_완료_가이드.md`
- `빠른_배포_가이드.md`
- `DEPLOYMENT_GUIDE.md`

