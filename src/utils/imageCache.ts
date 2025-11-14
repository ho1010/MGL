/**
 * 이미지 캐싱 및 압축 유틸리티
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Image} from 'react-native';
import {IMAGE_CONFIG} from '../constants';

const IMAGE_CACHE_KEY = '@image_cache';
const MAX_CACHE_SIZE = 50; // 최대 캐시 이미지 수
const CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7일

interface CachedImage {
  uri: string;
  compressedUri?: string;
  base64?: string;
  width: number;
  height: number;
  size: number; // 파일 크기 (bytes)
  timestamp: number;
  hash: string; // 이미지 해시 (중복 방지)
}

interface ImageCache {
  images: CachedImage[];
  totalSize: number; // 총 캐시 크기 (bytes)
}

/**
 * 이미지 해시 생성 (간단한 구현)
 */
function generateImageHash(uri: string): string {
  // 실제로는 더 정교한 해시 알고리즘 사용 권장
  return uri.split('').reduce((acc, char) => {
    const hash = ((acc << 5) - acc) + char.charCodeAt(0);
    return hash & hash;
  }, 0).toString(36);
}

/**
 * 이미지 캐시 관리 클래스
 */
class ImageCacheManager {
  private cache: ImageCache = {
    images: [],
    totalSize: 0,
  };

  /**
   * 캐시 초기화
   */
  async initialize(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
      if (cached) {
        this.cache = JSON.parse(cached);
        // 만료된 이미지 제거
        await this.cleanExpiredImages();
      }
    } catch (error) {
      console.error('이미지 캐시 초기화 오류:', error);
    }
  }

  /**
   * 만료된 이미지 제거
   */
  private async cleanExpiredImages(): Promise<void> {
    const now = Date.now();
    this.cache.images = this.cache.images.filter(
      (img) => now - img.timestamp < CACHE_EXPIRY_TIME,
    );
    this.cache.totalSize = this.cache.images.reduce(
      (sum, img) => sum + img.size,
      0,
    );
    await this.saveCache();
  }

  /**
   * 캐시 저장
   */
  private async saveCache(): Promise<void> {
    try {
      await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('캐시 저장 오류:', error);
    }
  }

  /**
   * 이미지 크기 조정 및 압축
   */
  async compressImage(
    uri: string,
    maxWidth: number = IMAGE_CONFIG.MAX_WIDTH,
    maxHeight: number = IMAGE_CONFIG.MAX_HEIGHT,
    quality: number = IMAGE_CONFIG.QUALITY,
  ): Promise<{uri: string; width: number; height: number; size: number}> {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => {
          // 비율 유지하며 리사이징
          const ratio = Math.min(
            maxWidth / width,
            maxHeight / height,
            1, // 확대하지 않음
          );

          const newWidth = Math.round(width * ratio);
          const newHeight = Math.round(height * ratio);

          // 실제 압축은 react-native-image-resizer 등 사용 권장
          // 여기서는 메타데이터만 반환
          resolve({
            uri,
            width: newWidth,
            height: newHeight,
            size: (newWidth * newHeight * 3) / 1024, // 대략적인 크기 (KB)
          });
        },
        (error) => {
          reject(new Error(`이미지 크기 확인 실패: ${error}`));
        },
      );
    });
  }

  /**
   * 이미지 캐시에 추가
   */
  async addToCache(image: CachedImage): Promise<void> {
    const hash = generateImageHash(image.uri);

    // 중복 체크
    const existingIndex = this.cache.images.findIndex((img) => img.hash === hash);
    if (existingIndex !== -1) {
      // 기존 이미지 업데이트
      this.cache.totalSize -= this.cache.images[existingIndex].size;
      this.cache.images[existingIndex] = {...image, hash};
      this.cache.totalSize += image.size;
    } else {
      // 새 이미지 추가
      this.cache.images.push({...image, hash});
      this.cache.totalSize += image.size;

      // 캐시 크기 제한
      if (this.cache.images.length > MAX_CACHE_SIZE) {
        await this.evictOldest();
      }
    }

    await this.saveCache();
  }

  /**
   * 가장 오래된 이미지 제거
   */
  private async evictOldest(): Promise<void> {
    if (this.cache.images.length === 0) return;

    // 타임스탬프 기준 정렬
    this.cache.images.sort((a, b) => a.timestamp - b.timestamp);

    // 가장 오래된 이미지 제거
    const oldest = this.cache.images.shift();
    if (oldest) {
      this.cache.totalSize -= oldest.size;
    }

    await this.saveCache();
  }

  /**
   * 캐시에서 이미지 조회
   */
  async getFromCache(uri: string): Promise<CachedImage | null> {
    const hash = generateImageHash(uri);
    const cached = this.cache.images.find((img) => img.hash === hash);

    if (cached) {
      // 만료 확인
      const now = Date.now();
      if (now - cached.timestamp < CACHE_EXPIRY_TIME) {
        return cached;
      } else {
        // 만료된 이미지 제거
        await this.removeFromCache(uri);
      }
    }

    return null;
  }

  /**
   * 캐시에서 이미지 제거
   */
  async removeFromCache(uri: string): Promise<void> {
    const hash = generateImageHash(uri);
    const index = this.cache.images.findIndex((img) => img.hash === hash);

    if (index !== -1) {
      this.cache.totalSize -= this.cache.images[index].size;
      this.cache.images.splice(index, 1);
      await this.saveCache();
    }
  }

  /**
   * 캐시 전체 삭제
   */
  async clearCache(): Promise<void> {
    this.cache = {
      images: [],
      totalSize: 0,
    };
    await AsyncStorage.removeItem(IMAGE_CACHE_KEY);
  }

  /**
   * 캐시 통계 조회
   */
  getCacheStats(): {
    count: number;
    totalSize: number;
    totalSizeMB: number;
  } {
    return {
      count: this.cache.images.length,
      totalSize: this.cache.totalSize,
      totalSizeMB: this.cache.totalSize / (1024 * 1024),
    };
  }
}

export const imageCacheManager = new ImageCacheManager();

