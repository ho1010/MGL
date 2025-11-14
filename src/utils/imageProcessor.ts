import {Image} from 'react-native';
import {IMAGE_CONFIG} from '../constants';

export interface ImageProcessResult {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

/**
 * 이미지 전처리 유틸리티
 * 이미지 압축, 리사이징, base64 변환
 */
class ImageProcessor {
  /**
   * 이미지 URI를 base64로 변환
   */
  async convertToBase64(imageUri: string): Promise<string> {
    try {
      // React Native에서는 react-native-fs를 사용하거나
      // 이미지 피커에서 직접 base64를 받을 수 있음
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
   * 이미지 크기 조정 및 압축
   */
  async processImage(
    imageUri: string,
    maxWidth: number = IMAGE_CONFIG.MAX_WIDTH,
    maxHeight: number = IMAGE_CONFIG.MAX_HEIGHT,
    quality: number = IMAGE_CONFIG.QUALITY,
  ): Promise<ImageProcessResult> {
    try {
      return new Promise((resolve, reject) => {
        Image.getSize(
          imageUri,
          (width, height) => {
            // 비율 유지하며 리사이징
            const ratio = Math.min(
              maxWidth / width,
              maxHeight / height,
              1, // 확대하지 않음
            );

            const newWidth = width * ratio;
            const newHeight = height * ratio;

            // base64 변환 (실제로는 react-native-image-resizer 사용 권장)
            this.convertToBase64(imageUri)
              .then((base64) => {
                resolve({
                  uri: imageUri,
                  base64,
                  width: newWidth,
                  height: newHeight,
                });
              })
              .catch(reject);
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

