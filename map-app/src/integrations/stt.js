import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const AZURE_SPEECH_KEY = process.env.REACT_APP_AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.REACT_APP_AZURE_SPEECH_REGION;

let recognizerRef = null;

/**
 * STT 서비스 중지
 */
export function stopSTT() {
  try {
    if (recognizerRef && recognizerRef.stop) {
      recognizerRef.stop();
    }
  } catch (error) {
    console.error("STT 중지 중 오류:", error);
  }
  recognizerRef = null;
}

/**
 * 음성 인식 시작 (Azure Speech Service 사용)
 * @param {Function} onResult - 인식 성공 시 콜백 함수 (text, language)
 * @param {Function} onError - 인식 실패 시 콜백 함수 (error)
 * @param {string} language - 인식할 언어 (기본값: 'ko-KR')
 */
export async function startSpeechRecognition(onResult, onError, language = 'ko-KR') {
  console.log("🎤 Azure Speech Service STT 시작");
  
  // Azure Speech Service 설정 확인
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    onError("Azure Speech Service 설정이 필요합니다.");
    return;
  }

  // 기존 인식기 정리
  stopSTT();

  try {
    // Speech Config 생성
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION
    );
    
    // 언어 설정
    speechConfig.speechRecognitionLanguage = language;
    
    // Audio Config 생성 (마이크 사용)
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    
    // Speech Recognizer 생성
    recognizerRef = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    // 이벤트 핸들러 설정
    recognizerRef.recognizeOnceAsync(
      (result) => {
        console.log("🎤 Azure STT 결과:", result);
        
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const recognizedText = result.text;
          console.log("🎤 인식된 텍스트:", recognizedText);
          
          if (recognizedText && recognizedText.trim()) {
            onResult(recognizedText, language);
          } else {
            onError("음성을 인식할 수 없습니다.");
          }
        } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
          console.log("🎤 음성 인식 매치 없음");
          onError("음성을 인식할 수 없습니다. 다시 시도해주세요.");
        } else {
          console.log("🎤 음성 인식 취소됨");
          onError("음성 인식이 취소되었습니다.");
        }
        
        recognizerRef = null;
      },
      (error) => {
        console.error("🎤 Azure STT 에러:", error);
        onError(`음성 인식 오류: ${error}`);
        recognizerRef = null;
      }
    );

  } catch (error) {
    console.error("🎤 Azure STT 초기화 에러:", error);
    onError(`음성 인식 초기화 오류: ${error}`);
    recognizerRef = null;
  }
}

/**
 * 브라우저 기본 음성 인식 사용 (Azure 실패 시 대안)
 * @param {Function} onResult - 인식 성공 시 콜백 함수 (text, language)
 * @param {Function} onError - 인식 실패 시 콜백 함수 (error)
 * @param {string} language - 인식할 언어 (기본값: 'ko-KR')
 */
export async function startBrowserSpeechRecognition(onResult, onError, language = 'ko-KR') {
  console.log("🎤 브라우저 기본 음성인식 사용");
  
  // 브라우저 기본 음성인식 사용
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError("이 브라우저는 음성인식을 지원하지 않습니다.");
    return;
  }

  // 기존 인식기 정리
  stopSTT();

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognizerRef = new SpeechRecognition();
  
  recognizerRef.continuous = false;
  recognizerRef.interimResults = false;
  recognizerRef.lang = language;
  recognizerRef.maxAlternatives = 1;
  
  recognizerRef.onstart = () => {
    console.log("🎤 브라우저 음성인식 시작됨");
  };
  
  recognizerRef.onresult = (event) => {
    console.log("🎤 브라우저 음성인식 결과:", event);
    
    if (event.results.length > 0) {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;
      
      console.log("🎤 인식된 텍스트:", transcript);
      console.log("🎤 신뢰도:", confidence);
      console.log("🎤 최종 결과 여부:", isFinal);
      
      if (isFinal && transcript && transcript.trim()) {
        onResult(transcript, language);
      } else if (isFinal && (!transcript || !transcript.trim())) {
        onError("음성을 인식할 수 없습니다. 다시 시도해주세요.");
      }
    } else {
      onError("음성을 인식할 수 없습니다. 다시 시도해주세요.");
    }
  };
  
  recognizerRef.onnomatch = (event) => {
    console.log("🎤 음성인식 매치 없음:", event);
    onError("음성을 인식할 수 없습니다. 다시 시도해주세요.");
  };
  
  recognizerRef.onerror = (event) => {
    console.error("🎤 브라우저 음성인식 에러:", event.error);
    onError(`음성인식 오류: ${event.error}`);
  };
  
  recognizerRef.onend = () => {
    console.log("🎤 브라우저 음성인식 종료됨");
    recognizerRef = null;
  };
  
  recognizerRef.start();
}

/**
 * 자동 언어 감지가 포함된 음성 인식
 * @param {Function} onResult - 인식 성공 시 콜백 함수 (text, language)
 * @param {Function} onError - 인식 실패 시 콜백 함수 (error)
 */
export async function startAutoLanguageSpeechRecognition(onResult, onError) {
  console.log("🎤 자동 언어 감지 음성인식 시작");
  
  // Azure Speech Service 설정 확인
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    // Azure 설정이 없으면 브라우저 기본 사용
    startBrowserSpeechRecognition(onResult, onError, 'ko-KR');
    return;
  }

  // 기존 인식기 정리
  stopSTT();

  try {
    // Speech Config 생성
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION
    );
    
    // 자동 언어 감지 설정
    const autoDetectSourceLanguageConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages([
      'ko-KR', 'en-US', 'ja-JP', 'zh-CN'
    ]);
    
    // Audio Config 생성 (마이크 사용)
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    
    // Speech Recognizer 생성
    recognizerRef = new SpeechSDK.SpeechRecognizer(speechConfig, autoDetectSourceLanguageConfig, audioConfig);

    // 이벤트 핸들러 설정
    recognizerRef.recognizeOnceAsync(
      (result) => {
        console.log("🎤 자동 언어 감지 STT 결과:", result);
        
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const recognizedText = result.text;
          const detectedLanguage = result.properties?.getProperty(SpeechSDK.PropertyId.SpeechServiceConnection_RecoLanguage);
          
          console.log("🎤 인식된 텍스트:", recognizedText);
          console.log("🎤 감지된 언어:", detectedLanguage);
          
          if (recognizedText && recognizedText.trim()) {
            onResult(recognizedText, detectedLanguage || 'ko-KR');
          } else {
            onError("음성을 인식할 수 없습니다.");
          }
        } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
          console.log("🎤 음성 인식 매치 없음");
          onError("음성을 인식할 수 없습니다. 다시 시도해주세요.");
        } else {
          console.log("🎤 음성 인식 취소됨");
          onError("음성 인식이 취소되었습니다.");
        }
        
        recognizerRef = null;
      },
      (error) => {
        console.error("🎤 자동 언어 감지 STT 에러:", error);
        onError(`음성 인식 오류: ${error}`);
        recognizerRef = null;
      }
    );

  } catch (error) {
    console.error("🎤 자동 언어 감지 STT 초기화 에러:", error);
    // Azure 실패 시 브라우저 기본 사용
    startBrowserSpeechRecognition(onResult, onError, 'ko-KR');
  }
}
