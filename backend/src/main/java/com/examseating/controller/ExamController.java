package com.examseating.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * REST Controller for Exam operations
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ExamController {
    
    /**
     * Get all exams
     */
    @GetMapping("/exams")
    public ResponseEntity<Map<String, Object>> getAllExams() {
        // Mock data for demonstration
        List<Map<String, Object>> exams = Arrays.asList(
            createExamMap("EXAM001", "Mathematics", "2024-12-20", "09:00", 180),
            createExamMap("EXAM002", "Physics", "2024-12-22", "14:00", 150)
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("exams", exams);
        response.put("total", exams.size());
        
        return ResponseEntity.ok(response);
    }
    
    private Map<String, Object> createExamMap(String id, String subject, String date, String time, int duration) {
        Map<String, Object> exam = new HashMap<>();
        exam.put("id", id);
        exam.put("subject", subject);
        exam.put("date", date);
        exam.put("time", time);
        exam.put("duration", duration);
        return exam;
    }
}
