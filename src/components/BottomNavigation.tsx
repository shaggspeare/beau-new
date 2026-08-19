import React from 'react';
import { ScreenType } from '../types/app';
import { Home, MapPin, MessageCircle, Heart } from 'lucide-react';

interface BottomNavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  unreadChatCount?: number;
  savedCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  onNavigate,
  unreadChatCount = 1,
  savedCount = 2,
}) => {
  const tabs = [
    {
      id: 'dash' as ScreenType,
      label: 'Головна',
      icon: Home,
    },
    {
      id: 'map' as ScreenType,
      label: 'Карта',
      icon: MapPin,
    },
    {
      id: 'chats' as ScreenType,
      label: 'Чати',
      icon: MessageCircle,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
    },
    {
      id: 'favs' as ScreenType,
      label: 'Збережені',
      icon: Heart,
      badge: savedCount > 0 ? savedCount : undefined,
    },
  ];

  return (
    <div
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e3ebf3',
        padding: '10px 16px 28px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'relative',
        zIndex: 30,
        boxShadow: '0 -4px 16px rgba(36, 64, 92, 0.04)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              minWidth: '56px',
              minHeight: '44px',
              justifyContent: 'center',
              position: 'relative',
              color: isActive ? '#f5265f' : '#6d8299',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '10px',
                background: isActive ? '#ffd4de' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isActive ? 'scale(1.06)' : 'scale(1)',
              }}
            >
              <Icon
                size={17}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? '#f5265f' : '#6d8299'}
              />
              {tab.badge !== undefined && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-4px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#f5265f',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #ffffff',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
