package com.examseating; // Package declaration: Defines the package this class belongs to (com.examseating)

import org.springframework.boot.SpringApplication; // Import statement: Imports SpringApplication class to bootstrap Spring Boot application
import org.springframework.boot.autoconfigure.SpringBootApplication; // Import statement: Imports @SpringBootApplication annotation for main application configuration
import org.springframework.web.bind.annotation.CrossOrigin; // Import statement: Imports @CrossOrigin annotation for CORS configuration

/**
 * Main application class for Exam Seating Arrangement System
 * 
 * This is the entry point for the Spring Boot application that provides
 * the backend services for the exam seating arrangement system.
 * 
 * @author Exam Seating Team
 * @version 1.0.0
 */
@SpringBootApplication // Spring annotation: Combines @Configuration, @EnableAutoConfiguration, and @ComponentScan for main application
@CrossOrigin(origins = "http://localhost:3000") // Spring annotation: Enables CORS for Next.js frontend running on localhost:3000
public class ExamSeatingApplication { // Class declaration: Public class named ExamSeatingApplication as the main entry point

    public static void main(String[] args) { // Method declaration: Public static main method - entry point for Java application
        SpringApplication.run(ExamSeatingApplication.class, args); // Static method call: Bootstraps Spring Boot application with this class and command-line args
        System.out.println("Exam Seating Arrangement System Backend Started Successfully!"); // Console output: Prints startup success message
        System.out.println("API Documentation: http://localhost:8080/swagger-ui.html"); // Console output: Prints API documentation URL
        System.out.println("Health Check: http://localhost:8080/actuator/health"); // Console output: Prints health check endpoint URL
    }
} // Class closing brace: End of ExamSeatingApplication class
