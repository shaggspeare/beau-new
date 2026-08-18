import React from 'react';
import { Master } from '../../data/crawledMasters';
import { ChevronLeft, Heart, Star, MapPin } from 'lucide-react';

interface SavedScreenProps {
  favoriteMasters: Master[];
  onOpenMaster: (masterId: number) => void;
  onToggleFavorite: (masterId: number) => void;
  onBack: () => void;
  onExploreMap: () => void;
}

export const SavedScreen: React.FC<SavedScreenProps> = ({
  favoriteMasters,
  onOpenMaster,
  onToggleFavorite,
  onBack,
  onExploreMap,
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
          Saved ({favoriteMasters.length})
        </h1>
      </div>

      {/* List / Empty State */}
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
        {favoriteMasters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8d8aa6' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f2f0f6',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={28} color="#c3c0d2" />
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#1a1938', marginBottom: '6px' }}>
              No saved specialists yet
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
              Browse the interactive Kyiv map and tap the heart icon to save your favorite masters.
            </p>
            <button
              onClick={onExploreMap}
              style={{
                padding: '12px 24px',
                borderRadius: '24px',
                background: '#d9f24e',
                color: '#1a1938',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Explore Map
            </button>
          </div>
        ) : (
          favoriteMasters.map((m) => (
            <div
              key={m.id}
              onClick={() => onOpenMaster(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '13px',
                padding: '14px',
                background: '#ffffff',
                borderRadius: '20px',
                boxShadow: '0 2px 10px rgba(26,25,56,0.05)',
                cursor: 'pointer',
                border: '1px solid #f0edf6',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: m.tint,
                  color: '#1a1938',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {m.initials}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1938', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '12.5px', color: '#8d8aa6', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{m.craft.split(',')[0]}</span> · <Star size={11} fill="#d9f24e" color="#1a1938" /> {m.rating}
                </div>
                <div style={{ fontSize: '11px', color: '#6f6d86', marginTop: '2px' }}>
                  from {m.minPrice} · {m.district}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(m.id);
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={20} fill="#f4938e" color="#f4938e" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
