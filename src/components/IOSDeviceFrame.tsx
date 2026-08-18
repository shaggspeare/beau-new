import React, { useState, useEffect } from 'react';
import { ScreenType, UserRole } from '../types/app';
import { Master } from '../data/crawledMasters';
import { RoleSwitcherPill } from './RoleSwitcherPill';
import {
  Smartphone,
  Maximize2,
  RotateCcw,
  MapPin,
  Sparkles,
  User,
  MessageCircle,
  Heart,
  Compass,
  Calendar,
  Tag,
  TrendingUp,
  X,
  Sliders,
  Layers,
} from 'lucide-react';

interface IOSDeviceFrameProps {
  children: React.ReactNode;
  currentScreen: ScreenType;
  userRole: UserRole;
  currentMaster: Master;
  allMasters: Master[];
  dark?: boolean;
  onSwitchRole: (role: UserRole) => void;
  onSelectManagedMaster: (masterId: number) => void;
  onNavigate: (screen: any) => void;
  onReset: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const IOSDeviceFrame: React.FC<IOSDeviceFrameProps> = ({
  children,
  currentScreen,
  userRole,
  currentMaster,
  allMasters,
  dark = false,
  onSwitchRole,
  onSelectManagedMaster,
  onNavigate,
  onReset,
  fullscreen,
  onToggleFullscreen,
}) => {
  const [time, setTime] = useState('9:41');
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 820
  );
  const [showMobileRouter, setShowMobileRouter] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 820);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isDarkContent = userRole === 'master' || currentScreen === 'login';
  const statusColor = isDarkContent || dark ? '#ffffff' : '#1a1938';

  const clientScreens = [
    { id: 'map', label: 'Interactive Map (30 Masters)', icon: MapPin },
    { id: 'dash', label: 'Dashboard / Home', icon: Compass },
    { id: 'master', label: 'Master Profile & Catalog', icon: User },
    { id: 'bot', label: 'Beau Assistant Bot', icon: Sparkles },
    { id: 'chat', label: 'Chat & Booking Flow', icon: MessageCircle },
    { id: 'favs', label: 'Saved Favorites', icon: Heart },
    { id: 'login', label: 'Splash / Welcome Screen', icon: Smartphone },
  ] as const;

  const masterScreens = [
    { id: 'schedule', label: 'Schedule & Client Requests', icon: Calendar },
    { id: 'catalog', label: 'Service Catalog & Prices', icon: Tag },
    { id: 'chats', label: 'Client Messages', icon: MessageCircle },
    { id: 'analytics', label: 'Revenue & Performance', icon: TrendingUp },
    { id: 'preview', label: 'Map Pin & Studio Profile', icon: MapPin },
  ] as const;

  // ==========================================
  // 1. MOBILE NATIVE VIEW (< 820px)
  // Real full UI edge-to-edge + Floating Red Button
  // ==========================================
  if (isMobile || fullscreen) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100dvh',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          background: isDarkContent ? '#121127' : '#f7f6fa',
        }}
      >
        {/* Fullscreen Mobile Viewport */}
        <main
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </main>

        {/* Floating Red Router Action Button (Mobile FAB) */}
        <button
          onClick={() => setShowMobileRouter(true)}
          title="Open Screen & Role Router"
          className="floating-red-btn"
          style={{
            position: 'fixed',
            bottom: '78px',
            right: '16px',
            zIndex: 9999,
            height: '42px',
            padding: '0 14px 0 10px',
            borderRadius: '21px',
            background: 'linear-gradient(135deg, #ff4757 0%, #ee2f43 100%)',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(255, 71, 87, 0.45)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sliders size={13} color="#ffffff" />
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            Router
          </span>
        </button>

        {/* Mobile Router Menu Drawer / Modal */}
        {showMobileRouter && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(26, 25, 56, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
            onClick={() => setShowMobileRouter(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: '28px 28px 0 0',
                padding: '20px 20px 34px',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                animation: 'mobile-drawer-up 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                overflowY: 'auto',
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#d9f24e',
                      color: '#1a1938',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    b
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#1a1938',
                        lineHeight: 1,
                      }}
                    >
                      Beau Router
                    </h3>
                    <span style={{ fontSize: '11px', color: '#8d8aa6' }}>
                      Screen & Dual Role Switcher
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowMobileRouter(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#f2f0f6',
                    border: 'none',
                    color: '#1a1938',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Role Switcher */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    fontWeight: 800,
                    color: '#8d8aa6',
                    marginBottom: '8px',
                  }}
                >
                  ACTIVE DUAL ROLE
                </div>
                <RoleSwitcherPill
                  currentRole={userRole}
                  currentMaster={currentMaster}
                  allMasters={allMasters}
                  onSwitchRole={(r) => {
                    onSwitchRole(r);
                  }}
                  onSelectMaster={(id) => {
                    onSelectManagedMaster(id);
                  }}
                />
              </div>

              {/* Screen Navigator Buttons */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    fontWeight: 800,
                    color: '#8d8aa6',
                    marginBottom: '8px',
                  }}
                >
                  JUMP TO SCREEN ({userRole.toUpperCase()})
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                  }}
                >
                  {(userRole === 'client' ? clientScreens : masterScreens).map((item) => {
                    const active = currentScreen === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setShowMobileRouter(false);
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '14px',
                          background: active ? '#1a1938' : '#f7f6fa',
                          color: active ? '#ffffff' : '#1a1938',
                          border: active ? '1.5px solid #1a1938' : '1px solid #f0edf6',
                          fontSize: '12px',
                          fontWeight: active ? 700 : 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left',
                        }}
                      >
                        <Icon size={15} color={active ? '#d9f24e' : '#8d8aa6'} />
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.label.split('(')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => {
                    onReset();
                    setShowMobileRouter(false);
                  }}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '21px',
                    background: '#f2f0f6',
                    color: '#1a1938',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCcw size={14} /> Restart Flow
                </button>
                <button
                  onClick={() => setShowMobileRouter(false)}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '21px',
                    background: '#1a1938',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. DESKTOP VIEW (>= 820px)
  // Phone Render Mockup on Left + Menu on Right
  // ==========================================
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        gap: '44px',
        flexWrap: 'wrap',
        background: 'linear-gradient(135deg, #f2f0f6 0%, #e9e6ef 100%)',
      }}
    >
      {/* iOS Device Bezel Mockup Frame */}
      <div
        style={{
          width: '402px',
          height: '874px',
          borderRadius: '54px',
          background: '#090814',
          padding: '12px',
          boxShadow:
            '0 30px 80px rgba(26, 25, 56, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 0 3px #232238',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Screen Glass Surface */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '44px',
            overflow: 'hidden',
            position: 'relative',
            background: isDarkContent ? '#121127' : '#f7f6fa',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* iOS Status Bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 28px',
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
            {/* Time */}
            <span
              style={{
                fontFamily: '-apple-system, "SF Pro", system-ui',
                fontWeight: 600,
                fontSize: '15px',
                color: statusColor,
                letterSpacing: '-0.02em',
                paddingTop: '2px',
              }}
            >
              {time}
            </span>

            {/* Dynamic Island Pill */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '116px',
                height: '32px',
                borderRadius: '16px',
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
              }}
            >
              <div
                style={{
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  background: '#090814',
                  border: '1px solid #1a1938',
                }}
              />
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#1c1b30',
                }}
              />
            </div>

            {/* Signal, WiFi, Battery */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: statusColor,
                paddingTop: '2px',
              }}
            >
              <svg width="17" height="11" viewBox="0 0 17 11">
                <rect x="0" y="7" width="3" height="4" rx="0.5" fill={statusColor} />
                <rect x="4.5" y="4.5" width="3" height="6.5" rx="0.5" fill={statusColor} />
                <rect x="9" y="2" width="3" height="9" rx="0.5" fill={statusColor} />
                <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill={statusColor} />
              </svg>
              <svg width="16" height="11" viewBox="0 0 16 11">
                <path
                  d="M8 2.8C10.2 2.8 12.1 3.6 13.5 5L14.5 4C12.8 2.3 10.5 1.2 8 1.2C5.5 1.2 3.2 2.3 1.5 4L2.5 5C3.9 3.6 5.8 2.8 8 2.8Z"
                  fill={statusColor}
                />
                <circle cx="8" cy="9.5" r="1.3" fill={statusColor} />
              </svg>
              <svg width="25" height="12" viewBox="0 0 25 12">
                <rect
                  x="0.5"
                  y="0.5"
                  width="21"
                  height="11"
                  rx="3.5"
                  stroke={statusColor}
                  strokeOpacity="0.4"
                  fill="none"
                />
                <rect x="2" y="2" width="16" height="8" rx="2" fill={statusColor} />
                <path
                  d="M23 4V8C23.6 7.7 24 7 24 6C24 5 23.6 4.3 23 4Z"
                  fill={statusColor}
                  fillOpacity="0.4"
                />
              </svg>
            </div>
          </div>

          {/* Device Screen Body */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '136px',
              height: '5px',
              borderRadius: '3px',
              background: isDarkContent ? '#ffffff' : '#1a1938',
              opacity: 0.8,
              zIndex: 60,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Desktop Side Presentation & Router Panel (Rendered to the right on desktop) */}
      <aside
        style={{
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          color: '#6f6d86',
          fontSize: '13px',
          lineHeight: 1.6,
        }}
      >
        {/* Brand Card */}
        <div
          style={{
            background: '#ffffff',
            padding: '22px',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(26, 25, 56, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#d9f24e',
                color: '#1a1938',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              b
            </div>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#1a1938',
                  lineHeight: 1,
                }}
              >
                Beau · Kyiv
              </h1>
              <span style={{ fontSize: '11px', color: '#8d8aa6', fontWeight: 600 }}>
                Dual Mode: Client & Master
              </span>
            </div>
          </div>

          {/* Role Switcher */}
          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.08em',
                fontWeight: 800,
                color: '#8d8aa6',
                marginBottom: '6px',
              }}
            >
              SWITCH DUAL ROLE
            </div>
            <RoleSwitcherPill
              currentRole={userRole}
              currentMaster={currentMaster}
              allMasters={allMasters}
              onSwitchRole={onSwitchRole}
              onSelectMaster={onSelectManagedMaster}
            />
          </div>

          <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
            <button
              onClick={onToggleFullscreen}
              style={{
                flex: 1,
                height: '38px',
                borderRadius: '19px',
                background: '#1a1938',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Maximize2 size={13} /> Fullscreen Mode
            </button>
            <button
              onClick={onReset}
              title="Restart Prototype Flow"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '19px',
                background: '#f2f0f6',
                color: '#1a1938',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Desktop Screen Navigator List */}
        <div
          style={{
            background: '#ffffff',
            padding: '18px 20px',
            borderRadius: '20px',
            boxShadow: '0 4px 16px rgba(26, 25, 56, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: '#8d8aa6',
              marginBottom: '10px',
            }}
          >
            ACTIVE SCREEN ({userRole.toUpperCase()}):{' '}
            <span style={{ color: '#1a1938' }}>
              {currentScreen}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(userRole === 'client' ? clientScreens : masterScreens).map((item) => {
              const active = currentScreen === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: active ? '#1a1938' : '#f7f6fa',
                    color: active ? '#ffffff' : '#1a1938',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Icon size={14} color={active ? '#d9f24e' : '#8d8aa6'} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
};
