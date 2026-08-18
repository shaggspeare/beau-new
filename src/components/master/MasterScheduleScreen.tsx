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
    <div style={{ height: '100%', background: '#121127', color: '#ffffff', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Master Top Header */}
      <div style={{ padding: '52px 20px 16px', borderBottom: '1px solid #232145', background: '#1a1938' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '16px',
                background: master.tint,
                color: '#1a1938',
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
                    background: '#d9f24e',
                    color: '#1a1938',
                    fontWeight: 800,
                  }}
                >
                  MASTER PORTAL
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                {master.craft} · {master.district}
              </div>
            </div>
          </div>
        </div>

        {/* Day Selector Pill Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {[
            { id: 'today', label: 'Thu 20 Aug', sub: 'Today' },
            { id: 'tomorrow', label: 'Fri 21 Aug', sub: 'Tomorrow' },
            { id: 'saturday', label: 'Sat 22 Aug', sub: 'Weekend' },
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
                  background: active ? '#d9f24e' : 'rgba(255,255,255,0.06)',
                  color: active ? '#1a1938' : '#ffffff',
                  border: 'none',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700 }}>{d.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.75 }}>{d.sub}</div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', letterSpacing: '0.08em', fontWeight: 800, color: '#d9f24e', marginBottom: '10px' }}>
              <AlertCircle size={13} /> INCOMING BOOKING REQUESTS ({pendingAppointments.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingAppointments.map((appt) => (
                <div
                  key={appt.id}
                  style={{
                    background: '#1a1938',
                    borderRadius: '20px',
                    padding: '16px',
                    border: '1.5px solid #d9f24e',
                    boxShadow: '0 4px 18px rgba(217, 242, 78, 0.12)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: '#d9f24e',
                          color: '#1a1938',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '13px',
                        }}
                      >
                        KP
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>{appt.clientName}</div>
                        <div style={{ fontSize: '12px', color: '#d9f24e', fontWeight: 600 }}>{appt.serviceName}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>{appt.price}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
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
                        background: '#d9f24e',
                        color: '#1a1938',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Check size={16} /> Accept Visit
                    </button>

                    <button
                      onClick={onOpenChatWithClient}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '20px',
                        background: 'rgba(255,255,255,0.1)',
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
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>
            CONFIRMED CLIENT VISITS ({confirmedAppointments.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {confirmedAppointments.map((appt) => (
              <div
                key={appt.id}
                style={{
                  background: '#1a1938',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #2b2954',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(217, 242, 78, 0.15)',
                      color: '#d9f24e',
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
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{appt.serviceName}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#d9f24e' }}>{appt.price}</div>
                  <span style={{ fontSize: '10px', color: '#bfe8d8', fontWeight: 700 }}>Confirmed ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Booking Slots Manager */}
        <div style={{ background: '#1a1938', borderRadius: '20px', padding: '16px', border: '1px solid #2b2954' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Available Time Slots</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Slots visible to clients on the map</div>
            </div>

            <button
              onClick={() => setShowSlotInput(!showSlotInput)}
              style={{
                padding: '6px 12px',
                borderRadius: '14px',
                background: '#d9f24e',
                color: '#1a1938',
                border: 'none',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={13} /> Add Slot
            </button>
          </div>

          {showSlotInput && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="e.g. 15:30"
                value={newSlotInput}
                onChange={(e) => setNewSlotInput(e.target.value)}
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid #2b2954',
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
                  background: '#d9f24e',
                  color: '#1a1938',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Save
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
                <Clock size={12} color="#d9f24e" />
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
