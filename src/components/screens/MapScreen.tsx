import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Master } from '../../data/crawledMasters';
import { CategoryFilter } from '../../types/app';
import { Search, Navigation, X, ChevronUp, ChevronDown, Star, Layers, Compass, Box, Maximize2 } from 'lucide-react';

interface MapScreenProps {
  masters: Master[];
  activeMasterId: number | null;
  categoryFilter: CategoryFilter;
  onSelectMaster: (masterId: number) => void;
  onOpenMasterProfile: (masterId: number) => void;
  onOpenBot: () => void;
  onCategoryFilterChange: (cat: CategoryFilter) => void;
  onToggleFullscreen?: () => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  masters,
  activeMasterId,
  categoryFilter,
  onSelectMaster,
  onOpenMasterProfile,
  onOpenBot,
  onCategoryFilterChange,
  onToggleFullscreen,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersMapRef = useRef<Map<number, maplibregl.Marker>>(new Map());

  const [searchQuery, setSearchQuery] = useState('');
  const [subFilter, setSubFilter] = useState<'all' | 'top' | 'salons' | 'solo'>('all');
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'voyager' | 'positron' | 'dark'>('voyager');
  const [is3D, setIs3D] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  // Map tile style definitions
  const MAP_STYLES = {
    voyager: {
      version: 8,
      sources: {
        'carto-voyager': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          ],
          tileSize: 256,
          attribution: '© CARTO, © OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'carto-voyager-layer',
          type: 'raster',
          source: 'carto-voyager',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    },
    positron: {
      version: 8,
      sources: {
        'carto-positron': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          ],
          tileSize: 256,
          attribution: '© CARTO',
        },
      },
      layers: [
        {
          id: 'carto-positron-layer',
          type: 'raster',
          source: 'carto-positron',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    },
    dark: {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          ],
          tileSize: 256,
          attribution: '© CARTO',
        },
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    },
  };

  // Filter masters
  const filteredMasters = useMemo(() => {
    return masters.filter((m) => {
      if (categoryFilter !== 'All' && m.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesDistrict = m.district.toLowerCase().includes(q) || m.address.toLowerCase().includes(q);
        const matchesCraft = m.craft.toLowerCase().includes(q);
        const matchesService = m.services.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesName && !matchesDistrict && !matchesCraft && !matchesService) return false;
      }

      if (subFilter === 'top' && Number(m.rating) < 4.8 && m.rawRating < 9.7) return false;
      if (subFilter === 'salons' && m.type !== 'salon') return false;
      if (subFilter === 'solo' && m.type !== 'master') return false;

      return true;
    });
  }, [masters, categoryFilter, searchQuery, subFilter]);

  // Initialize MapLibre Vector Map Engine
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLES[mapStyle] as any,
        center: [30.5234, 50.4501], // [lng, lat] for Kyiv
        zoom: 12.2,
        pitch: is3D ? 45 : 0,
        bearing: 0,
        attributionControl: false,
      });

      // Add navigation controls (zoom & compass)
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

      mapInstanceRef.current = map;
    }
  }, []);

  const isInitialStyle = useRef(true);

  // Update map style when changed
  useEffect(() => {
    if (isInitialStyle.current) {
      isInitialStyle.current = false;
      return;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setStyle(MAP_STYLES[mapStyle] as any);
    }
  }, [mapStyle]);

  // Update 3D pitch
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.easeTo({
        pitch: is3D ? 48 : 0,
        bearing: is3D ? -15 : 0,
        duration: 800,
      });
    }
  }, [is3D]);

  // Render / Update DOM Markers for all 30 masters
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    markersMapRef.current.forEach((marker) => marker.remove());
    markersMapRef.current.clear();

    filteredMasters.forEach((m) => {
      const isSelected = m.id === activeMasterId;
      const el = document.createElement('div');
      el.className = `barb-marker-container ${isSelected ? 'active' : ''}`;

      const bgColor = m.category === 'hair' ? '#f5265f' : m.category === 'nails' ? '#24405c' : '#a9c8e6';
      const textColor = m.category === 'laser' ? '#24405c' : '#ffffff';

      // Sleek round circular pin markup
      el.innerHTML = isSelected
        ? `
          <div class="barb-marker-mini-badge">★ ${m.rating}</div>
          <div class="barb-marker-pin" style="background: ${bgColor}; color: ${textColor}; border-color: #ffffff; box-shadow: 0 6px 18px rgba(36,64,92,0.35);">
            <span>${m.initials}</span>
          </div>
          <div class="barb-marker-pulse-ring"></div>
        `
        : `
          <div class="barb-marker-pin" style="background: ${bgColor}; color: ${textColor}">
            <span>${m.initials}</span>
          </div>
        `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectMaster(m.id);
        map.flyTo({
          center: [m.lng, m.lat],
          zoom: 14.5,
          pitch: is3D ? 45 : 0,
          essential: true,
          duration: 700,
        });

        // Auto-scroll list to the clicked master
        setTimeout(() => {
          const card = document.getElementById(`master-card-${m.id}`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 150);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([m.lng, m.lat])
        .addTo(map);

      markersMapRef.current.set(m.id, marker);
    });

    // Auto-fit bounds if we have results and no specific selection
    if (filteredMasters.length > 0 && !activeMasterId) {
      const bounds = new maplibregl.LngLatBounds();
      filteredMasters.forEach((m) => bounds.extend([m.lng, m.lat]));
      map.fitBounds(bounds, { padding: { top: 120, bottom: 280, left: 40, right: 40 }, maxZoom: 14.5 });
    }
  }, [filteredMasters, activeMasterId, is3D, onSelectMaster]);

  // Pan to selected master & auto-scroll list
  useEffect(() => {
    if (activeMasterId && mapInstanceRef.current) {
      const target = masters.find((m) => m.id === activeMasterId);
      if (target) {
        mapInstanceRef.current.flyTo({
          center: [target.lng, target.lat],
          zoom: 14.5,
          pitch: is3D ? 45 : 0,
          essential: true,
          duration: 700,
        });
      }

      // Smooth scroll card into view
      setTimeout(() => {
        const card = document.getElementById(`master-card-${activeMasterId}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    }
  }, [activeMasterId, masters, is3D]);

  const handleCenterKyiv = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [30.5234, 50.4501],
        zoom: 12.2,
        pitch: is3D ? 45 : 0,
        bearing: 0,
        duration: 900,
      });
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* WebGL Hardware-Accelerated Vector Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />

      {/* Floating Top Search & Header Bar */}
      <div
        style={{
          position: 'absolute',
          top: '52px',
          left: '16px',
          right: '16px',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Search Box */}
          <div
            style={{
              flex: 1,
              height: '48px',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 4px 16px rgba(26,25,56,0.12)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: '10px',
            }}
          >
            <Search size={16} color="#8d8aa6" />
            <input
              type="text"
              placeholder={`Search 30 masters in Kyiv...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                fontFamily: 'inherit',
                color: '#1a1938',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: '#f2f0f6',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={12} color="#6f6d86" />
              </button>
            )}
          </div>

          {/* Map Layer / Style Switcher Button */}
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            title="Switch Map Style"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 16px rgba(26,25,56,0.12)',
              color: '#1a1938',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={18} />
          </button>

          {/* 3D Perspective Toggle Button */}
          <button
            onClick={() => setIs3D(!is3D)}
            title="Toggle 3D Perspective View"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: is3D ? '#f5265f' : '#ffffff',
              border: 'none',
              boxShadow: '0 4px 16px rgba(36,64,92,0.12)',
              color: is3D ? '#ffffff' : '#24405c',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '12px',
            }}
          >
            <Box size={18} />
          </button>

          {/* Center Location Button */}
          <button
            onClick={handleCenterKyiv}
            title="Center Kyiv"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 16px rgba(36,64,92,0.12)',
              color: '#24405c',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Navigation size={18} />
          </button>

          {/* Fullscreen Map Experience Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              title="Open Fullscreen Map View"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#24405c',
                border: 'none',
                boxShadow: '0 4px 16px rgba(36,64,92,0.2)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Maximize2 size={18} />
            </button>
          )}
        </div>

        {/* Style Switcher Dropdown */}
        {showStyleMenu && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              padding: '10px',
              boxShadow: '0 8px 24px rgba(36,64,92,0.15)',
              display: 'flex',
              gap: '8px',
              alignSelf: 'flex-end',
            }}
          >
            {[
              { id: 'voyager' as const, label: 'Pastel Voyager' },
              { id: 'positron' as const, label: 'Minimal Positron' },
              { id: 'dark' as const, label: 'Dark Steel' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setMapStyle(st.id);
                  setShowStyleMenu(false);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '12px',
                  background: mapStyle === st.id ? '#24405c' : '#eaf0f6',
                  color: mapStyle === st.id ? '#ffffff' : '#24405c',
                  border: 'none',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter Pills Carousel */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          {(
            [
              { id: 'All' as CategoryFilter, label: `All (${masters.length})` },
              { id: 'hair' as CategoryFilter, label: '✂️ Hair (10)' },
              { id: 'nails' as CategoryFilter, label: '💅 Nails (10)' },
              { id: 'laser' as CategoryFilter, label: '⚡ Laser (10)' },
            ] as const
          ).map((f) => {
            const active = categoryFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onCategoryFilterChange(f.id)}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  border: 'none',
                  borderRadius: '17px',
                  background: active ? '#24405c' : '#ffffff',
                  color: active ? '#ffffff' : '#24405c',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(36,64,92,0.08)',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            );
          })}

          <button
            onClick={() => setSubFilter((prev) => (prev === 'top' ? 'all' : 'top'))}
            style={{
              height: '34px',
              padding: '0 14px',
              border: 'none',
              borderRadius: '17px',
              background: subFilter === 'top' ? '#ffd4de' : '#ffffff',
              color: '#24405c',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(36,64,92,0.08)',
            }}
          >
            ★ Top Rated
          </button>

          <button
            onClick={() => setSubFilter((prev) => (prev === 'salons' ? 'all' : 'salons'))}
            style={{
              height: '34px',
              padding: '0 14px',
              border: 'none',
              borderRadius: '17px',
              background: subFilter === 'salons' ? '#c6dcf1' : '#ffffff',
              color: '#24405c',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(36,64,92,0.08)',
            }}
          >
            🏢 Salons
          </button>
        </div>
      </div>

      {/* Floating Barb Assistant Action Button (FAB) */}
      <button
        onClick={onOpenBot}
        title="Ask Barb booking assistant"
        style={{
          position: 'absolute',
          right: '18px',
          bottom: sheetExpanded ? '74%' : '310px',
          width: '54px',
          height: '54px',
          border: 'none',
          borderRadius: '50%',
          background: '#f5265f',
          color: '#ffffff',
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          fontWeight: 700,
          boxShadow: '0 6px 20px rgba(245,38,95,0.35)',
          cursor: 'pointer',
          zIndex: 25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        b
      </button>

      {/* Bottom Sheet for Masters Nearby */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#ffffff',
          borderRadius: '26px 26px 0 0',
          boxShadow: '0 -6px 24px rgba(26,25,56,0.14)',
          zIndex: 20,
          height: sheetExpanded ? '72%' : '285px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'height 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)',
        }}
      >
        {/* Pull Handle Header */}
        <div
          onClick={() => setSheetExpanded(!sheetExpanded)}
          style={{
            padding: '10px 0 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ width: '44px', height: '5px', borderRadius: '3px', background: '#e4e1ea', marginBottom: '8px' }} />
          <div style={{ width: '100%', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', fontWeight: 700, color: '#1a1938' }}>
                Masters nearby
              </h2>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: '#f2f0f6',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#6f6d86',
                }}
              >
                {filteredMasters.length} found
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8d8aa6' }}>
              <span>{sheetExpanded ? 'Collapse' : 'Expand'}</span>
              {sheetExpanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </div>
          </div>
        </div>

        {/* Master Cards Scroll List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {filteredMasters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 16px', color: '#8d8aa6' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1938', marginBottom: '6px' }}>
                No masters match your filters
              </div>
              <p style={{ fontSize: '13px' }}>Try selecting "All" or clearing your search term.</p>
            </div>
          ) : (
            filteredMasters.map((m) => {
              const isSelected = m.id === activeMasterId;

              return (
                <div
                  key={m.id}
                  id={`master-card-${m.id}`}
                  className={isSelected ? 'master-card-active' : ''}
                  onClick={() => onSelectMaster(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '18px',
                    background: isSelected ? '#ffffff' : '#ffffff',
                    border: isSelected ? '2px solid #f5265f' : '1px solid #e3ebf3',
                    boxShadow: isSelected ? '0 6px 18px rgba(245,38,95,0.15)' : '0 2px 8px rgba(36,64,92,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Initials / Category Tint Avatar */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '15px',
                      background: m.tint,
                      color: '#24405c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {m.initials}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#24405c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '6px',
                          background: m.type === 'salon' ? '#c6dcf1' : '#eaf0f6',
                          color: '#24405c',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {m.type === 'salon' ? 'Salon' : 'Master'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#24405c', fontWeight: 500, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.cleanStreet}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6d8299', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ padding: '1px 5px', borderRadius: '4px', background: '#eaf0f6', color: '#24405c', fontWeight: 600 }}>{m.district}</span>
                      <span>· {m.metro}</span>
                      <span>· {m.dist}</span>
                    </div>
                  </div>

                  {/* Rating & Action */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f5265f', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                      <Star size={12} fill="#f5265f" color="#f5265f" /> {m.rating}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6d8299', marginTop: '2px' }}>
                      from {m.minPrice}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMasterProfile(m.id);
                      }}
                      style={{
                        marginTop: '4px',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        background: '#24405c',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Profile ›
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
