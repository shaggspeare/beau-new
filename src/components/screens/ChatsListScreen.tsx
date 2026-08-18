import React from 'react';
import { Master } from '../../data/crawledMasters';
import { ChevronLeft } from 'lucide-react';

interface ChatsListScreenProps {
  masters: Master[];
  onOpenChat: (masterId: number) => void;
  onBack: () => void;
}

export const ChatsListScreen: React.FC<ChatsListScreenProps> = ({
  masters,
  onOpenChat,
  onBack,
}) => {
  const sampleChats = [
    {
      master: masters[0] || masters[0],
      lastMsg: '🎉 Confirmed! You are booked for Thursday at 11:30.',
      time: '10:24',
      unread: true,
    },
    {
      master: masters[10] || masters[1],
      lastMsg: 'Sure, gel manicure with French design takes about 1 hour.',
      time: 'Yesterday',
      unread: false,
    },
    {
      master: masters[20] || masters[2],
      lastMsg: 'Laser diode package consultation is complimentary!',
      time: 'Mon',
      unread: false,
    },
  ];

  return (
    <div style={{ height: '100%', background: '#f7f6fa', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div
        style={{
          padding: '54px 18px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          borderBottom: '1px solid #ece9f3',
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: '38px',
            height: '38px',
            border: 'none',
            borderRadius: '50%',
            background: '#f2f0f6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color="#1a1938" />
        </button>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: '#1a1938' }}>
          Chats
        </h1>
      </div>

      {/* Chat Threads */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 16px 34px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {sampleChats.map((chat, idx) => (
          <div
            key={idx}
            onClick={() => onOpenChat(chat.master.id)}
            style={{
              display: 'flex',
              gap: '13px',
              padding: '14px',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 2px 10px rgba(26,25,56,0.05)',
              cursor: 'pointer',
              border: chat.unread ? '1.5px solid #1a1938' : '1px solid #f0edf6',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: chat.master.tint,
                color: '#1a1938',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: 700,
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {chat.master.initials}
              {chat.unread && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#1a1938',
                    border: '2px solid #ffffff',
                  }}
                />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a1938' }}>
                  {chat.master.name}
                </span>
                <span style={{ fontSize: '11px', color: '#a5a2b8', flexShrink: 0 }}>
                  {chat.time}
                </span>
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: chat.unread ? '#1a1938' : '#8d8aa6',
                  fontWeight: chat.unread ? 600 : 400,
                  marginTop: '3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {chat.lastMsg}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
