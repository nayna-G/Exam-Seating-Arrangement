package com.examseating.controller; // Package declaration: Defines the package this class belongs to (com.examseating.controller)

import org.springframework.http.ResponseEntity; // Import statement: Imports ResponseEntity for HTTP response wrapping
import org.springframework.web.bind.annotation.*; // Import statement: Imports all Spring MVC annotations
import java.util.*; // Import statement: Imports all classes from java.util package

/**
 * REST Controller for Room operations
 */
@RestController // Spring annotation: Marks this class as a REST controller
@RequestMapping("/api") // Spring annotation: Maps all requests in this controller to /api base path
@CrossOrigin(origins = "*") // Spring annotation: Enables CORS for all origins
public class RoomController { // Class declaration: Public class named RoomController handling room-related API endpoints
    
    /**
     * Get all rooms - matching actual CSV data
     */
    @GetMapping("/rooms") // Spring annotation: Maps HTTP GET requests to /api/rooms endpoint
    public ResponseEntity<Map<String, Object>> getAllRooms() { // Method declaration: Public method that returns ResponseEntity containing Map with room data
        List<Map<String, Object>> rooms = Arrays.asList( // Method call: Creates immutable list of room maps using Arrays.asList
            createRoomMap("ROOM001", "Main Hall A", 25, "5x5", 5, 5), // Method call: Creates room map for ROOM001 with 25 seats
            createRoomMap("ROOM002", "Main Hall B", 45, "9x5", 9, 5), // Method call: Creates room map for ROOM002 with 45 seats
            createRoomMap("ROOM003", "Science Lab 1", 30, "6x5", 6, 5), // Method call: Creates room map for ROOM003 with 30 seats
            createRoomMap("ROOM004", "Computer Lab", 40, "8x5", 8, 5), // Method call: Creates room map for ROOM004 with 40 seats
            createRoomMap("ROOM005", "Library Hall", 30, "6x5", 6, 5), // Method call: Creates room map for ROOM005 with 30 seats
            createRoomMap("ROOM006", "Conference Room", 25, "5x5", 5, 5), // Method call: Creates room map for ROOM006 with 25 seats
            createRoomMap("ROOM007", "Study Hall", 25, "5x5", 5, 5), // Method call: Creates room map for ROOM007 with 25 seats
            createRoomMap("ROOM008", "Small Lab", 10, "2x5", 2, 5) // Method call: Creates room map for ROOM008 with 10 seats
        );
        
        Map<String, Object> response = new HashMap<>(); // Object instantiation: Creates HashMap to build response
        response.put("rooms", rooms); // Map method: Puts rooms list under "rooms" key
        response.put("total", rooms.size()); // Map method: Puts total count under "total" key
        
        return ResponseEntity.ok(response); // Return statement: Returns HTTP 200 OK response with response body
    }
    
    private Map<String, Object> createRoomMap(String roomNo, String roomName, int numberOfSeats, // Method declaration: Private helper method to create room map
                                            String seatMatrix, int rows, int columns) { // Method parameters: Room details
        Map<String, Object> room = new HashMap<>(); // Object instantiation: Creates HashMap for room data
        room.put("roomNo", roomNo); // Map method: Puts room number under "roomNo" key
        room.put("roomName", roomName); // Map method: Puts room name under "roomName" key
        room.put("numberOfSeats", numberOfSeats); // Map method: Puts seat count under "numberOfSeats" key
        room.put("seatMatrix", seatMatrix); // Map method: Puts seat matrix under "seatMatrix" key
        room.put("rows", rows); // Map method: Puts row count under "rows" key
        room.put("columns", columns); // Map method: Puts column count under "columns" key
        return room; // Return statement: Returns the room map
    }
} // Class closing brace: End of RoomController class
