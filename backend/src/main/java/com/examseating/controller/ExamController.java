package com.examseating.controller; // Package declaration: Defines the package this class belongs to (com.examseating.controller)

import org.springframework.http.ResponseEntity; // Import statement: Imports ResponseEntity for HTTP response wrapping
import org.springframework.web.bind.annotation.*; // Import statement: Imports all Spring MVC annotations
import java.util.*; // Import statement: Imports all classes from java.util package

/**
 * REST Controller for Exam operations
 */
@RestController // Spring annotation: Marks this class as a REST controller
@RequestMapping("/api") // Spring annotation: Maps all requests in this controller to /api base path
@CrossOrigin(origins = "*") // Spring annotation: Enables CORS for all origins
public class ExamController { // Class declaration: Public class named ExamController handling exam-related API endpoints
    
    /**
     * Get all exams
     */
    @GetMapping("/exams") // Spring annotation: Maps HTTP GET requests to /api/exams endpoint
    public ResponseEntity<Map<String, Object>> getAllExams() { // Method declaration: Public method that returns ResponseEntity containing Map with exam data
        List<Map<String, Object>> exams = Arrays.asList( // Method call: Creates immutable list of exam maps using Arrays.asList
            createExamMap("EXAM001", "Mathematics", "2024-12-20", "09:00", 180), // Method call: Creates exam map for Mathematics exam
            createExamMap("EXAM002", "Physics", "2024-12-22", "14:00", 150) // Method call: Creates exam map for Physics exam
        );
        
        Map<String, Object> response = new HashMap<>(); // Object instantiation: Creates HashMap to build response
        response.put("exams", exams); // Map method: Puts exams list under "exams" key
        response.put("total", exams.size()); // Map method: Puts total count under "total" key
        
        return ResponseEntity.ok(response); // Return statement: Returns HTTP 200 OK response with response body
    }
    
    private Map<String, Object> createExamMap(String id, String subject, String date, String time, int duration) { // Method declaration: Private helper method to create exam map
        Map<String, Object> exam = new HashMap<>(); // Object instantiation: Creates HashMap for exam data
        exam.put("id", id); // Map method: Puts exam ID under "id" key
        exam.put("subject", subject); // Map method: Puts exam subject under "subject" key
        exam.put("date", date); // Map method: Puts exam date under "date" key
        exam.put("time", time); // Map method: Puts exam time under "time" key
        exam.put("duration", duration); // Map method: Puts exam duration under "duration" key
        return exam; // Return statement: Returns the exam map
    }
} // Class closing brace: End of ExamController class
