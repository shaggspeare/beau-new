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
    <div style={{ height: '100%', background: '#f4f7fa', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div
        style={{
          padding: '54px 18px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          borderBottom: '1px solid #e3ebf3',
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: '38px',
            height: '38px',
            border: 'none',
            borderRadius: '50%',
            background: '#eaf0f6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color="#24405c" />
        </button>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: '#24405c' }}>
          Профіль
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
            background: '#24405c',
            borderRadius: '24px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(36,64,92,0.18)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '20px',
              background: '#ffd4de',
              color: '#f5265f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-serif)',
              fontSize: '24px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            КП
          </div>

          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Катерина Петренко</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '3px' }}>
              Київ · 4 візити · {savedCount} збережених майстрів
            </div>
          </div>
        </div>

        {/* Menu Items Group */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(36,64,92,0.05)',
            border: '1px solid #e3ebf3',
          }}
        >
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #eaf0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#24405c',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color="#6d8299" /> Мої записи
            </div>
            <span style={{ fontSize: '12px', color: '#6d8299' }}>1 активний</span>
          </div>

          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #eaf0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#24405c',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={16} color="#6d8299" /> Сповіщення
            </div>
            <span style={{ fontSize: '12px', color: '#f5265f', fontWeight: 700 }}>Увімкнено</span>
          </div>

          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #eaf0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#24405c',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={16} color="#6d8299" /> Способи оплати
            </div>
            <span style={{ fontSize: '12px', color: '#6d8299' }}>Apple Pay</span>
          </div>

          <div
            onClick={onViewMap}
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #eaf0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#24405c',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Database size={16} color="#6d8299" /> База даних Barb.ua
            </div>
            <span style={{ fontSize: '12px', color: '#ffffff', background: '#f5265f', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
              30 майстрів
            </span>
          </div>

          <div
            onClick={onSignOut}
            style={{
              padding: '16px 18px',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#f5265f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <LogOut size={16} color="#f5265f" /> Вийти з акаунта
          </div>
        </div>

        {/* Master Promotion Card */}
        <div
          style={{
            background: '#ffd4de',
            borderRadius: '22px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(245, 38, 95, 0.15)',
            border: '1px solid rgba(245, 38, 95, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#f5265f', letterSpacing: '0.06em' }}>
            <Sparkles size={13} /> СПІВПРАЦЯ З BARB
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#24405c',
              marginTop: '4px',
            }}
          >
            Працюйте як б'юті-майстер
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#24405c', marginTop: '6px', opacity: 0.85 }}>
            Публікуйте свій прайс-лист, налаштовуйте розклад, приймайте клієнтів у Києві та отримуйте мітку на інтерактивній карті Barb.
          </p>
          <button
            style={{
              marginTop: '14px',
              padding: '10px 18px',
              borderRadius: '20px',
              background: '#f5265f',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(245, 38, 95, 0.3)',
            }}
          >
            Реєстрація для майстрів <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
