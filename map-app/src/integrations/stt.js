import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const AZURE_SPEECH_KEY = process.env.REACT_APP_AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.REACT_APP_AZURE_SPEECH_REGION;

let recognizerRef = null;
let finalTranscript = '';
let currentOnResult = null;
let currentOnError = null;

export function stopSTT() {
  try { 
    if (recognizerRef) {
      // Azure Speech Service인 경우 연속 인식 중지
      if (recognizerRef.stopContinuousRecognitionAsync) {
        recognizerRef.stopContinuousRecognitionAsync(
          () => {
            recognizerRef.close();
            recognizerRef = null;
            
            // 결과 반환
            if (finalTranscript && finalTranscript.trim() && currentOnResult) {
              currentOnResult(finalTranscript.trim());
            } else if (currentOnError) {
              currentOnError("음성을 인식할 수 없습니다.");
            }
            
            // 상태 초기화
            finalTranscript = '';
            currentOnResult = null;
            currentOnError = null;
          },
          (error) => {
            recognizerRef.close();
            recognizerRef = null;
            currentOnError?.(`음성 인식 중지 오류: ${error}`);
            
            // 상태 초기화
            finalTranscript = '';
            currentOnResult = null;
            currentOnError = null;
          }
        );
      } else {
        // 브라우저 STT인 경우
        recognizerRef.stop();
        
        // 브라우저 STT인 경우 중지 시 결과 반환
        if (finalTranscript && finalTranscript.trim() && currentOnResult) {
          currentOnResult(finalTranscript.trim());
        } else if (currentOnError) {
          currentOnError("음성을 인식할 수 없습니다.");
        }
        
        // 상태 초기화
        finalTranscript = '';
        currentOnResult = null;
        currentOnError = null;
        recognizerRef = null;
      }
    }
  } catch {}
}

export async function startSpeechRecognition(onResult, onError) {
  stopSTT();
  if (!onResult) return;

  // 콜백 함수 저장
  currentOnResult = onResult;
  currentOnError = onError;
  finalTranscript = '';

  if (AZURE_SPEECH_KEY && AZURE_SPEECH_REGION) {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    
    // 자동 언어 감지 설정
    const autoDetectSourceLanguageConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(['ko-KR', 'en-US', 'ja-JP', 'zh-CN']);
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = SpeechSDK.SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig);
    recognizerRef = recognizer;
    
    // Azure는 연속 모드로 변경 (중지 버튼으로만 완료)
    recognizer.startContinuousRecognitionAsync(
      () => {
        // 시작 성공
      },
      (error) => {
        currentOnError?.(`음성 인식 오류: ${error}`);
        recognizer.close();
        recognizerRef = null;
      }
    );
    
    // 연속 인식 결과 처리
    recognizer.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const recognizedText = e.result.text;
        if (recognizedText && recognizedText.trim()) {
          finalTranscript += recognizedText + ' ';
        }
      }
    };
    
    return;
  }

  // Fallback to browser STT
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError?.("이 브라우저는 음성인식을 지원하지 않습니다.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognizerRef = new SpeechRecognition();
  recognizerRef.continuous = true; // 연속 녹음 모드
  recognizerRef.interimResults = true; // 중간 결과도 받기
  recognizerRef.lang = 'auto'; // 자동 언어 감지
  recognizerRef.maxAlternatives = 1;
  
  recognizerRef.onresult = (event) => {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    // 중간 결과는 무시하고 최종 결과만 처리
    // 실제 결과는 중지 버튼을 눌렀을 때 처리됨
  };
  
  recognizerRef.onnomatch = () => {
    currentOnError?.("음성을 인식할 수 없습니다. 다시 시도해주세요.");
  };
  
  recognizerRef.onerror = (event) => {
    currentOnError?.(`음성인식 오류: ${event.error}`);
  };
  
  recognizerRef.onend = () => {
    recognizerRef = null;
  };
  
  recognizerRef.start();
}
