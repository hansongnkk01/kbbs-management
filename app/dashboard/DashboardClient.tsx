'use client'

// Dashboard utama - semua interaksi berlaku sini
// Real-time update supaya semua admin nampak perubahan sama-sama
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Property, Room } from '@/lib/types'
import {
  ChevronDown, ChevronUp, Plus, Pencil, LogOut,
  Phone, Calendar, Trash2, Check, X, Building2,
} from 'lucide-react'

// Gambar default untuk setiap kawasan bilik
const DEFAULT_ROOM_IMG = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=120&h=120&fit=crop&q=80'

interface Props {
  username: string
}

// ---- Modal Edit Bilik ----
interface EditRoomModalProps {
  room: Room
  propertyName: string
  onClose: () => void
  onSave: (data: Partial<Room>) => Promise<void>
  onDelete: () => Promise<void>
}

function EditRoomModal({ room, propertyName, onClose, onSave, onDelete }: EditRoomModalProps) {
  const [price, setPrice] = useState(String(room.price))
  const [info, setInfo] = useState(room.info ?? '')
  const [phone, setPhone] = useState(room.tenant_phone ?? '')
  const [date, setDate] = useState(room.checkin_date ?? '')
  const [status, setStatus] = useState(room.status)
  const [roomNum, setRoomNum] = useState(room.room_number)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      room_number: roomNum,
      price: parseFloat(price) || 0,
      info: info || null,
      tenant_phone: phone || null,
      checkin_date: date || null,
      status,
    })
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setSaving(true)
    await onDelete()
    setSaving(false)
    onClose()
  }

  return (
    // Overlay gelap
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-3xl shadow-2xl animate-slide-up overflow-hidden"
        style={{ backgroundColor: 'var(--orange-primary)' }}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-white" />
            <span className="text-white font-black text-sm tracking-widest">EDIT BILIK</span>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-70 transition-opacity">
            <X size={20} />
          </button>
        </div>

        {/* Nama kawasan */}
        <div className="px-5 pb-2">
          <span className="text-white text-xs font-bold opacity-75 tracking-wider">{propertyName}</span>
        </div>

        {/* Nombor bilik */}
        <div
          className="mx-5 mb-4 rounded-2xl flex items-center justify-between px-5 py-3"
          style={{ backgroundColor: 'var(--brown-room)' }}
        >
          <input
            value={roomNum}
            onChange={(e) => setRoomNum(e.target.value)}
            className="text-white font-black text-2xl bg-transparent outline-none w-20"
            maxLength={6}
          />
          <Pencil size={16} className="text-white opacity-60" />
        </div>

        {/* Toggle status */}
        <div className="px-5 mb-4">
          <div
            className="rounded-2xl p-1 flex"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
          >
            <button
              onClick={() => setStatus('available')}
              className={`flex-1 py-2 rounded-xl font-black text-xs tracking-wider transition-all ${
                status === 'available' ? 'text-white' : 'text-white opacity-40'
              }`}
              style={status === 'available' ? { backgroundColor: '#22C55E' } : {}}
            >
              ● KOSONG
            </button>
            <button
              onClick={() => setStatus('occupied')}
              className={`flex-1 py-2 rounded-xl font-black text-xs tracking-wider transition-all ${
                status === 'occupied' ? 'text-white' : 'text-white opacity-40'
              }`}
              style={status === 'occupied' ? { backgroundColor: '#EF4444' } : {}}
            >
              ● ADA PENYEWA
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="px-5 space-y-3 pb-5">
          {/* Harga */}
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xs tracking-widest w-16">HARGA</span>
            <div
              className="flex-1 flex items-center justify-between rounded-xl px-3 py-2"
              style={{ backgroundColor: '#FDE8C8' }}
            >
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="bg-transparent outline-none font-bold text-sm flex-1"
                style={{ color: 'var(--brown-dark)' }}
              />
              <span className="text-xs font-bold opacity-50" style={{ color: 'var(--brown-dark)' }}>RM</span>
            </div>
          </div>

          {/* Info bilik */}
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xs tracking-widest w-16">INFO</span>
            <div
              className="flex-1 flex items-center justify-between rounded-xl px-3 py-2"
              style={{ backgroundColor: '#FDE8C8' }}
            >
              <input
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                placeholder="Cth: Windowed, Ventilation..."
                className="bg-transparent outline-none font-bold text-sm flex-1"
                style={{ color: 'var(--brown-dark)' }}
              />
              <Pencil size={14} className="opacity-40 ml-1" style={{ color: 'var(--brown-dark)' }} />
            </div>
          </div>

          {/* No. telefon penyewa */}
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xs tracking-widest w-16">NO. HP</span>
            <div
              className="flex-1 flex items-center justify-between rounded-xl px-3 py-2"
              style={{ backgroundColor: '#FDE8C8' }}
            >
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="cth: 013 441 3415"
                className="bg-transparent outline-none font-bold text-sm flex-1"
                style={{ color: 'var(--brown-dark)' }}
              />
              <Pencil size={14} className="opacity-40 ml-1" style={{ color: 'var(--brown-dark)' }} />
            </div>
          </div>

          {/* Tarikh masuk */}
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xs tracking-widest w-16">TARIKH</span>
            <div
              className="flex-1 flex items-center justify-between rounded-xl px-3 py-2"
              style={{ backgroundColor: '#FDE8C8' }}
            >
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent outline-none font-bold text-sm flex-1"
                style={{ color: 'var(--brown-dark)' }}
              />
              <Pencil size={14} className="opacity-40 ml-1" style={{ color: 'var(--brown-dark)' }} />
            </div>
          </div>

          {/* Butang save & delete */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl font-black text-sm text-white tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: 'var(--brown-dark)' }}
            >
              <Check size={16} />
              SIMPAN
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className={`py-3 px-4 rounded-xl font-black text-sm text-white tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                confirmDelete ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: confirmDelete ? '#7F1D1D' : '#EF4444' }}
            >
              <Trash2 size={16} />
              {confirmDelete ? 'CONFIRM?' : 'BUANG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Modal Edit Kawasan ----
interface EditPropertyModalProps {
  property: Property
  onClose: () => void
  onSave: (name: string) => Promise<void>
  onDelete: () => Promise<void>
}

function EditPropertyModal({ property, onClose, onSave, onDelete }: EditPropertyModalProps) {
  const [name, setName] = useState(property.name)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave(name.trim().toUpperCase())
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setSaving(true)
    await onDelete()
    setSaving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-3xl shadow-2xl animate-slide-up overflow-hidden"
        style={{ backgroundColor: 'var(--orange-primary)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-white" />
            <span className="text-white font-black text-sm tracking-widest">EDIT KAWASAN</span>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-70">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-3">
          <div>
            <label className="text-white font-black text-xs tracking-widest block mb-2">NAMA KAWASAN</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 font-bold text-sm outline-none"
              style={{ backgroundColor: '#FDE8C8', color: 'var(--brown-dark)' }}
              placeholder="cth: ALAMESRA 1"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex-1 py-3 rounded-xl font-black text-sm text-white tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: 'var(--brown-dark)' }}
            >
              <Check size={16} />
              SIMPAN
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className={`py-3 px-4 rounded-xl font-black text-sm text-white flex items-center gap-2 transition-all active:scale-95 ${
                confirmDelete ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: confirmDelete ? '#7F1D1D' : '#EF4444' }}
            >
              <Trash2 size={16} />
              {confirmDelete ? 'CONFIRM?' : 'BUANG'}
            </button>
          </div>
          {confirmDelete && (
            <p className="text-white text-xs text-center font-semibold opacity-80">
              ⚠️ Semua bilik dalam kawasan ini akan dibuang juga!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Modal Tambah Kawasan Baru ----
interface AddPropertyModalProps {
  onClose: () => void
  onAdd: (name: string) => Promise<void>
}

function AddPropertyModal({ onClose, onAdd }: AddPropertyModalProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onAdd(name.trim().toUpperCase())
    setSaving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-3xl shadow-2xl animate-slide-up overflow-hidden"
        style={{ backgroundColor: 'var(--orange-primary)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-white" />
            <span className="text-white font-black text-sm tracking-widest">TAMBAH KAWASAN BARU</span>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-70">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-3">
          {/* Preview gambar */}
          <div className="flex justify-center">
            <img
              src={DEFAULT_ROOM_IMG}
              alt="bilik"
              className="w-24 h-24 rounded-2xl object-cover shadow-lg"
            />
          </div>

          <div>
            <label className="text-white font-black text-xs tracking-widest block mb-2">NAMA KAWASAN</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="w-full rounded-xl px-4 py-3 font-bold text-sm outline-none"
              style={{ backgroundColor: '#FDE8C8', color: 'var(--brown-dark)' }}
              placeholder="cth: SEMBULAN, LUYANG..."
              autoFocus
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || !name.trim()}
            className="w-full py-3 rounded-xl font-black text-sm text-white tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: 'var(--brown-dark)' }}
          >
            <Plus size={16} />
            TAMBAH
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Modal Tambah Bilik Baru ----
interface AddRoomModalProps {
  propertyName: string
  nextOrderIndex: number
  onClose: () => void
  onAdd: (data: Omit<Room, 'id' | 'created_at'>) => Promise<void>
  propertyId: string
}

function AddRoomModal({ propertyName, propertyId, nextOrderIndex, onClose, onAdd }: AddRoomModalProps) {
  const [roomNum, setRoomNum] = useState('')
  const [price, setPrice] = useState('')
  const [info, setInfo] = useState('')
  const [status, setStatus] = useState<'available' | 'occupied'>('available')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!roomNum.trim()) return
    setSaving(true)
    await onAdd({
      property_id: propertyId,
      room_number: roomNum.trim(),
      price: parseFloat(price) || 0,
      info: info || null,
      tenant_phone: null,
      checkin_date: null,
      status,
      order_index: nextOrderIndex,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-3xl shadow-2xl animate-slide-up overflow-hidden"
        style={{ backgroundColor: 'var(--orange-primary)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-white" />
            <span className="text-white font-black text-sm tracking-widest">TAMBAH BILIK</span>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-70">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-2">
          <span className="text-white text-xs font-bold opacity-75 tracking-wider">{propertyName}</span>
        </div>

        <div className="px-5 pb-6 space-y-3">
          {/* Toggle status */}
          <div
            className="rounded-2xl p-1 flex"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
          >
            <button
              onClick={() => setStatus('available')}
              className={`flex-1 py-2 rounded-xl font-black text-xs tracking-wider transition-all ${
                status === 'available' ? 'text-white' : 'text-white opacity-40'
              }`}
              style={status === 'available' ? { backgroundColor: '#22C55E' } : {}}
            >
              ● KOSONG
            </button>
            <button
              onClick={() => setStatus('occupied')}
              className={`flex-1 py-2 rounded-xl font-black text-xs tracking-wider transition-all ${
                status === 'occupied' ? 'text-white' : 'text-white opacity-40'
              }`}
              style={status === 'occupied' ? { backgroundColor: '#EF4444' } : {}}
            >
              ● ADA PENYEWA
            </button>
          </div>

          {/* No. Bilik */}
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xs tracking-widest w-16">NO. BILIK</span>
            <input
              value={roomNum}
              onChange={(e) => setRoomNum(e.target.value)}
              className="flex-1 rounded-xl px-4 py-3 font-bold text-sm outline-none"
              style={{ backgroundColor: '#FDE8C8', color: 'var(--brown-dark)' }}
              placeholder="cth: 01, A1..."
              autoFocus
            />
          </div>

          {/* Harga */}
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xs tracking-widest w-16">HARGA</span>
            <div
              className="flex-1 flex items-center justify-between rounded-xl px-3 py-2"
              style={{ backgroundColor: '#FDE8C8' }}
            >
              <span className="text-xs font-bold opacity-50 mr-2" style={{ color: 'var(--brown-dark)' }}>RM</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="bg-transparent outline-none font-bold text-sm flex-1"
                style={{ color: 'var(--brown-dark)' }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xs tracking-widest w-16">INFO</span>
            <input
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              className="flex-1 rounded-xl px-4 py-3 font-bold text-sm outline-none"
              style={{ backgroundColor: '#FDE8C8', color: 'var(--brown-dark)' }}
              placeholder="Windowed, Ventilation..."
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || !roomNum.trim()}
            className="w-full py-3 rounded-xl font-black text-sm text-white tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 mt-2"
            style={{ backgroundColor: 'var(--brown-dark)' }}
          >
            <Plus size={16} />
            TAMBAH BILIK
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Format tarikh untuk display ----
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day} / ${month} / ${year}`
}

// ---- Format harga ----
function formatPrice(price: number): string {
  return `RM ${price.toFixed(2)}`
}

// ======== KOMPONEN UTAMA DASHBOARD ========
export default function DashboardClient({ username }: Props) {
  const [properties, setProperties] = useState<Property[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // State untuk modals
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [editProperty, setEditProperty] = useState<Property | null>(null)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [addRoomForProperty, setAddRoomForProperty] = useState<Property | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // Ambil semua data dari Supabase
  const fetchData = useCallback(async () => {
    const [{ data: props }, { data: roomsData }] = await Promise.all([
      supabase.from('properties').select('*').order('order_index'),
      supabase.from('rooms').select('*').order('order_index'),
    ])
    if (props) setProperties(props)
    if (roomsData) setRooms(roomsData)
    setLoading(false)
  }, [])

  // Setup realtime subscription untuk update live
  useEffect(() => {
    fetchData()

    // Subscribe perubahan pada table properties dan rooms
    const channel = supabase
      .channel('kbbs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Toggle expand/collapse kawasan
  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Hitung bilangan bilik kosong untuk sesebuah kawasan
  const getAvailableCount = (propertyId: string): number => {
    return rooms.filter(
      (r) => r.property_id === propertyId && r.status === 'available'
    ).length
  }

  // Ambil bilik untuk sesebuah kawasan, disusun ikut order
  const getRoomsForProperty = (propertyId: string): Room[] => {
    return rooms
      .filter((r) => r.property_id === propertyId)
      .sort((a, b) => a.order_index - b.order_index)
  }

  // ---- CRUD handlers ----

  const handleSaveRoom = async (roomId: string, data: Partial<Room>) => {
    await supabase.from('rooms').update(data).eq('id', roomId)
  }

  const handleDeleteRoom = async (roomId: string) => {
    await supabase.from('rooms').delete().eq('id', roomId)
  }

  const handleAddRoom = async (data: Omit<Room, 'id' | 'created_at'>) => {
    await supabase.from('rooms').insert(data)
  }

  const handleSaveProperty = async (propertyId: string, name: string) => {
    await supabase.from('properties').update({ name }).eq('id', propertyId)
  }

  const handleDeleteProperty = async (propertyId: string) => {
    await supabase.from('properties').delete().eq('id', propertyId)
  }

  const handleAddProperty = async (name: string) => {
    const maxOrder = properties.length > 0
      ? Math.max(...properties.map((p) => p.order_index)) + 1
      : 0
    await supabase.from('properties').insert({ name, order_index: maxOrder })
  }

  // ---- RENDER ----

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-cream)' }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse"
            style={{ backgroundColor: 'var(--orange-primary)' }}
          >
            <span className="text-white font-black text-xl">KB</span>
          </div>
          <p className="font-black text-sm tracking-widest" style={{ color: 'var(--brown-mid)' }}>
            MEMUATKAN...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: 'var(--bg-cream)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 py-3 shadow-md"
        style={{ backgroundColor: 'var(--orange-dark)' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-lg tracking-widest">KBBS</h1>
            <p className="text-white text-xs font-semibold opacity-75 -mt-0.5">
              Selamat datang, <span className="uppercase">{username}</span>
            </p>
          </div>
          {/* Indicator live */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-xs font-bold opacity-75">LIVE</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white opacity-75 hover:opacity-100 transition-opacity"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Senarai kawasan */}
      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {properties.map((property) => {
          const isExpanded = expanded.has(property.id)
          const availCount = getAvailableCount(property.id)
          const propertyRooms = getRoomsForProperty(property.id)
          const totalRooms = propertyRooms.length

          return (
            <div key={property.id} className="rounded-3xl overflow-hidden shadow-lg">
              {/* Header kawasan - klik untuk expand/collapse */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                style={{ backgroundColor: 'var(--orange-primary)' }}
                onClick={() => toggleExpand(property.id)}
              >
                {/* Gambar kawasan */}
                <img
                  src={DEFAULT_ROOM_IMG}
                  alt={property.name}
                  className="w-16 h-16 rounded-2xl object-cover shadow-md flex-shrink-0"
                />

                {/* Nama & info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-black text-lg tracking-wider leading-tight truncate">
                    {property.name}
                  </h2>
                  <p className="text-white text-sm font-semibold opacity-85 mt-0.5">
                    {availCount} BILIK KOSONG
                    <span className="opacity-60 ml-1">/ {totalRooms} TOTAL</span>
                  </p>
                </div>

                {/* Edit button kawasan */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditProperty(property)
                  }}
                  className="flex flex-col items-center text-white hover:opacity-70 transition-opacity flex-shrink-0 ml-1"
                >
                  <Pencil size={18} />
                  <span className="text-xs font-bold mt-0.5">Edit</span>
                </button>
              </div>

              {/* Chevron indicator */}
              <div
                className="flex justify-center py-2 cursor-pointer"
                style={{ backgroundColor: 'var(--orange-card)' }}
                onClick={() => toggleExpand(property.id)}
              >
                {isExpanded ? (
                  <ChevronUp size={20} className="text-white opacity-80" />
                ) : (
                  <ChevronDown size={20} className="text-white opacity-80" />
                )}
              </div>

              {/* Senarai bilik (bila expand) */}
              {isExpanded && (
                <div
                  className="px-4 pt-3 pb-4 space-y-3"
                  style={{ backgroundColor: 'var(--orange-primary)' }}
                >
                  {propertyRooms.length === 0 ? (
                    <p className="text-center text-white opacity-60 font-semibold text-sm py-3">
                      Tiada bilik lagi. Tambah bilik baru di bawah.
                    </p>
                  ) : (
                    propertyRooms.map((room) => (
                      <RoomRow
                        key={room.id}
                        room={room}
                        onEdit={() => setEditRoom(room)}
                        onQuickToggle={async () => {
                          const newStatus = room.status === 'available' ? 'occupied' : 'available'
                          await handleSaveRoom(room.id, { status: newStatus })
                        }}
                      />
                    ))
                  )}

                  {/* Butang tambah bilik */}
                  <button
                    onClick={() => setAddRoomForProperty(property)}
                    className="w-full py-3 rounded-2xl font-black text-sm text-white tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 mt-1 border-2 border-dashed border-white border-opacity-40 hover:border-opacity-70"
                    style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
                  >
                    <Plus size={16} />
                    TAMBAH BILIK
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Butang tambah kawasan baru */}
        <div className="flex flex-col items-center pt-2 pb-4">
          <button
            onClick={() => setShowAddProperty(true)}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 hover:shadow-xl"
            style={{ backgroundColor: 'var(--orange-card)' }}
          >
            <Plus size={36} className="text-white" strokeWidth={3} />
          </button>
          <p className="font-black text-sm tracking-widest mt-2" style={{ color: 'var(--brown-mid)' }}>
            TAMBAH KAWASAN
          </p>
        </div>
      </div>

      {/* ---- Semua Modals ---- */}

      {/* Edit bilik */}
      {editRoom && (
        <EditRoomModal
          room={editRoom}
          propertyName={properties.find((p) => p.id === editRoom.property_id)?.name ?? ''}
          onClose={() => setEditRoom(null)}
          onSave={(data) => handleSaveRoom(editRoom.id, data)}
          onDelete={() => handleDeleteRoom(editRoom.id)}
        />
      )}

      {/* Edit kawasan */}
      {editProperty && (
        <EditPropertyModal
          property={editProperty}
          onClose={() => setEditProperty(null)}
          onSave={(name) => handleSaveProperty(editProperty.id, name)}
          onDelete={() => handleDeleteProperty(editProperty.id)}
        />
      )}

      {/* Tambah kawasan baru */}
      {showAddProperty && (
        <AddPropertyModal
          onClose={() => setShowAddProperty(false)}
          onAdd={handleAddProperty}
        />
      )}

      {/* Tambah bilik baru */}
      {addRoomForProperty && (
        <AddRoomModal
          propertyName={addRoomForProperty.name}
          propertyId={addRoomForProperty.id}
          nextOrderIndex={getRoomsForProperty(addRoomForProperty.id).length}
          onClose={() => setAddRoomForProperty(null)}
          onAdd={handleAddRoom}
        />
      )}
    </div>
  )
}

// ---- Row untuk satu bilik ----
interface RoomRowProps {
  room: Room
  onEdit: () => void
  onQuickToggle: () => void
}

function RoomRow({ room, onEdit, onQuickToggle }: RoomRowProps) {
  const isAvailable = room.status === 'available'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
    >
      <div className="flex items-stretch gap-3 p-3">
        {/* Kotak nombor bilik */}
        <div
          className="rounded-xl flex items-center justify-center w-14 h-14 flex-shrink-0 shadow-inner"
          style={{ backgroundColor: 'var(--brown-room)' }}
        >
          <span className="text-white font-black text-lg">{room.room_number}</span>
        </div>

        {/* Info bilik */}
        <div className="flex-1 min-w-0">
          {/* Status + harga */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onQuickToggle}
              className="flex items-center gap-1.5 transition-all active:scale-95"
              title="Klik untuk tukar status"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: isAvailable ? '#22C55E' : '#EF4444' }}
              />
              <span
                className="font-black text-xs tracking-wider"
                style={{ color: isAvailable ? '#22C55E' : '#EF4444' }}
              >
                {isAvailable ? 'KOSONG' : 'ADA PENYEWA'}
              </span>
            </button>
          </div>

          {/* Harga */}
          <p className="text-white font-bold text-sm mt-0.5">
            {formatPrice(room.price)}
          </p>

          {/* Info tambahan */}
          {room.info && (
            <span
              className="inline-block text-xs font-bold px-2 py-0.5 rounded-lg mt-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              {room.info}
            </span>
          )}
        </div>

        {/* Info penyewa & edit */}
        <div className="flex flex-col items-end justify-between min-w-0 gap-1">
          {/* No. HP */}
          {room.tenant_phone ? (
            <div className="flex items-center gap-1">
              <Phone size={11} className="text-white opacity-60" />
              <span className="text-white text-xs font-semibold opacity-80 truncate max-w-28">
                {room.tenant_phone}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Phone size={11} className="text-white opacity-30" />
              <span className="text-white text-xs opacity-30">-</span>
            </div>
          )}

          {/* Tarikh masuk */}
          {room.checkin_date ? (
            <div className="flex items-center gap-1">
              <Calendar size={11} className="text-white opacity-60" />
              <span className="text-white text-xs font-semibold opacity-80">
                {formatDate(room.checkin_date)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Calendar size={11} className="text-white opacity-30" />
              <span className="text-white text-xs opacity-30">-</span>
            </div>
          )}

          {/* Butang edit */}
          <button
            onClick={onEdit}
            className="flex flex-col items-center text-white hover:opacity-70 transition-opacity mt-auto"
          >
            <Pencil size={15} />
            <span className="text-xs font-bold" style={{ fontSize: '10px' }}>Edit</span>
          </button>
        </div>
      </div>

      {/* Divider tipis */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
    </div>
  )
}
