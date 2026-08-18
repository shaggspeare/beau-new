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
    { label: 'Hair & Styling', cat: 'hair' as CategoryFilter, bg: '#ffd4de', count: '10 masters' },
    { label: 'Nails & Manicure', cat: 'nails' as CategoryFilter, bg: '#c6dcf1', count: '10 masters' },
    { label: 'Laser Epilation', cat: 'laser' as CategoryFilter, bg: '#dbe8f5', count: '10 salons' },
    { label: 'All 30 Masters', cat: 'All' as CategoryFilter, bg: '#ffe6ec', count: '30 masters' },
    { label: 'Top Rated ★4.9+', cat: 'All' as CategoryFilter, bg: '#ffd4de', count: '18 masters' },
    { label: 'Near Pechersk / Center', cat: 'All' as CategoryFilter, bg: '#dce6ef', count: '12 masters' },
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

  return (
    <div style={{ height: '100%', background: '#f4f7fa', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '52px 20px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          borderBottom: '1px solid #e3ebf3',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#f5265f',
            color: '#ffffff',
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
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#24405c' }}>Barb</div>
          <div style={{ fontSize: '11px', color: '#6d8299' }}>your booking assistant</div>
        </div>
        <button
          onClick={onSkipToMap}
          style={{
            height: '34px',
            padding: '0 14px',
            border: 'none',
            borderRadius: '17px',
            background: '#eaf0f6',
            fontSize: '13px',
            fontWeight: 600,
            color: '#24405c',
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
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {messages.map((m, idx) => {
          const isBot = m.sender === 'bot';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                alignSelf: isBot ? 'flex-start' : 'flex-end',
                maxWidth: '84%',
              }}
            >
              {isBot && (
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#ffd4de',
                    color: '#f5265f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '14px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  b
                </div>
              )}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: isBot ? '18px 18px 18px 6px' : '18px 18px 6px 18px',
                  background: isBot ? '#ffffff' : '#24405c',
                  color: isBot ? '#24405c' : '#ffffff',
                  fontSize: '14.5px',
                  lineHeight: 1.45,
                  boxShadow: isBot ? '0 2px 8px rgba(36,64,92,0.05)' : 'none',
                  border: isBot ? '1px solid #e3ebf3' : 'none',
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {/* Quick Pick Service Chips */}
        {!picked && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#93a7b8', marginLeft: '40px' }}>
              POPULAR FILTERS
            </div>
            <div
              style={{
                marginLeft: '40px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {serviceOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handlePick(opt)}
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: '19px',
                    border: '1px solid rgba(36,64,92,0.08)',
                    background: opt.bg,
                    color: '#24405c',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(36,64,92,0.04)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <span>{opt.label}</span>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>· {opt.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div
        style={{
          padding: '12px 18px 24px',
          background: '#ffffff',
          borderTop: '1px solid #e3ebf3',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Ask for hair, nails, laser, or Pechersk..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomSend()}
          style={{
            flex: 1,
            height: '46px',
            borderRadius: '23px',
            background: '#eaf0f6',
            border: 'none',
            outline: 'none',
            padding: '0 18px',
            fontSize: '14px',
            color: '#24405c',
          }}
        />
        <button
          onClick={handleCustomSend}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#f5265f',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(245, 38, 95, 0.3)',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
