import React, { useState } from 'react';
import { Send, MapPin, RotateCcw } from 'lucide-react';
import { CategoryFilter } from '../../types/app';

interface BotScreenProps {
  onSelectCategory: (category: CategoryFilter, filterLabel?: string) => void;
  onSkipToMap: () => void;
}

export const BotScreen: React.FC<BotScreenProps> = ({
  onSelectCategory,
  onSkipToMap,
}) => {
  const [picked, setPicked] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: 'Hi! Two taps and your map is ready. What are you after today?',
    },
  ]);

  const serviceOptions = [
    { label: 'Hair & Styling', cat: 'hair' as CategoryFilter, bg: '#d9f24e', count: '10 masters' },
    { label: 'Nails & Manicure', cat: 'nails' as CategoryFilter, bg: '#c9bcff', count: '10 masters' },
    { label: 'Laser Epilation', cat: 'laser' as CategoryFilter, bg: '#ffc3c0', count: '10 salons' },
    { label: 'All 30 Masters', cat: 'All' as CategoryFilter, bg: '#bfe8d8', count: '30 masters' },
    { label: 'Top Rated ★9.5+', cat: 'All' as CategoryFilter, bg: '#ffe4a8', count: '18 masters' },
    { label: 'Near Pechersk / Center', cat: 'All' as CategoryFilter, bg: '#e4e1ea', count: '12 masters' },
  ];

  const handlePick = (opt: typeof serviceOptions[0]) => {
    if (picked) return;
    setPicked(opt.label);
    
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: opt.label },
      { sender: 'bot', text: `Nice! Found ${opt.count} for ${opt.label} in Kyiv — opening your live map.` },
    ]);

    setTimeout(() => {
      onSelectCategory(opt.cat, opt.label);
    }, 1000);
  };

  const handleCustomSend = () => {
    if (!inputText.trim() || picked) return;
    const text = inputText.trim();
    setInputText('');
    setPicked(text);

    let matchedCat: CategoryFilter = 'All';
    const lower = text.toLowerCase();
    if (lower.includes('hair') || lower.includes('волос') || lower.includes('стрижк') || lower.includes('color')) {
      matchedCat = 'hair';
    } else if (lower.includes('nail') || lower.includes('нігт') || lower.includes('манікюр') || lower.includes('gel')) {
      matchedCat = 'nails';
    } else if (lower.includes('laser') || lower.includes('лазер') || lower.includes('епіляц') || lower.includes('epil')) {
      matchedCat = 'laser';
    }

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text },
      { sender: 'bot', text: `Great choice! Filtered 30 crawled Kyiv masters for "${text}" — zooming to results.` },
    ]);

    setTimeout(() => {
      onSelectCategory(matchedCat, text);
    }, 1000);
  };

  const handleReset = () => {
    setPicked(null);
    setMessages([
      {
        sender: 'bot',
        text: 'Hi! Two taps and your map is ready. What are you after today?',
      },
    ]);
  };

  return (
    <div style={{ height: '100%', background: '#f7f6fa', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '52px 20px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          borderBottom: '1px solid #ece9f3',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#d9f24e',
            color: '#1a1938',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-serif)',
            fontSize: '19px',
            fontWeight: 700,
          }}
        >
          b
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1938' }}>Beau</div>
          <div style={{ fontSize: '11px', color: '#8d8aa6' }}>your booking assistant</div>
        </div>
        <button
          onClick={onSkipToMap}
          style={{
            height: '34px',
            padding: '0 14px',
            border: 'none',
            borderRadius: '17px',
            background: '#f2f0f6',
            fontSize: '13px',
            fontWeight: 600,
            color: '#6f6d86',
            cursor: 'pointer',
          }}
        >
          Skip to Map
        </button>
      </div>

      {/* Chat Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            className="animate-pop"
            style={{
              maxWidth: '84%',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              background: m.sender === 'user' ? '#1a1938' : '#ffffff',
              color: m.sender === 'user' ? '#ffffff' : '#1a1938',
              borderRadius: m.sender === 'user' ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
              padding: '14px 16px',
              fontSize: '15px',
              lineHeight: 1.5,
              boxShadow: m.sender === 'bot' ? '0 2px 8px rgba(26,25,56,0.05)' : 'none',
            }}
          >
            {m.text}
          </div>
        ))}

        {/* Suggestion Chips */}
        {!picked && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px', marginTop: '6px' }}>
            {serviceOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handlePick(opt)}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  border: 'none',
                  borderRadius: '21px',
                  background: opt.bg,
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#1a1938',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(26,25,56,0.06)',
                  transition: 'transform 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          padding: '12px 16px 34px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#ffffff',
          borderTop: '1px solid #ece9f3',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '46px',
            borderRadius: '23px',
            background: '#f2f0f6',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: '8px',
          }}
        >
          <input
            type="text"
            placeholder="Ask Beau anything (e.g. Balayage, Gel nails)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSend()}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              fontFamily: 'inherit',
              color: '#1a1938',
            }}
          />
          {inputText && (
            <button
              onClick={handleCustomSend}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#1a1938',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Send size={13} />
            </button>
          )}
        </div>

        <button
          onClick={handleReset}
          title="Reset Conversation"
          style={{
            width: '46px',
            height: '46px',
            border: 'none',
            borderRadius: '50%',
            background: '#f2f0f6',
            color: '#6f6d86',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={onSkipToMap}
          title="Open Map"
          style={{
            width: '46px',
            height: '46px',
            border: 'none',
            borderRadius: '50%',
            background: '#d9f24e',
            color: '#1a1938',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MapPin size={18} />
        </button>
      </div>
    </div>
  );
};
