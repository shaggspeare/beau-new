import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Master } from '../../data/crawledMasters';
import { MapPin, Phone, Globe, Eye, Share2 } from 'lucide-react';

interface MasterMapPreviewScreenProps {
  master: Master;
  onViewAsClient: () => void;
}

export const MasterMapPreviewScreen: React.FC<MasterMapPreviewScreenProps> = ({
  master,
  onViewAsClient,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: {
          version: 8,
          sources: {
            'carto-voyager': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              ],
              tileSize: 256,
            },
          },
          layers: [
            {
              id: 'carto-layer',
              type: 'raster',
              source: 'carto-voyager',
            },
          ],
        },
        center: [master.lng, master.lat],
        zoom: 14,
        pitch: 35,
        attributionControl: false,
      });

      // Custom Round Pin for Master
      const el = document.createElement('div');
      el.className = 'beau-marker-container active';
      el.innerHTML = `
        <div class="beau-marker-mini-badge">★ ${master.rating}</div>
        <div class="beau-marker-pin" style="background: #1a1938; color: #d9f24e; border-color: #ffffff; box-shadow: 0 6px 18px rgba(26,25,56,0.35);">
          <span>${master.initials}</span>
        </div>
        <div class="beau-marker-pulse-ring"></div>
      `;

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([master.lng, master.lat])
        .addTo(map);

      mapInstance.current = map;
    } else {
      mapInstance.current.flyTo({ center: [master.lng, master.lat], zoom: 14, pitch: 35 });
    }
  }, [master]);

  return (
    <div style={{ height: '100%', background: '#121127', color: '#ffffff', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', background: '#1a1938', borderBottom: '1px solid #232145' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>
          Map Pin & Studio Profile
        </h1>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
          How clients discover {master.name} on the map
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '18px 18px 30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Map Preview Frame */}
        <div
          style={{
            height: '200px',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            border: '2px solid #2b2954',
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          }}
        >
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              padding: '4px 10px',
              borderRadius: '10px',
              background: 'rgba(26,25,56,0.85)',
              backdropFilter: 'blur(8px)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#d9f24e',
            }}
          >
            Kyiv · {master.district}
          </div>
        </div>

        {/* Studio Info Card */}
        <div style={{ background: '#1a1938', borderRadius: '20px', padding: '18px', border: '1px solid #2b2954' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Studio Address & Location</div>
            <span style={{ fontSize: '11px', color: '#d9f24e', fontWeight: 700 }}>LIVE ON MAP</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
            <MapPin size={16} color="#d9f24e" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>{master.district}, Kyiv</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{master.address}</div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div style={{ background: '#1a1938', borderRadius: '20px', padding: '18px', border: '1px solid #2b2954' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
            Public Contact Links
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <Phone size={15} color="#d9f24e" />
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{master.phones[0] || '+38 (050) 758-12-34'}</span>
            </div>

            {master.socials.instagram && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <Share2 size={15} color="#c9bcff" />
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{master.socials.instagram}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <Globe size={15} color="#ffc3c0" />
              <a href={master.url} target="_blank" rel="noreferrer" style={{ color: '#d9f24e', fontSize: '12px' }}>
                Barb.ua Live Verified Page ↗
              </a>
            </div>
          </div>
        </div>

        {/* View As Client CTA */}
        <button
          onClick={onViewAsClient}
          style={{
            height: '48px',
            borderRadius: '24px',
            background: '#d9f24e',
            color: '#1a1938',
            border: 'none',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(217, 242, 78, 0.25)',
          }}
        >
          <Eye size={16} /> View Profile (as Client)
        </button>
      </div>
    </div>
  );
};
