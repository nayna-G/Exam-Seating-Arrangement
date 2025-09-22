package com.examseating.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * REST Controller for Room operations
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RoomController {
    
    /**
     * Get all rooms - matching actual CSV data
     */
    @GetMapping("/rooms")
    public ResponseEntity<Map<String, Object>> getAllRooms() {
        // Mock data matching actual room capacities
        List<Map<String, Object>> rooms = Arrays.asList(
            createRoomMap("ROOM001", "Main Hall A", 25, "5x5", 5, 5),
            createRoomMap("ROOM002", "Main Hall B", 45, "9x5", 9, 5),
            createRoomMap("ROOM003", "Science Lab 1", 30, "6x5", 6, 5),
            createRoomMap("ROOM004", "Computer Lab", 40, "8x5", 8, 5),
            createRoomMap("ROOM005", "Library Hall", 30, "6x5", 6, 5),
            createRoomMap("ROOM006", "Conference Room", 25, "5x5", 5, 5),
            createRoomMap("ROOM007", "Study Hall", 25, "5x5", 5, 5),
            createRoomMap("ROOM008", "Small Lab", 10, "2x5", 2, 5)
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("rooms", rooms);
        response.put("total", rooms.size());
        
        return ResponseEntity.ok(response);
    }
    
    private Map<String, Object> createRoomMap(String roomNo, String roomName, int numberOfSeats, 
                                            String seatMatrix, int rows, int columns) {
        Map<String, Object> room = new HashMap<>();
        room.put("roomNo", roomNo);
        room.put("roomName", roomName);
        room.put("numberOfSeats", numberOfSeats);
        room.put("seatMatrix", seatMatrix);
        room.put("rows", rows);
        room.put("columns", columns);
        return room;
    }
}
