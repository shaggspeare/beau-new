import React from 'react';
import { Master } from '../../data/crawledMasters';
import { CategoryFilter } from '../../types/app';
import { Search, ChevronRight, Star, ExternalLink, Sparkles, MapPin } from 'lucide-react';

interface DashboardScreenProps {
  masters: Master[];
  onOpenMaster: (id: number) => void;
  onOpenMapWithCategory: (cat: CategoryFilter) => void;
  onOpenProfile: () => void;
  onOpenChat: (masterId: number) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  masters,
  onOpenMaster,
  onOpenMapWithCategory,
  onOpenProfile,
  onOpenChat,
}) => {
  const topMasters = masters.slice(0, 8);

  const categories = [
    { label: 'Hairdressers', cat: 'hair' as CategoryFilter, from: '₴450', count: '10 masters', bg: '#ffc3c0' },
    { label: 'Nails & Art', cat: 'nails' as CategoryFilter, from: '₴300', count: '10 masters', bg: '#c9bcff' },
    { label: 'Laser Epilation', cat: 'laser' as CategoryFilter, from: '₴130', count: '10 salons', bg: '#d9f24e' },
    { label: 'All Specialists', cat: 'All' as CategoryFilter, from: '₴200', count: '30 crawled', bg: '#bfe8d8' },
  ];

  return (
    <div style={{ height: '100%', background: '#f7f6fa', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ flex: 1, padding: '54px 20px 28px' }}>
        {/* Header User Greeting & Profile */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#8d8aa6', letterSpacing: '0.02em' }}>
              KYIV, UKRAINE
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '34px',
                lineHeight: 1.1,
                color: '#1a1938',
                fontWeight: 700,
                marginTop: '2px',
              }}
            >
              Hi, Kate!
            </h1>
          </div>

          <button
            onClick={onOpenProfile}
            title="Profile"
            style={{
              width: '52px',
              height: '52px',
              border: 'none',
              borderRadius: '50%',
              background: '#1a1938',
              color: '#d9f24e',
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(26,25,56,0.15)',
            }}
          >
            KP
          </button>
        </div>

        {/* Upcoming Appointment Card */}
        <div
          onClick={() => onOpenChat(1)}
          style={{
            marginTop: '20px',
            background: '#ffffff',
            borderRadius: '22px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 4px 18px rgba(26,25,56,0.06)',
            cursor: 'pointer',
            border: '1px solid #f0edf6',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#d9f24e',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a1938',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '9px', letterSpacing: '0.08em', fontWeight: 800 }}>AUG</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>20</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1938' }}>Balayage, mid length</div>
            <div style={{ fontSize: '13px', color: '#8d8aa6', marginTop: '3px' }}>Валентина Шевчук · 11:30</div>
          </div>
          <ChevronRight size={20} color="#c3c0d2" />
        </div>

        {/* Search Jump Bar */}
        <div
          onClick={() => onOpenMapWithCategory('All')}
          style={{
            marginTop: '14px',
            height: '50px',
            background: '#ffffff',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            gap: '11px',
            boxShadow: '0 3px 12px rgba(26,25,56,0.05)',
            cursor: 'pointer',
            border: '1px solid #ece9f3',
          }}
        >
          <Search size={16} color="#8d8aa6" />
          <span style={{ fontSize: '14px', color: '#8d8aa6' }}>Search 30 masters in Kyiv on map…</span>
        </div>

        {/* Categories 2x2 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
          {categories.map((c, i) => (
            <button
              key={i}
              onClick={() => onOpenMapWithCategory(c.cat)}
              style={{
                height: '102px',
                border: 'none',
                borderRadius: '20px',
                background: c.bg,
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 3px 12px rgba(26,25,56,0.05)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '10px',
                  background: 'rgba(26,25,56,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                }}
              >
                {c.cat === 'hair' ? '✂️' : c.cat === 'nails' ? '💅' : c.cat === 'laser' ? '⚡' : '✨'}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 700, color: '#1a1938' }}>
                  {c.label}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(26,25,56,0.65)', marginTop: '2px', fontWeight: 500 }}>
                  from {c.from} · {c.count}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Nearby Masters Section Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '26px 0 12px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.08em', fontWeight: 700, color: '#8d8aa6' }}>
            TOP CRAWLED SPECIALISTS
          </div>
          <button
            onClick={() => onOpenMapWithCategory('All')}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '12px',
              letterSpacing: '0.06em',
              fontWeight: 700,
              color: '#6c5ce7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            VIEW ALL (30) ›
          </button>
        </div>

        {/* Nearby Masters Horizontal Carousel */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '6px',
            margin: '0 -4px',
            padding: '0 4px 6px',
          }}
        >
          {topMasters.map((m) => (
            <div
              key={m.id}
              onClick={() => onOpenMaster(m.id)}
              style={{
                width: '185px',
                flexShrink: 0,
                background: '#ffffff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 3px 14px rgba(26,25,56,0.06)',
                cursor: 'pointer',
                border: '1px solid #f0edf6',
                transition: 'transform 0.15s ease',
              }}
            >
              {/* Banner Area with Rating Pill */}
              <div
                style={{
                  height: '110px',
                  background: `linear-gradient(135deg, ${m.tint}33 0%, ${m.tint}99 100%)`,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    height: '24px',
                    padding: '0 8px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#1a1938',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  <Star size={11} fill="#d9f24e" color="#1a1938" /> {m.rating}
                </div>

                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '18px',
                    background: '#ffffff',
                    color: '#1a1938',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '18px',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(26,25,56,0.15)',
                  }}
                >
                  {m.initials}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '12px 14px 14px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#1a1938',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {m.name}
                </div>
                <div style={{ fontSize: '11.5px', color: '#1a1938', fontWeight: 600, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.cleanStreet}
                </div>
                <div style={{ fontSize: '10.5px', color: '#8d8aa6', marginTop: '1px' }}>
                  {m.district} р-н · {m.dist}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1a1938' }}>from {m.minPrice}</span>
                  <span style={{ fontSize: '11px', color: '#6c5ce7', fontWeight: 600 }}>Book ›</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barb.ua Live Crawl Banner */}
        <div
          style={{
            marginTop: '22px',
            background: '#1a1938',
            borderRadius: '20px',
            padding: '18px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#d9f24e' }}>
              <Sparkles size={12} /> LIVE CRAWL DATABASE
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>
              30 Kyiv Masters Crawled
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              Hair, Nails & Laser Epilation parsed from Barb.ua
            </div>
          </div>
          <button
            onClick={() => onOpenMapWithCategory('All')}
            style={{
              padding: '8px 14px',
              borderRadius: '16px',
              background: '#d9f24e',
              color: '#1a1938',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Open Map
          </button>
        </div>
      </div>
    </div>
  );
};
