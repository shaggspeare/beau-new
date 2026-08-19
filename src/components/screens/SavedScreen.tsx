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
          Збережені ({favoriteMasters.length})
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
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6d8299' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#eaf0f6',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={28} color="#adc0d0" />
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#24405c', marginBottom: '6px' }}>
              У вас поки немає збережених майстрів
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
              Переглядайте інтерактивну карту Києва та натискайте на серце, щоб зберегти улюблених спеціалістів.
            </p>
            <button
              onClick={onExploreMap}
              style={{
                padding: '12px 24px',
                borderRadius: '24px',
                background: '#f5265f',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(245, 38, 95, 0.35)',
              }}
            >
              Відкрити карту
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
                boxShadow: '0 2px 10px rgba(36,64,92,0.05)',
                cursor: 'pointer',
                border: '1px solid #e3ebf3',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: m.tint,
                  color: '#24405c',
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
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#24405c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '12.5px', color: '#6d8299', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{m.craft.split(',')[0]}</span> · <Star size={11} fill="#f5265f" color="#f5265f" /> {m.rating}
                </div>
                <div style={{ fontSize: '11px', color: '#93a7b8', marginTop: '2px' }}>
                  від {m.minPrice} · {m.district}
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
                <Heart size={20} fill="#f5265f" color="#f5265f" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
