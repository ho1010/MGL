/**
 * API 설정 파일
 * 환경 변수에서 API 키를 가져오거나 기본값 사용
 */

export const config = {
  // API 기본 URL
  apiBaseURL: process.env.API_BASE_URL || 'https://api.example.com',
  
  // API 키
  apiKey: process.env.API_KEY || '',
  
  // Google Vision API 키
  googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY || '',
  
  // OpenAI API 키
  openAIApiKey: process.env.OPENAI_API_KEY || '',
  
  // Supabase 설정
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  
  // Firebase 설정
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
  },
};

