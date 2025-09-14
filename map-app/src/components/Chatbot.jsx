import React, { useState } from 'react';
import { Button, Card, Group, Textarea, Title, Text } from '@mantine/core';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    setA('');
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }) });
      const j = await r.json();
      setA(j.answer || j.error || '챗봇 준비 중입니다.');
    } catch (e) {
      setA('네트워크 오류입니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000 }}>
      {!open && (
        <Button onClick={() => setOpen(true)} radius="xl" size="md">챗봇에게 질문</Button>
      )}
      {open && (
        <Card withBorder shadow="sm" radius="md" style={{ width: 320 }}>
          <Group justify="space-between" align="center">
            <Title order={5} style={{ margin: 0 }}>AI 챗봇</Title>
            <Button size="compact-sm" variant="default" onClick={() => setOpen(false)}>닫기</Button>
          </Group>
          <Textarea mt={8} minRows={3} value={q} onChange={(e)=> setQ(e.currentTarget.value)} placeholder="서울 여행에 대해 물어보세요" />
          <Group mt={8}>
            <Button onClick={ask} loading={loading}>보내기</Button>
            <Button variant="default" onClick={() => { setQ(''); setA(''); }}>새로고침</Button>
          </Group>
          {a && (<Text mt={8}>{a}</Text>)}
        </Card>
      )}
    </div>
  );
}

