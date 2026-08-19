import React, { useState } from 'react';
import { Master } from '../../data/crawledMasters';
import { ChevronLeft, Send, CheckCircle2, Calendar } from 'lucide-react';

interface MasterChatScreenProps {
  master: Master;
  onBack: () => void;
}

export const MasterChatScreen: React.FC<MasterChatScreenProps> = ({ master, onBack }) => {
  const [messages, setMessages] = useState([
    { id: '1', text: `Привіт! Побачила ваші роботи на Barb.ua — чи є вільні віконця цього тижня?`, mine: false, time: '10:14' },
    { id: '2', text: `Вітаю! Так, є вільний час у четвер та п'ятницю. Яку саме послугу плануєте?`, mine: true, time: '10:18' },
    { id: '3', text: `Цікавить ${master.services[0]?.name || master.craft}.`, mine: false, time: '10:20' },
    { id: '4', text: `Чудово! Це зазвичай займає близько 1.5 - 2 годин. Оберіть зручний час нижче.`, mine: true, time: '10:22' },
    { id: '5', text: `Я хочу записатися на 11:30, будь ласка!`, mine: false, time: '10:24' },
    { id: '6', text: `🎉 Підтверджено! Вас записано на четвер об 11:30. Чекаю на вас у районі ${master.district}!`, mine: true, time: '10:25' },
  ]);

  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, mine: true, time: 'Щойно' },
    ]);
  };

  const handleQuickOffer = (slot: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: `У мене є для вас вільне віконце о ${slot} у четвер!`, mine: true, time: 'Щойно' },
    ]);
  };

  return (
    <div style={{ height: '100%', background: '#16283b', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div
        style={{
          padding: '52px 16px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#24405c',
          borderBottom: '1px solid #1c3248',
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '14px',
            background: '#ffd4de',
            color: '#f5265f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 800,
          }}
        >
          КП
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Катерина Петренко</div>
          <div style={{ fontSize: '11px', color: '#a9c8e6' }}>Клієнт · Запис на Четвер 11:30</div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ alignSelf: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.5)', padding: '2px 0 6px' }}>
          Листування з клієнтом
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className="animate-pop"
            style={{
              maxWidth: '82%',
              alignSelf: m.mine ? 'flex-end' : 'flex-start',
              background: m.mine ? '#f5265f' : '#24405c',
              color: '#ffffff',
              borderRadius: m.mine ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
              padding: '12px 16px',
              fontSize: '14px',
              lineHeight: 1.45,
              fontWeight: m.mine ? 600 : 400,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: m.mine ? 'none' : '1px solid #1c3248',
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Quick Suggestion Chips */}
      <div style={{ padding: '8px 16px', background: '#24405c', borderTop: '1px solid #1c3248', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        <button
          onClick={() => handleQuickOffer('14:00')}
          style={{
            padding: '6px 12px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: 'none',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          + Запропонувати час 14:00
        </button>
        <button
          onClick={() => handleQuickOffer('16:30')}
          style={{
            padding: '6px 12px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            border: 'none',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          + Запропонувати час 16:30
        </button>
      </div>

      {/* Input */}
      <div
        style={{
          background: '#24405c',
          borderTop: '1px solid #1c3248',
          padding: '12px 16px 34px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '46px',
            borderRadius: '23px',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
          <input
            type="text"
            placeholder="Відповісти Катерині Петренко…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: '#ffffff',
            }}
          />
        </div>

        <button
          onClick={handleSend}
          style={{
            width: '46px',
            height: '46px',
            border: 'none',
            borderRadius: '50%',
            background: '#f5265f',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 38, 95, 0.35)',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
