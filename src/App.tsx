import React, { useState, useMemo } from 'react';
import { ScreenType, ClientScreenType, MasterScreenType, UserRole, CategoryFilter, Appointment } from './types/app';
import { CRAWLED_MASTERS, Master, ServiceItem } from './data/crawledMasters';
import { IOSDeviceFrame } from './components/IOSDeviceFrame';
import { BottomNavigation } from './components/BottomNavigation';
import { MasterBottomNavigation } from './components/master/MasterBottomNavigation';

// Client Screens
import { LoginScreen } from './components/screens/LoginScreen';
import { BotScreen } from './components/screens/BotScreen';
import { MapScreen } from './components/screens/MapScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { MasterProfileScreen } from './components/screens/MasterProfileScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { ChatsListScreen } from './components/screens/ChatsListScreen';
import { SavedScreen } from './components/screens/SavedScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';

// Master Screens
import { MasterScheduleScreen } from './components/master/MasterScheduleScreen';
import { MasterCatalogEditorScreen } from './components/master/MasterCatalogEditorScreen';
import { MasterAnalyticsScreen } from './components/master/MasterAnalyticsScreen';
import { MasterMapPreviewScreen } from './components/master/MasterMapPreviewScreen';
import { MasterChatScreen } from './components/master/MasterChatScreen';

// Desktop Fullscreen App
import { DesktopFullscreenView } from './components/desktop/DesktopFullscreenView';

export const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [clientScreen, setClientScreen] = useState<ClientScreenType>('login');
  const [masterScreen, setMasterScreen] = useState<MasterScreenType>('schedule');
  const [clientHistory, setClientHistory] = useState<ClientScreenType[]>([]);
  const [managedMasterId, setManagedMasterId] = useState<number>(1);
  const [activeMasterId, setActiveMasterId] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set([1, 11, 21]));
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  // Dynamic masters catalog state
  const [mastersList, setMastersList] = useState<Master[]>(CRAWLED_MASTERS);

  // Synchronized Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'appt-1',
      masterId: 1,
      masterName: 'Валентина Шевчук',
      clientName: 'Kate Petrenko',
      clientAvatar: 'KP',
      serviceName: 'Balayage, mid length',
      craft: 'Haircut, Colour & Styling',
      date: 'Thu 20 Aug',
      time: '11:30',
      price: '₴1400',
      status: 'pending',
    },
    {
      id: 'appt-2',
      masterId: 1,
      masterName: 'Валентина Шевчук',
      clientName: 'Olha D.',
      clientAvatar: 'OD',
      serviceName: 'Toning + Care',
      craft: 'Haircut, Colour & Styling',
      date: 'Thu 20 Aug',
      time: '14:00',
      price: '₴650',
      status: 'confirmed',
    },
    {
      id: 'appt-3',
      masterId: 1,
      masterName: 'Валентина Шевчук',
      clientName: 'Nadia K.',
      clientAvatar: 'NK',
      serviceName: 'Cut & Style',
      craft: 'Haircut, Colour & Styling',
      date: 'Thu 20 Aug',
      time: '17:30',
      price: '₴700',
      status: 'confirmed',
    },
  ]);

  // Master Slots State per master
  const [masterSlots, setMasterSlots] = useState<Record<number, string[]>>({
    1: ['10:00', '11:30', '14:00', '16:30', '18:00'],
  });

  const currentManagedMaster = useMemo(() => {
    return mastersList.find((m) => m.id === managedMasterId) || mastersList[0];
  }, [mastersList, managedMasterId]);

  const activeClientMaster = useMemo(() => {
    return mastersList.find((m) => m.id === activeMasterId) || mastersList[0];
  }, [mastersList, activeMasterId]);

  const favoriteMasters = useMemo(() => {
    return mastersList.filter((m) => favoriteIds.has(m.id));
  }, [mastersList, favoriteIds]);

  // Navigation handlers
  const navigateClient = (newScreen: ClientScreenType) => {
    if (newScreen === clientScreen) return;
    setClientHistory((prev) => [...prev, clientScreen]);
    setClientScreen(newScreen);
  };

  const handleClientBack = () => {
    if (clientHistory.length > 0) {
      const prev = clientHistory[clientHistory.length - 1];
      setClientHistory((h) => h.slice(0, -1));
      setClientScreen(prev);
    } else {
      setClientScreen('map');
    }
  };

  const handleReset = () => {
    setUserRole('client');
    setClientScreen('login');
    setMasterScreen('schedule');
    setClientHistory([]);
    setCategoryFilter('All');
  };

  const handleToggleFavorite = (id: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Appointment Actions
  const handleClientBookedSlot = (timeSlot: string) => {
    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      masterId: activeClientMaster.id,
      masterName: activeClientMaster.name,
      clientName: 'Kate Petrenko',
      clientAvatar: 'KP',
      serviceName: activeClientMaster.services[0]?.name || activeClientMaster.craft,
      craft: activeClientMaster.craft,
      date: 'Thu 20 Aug',
      time: timeSlot,
      price: activeClientMaster.minPrice,
      status: 'pending',
    };
    setAppointments((prev) => [newAppt, ...prev]);
  };

  const handleAcceptAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'confirmed' as const } : a))
    );
  };

  const handleDeclineAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'declined' as const } : a))
    );
  };

  const handleUpdateMasterServices = (newServices: ServiceItem[]) => {
    setMastersList((prev) =>
      prev.map((m) => (m.id === managedMasterId ? { ...m, services: newServices } : m))
    );
  };

  const handleAddSlot = (slot: string) => {
    setMasterSlots((prev) => ({
      ...prev,
      [managedMasterId]: [...(prev[managedMasterId] || ['10:00', '12:00', '15:00']), slot],
    }));
  };

  const handleRemoveSlot = (slot: string) => {
    setMasterSlots((prev) => ({
      ...prev,
      [managedMasterId]: (prev[managedMasterId] || []).filter((s) => s !== slot),
    }));
  };

  // Switch role handler
  const handleSwitchRole = (role: UserRole) => {
    setUserRole(role);
    if (role === 'master') {
      setMasterScreen('schedule');
    } else {
      if (clientScreen === 'login') {
        setClientScreen('map');
      }
    }
  };

  const showClientBottomNav = userRole === 'client' && ['dash', 'map', 'chats', 'favs'].includes(clientScreen);
  const showMasterBottomNav = userRole === 'master' && ['schedule', 'catalog', 'chats', 'analytics', 'preview'].includes(masterScreen);

  const pendingMasterCount = appointments.filter(
    (a) => a.masterId === managedMasterId && a.status === 'pending'
  ).length;

  if (fullscreen) {
    return (
      <DesktopFullscreenView
        masters={mastersList}
        activeMasterId={activeMasterId}
        onSelectMaster={(id) => setActiveMasterId(id)}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(cat) => setCategoryFilter(cat)}
        userRole={userRole}
        onSwitchRole={handleSwitchRole}
        managedMasterId={managedMasterId}
        onSelectManagedMaster={(id) => setManagedMasterId(id)}
        currentManagedMaster={currentManagedMaster}
        activeClientMaster={activeClientMaster}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
        appointments={appointments}
        onAcceptAppointment={handleAcceptAppointment}
        onDeclineAppointment={handleDeclineAppointment}
        masterSlots={masterSlots}
        onAddSlot={handleAddSlot}
        onRemoveSlot={handleRemoveSlot}
        onUpdateServices={handleUpdateMasterServices}
        onClientBookedSlot={handleClientBookedSlot}
        onToggleFullscreen={() => setFullscreen(false)}
      />
    );
  }

  return (
    <IOSDeviceFrame
      currentScreen={userRole === 'client' ? clientScreen : masterScreen}
      userRole={userRole}
      currentMaster={currentManagedMaster}
      allMasters={mastersList}
      onSwitchRole={handleSwitchRole}
      onSelectManagedMaster={(id) => setManagedMasterId(id)}
      onNavigate={(s) => {
        if (userRole === 'client') {
          navigateClient(s);
        } else {
          setMasterScreen(s);
        }
      }}
      onReset={handleReset}
      fullscreen={fullscreen}
      onToggleFullscreen={() => setFullscreen(!fullscreen)}
    >
      {/* Viewport Screen Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {userRole === 'client' ? (
          <>
            {clientScreen === 'login' && (
              <LoginScreen
                onSignIn={() => navigateClient('bot')}
                onExploreMap={() => {
                  setCategoryFilter('All');
                  navigateClient('map');
                }}
                onSignInMaster={() => handleSwitchRole('master')}
              />
            )}

            {clientScreen === 'bot' && (
              <BotScreen
                onSelectCategory={(cat) => {
                  setCategoryFilter(cat);
                  setClientHistory((prev) => [...prev, 'bot']);
                  setClientScreen('map');
                }}
                onSkipToMap={() => {
                  setCategoryFilter('All');
                  navigateClient('map');
                }}
              />
            )}

            {clientScreen === 'map' && (
              <MapScreen
                masters={mastersList}
                activeMasterId={activeMasterId}
                categoryFilter={categoryFilter}
                onSelectMaster={(id) => setActiveMasterId(id)}
                onOpenMasterProfile={(id) => {
                  setActiveMasterId(id);
                  navigateClient('master');
                }}
                onOpenBot={() => navigateClient('bot')}
                onCategoryFilterChange={(cat) => setCategoryFilter(cat)}
                onToggleFullscreen={() => setFullscreen(true)}
              />
            )}

            {clientScreen === 'dash' && (
              <DashboardScreen
                masters={mastersList}
                onOpenMaster={(id) => {
                  setActiveMasterId(id);
                  navigateClient('master');
                }}
                onOpenMapWithCategory={(cat) => {
                  setCategoryFilter(cat);
                  navigateClient('map');
                }}
                onOpenProfile={() => navigateClient('profile')}
                onOpenChat={(id) => {
                  setActiveMasterId(id);
                  navigateClient('chat');
                }}
              />
            )}

            {clientScreen === 'master' && (
              <MasterProfileScreen
                master={activeClientMaster}
                isFavorite={favoriteIds.has(activeClientMaster.id)}
                onToggleFavorite={() => handleToggleFavorite(activeClientMaster.id)}
                onBack={handleClientBack}
                onBook={() => navigateClient('chat')}
                onChat={() => navigateClient('chat')}
              />
            )}

            {clientScreen === 'chat' && (
              <ChatScreen
                master={activeClientMaster}
                onBack={handleClientBack}
                onViewProfile={() => navigateClient('master')}
                onBookingConfirmed={handleClientBookedSlot}
              />
            )}

            {clientScreen === 'chats' && (
              <ChatsListScreen
                masters={mastersList}
                onOpenChat={(id) => {
                  setActiveMasterId(id);
                  navigateClient('chat');
                }}
                onBack={handleClientBack}
              />
            )}

            {clientScreen === 'favs' && (
              <SavedScreen
                favoriteMasters={favoriteMasters}
                onOpenMaster={(id) => {
                  setActiveMasterId(id);
                  navigateClient('master');
                }}
                onToggleFavorite={handleToggleFavorite}
                onBack={handleClientBack}
                onExploreMap={() => {
                  setCategoryFilter('All');
                  navigateClient('map');
                }}
              />
            )}

            {clientScreen === 'profile' && (
              <ProfileScreen
                savedCount={favoriteIds.size}
                onBack={handleClientBack}
                onSignOut={handleReset}
                onViewMap={() => {
                  setCategoryFilter('All');
                  navigateClient('map');
                }}
              />
            )}
          </>
        ) : (
          /* Master Portal Screens */
          <>
            {masterScreen === 'schedule' && (
              <MasterScheduleScreen
                master={currentManagedMaster}
                appointments={appointments.filter((a) => a.masterId === managedMasterId)}
                availableSlots={masterSlots[managedMasterId] || ['10:00', '11:30', '14:00', '16:30', '18:00']}
                onAcceptAppointment={handleAcceptAppointment}
                onDeclineAppointment={handleDeclineAppointment}
                onAddSlot={handleAddSlot}
                onRemoveSlot={handleRemoveSlot}
                onOpenChatWithClient={() => setMasterScreen('chat')}
              />
            )}

            {masterScreen === 'catalog' && (
              <MasterCatalogEditorScreen
                master={currentManagedMaster}
                services={currentManagedMaster.services}
                onUpdateServices={handleUpdateMasterServices}
              />
            )}

            {masterScreen === 'analytics' && (
              <MasterAnalyticsScreen master={currentManagedMaster} />
            )}

            {masterScreen === 'preview' && (
              <MasterMapPreviewScreen
                master={currentManagedMaster}
                onViewAsClient={() => {
                  setActiveMasterId(managedMasterId);
                  setUserRole('client');
                  setClientScreen('master');
                }}
              />
            )}

            {masterScreen === 'chats' && (
              <div style={{ height: '100%', background: '#121127', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '52px 20px 16px', background: '#1a1938', borderBottom: '1px solid #232145' }}>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700 }}>
                    Client Conversations
                  </h1>
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div
                    onClick={() => setMasterScreen('chat')}
                    style={{
                      background: '#1a1938',
                      borderRadius: '18px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      border: '1px solid #d9f24e',
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#d9f24e', color: '#1a1938', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      KP
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 700 }}>Kate Petrenko</div>
                      <div style={{ fontSize: '12px', color: '#d9f24e' }}>I would like to book the 11:30 slot, please!</div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>10:24</span>
                  </div>
                </div>
              </div>
            )}

            {masterScreen === 'chat' && (
              <MasterChatScreen
                master={currentManagedMaster}
                onBack={() => setMasterScreen('schedule')}
              />
            )}
          </>
        )}
      </div>

      {/* Role-Specific Persistent Bottom Navigation */}
      {showClientBottomNav && (
        <BottomNavigation
          currentScreen={clientScreen}
          onNavigate={(s) => navigateClient(s)}
          unreadChatCount={1}
          savedCount={favoriteIds.size}
        />
      )}

      {showMasterBottomNav && (
        <MasterBottomNavigation
          currentScreen={masterScreen}
          onNavigate={(s) => setMasterScreen(s)}
          pendingCount={pendingMasterCount}
          unreadCount={1}
        />
      )}
    </IOSDeviceFrame>
  );
};
