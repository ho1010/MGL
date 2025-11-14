# 모바일 앱 설정 가이드

이 문서는 Management GL 앱을 모바일 앱으로 빌드하고 배포하는 방법을 안내합니다.

## 🎯 빠른 시작

### 1단계: 프로젝트 초기화

```bash
# 의존성 설치
npm install

# Android 프로젝트 생성 (Android 폴더가 없는 경우)
npx react-native init ManagementGL --template react-native-template-typescript
```

### 2단계: Android 앱 빌드

```bash
# 개발 빌드
npm run android

# 또는 Release APK 빌드
npm run build:android
```

### 3단계: iOS 앱 빌드 (macOS만)

```bash
# iOS 의존성 설치
cd ios && pod install && cd ..

# 개발 빌드
npm run ios
```

## 📱 Android 앱 빌드 상세 가이드

### 필수 요구사항

1. **Java Development Kit (JDK)**
   ```bash
   # JDK 11 이상 설치 확인
   java -version
   ```

2. **Android Studio 설치**
   - [Android Studio 다운로드](https://developer.android.com/studio)
   - Android SDK 설치 (API Level 21 이상)

3. **환경 변수 설정**

   Windows:
   ```powershell
   # 시스템 환경 변수에 추가
   ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
   JAVA_HOME=C:\Program Files\Java\jdk-11
   ```

   macOS/Linux:
   ```bash
   # ~/.bashrc 또는 ~/.zshrc에 추가
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.jdk/Contents/Home
   ```

### Android 프로젝트 생성

Android 폴더가 없는 경우:

```bash
# 방법 1: React Native CLI 사용
npx react-native init ManagementGL --template react-native-template-typescript

# 방법 2: 수동 생성 (고급)
npx @react-native-community/cli init --skip-install
```

### APK 빌드

**Debug APK (테스트용):**
```bash
cd android
./gradlew assembleDebug
```

빌드된 APK: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (배포용):**

1. 서명 키 생성:
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. `android/gradle.properties`에 추가:
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your-password
MYAPP_RELEASE_KEY_PASSWORD=your-password
```

3. Release APK 빌드:
```bash
cd android
./gradlew assembleRelease
```

빌드된 APK: `android/app/build/outputs/apk/release/app-release.apk`

## 🍎 iOS 앱 빌드 상세 가이드

### 필수 요구사항

1. **macOS 12 이상**
2. **Xcode 14 이상**
   - [App Store에서 다운로드](https://apps.apple.com/app/xcode/id497799835)

3. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

### iOS 프로젝트 설정

```bash
# iOS 의존성 설치
cd ios
pod install
cd ..
```

### iOS 앱 빌드

**시뮬레이터에서 실행:**
```bash
npm run ios
```

**실제 기기에서 실행:**
1. Xcode에서 프로젝트 열기:
   ```bash
   open ios/ManagementGL.xcworkspace
   ```

2. 서명 설정:
   - 프로젝트 선택 → Signing & Capabilities
   - Team 선택 (Apple Developer 계정 필요)
   - Bundle Identifier 설정

3. 기기 선택 후 실행

**Archive 생성 (배포용):**
```bash
npm run build:ios
```

또는 Xcode에서:
- Product → Archive
- Archive 완료 후 Distribute App

## 🔐 앱 서명 및 보안

### Android 서명

서명 키는 안전하게 보관하세요:
- 키를 잃어버리면 앱 업데이트 불가
- 키 파일을 버전 관리에 포함하지 마세요
- `.gitignore`에 추가:
  ```
  *.keystore
  *.jks
  ```

### iOS 서명

- Apple Developer 계정 필요 ($99/년)
- Xcode에서 자동 서명 사용 권장
- 프로비저닝 프로파일 자동 관리

## 📦 앱 정보 설정

### 앱 이름 변경

**Android:**
`android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">혈당 관리</string>
</resources>
```

**iOS:**
`ios/ManagementGL/Info.plist`:
```xml
<key>CFBundleDisplayName</key>
<string>혈당 관리</string>
```

### 앱 아이콘 설정

**Android:**
- `android/app/src/main/res/mipmap-*/ic_launcher.png` 교체
- 다양한 해상도 제공 (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)

**iOS:**
- Xcode에서 Assets.xcassets → AppIcon 설정
- 다양한 크기 제공 (20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt)

### 버전 관리

**package.json:**
```json
{
  "version": "1.0.0"
}
```

**Android:**
`android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
    }
}
```

**iOS:**
Xcode에서 Version 및 Build 번호 설정

## 🚀 배포 준비

### Google Play Store

1. **Google Play Console 계정 생성**
2. **앱 등록**
3. **AAB 파일 업로드**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
4. **스토어 리스팅 작성**
5. **심사 제출**

### App Store

1. **App Store Connect 계정 생성**
2. **앱 등록**
3. **Archive 업로드** (Xcode 또는 Transporter)
4. **앱 정보 입력**
5. **심사 제출**

## 🧪 테스트

### Android 테스트

```bash
# APK 설치
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 로그 확인
adb logcat | grep ReactNativeJS
```

### iOS 테스트

- Xcode에서 시뮬레이터 또는 실제 기기 선택
- TestFlight 사용 (베타 테스트)

## 📝 체크리스트

빌드 전 확인:

- [ ] 모든 의존성 설치 완료
- [ ] 환경 변수 설정 완료
- [ ] 앱 아이콘 설정
- [ ] 앱 이름 설정
- [ ] 버전 번호 설정
- [ ] 권한 설정 (AndroidManifest.xml, Info.plist)
- [ ] API 키 설정
- [ ] 테스트 완료

## 🔧 문제 해결

### Android 빌드 오류

**Gradle 오류:**
```bash
cd android
./gradlew clean
./gradlew --refresh-dependencies
```

**메타데이터 오류:**
- `AndroidManifest.xml` 확인
- 패키지 이름 일치 확인

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

## 📞 추가 도움말

- [React Native 공식 문서](https://reactnative.dev/docs/getting-started)
- [Android 개발자 가이드](https://developer.android.com/)
- [iOS 개발자 가이드](https://developer.apple.com/ios/)

