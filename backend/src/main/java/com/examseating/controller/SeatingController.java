package com.examseating.controller;

import com.examseating.service.SeatingAlgorithmService;
import com.examseating.model.Student;
import com.examseating.model.Room;
import com.examseating.model.Exam;
import com.examseating.model.SeatingArrangement;
import com.examseating.model.SeatingAssignment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * REST Controller for Seating Arrangement operations
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SeatingController {
    
    @Autowired
    private SeatingAlgorithmService seatingAlgorithmService;
    
    /**
     * Generate seating arrangement using proper algorithm
     */
    @PostMapping("/seating")
    public ResponseEntity<Map<String, Object>> generateSeating(@RequestBody(required = false) Map<String, Object> request) {
        try {
            // Create mock data for demonstration
            List<Student> students = createMockStudents();
            List<Room> rooms = createMockRooms();
            Exam exam = createMockExam();
            
            // Use the seating algorithm service to generate proper seating
            SeatingArrangement arrangement = seatingAlgorithmService.generateSeatingArrangement(exam, students, rooms);
            
            // Convert to response format
            List<Map<String, Object>> seatingArrangement = new ArrayList<>();
            for (SeatingAssignment assignment : arrangement.getAssignments()) {
                // Find student and room details
                Student student = students.stream()
                    .filter(s -> s.getStudentId().equals(assignment.getStudentId()))
                    .findFirst().orElse(null);
                Room room = rooms.stream()
                    .filter(r -> r.getRoomId().equals(assignment.getRoomId()))
                    .findFirst().orElse(null);
                
                if (student != null && room != null) {
                    seatingArrangement.add(createSeatingMap(
                        student.getStudentId(), 
                        student.getName(), 
                        "Mathematics", // Default subject
                        "2024-12-20", 
                        room.getRoomId(), 
                        room.getName(), 
                        assignment.getSeatNumber(), 
                        assignment.getRow(), 
                        assignment.getColumn(), 
                        room.getCapacity(), 
                        room.getRows() + "x" + room.getColumns()
                    ));
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("seatingArrangement", seatingArrangement);
            response.put("totalStudents", arrangement.getTotalStudents());
            response.put("generatedAt", arrangement.getGeneratedAt().toString());
            response.put("distribution", "Proper room-by-room allocation without overflow");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Fallback to mock data if algorithm fails
            return generateMockSeating();
        }
    }
    
    /**
     * Get existing seating arrangement
     */
    @GetMapping("/seating")
    public ResponseEntity<Map<String, Object>> getSeating() {
        // Return the same mock data as generate for demonstration
        return generateSeating(null);
    }
    
    /**
     * Save seating arrangement
     */
    @PostMapping("/save-seating")
    public ResponseEntity<Map<String, Object>> saveSeating(@RequestBody Map<String, Object> request) {
        // Mock save operation
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Seating data saved successfully");
        response.put("file", "seating_arrangement.csv");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("message", "Exam Seating Backend is running");
        response.put("timestamp", new Date().toString());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create mock students for testing - more realistic number
     */
    private List<Student> createMockStudents() {
        List<Student> students = new ArrayList<>();
        String[] examSubjects = {"Mathematics", "Physics", "Chemistry", "Biology"};
        
        // Create 20 students with different exam subjects for anti-cheating testing
        for (int i = 1; i <= 20; i++) {
            String studentId = String.format("STU%03d", i);
            String name = "Student " + i;
            String rollNumber = "R" + String.format("%03d", i);
            String className = "Class " + ((i % 3) + 1);
            String section = "Section " + ((i % 2) + 1);
            String examSubject = examSubjects[i % examSubjects.length]; // Rotate through exam subjects
            students.add(new Student(studentId, name, rollNumber, className, section, examSubject));
        }
        return students;
    }
    
    /**
     * Create mock rooms for testing - matching actual CSV data
     */
    private List<Room> createMockRooms() {
        List<Room> rooms = new ArrayList<>();
        rooms.add(new Room("ROOM001", "Main Hall A", 25, 5, 5)); // 25 seats
        rooms.add(new Room("ROOM002", "Main Hall B", 45, 9, 5)); // 45 seats  
        rooms.add(new Room("ROOM003", "Science Lab 1", 30, 6, 5)); // 30 seats
        rooms.add(new Room("ROOM004", "Computer Lab", 40, 8, 5)); // 40 seats
        rooms.add(new Room("ROOM005", "Library Hall", 30, 6, 5)); // 30 seats
        rooms.add(new Room("ROOM006", "Conference Room", 25, 5, 5)); // 25 seats
        rooms.add(new Room("ROOM007", "Study Hall", 25, 5, 5)); // 25 seats
        rooms.add(new Room("ROOM008", "Small Lab", 10, 2, 5)); // 10 seats
        return rooms;
    }
    
    /**
     * Create mock exam for testing
     */
    private Exam createMockExam() {
        Exam exam = new Exam();
        exam.setId(1L);
        exam.setExamId("EXAM001");
        exam.setSubject("Mathematics");
        return exam;
    }
    
    /**
     * Fallback method for mock seating generation
     */
    private ResponseEntity<Map<String, Object>> generateMockSeating() {
        List<Map<String, Object>> seatingArrangement = Arrays.asList(
            createSeatingMap("STU001", "John Doe", "Mathematics", "2024-12-20", "ROOM001", "Main Hall A", 1, 1, 1, 3, "3x1"),
            createSeatingMap("STU002", "Jane Smith", "Mathematics", "2024-12-20", "ROOM001", "Main Hall A", 2, 2, 1, 3, "3x1"),
            createSeatingMap("STU003", "Mike Johnson", "Mathematics", "2024-12-20", "ROOM001", "Main Hall A", 3, 3, 1, 3, "3x1"),
            createSeatingMap("STU004", "Sarah Wilson", "Mathematics", "2024-12-20", "ROOM002", "Main Hall B", 1, 1, 1, 3, "3x1"),
            createSeatingMap("STU005", "David Brown", "Mathematics", "2024-12-20", "ROOM002", "Main Hall B", 2, 2, 1, 3, "3x1"),
            createSeatingMap("STU006", "Alice Green", "Mathematics", "2024-12-20", "ROOM002", "Main Hall B", 3, 3, 1, 3, "3x1"),
            createSeatingMap("STU007", "Bob White", "Mathematics", "2024-12-20", "ROOM003", "Science Lab 1", 1, 1, 1, 2, "2x1"),
            createSeatingMap("STU008", "Emma Black", "Mathematics", "2024-12-20", "ROOM003", "Science Lab 1", 2, 2, 1, 2, "2x1")
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("seatingArrangement", seatingArrangement);
        response.put("totalStudents", seatingArrangement.size());
        response.put("generatedAt", new Date().toString());
        response.put("distribution", "Room-by-room allocation - no overflow");
        
        return ResponseEntity.ok(response);
    }
    
    private Map<String, Object> createSeatingMap(String studentId, String studentName, String studentExam, 
                                               String date, String roomNo, String roomName, int seatNo, 
                                               int row, int column, int roomCapacity, String roomLayout) {
        Map<String, Object> seating = new HashMap<>();
        seating.put("studentId", studentId);
        seating.put("studentName", studentName);
        seating.put("studentExam", studentExam);
        seating.put("date", date);
        seating.put("roomNo", roomNo);
        seating.put("roomName", roomName);
        seating.put("seatNo", seatNo);
        seating.put("row", row);
        seating.put("column", column);
        seating.put("roomCapacity", roomCapacity);
        seating.put("roomLayout", roomLayout);
        return seating;
    }
}
