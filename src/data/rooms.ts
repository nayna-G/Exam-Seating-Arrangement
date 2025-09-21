// Room Data Structure and Sample Data
export interface Room {
  roomNo: string;
  roomName: string;
  numberOfSeats: number;
  seatMatrix: string; // Format: "rows x columns" (e.g., "10x5")
  rows: number;
  columns: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Sample room data
export const sampleRooms: Room[] = [
  {
    roomNo: "ROOM001",
    roomName: "Main Hall A",
    numberOfSeats: 50,
    seatMatrix: "10x5",
    rows: 10,
    columns: 5,
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    roomNo: "ROOM002",
    roomName: "Main Hall B",
    numberOfSeats: 45,
    seatMatrix: "9x5",
    rows: 9,
    columns: 5,
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    roomNo: "ROOM003",
    roomName: "Science Lab 1",
    numberOfSeats: 30,
    seatMatrix: "6x5",
    rows: 6,
    columns: 5,
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    roomNo: "ROOM004",
    roomName: "Computer Lab",
    numberOfSeats: 40,
    seatMatrix: "8x5",
    rows: 8,
    columns: 5,
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    roomNo: "ROOM005",
    roomName: "Library Hall",
    numberOfSeats: 60,
    seatMatrix: "12x5",
    rows: 12,
    columns: 5,
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  }
];

// Room management functions
export class RoomManager {
  private rooms: Room[] = [...sampleRooms];

  // Get all rooms
  getAllRooms(): Room[] {
    return this.rooms.filter(room => room.isActive);
  }

  // Get room by ID
  getRoomById(id: string): Room | undefined {
    return this.rooms.find(room => room.roomNo === id && room.isActive);
  }

  // Get rooms by building
  getRoomsByBuilding(building: string): Room[] {
    return this.rooms.filter(
      room => room.roomName.toLowerCase().includes(building.toLowerCase()) && room.isActive
    );
  }

  // Get rooms by capacity range
  getRoomsByCapacity(minCapacity: number, maxCapacity?: number): Room[] {
    return this.rooms.filter(room => {
      if (room.isActive) {
        if (maxCapacity) {
          return room.numberOfSeats >= minCapacity && room.numberOfSeats <= maxCapacity;
        }
        return room.numberOfSeats >= minCapacity;
      }
      return false;
    });
  }

  // Get total capacity of all rooms
  getTotalCapacity(): number {
    return this.rooms
      .filter(room => room.isActive)
      .reduce((total, room) => total + room.numberOfSeats, 0);
  }

  // Add new room
  addRoom(room: Omit<Room, 'createdAt' | 'updatedAt'>): Room {
    const newRoom: Room = {
      ...room,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.rooms.push(newRoom);
    return newRoom;
  }

  // Update room
  updateRoom(id: string, updates: Partial<Room>): Room | null {
    const index = this.rooms.findIndex(room => room.roomNo === id);
    if (index === -1) return null;

    this.rooms[index] = {
      ...this.rooms[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.rooms[index];
  }

  // Delete room (soft delete)
  deleteRoom(id: string): boolean {
    const index = this.rooms.findIndex(room => room.roomNo === id);
    if (index === -1) return false;

    this.rooms[index].isActive = false;
    this.rooms[index].updatedAt = new Date();
    return true;
  }

  // Search rooms
  searchRooms(query: string): Room[] {
    const lowercaseQuery = query.toLowerCase();
    return this.rooms.filter(room => 
      room.isActive && (
        room.roomName.toLowerCase().includes(lowercaseQuery) ||
        room.roomNo.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Get available rooms for exam
  getAvailableRoomsForExam(examDate: Date, examTime: string): Room[] {
    // This would typically check against exam schedules
    // For now, return all active rooms
    return this.rooms.filter(room => room.isActive);
  }
}

// Export singleton instance
export const roomManager = new RoomManager();
