import { Master, ServiceItem, ReviewItem } from '../data/crawledMasters';

export type UserRole = 'client' | 'master';

export type ClientScreenType = 
  | 'login' 
  | 'bot' 
  | 'map' 
  | 'dash' 
  | 'chats' 
  | 'chat' 
  | 'favs' 
  | 'master' 
  | 'profile';

export type MasterScreenType =
  | 'schedule'
  | 'catalog'
  | 'chats'
  | 'chat'
  | 'analytics'
  | 'preview';

export type ScreenType = ClientScreenType | MasterScreenType;

export type CategoryFilter = 'All' | 'hair' | 'nails' | 'laser';

export interface Appointment {
  id: string;
  masterId: number;
  masterName: string;
  clientName: string;
  clientAvatar: string;
  serviceName: string;
  craft: string;
  date: string;
  time: string;
  price: string;
  status: 'confirmed' | 'pending' | 'completed' | 'declined';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  senderId: 'client' | 'master';
  senderName: string;
  text: string;
  mine: boolean;
  time: string;
}

export interface MasterChat {
  id: string;
  masterId: number;
  masterName: string;
  clientName: string;
  initials: string;
  craft: string;
  tint: string;
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  messages: ChatMessage[];
}
