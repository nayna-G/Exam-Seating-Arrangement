package com.examseating.controller; // Package declaration: Defines the package this class belongs to (com.examseating.controller)

import org.springframework.http.ResponseEntity; // Import statement: Imports ResponseEntity for HTTP response wrapping
import org.springframework.web.bind.annotation.*; // Import statement: Imports all Spring MVC annotations (@RestController, @RequestMapping, @GetMapping, @PostMapping, etc.)
import java.util.*; // Import statement: Imports all classes from java.util package (List, Map, Arrays, HashMap, ArrayList, etc.)

/**
 * REST Controller for Student operations
 */
@RestController // Spring annotation: Marks this class as a REST controller (combines @Controller and @ResponseBody)
@RequestMapping("/api") // Spring annotation: Maps all requests in this controller to /api base path
@CrossOrigin(origins = "*") // Spring annotation: Enables CORS for all origins (allows cross-origin requests from any domain)
public class StudentController { // Class declaration: Public class named StudentController handling student-related API endpoints
    
    /**
     * Get all students
     */
    @GetMapping("/students") // Spring annotation: Maps HTTP GET requests to /api/students endpoint
    public ResponseEntity<Map<String, Object>> getAllStudents() { // Method declaration: Public method that returns ResponseEntity containing Map with student data
        List<Map<String, Object>> students = Arrays.asList( // Method call: Creates immutable list of student maps using Arrays.asList
            createStudentMap("STU001", "John Doe", "Mathematics", "2024-12-20"), // Method call: Creates student map for student 1
            createStudentMap("STU002", "Jane Smith", "Mathematics", "2024-12-20"), // Method call: Creates student map for student 2
            createStudentMap("STU003", "Mike Johnson", "Physics", "2024-12-22"), // Method call: Creates student map for student 3
            createStudentMap("STU004", "Sarah Wilson", "Mathematics", "2024-12-20"), // Method call: Creates student map for student 4
            createStudentMap("STU005", "David Brown", "Physics", "2024-12-22") // Method call: Creates student map for student 5
        );
        
        Map<String, Object> response = new HashMap<>(); // Object instantiation: Creates HashMap to build response
        response.put("students", students); // Map method: Puts students list under "students" key
        response.put("total", students.size()); // Map method: Puts total count under "total" key
        
        return ResponseEntity.ok(response); // Return statement: Returns HTTP 200 OK response with response body
    }
    
    /**
     * Search for a specific student
     */
    @GetMapping("/student/{studentId}") // Spring annotation: Maps HTTP GET requests to /api/student/{studentId} endpoint with path variable
    public ResponseEntity<Map<String, Object>> getStudent(@PathVariable String studentId) { // Method declaration: Public method with path variable parameter for student ID
        Map<String, Object> response = new HashMap<>(); // Object instantiation: Creates HashMap to build response
        
        if ("STU001".equals(studentId)) { // Conditional check: If studentId matches "STU001"
            Map<String, Object> student = createStudentMap("STU001", "John Doe", "Mathematics", "2024-12-20"); // Method call: Creates student map for STU001
            response.put("found", true); // Map method: Puts found flag as true
            response.put("student", student); // Map method: Puts student data under "student" key
        } else if ("STU002".equals(studentId)) { // Conditional check: If studentId matches "STU002"
            Map<String, Object> student = createStudentMap("STU002", "Jane Smith", "Mathematics", "2024-12-20"); // Method call: Creates student map for STU002
            response.put("found", true); // Map method: Puts found flag as true
            response.put("student", student); // Map method: Puts student data under "student" key
        } else { // Else block: Executes if studentId matches neither STU001 nor STU002
            response.put("found", false); // Map method: Puts found flag as false
            response.put("message", "Student not found"); // Map method: Puts error message
        }
        
        return ResponseEntity.ok(response); // Return statement: Returns HTTP 200 OK response with response body
    }
    
    private Map<String, Object> createStudentMap(String studentId, String studentName, String studentExam, String date) { // Method declaration: Private helper method to create student map
        Map<String, Object> student = new HashMap<>(); // Object instantiation: Creates HashMap for student data
        student.put("studentId", studentId); // Map method: Puts studentId under "studentId" key
        student.put("studentName", studentName); // Map method: Puts studentName under "studentName" key
        student.put("studentExam", studentExam); // Map method: Puts studentExam under "studentExam" key
        student.put("date", date); // Map method: Puts date under "date" key
        return student; // Return statement: Returns the student map
    }
} // Class closing brace: End of StudentController class
