/**
 * 에러 처리 유틸리티
 * 네트워크 오류, AI 인식 실패, 데이터 없는 음식 등 처리
 */
import NetInfo from '@react-native-community/netinfo';
import {ApiResponse} from '../types';

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AI_RECOGNITION_FAILED = 'AI_RECOGNITION_FAILED',
  FOOD_NOT_FOUND = 'FOOD_NOT_FOUND',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  retryable: boolean;
  fallbackAvailable: boolean;
}

/**
 * 네트워크 상태 확인
 */
export async function checkNetworkStatus(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  } catch (error) {
    console.error('네트워크 상태 확인 오류:', error);
    return false;
  }
}

/**
 * 네트워크 오류 처리
 */
export function handleNetworkError(error: any): AppError {
  const isNetworkError =
    error.code === 'NETWORK_ERROR' ||
    error.message?.includes('network') ||
    error.message?.includes('Network') ||
    !error.response;

  if (isNetworkError) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: '인터넷 연결을 확인해주세요. 오프라인 모드로 전환됩니다.',
      originalError: error,
      retryable: true,
      fallbackAvailable: true, // 오프라인 모드 사용 가능
    };
  }

  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: '알 수 없는 오류가 발생했습니다.',
    originalError: error,
    retryable: false,
    fallbackAvailable: false,
  };
}

/**
 * AI 인식 실패 처리
 */
export function handleAIRecognitionError(error: any): AppError {
  const errorMessage = error.message || error.error || '';

  if (errorMessage.includes('인식할 수 없습니다') || errorMessage.includes('recognize')) {
    return {
      type: ErrorType.AI_RECOGNITION_FAILED,
      message: '음식을 인식할 수 없습니다. 더 명확한 사진을 촬영하거나 수동으로 입력해주세요.',
      originalError: error,
      retryable: true,
      fallbackAvailable: true, // 수동 입력 가능
    };
  }

  if (errorMessage.includes('API 키') || errorMessage.includes('API key')) {
    return {
      type: ErrorType.API_ERROR,
      message: 'API 설정 오류가 발생했습니다. 관리자에게 문의해주세요.',
      originalError: error,
      retryable: false,
      fallbackAvailable: true, // 수동 입력 가능
    };
  }

  return {
    type: ErrorType.AI_RECOGNITION_FAILED,
    message: '이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.',
    originalError: error,
    retryable: true,
    fallbackAvailable: true,
  };
}

/**
 * 음식 데이터 없음 처리
 */
export function handleFoodNotFoundError(
  detectedFoodName: string,
): AppError {
  return {
    type: ErrorType.FOOD_NOT_FOUND,
    message: `"${detectedFoodName}"에 대한 영양 정보를 찾을 수 없습니다. 수동으로 입력하거나 다른 음식을 선택해주세요.`,
    retryable: false,
    fallbackAvailable: true, // 수동 입력 가능
  };
}

/**
 * API 오류 처리
 */
export function handleAPIError(error: any): AppError {
  if (error.response) {
    const status = error.response.status;

    switch (status) {
      case 401:
        return {
          type: ErrorType.API_ERROR,
          message: '인증 오류가 발생했습니다. 다시 로그인해주세요.',
          originalError: error,
          retryable: false,
          fallbackAvailable: false,
        };
      case 403:
        return {
          type: ErrorType.API_ERROR,
          message: '접근 권한이 없습니다.',
          originalError: error,
          retryable: false,
          fallbackAvailable: false,
        };
      case 404:
        return {
          type: ErrorType.FOOD_NOT_FOUND,
          message: '요청한 데이터를 찾을 수 없습니다.',
          originalError: error,
          retryable: false,
          fallbackAvailable: true,
        };
      case 429:
        return {
          type: ErrorType.API_ERROR,
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          originalError: error,
          retryable: true,
          fallbackAvailable: true,
        };
      case 500:
      case 502:
      case 503:
        return {
          type: ErrorType.API_ERROR,
          message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          originalError: error,
          retryable: true,
          fallbackAvailable: true,
        };
      default:
        return {
          type: ErrorType.API_ERROR,
          message: `서버 오류가 발생했습니다. (${status})`,
          originalError: error,
          retryable: true,
          fallbackAvailable: true,
        };
    }
  }

  if (error.request) {
    return handleNetworkError(error);
  }

  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: '알 수 없는 오류가 발생했습니다.',
    originalError: error,
    retryable: false,
    fallbackAvailable: false,
  };
}

/**
 * 타임아웃 오류 처리
 */
export function handleTimeoutError(error: any): AppError {
  return {
    type: ErrorType.TIMEOUT_ERROR,
    message: '요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.',
    originalError: error,
    retryable: true,
    fallbackAvailable: true,
  };
}

/**
 * 통합 에러 핸들러
 */
export function handleError(error: any, context?: string): AppError {
  console.error(`[${context || 'Unknown'}] Error:`, error);

  // 네트워크 오류
  if (!error.response && error.request) {
    return handleNetworkError(error);
  }

  // 타임아웃
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return handleTimeoutError(error);
  }

  // API 오류
  if (error.response) {
    return handleAPIError(error);
  }

  // AI 인식 오류
  if (context === 'AI_RECOGNITION') {
    return handleAIRecognitionError(error);
  }

  // 기본 오류
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: error.message || '알 수 없는 오류가 발생했습니다.',
    originalError: error,
    retryable: false,
    fallbackAvailable: false,
  };
}

/**
 * 재시도 가능 여부 확인
 */
export function canRetry(error: AppError): boolean {
  return error.retryable;
}

/**
 * 대체 방안 사용 가능 여부 확인
 */
export function hasFallback(error: AppError): boolean {
  return error.fallbackAvailable;
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
export function getUserFriendlyMessage(error: AppError): string {
  return error.message;
}

/**
 * 에러 로깅 (향후 분석 서비스 연동)
 */
export function logError(error: AppError, context?: string): void {
  // 실제로는 Sentry, Firebase Crashlytics 등 사용
  console.error(`[Error Log] ${context || 'Unknown'}:`, {
    type: error.type,
    message: error.message,
    retryable: error.retryable,
    fallbackAvailable: error.fallbackAvailable,
    originalError: error.originalError,
  });
}

