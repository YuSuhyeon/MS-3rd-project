import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { translateText } from 'integrations/translator';
import { InvokeLLM } from 'integrations/Core';

const AZURE_OPENAI_ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.REACT_APP_AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT;
const AZURE_OPENAI_API_VERSION = process.env.REACT_APP_AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
const AZURE_SEARCH_ENDPOINT = process.env.REACT_APP_AZURE_SEARCH_ENDPOINT;
const AZURE_SEARCH_KEY = process.env.REACT_APP_AZURE_SEARCH_KEY;
const AZURE_SEARCH_INDEX = process.env.REACT_APP_AZURE_SEARCH_INDEX;

export default function DocentChatbot({ selectedLang }) {
  const L = {
    ko: { title: 'Seoul Travel Chat', askMe: '챗봇에게 질문', placeholder: '예) 경복궁 야간개장 정보 알려줘', ask: '보내기', typing: '요청 중...', refresh: '🔄 새로고침', retry: '⟳ 다시 시도', close: '닫기', error: '네트워크 또는 서버 오류가 발생했습니다.' },
    en: { title: 'Seoul Travel Chat', askMe: 'Ask the bot', placeholder: 'e.g., Tell me Gyeongbokgung night opening', ask: 'Send', typing: 'Typing...', refresh: '🔄 Refresh', retry: '⟳ Retry', close: 'Close', error: 'A network or server error occurred.' },
    ja: { title: 'ソウル旅行チャット', askMe: 'チャットに質問', placeholder: '例) 景福宮の夜間公開情報', ask: '送信', typing: '送信中…', refresh: '🔄 再読み込み', retry: '⟳ 再試行', close: '閉じる', error: 'ネットワークまたはサーバーエラーが発生しました。' },
    zh: { title: '首尔旅行聊天', askMe: '向聊天提问', placeholder: '例如：景福宫夜间开放信息', ask: '发送', typing: '发送中…', refresh: '🔄 刷新', retry: '⟳ 重试', close: '关闭', error: '发生网络或服务器错误。' },
  }[selectedLang || 'ko'];

  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    setChat([{ role: 'assistant', content: selectedLang === 'en' ? "Hello! I'm your Seoul travel helper. Ask me anything." : selectedLang === 'ja' ? 'こんにちは！ソウル旅行のコンシェルジュです。何でも聞いてください。' : selectedLang === 'zh' ? '你好！我是你的首尔旅行助手，有问题尽管问。' : '안녕하세요! 서울 여행 도우미입니다. 편하게 물어보세요. 😊', ts: Date.now() }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  useEffect(() => {
    if (!panelRef.current) return;
    panelRef.current.scrollTop = panelRef.current.scrollHeight;
  }, [chat, open]);

  async function ask() {
    const content = q.trim();
    if (!content || loading) return;
    setErr(''); setLoading(true); setQ('');
    setChat((c) => [...c, { role: 'user', content, ts: Date.now() }]);
    try {
      let answer = '';
      if (AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_KEY && AZURE_OPENAI_DEPLOYMENT) {
        const userKo = selectedLang === 'ko' ? content : await translateText(content, 'ko');
        const body = {
          messages: [
            { role: 'system', content: 'You are a Seoul travel assistant. Answer concisely.' },
            { role: 'user', content: userKo }
          ],
          temperature: 0.2,
          max_tokens: 800,
          data_sources: AZURE_SEARCH_ENDPOINT && AZURE_SEARCH_KEY && AZURE_SEARCH_INDEX ? [
            { type: 'azure_search', parameters: { endpoint: AZURE_SEARCH_ENDPOINT, index_name: AZURE_SEARCH_INDEX, authentication: { type: 'api_key', key: AZURE_SEARCH_KEY }, top_n_documents: 8, strictness: 2 } }
          ] : undefined
        };
        const resp = await fetch(`${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': AZURE_OPENAI_KEY }, body: JSON.stringify(body)
        });
        const data = await resp.json();
        answer = data?.choices?.[0]?.message?.content || '';
        if (selectedLang !== 'ko' && answer) answer = await translateText(answer, selectedLang);
      } else {
        const res = await InvokeLLM({ prompt: content, response_json_schema: {} });
        answer = typeof res === 'string' ? res : JSON.stringify(res);
      }
      setChat((c) => [...c, { role: 'assistant', content: answer || '(응답 없음 / No content)', ts: Date.now() }]);
    } catch (e) {
      setErr(L.error);
    } finally {
      setLoading(false);
      setTimeout(() => { panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight, behavior: 'smooth' }); }, 0);
    }
  }

  const canPortal = typeof document !== 'undefined' && !!document.body;
  const floating = canPortal ? createPortal(
    <button type="button" onClick={() => setOpen(true)} style={{ position: 'fixed', bottom: 24, right: 28, zIndex: 9999, background: '#fff', border: '2px solid #007aff', color: '#007aff', borderRadius: 24, padding: '12px 18px', fontWeight: 700, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
      💬 {L.askMe}
    </button>, document.body) : null;

  const panel = canPortal ? createPortal(
    <div role="dialog" aria-label={L.title} style={{ position: 'fixed', bottom: 80, right: 28, width: 430, height: 600, display: open ? 'flex' : 'none', flexDirection: 'column', background: '#fff', border: '2px solid #007aff', borderRadius: 18, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', zIndex: 9999, overflow: 'hidden' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #e0e8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 900 }}>{L.title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setChat([]); setErr(''); }} title={L.refresh} style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid #d3e4ff', background: '#f3f8ff' }}>{L.refresh}</button>
          <button onClick={() => setOpen(false)} title={L.close} style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid #e5eaf3', background: '#fff' }}>×</button>
        </div>
      </div>
      <div ref={panelRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {chat.map((m, i) => (
          <div key={m.ts + '-' + i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#eaf3ff' : '#f5f7fa', padding: '10px 14px', borderRadius: 14, maxWidth: '78%', whiteSpace: 'pre-wrap' }}>{m.content}</div>
        ))}
        {err && <div style={{ background: '#ffecec', border: '1px solid #ffc4c4', padding: 10, borderRadius: 8 }}>{err}</div>}
      </div>
      <div style={{ borderTop: '1px solid #e0e8f8', padding: 12, display: 'flex', gap: 8 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L.placeholder} onKeyDown={(e) => e.key === 'Enter' && ask()} style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: '1px solid #cedcf5' }} />
        <button onClick={ask} disabled={loading} style={{ padding: '10px 14px', borderRadius: 12, background: loading ? '#dfe9ff' : '#007aff', color: '#fff', fontWeight: 800 }}>{loading ? L.typing : L.ask}</button>
      </div>
    </div>, document.body) : null;

  return <>{floating}{panel}</>;
}
