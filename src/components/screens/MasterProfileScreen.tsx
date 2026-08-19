import React, { useState } from 'react';
import { Master } from '../../data/crawledMasters';
import { ChevronLeft, Heart, Star, Phone, MessageCircle, ExternalLink, MapPin, Search, CheckCircle2 } from 'lucide-react';

interface MasterProfileScreenProps {
  master: Master;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
  onBook: () => void;
  onChat: () => void;
}

export const MasterProfileScreen: React.FC<MasterProfileScreenProps> = ({
  master,
  isFavorite,
  onToggleFavorite,
  onBack,
  onBook,
  onChat,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'reviews' | 'portfolio'>('catalog');
  const [serviceSearch, setServiceSearch] = useState('');

  const filteredServices = master.services.filter((s) =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const starBars = [
    { star: '5', width: '88%', count: Math.floor(master.reviewsCount * 0.85) },
    { star: '4', width: '12%', count: Math.floor(master.reviewsCount * 0.12) },
    { star: '3', width: '3%', count: Math.floor(master.reviewsCount * 0.03) },
    { star: '2', width: '0%', count: 0 },
    { star: '1', width: '0%', count: 0 },
  ];

  return (
    <div style={{ height: '100%', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Scrollable Content Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Cover / Studio Backdrop */}
        <div
          style={{
            position: 'relative',
            height: '240px',
            background: `linear-gradient(135deg, ${master.tint}66 0%, #1a1938 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Back & Favorite Buttons */}
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              top: '52px',
              left: '16px',
              width: '42px',
              height: '42px',
              border: 'none',
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(26,25,56,0.18)',
              zIndex: 10,
            }}
          >
            <ChevronLeft size={22} color="#1a1938" />
          </button>

          <button
            onClick={onToggleFavorite}
            style={{
              position: 'absolute',
              top: '52px',
              right: '16px',
              width: '42px',
              height: '42px',
              border: 'none',
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(26,25,56,0.18)',
              zIndex: 10,
            }}
          >
            <Heart size={20} fill={isFavorite ? '#f5265f' : 'none'} color="#f5265f" />
          </button>

          {/* Center Avatar Badge */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '28px',
              background: '#ffffff',
              boxShadow: '0 10px 25px rgba(26,25,56,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              fontWeight: 700,
              color: '#1a1938',
              border: `4px solid ${master.tint}`,
            }}
          >
            {master.initials}
          </div>
        </div>

        {/* Master Details Header */}
        <div style={{ padding: '18px 20px 0', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '8px',
                background: master.type === 'salon' ? '#c6dcf1' : '#ffd4de',
                color: '#24405c',
                fontWeight: 700,
              }}
            >
              {master.type === 'salon' ? 'Салон краси' : 'Приватний майстер'}
            </span>
            <span style={{ fontSize: '11px', color: '#2f6194', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle2 size={12} /> Перевірено на Barb.ua
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '25px',
              fontWeight: 700,
              color: '#24405c',
            }}
          >
            {master.name}
          </h1>

          <p style={{ fontSize: '13px', color: '#6d8299', marginTop: '4px' }}>
            {master.craft} · {master.district}
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              marginTop: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#24405c' }}>
              <MapPin size={14} color="#f5265f" fill="#ffd4de" />
              <span>{master.cleanStreet}, Київ</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#6d8299' }}>
              <span style={{ padding: '1px 6px', borderRadius: '6px', background: '#eaf0f6', color: '#24405c', fontWeight: 600 }}>{master.district} р-н</span>
              <span>· {master.metro}</span>
              <span>· {master.dist}</span>
            </div>
          </div>

          {/* Barb.ua External Link & Social Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <a
              href={master.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '14px',
                background: '#f2f0f6',
                color: '#1a1938',
                fontSize: '11.5px',
                fontWeight: 600,
              }}
            >
              Профіль Barb.ua <ExternalLink size={12} />
            </a>

            {master.phones.length > 0 && (
              <a
                href={`tel:${master.phones[0]}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  borderRadius: '14px',
                  background: '#ffd4de',
                  color: '#24405c',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Phone size={12} /> {master.phones[0]}
              </a>
            )}
          </div>

          {/* Tabs Selector */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              margin: '18px 0 0',
              background: '#f2f0f6',
              borderRadius: '22px',
              padding: '4px',
            }}
          >
            {(
              [
                { id: 'catalog', label: `Прайс (${master.services.length})` },
                { id: 'reviews', label: `Відгуки (${master.reviewsCount})` },
                { id: 'portfolio', label: 'Портфоліо' },
              ] as const
            ).map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    flex: 1,
                    height: '38px',
                    border: 'none',
                    borderRadius: '19px',
                    background: active ? '#24405c' : 'transparent',
                    color: active ? '#ffffff' : '#24405c',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Catalog */}
        {activeTab === 'catalog' && (
          <div style={{ padding: '16px 20px 24px' }}>
            {/* Service Search inside Catalog */}
            {master.services.length > 5 && (
              <div
                style={{
                  height: '42px',
                  background: '#f7f6fa',
                  borderRadius: '21px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 14px',
                  gap: '8px',
                  marginBottom: '14px',
                }}
              >
                <Search size={14} color="#8d8aa6" />
                <input
                  type="text"
                  placeholder="Пошук послуг майстра..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    color: '#1a1938',
                  }}
                />
              </div>
            )}

            {filteredServices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#8d8aa6', fontSize: '13px' }}>
                Послуг за запитом "{serviceSearch}" не знайдено
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredServices.map((srv, idx) => (
                  <div
                    key={idx}
                    onClick={onBook}
                    style={{
                      background: '#f7f6fa',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1938' }}>{srv.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#8d8aa6', marginTop: '2px' }}>
                        {srv.category.replace(/\(\d+\)/, '').trim()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a1938' }}>{srv.price}</div>
                      <span style={{ fontSize: '11px', color: '#f5265f', fontWeight: 700 }}>Обрати ›</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'reviews' && (
          <div style={{ padding: '20px 20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '46px', fontWeight: 700, color: '#1a1938', lineHeight: 1 }}>
                {master.rating}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2px', color: '#f5265f' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f5265f" color="#f5265f" />
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: '#8d8aa6', marginTop: '4px' }}>
                  На основі {master.reviewsCount} перевірених відгуків
                </div>
              </div>
            </div>

            {/* Star Distribution Progress Bars */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {starBars.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#8d8aa6', width: '8px' }}>{b.star}</span>
                  <div style={{ flex: 1, height: '7px', borderRadius: '4px', background: '#f2f0f6', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '4px', background: '#f5265f', width: b.width }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#8d8aa6', width: '28px', textAlign: 'right' }}>{b.count}</span>
                </div>
              ))}
            </div>

            {/* User Reviews List */}
            <div style={{ fontSize: '11px', letterSpacing: '0.08em', fontWeight: 700, color: '#8d8aa6', margin: '24px 0 6px' }}>
              ВІДГУКИ КЛІЄНТІВ
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {master.reviews.map((r, i) => (
                <div key={i} style={{ background: '#f7f6fa', borderRadius: '20px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '12px',
                        background: r.tint,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#1a1938',
                      }}
                    >
                      {r.tag}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1938' }}>{r.who}</div>
                      <div style={{ fontSize: '11px', color: '#a5a2b8' }}>{r.when}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#f5265f', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Star size={12} fill="#f5265f" color="#f5265f" /> {r.stars}
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#6f6d86', marginTop: '9px' }}>
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Portfolio */}
        {activeTab === 'portfolio' && (
          <div style={{ padding: '18px 20px 24px', columns: 2, columnGap: '12px' }}>
            <div style={{ height: '170px', borderRadius: '18px', background: `linear-gradient(135deg, ${master.tint}44 0%, #ded9e9 100%)`, marginBottom: '12px', display: 'flex', alignItems: 'flex-end', padding: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#1a1938' }}>РОБОТИ МАЙСТРА</span>
            </div>
            <div style={{ height: '120px', borderRadius: '18px', background: 'repeating-linear-gradient(135deg,#eee9e6 0 9px,#e6dedd 9px 18px)', marginBottom: '12px' }} />
            <div style={{ height: '140px', borderRadius: '18px', background: 'repeating-linear-gradient(135deg,#e6ece9 0 9px,#dde6e2 9px 18px)', marginBottom: '12px' }} />
            <div style={{ height: '160px', borderRadius: '18px', background: `linear-gradient(135deg, ${master.tint}33 0%, #e4dfd9 100%)`, marginBottom: '12px', display: 'flex', alignItems: 'flex-end', padding: '10px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#6f6d86' }}>ФОТО СТУДІЇ</span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div
        style={{
          borderTop: '1px solid #ece9f3',
          padding: '12px 20px 32px',
          display: 'flex',
          gap: '10px',
          background: '#ffffff',
        }}
      >
        <button
          onClick={onChat}
          title="Написати повідомлення"
          style={{
            width: '52px',
            height: '52px',
            border: 'none',
            borderRadius: '26px',
            background: '#f2f0f6',
            color: '#1a1938',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MessageCircle size={20} />
        </button>

        <button
          onClick={onBook}
          style={{
            flex: 1,
            height: '52px',
            border: 'none',
            borderRadius: '26px',
            background: '#f5265f',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(245, 38, 95, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          Записатися на візит (від {master.minPrice})
        </button>
      </div>
    </div>
  );
};
