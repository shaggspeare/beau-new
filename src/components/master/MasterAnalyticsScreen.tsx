import React from 'react';
import { Master } from '../../data/crawledMasters';
import { TrendingUp, Users, Calendar, Star, DollarSign, Award, ArrowUpRight } from 'lucide-react';

interface MasterAnalyticsScreenProps {
  master: Master;
}

export const MasterAnalyticsScreen: React.FC<MasterAnalyticsScreenProps> = ({ master }) => {
  return (
    <div style={{ height: '100%', background: '#121127', color: '#ffffff', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', background: '#1a1938', borderBottom: '1px solid #232145' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>
          Performance & Analytics
        </h1>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
          Insights for {master.name} (Kyiv, {master.district})
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '18px 18px 30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Main Revenue Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1938 0%, #2b2954 100%)',
            borderRadius: '24px',
            padding: '20px',
            border: '1.5px solid #d9f24e',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.08em', fontWeight: 800, color: '#d9f24e' }}>
              MONTHLY EARNINGS
            </span>
            <span style={{ fontSize: '11px', color: '#bfe8d8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowUpRight size={13} /> +18.4% this month
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
            ₴54,200
          </div>
          <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
            38 completed appointments in Kyiv
          </div>
        </div>

        {/* 4 Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: '#1a1938', borderRadius: '18px', padding: '14px', border: '1px solid #2b2954' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
              <Calendar size={13} /> Total Bookings
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              142
            </div>
            <div style={{ fontSize: '10.5px', color: '#bfe8d8', marginTop: '2px' }}>96% completed</div>
          </div>

          <div style={{ background: '#1a1938', borderRadius: '18px', padding: '14px', border: '1px solid #2b2954' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
              <Star size={13} color="#d9f24e" /> Rating Score
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#d9f24e', marginTop: '4px' }}>
              {master.rating} ★
            </div>
            <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
              {master.reviewsCount} reviews
            </div>
          </div>

          <div style={{ background: '#1a1938', borderRadius: '18px', padding: '14px', border: '1px solid #2b2954' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
              <Users size={13} /> Repeat Clients
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#c9bcff', marginTop: '4px' }}>
              74%
            </div>
            <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>High loyalty</div>
          </div>

          <div style={{ background: '#1a1938', borderRadius: '18px', padding: '14px', border: '1px solid #2b2954' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
              <Award size={13} /> Map Visibility
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffc3c0', marginTop: '4px' }}>
              Top 5%
            </div>
            <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Kyiv {master.district}</div>
          </div>
        </div>

        {/* Top Services Breakdown */}
        <div style={{ background: '#1a1938', borderRadius: '20px', padding: '16px', border: '1px solid #2b2954' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', fontWeight: 800, color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
            TOP REQUESTED SERVICES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: master.services[0]?.name || 'Primary Hair Service', pct: '48%', rev: '₴26,000' },
              { name: master.services[1]?.name || 'Secondary Service', pct: '28%', rev: '₴15,200' },
              { name: master.services[2]?.name || 'Care / Toning', pct: '18%', rev: '₴9,800' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>{s.name}</span>
                  <span style={{ fontWeight: 700, color: '#d9f24e' }}>{s.rev}</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', background: '#d9f24e', width: s.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
