import React, { useState } from 'react';
import { UserRole } from '../types/app';
import { Master } from '../data/crawledMasters';
import { Sparkles, User, ChevronDown, Check } from 'lucide-react';

interface RoleSwitcherPillProps {
  currentRole: UserRole;
  currentMaster: Master;
  allMasters: Master[];
  onSwitchRole: (role: UserRole) => void;
  onSelectMaster: (masterId: number) => void;
}

export const RoleSwitcherPill: React.FC<RoleSwitcherPillProps> = ({
  currentRole,
  currentMaster,
  allMasters,
  onSwitchRole,
  onSelectMaster,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      {/* Switcher Toggle Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: currentRole === 'client' ? '#ffffff' : '#121127',
          borderRadius: '24px',
          padding: '3px',
          boxShadow: '0 4px 16px rgba(26,25,56,0.12)',
          border: currentRole === 'client' ? '1px solid #ece9f3' : '1px solid #2b2954',
        }}
      >
        {/* Client Tab */}
        <button
          onClick={() => onSwitchRole('client')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            background: currentRole === 'client' ? '#1a1938' : 'transparent',
            color: currentRole === 'client' ? '#ffffff' : 'rgba(255,255,255,0.6)',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <User size={13} color={currentRole === 'client' ? '#d9f24e' : 'currentColor'} />
          <span>Client (Kate)</span>
        </button>

        {/* Master Tab */}
        <button
          onClick={() => onSwitchRole('master')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            background: currentRole === 'master' ? '#d9f24e' : 'transparent',
            color: currentRole === 'master' ? '#1a1938' : '#6f6d86',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <Sparkles size={13} />
          <span>Master Portal</span>
        </button>

        {/* Master Selector dropdown trigger when in master mode */}
        {currentRole === 'master' && (
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Switch Managed Master"
            style={{
              padding: '4px 8px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: 'none',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '4px',
            }}
          >
            <span style={{ maxWidth: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentMaster.name.split(' ')[0]}
            </span>
            <ChevronDown size={12} />
          </button>
        )}
      </div>

      {/* Dropdown to pick which of the 30 crawled masters to manage */}
      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '42px',
            right: 0,
            width: '260px',
            maxHeight: '340px',
            overflowY: 'auto',
            background: '#1a1938',
            borderRadius: '18px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            border: '1px solid #2b2954',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ padding: '6px 8px', fontSize: '10.5px', fontWeight: 800, color: '#d9f24e', letterSpacing: '0.06em' }}>
            SELECT CRAWLED MASTER ({allMasters.length})
          </div>

          {allMasters.map((m) => {
            const isSelected = m.id === currentMaster.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onSelectMaster(m.id);
                  setDropdownOpen(false);
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(217, 242, 78, 0.15)' : 'transparent',
                  color: isSelected ? '#d9f24e' : '#ffffff',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)' }}>
                    {m.categoryLabel} · {m.district}
                  </div>
                </div>
                {isSelected && <Check size={14} color="#d9f24e" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
