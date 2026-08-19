import React from 'react';
import { Master } from '../../data/crawledMasters';
import { CategoryFilter } from '../../types/app';
import { Search, ChevronRight, Star, Sparkles, MapPin } from 'lucide-react';

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
    { label: 'Перукарі', cat: 'hair' as CategoryFilter, from: '₴450', count: '10 майстрів', bg: '#ffd4de' },
    { label: 'Манікюр та нігті', cat: 'nails' as CategoryFilter, from: '₴300', count: '10 майстрів', bg: '#c6dcf1' },
    { label: 'Лазерна епіляція', cat: 'laser' as CategoryFilter, from: '₴130', count: '10 салонів', bg: '#dbe8f5' },
    { label: 'Усі спеціалісти', cat: 'All' as CategoryFilter, from: '₴200', count: '30 у базі', bg: '#ffe6ec' },
  ];

  return (
    <div style={{ height: '100%', background: '#f4f7fa', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ flex: 1, padding: '54px 20px 28px' }}>
        {/* Header User Greeting & Profile */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6d8299', letterSpacing: '0.02em' }}>
              КИЇВ, УКРАЇНА
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '34px',
                lineHeight: 1.1,
                color: '#24405c',
                fontWeight: 700,
                marginTop: '2px',
              }}
            >
              Привіт, Катю!
            </h1>
          </div>

          <button
            onClick={onOpenProfile}
            title="Профіль"
            style={{
              width: '52px',
              height: '52px',
              border: 'none',
              borderRadius: '50%',
              background: '#24405c',
              color: '#ffd4de',
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(36,64,92,0.15)',
            }}
          >
            КП
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
            boxShadow: '0 4px 18px rgba(36,64,92,0.06)',
            cursor: 'pointer',
            border: '1px solid #e3ebf3',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#ffd4de',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f5265f',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '9px', letterSpacing: '0.08em', fontWeight: 800 }}>СЕР</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>20</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#24405c' }}>Балаяж, середня довжина</div>
            <div style={{ fontSize: '13px', color: '#6d8299', marginTop: '3px' }}>Валентина Шевчук · 11:30</div>
          </div>
          <ChevronRight size={20} color="#adc0d0" />
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
            boxShadow: '0 3px 12px rgba(36,64,92,0.05)',
            cursor: 'pointer',
            border: '1px solid #e3ebf3',
          }}
        >
          <Search size={16} color="#6d8299" />
          <span style={{ fontSize: '14px', color: '#6d8299' }}>Пошук серед 30 майстрів Києва на карті…</span>
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
                boxShadow: '0 3px 12px rgba(36,64,92,0.05)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '10px',
                  background: 'rgba(36,64,92,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                }}
              >
                {c.cat === 'hair' ? '✂️' : c.cat === 'nails' ? '💅' : c.cat === 'laser' ? '⚡' : '✨'}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 700, color: '#24405c' }}>
                  {c.label}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(36,64,92,0.7)', marginTop: '2px', fontWeight: 500 }}>
                  від {c.from} · {c.count}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Section Heading: Specialists */}
        <div
          style={{
            marginTop: '28px',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: '#24405c' }}>
            Рекомендовані майстри
          </h2>
          <button
            onClick={() => onOpenMapWithCategory('All')}
            style={{
              border: 'none',
              background: 'none',
              color: '#2f6194',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Усі (30) ›
          </button>
        </div>

        {/* Masters Carousel Row */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            marginTop: '14px',
            paddingBottom: '6px',
          }}
        >
          {topMasters.map((m) => (
            <div
              key={m.id}
              onClick={() => onOpenMaster(m.id)}
              style={{
                width: '176px',
                borderRadius: '22px',
                background: '#ffffff',
                border: '1px solid #e3ebf3',
                overflow: 'hidden',
                flexShrink: 0,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(36,64,92,0.05)',
                transition: 'transform 0.15s ease',
              }}
            >
              {/* Header Visual Box */}
              <div
                style={{
                  height: '110px',
                  background: m.tint,
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
                    color: '#f5265f',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                >
                  <Star size={11} fill="#f5265f" color="#f5265f" /> {m.rating}
                </div>

                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '18px',
                    background: '#ffffff',
                    color: '#24405c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '18px',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(36,64,92,0.15)',
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
                    color: '#24405c',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {m.name}
                </div>
                <div style={{ fontSize: '11.5px', color: '#24405c', fontWeight: 600, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.cleanStreet}
                </div>
                <div style={{ fontSize: '10.5px', color: '#6d8299', marginTop: '1px' }}>
                  {m.district} р-н · {m.dist}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#24405c' }}>від {m.minPrice}</span>
                  <span style={{ fontSize: '11px', color: '#f5265f', fontWeight: 700 }}>Запис ›</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barb.ua Live Crawl Banner */}
        <div
          style={{
            marginTop: '22px',
            background: '#24405c',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#ffd4de' }}>
              <Sparkles size={12} color="#f5265f" /> БАЗА ДАНИХ BARB.UA
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>
              30 майстрів Києва
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              Перукарі, манікюр та лазерна епіляція з реальними цінами
            </div>
          </div>
          <button
            onClick={() => onOpenMapWithCategory('All')}
            style={{
              padding: '8px 14px',
              borderRadius: '16px',
              background: '#f5265f',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(245, 38, 95, 0.35)',
            }}
          >
            На карту
          </button>
        </div>
      </div>
    </div>
  );
};
