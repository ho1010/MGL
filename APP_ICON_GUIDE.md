# 🎨 앱 아이콘 설정 가이드

이 가이드는 Management GL 앱의 아이콘을 설정하는 방법을 안내합니다.

## 📱 Android 아이콘

### 필요한 크기

Android는 다양한 해상도의 아이콘을 요구합니다:

| 밀도 | 해상도 | 경로 |
|------|--------|------|
| mdpi | 48x48 | `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` |
| hdpi | 72x72 | `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` |
| xhdpi | 96x96 | `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` |
| xxhdpi | 144x144 | `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` |
| xxxhdpi | 192x192 | `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` |

### 아이콘 생성 방법

#### 방법 1: 온라인 도구 사용 (권장)

1. **Android Asset Studio**
   - https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
   - 1024x1024 아이콘 업로드
   - 모든 크기 자동 생성 및 다운로드

2. **App Icon Generator**
   - https://appicon.co/
   - 다양한 플랫폼 지원
   - 한 번에 모든 크기 생성

#### 방법 2: 수동 생성

원본 아이콘 (1024x1024)을 준비한 후:

```powershell
# ImageMagick이 설치되어 있다면
# 각 크기별로 리사이즈
magick convert icon-1024.png -resize 48x48 android\app\src\main\res\mipmap-mdpi\ic_launcher.png
magick convert icon-1024.png -resize 72x72 android\app\src\main\res\mipmap-hdpi\ic_launcher.png
magick convert icon-1024.png -resize 96x96 android\app\src\main\res\mipmap-xhdpi\ic_launcher.png
magick convert icon-1024.png -resize 144x144 android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png
magick convert icon-1024.png -resize 192x192 android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png
```

### 아이콘 파일 교체

1. 원하는 크기의 아이콘 이미지 준비
2. 각 해상도 폴더에 `ic_launcher.png` 파일 교체
3. Adaptive Icon도 교체 (Android 8.0+):
   - `ic_launcher_foreground.png` (포그라운드)
   - `ic_launcher_background.png` (백그라운드)

### 아이콘 디자인 가이드

- **형식**: PNG (투명도 지원)
- **모양**: 정사각형 (안드로이드가 자동으로 둥글게 처리)
- **여백**: 중요한 내용은 중앙에 배치 (최소 20% 여백)
- **배경**: 단색 또는 그라데이션 권장
- **심플함**: 작은 크기에서도 명확하게 보여야 함

## 🍎 iOS 아이콘 (선택사항)

### 필요한 크기

| 용도 | 크기 | 파일명 |
|------|------|--------|
| App Store | 1024x1024 | `AppIcon-1024.png` |
| iPhone | 60x60, 120x120, 180x180 | Assets.xcassets에서 설정 |
| iPad | 76x76, 152x152 | Assets.xcassets에서 설정 |

### Xcode에서 설정

1. Xcode에서 프로젝트 열기:
   ```bash
   open ios/ManagementGL.xcworkspace
   ```

2. Assets.xcassets → AppIcon 선택
3. 각 크기의 슬롯에 아이콘 드래그 앤 드롭

## 🎨 아이콘 디자인 아이디어

### 테마 제안

1. **혈당 관리 테마**
   - 혈당 측정기 이미지
   - 건강한 음식 아이콘
   - 하트 + 체크마크 조합

2. **심플한 디자인**
   - "GL" 텍스트 로고
   - 그라데이션 배경
   - 모던한 색상 팔레트

3. **의료 테마**
   - 스타일리시한 의료 심볼
   - 깔끔한 라인 아트
   - 신뢰감 있는 색상

## 🛠️ 아이콘 생성 도구

### 온라인 도구

- **Android Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/
- **App Icon Generator**: https://appicon.co/
- **Icon Kitchen**: https://icon.kitchen/
- **MakeAppIcon**: https://makeappicon.com/

### 데스크톱 도구

- **ImageMagick**: 이미지 변환 및 리사이즈
- **GIMP**: 무료 이미지 편집기
- **Photoshop**: 전문 이미지 편집
- **Sketch/Figma**: 벡터 아이콘 디자인

## 📝 체크리스트

아이콘 설정 완료 확인:

- [ ] 모든 해상도 아이콘 생성 (mdpi ~ xxxhdpi)
- [ ] 아이콘 파일을 올바른 폴더에 배치
- [ ] Adaptive Icon 설정 (Android 8.0+)
- [ ] 아이콘이 작은 크기에서도 명확함
- [ ] 투명도가 올바르게 처리됨
- [ ] 배경색이 적절함
- [ ] 앱 이름과 일치하는 디자인

## 🚀 빠른 설정

기본 아이콘을 사용하려면:

1. 온라인 아이콘 생성 도구 사용
2. 원하는 이미지 또는 텍스트 입력
3. 생성된 아이콘 다운로드
4. Android 폴더에 복사

예시:
```powershell
# 아이콘 파일이 있는 경우
# Android Asset Studio에서 다운로드한 zip 파일을 압축 해제
# 각 폴더의 아이콘을 android/app/src/main/res/mipmap-*/ 폴더에 복사
```

## 💡 팁

1. **일관성**: 앱 내부 UI와 아이콘 스타일 일관성 유지
2. **테스트**: 다양한 배경에서 아이콘이 잘 보이는지 확인
3. **업데이트**: 앱 업데이트 시 아이콘도 함께 업데이트 고려
4. **브랜딩**: 회사나 서비스의 브랜드 색상 활용

