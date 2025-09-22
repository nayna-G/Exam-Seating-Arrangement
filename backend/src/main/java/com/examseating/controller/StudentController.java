package com.examseating.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * REST Controller for Student operations
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StudentController {
    
    /**
     * Get all students
     */
    @GetMapping("/students")
    public ResponseEntity<Map<String, Object>> getAllStudents() {
        // Mock data for demonstration
        List<Map<String, Object>> students = Arrays.asList(
            createStudentMap("STU001", "John Doe", "Mathematics", "2024-12-20"),
            createStudentMap("STU002", "Jane Smith", "Mathematics", "2024-12-20"),
            createStudentMap("STU003", "Mike Johnson", "Physics", "2024-12-22"),
            createStudentMap("STU004", "Sarah Wilson", "Mathematics", "2024-12-20"),
            createStudentMap("STU005", "David Brown", "Physics", "2024-12-22")
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("students", students);
        response.put("total", students.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Search for a specific student
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudent(@PathVariable String studentId) {
        Map<String, Object> response = new HashMap<>();
        
        // Mock search - in real implementation, this would query the database
        if ("STU001".equals(studentId)) {
            Map<String, Object> student = createStudentMap("STU001", "John Doe", "Mathematics", "2024-12-20");
            response.put("found", true);
            response.put("student", student);
        } else if ("STU002".equals(studentId)) {
            Map<String, Object> student = createStudentMap("STU002", "Jane Smith", "Mathematics", "2024-12-20");
            response.put("found", true);
            response.put("student", student);
        } else {
            response.put("found", false);
            response.put("message", "Student not found");
        }
        
        return ResponseEntity.ok(response);
    }
    
    private Map<String, Object> createStudentMap(String studentId, String studentName, String studentExam, String date) {
        Map<String, Object> student = new HashMap<>();
        student.put("studentId", studentId);
        student.put("studentName", studentName);
        student.put("studentExam", studentExam);
        student.put("date", date);
        return student;
    }
}
