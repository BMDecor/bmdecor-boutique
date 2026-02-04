/**
 * Marbella Room Set — shared room scene data for the Universal Visualizer.
 *
 * Local architectural SVG scenes designed with white/light walls so
 * CSS mix-blend-mode: multiply tints them with any selected paint color.
 * Brand-agnostic — works for BM, LG, and FB.
 */

export interface RoomScene {
  id: string;
  name: string;
  imageUrl: string;
  roomType: 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'dining-room' | 'office';
}

export const ROOM_SCENES: RoomScene[] = [
  { id: 'living-1', name: 'Modern Living Room', roomType: 'living-room', imageUrl: '/rooms/living-room.svg' },
  { id: 'bedroom-1', name: 'Serene Bedroom', roomType: 'bedroom', imageUrl: '/rooms/bedroom.svg' },
  { id: 'kitchen-1', name: 'Contemporary Kitchen', roomType: 'kitchen', imageUrl: '/rooms/kitchen.svg' },
  { id: 'bathroom-1', name: 'Spa Bathroom', roomType: 'bathroom', imageUrl: '/rooms/bathroom.svg' },
  { id: 'dining-1', name: 'Elegant Dining Room', roomType: 'dining-room', imageUrl: '/rooms/dining-room.svg' },
  { id: 'office-1', name: 'Home Office', roomType: 'office', imageUrl: '/rooms/office.svg' },
];
