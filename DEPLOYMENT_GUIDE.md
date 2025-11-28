# 📱 모바일 앱 배포 가이드

이 가이드는 Management GL 앱을 Android 및 iOS 앱 스토어에 배포하는 전체 프로세스를 안내합니다.

## 🎯 빠른 시작

### 1단계: Android 프로젝트 초기화

```powershell
# Android 프로젝트 생성
.\scripts\init-android.ps1
```

### 2단계: 앱 빌드

```powershell
# Debug 빌드 (테스트용)
.\scripts\build-android.ps1 -BuildType debug

# Release 빌드 (배포용)
.\scripts\build-android.ps1 -BuildType release
```

### 3단계: APK 설치 및 테스트

```powershell
# USB로 연결된 기기에 설치
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

## 📋 사전 요구사항

### 필수 도구

1. **Node.js 18 이상**
   ```powershell
   node -v  # 버전 확인
   ```

2. **Java Development Kit (JDK) 11 이상**
   ```powershell
   java -version  # 버전 확인
   ```
   - 다운로드: [Adoptium](https://adoptium.net/)

3. **Android Studio**
   - 다운로드: [Android Studio](https://developer.android.com/studio)
   - Android SDK (API Level 21 이상) 설치

4. **환경 변수 설정**

   PowerShell에서:
   ```powershell
   # 시스템 환경 변수에 추가 (영구 설정)
   [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\YourName\AppData\Local\Android\Sdk", "User")
   [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-11", "User")
   
   # PATH에 추가
   $currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
   $newPath = "$currentPath;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
   [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
   ```

   또는 시스템 설정에서:
   - 설정 → 시스템 → 정보 → 고급 시스템 설정 → 환경 변수

### iOS (macOS만)

1. **Xcode 14 이상**
2. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```
3. **Apple Developer 계정** ($99/년)

## 🚀 배포 프로세스

### Android 배포

#### 1. 프로젝트 초기화

```powershell
# Android 프로젝트 생성
.\scripts\init-android.ps1
```

이 스크립트는:
- React Native Android 프로젝트 생성
- 필요한 폴더 구조 생성
- 기본 설정 파일 생성

#### 2. 앱 정보 설정

**앱 이름 설정:**
`android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">혈당 관리</string>
</resources>
```

**패키지 이름 설정:**
`android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "com.managementgl.app"
        versionCode 1
        versionName "1.0.0"
        // ...
    }
}
```

**최소 SDK 버전:**
```gradle
android {
    defaultConfig {
        minSdkVersion 21  // Android 5.0 이상
        targetSdkVersion 33
        // ...
    }
}
```

#### 3. 권한 설정

`android/app/src/main/AndroidManifest.xml`:
```xml
<manifest>
    <!-- 카메라 권한 -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    
    <!-- 인터넷 권한 -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- 저장소 권한 -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28" />
    
    <!-- 알림 권한 (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <application>
        <!-- 앱 내용 -->
    </application>
</manifest>
```

#### 4. 서명 키 생성 (Release 빌드용)

```powershell
.\scripts\generate-keystore.ps1
```

이 스크립트는:
- 서명 키 저장소 생성
- gradle.properties에 서명 정보 설정
- .gitignore에 키 파일 추가

**중요:** 서명 키를 안전하게 보관하세요. 키를 잃어버리면 앱 업데이트가 불가능합니다.

#### 5. Release APK 빌드

```powershell
# 서명 키를 생성한 후
.\scripts\build-android.ps1 -BuildType release
```

빌드된 APK 위치:
```
android/app/build/outputs/apk/release/app-release.apk
```

#### 6. AAB (Android App Bundle) 빌드

Google Play Store 배포에는 AAB 형식이 필요합니다:

```powershell
cd android
.\gradlew.bat bundleRelease
cd ..
```

빌드된 AAB 위치:
```
android/app/build/outputs/bundle/release/app-release.aab
```

#### 7. Google Play Store 제출

1. **Google Play Console 계정 생성**
   - [Google Play Console](https://play.google.com/console) 접속
   - 개발자 등록 ($25 일회성)

2. **앱 등록**
   - 새 앱 만들기
   - 앱 이름, 기본 언어 선택
   - 앱 액세스 권한 설정

3. **스토어 등록 정보 작성**
   - 앱 설명
   - 스크린샷 (최소 2개, 권장 8개)
   - 고해상도 아이콘 (512x512)
   - 기능 그래픽 (1024x500)
   - 개인정보처리방침 URL

4. **앱 콘텐츠 등급**
   - 설문 작성
   - 콘텐츠 등급 확인

5. **가격 및 배포**
   - 국가 선택
   - 가격 설정 (무료/유료)

6. **AAB 업로드**
   - 프로덕션 → 새 버전 만들기
   - AAB 파일 업로드
   - 출시 노트 작성

7. **심사 제출**
   - 검토를 위해 제출

### iOS 배포 (macOS만)

#### 1. 프로젝트 초기화

```bash
cd ios
pod install
cd ..
```

#### 2. Xcode 설정

```bash
open ios/ManagementGL.xcworkspace
```

**서명 설정:**
- 프로젝트 선택 → Signing & Capabilities
- Team 선택 (Apple Developer 계정)
- Bundle Identifier 설정 (예: `com.managementgl.app`)

#### 3. Archive 생성

```bash
npm run build:ios
```

또는 Xcode에서:
- Product → Archive
- Archive 완료 후 Distribute App

#### 4. App Store Connect 설정

1. **App Store Connect 계정**
   - [App Store Connect](https://appstoreconnect.apple.com) 접속
   - Apple Developer 계정 필요 ($99/년)

2. **앱 등록**
   - 내 앱 → + 버튼
   - 앱 정보 입력
   - Bundle ID 선택

3. **앱 정보 입력**
   - 이름, 부제목
   - 카테고리
   - 가격 및 가용성
   - 개인정보처리방침 URL

4. **스크린샷 및 미리보기**
   - 다양한 디바이스 크기
   - 앱 미리보기 비디오 (선택)

#### 5. Archive 업로드

Xcode에서:
- Archive Organizer 열기
- Archive 선택 → Distribute App
- App Store Connect 선택
- 업로드

#### 6. 심사 제출

App Store Connect에서:
- 빌드 선택
- 심사를 위해 제출
- 심사 정보 작성

## 🔧 빌드 설정

### 버전 관리

**package.json:**
```json
{
  "version": "1.0.0"
}
```

**Android (build.gradle):**
```gradle
android {
    defaultConfig {
        versionCode 1        // 정수 (증가만 가능)
        versionName "1.0.0"  // 사용자에게 표시되는 버전
    }
}
```

**iOS (Info.plist 또는 Xcode):**
- Version: 1.0.0
- Build: 1

### 앱 아이콘

#### Android

다양한 해상도 제공:
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

**아이콘 생성 도구:**
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
- [App Icon Generator](https://appicon.co/)

#### iOS

Xcode에서:
- Assets.xcassets → AppIcon
- 다양한 크기:
  - 20pt (20x20, 40x40, 60x60)
  - 29pt (29x29, 58x58, 87x87)
  - 40pt (40x40, 80x80, 120x120)
  - 60pt (60x60, 120x120, 180x180)
  - 1024x1024 (App Store)

### 스플래시 스크린

Android와 iOS 모두에서 설정 가능합니다. 자세한 내용은 각 플랫폼 문서를 참조하세요.

## 📝 체크리스트

### 빌드 전

- [ ] 모든 의존성 설치 완료 (`npm install`)
- [ ] 환경 변수 설정 완료 (ANDROID_HOME, JAVA_HOME)
- [ ] 앱 이름 설정 완료
- [ ] 버전 번호 설정 완료
- [ ] 앱 아이콘 설정 완료
- [ ] 권한 설정 확인 (AndroidManifest.xml, Info.plist)
- [ ] API 키 설정 완료 (.env 또는 설정 파일)
- [ ] 테스트 완료

### 배포 전

- [ ] 앱 스토어 계정 생성 완료
- [ ] 스토어 등록 정보 작성 완료
- [ ] 스크린샷 준비 완료
- [ ] 개인정보처리방침 작성 완료
- [ ] 앱 콘텐츠 등급 확인 완료
- [ ] 서명 키 백업 완료 (Android)
- [ ] 최종 테스트 완료

## 🐛 문제 해결

### Android 빌드 오류

**Gradle 오류:**
```powershell
cd android
.\gradlew.bat clean
.\gradlew.bat --refresh-dependencies
```

**메모리 부족 오류:**
`android/gradle.properties`에 추가:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

**서명 오류:**
- gradle.properties에서 서명 정보 확인
- 키 저장소 파일 경로 확인
- 비밀번호 확인

### iOS 빌드 오류

**Pod 오류:**
```bash
cd ios
pod deintegrate
pod install
```

**서명 오류:**
- Xcode에서 Signing & Capabilities 확인
- Bundle Identifier 고유성 확인
- Apple Developer 계정 연결 확인

## 📊 빌드 산출물

### Android

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

### iOS

- **Archive**: Xcode Organizer에서 관리
- **IPA**: Archive에서 Export

## 🔐 보안 체크리스트

- [ ] API 키를 코드에 하드코딩하지 않음
- [ ] 서명 키를 버전 관리에 포함하지 않음
- [ ] 민감한 정보는 환경 변수 사용
- [ ] ProGuard/R8 활성화 (Android Release)
- [ ] 코드 난독화 고려

## 📞 추가 리소스

- [React Native 공식 문서](https://reactnative.dev/docs/getting-started)
- [Android 개발자 가이드](https://developer.android.com/)
- [iOS 개발자 가이드](https://developer.apple.com/ios/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)

## 🎉 다음 단계

배포 후:
1. 사용자 피드백 수집
2. 크래시 리포팅 설정 (Firebase Crashlytics 등)
3. 앱 분석 설정 (Google Analytics, Firebase Analytics)
4. 업데이트 계획 수립

