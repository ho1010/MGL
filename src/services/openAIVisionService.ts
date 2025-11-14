import axios from 'axios';
import {DetectedFood, ApiResponse} from '../types';
import {config} from '../../config/api';
import {handleError, handleAIRecognitionError, handleTimeoutError} from '../utils/errorHandler';

/**
 * OpenAI Vision API 서비스
 * 음식 이미지 인식을 위한 전용 서비스
 */
class OpenAIVisionService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = config.openAIApiKey || '';
    if (!this.apiKey) {
      console.warn('OpenAI API 키가 설정되지 않았습니다.');
    }
  }

  /**
   * 이미지를 분석하여 음식 목록 추출
   * @param imageBase64 - base64 인코딩된 이미지
   * @returns 인식된 음식 목록
   */
  async analyzeFoodImage(
    imageBase64: string,
  ): Promise<ApiResponse<DetectedFood[]>> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'OpenAI API 키가 설정되지 않았습니다.',
        };
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4o', // 또는 'gpt-4-vision-preview'
          messages: [
            {
              role: 'system',
              content:
                'You are a food recognition expert. Analyze food images and return a JSON object with a "foods" array. Each food should have nameKo (Korean name), nameEn (English name), and confidence (0-1).',
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `이 이미지에서 음식을 식별하고 JSON 형식으로 반환해주세요.
응답은 반드시 다음 형식이어야 합니다:
{
  "foods": [
    {
      "nameKo": "음식 한글명",
      "nameEn": "Food English Name",
      "confidence": 0.9
    }
  ]
}

여러 음식이 있으면 모두 나열해주세요. 음식이 아닌 것은 제외해주세요.`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          response_format: {type: 'json_object'}, // JSON 모드 활성화
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000, // 30초 타임아웃
        },
      );

      // 응답 파싱
      const content = response.data.choices[0]?.message?.content || '';
      const parsedResult = this.parseFoodList(content);

      if (parsedResult.length === 0) {
        return {
          success: false,
          error: '음식을 인식할 수 없습니다. 더 명확한 사진을 촬영해주세요.',
        };
      }

      return {
        success: true,
        data: parsedResult,
      };
    } catch (error: any) {
      console.error('OpenAI Vision API 오류:', error);
      
      // 타임아웃 오류 처리
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        const timeoutError = handleTimeoutError(error);
        return {
          success: false,
          error: timeoutError.message,
        };
      }

      // AI 인식 오류 처리
      const appError = handleAIRecognitionError(error);
      return {
        success: false,
        error: appError.message,
      };
    }
  }

  /**
   * OpenAI 응답에서 음식 목록 파싱
   */
  private parseFoodList(content: string): DetectedFood[] {
    try {
      // JSON 응답 파싱 시도
      let parsed: any;
      
      // 전체 내용이 JSON인 경우
      try {
        parsed = JSON.parse(content);
      } catch {
        // JSON 객체 추출 시도
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON 형식이 아닙니다');
        }
      }
      
      // JSON 객체 형식 처리 (response_format: json_object)
      if (parsed.foods && Array.isArray(parsed.foods)) {
        return parsed.foods
          .filter((food: any) => food.nameKo || food.nameEn || food.name)
          .map((food: any) => ({
            name: food.nameKo || food.nameEn || food.name || '',
            nameKo: food.nameKo || '',
            nameEn: food.nameEn || '',
            confidence: food.confidence || 0.8,
          }));
      }
      
      // 직접 배열 형식 (폴백)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((food: any) => food.nameKo || food.nameEn || food.name)
          .map((food: any) => ({
            name: food.nameKo || food.nameEn || food.name || '',
            nameKo: food.nameKo || '',
            nameEn: food.nameEn || '',
            confidence: food.confidence || 0.8,
          }));
      }

      // JSON 파싱 실패 시 텍스트 파싱
      return this.parseFoodListFromText(content);
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      // 텍스트 파싱으로 폴백
      return this.parseFoodListFromText(content);
    }
  }

  /**
   * 텍스트에서 음식 목록 파싱 (폴백)
   */
  private parseFoodListFromText(text: string): DetectedFood[] {
    const foods: DetectedFood[] = [];
    const lines = text.split('\n');

    lines.forEach((line) => {
      // 다양한 형식의 목록 파싱
      const patterns = [
        /[-•*]\s*(.+?)(?:\s*\((.+?)\))?/i, // - 음식명 (영문명)
        /(\d+\.\s*)?(.+?)(?:\s*-\s*(.+?))?$/i, // 1. 음식명 - 영문명
        /^(.+?)(?:\s*\((.+?)\))?$/i, // 음식명 (영문명)
      ];

      for (const pattern of patterns) {
        const match = line.trim().match(pattern);
        if (match) {
          const nameKo = match[2] || match[1] || '';
          const nameEn = match[3] || match[2] || '';
          
          if (nameKo && nameKo.length > 0 && nameKo.length < 50) {
            // 한글이 포함되어 있으면 nameKo, 아니면 nameEn
            const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(nameKo);
            
            foods.push({
              name: hasKorean ? nameKo : nameEn,
              nameKo: hasKorean ? nameKo : '',
              nameEn: hasKorean ? nameEn : nameKo,
              confidence: 0.7,
            });
            break;
          }
        }
      }
    });

    // 중복 제거
    const uniqueFoods = foods.filter(
      (food, index, self) =>
        index ===
        self.findIndex(
          (f) => f.nameKo === food.nameKo && f.nameEn === food.nameEn,
        ),
    );

    return uniqueFoods;
  }
}

export const openAIVisionService = new OpenAIVisionService();

