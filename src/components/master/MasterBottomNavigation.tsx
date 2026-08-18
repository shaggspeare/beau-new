import React from 'react';
import { MasterScreenType } from '../../types/app';
import { Calendar, Tag, MessageSquare, TrendingUp, MapPin } from 'lucide-react';

interface MasterBottomNavigationProps {
  currentScreen: MasterScreenType;
  onNavigate: (screen: MasterScreenType) => void;
  pendingCount?: number;
  unreadCount?: number;
}

export const MasterBottomNavigation: React.FC<MasterBottomNavigationProps> = ({
  currentScreen,
  onNavigate,
  pendingCount = 1,
  unreadCount = 1,
}) => {
  const tabs = [
    {
      id: 'schedule' as MasterScreenType,
      label: 'Schedule',
      icon: Calendar,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'catalog' as MasterScreenType,
      label: 'Catalog',
      icon: Tag,
    },
    {
      id: 'chats' as MasterScreenType,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'analytics' as MasterScreenType,
      label: 'Stats',
      icon: TrendingUp,
    },
    {
      id: 'preview' as MasterScreenType,
      label: 'Map Pin',
      icon: MapPin,
    },
  ];

  return (
    <div
      style={{
        background: '#1a1938',
        borderTop: '1px solid #2b2954',
        padding: '10px 12px 28px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'relative',
        zIndex: 30,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.25)',
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
              minWidth: '52px',
              minHeight: '44px',
              justifyContent: 'center',
              position: 'relative',
              color: isActive ? '#d9f24e' : 'rgba(255, 255, 255, 0.55)',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: isActive ? 'rgba(217, 242, 78, 0.2)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <Icon
                size={16}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? '#d9f24e' : 'rgba(255, 255, 255, 0.6)'}
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
                    background: '#d9f24e',
                    color: '#1a1938',
                    fontSize: '9px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #1a1938',
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
