// Jenis-jenis data utama untuk app KBBS

export type RoomStatus = 'available' | 'occupied'

export interface Property {
  id: string
  name: string
  order_index: number
  created_at: string
}

export interface Room {
  id: string
  property_id: string
  room_number: string
  price: number
  status: RoomStatus
  info: string | null
  tenant_phone: string | null
  checkin_date: string | null
  order_index: number
  created_at: string
}
