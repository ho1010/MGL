import axios from 'axios';
import {FoodAnalysisResult, DetectedFood, ApiResponse} from '../types';
import {API_ENDPOINTS} from '../constants';
import {config} from '../../config/api';

/**
 * AI 이미지 분석 서비스
 * Google Vision AI 또는 OpenAI Vision API를 사용하여 음식 인식
 */
class AIService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.apiBaseURL || 'https://api.example.com';
  }

  /**
   * 이미지를 분석하여 음식 정보 추출
   * @param imageUri - 분석할 이미지 URI (base64 또는 URL)
   * @returns 분석 결과
   */
  async analyzeFoodImage(
    imageUri: string,
  ): Promise<ApiResponse<FoodAnalysisResult>> {
    try {
      // 이미지를 base64로 변환 (필요시)
      const imageBase64 = await this.convertImageToBase64(imageUri);

      const response = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.ANALYZE_IMAGE}`,
        {
          image: imageBase64,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '이미지 분석 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 이미지를 base64로 변환
   */
  private async convertImageToBase64(imageUri: string): Promise<string> {
    // React Native에서는 react-native-fs 또는 다른 라이브러리 사용
    // 여기서는 예시로 구현
    // 실제 구현 시 react-native-fs 또는 FileReader API 사용
    return imageUri;
  }

  /**
   * Google Vision API를 사용한 음식 인식
   */
  async analyzeWithGoogleVision(imageBase64: string): Promise<DetectedFood[]> {
    try {
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${config.googleVisionApiKey}`,
        {
          requests: [
            {
              image: {
                content: imageBase64,
              },
              features: [
                {
                  type: 'LABEL_DETECTION',
                  maxResults: 10,
                },
                {
                  type: 'OBJECT_LOCALIZATION',
                  maxResults: 10,
                },
              ],
            },
          ],
        },
      );

      // 응답 파싱 및 음식 정보 추출
      const labels = response.data.responses[0]?.labelAnnotations || [];
      const objects = response.data.responses[0]?.localizedObjectAnnotations || [];

      const detectedFoods: DetectedFood[] = [];

      // 라벨에서 음식 관련 항목 추출
      labels.forEach((label: any) => {
        if (this.isFoodRelated(label.description)) {
          detectedFoods.push({
            name: label.description,
            confidence: label.score,
          });
        }
      });

      // 객체 인식 결과 추가
      objects.forEach((obj: any) => {
        if (this.isFoodRelated(obj.name)) {
          detectedFoods.push({
            name: obj.name,
            confidence: obj.score,
            boundingBox: {
              x: obj.boundingPoly.normalizedVertices[0]?.x || 0,
              y: obj.boundingPoly.normalizedVertices[0]?.y || 0,
              width:
                (obj.boundingPoly.normalizedVertices[2]?.x || 0) -
                (obj.boundingPoly.normalizedVertices[0]?.x || 0),
              height:
                (obj.boundingPoly.normalizedVertices[2]?.y || 0) -
                (obj.boundingPoly.normalizedVertices[0]?.y || 0),
            },
          });
        }
      });

      return detectedFoods;
    } catch (error: any) {
      throw new Error(`Google Vision API 오류: ${error.message}`);
    }
  }

  /**
   * OpenAI Vision API를 사용한 음식 인식
   */
  async analyzeWithOpenAI(imageBase64: string): Promise<DetectedFood[]> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '이 이미지에서 음식을 식별하고 목록으로 제공해주세요. 각 음식의 이름만 간단히 알려주세요.',
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
          max_tokens: 300,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.openAIApiKey}`,
          },
        },
      );

      // 응답 파싱
      const content = response.data.choices[0]?.message?.content || '';
      const foods = this.parseFoodListFromText(content);

      return foods.map((food) => ({
        name: food,
        confidence: 0.8, // OpenAI는 confidence를 제공하지 않으므로 기본값
      }));
    } catch (error: any) {
      throw new Error(`OpenAI Vision API 오류: ${error.message}`);
    }
  }

  /**
   * 텍스트에서 음식 목록 파싱
   */
  private parseFoodListFromText(text: string): string[] {
    // 간단한 파싱 로직 (실제로는 더 정교한 파싱 필요)
    const lines = text.split('\n');
    const foods: string[] = [];

    lines.forEach((line) => {
      const match = line.match(/[-•]\s*(.+)/);
      if (match) {
        foods.push(match[1].trim());
      }
    });

    return foods;
  }

  /**
   * 라벨이 음식 관련인지 확인
   */
  private isFoodRelated(label: string): boolean {
    const foodKeywords = [
      'food',
      'dish',
      'meal',
      'cuisine',
      'ingredient',
      'rice',
      'noodle',
      'bread',
      'meat',
      'vegetable',
      'fruit',
      '음식',
      '식사',
      '요리',
    ];

    return foodKeywords.some((keyword) =>
      label.toLowerCase().includes(keyword.toLowerCase()),
    );
  }
}

export const aiService = new AIService();

