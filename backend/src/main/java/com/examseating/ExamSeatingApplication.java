package com.examseating;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

/**
 * Main application class for Exam Seating Arrangement System
 * 
 * This is the entry point for the Spring Boot application that provides
 * the backend services for the exam seating arrangement system.
 * 
 * @author Exam Seating Team
 * @version 1.0.0
 */
@SpringBootApplication
@CrossOrigin(origins = "http://localhost:3000") // Allow CORS for Next.js frontend
public class ExamSeatingApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamSeatingApplication.class, args);
        System.out.println("Exam Seating Arrangement System Backend Started Successfully!");
        System.out.println("API Documentation: http://localhost:8080/swagger-ui.html");
        System.out.println("Health Check: http://localhost:8080/actuator/health");
    }
}
