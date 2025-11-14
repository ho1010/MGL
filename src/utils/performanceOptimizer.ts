/**
 * 성능 최적화 유틸리티
 * 앱 로딩 속도 개선, 배터리 소모 최소화
 */
import {InteractionManager} from 'react-native';

/**
 * 앱 로딩 속도 개선
 */

/**
 * InteractionManager를 사용한 지연 렌더링
 * 네이티브 애니메이션이 완료된 후 실행
 */
export function runAfterInteractions(callback: () => void): void {
  InteractionManager.runAfterInteractions(() => {
    callback();
  });
}

/**
 * 이미지 지연 로딩
 */
export function lazyLoadImage(
  uri: string,
  onLoad: (uri: string) => void,
  delay: number = 100,
): void {
  setTimeout(() => {
    onLoad(uri);
  }, delay);
}

/**
 * 배치 업데이트 (여러 상태 업데이트를 한 번에)
 */
export function batchUpdates(updates: (() => void)[]): void {
  // React 18의 automatic batching 활용
  updates.forEach((update) => update());
}

/**
 * 디바운스 함수 (빈번한 호출 방지)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * 쓰로틀 함수 (호출 빈도 제한)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 배터리 소모 최소화
 */

/**
 * 백그라운드 작업 최소화
 */
export class BackgroundTaskManager {
  private tasks: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 백그라운드 작업 등록
   */
  registerTask(id: string, task: () => void, interval: number): void {
    this.clearTask(id);

    const timeout = setInterval(() => {
      task();
    }, interval);

    this.tasks.set(id, timeout);
  }

  /**
   * 백그라운드 작업 제거
   */
  clearTask(id: string): void {
    const existing = this.tasks.get(id);
    if (existing) {
      clearInterval(existing);
      this.tasks.delete(id);
    }
  }

  /**
   * 모든 백그라운드 작업 정리
   */
  clearAll(): void {
    this.tasks.forEach((timeout) => clearInterval(timeout));
    this.tasks.clear();
  }
}

export const backgroundTaskManager = new BackgroundTaskManager();

/**
 * 네트워크 요청 최적화
 */

/**
 * 요청 취소 가능한 HTTP 클라이언트 래퍼
 */
export class CancellableRequest {
  private cancelled = false;

  cancel(): void {
    this.cancelled = true;
  }

  isCancelled(): boolean {
    return this.cancelled;
  }

  async execute<T>(
    request: () => Promise<T>,
    onCancel?: () => void,
  ): Promise<T | null> {
    if (this.cancelled) {
      onCancel?.();
      return null;
    }

    try {
      const result = await request();
      if (this.cancelled) {
        onCancel?.();
        return null;
      }
      return result;
    } catch (error) {
      if (this.cancelled) {
        onCancel?.();
        return null;
      }
      throw error;
    }
  }
}

/**
 * 메모리 최적화
 */

/**
 * 큰 객체의 깊은 복사 최적화
 */
export function optimizedClone<T>(obj: T): T {
  // 간단한 객체는 JSON 사용, 복잡한 객체는 다른 방법 사용
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => optimizedClone(item)) as any;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = optimizedClone(obj[key]);
    }
  }

  return cloned;
}

/**
 * 불필요한 리렌더링 방지
 */
export function shouldUpdate(
  prevProps: any,
  nextProps: any,
  keys: string[],
): boolean {
  for (const key of keys) {
    if (prevProps[key] !== nextProps[key]) {
      return true;
    }
  }
  return false;
}

/**
 * 리소스 정리
 */
export class ResourceManager {
  private resources: Set<() => void> = new Set();

  /**
   * 리소스 등록
   */
  register(cleanup: () => void): () => void {
    this.resources.add(cleanup);
    return () => {
      this.resources.delete(cleanup);
      cleanup();
    };
  }

  /**
   * 모든 리소스 정리
   */
  cleanup(): void {
    this.resources.forEach((cleanup) => cleanup());
    this.resources.clear();
  }
}

export const resourceManager = new ResourceManager();

/**
 * 성능 모니터링
 */

/**
 * 함수 실행 시간 측정
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
): Promise<T> {
  const start = performance.now();

  return Promise.resolve(fn()).then((result) => {
    const end = performance.now();
    const duration = end - start;

    if (__DEV__) {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    return result;
  });
}

/**
 * 메모리 사용량 체크 (개발 모드)
 */
export function checkMemoryUsage(label?: string): void {
  if (__DEV__ && (global as any).performance?.memory) {
    const memory = (global as any).performance.memory;
    console.log(`[Memory] ${label || 'Current'}:`, {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
}

