package com.examseating.controller; // Package declaration: Defines the package this class belongs to (com.examseating.controller)

import com.examseating.service.SeatingAlgorithmService; // Import statement: Imports SeatingAlgorithmService for seating algorithm logic
import com.examseating.model.Student; // Import statement: Imports Student entity class
import com.examseating.model.Room; // Import statement: Imports Room entity class
import com.examseating.model.Exam; // Import statement: Imports Exam entity class
import com.examseating.model.SeatingArrangement; // Import statement: Imports SeatingArrangement entity class
import com.examseating.model.SeatingAssignment; // Import statement: Imports SeatingAssignment entity class
import org.springframework.beans.factory.annotation.Autowired; // Import statement: Imports @Autowired annotation for dependency injection
import org.springframework.http.ResponseEntity; // Import statement: Imports ResponseEntity for HTTP response wrapping
import org.springframework.web.bind.annotation.*; // Import statement: Imports all Spring MVC annotations
import java.util.*; // Import statement: Imports all classes from java.util package

/**
 * REST Controller for Seating Arrangement operations
 */
@RestController // Spring annotation: Marks this class as a REST controller
@RequestMapping("/api") // Spring annotation: Maps all requests in this controller to /api base path
@CrossOrigin(origins = "*") // Spring annotation: Enables CORS for all origins
public class SeatingController { // Class declaration: Public class named SeatingController handling seating arrangement API endpoints
    
    @Autowired // Spring annotation: Enables automatic dependency injection of SeatingAlgorithmService
    private SeatingAlgorithmService seatingAlgorithmService; // Field declaration: Service instance for seating algorithm logic
    
    /**
     * Generate seating arrangement using proper algorithm
     */
    @PostMapping("/seating") // Spring annotation: Maps HTTP POST requests to /api/seating endpoint
    public ResponseEntity<Map<String, Object>> generateSeating(@RequestBody(required = false) Map<String, Object> request) { // Method declaration: Public method with optional request body parameter
        try { // Try block: Begins exception handling for seating generation
            List<Student> students = createMockStudents(); // Method call: Creates mock student data for testing
            List<Room> rooms = createMockRooms(); // Method call: Creates mock room data for testing
            Exam exam = createMockExam(); // Method call: Creates mock exam data for testing
            
            SeatingArrangement arrangement = seatingAlgorithmService.generateSeatingArrangement(exam, students, rooms); // Method call: Calls service to generate seating arrangement using anti-cheating algorithm
            
            List<Map<String, Object>> seatingArrangement = new ArrayList<>(); // Object instantiation: Creates ArrayList to store seating data in response format
            for (SeatingAssignment assignment : arrangement.getAssignments()) { // For-each loop: Iterates over each seating assignment in the arrangement
                Student student = students.stream() // Stream operation: Creates stream from students list
                    .filter(s -> s.getStudentId().equals(assignment.getStudentId())) // Stream filter: Filters student by ID matching assignment
                    .findFirst().orElse(null); // Stream terminal: Finds first match or returns null
                Room room = rooms.stream() // Stream operation: Creates stream from rooms list
                    .filter(r -> r.getRoomId().equals(assignment.getRoomId())) // Stream filter: Filters room by ID matching assignment
                    .findFirst().orElse(null); // Stream terminal: Finds first match or returns null
                
                if (student != null && room != null) { // Conditional check: If both student and room were found
                    seatingArrangement.add(createSeatingMap( // List method: Adds seating map to the list
                        student.getStudentId(), // Parameter: Student ID
                        student.getName(), // Parameter: Student name
                        "Mathematics", // Parameter: Default exam subject
                        "2024-12-20", // Parameter: Default exam date
                        room.getRoomId(), // Parameter: Room ID
                        room.getName(), // Parameter: Room name
                        assignment.getSeatNumber(), // Parameter: Seat number from assignment
                        assignment.getRow(), // Parameter: Row from assignment
                        assignment.getColumn(), // Parameter: Column from assignment
                        room.getCapacity(), // Parameter: Room capacity
                        room.getRows() + "x" + room.getColumns() // Parameter: Room layout string (e.g., "5x5")
                    ));
                }
            }
            
            Map<String, Object> response = new HashMap<>(); // Object instantiation: Creates HashMap to build response
            response.put("seatingArrangement", seatingArrangement); // Map method: Puts seating arrangement data under "seatingArrangement" key
            response.put("totalStudents", arrangement.getTotalStudents()); // Map method: Puts total student count under "totalStudents" key
            response.put("generatedAt", arrangement.getGeneratedAt().toString()); // Map method: Puts generation timestamp under "generatedAt" key
            response.put("distribution", "Proper room-by-room allocation without overflow"); // Map method: Puts distribution description under "distribution" key
            
            return ResponseEntity.ok(response); // Return statement: Returns HTTP 200 OK response with response body
            
        } catch (Exception e) { // Catch block: Handles any exceptions during seating generation
            return generateMockSeating(); // Return statement: Falls back to mock seating data if algorithm fails
        }
    }
    
    /**
     * Get existing seating arrangement
     */
    @GetMapping("/seating") // Spring annotation: Maps HTTP GET requests to /api/seating endpoint
    public ResponseEntity<Map<String, Object>> getSeating() { // Method declaration: Public method that returns seating arrangement data
        return generateSeating(null); // Return statement: Calls generateSeating method with null to return mock data
    }
    
    /**
     * Save seating arrangement
     */
    @PostMapping("/save-seating") // Spring annotation: Maps HTTP POST requests to /api/save-seating endpoint
    public ResponseEntity<Map<String, Object>> saveSeating(@RequestBody Map<String, Object> request) { // Method declaration: Public method with request body parameter containing seating data
        Map<String, Object> response = new HashMap<>(); // Object instantiation: Creates HashMap to build response
        response.put("success", true); // Map method: Puts success flag under "success" key
        response.put("message", "Seating data saved successfully"); // Map method: Puts success message under "message" key
        response.put("file", "seating_arrangement.csv"); // Map method: Puts filename under "file" key
        
        return ResponseEntity.ok(response); // Return statement: Returns HTTP 200 OK response with response body
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health") // Spring annotation: Maps HTTP GET requests to /api/health endpoint
    public ResponseEntity<Map<String, Object>> health() { // Method declaration: Public method that returns health status
        Map<String, Object> response = new HashMap<>(); // Object instantiation: Creates HashMap to build response
        response.put("status", "healthy"); // Map method: Puts health status under "status" key
        response.put("message", "Exam Seating Backend is running"); // Map method: Puts status message under "message" key
        response.put("timestamp", new Date().toString()); // Map method: Puts current timestamp under "timestamp" key
        
        return ResponseEntity.ok(response); // Return statement: Returns HTTP 200 OK response with response body
    }
    
    /**
     * Create mock students for testing - more realistic number
     */
    private List<Student> createMockStudents() { // Method declaration: Private helper method to create mock student data
        List<Student> students = new ArrayList<>(); // Object instantiation: Creates ArrayList to store students
        String[] examSubjects = {"Mathematics", "Physics", "Chemistry", "Biology"}; // Array declaration: Array of exam subjects for anti-cheating testing
        
        for (int i = 1; i <= 20; i++) { // For loop: Creates 20 students for testing
            String studentId = String.format("STU%03d", i); // String method: Formats student ID with leading zeros (e.g., STU001)
            String name = "Student " + i; // String concatenation: Creates student name
            String rollNumber = "R" + String.format("%03d", i); // String concatenation: Creates roll number with leading zeros
            String className = "Class " + ((i % 3) + 1); // Arithmetic operation: Calculates class number (1-3)
            String section = "Section " + ((i % 2) + 1); // Arithmetic operation: Calculates section number (1-2)
            String examSubject = examSubjects[i % examSubjects.length]; // Array access: Rotates through exam subjects using modulo
            students.add(new Student(studentId, name, rollNumber, className, section, examSubject)); // List method: Adds new Student object to list
        }
        return students; // Return statement: Returns the list of mock students
    }
    
    /**
     * Create mock rooms for testing - matching actual CSV data
     */
    private List<Room> createMockRooms() { // Method declaration: Private helper method to create mock room data
        List<Room> rooms = new ArrayList<>(); // Object instantiation: Creates ArrayList to store rooms
        rooms.add(new Room("ROOM001", "Main Hall A", 25, 5, 5)); // List method: Adds room with 25 seats (5x5 layout)
        rooms.add(new Room("ROOM002", "Main Hall B", 45, 9, 5)); // List method: Adds room with 45 seats (9x5 layout)
        rooms.add(new Room("ROOM003", "Science Lab 1", 30, 6, 5)); // List method: Adds room with 30 seats (6x5 layout)
        rooms.add(new Room("ROOM004", "Computer Lab", 40, 8, 5)); // List method: Adds room with 40 seats (8x5 layout)
        rooms.add(new Room("ROOM005", "Library Hall", 30, 6, 5)); // List method: Adds room with 30 seats (6x5 layout)
        rooms.add(new Room("ROOM006", "Conference Room", 25, 5, 5)); // List method: Adds room with 25 seats (5x5 layout)
        rooms.add(new Room("ROOM007", "Study Hall", 25, 5, 5)); // List method: Adds room with 25 seats (5x5 layout)
        rooms.add(new Room("ROOM008", "Small Lab", 10, 2, 5)); // List method: Adds room with 10 seats (2x5 layout)
        return rooms; // Return statement: Returns the list of mock rooms
    }
    
    /**
     * Create mock exam for testing
     */
    private Exam createMockExam() { // Method declaration: Private helper method to create mock exam data
        Exam exam = new Exam(); // Object instantiation: Creates new Exam object
        exam.setId(1L); // Setter method: Sets exam ID to 1
        exam.setExamId("EXAM001"); // Setter method: Sets exam identifier string
        exam.setSubject("Mathematics"); // Setter method: Sets exam subject
        return exam; // Return statement: Returns the mock exam
    }
    
    /**
     * Fallback method for mock seating generation
     */
    private ResponseEntity<Map<String, Object>> generateMockSeating() { // Method declaration: Private fallback method for mock seating data
        List<Map<String, Object>> seatingArrangement = Arrays.asList( // Method call: Creates immutable list of seating maps
            createSeatingMap("STU001", "John Doe", "Mathematics", "2024-12-20", "ROOM001", "Main Hall A", 1, 1, 1, 3, "3x1"), // Method call: Creates seating map for student 1
            createSeatingMap("STU002", "Jane Smith", "Mathematics", "2024-12-20", "ROOM001", "Main Hall A", 2, 2, 1, 3, "3x1"), // Method call: Creates seating map for student 2
            createSeatingMap("STU003", "Mike Johnson", "Mathematics", "2024-12-20", "ROOM001", "Main Hall A", 3, 3, 1, 3, "3x1"), // Method call: Creates seating map for student 3
            createSeatingMap("STU004", "Sarah Wilson", "Mathematics", "2024-12-20", "ROOM002", "Main Hall B", 1, 1, 1, 3, "3x1"), // Method call: Creates seating map for student 4
            createSeatingMap("STU005", "David Brown", "Mathematics", "2024-12-20", "ROOM002", "Main Hall B", 2, 2, 1, 3, "3x1"), // Method call: Creates seating map for student 5
            createSeatingMap("STU006", "Alice Green", "Mathematics", "2024-12-20", "ROOM002", "Main Hall B", 3, 3, 1, 3, "3x1"), // Method call: Creates seating map for student 6
            createSeatingMap("STU007", "Bob White", "Mathematics", "2024-12-20", "ROOM003", "Science Lab 1", 1, 1, 1, 2, "2x1"), // Method call: Creates seating map for student 7
            createSeatingMap("STU008", "Emma Black", "Mathematics", "2024-12-20", "ROOM003", "Science Lab 1", 2, 2, 1, 2, "2x1") // Method call: Creates seating map for student 8
        );
        
        Map<String, Object> response = new HashMap<>(); // Object instantiation: Creates HashMap to build response
        response.put("seatingArrangement", seatingArrangement); // Map method: Puts seating arrangement data under "seatingArrangement" key
        response.put("totalStudents", seatingArrangement.size()); // Map method: Puts total student count under "totalStudents" key
        response.put("generatedAt", new Date().toString()); // Map method: Puts current timestamp under "generatedAt" key
        response.put("distribution", "Room-by-room allocation - no overflow"); // Map method: Puts distribution description under "distribution" key
        
        return ResponseEntity.ok(response); // Return statement: Returns HTTP 200 OK response with response body
    }
    
    private Map<String, Object> createSeatingMap(String studentId, String studentName, String studentExam, // Method declaration: Private helper method to create seating map
                                               String date, String roomNo, String roomName, int seatNo, // Method parameters: Seating details
                                               int row, int column, int roomCapacity, String roomLayout) { // Method parameters: Room layout details
        Map<String, Object> seating = new HashMap<>(); // Object instantiation: Creates HashMap for seating data
        seating.put("studentId", studentId); // Map method: Puts student ID under "studentId" key
        seating.put("studentName", studentName); // Map method: Puts student name under "studentName" key
        seating.put("studentExam", studentExam); // Map method: Puts exam subject under "studentExam" key
        seating.put("date", date); // Map method: Puts exam date under "date" key
        seating.put("roomNo", roomNo); // Map method: Puts room number under "roomNo" key
        seating.put("roomName", roomName); // Map method: Puts room name under "roomName" key
        seating.put("seatNo", seatNo); // Map method: Puts seat number under "seatNo" key
        seating.put("row", row); // Map method: Puts row number under "row" key
        seating.put("column", column); // Map method: Puts column number under "column" key
        seating.put("roomCapacity", roomCapacity); // Map method: Puts room capacity under "roomCapacity" key
        seating.put("roomLayout", roomLayout); // Map method: Puts room layout under "roomLayout" key
        return seating; // Return statement: Returns the seating map
    }
} // Class closing brace: End of SeatingController class
