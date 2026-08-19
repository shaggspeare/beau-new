import React, { useState } from 'react';
import { Master } from '../../data/crawledMasters';
import { ChevronLeft, Send, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChatScreenProps {
  master: Master;
  onBack: () => void;
  onViewProfile: () => void;
  onBookingConfirmed?: (slot: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  master,
  onBack,
  onViewProfile,
  onBookingConfirmed,
}) => {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; mine: boolean; time: string }>>([
    {
      id: '1',
      text: `Привіт! У мене є вільні віконця для запису на цей тиждень у студії (${master.cleanStreet}).`,
      mine: false,
      time: '10:15',
    },
    {
      id: '2',
      text: 'Який час вам підійде найкраще?',
      mine: false,
      time: '10:16',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  const availableSlots = master.slots && master.slots.length > 0 ? master.slots : ['10:00', '11:30', '14:00', '16:30', '18:00'];

  const handlePickSlot = (slot: string) => {
    if (bookedSlot) return;
    setBookedSlot(slot);

    // Trigger celebratory confetti
    confetti({
      particleCount: 55,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#f5265f', '#ffd4de', '#24405c', '#a9c8e6'],
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: `Я хочу записатися на ${slot}, будь ласка!`,
        mine: true,
        time: 'Щойно',
      },
      {
        id: (Date.now() + 1).toString(),
        text: `Чудово! Вас записано на Чт 20 Сер о ${slot}. Чекаю на вас за адресою: ${master.cleanStreet}!`,
        mine: false,
        time: 'Щойно',
      },
    ]);

    if (onBookingConfirmed) {
      onBookingConfirmed(slot);
    }
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userMsg = inputVal.trim();
    setInputVal('');

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: userMsg,
        mine: true,
        time: 'Щойно',
      },
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Дякую! Отримала ваше повідомлення щодо "${userMsg.slice(0, 30)}". Якщо виникнуть запитання — пишіть!`,
          mine: false,
          time: 'Щойно',
        },
      ]);
    }, 1200);
  };

  return (
    <div style={{ height: '100%', background: '#f4f7fa', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Top Header */}
      <div
        style={{
          padding: '52px 16px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#ffffff',
          borderBottom: '1px solid #e3ebf3',
          zIndex: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#eaf0f6',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={20} color="#24405c" />
        </button>

        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '14px',
            background: master.tint,
            color: '#24405c',
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
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#24405c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {master.name}
          </div>
          <div style={{ fontSize: '11px', color: '#6d8299' }}>
            {master.categoryLabel} · Онлайн
          </div>
        </div>

        <button
          onClick={onViewProfile}
          style={{
            height: '34px',
            padding: '0 14px',
            border: 'none',
            borderRadius: '17px',
            background: '#eaf0f6',
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#24405c',
            cursor: 'pointer',
          }}
        >
          Профіль
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
        <div style={{ alignSelf: 'center', fontSize: '11px', color: '#93a7b8', padding: '2px 0 6px' }}>
          Сьогодні · Онлайн-запис Barb
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-pop"
            style={{
              maxWidth: '82%',
              alignSelf: msg.mine ? 'flex-end' : 'flex-start',
              background: msg.mine ? '#24405c' : '#ffffff',
              color: msg.mine ? '#ffffff' : '#24405c',
              borderRadius: msg.mine ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
              padding: '13px 16px',
              fontSize: '14.5px',
              lineHeight: 1.45,
              boxShadow: '0 2px 8px rgba(36,64,92,0.05)',
              border: msg.mine ? 'none' : '1px solid #e3ebf3',
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
              boxShadow: '0 4px 14px rgba(36,64,92,0.06)',
              border: '1px solid #e3ebf3',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', letterSpacing: '0.08em', fontWeight: 700, color: '#93a7b8', marginBottom: '10px' }}>
              <Clock size={12} color="#f5265f" /> ВІЛЬНІ ВІКОНЦЯ · ЧТ 20 СЕР
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
                    background: '#eaf0f6',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#24405c',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Calendar size={13} color="#6d8299" /> {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {bookedSlot && (
          <div
            className="animate-pop"
            style={{
              background: '#ffd4de',
              borderRadius: '18px',
              padding: '14px 16px',
              color: '#24405c',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(245, 38, 95, 0.25)',
              border: '1px solid #f5265f',
            }}
          >
            <CheckCircle2 size={24} color="#f5265f" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#24405c' }}>Візит підтверджено о {bookedSlot}</div>
              <div style={{ fontSize: '12px', color: '#6d8299' }}>Додано до ваших активних записів</div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input Bottom Bar */}
      <div
        style={{
          padding: '12px 16px 28px',
          background: '#ffffff',
          borderTop: '1px solid #e3ebf3',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Напишіть повідомлення майстру..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
          onClick={handleSend}
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
            boxShadow: '0 4px 14px rgba(245, 38, 95, 0.35)',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
