import React from 'react';
import { ChevronLeft, Calendar, Bell, CreditCard, Database, LogOut, ArrowRight, Sparkles } from 'lucide-react';

interface ProfileScreenProps {
  savedCount: number;
  onBack: () => void;
  onSignOut: () => void;
  onViewMap: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  savedCount,
  onBack,
  onSignOut,
  onViewMap,
}) => {
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
          Profile
        </h1>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px 34px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* User Card */}
        <div
          style={{
            background: '#1a1938',
            borderRadius: '24px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(26,25,56,0.18)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '20px',
              background: '#d9f24e',
              color: '#1a1938',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-serif)',
              fontSize: '24px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            KP
          </div>

          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Kate Petrenko</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginTop: '3px' }}>
              Kyiv · 4 visits · {savedCount} saved masters
            </div>
          </div>
        </div>

        {/* Menu Items Group */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(26,25,56,0.05)',
            border: '1px solid #f0edf6',
          }}
        >
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #f2f0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#1a1938',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color="#6f6d86" /> My Bookings
            </div>
            <span style={{ fontSize: '12px', color: '#8d8aa6' }}>1 active</span>
          </div>

          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #f2f0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#1a1938',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={16} color="#6f6d86" /> Notifications
            </div>
            <span style={{ fontSize: '12px', color: '#6c5ce7', fontWeight: 700 }}>Enabled</span>
          </div>

          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #f2f0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#1a1938',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={16} color="#6f6d86" /> Payment Methods
            </div>
            <span style={{ fontSize: '12px', color: '#8d8aa6' }}>Apple Pay</span>
          </div>

          <div
            onClick={onViewMap}
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #f2f0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#1a1938',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Database size={16} color="#6f6d86" /> Barb.ua Crawled Dataset
            </div>
            <span style={{ fontSize: '12px', color: '#d9f24e', background: '#1a1938', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
              30 masters
            </span>
          </div>

          <div
            onClick={onSignOut}
            style={{
              padding: '16px 18px',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#e74c3c',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <LogOut size={16} color="#e74c3c" /> Sign out
          </div>
        </div>

        {/* Master Promotion Card */}
        <div
          style={{
            background: '#d9f24e',
            borderRadius: '22px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(217, 242, 78, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#1a1938', letterSpacing: '0.06em' }}>
            <Sparkles size={13} /> PARTNER WITH BEAU
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a1938',
              marginTop: '4px',
            }}
          >
            Work as a beauty master
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'rgba(26,25,56,0.78)', marginTop: '6px', textWrap: 'pretty' }}>
            Publish your service catalog, sync your schedule, take clients in Kyiv, and get pinned on the Beau interactive map.
          </p>
          <button
            style={{
              marginTop: '14px',
              padding: '10px 18px',
              borderRadius: '20px',
              background: '#1a1938',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Master registration <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
