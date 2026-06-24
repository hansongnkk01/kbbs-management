'use client'

// Dashboard utama - semua interaksi berlaku sini
// Real-time update supaya semua admin nampak perubahan sama-sama
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Property, Room } from '@/lib/types'
import {
  ChevronDown, ChevronUp, Plus, Pencil, LogOut,
  Phone, Calendar, Trash2, Check, X, Building2, Home,
} from 'lucide-react'

const DEFAULT_ROOM_IMG = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=160&h=160&fit=crop&q=80'

interface Props { username: string }

// ─── Format helpers ───────────────────────────────────────────────
function formatDate(d: string | null) {
  if (!d) return '-'
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`
}
function formatPrice(p: number) {
  return `RM ${p.toFixed(2)}`
}

// ─── MODAL: Edit Bilik ────────────────────────────────────────────
function EditRoomModal({ room, propertyName, onClose, onSave, onDelete }:{
  room: Room; propertyName: string
  onClose:()=>void; onSave:(d:Partial<Room>)=>Promise<void>; onDelete:()=>Promise<void>
}) {
  const [price,  setPrice]  = useState(String(room.price))
  const [info,   setInfo]   = useState(room.info ?? '')
  const [phone,  setPhone]  = useState(room.tenant_phone ?? '')
  const [date,   setDate]   = useState(room.checkin_date ?? '')
  const [status, setStatus] = useState(room.status)
  const [roomNum,setRoomNum]= useState(room.room_number)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({ room_number:roomNum, price:parseFloat(price)||0, info:info||null, tenant_phone:phone||null, checkin_date:date||null, status })
    setSaving(false); onClose()
  }
  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return }
    setSaving(true); await onDelete(); setSaving(false); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{backgroundColor:'rgba(59,21,6,0.7)',backdropFilter:'blur(4px)'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up overflow-hidden"
        style={{background:'linear-gradient(160deg, #F97316 0%, #C2500A 100%)'}}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div>
            <p className="text-orange-200 text-xs font-bold tracking-widest uppercase">{propertyName}</p>
            <h3 className="text-white font-black text-lg tracking-wider flex items-center gap-2">
              <Pencil size={15}/> EDIT BILIK
            </h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl p-2 transition-all">
            <X size={18}/>
          </button>
        </div>

        {/* Nombor bilik */}
        <div className="mx-5 my-3 rounded-2xl flex items-center justify-between px-5 py-3"
          style={{backgroundColor:'rgba(0,0,0,0.25)'}}>
          <input value={roomNum} onChange={e=>setRoomNum(e.target.value)}
            className="text-white font-black text-3xl bg-transparent outline-none w-24" maxLength={6}/>
          <Pencil size={14} className="text-white/50"/>
        </div>

        {/* Toggle status */}
        <div className="mx-5 mb-4 rounded-2xl p-1 flex gap-1" style={{backgroundColor:'rgba(0,0,0,0.2)'}}>
          {(['available','occupied'] as const).map(s=>(
            <button key={s} onClick={()=>setStatus(s)}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs tracking-wider transition-all ${status===s?'text-white shadow-lg':'text-white/40'}`}
              style={status===s?{backgroundColor:s==='available'?'#16A34A':'#DC2626'}:{}}>
              ● {s==='available'?'KOSONG':'ADA PENYEWA'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="px-5 space-y-2.5 pb-5">
          {[
            {label:'HARGA',   val:price,  set:setPrice,  ph:'0.00',              prefix:'RM'},
            {label:'INFO',    val:info,   set:setInfo,   ph:'Windowed, Ventilation...', prefix:null},
            {label:'NO. HP',  val:phone,  set:setPhone,  ph:'013 441 3415',      prefix:null},
          ].map(({label,val,set,ph,prefix})=>(
            <div key={label} className="flex items-center gap-3">
              <span className="text-white font-black text-xs tracking-widest w-16 shrink-0">{label}</span>
              <div className="flex-1 flex items-center rounded-xl px-3 py-2.5 gap-2"
                style={{backgroundColor:'rgba(255,255,255,0.15)'}}>
                {prefix&&<span className="text-white/60 text-xs font-bold">{prefix}</span>}
                <input value={val} onChange={e=>set(e.target.value)} placeholder={ph}
                  className="bg-transparent outline-none font-bold text-sm flex-1 text-white placeholder:text-white/40"/>
              </div>
            </div>
          ))}

          {/* Tarikh */}
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xs tracking-widest w-16 shrink-0">TARIKH</span>
            <div className="flex-1 flex items-center rounded-xl px-3 py-2.5"
              style={{backgroundColor:'rgba(255,255,255,0.15)'}}>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                className="bg-transparent outline-none font-bold text-sm flex-1 text-white"/>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              style={{backgroundColor:'rgba(0,0,0,0.35)'}}>
              <Check size={16}/> SIMPAN
            </button>
            <button onClick={handleDelete} disabled={saving}
              className={`px-4 py-3 rounded-xl font-black text-sm text-white flex items-center gap-2 transition-all active:scale-95 ${confirmDel?'animate-pulse':''}`}
              style={{backgroundColor:confirmDel?'#7F1D1D':'rgba(220,38,38,0.7)'}}>
              <Trash2 size={16}/>{confirmDel?'CONFIRM?':'BUANG'}
            </button>
          </div>
          {confirmDel&&<p className="text-white/70 text-xs text-center">⚠️ Bilik ini akan dibuang terus</p>}
        </div>
      </div>
    </div>
  )
}

// ─── MODAL: Edit Kawasan ──────────────────────────────────────────
function EditPropertyModal({ property, onClose, onSave, onDelete }:{
  property:Property; onClose:()=>void; onSave:(n:string)=>Promise<void>; onDelete:()=>Promise<void>
}) {
  const [name,setName]=useState(property.name)
  const [saving,setSaving]=useState(false)
  const [confirmDel,setConfirmDel]=useState(false)

  const handleSave=async()=>{ if(!name.trim())return; setSaving(true); await onSave(name.trim().toUpperCase()); setSaving(false); onClose() }
  const handleDelete=async()=>{ if(!confirmDel){setConfirmDel(true);return}; setSaving(true); await onDelete(); setSaving(false); onClose() }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{backgroundColor:'rgba(59,21,6,0.7)',backdropFilter:'blur(4px)'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up overflow-hidden"
        style={{background:'linear-gradient(160deg, #F97316 0%, #C2500A 100%)'}}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-white font-black text-lg tracking-wider flex items-center gap-2"><Building2 size={16}/> EDIT KAWASAN</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl p-2 transition-all"><X size={18}/></button>
        </div>
        <div className="px-5 pb-6 space-y-3">
          <input value={name} onChange={e=>setName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 font-black text-sm outline-none text-white placeholder:text-white/40"
            style={{backgroundColor:'rgba(255,255,255,0.15)'}} placeholder="cth: ALAMESRA 1"/>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving||!name.trim()}
              className="flex-1 py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              style={{backgroundColor:'rgba(0,0,0,0.35)'}}>
              <Check size={16}/> SIMPAN
            </button>
            <button onClick={handleDelete} disabled={saving}
              className={`px-4 py-3 rounded-xl font-black text-sm text-white flex items-center gap-2 transition-all active:scale-95 ${confirmDel?'animate-pulse':''}`}
              style={{backgroundColor:confirmDel?'#7F1D1D':'rgba(220,38,38,0.7)'}}>
              <Trash2 size={16}/>{confirmDel?'CONFIRM?':'BUANG'}
            </button>
          </div>
          {confirmDel&&<p className="text-white/70 text-xs text-center">⚠️ Semua bilik dalam kawasan ini akan dibuang!</p>}
        </div>
      </div>
    </div>
  )
}

// ─── MODAL: Tambah Kawasan ────────────────────────────────────────
function AddPropertyModal({ onClose, onAdd }:{ onClose:()=>void; onAdd:(n:string)=>Promise<void> }) {
  const [name,setName]=useState('')
  const [saving,setSaving]=useState(false)
  const handleAdd=async()=>{ if(!name.trim())return; setSaving(true); await onAdd(name.trim().toUpperCase()); setSaving(false); onClose() }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{backgroundColor:'rgba(59,21,6,0.7)',backdropFilter:'blur(4px)'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up overflow-hidden"
        style={{background:'linear-gradient(160deg, #F97316 0%, #C2500A 100%)'}}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-white font-black text-lg tracking-wider flex items-center gap-2"><Plus size={16}/> KAWASAN BARU</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 rounded-xl p-2 transition-all"><X size={18}/></button>
        </div>
        <div className="px-5 pb-6 space-y-3">
          <div className="flex justify-center py-2">
            <img src={DEFAULT_ROOM_IMG} alt="bilik" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"/>
          </div>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()}
            className="w-full rounded-xl px-4 py-3 font-bold text-sm outline-none text-white placeholder:text-white/40"
            style={{backgroundColor:'rgba(255,255,255,0.15)'}} placeholder="cth: SEMBULAN, LUYANG..." autoFocus/>
          <button onClick={handleAdd} disabled={saving||!name.trim()}
            className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{backgroundColor:'rgba(0,0,0,0.35)'}}>
            <Plus size={16}/> TAMBAH KAWASAN
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MODAL: Tambah Bilik ──────────────────────────────────────────
function AddRoomModal({ propertyName, propertyId, nextOrderIndex, onClose, onAdd }:{
  propertyName:string; propertyId:string; nextOrderIndex:number
  onClose:()=>void; onAdd:(d:Omit<Room,'id'|'created_at'>)=>Promise<void>
}) {
  const [roomNum,setRoomNum]=useState('')
  const [price,setPrice]=useState('')
  const [info,setInfo]=useState('')
  const [status,setStatus]=useState<'available'|'occupied'>('available')
  const [saving,setSaving]=useState(false)

  const handleAdd=async()=>{
    if(!roomNum.trim())return; setSaving(true)
    await onAdd({ property_id:propertyId, room_number:roomNum.trim(), price:parseFloat(price)||0, info:info||null, tenant_phone:null, checkin_date:null, status, order_index:nextOrderIndex })
    setSaving(false); onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{backgroundColor:'rgba(59,21,6,0.7)',backdropFilter:'blur(4px)'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up overflow-hidden"
        style={{background:'linear-gradient(160deg, #F97316 0%, #C2500A 100%)'}}>
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <div>
            <p className="text-orange-200 text-xs font-bold tracking-widest">{propertyName}</p>
            <h3 className="text-white font-black text-lg tracking-wider flex items-center gap-2"><Plus size={15}/> TAMBAH BILIK</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 rounded-xl p-2 transition-all"><X size={18}/></button>
        </div>
        <div className="px-5 pb-6 mt-3 space-y-2.5">
          {/* Status toggle */}
          <div className="rounded-2xl p-1 flex gap-1" style={{backgroundColor:'rgba(0,0,0,0.2)'}}>
            {(['available','occupied'] as const).map(s=>(
              <button key={s} onClick={()=>setStatus(s)}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs tracking-wider transition-all ${status===s?'text-white':'text-white/40'}`}
                style={status===s?{backgroundColor:s==='available'?'#16A34A':'#DC2626'}:{}}>
                ● {s==='available'?'KOSONG':'ADA PENYEWA'}
              </button>
            ))}
          </div>
          {[
            {label:'NO. BILIK', val:roomNum, set:setRoomNum, ph:'01, A1...', type:'text'},
            {label:'HARGA RM',  val:price,   set:setPrice,   ph:'0.00',      type:'number'},
            {label:'INFO',      val:info,    set:setInfo,    ph:'Windowed, Ventilation...', type:'text'},
          ].map(({label,val,set,ph,type})=>(
            <div key={label} className="flex items-center gap-3">
              <span className="text-white font-black text-xs tracking-widest w-20 shrink-0">{label}</span>
              <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} type={type}
                className="flex-1 rounded-xl px-3 py-2.5 font-bold text-sm outline-none text-white placeholder:text-white/40"
                style={{backgroundColor:'rgba(255,255,255,0.15)'}} autoFocus={label==='NO. BILIK'}/>
            </div>
          ))}
          <button onClick={handleAdd} disabled={saving||!roomNum.trim()}
            className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-2"
            style={{backgroundColor:'rgba(0,0,0,0.35)'}}>
            <Plus size={16}/> TAMBAH BILIK
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Row Bilik ────────────────────────────────────────────────────
function RoomRow({ room, onEdit, onQuickToggle }:{ room:Room; onEdit:()=>void; onQuickToggle:()=>void }) {
  const isAvailable = room.status === 'available'
  return (
    <div className="rounded-2xl overflow-hidden transition-all" style={{backgroundColor:'rgba(0,0,0,0.18)'}}>
      <div className="flex items-stretch gap-0">
        {/* Kotak nombor */}
        <div className="flex items-center justify-center w-16 shrink-0 py-4 rounded-l-2xl"
          style={{backgroundColor:'rgba(0,0,0,0.3)'}}>
          <span className="text-white font-black text-xl">{room.room_number}</span>
        </div>

        {/* Info tengah */}
        <div className="flex-1 px-3 py-3 min-w-0">
          {/* Status toggle */}
          <button onClick={onQuickToggle} className="flex items-center gap-1.5 mb-1 group" title="Klik tukar status">
            <div className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125"
              style={{backgroundColor:isAvailable?'#4ADE80':'#F87171'}}/>
            <span className="font-black text-xs tracking-wider"
              style={{color:isAvailable?'#4ADE80':'#F87171'}}>
              {isAvailable?'KOSONG':'ADA PENYEWA'}
            </span>
          </button>

          <p className="text-white font-black text-sm leading-tight">{formatPrice(room.price)}</p>

          {room.info&&(
            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-lg mt-1"
              style={{backgroundColor:'rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.85)'}}>
              {room.info}
            </span>
          )}
        </div>

        {/* Info penyewa + edit */}
        <div className="flex flex-col items-end justify-between px-3 py-3 shrink-0">
          <div className="text-right space-y-0.5 mb-auto">
            <div className="flex items-center gap-1 justify-end">
              <Phone size={10} className="shrink-0" style={{color:'rgba(255,255,255,0.5)'}}/>
              <span className="text-xs font-semibold" style={{color:room.tenant_phone?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.3)'}}>
                {room.tenant_phone??'-'}
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <Calendar size={10} className="shrink-0" style={{color:'rgba(255,255,255,0.5)'}}/>
              <span className="text-xs font-semibold" style={{color:room.checkin_date?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.3)'}}>
                {formatDate(room.checkin_date)}
              </span>
            </div>
          </div>
          <button onClick={onEdit}
            className="mt-2 flex items-center gap-1 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1 transition-all">
            <Pencil size={11}/>
            <span className="text-xs font-black">EDIT</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD UTAMA ──────────────────────────────────────────────
export default function DashboardClient({ username }: Props) {
  const [properties, setProperties] = useState<Property[]>([])
  const [rooms,      setRooms]      = useState<Room[]>([])
  const [expanded,   setExpanded]   = useState<Set<string>>(new Set())
  const [loading,    setLoading]    = useState(true)
  const [editRoom,          setEditRoom]          = useState<Room|null>(null)
  const [editProperty,      setEditProperty]      = useState<Property|null>(null)
  const [showAddProperty,   setShowAddProperty]   = useState(false)
  const [addRoomForProperty,setAddRoomForProperty]= useState<Property|null>(null)

  const router   = useRouter()
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const [{ data: props }, { data: roomsData }] = await Promise.all([
      supabase.from('properties').select('*').order('order_index'),
      supabase.from('rooms').select('*').order('order_index'),
    ])
    if (props)     setProperties(props)
    if (roomsData) setRooms(roomsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const ch = supabase.channel('kbbs-live')
      .on('postgres_changes',{event:'*',schema:'public',table:'properties'},fetchData)
      .on('postgres_changes',{event:'*',schema:'public',table:'rooms'},fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchData])

  const toggleExpand = (id:string) => setExpanded(prev => {
    const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n
  })

  const getRooms = (pid:string) => rooms.filter(r=>r.property_id===pid).sort((a,b)=>a.order_index-b.order_index)
  const getAvail = (pid:string) => rooms.filter(r=>r.property_id===pid&&r.status==='available').length

  // CRUD
  const saveRoom    = async (id:string, d:Partial<Room>)              => { await supabase.from('rooms').update(d).eq('id',id) }
  const deleteRoom  = async (id:string)                               => { await supabase.from('rooms').delete().eq('id',id) }
  const addRoom     = async (d:Omit<Room,'id'|'created_at'>)          => { await supabase.from('rooms').insert(d) }
  const saveProp    = async (id:string, name:string)                  => { await supabase.from('properties').update({name}).eq('id',id) }
  const deleteProp  = async (id:string)                               => { await supabase.from('properties').delete().eq('id',id) }
  const addProp     = async (name:string) => {
    const maxOrder = properties.length ? Math.max(...properties.map(p=>p.order_index))+1 : 0
    await supabase.from('properties').insert({name, order_index:maxOrder})
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor:'var(--bg-cream)'}}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse"
          style={{background:'linear-gradient(135deg,#F97316,#C2500A)'}}>
          <span className="text-white font-black text-2xl">KB</span>
        </div>
        <p className="font-black text-sm tracking-widest" style={{color:'var(--orange-dark)'}}>MEMUATKAN...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{backgroundColor:'var(--bg-cream)'}}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 shadow-xl" style={{background:'linear-gradient(135deg,#C2500A 0%,#F97316 100%)'}}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md bg-white/20">
              <span className="text-white font-black text-sm">KB</span>
            </div>
            <div>
              <h1 className="text-white font-black text-base tracking-widest leading-none">KBBS</h1>
              <p className="text-orange-200 text-xs font-bold tracking-wider">
                Selamat datang, <span className="text-white uppercase">{username}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 live-dot"/>
              <span className="text-white text-xs font-black tracking-widest">LIVE</span>
            </div>
            <button onClick={async()=>{await supabase.auth.signOut();router.push('/login')}}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl p-2 transition-all">
              <LogOut size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-1">
        <div className="grid grid-cols-3 gap-3">
          {[
            {label:'KAWASAN',  val:properties.length,               icon:<Building2 size={18}/>},
            {label:'BILIK',    val:rooms.length,                    icon:<Home size={18}/>},
            {label:'KOSONG',   val:rooms.filter(r=>r.status==='available').length, icon:<Check size={18}/>},
          ].map(({label,val,icon})=>(
            <div key={label} className="rounded-2xl px-3 py-3 text-center shadow-md"
              style={{background:'linear-gradient(135deg,#F97316,#EA580C)'}}>
              <div className="flex justify-center mb-1 text-white/70">{icon}</div>
              <p className="text-white font-black text-2xl leading-none">{val}</p>
              <p className="text-orange-200 text-xs font-black tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Senarai kawasan ── */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-4">
        {properties.map(property => {
          const isExpanded   = expanded.has(property.id)
          const propertyRooms= getRooms(property.id)
          const availCount   = getAvail(property.id)

          return (
            <div key={property.id} className="rounded-3xl overflow-hidden shadow-xl"
              style={{background:'linear-gradient(160deg,#F97316 0%,#C2500A 100%)'}}>

              {/* Header kawasan */}
              <div className="flex items-center gap-4 p-4 cursor-pointer select-none"
                onClick={()=>toggleExpand(property.id)}>
                <img src={DEFAULT_ROOM_IMG} alt={property.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/30 shadow-lg shrink-0"/>

                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-black text-xl tracking-wider leading-tight truncate drop-shadow-sm">
                    {property.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 bg-white/20 text-white font-black text-xs px-2.5 py-1 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-400"/>
                      {availCount} KOSONG
                    </span>
                    <span className="text-white/60 font-bold text-xs">/ {propertyRooms.length} TOTAL</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={e=>{e.stopPropagation();setEditProperty(property)}}
                    className="flex flex-col items-center bg-white/15 hover:bg-white/25 text-white rounded-xl p-2.5 transition-all">
                    <Pencil size={15}/>
                    <span className="text-xs font-black mt-0.5">Edit</span>
                  </button>
                  <div className="text-white/60">
                    {isExpanded?<ChevronUp size={20}/>:<ChevronDown size={20}/>}
                  </div>
                </div>
              </div>

              {/* Senarai bilik */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2.5" style={{borderTop:'1px solid rgba(255,255,255,0.15)'}}>
                  {propertyRooms.length===0?(
                    <p className="text-center text-white/50 font-bold text-sm py-4">
                      Tiada bilik. Tambah bilik baru di bawah.
                    </p>
                  ):propertyRooms.map(room=>(
                    <div key={room.id} className="pt-2.5">
                      <RoomRow room={room}
                        onEdit={()=>setEditRoom(room)}
                        onQuickToggle={async()=>{
                          await saveRoom(room.id,{status:room.status==='available'?'occupied':'available'})
                        }}/>
                    </div>
                  ))}

                  <button onClick={()=>setAddRoomForProperty(property)}
                    className="w-full py-3 rounded-2xl font-black text-sm text-white/70 hover:text-white flex items-center justify-center gap-2 transition-all border-2 border-dashed border-white/25 hover:border-white/50 hover:bg-white/10 mt-1">
                    <Plus size={16}/> TAMBAH BILIK
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Butang tambah kawasan */}
        <div className="flex flex-col items-center py-4 gap-2">
          <button onClick={()=>setShowAddProperty(true)}
            className="w-20 h-20 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 hover:shadow-2xl"
            style={{background:'linear-gradient(135deg,#F97316,#C2500A)'}}>
            <Plus size={36} className="text-white" strokeWidth={3}/>
          </button>
          <p className="font-black text-sm tracking-widest" style={{color:'var(--orange-dark)'}}>TAMBAH KAWASAN</p>
        </div>
      </div>

      {/* ── Modals ── */}
      {editRoom&&(
        <EditRoomModal room={editRoom}
          propertyName={properties.find(p=>p.id===editRoom.property_id)?.name??''}
          onClose={()=>setEditRoom(null)}
          onSave={d=>saveRoom(editRoom.id,d)}
          onDelete={()=>deleteRoom(editRoom.id)}/>
      )}
      {editProperty&&(
        <EditPropertyModal property={editProperty}
          onClose={()=>setEditProperty(null)}
          onSave={n=>saveProp(editProperty.id,n)}
          onDelete={()=>deleteProp(editProperty.id)}/>
      )}
      {showAddProperty&&<AddPropertyModal onClose={()=>setShowAddProperty(false)} onAdd={addProp}/>}
      {addRoomForProperty&&(
        <AddRoomModal
          propertyName={addRoomForProperty.name}
          propertyId={addRoomForProperty.id}
          nextOrderIndex={getRooms(addRoomForProperty.id).length}
          onClose={()=>setAddRoomForProperty(null)}
          onAdd={addRoom}/>
      )}
    </div>
  )
}
