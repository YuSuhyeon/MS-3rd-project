import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const AZURE_SPEECH_KEY = process.env.REACT_APP_AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.REACT_APP_AZURE_SPEECH_REGION;

let synthesizerRef = null;
let playerRef = null;

export function stopTTS() {
  try { playerRef?.pause?.(); } catch {}
  try { playerRef?.close?.(); } catch {}
  try { synthesizerRef?.close?.(); } catch {}
  playerRef = null;
  synthesizerRef = null;
}


export async function speakText(text, lang = 'ko') {
  stopTTS();
  if (!text) return;

  if (AZURE_SPEECH_KEY && AZURE_SPEECH_REGION) {
    const langMap = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechSynthesisLanguage = langMap[lang] || 'ko-KR';
    const player = new SpeechSDK.SpeakerAudioDestination();
    const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
    playerRef = player; synthesizerRef = synthesizer;
    return new Promise((resolve) => {
      synthesizer.speakTextAsync(text, () => { synthesizer.close(); resolve(); }, () => { stopTTS(); resolve(); });
    });
  }

  // Fallback to browser TTS
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'ko-KR';
  window.speechSynthesis.speak(u);
}

