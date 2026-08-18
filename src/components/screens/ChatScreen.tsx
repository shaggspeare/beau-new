import React, { useState } from 'react';
import { Master } from '../../data/crawledMasters';
import { ChevronLeft, Send, CheckCircle2, Calendar, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChatScreenProps {
  master: Master;
  onBack: () => void;
  onViewProfile: () => void;
  onBookingConfirmed: (timeSlot: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  master,
  onBack,
  onViewProfile,
  onBookingConfirmed,
}) => {
  const [messages, setMessages] = useState([
    { id: '1', text: `Hi! Saw your ${master.categoryLabel.toLowerCase()} work on Barb.ua — do you have any free slots this week?`, mine: true, time: '10:14' },
    { id: '2', text: `Hello! Yes, I have open slots on Thursday and Friday. What service are you planning to do?`, mine: false, time: '10:18' },
    { id: '3', text: `Looking for ${master.services[0]?.name || master.craft}.`, mine: true, time: '10:20' },
    { id: '4', text: `Perfect! That usually takes about 1.5 - 2 hours. Please pick one of my available time slots below:`, mine: false, time: '10:22' },
  ]);

  const [bookedSlot, setBookedSlot] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const availableSlots = master.slots.length > 0 ? master.slots : ['11:30', '14:00', '16:30', '18:15'];

  const handlePickSlot = (slot: string) => {
    if (bookedSlot) return;
    setBookedSlot(slot);

    // Confetti celebration
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#d9f24e', '#c9bcff', '#ffc3c0', '#1a1938'],
      });
    } catch {
      // Fallback
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: `I would like to book the ${slot} slot, please!`, mine: true, time: 'Just now' },
      { id: (Date.now() + 1).toString(), text: `🎉 Confirmed! You are booked for Thursday at ${slot}. Looking forward to seeing you at ${master.district}!`, mine: false, time: 'Just now' },
    ]);

    onBookingConfirmed(slot);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setInputText('');

    const newMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: newMsgId, text: userMsg, mine: true, time: 'Just now' },
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Thank you! I got your message regarding "${userMsg.slice(0, 30)}". Let me know if you need any other details!`,
          mine: false,
          time: 'Just now',
        },
      ]);
    }, 1200);
  };

  return (
    <div style={{ height: '100%', background: '#f7f6fa', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Top Header */}
      <div
        style={{
          padding: '52px 16px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#ffffff',
          borderBottom: '1px solid #ece9f3',
          zIndex: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#f2f0f6',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={20} color="#1a1938" />
        </button>

        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '14px',
            background: master.tint,
            color: '#1a1938',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {master.initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1938', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {master.name}
          </div>
          <div style={{ fontSize: '11px', color: '#8d8aa6' }}>
            {master.categoryLabel} · Online
          </div>
        </div>

        <button
          onClick={onViewProfile}
          style={{
            height: '34px',
            padding: '0 14px',
            border: 'none',
            borderRadius: '17px',
            background: '#f2f0f6',
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#1a1938',
            cursor: 'pointer',
          }}
        >
          Profile
        </button>
      </div>

      {/* Messages Scroll Area */}
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
        <div style={{ alignSelf: 'center', fontSize: '11px', color: '#a5a2b8', padding: '2px 0 6px' }}>
          Today · Barb.ua Direct Booking
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-pop"
            style={{
              maxWidth: '82%',
              alignSelf: msg.mine ? 'flex-end' : 'flex-start',
              background: msg.mine ? '#1a1938' : '#ffffff',
              color: msg.mine ? '#ffffff' : '#1a1938',
              borderRadius: msg.mine ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
              padding: '13px 16px',
              fontSize: '14.5px',
              lineHeight: 1.45,
              boxShadow: '0 2px 8px rgba(26,25,56,0.05)',
            }}
          >
            {msg.text}
          </div>
        ))}

        {/* Free Slot Booking Widget */}
        {!bookedSlot && (
          <div
            className="animate-pop"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '14px 16px',
              marginTop: '6px',
              boxShadow: '0 4px 14px rgba(26,25,56,0.06)',
              border: '1px solid #f0edf6',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', letterSpacing: '0.08em', fontWeight: 700, color: '#8d8aa6', marginBottom: '10px' }}>
              <Clock size={12} /> FREE SLOTS · THU 20 AUG
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {availableSlots.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => handlePickSlot(slot)}
                  style={{
                    height: '42px',
                    padding: '0 16px',
                    border: 'none',
                    borderRadius: '21px',
                    background: '#f2f0f6',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#1a1938',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Calendar size={13} color="#6f6d86" /> {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {bookedSlot && (
          <div
            className="animate-pop"
            style={{
              background: '#d9f24e',
              borderRadius: '18px',
              padding: '14px 16px',
              color: '#1a1938',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(217, 242, 78, 0.3)',
            }}
          >
            <CheckCircle2 size={24} color="#1a1938" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>Visit Confirmed at {bookedSlot}</div>
              <div style={{ fontSize: '12px', opacity: 0.85 }}>Added to your active appointments</div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input Bottom Bar */}
      <div
        style={{
          background: '#ffffff',
          borderTop: '1px solid #ece9f3',
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
            background: '#f2f0f6',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
          <input
            type="text"
            placeholder="Type your message…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              fontFamily: 'inherit',
              color: '#1a1938',
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
            background: '#1a1938',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
