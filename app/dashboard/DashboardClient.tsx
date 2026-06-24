'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Property, Room } from '@/lib/types'
import {
  ChevronDown, ChevronUp, Plus, Pencil,
  LogOut, Phone, Calendar, Trash2, Check, X,
} from 'lucide-react'

interface Props { username: string }

const ROOM_IMG = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=160&h=160&fit=crop&q=80'

function fDate(d: string | null) {
  if (!d) return '—'
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`
}
function fPrice(p: number) { return `RM ${p.toFixed(2)}` }

// ── Reusable field row ──
function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold mb-1 tracking-wider uppercase"
        style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</p>
      {children}
    </div>
  )
}

function ModalInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
      className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
      style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }}
      placeholder-style="color: rgba(255,255,255,0.4)"
    />
  )
}

// ── Modal shell ──
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 anim-fade"
      style={{ backgroundColor: 'rgba(30,10,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl anim-up overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #F97316 0%, #C2500A 100%)' }}>
        {children}
      </div>
    </div>
  )
}

// ── Modal: Edit Bilik ──
function EditRoomModal({ room, propertyName, onClose, onSave, onDelete }: {
  room: Room; propertyName: string
  onClose: () => void; onSave: (d: Partial<Room>) => Promise<void>; onDelete: () => Promise<void>
}) {
  const [price,  setPrice]  = useState(String(room.price))
  const [info,   setInfo]   = useState(room.info ?? '')
  const [phone,  setPhone]  = useState(room.tenant_phone ?? '')
  const [date,   setDate]   = useState(room.checkin_date ?? '')
  const [status, setStatus] = useState(room.status)
  const [num,    setNum]    = useState(room.room_number)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>{propertyName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <input value={num} onChange={e => setNum(e.target.value)} maxLength={6}
              className="text-white font-bold text-2xl bg-transparent outline-none w-20"
              style={{ caretColor: 'white' }} />
            <Pencil size={13} style={{ color: 'rgba(255,255,255,0.45)' }} />
          </div>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all">
          <X size={18} />
        </button>
      </div>

      {/* Status toggle */}
      <div className="mx-5 mb-4 rounded-2xl p-1 flex gap-1" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        {(['available', 'occupied'] as const).map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${status === s ? 'text-white shadow' : 'text-white/40'}`}
            style={status === s ? { backgroundColor: s === 'available' ? '#16A34A' : '#DC2626' } : {}}>
            {s === 'available' ? '● Kosong' : '● Ada Penyewa'}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="px-5 pb-5 space-y-3">
        <ModalField label="Harga (RM)">
          <ModalInput value={price} onChange={setPrice} placeholder="0.00" />
        </ModalField>
        <ModalField label="Info Bilik">
          <ModalInput value={info} onChange={setInfo} placeholder="Windowed, Ventilation..." />
        </ModalField>
        <ModalField label="No. Telefon Penyewa">
          <ModalInput value={phone} onChange={setPhone} placeholder="013 441 3415" />
        </ModalField>
        <ModalField label="Tarikh Masuk">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }} />
        </ModalField>

        <div className="flex gap-2 pt-1">
          <button
            onClick={async () => {
              setSaving(true)
              await onSave({ room_number: num, price: parseFloat(price)||0, info: info||null, tenant_phone: phone||null, checkin_date: date||null, status })
              setSaving(false); onClose()
            }}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <Check size={15} /> Simpan
          </button>
          <button
            onClick={async () => {
              if (!confirmDel) { setConfirmDel(true); return }
              setSaving(true); await onDelete(); setSaving(false); onClose()
            }}
            disabled={saving}
            className={`px-4 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 transition-all active:scale-95 ${confirmDel ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: confirmDel ? '#7F1D1D' : 'rgba(220,38,38,0.65)' }}>
            <Trash2 size={15} /> {confirmDel ? 'Confirm?' : 'Buang'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Modal: Edit Kawasan ──
function EditPropertyModal({ property, onClose, onSave, onDelete }: {
  property: Property; onClose: () => void; onSave: (n: string) => Promise<void>; onDelete: () => Promise<void>
}) {
  const [name, setName] = useState(property.name)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h3 className="text-white font-bold text-lg">Edit Kawasan</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"><X size={18} /></button>
      </div>
      <div className="px-5 pb-6 space-y-3">
        <ModalField label="Nama Kawasan">
          <ModalInput value={name} onChange={setName} placeholder="cth: Alamesra 1" />
        </ModalField>
        <div className="flex gap-2 pt-1">
          <button onClick={async () => { if (!name.trim()) return; setSaving(true); await onSave(name.trim().toUpperCase()); setSaving(false); onClose() }}
            disabled={saving || !name.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <Check size={15} /> Simpan
          </button>
          <button onClick={async () => { if (!confirmDel) { setConfirmDel(true); return }; setSaving(true); await onDelete(); setSaving(false); onClose() }}
            disabled={saving}
            className={`px-4 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 transition-all active:scale-95 ${confirmDel ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: confirmDel ? '#7F1D1D' : 'rgba(220,38,38,0.65)' }}>
            <Trash2 size={15} /> {confirmDel ? 'Confirm?' : 'Buang'}
          </button>
        </div>
        {confirmDel && <p className="text-white/60 text-xs text-center">Semua bilik dalam kawasan ini akan dibuang.</p>}
      </div>
    </Modal>
  )
}

// ── Modal: Tambah Kawasan ──
function AddPropertyModal({ onClose, onAdd }: { onClose: () => void; onAdd: (n: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h3 className="text-white font-bold text-lg">Kawasan Baru</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"><X size={18} /></button>
      </div>
      <div className="px-5 pb-6 space-y-3">
        <div className="flex justify-center pb-1">
          <img src={ROOM_IMG} alt="bilik" className="w-20 h-20 rounded-2xl object-cover opacity-80 shadow-md" />
        </div>
        <ModalField label="Nama Kawasan">
          <ModalInput value={name} onChange={setName} placeholder="cth: Sembulan, Luyang..." />
        </ModalField>
        <button onClick={async () => { if (!name.trim()) return; setSaving(true); await onAdd(name.trim().toUpperCase()); setSaving(false); onClose() }}
          disabled={saving || !name.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <Plus size={15} /> Tambah Kawasan
        </button>
      </div>
    </Modal>
  )
}

// ── Modal: Tambah Bilik ──
function AddRoomModal({ propertyName, propertyId, nextIdx, onClose, onAdd }: {
  propertyName: string; propertyId: string; nextIdx: number
  onClose: () => void; onAdd: (d: Omit<Room, 'id' | 'created_at'>) => Promise<void>
}) {
  const [num,    setNum]    = useState('')
  const [price,  setPrice]  = useState('')
  const [info,   setInfo]   = useState('')
  const [status, setStatus] = useState<'available' | 'occupied'>('available')
  const [saving, setSaving] = useState(false)
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>{propertyName}</p>
          <h3 className="text-white font-bold text-lg">Tambah Bilik</h3>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"><X size={18} /></button>
      </div>
      <div className="px-5 pb-6 space-y-3">
        {/* Status */}
        <div className="rounded-2xl p-1 flex gap-1" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {(['available', 'occupied'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${status === s ? 'text-white shadow' : 'text-white/40'}`}
              style={status === s ? { backgroundColor: s === 'available' ? '#16A34A' : '#DC2626' } : {}}>
              {s === 'available' ? '● Kosong' : '● Ada Penyewa'}
            </button>
          ))}
        </div>
        <ModalField label="No. Bilik">
          <ModalInput value={num} onChange={setNum} placeholder="cth: 01, A1..." />
        </ModalField>
        <ModalField label="Harga (RM)">
          <ModalInput value={price} onChange={setPrice} placeholder="0.00" />
        </ModalField>
        <ModalField label="Info Bilik">
          <ModalInput value={info} onChange={setInfo} placeholder="Windowed, Ventilation..." />
        </ModalField>
        <button
          onClick={async () => {
            if (!num.trim()) return; setSaving(true)
            await onAdd({ property_id: propertyId, room_number: num.trim(), price: parseFloat(price)||0, info: info||null, tenant_phone: null, checkin_date: null, status, order_index: nextIdx })
            setSaving(false); onClose()
          }}
          disabled={saving || !num.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <Plus size={15} /> Tambah Bilik
        </button>
      </div>
    </Modal>
  )
}

// ── Room Row ──
function RoomRow({ room, onEdit, onToggle }: { room: Room; onEdit: () => void; onToggle: () => void }) {
  const ok = room.status === 'available'
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--cream-card)', border: '1px solid var(--orange-soft)' }}>
      <div className="flex items-stretch">
        {/* Nombor bilik */}
        <div className="w-14 flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--orange)', borderRadius: '0' }}>
          <span className="text-white font-bold text-lg">{room.room_number}</span>
        </div>

        {/* Info */}
        <div className="flex-1 px-3 py-2.5 min-w-0">
          <button onClick={onToggle} className="flex items-center gap-1.5 mb-1 group">
            <span className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
              style={{ backgroundColor: ok ? 'var(--green)' : 'var(--red)' }} />
            <span className="text-xs font-semibold" style={{ color: ok ? 'var(--green)' : 'var(--red)' }}>
              {ok ? 'Kosong' : 'Ada Penyewa'}
            </span>
          </button>
          <p className="font-bold text-sm" style={{ color: 'var(--brown)' }}>{fPrice(room.price)}</p>
          {room.info && (
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-lg mt-1"
              style={{ backgroundColor: 'var(--orange-soft)', color: 'var(--brown-light)' }}>
              {room.info}
            </span>
          )}
        </div>

        {/* Penyewa info + edit */}
        <div className="flex flex-col items-end justify-between px-3 py-2.5 shrink-0">
          <div className="text-right space-y-0.5">
            <div className="flex items-center gap-1 justify-end">
              <Phone size={10} style={{ color: 'var(--text-soft)' }} />
              <span className="text-xs" style={{ color: room.tenant_phone ? 'var(--text-main)' : '#C4A882' }}>
                {room.tenant_phone ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <Calendar size={10} style={{ color: 'var(--text-soft)' }} />
              <span className="text-xs" style={{ color: room.checkin_date ? 'var(--text-main)' : '#C4A882' }}>
                {fDate(room.checkin_date)}
              </span>
            </div>
          </div>
          <button onClick={onEdit}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all mt-1"
            style={{ backgroundColor: 'var(--orange-soft)', color: 'var(--brown-light)' }}>
            <Pencil size={11} /> Edit
          </button>
        </div>
      </div>
    </div>
  )
}

// ── DASHBOARD UTAMA ──
export default function DashboardClient({ username }: Props) {
  const [properties, setProperties] = useState<Property[]>([])
  const [rooms,      setRooms]      = useState<Room[]>([])
  const [expanded,   setExpanded]   = useState<Set<string>>(new Set())
  const [loading,    setLoading]    = useState(true)

  const [editRoom,          setEditRoom]          = useState<Room | null>(null)
  const [editProperty,      setEditProperty]      = useState<Property | null>(null)
  const [showAddProperty,   setShowAddProperty]   = useState(false)
  const [addRoomForProp,    setAddRoomForProp]    = useState<Property | null>(null)

  const router   = useRouter()
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from('properties').select('*').order('order_index'),
      supabase.from('rooms').select('*').order('order_index'),
    ])
    if (p) setProperties(p)
    if (r) setRooms(r)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const ch = supabase.channel('kbbs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchData])

  const toggle    = (id: string) => setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const getRooms  = (id: string) => rooms.filter(r => r.property_id === id).sort((a, b) => a.order_index - b.order_index)
  const getAvail  = (id: string) => rooms.filter(r => r.property_id === id && r.status === 'available').length

  const saveRoom   = async (id: string, d: Partial<Room>)           => { await supabase.from('rooms').update(d).eq('id', id) }
  const deleteRoom = async (id: string)                             => { await supabase.from('rooms').delete().eq('id', id) }
  const addRoom    = async (d: Omit<Room, 'id' | 'created_at'>)     => { await supabase.from('rooms').insert(d) }
  const saveProp   = async (id: string, name: string)               => { await supabase.from('properties').update({ name }).eq('id', id) }
  const deleteProp = async (id: string)                             => { await supabase.from('properties').delete().eq('id', id) }
  const addProp    = async (name: string) => {
    const max = properties.length ? Math.max(...properties.map(p => p.order_index)) + 1 : 0
    await supabase.from('properties').insert({ name, order_index: max })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse"
          style={{ backgroundColor: 'var(--orange)' }}>
          <span className="text-white font-bold text-lg">KB</span>
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-soft)' }}>Memuatkan...</p>
      </div>
    </div>
  )

  const totalRooms  = rooms.length
  const totalAvail  = rooms.filter(r => r.status === 'available').length
  const totalOccup  = totalRooms - totalAvail

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: 'var(--orange)', borderBottom: '1px solid var(--orange-dark)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 shadow-sm">
              <span className="text-white font-bold text-sm">KB</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-base tracking-wide leading-none">KBBS</h1>
              <p className="text-orange-200 text-xs mt-0.5">
                Hai, <span className="font-semibold capitalize">{username}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 live-dot" />
              <span className="text-white text-xs font-semibold">Live</span>
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
              className="text-white/70 hover:text-white hover:bg-white/15 rounded-xl p-2 transition-all">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="max-w-2xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Kawasan', val: properties.length },
            { label: 'Kosong',  val: totalAvail,  color: 'var(--green)' },
            { label: 'Penyewa', val: totalOccup,  color: 'var(--red)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-2xl px-3 py-3 text-center shadow-sm"
              style={{ backgroundColor: 'var(--cream-card)', border: '1px solid var(--orange-soft)' }}>
              <p className="font-bold text-2xl" style={{ color: color ?? 'var(--orange)' }}>{val}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-soft)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Kawasan list ── */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-4">
        {properties.map(property => {
          const isOpen   = expanded.has(property.id)
          const pRooms   = getRooms(property.id)
          const avail    = getAvail(property.id)

          return (
            <div key={property.id} className="rounded-3xl overflow-hidden shadow-md"
              style={{ border: '1px solid var(--orange-soft)' }}>

              {/* Header kawasan */}
              <div className="flex items-center gap-3 p-4 cursor-pointer select-none"
                style={{ backgroundColor: 'var(--orange)' }}
                onClick={() => toggle(property.id)}>
                <img src={ROOM_IMG} alt={property.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-md"
                  style={{ border: '2px solid rgba(255,255,255,0.3)' }} />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-base truncate">{property.name}</h2>
                  <p className="text-orange-100 text-xs mt-0.5">
                    <span className="font-semibold text-white">{avail}</span> kosong
                    <span className="opacity-60"> · {pRooms.length} bilik</span>
                  </p>
                </div>
                <button onClick={e => { e.stopPropagation(); setEditProperty(property) }}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  <Pencil size={12} /> Edit
                </button>
                <div className="text-white/70 ml-1 shrink-0">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Bilik list */}
              {isOpen && (
                <div className="p-3 space-y-2" style={{ backgroundColor: 'var(--bg)' }}>
                  {pRooms.length === 0 ? (
                    <p className="text-center text-sm py-4 font-medium" style={{ color: 'var(--text-soft)' }}>
                      Tiada bilik lagi.
                    </p>
                  ) : pRooms.map(room => (
                    <RoomRow key={room.id} room={room}
                      onEdit={() => setEditRoom(room)}
                      onToggle={async () => saveRoom(room.id, { status: room.status === 'available' ? 'occupied' : 'available' })} />
                  ))}

                  {/* Tambah bilik */}
                  <button onClick={() => setAddRoomForProp(property)}
                    className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border-2 border-dashed"
                    style={{ borderColor: 'var(--orange-soft)', color: 'var(--text-soft)' }}>
                    <Plus size={15} /> Tambah Bilik
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Tambah kawasan */}
        <div className="flex flex-col items-center pt-3 gap-2">
          <button onClick={() => setShowAddProperty(true)}
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 hover:shadow-xl"
            style={{ backgroundColor: 'var(--orange)' }}>
            <Plus size={30} className="text-white" strokeWidth={2.5} />
          </button>
          <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-soft)' }}>
            Tambah Kawasan
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: '#C4A882' }}>KBBS © 2026</p>
          <p className="text-xs" style={{ color: '#D4B896' }}>Developed by Hanson Engineering</p>
        </div>
      </div>

      {/* Modals */}
      {editRoom && (
        <EditRoomModal room={editRoom}
          propertyName={properties.find(p => p.id === editRoom.property_id)?.name ?? ''}
          onClose={() => setEditRoom(null)}
          onSave={d => saveRoom(editRoom.id, d)}
          onDelete={() => deleteRoom(editRoom.id)} />
      )}
      {editProperty && (
        <EditPropertyModal property={editProperty}
          onClose={() => setEditProperty(null)}
          onSave={n => saveProp(editProperty.id, n)}
          onDelete={() => deleteProp(editProperty.id)} />
      )}
      {showAddProperty && <AddPropertyModal onClose={() => setShowAddProperty(false)} onAdd={addProp} />}
      {addRoomForProp && (
        <AddRoomModal propertyName={addRoomForProp.name} propertyId={addRoomForProp.id}
          nextIdx={getRooms(addRoomForProp.id).length}
          onClose={() => setAddRoomForProp(null)} onAdd={addRoom} />
      )}
    </div>
  )
}
