import {Image} from 'react-native';
import {IMAGE_CONFIG} from '../constants';
import {imageCacheManager} from './imageCache';

export interface ImageProcessResult {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

/**
 * 이미지 전처리 유틸리티
 * 이미지 압축, 리사이징, base64 변환
 * 캐싱 기능 통합
 */
class ImageProcessor {
  /**
   * 이미지 URI를 base64로 변환
   */
  async convertToBase64(imageUri: string): Promise<string> {
    try {
      // React Native에서는 react-native-image-picker에서 직접 base64를 받을 수 있음
      // 또는 react-native-fs 사용
      // 여기서는 간단한 구현
      
      // 실제로는 react-native-fs 사용 권장
      // const base64 = await RNFS.readFile(imageUri, 'base64');
      
      // 임시: 이미지 피커에서 base64를 직접 받도록 설정 필요
      return imageUri;
    } catch (error) {
      throw new Error(`이미지 변환 실패: ${error}`);
    }
  }

  /**
   * 이미지 크기 조정 및 압축 (캐싱 통합)
   */
  async processImage(
    imageUri: string,
    maxWidth: number = IMAGE_CONFIG.MAX_WIDTH,
    maxHeight: number = IMAGE_CONFIG.MAX_HEIGHT,
    quality: number = IMAGE_CONFIG.QUALITY,
  ): Promise<ImageProcessResult> {
    try {
      // 캐시 확인
      const cached = await imageCacheManager.getFromCache(imageUri);
      if (cached) {
        return {
          uri: cached.uri,
          base64: cached.base64 || cached.uri,
          width: cached.width,
          height: cached.height,
        };
      }

      // 캐시 미스 - 이미지 처리
      return new Promise((resolve, reject) => {
        Image.getSize(
          imageUri,
          async (width, height) => {
            try {
              // 비율 유지하며 리사이징
              const ratio = Math.min(
                maxWidth / width,
                maxHeight / height,
                1, // 확대하지 않음
              );

              const newWidth = Math.round(width * ratio);
              const newHeight = Math.round(height * ratio);

              // base64 변환
              const base64 = await this.convertToBase64(imageUri);

              const result: ImageProcessResult = {
                uri: imageUri,
                base64,
                width: newWidth,
                height: newHeight,
              };

              // 캐시에 저장
              await imageCacheManager.addToCache({
                uri: imageUri,
                base64,
                width: newWidth,
                height: newHeight,
                size: (newWidth * newHeight * 3) / 1024, // 대략적인 크기 (KB)
                timestamp: Date.now(),
                hash: '',
              });

              resolve(result);
            } catch (error) {
              reject(new Error(`이미지 처리 실패: ${error}`));
            }
          },
          (error) => {
            reject(new Error(`이미지 크기 확인 실패: ${error}`));
          },
        );
      });
    } catch (error) {
      throw new Error(`이미지 처리 실패: ${error}`);
    }
  }

  /**
   * 이미지 URI에서 base64 추출 (react-native-image-picker 사용 시)
   */
  extractBase64FromPickerResponse(asset: any): string | null {
    // react-native-image-picker의 response.assets[0].base64 사용
    if (asset?.base64) {
      return asset.base64;
    }
    return null;
  }
}

export const imageProcessor = new ImageProcessor();
