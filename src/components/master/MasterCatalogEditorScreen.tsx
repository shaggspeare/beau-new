import React, { useState } from 'react';
import { Master, ServiceItem } from '../../data/crawledMasters';
import { Plus, Search, Edit2, Trash2, Check, X } from 'lucide-react';

interface MasterCatalogEditorScreenProps {
  master: Master;
  services: ServiceItem[];
  onUpdateServices: (services: ServiceItem[]) => void;
}

export const MasterCatalogEditorScreen: React.FC<MasterCatalogEditorScreenProps> = ({
  master,
  services,
  onUpdateServices,
}) => {
  const [search, setSearch] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(master.categoryLabel);
  const [newPrice, setNewPrice] = useState('₴600');

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveEdit = (index: number) => {
    const updated = [...services];
    updated[index] = { ...updated[index], price: editPrice.startsWith('₴') ? editPrice : `₴${editPrice}` };
    onUpdateServices(updated);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const updated = services.filter((_, i) => i !== index);
    onUpdateServices(updated);
  };

  const handleAddNew = () => {
    if (!newName.trim()) return;
    const formattedPrice = newPrice.startsWith('₴') ? newPrice : `₴${newPrice}`;
    const newService: ServiceItem = {
      name: newName.trim(),
      category: newCategory.trim() || master.categoryLabel,
      price: formattedPrice,
    };
    onUpdateServices([newService, ...services]);
    setNewName('');
    setNewPrice('₴600');
    setShowAddModal(false);
  };

  return (
    <div style={{ height: '100%', background: '#16283b', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', background: '#24405c', borderBottom: '1px solid #1c3248' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>
              Каталог послуг
            </h1>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
              {services.length} послуг налаштовано для {master.name}
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '16px',
              background: '#f5265f',
              color: '#ffffff',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(245, 38, 95, 0.3)',
            }}
          >
            <Plus size={15} /> Додати послугу
          </button>
        </div>

        {/* Search */}
        <div
          style={{
            height: '42px',
            borderRadius: '21px',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: '8px',
          }}
        >
          <Search size={14} color="rgba(255,255,255,0.5)" />
          <input
            type="text"
            placeholder="Пошук по каталогу послуг..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '13px',
            }}
          />
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div
          style={{
            padding: '16px 20px',
            background: '#24405c',
            borderBottom: '2px solid #f5265f',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffd4de' }}>ДОДАТИ НОВУ ПОСЛУГУ</div>
          <input
            type="text"
            placeholder="Назва послуги (напр. Балаяж преміум)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid #1c3248',
              padding: '0 12px',
              color: '#ffffff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Ціна (напр. ₴850)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              style={{
                flex: 1,
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid #1c3248',
                padding: '0 12px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAddNew}
              style={{
                padding: '0 16px',
                borderRadius: '10px',
                background: '#f5265f',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Додати
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                padding: '0 12px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Services List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 18px 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {filtered.map((srv, idx) => {
          const isEditing = editingIndex === idx;

          return (
            <div
              key={idx}
              style={{
                background: '#24405c',
                borderRadius: '16px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                border: '1px solid #1c3248',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{srv.name}</div>
                <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>
                  {srv.category.replace(/\(\d+\)/, '').trim()}
                </div>
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={{
                      width: '75px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid #f5265f',
                      color: '#ffffff',
                      padding: '0 8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => handleSaveEdit(idx)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#f5265f',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setEditingIndex(null)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffd4de' }}>{srv.price}</span>
                  <button
                    onClick={() => {
                      setEditingIndex(idx);
                      setEditPrice(srv.price);
                    }}
                    title="Змінити ціну"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.7)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    title="Видалити послугу"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: 'rgba(231, 76, 60, 0.1)',
                      color: '#ff6b6b',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
