import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Master, ServiceItem } from '../../data/crawledMasters';
import { CategoryFilter, UserRole, Appointment } from '../../types/app';
import {
  Minimize2,
  MapPin,
  Search,
  Sparkles,
  Star,
  Heart,
  Calendar,
  Clock,
  MessageCircle,
  CheckCircle2,
  ExternalLink,
  Phone,
  Box,
  Navigation,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  User,
  TrendingUp,
  Tag,
  Check,
  X,
  Sliders,
  Send,
  SlidersHorizontal,
  DollarSign,
  Award,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DesktopFullscreenViewProps {
  masters: Master[];
  activeMasterId: number;
  onSelectMaster: (id: number) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (cat: CategoryFilter) => void;
  userRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  managedMasterId: number;
  onSelectManagedMaster: (id: number) => void;
  currentManagedMaster: Master;
  activeClientMaster: Master;
  favoriteIds: Set<number>;
  onToggleFavorite: (id: number) => void;
  appointments: Appointment[];
  onAcceptAppointment: (id: string) => void;
  onDeclineAppointment: (id: string) => void;
  masterSlots: Record<number, string[]>;
  onAddSlot: (slot: string) => void;
  onRemoveSlot: (slot: string) => void;
  onUpdateServices: (services: ServiceItem[]) => void;
  onClientBookedSlot: (slot: string) => void;
  onToggleFullscreen: () => void;
}

type SidebarView = 'list' | 'profile' | 'chat' | 'bot' | 'favs' | 'master-schedule' | 'master-catalog' | 'master-analytics';

export const DesktopFullscreenView: React.FC<DesktopFullscreenViewProps> = ({
  masters,
  activeMasterId,
  onSelectMaster,
  categoryFilter,
  onCategoryFilterChange,
  userRole,
  onSwitchRole,
  managedMasterId,
  onSelectManagedMaster,
  currentManagedMaster,
  activeClientMaster,
  favoriteIds,
  onToggleFavorite,
  appointments,
  onAcceptAppointment,
  onDeclineAppointment,
  masterSlots,
  onAddSlot,
  onRemoveSlot,
  onUpdateServices,
  onClientBookedSlot,
  onToggleFullscreen,
}) => {
  // Sidebar view state
  const [sidebarView, setSidebarView] = useState<SidebarView>(
    userRole === 'master' ? 'master-schedule' : 'list'
  );

  // Search & District filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [subFilter, setSubFilter] = useState<'all' | 'top' | 'salons'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'recommended'>('recommended');

  // Map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersMapRef = useRef<Map<number, maplibregl.Marker>>(new Map());
  const [mapStyle, setMapStyle] = useState<'voyager' | 'positron' | 'dark'>('voyager');
  const [is3D, setIs3D] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [mapZoom, setMapZoom] = useState(12.5);

  // Master switch dropdown
  const [showMasterDropdown, setShowMasterDropdown] = useState(false);

  // Chat conversation state
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; mine: boolean; time: string }>>([
    {
      id: '1',
      text: `Привіт! У моїй студії є вільні віконця для запису на цей тиждень. Який час вам підійде найкраще?`,
      mine: false,
      time: '10:15',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  // Bot conversation state
  const [botMessages, setBotMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    { sender: 'bot', text: 'Привіт! Я ваш б\'юті-асистент Barb у Києві. Підкажіть, яку послугу або район ви шукаєте!' },
  ]);
  const [botInput, setBotInput] = useState('');

  // Sync sidebar view on role change
  useEffect(() => {
    if (userRole === 'master') {
      setSidebarView('master-schedule');
    } else {
      if (sidebarView.startsWith('master-')) {
        setSidebarView('list');
      }
    }
  }, [userRole]);

  // District list
  const districts = ['All', 'Печерський', 'Шевченківський', 'Подільський', 'Дарницький', 'Оболонський', 'Голосіївський'];

  // Filtered Masters
  const filteredMasters = useMemo(() => {
    let result = masters.filter((m) => {
      if (categoryFilter !== 'All' && m.category !== categoryFilter) return false;

      if (selectedDistrict !== 'All' && !m.district.includes(selectedDistrict)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesDistrict = m.district.toLowerCase().includes(q) || m.cleanStreet.toLowerCase().includes(q);
        const matchesCraft = m.craft.toLowerCase().includes(q);
        const matchesMetro = m.metro.toLowerCase().includes(q);
        const matchesService = m.services.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesName && !matchesDistrict && !matchesCraft && !matchesMetro && !matchesService) return false;
      }

      if (subFilter === 'top' && Number(m.rating) < 4.8 && m.rawRating < 9.7) return false;
      if (subFilter === 'salons' && m.type !== 'salon') return false;

      return true;
    });

    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rawRating - a.rawRating);
    } else if (sortBy === 'price') {
      result = [...result].sort((a, b) => {
        const priceA = parseInt(a.minPrice.replace(/[^\d]/g, '')) || 0;
        const priceB = parseInt(b.minPrice.replace(/[^\d]/g, '')) || 0;
        return priceA - priceB;
      });
    }

    return result;
  }, [masters, categoryFilter, selectedDistrict, searchQuery, subFilter, sortBy]);

  // Map Styles
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
          ],
          tileSize: 256,
          attribution: '© CARTO © OpenStreetMap',
        },
      },
      layers: [{ id: 'carto-voyager-layer', type: 'raster', source: 'carto-voyager', minzoom: 0, maxzoom: 20 }],
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
      layers: [{ id: 'carto-positron-layer', type: 'raster', source: 'carto-positron', minzoom: 0, maxzoom: 20 }],
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
      layers: [{ id: 'carto-dark-layer', type: 'raster', source: 'carto-dark', minzoom: 0, maxzoom: 20 }],
    },
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLES[mapStyle] as any,
        center: [30.5234, 50.4501],
        zoom: 12.5,
        pitch: is3D ? 48 : 0,
        bearing: 0,
        attributionControl: false,
      });

      map.on('zoom', () => {
        setMapZoom(Math.round(map.getZoom() * 10) / 10);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update style
  const isInitialStyle = useRef(true);
  useEffect(() => {
    if (isInitialStyle.current) {
      isInitialStyle.current = false;
      return;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setStyle(MAP_STYLES[mapStyle] as any);
    }
  }, [mapStyle]);

  // Update 3D
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.easeTo({
        pitch: is3D ? 48 : 0,
        bearing: is3D ? -15 : 0,
        duration: 800,
      });
    }
  }, [is3D]);

  // Render & Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersMapRef.current.forEach((marker) => marker.remove());
    markersMapRef.current.clear();

    filteredMasters.forEach((m) => {
      const isSelected = m.id === activeMasterId;
      const el = document.createElement('div');
      el.className = `barb-marker-container ${isSelected ? 'active' : ''}`;

      const bgColor = m.category === 'hair' ? '#f5265f' : m.category === 'nails' ? '#24405c' : '#a9c8e6';
      const textColor = m.category === 'laser' ? '#24405c' : '#ffffff';

      el.innerHTML = isSelected
        ? `
          <div class="barb-marker-mini-badge">★ ${m.rating}</div>
          <div class="barb-marker-pin" style="background: ${bgColor}; color: ${textColor}; border-color: #ffffff; box-shadow: 0 8px 22px rgba(36,64,92,0.45);">
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
        if (sidebarView === 'list') {
          // Scroll list card into view
          setTimeout(() => {
            const card = document.getElementById(`desktop-card-${m.id}`);
            if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 100);
        }
        map.flyTo({
          center: [m.lng, m.lat],
          zoom: 14.5,
          pitch: is3D ? 48 : 0,
          essential: true,
          duration: 600,
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([m.lng, m.lat])
        .addTo(map);

      markersMapRef.current.set(m.id, marker);
    });
  }, [filteredMasters, activeMasterId, is3D, sidebarView]);

  // Center master on map
  const handleFlyToMaster = (m: Master) => {
    onSelectMaster(m.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [m.lng, m.lat],
        zoom: 14.5,
        pitch: is3D ? 48 : 0,
        duration: 700,
      });
    }
  };

  // Center Kyiv
  const handleCenterKyiv = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [30.5234, 50.4501],
        zoom: 12.5,
        pitch: is3D ? 48 : 0,
        bearing: 0,
        duration: 800,
      });
    }
  };

  // Chat handling
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { id: Date.now().toString(), text: msg, mine: true, time: 'Щойно' }]);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Дякую за повідомлення! Чекаю на вас у студії за адресою: ${activeClientMaster.cleanStreet}.`,
          mine: false,
          time: 'Щойно',
        },
      ]);
    }, 1000);
  };

  const handlePickSlot = (slot: string) => {
    if (bookedSlot) return;
    setBookedSlot(slot);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f5265f', '#ffd4de', '#24405c', '#a9c8e6'],
    });

    onClientBookedSlot(slot);
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: `Я хочу записатися на ${slot}, будь ласка!`, mine: true, time: 'Щойно' },
      {
        id: (Date.now() + 1).toString(),
        text: `Підтверджено! Ваш візит заплановано на Чт 20 Сер о ${slot}. До зустрічі!`,
        mine: false,
        time: 'Щойно',
      },
    ]);
  };

  // Bot handling
  const handleSendBot = () => {
    if (!botInput.trim()) return;
    const text = botInput.trim();
    setBotInput('');
    setBotMessages((prev) => [...prev, { sender: 'user', text }]);

    let matchedCat: CategoryFilter = 'All';
    const lower = text.toLowerCase();
    if (lower.includes('hair') || lower.includes('волос') || lower.includes('стрижк') || lower.includes('color') || lower.includes('фарбуван')) {
      matchedCat = 'hair';
    } else if (lower.includes('nail') || lower.includes('нігт') || lower.includes('манікюр') || lower.includes('gel') || lower.includes('педикюр')) {
      matchedCat = 'nails';
    } else if (lower.includes('laser') || lower.includes('лазер') || lower.includes('епіляц')) {
      matchedCat = 'laser';
    }

    setTimeout(() => {
      onCategoryFilterChange(matchedCat);
      setBotMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Я оновив карту Києва за запитом "${text}"! Знайдено чудових спеціалістів за вашими критеріями.`,
        },
      ]);
    }, 800);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#f4f7fa',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* =========================================================
          1. TOP APP BAR (Widescreen Global Header)
      ========================================================== */}
      <header
        style={{
          height: '64px',
          background: '#ffffff',
          borderBottom: '1px solid #e3ebf3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          gap: '20px',
          zIndex: 40,
          flexShrink: 0,
          boxShadow: '0 2px 10px rgba(36,64,92,0.04)',
        }}
      >
        {/* Left Brand & City Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            onClick={() => {
              setSidebarView('list');
              handleCenterKyiv();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#f5265f',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-serif)',
                fontSize: '20px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(245, 38, 95, 0.3)',
              }}
            >
              b
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#24405c',
                  lineHeight: 1,
                }}
              >
                Barb
              </div>
              <div style={{ fontSize: '11px', color: '#6d8299', fontWeight: 600 }}>Карта б'юті-майстрів Києва</div>
            </div>
          </div>

          {/* Quick Category Tabs in Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f4f7fa',
              borderRadius: '20px',
              padding: '3px',
              marginLeft: '8px',
            }}
          >
            {(
              [
                { id: 'All' as CategoryFilter, label: 'Усі (30)' },
                { id: 'hair' as CategoryFilter, label: '✂️ Волосся (10)' },
                { id: 'nails' as CategoryFilter, label: '💅 Нігті (10)' },
                { id: 'laser' as CategoryFilter, label: '⚡ Лазер (10)' },
              ] as const
            ).map((c) => {
              const active = categoryFilter === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onCategoryFilterChange(c.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    background: active ? '#24405c' : 'transparent',
                    color: active ? '#ffffff' : '#24405c',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Live Search Input */}
        <div
          style={{
            flex: 1,
            maxWidth: '420px',
            height: '42px',
            borderRadius: '21px',
            background: '#f4f7fa',
            border: '1px solid #e3ebf3',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '10px',
          }}
        >
          <Search size={16} color="#6d8299" />
          <input
            type="text"
            placeholder="Пошук серед 30 майстрів, послуг або районів (Печерськ, Поділ)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: '#24405c',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6d8299',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Tools & Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Barb AI Assistant Button */}
          <button
            onClick={() => setSidebarView(sidebarView === 'bot' ? 'list' : 'bot')}
            style={{
              height: '38px',
              padding: '0 14px',
              borderRadius: '19px',
              background: sidebarView === 'bot' ? '#f5265f' : '#ffd4de',
              color: sidebarView === 'bot' ? '#ffffff' : '#f5265f',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={14} /> Barb AI
          </button>

          {/* Saved Favorites Trigger */}
          <button
            onClick={() => setSidebarView(sidebarView === 'favs' ? 'list' : 'favs')}
            title="Збережені майстри"
            style={{
              height: '38px',
              padding: '0 12px',
              borderRadius: '19px',
              background: sidebarView === 'favs' ? '#24405c' : '#f4f7fa',
              color: sidebarView === 'favs' ? '#ffffff' : '#24405c',
              border: '1px solid #e3ebf3',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Heart size={14} fill={favoriteIds.size > 0 ? '#f5265f' : 'none'} color={favoriteIds.size > 0 ? '#f5265f' : '#24405c'} />
            <span>Збережені ({favoriteIds.size})</span>
          </button>

          {/* Dual Role Selector Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#24405c',
              borderRadius: '20px',
              padding: '3px',
            }}
          >
            <button
              onClick={() => onSwitchRole('client')}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                background: userRole === 'client' ? '#ffffff' : 'transparent',
                color: userRole === 'client' ? '#24405c' : 'rgba(255,255,255,0.7)',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Клієнт (Катя)
            </button>

            <button
              onClick={() => onSwitchRole('master')}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                background: userRole === 'master' ? '#f5265f' : 'transparent',
                color: '#ffffff',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Кабінет майстра
            </button>
          </div>

          {/* Master Switcher Dropdown in Master Mode */}
          {userRole === 'master' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMasterDropdown(!showMasterDropdown)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '19px',
                  background: '#24405c',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Студія: {currentManagedMaster.name.split(' ')[0]}</span>
                <Sliders size={12} />
              </button>

              {showMasterDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: '260px',
                    maxHeight: '320px',
                    overflowY: 'auto',
                    background: '#16283b',
                    borderRadius: '16px',
                    padding: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ padding: '6px 8px', fontSize: '10px', fontWeight: 800, color: '#ffd4de' }}>
                    ОБЕРІТЬ СТУДІЮ ({masters.length})
                  </div>
                  {masters.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectManagedMaster(m.id);
                        setShowMasterDropdown(false);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: m.id === managedMasterId ? 'rgba(245,38,95,0.25)' : 'transparent',
                        color: '#ffffff',
                        border: 'none',
                        textAlign: 'left',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{m.name}</div>
                        <div style={{ fontSize: '10.5px', opacity: 0.65 }}>{m.craft}</div>
                      </div>
                      {m.id === managedMasterId && <Check size={13} color="#f5265f" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Exit Fullscreen Toggle Button */}
          <button
            onClick={onToggleFullscreen}
            title="Вийти з повноекранного режиму (перейти до макету телефону)"
            style={{
              height: '38px',
              padding: '0 14px',
              borderRadius: '19px',
              background: '#eaf0f6',
              color: '#24405c',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Minimize2 size={15} /> Вийти з повного екрану
          </button>
        </div>
      </header>

      {/* =========================================================
          2. MAIN WORKSPACE SPLIT (Left Sidebar + Right Hero Map)
      ========================================================== */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* LEFT SIDEBAR WORKSPACE (~420px) */}
        <aside
          style={{
            width: '430px',
            height: '100%',
            background: '#ffffff',
            borderRight: '1px solid #e3ebf3',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 20,
            boxShadow: '4px 0 20px rgba(36,64,92,0.05)',
            flexShrink: 0,
          }}
        >
          {/* A. CLIENT MODE: Master List View */}
          {userRole === 'client' && sidebarView === 'list' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Filter Sub-header */}
              <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #e3ebf3', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#24405c' }}>
                    {filteredMasters.length} спеціалістів знайдено в Києві
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#6d8299' }}>Сортувати:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        background: '#f4f7fa',
                        border: '1px solid #e3ebf3',
                        color: '#24405c',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="recommended">Рекомендовані</option>
                      <option value="rating">Топ рейтинг ★</option>
                      <option value="price">Найнижча ціна ₴</option>
                    </select>
                  </div>
                </div>

                {/* District Filter Chips */}
                <div
                  className="no-scrollbar"
                  style={{
                    display: 'flex',
                    gap: '6px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                  }}
                >
                  {districts.map((d) => {
                    const active = selectedDistrict === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDistrict(d)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          background: active ? '#24405c' : '#f4f7fa',
                          color: active ? '#ffffff' : '#6d8299',
                          border: active ? '1px solid #24405c' : '1px solid #e3ebf3',
                          fontSize: '11.5px',
                          fontWeight: active ? 700 : 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {d === 'All' ? 'Усі райони' : d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Master Cards List */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {filteredMasters.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6d8299' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#24405c', marginBottom: '6px' }}>
                      Не знайдено спеціалістів за вашим фільтром
                    </div>
                    <p style={{ fontSize: '13px' }}>Спробуйте очистити пошуковий запит або обрати «Усі райони».</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDistrict('All');
                        onCategoryFilterChange('All');
                      }}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        borderRadius: '16px',
                        background: '#f5265f',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Скинути фільтри
                    </button>
                  </div>
                ) : (
                  filteredMasters.map((m) => {
                    const isSelected = m.id === activeMasterId;
                    const isFav = favoriteIds.has(m.id);

                    return (
                      <div
                        key={m.id}
                        id={`desktop-card-${m.id}`}
                        onClick={() => handleFlyToMaster(m)}
                        style={{
                          background: isSelected ? '#ffffff' : '#ffffff',
                          borderRadius: '20px',
                          padding: '16px',
                          border: isSelected ? '2px solid #f5265f' : '1px solid #e3ebf3',
                          boxShadow: isSelected ? '0 8px 24px rgba(245,38,95,0.18)' : '0 2px 8px rgba(36,64,92,0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        {/* Card Header */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '16px',
                              background: m.tint,
                              color: '#24405c',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-serif)',
                              fontSize: '18px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {m.initials}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span
                                style={{
                                  fontSize: '16px',
                                  fontWeight: 700,
                                  color: '#24405c',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {m.name}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(m.id);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px',
                                }}
                              >
                                <Heart size={16} fill={isFav ? '#f5265f' : 'none'} color={isFav ? '#f5265f' : '#6d8299'} />
                              </button>
                            </div>

                            <div style={{ fontSize: '12.5px', color: '#6d8299', marginTop: '2px' }}>
                              {m.craft}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11.5px' }}>
                              <span style={{ padding: '1px 6px', borderRadius: '6px', background: '#eaf0f6', color: '#24405c', fontWeight: 600 }}>
                                {m.district}
                              </span>
                              <span style={{ color: '#6d8299' }}>· {m.metro}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Rating, Price & CTA */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '10px',
                            borderTop: '1px solid #f4f7fa',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                color: '#f5265f',
                              }}
                            >
                              <Star size={13} fill="#f5265f" color="#f5265f" /> {m.rating}
                            </div>
                            <span style={{ fontSize: '11.5px', color: '#6d8299' }}>({m.reviewsCount})</span>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#24405c', marginLeft: '6px' }}>
                              від {m.minPrice}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectMaster(m.id);
                                setSidebarView('chat');
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '12px',
                                background: '#f5265f',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(245, 38, 95, 0.3)',
                              }}
                            >
                              Записатись
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectMaster(m.id);
                                setSidebarView('profile');
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '12px',
                                background: '#eaf0f6',
                                color: '#24405c',
                                border: 'none',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Профіль ›
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* B. CLIENT MODE: Master Detail & Catalog Panel */}
          {userRole === 'client' && sidebarView === 'profile' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {/* Back Bar */}
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #e3ebf3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                <button
                  onClick={() => setSidebarView('list')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    background: 'none',
                    color: '#24405c',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={18} /> Назад до списку на карті
                </button>

                <button
                  onClick={() => onToggleFavorite(activeClientMaster.id)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#f4f7fa',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Heart
                    size={16}
                    fill={favoriteIds.has(activeClientMaster.id) ? '#f5265f' : 'none'}
                    color={favoriteIds.has(activeClientMaster.id) ? '#f5265f' : '#24405c'}
                  />
                </button>
              </div>

              {/* Profile Cover & Avatar */}
              <div style={{ padding: '20px', textAlign: 'center', background: '#f4f7fa' }}>
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '24px',
                    background: activeClientMaster.tint,
                    color: '#24405c',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '28px',
                    fontWeight: 700,
                    boxShadow: '0 6px 20px rgba(36,64,92,0.15)',
                    marginBottom: '10px',
                  }}
                >
                  {activeClientMaster.initials}
                </div>

                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: '#24405c' }}>
                  {activeClientMaster.name}
                </h2>
                <div style={{ fontSize: '13px', color: '#6d8299', marginTop: '2px' }}>
                  {activeClientMaster.craft} · {activeClientMaster.district}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '13px', fontWeight: 700, color: '#f5265f' }}>
                    <Star size={14} fill="#f5265f" color="#f5265f" /> {activeClientMaster.rating}
                  </div>
                  <span style={{ fontSize: '12px', color: '#6d8299' }}>· {activeClientMaster.reviewsCount} відгуків</span>
                  <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '6px', background: '#c6dcf1', color: '#24405c', fontWeight: 600 }}>
                    Перевірено на Barb.ua
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', fontSize: '12.5px', color: '#24405c', fontWeight: 600 }}>
                  <MapPin size={14} color="#f5265f" />
                  <span>{activeClientMaster.cleanStreet}, Київ ({activeClientMaster.metro})</span>
                </div>
              </div>

              {/* Action Buttons: Message & Book */}
              <div style={{ padding: '14px 20px', display: 'flex', gap: '10px', background: '#ffffff', borderBottom: '1px solid #e3ebf3' }}>
                <button
                  onClick={() => setSidebarView('chat')}
                  style={{
                    flex: 1,
                    height: '44px',
                    borderRadius: '22px',
                    background: '#f5265f',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(245, 38, 95, 0.35)',
                  }}
                >
                  <Calendar size={15} /> Записатися на візит
                </button>

                <a
                  href={activeClientMaster.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    height: '44px',
                    padding: '0 16px',
                    borderRadius: '22px',
                    background: '#eaf0f6',
                    color: '#24405c',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Профіль Barb.ua <ExternalLink size={13} />
                </a>
              </div>

              {/* Service Catalog List */}
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em', color: '#6d8299', marginBottom: '12px' }}>
                  ПОСЛУГИ ТА ЦІНИ ({activeClientMaster.services.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeClientMaster.services.map((srv, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        background: '#f4f7fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #e3ebf3',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#24405c' }}>{srv.name}</div>
                        <div style={{ fontSize: '11px', color: '#6d8299', marginTop: '1px' }}>{srv.category}</div>
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#24405c' }}>{srv.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* C. CLIENT MODE: Direct Chat & Booking Flow */}
          {userRole === 'client' && sidebarView === 'chat' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Chat Header */}
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #e3ebf3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#ffffff',
                }}
              >
                <button
                  onClick={() => setSidebarView('list')}
                  style={{
                    border: 'none',
                    background: '#eaf0f6',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#24405c',
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: activeClientMaster.tint,
                    color: '#24405c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  {activeClientMaster.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#24405c' }}>{activeClientMaster.name}</div>
                  <div style={{ fontSize: '11px', color: '#6d8299' }}>{activeClientMaster.craft} · Онлайн-запис</div>
                </div>
              </div>

              {/* Chat Thread */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: '#f4f7fa',
                }}
              >
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      maxWidth: '82%',
                      alignSelf: m.mine ? 'flex-end' : 'flex-start',
                      background: m.mine ? '#24405c' : '#ffffff',
                      color: m.mine ? '#ffffff' : '#24405c',
                      borderRadius: m.mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '10px 14px',
                      fontSize: '13.5px',
                      lineHeight: 1.45,
                      boxShadow: '0 2px 6px rgba(36,64,92,0.05)',
                    }}
                  >
                    {m.text}
                  </div>
                ))}

                {/* Free Slot Booking Widget in Chat */}
                {!bookedSlot && (
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '14px',
                      border: '1px solid #e3ebf3',
                      boxShadow: '0 4px 12px rgba(36,64,92,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#f5265f', marginBottom: '8px' }}>
                      <Clock size={12} /> ОБЕРІТЬ ВІЛЬНЕ ВІКОНЦЕ · ЧТ 20 СЕР
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['10:00', '11:30', '14:00', '16:30', '18:00'].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => handlePickSlot(slot)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '12px',
                            background: '#eaf0f6',
                            color: '#24405c',
                            border: 'none',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {bookedSlot && (
                  <div
                    style={{
                      background: '#ffd4de',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      color: '#24405c',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid #f5265f',
                    }}
                  >
                    <CheckCircle2 size={20} color="#f5265f" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800 }}>Візит підтверджено о {bookedSlot}</div>
                      <div style={{ fontSize: '11px', color: '#6d8299' }}>Додано до ваших активних записів</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div style={{ padding: '12px 16px', background: '#ffffff', borderTop: '1px solid #e3ebf3', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Напишіть повідомлення майстру..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: '20px',
                    background: '#f4f7fa',
                    border: '1px solid #e3ebf3',
                    padding: '0 14px',
                    fontSize: '13px',
                    outline: 'none',
                    color: '#24405c',
                  }}
                />
                <button
                  onClick={handleSendChat}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#f5265f',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}

          {/* D. CLIENT MODE: Barb AI Assistant */}
          {userRole === 'client' && sidebarView === 'bot' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #e3ebf3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#f5265f',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '16px',
                      fontWeight: 700,
                    }}
                  >
                    b
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#24405c' }}>ШІ-асистент Barb</div>
                    <div style={{ fontSize: '11px', color: '#6d8299' }}>Пошук майстрів та онлайн-запис у Києві</div>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarView('list')}
                  style={{ background: 'none', border: 'none', color: '#6d8299', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: '#f4f7fa',
                }}
              >
                {botMessages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      maxWidth: '84%',
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: m.sender === 'user' ? '#24405c' : '#ffffff',
                      color: m.sender === 'user' ? '#ffffff' : '#24405c',
                      borderRadius: '16px',
                      padding: '10px 14px',
                      fontSize: '13.5px',
                      lineHeight: 1.45,
                      boxShadow: '0 2px 6px rgba(36,64,92,0.05)',
                    }}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px 16px', background: '#ffffff', borderTop: '1px solid #e3ebf3', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Запитайте про волосся, нігті, лазер на Печерську..."
                  value={botInput}
                  onChange={(e) => setBotInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendBot()}
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: '20px',
                    background: '#f4f7fa',
                    border: '1px solid #e3ebf3',
                    padding: '0 14px',
                    fontSize: '13px',
                    outline: 'none',
                    color: '#24405c',
                  }}
                />
                <button
                  onClick={handleSendBot}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#f5265f',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}

          {/* E. CLIENT MODE: Saved Favorites */}
          {userRole === 'client' && sidebarView === 'favs' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #e3ebf3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#24405c' }}>
                  Збережені спеціалісти ({favoriteIds.size})
                </div>
                <button
                  onClick={() => setSidebarView('list')}
                  style={{ background: 'none', border: 'none', color: '#6d8299', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: '#f4f7fa',
                }}
              >
                {masters
                  .filter((m) => favoriteIds.has(m.id))
                  .map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleFlyToMaster(m)}
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '14px',
                        border: '1px solid #e3ebf3',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#24405c' }}>{m.name}</div>
                        <div style={{ fontSize: '12px', color: '#6d8299' }}>{m.craft} · {m.district}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(m.id);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Heart size={16} fill="#f5265f" color="#f5265f" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* F. MASTER PORTAL: Navigation Tabs & Workspace */}
          {userRole === 'master' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#16283b', color: '#ffffff' }}>
              {/* Master Studio Switcher Header */}
              <div style={{ padding: '16px 20px', background: '#24405c', borderBottom: '1px solid #1c3248' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '14px',
                      background: currentManagedMaster.tint,
                      color: '#24405c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '17px',
                      fontWeight: 700,
                    }}
                  >
                    {currentManagedMaster.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>{currentManagedMaster.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#ffd4de' }}>
                      {currentManagedMaster.craft} · {currentManagedMaster.district}
                    </div>
                  </div>
                </div>

                {/* Master Sub-Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                  {[
                    { id: 'master-schedule' as SidebarView, label: 'Розклад', icon: Calendar },
                    { id: 'master-catalog' as SidebarView, label: 'Каталог', icon: Tag },
                    { id: 'master-analytics' as SidebarView, label: 'Статистика', icon: TrendingUp },
                  ].map((t) => {
                    const active = sidebarView === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSidebarView(t.id)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '12px',
                          background: active ? '#f5265f' : 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: active ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <Icon size={13} /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Master Schedule Tab */}
              {sidebarView === 'master-schedule' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Incoming Requests */}
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffd4de', letterSpacing: '0.08em' }}>
                    ВХІДНІ ЗАЯВКИ ({appointments.filter((a) => a.masterId === managedMasterId && a.status === 'pending').length})
                  </div>

                  {appointments
                    .filter((a) => a.masterId === managedMasterId && a.status === 'pending')
                    .map((appt) => (
                      <div
                        key={appt.id}
                        style={{
                          background: '#24405c',
                          borderRadius: '16px',
                          padding: '14px',
                          border: '1.5px solid #f5265f',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700 }}>{appt.clientName}</div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffd4de' }}>{appt.price}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                          {appt.serviceName} · {appt.time}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                          <button
                            onClick={() => onAcceptAppointment(appt.id)}
                            style={{
                              flex: 1,
                              height: '34px',
                              borderRadius: '17px',
                              background: '#f5265f',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Підтвердити
                          </button>
                          <button
                            onClick={() => onDeclineAppointment(appt.id)}
                            style={{
                              padding: '0 12px',
                              borderRadius: '17px',
                              background: 'rgba(255,255,255,0.1)',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            Відхилити
                          </button>
                        </div>
                      </div>
                    ))}

                  {/* Confirmed list */}
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', marginTop: '6px' }}>
                    ПІДТВЕРДЖЕНІ ВІЗИТИ
                  </div>

                  {appointments
                    .filter((a) => a.masterId === managedMasterId && a.status === 'confirmed')
                    .map((appt) => (
                      <div
                        key={appt.id}
                        style={{
                          background: '#24405c',
                          borderRadius: '14px',
                          padding: '12px 14px',
                          border: '1px solid #1c3248',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{appt.clientName}</div>
                          <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.7)' }}>{appt.serviceName} · {appt.time}</div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#a9c8e6', fontWeight: 700 }}>Підтверджено ✓</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Master Catalog Tab */}
              {sidebarView === 'master-catalog' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffd4de', letterSpacing: '0.08em' }}>
                    КАТАЛОГ ПОСЛУГ СТУДІЇ ({currentManagedMaster.services.length})
                  </div>

                  {currentManagedMaster.services.map((srv, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#24405c',
                        borderRadius: '14px',
                        padding: '12px 14px',
                        border: '1px solid #1c3248',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{srv.name}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{srv.category}</div>
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#ffd4de' }}>{srv.price}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Master Analytics Tab */}
              {sidebarView === 'master-analytics' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #24405c 0%, #1c3248 100%)',
                      borderRadius: '18px',
                      padding: '16px',
                      border: '1.5px solid #f5265f',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffd4de' }}>МІСЯЧНИЙ ДОХІД</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, marginTop: '4px' }}>₴54,200</div>
                    <div style={{ fontSize: '11.5px', color: '#a9c8e6', marginTop: '2px' }}>+18.4% порівняно з минулим місяцем</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ background: '#24405c', borderRadius: '14px', padding: '12px', border: '1px solid #1c3248' }}>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>Рейтинг</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffd4de', marginTop: '2px' }}>{currentManagedMaster.rating} ★</div>
                    </div>
                    <div style={{ background: '#24405c', borderRadius: '14px', padding: '12px', border: '1px solid #1c3248' }}>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>Постійні клієнти</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#c6dcf1', marginTop: '2px' }}>74%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* RIGHT HERO AREA: Full-Bleed Interactive Vector Map */}
        <main
          style={{
            flex: 1,
            height: '100%',
            position: 'relative',
            background: '#eef2f6',
          }}
        >
          {/* Map Container */}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Floating Map Control Toolbox (Top Right) */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 30,
            }}
          >
            {/* 3D Tilt Toggle */}
            <button
              onClick={() => setIs3D(!is3D)}
              title="Перемкнути 3D перспективу"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: is3D ? '#f5265f' : '#ffffff',
                color: is3D ? '#ffffff' : '#24405c',
                border: 'none',
                boxShadow: '0 4px 14px rgba(36,64,92,0.15)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              <Box size={18} />
            </button>

            {/* Map Style Dropdown Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowStyleMenu(!showStyleMenu)}
                title="Змінити стиль карти"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#24405c',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(36,64,92,0.15)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SlidersHorizontal size={18} />
              </button>

              {showStyleMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: '52px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '8px',
                    boxShadow: '0 8px 24px rgba(36,64,92,0.18)',
                    display: 'flex',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {[
                    { id: 'voyager' as const, label: 'Пастельна карта' },
                    { id: 'positron' as const, label: 'Світла мінімалістична' },
                    { id: 'dark' as const, label: 'Темний стиль' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setMapStyle(st.id);
                        setShowStyleMenu(false);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        background: mapStyle === st.id ? '#24405c' : '#f4f7fa',
                        color: mapStyle === st.id ? '#ffffff' : '#24405c',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Center Kyiv */}
            <button
              onClick={handleCenterKyiv}
              title="Центрувати карту на Києві"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#ffffff',
                color: '#24405c',
                border: 'none',
                boxShadow: '0 4px 14px rgba(36,64,92,0.15)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Navigation size={18} />
            </button>
          </div>

          {/* Floating Selected Master Quick Card at Bottom of Map */}
          {activeClientMaster && (
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '22px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 10px 30px rgba(36,64,92,0.18)',
                border: '1px solid #e3ebf3',
                maxWidth: '480px',
                zIndex: 25,
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '16px',
                  background: activeClientMaster.tint,
                  color: '#24405c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '18px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {activeClientMaster.initials}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#24405c' }}>
                    {activeClientMaster.name}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f5265f', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Star size={11} fill="#f5265f" color="#f5265f" /> {activeClientMaster.rating}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#24405c', fontWeight: 500, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeClientMaster.cleanStreet}
                </div>
                <div style={{ fontSize: '11px', color: '#6d8299', marginTop: '1px' }}>
                  {activeClientMaster.district} · {activeClientMaster.metro} · від {activeClientMaster.minPrice}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => setSidebarView('chat')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '14px',
                    background: '#f5265f',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(245, 38, 95, 0.3)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Записатись
                </button>
                <button
                  onClick={() => setSidebarView('profile')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '14px',
                    background: '#eaf0f6',
                    color: '#24405c',
                    border: 'none',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Деталі профілю ›
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
