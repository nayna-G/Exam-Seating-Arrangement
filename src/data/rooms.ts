// Room Data Structure and Sample Data
export interface Room { // Interface declaration: Defines the shape of a Room object
  roomNo: string; // Property: Unique room identifier string
  roomName: string; // Property: Room name/description
  numberOfSeats: number; // Property: Total seating capacity
  seatMatrix: string; // Property: Seat layout as "rows x columns" string (e.g., "10x5")
  rows: number; // Property: Number of rows in room layout
  columns: number; // Property: Number of columns in room layout
  isActive: boolean; // Property: Flag indicating if room record is active
  createdAt: Date; // Property: Timestamp when record was created
  updatedAt: Date; // Property: Timestamp when record was last updated
}

// Sample room data
export const sampleRooms: Room[] = [ // Constant declaration: Array of sample room objects for testing
  {
    roomNo: "ROOM001", // Property: Room number
    roomName: "Main Hall A", // Property: Room name
    numberOfSeats: 50, // Property: Total seat capacity
    seatMatrix: "10x5", // Property: Seat layout string
    rows: 10, // Property: Number of rows
    columns: 5, // Property: Number of columns
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  },
  {
    roomNo: "ROOM002", // Property: Room number
    roomName: "Main Hall B", // Property: Room name
    numberOfSeats: 45, // Property: Total seat capacity
    seatMatrix: "9x5", // Property: Seat layout string
    rows: 9, // Property: Number of rows
    columns: 5, // Property: Number of columns
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  },
  {
    roomNo: "ROOM003", // Property: Room number
    roomName: "Science Lab 1", // Property: Room name
    numberOfSeats: 30, // Property: Total seat capacity
    seatMatrix: "6x5", // Property: Seat layout string
    rows: 6, // Property: Number of rows
    columns: 5, // Property: Number of columns
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  },
  {
    roomNo: "ROOM004", // Property: Room number
    roomName: "Computer Lab", // Property: Room name
    numberOfSeats: 40, // Property: Total seat capacity
    seatMatrix: "8x5", // Property: Seat layout string
    rows: 8, // Property: Number of rows
    columns: 5, // Property: Number of columns
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  },
  {
    roomNo: "ROOM005", // Property: Room number
    roomName: "Library Hall", // Property: Room name
    numberOfSeats: 60, // Property: Total seat capacity
    seatMatrix: "12x5", // Property: Seat layout string
    rows: 12, // Property: Number of rows
    columns: 5, // Property: Number of columns
    isActive: true, // Property: Active status flag
    createdAt: new Date("2024-01-15"), // Property: Creation timestamp
    updatedAt: new Date("2024-01-15") // Property: Update timestamp
  }
];

// Room management functions
export class RoomManager { // Class declaration: Manages room data with CRUD operations
  private rooms: Room[] = [...sampleRooms]; // Property: Private array of rooms initialized with sample data

  getAllRooms(): Room[] { // Method declaration: Returns all active rooms
    return this.rooms.filter(room => room.isActive); // Array method: Filters to return only active rooms
  }

  getRoomById(id: string): Room | undefined { // Method declaration: Returns room by ID or undefined
    return this.rooms.find(room => room.roomNo === id && room.isActive); // Array method: Finds room matching ID and active status
  }

  getRoomsByBuilding(building: string): Room[] { // Method declaration: Returns rooms by building name
    return this.rooms.filter( // Array method: Filters rooms by building name
      room => room.roomName.toLowerCase().includes(building.toLowerCase()) && // Conditional: Case-insensitive name match
      room.isActive // Conditional: Checks active status
    );
  }

  getRoomsByCapacity(minCapacity: number, maxCapacity?: number): Room[] { // Method declaration: Returns rooms within capacity range
    return this.rooms.filter(room => { // Array method: Filters rooms by capacity
      if (room.isActive) { // Conditional check: If room is active
        if (maxCapacity) { // Conditional check: If max capacity specified
          return room.numberOfSeats >= minCapacity && room.numberOfSeats <= maxCapacity; // Return: Checks capacity within range
        }
        return room.numberOfSeats >= minCapacity; // Return: Checks minimum capacity
      }
      return false; // Return: False if room not active
    });
  }

  getTotalCapacity(): number { // Method declaration: Returns total capacity of all active rooms
    return this.rooms // Return statement: Returns calculated total
      .filter(room => room.isActive) // Array method: Filters to active rooms
      .reduce((total, room) => total + room.numberOfSeats, 0); // Array method: Sums up all room capacities
  }

  addRoom(room: Omit<Room, 'createdAt' | 'updatedAt'>): Room { // Method declaration: Adds new room with auto-generated timestamps
    const newRoom: Room = { // Variable declaration: Creates new room object
      ...room, // Spread operator: Copies provided room properties
      createdAt: new Date(), // Property: Sets creation timestamp to current date
      updatedAt: new Date() // Property: Sets update timestamp to current date
    };
    this.rooms.push(newRoom); // Array method: Adds new room to array
    return newRoom; // Return statement: Returns the created room
  }

  updateRoom(id: string, updates: Partial<Room>): Room | null { // Method declaration: Updates room by ID with partial updates
    const index = this.rooms.findIndex(room => room.roomNo === id); // Array method: Finds index of room by ID
    if (index === -1) return null; // Conditional check: Returns null if room not found

    this.rooms[index] = { // Array assignment: Updates room at index
      ...this.rooms[index], // Spread operator: Copies existing room properties
      ...updates, // Spread operator: Applies provided updates
      updatedAt: new Date() // Property: Updates timestamp to current date
    };
    return this.rooms[index]; // Return statement: Returns updated room
  }

  deleteRoom(id: string): boolean { // Method declaration: Soft deletes room by setting isActive to false
    const index = this.rooms.findIndex(room => room.roomNo === id); // Array method: Finds index of room by ID
    if (index === -1) return false; // Conditional check: Returns false if room not found

    this.rooms[index].isActive = false; // Property assignment: Sets active flag to false
    this.rooms[index].updatedAt = new Date(); // Property assignment: Updates timestamp
    return true; // Return statement: Returns true on success
  }

  searchRooms(query: string): Room[] { // Method declaration: Searches rooms by name or number
    const lowercaseQuery = query.toLowerCase(); // String method: Converts query to lowercase for case-insensitive search
    return this.rooms.filter(room => // Array method: Filters rooms matching search criteria
      room.isActive && // Conditional: Checks active status
      (
        room.roomName.toLowerCase().includes(lowercaseQuery) || // Conditional: Matches name
        room.roomNo.toLowerCase().includes(lowercaseQuery) // Conditional: Matches room number
      )
    );
  }

  getAvailableRoomsForExam(examDate: Date, examTime: string): Room[] { // Method declaration: Returns rooms available for exam
    return this.rooms.filter(room => room.isActive); // Array method: Returns all active rooms (simplified implementation)
  }
}

export const roomManager = new RoomManager(); // Constant declaration: Singleton instance of RoomManager
