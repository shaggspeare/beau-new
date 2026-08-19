import React, { useState } from 'react';
import { Master } from '../../data/crawledMasters';
import { Appointment } from '../../types/app';
import { Clock, Plus, Check, X, Calendar, User, MessageCircle, AlertCircle, Sparkles } from 'lucide-react';

interface MasterScheduleScreenProps {
  master: Master;
  appointments: Appointment[];
  availableSlots: string[];
  onAcceptAppointment: (id: string) => void;
  onDeclineAppointment: (id: string) => void;
  onAddSlot: (slot: string) => void;
  onRemoveSlot: (slot: string) => void;
  onOpenChatWithClient: () => void;
}

export const MasterScheduleScreen: React.FC<MasterScheduleScreenProps> = ({
  master,
  appointments,
  availableSlots,
  onAcceptAppointment,
  onDeclineAppointment,
  onAddSlot,
  onRemoveSlot,
  onOpenChatWithClient,
}) => {
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow' | 'saturday'>('today');
  const [newSlotInput, setNewSlotInput] = useState('');
  const [showSlotInput, setShowSlotInput] = useState(false);

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed');

  const handleAddSlot = () => {
    if (!newSlotInput.trim()) return;
    onAddSlot(newSlotInput.trim());
    setNewSlotInput('');
    setShowSlotInput(false);
  };

  return (
    <div style={{ height: '100%', background: '#16283b', color: '#ffffff', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Master Top Header */}
      <div style={{ padding: '52px 20px 16px', borderBottom: '1px solid #24405c', background: '#24405c' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '16px',
                background: master.tint,
                color: '#24405c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-serif)',
                fontSize: '17px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {master.initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{master.name}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: '#f5265f',
                    color: '#ffffff',
                    fontWeight: 800,
                  }}
                >
                  КАБІНЕТ МАЙСТРА
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                {master.craft} · {master.district}
              </div>
            </div>
          </div>
        </div>

        {/* Day Selector Pill Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {[
            { id: 'today', label: 'Чт 20 Сер', sub: 'Сьогодні' },
            { id: 'tomorrow', label: 'Пт 21 Сер', sub: 'Завтра' },
            { id: 'saturday', label: 'Сб 22 Сер', sub: 'Вихідні' },
          ].map((d) => {
            const active = selectedDay === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id as any)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '14px',
                  background: active ? '#f5265f' : 'rgba(255,255,255,0.08)',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.75)',
                  border: 'none',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700 }}>{d.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>{d.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '18px 18px 30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Pending Booking Requests Section */}
        {pendingAppointments.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', letterSpacing: '0.08em', fontWeight: 800, color: '#ffd4de', marginBottom: '10px' }}>
              <AlertCircle size={13} color="#f5265f" /> ВХІДНІ ЗАЯВКИ НА ЗАПИС ({pendingAppointments.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingAppointments.map((appt) => (
                <div
                  key={appt.id}
                  style={{
                    background: '#24405c',
                    borderRadius: '20px',
                    padding: '16px',
                    border: '1.5px solid #f5265f',
                    boxShadow: '0 4px 18px rgba(245, 38, 95, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: '#ffd4de',
                          color: '#f5265f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '13px',
                        }}
                      >
                        КП
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>{appt.clientName}</div>
                        <div style={{ fontSize: '12px', color: '#ffd4de', fontWeight: 600 }}>{appt.serviceName}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>{appt.price}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {appt.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {appt.time}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button
                      onClick={() => onAcceptAppointment(appt.id)}
                      style={{
                        flex: 1,
                        height: '40px',
                        borderRadius: '20px',
                        background: '#f5265f',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(245, 38, 95, 0.35)',
                      }}
                    >
                      <Check size={16} /> Підтвердити візит
                    </button>

                    <button
                      onClick={onOpenChatWithClient}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '20px',
                        background: 'rgba(255,255,255,0.12)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MessageCircle size={16} />
                    </button>

                    <button
                      onClick={() => onDeclineAppointment(appt.id)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '20px',
                        background: 'rgba(231, 76, 60, 0.2)',
                        color: '#ff6b6b',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Schedule Section */}
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', fontWeight: 800, color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>
            ПІДТВЕРДЖЕНІ ВІЗИТИ ({confirmedAppointments.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {confirmedAppointments.map((appt) => (
              <div
                key={appt.id}
                style={{
                  background: '#24405c',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #1c3248',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(245, 38, 95, 0.2)',
                      color: '#ffd4de',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                    }}
                  >
                    {appt.time}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{appt.clientName}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{appt.serviceName}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffd4de' }}>{appt.price}</div>
                  <span style={{ fontSize: '10px', color: '#a9c8e6', fontWeight: 700 }}>Підтверджено ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Booking Slots Manager */}
        <div style={{ background: '#24405c', borderRadius: '20px', padding: '16px', border: '1px solid #1c3248' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Доступні віконця для запису</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>Віконця, які бачать клієнти на карті</div>
            </div>

            <button
              onClick={() => setShowSlotInput(!showSlotInput)}
              style={{
                padding: '6px 12px',
                borderRadius: '14px',
                background: '#f5265f',
                color: '#ffffff',
                border: 'none',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(245, 38, 95, 0.3)',
              }}
            >
              <Plus size={13} /> Додати час
            </button>
          </div>

          {showSlotInput && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="напр. 15:30"
                value={newSlotInput}
                onChange={(e) => setNewSlotInput(e.target.value)}
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid #1c3248',
                  padding: '0 12px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAddSlot}
                style={{
                  padding: '0 16px',
                  borderRadius: '12px',
                  background: '#f5265f',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Зберегти
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {availableSlots.map((slot, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <Clock size={12} color="#ffd4de" />
                <span>{slot}</span>
                <button
                  onClick={() => onRemoveSlot(slot)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
