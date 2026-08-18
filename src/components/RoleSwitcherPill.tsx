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
          background: currentRole === 'client' ? '#ffffff' : '#16283b',
          borderRadius: '24px',
          padding: '3px',
          boxShadow: '0 4px 16px rgba(36,64,92,0.12)',
          border: currentRole === 'client' ? '1px solid #e3ebf3' : '1px solid #24405c',
        }}
      >
        {/* Client Tab */}
        <button
          onClick={() => onSwitchRole('client')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            background: currentRole === 'client' ? '#24405c' : 'transparent',
            color: currentRole === 'client' ? '#ffffff' : 'rgba(255,255,255,0.7)',
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
          <User size={13} color={currentRole === 'client' ? '#ffd4de' : 'currentColor'} />
          <span>Client (Kate)</span>
        </button>

        {/* Master Tab */}
        <button
          onClick={() => onSwitchRole('master')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            background: currentRole === 'master' ? '#f5265f' : 'transparent',
            color: currentRole === 'master' ? '#ffffff' : '#6d8299',
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
          <Sparkles size={13} color="#ffffff" />
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
              background: 'rgba(255,255,255,0.12)',
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
            background: '#16283b',
            borderRadius: '18px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            border: '1px solid #24405c',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ padding: '6px 8px', fontSize: '10.5px', fontWeight: 800, color: '#ffd4de', letterSpacing: '0.06em' }}>
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
                  background: isSelected ? 'rgba(245, 38, 95, 0.25)' : 'transparent',
                  color: isSelected ? '#ffffff' : '#ffffff',
                  border: isSelected ? '1px solid #f5265f' : 'none',
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
                  <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.65)' }}>
                    {m.categoryLabel} · {m.district}
                  </div>
                </div>
                {isSelected && <Check size={14} color="#f5265f" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
