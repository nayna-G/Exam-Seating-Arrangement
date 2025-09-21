package com.examseating.service;

import com.examseating.model.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for implementing seating arrangement algorithms
 * 
 * This service contains the core business logic for generating
 * fair and optimized seating arrangements for examinations.
 */
@Service
public class SeatingAlgorithmService {
    
    /**
     * Generate seating arrangement using optimized algorithm
     * 
     * @param exam The exam for which seating is to be generated
     * @param students List of students to be seated
     * @param rooms List of available rooms
     * @return Generated seating arrangement
     */
    public SeatingArrangement generateSeatingArrangement(Exam exam, List<Student> students, List<Room> rooms) {
        // Validate inputs
        validateInputs(exam, students, rooms);
        
        // Calculate total capacity
        int totalCapacity = rooms.stream().mapToInt(Room::getCapacity).sum();
        if (students.size() > totalCapacity) {
            throw new IllegalArgumentException("Not enough room capacity for all students");
        }
        
        // Create seating arrangement
        SeatingArrangement arrangement = new SeatingArrangement();
        arrangement.setExamId(exam.getId());
        arrangement.setGeneratedAt(new Date());
        arrangement.setTotalStudents(students.size());
        arrangement.setTotalRooms(rooms.size());
        
        // Generate assignments using optimized algorithm
        List<SeatingAssignment> assignments = generateOptimizedAssignments(students, rooms);
        arrangement.setAssignments(assignments);
        
        return arrangement;
    }
    
    /**
     * Generate seating assignments using optimized algorithm
     * 
     * @param students List of students
     * @param rooms List of rooms
     * @return List of seating assignments
     */
    private List<SeatingAssignment> generateOptimizedAssignments(List<Student> students, List<Room> rooms) {
        List<SeatingAssignment> assignments = new ArrayList<>();
        
        // Shuffle students for randomization
        List<Student> shuffledStudents = new ArrayList<>(students);
        Collections.shuffle(shuffledStudents);
        
        // Sort rooms by capacity (descending) for optimal distribution
        List<Room> sortedRooms = rooms.stream()
                .sorted((r1, r2) -> Integer.compare(r2.getCapacity(), r1.getCapacity()))
                .collect(Collectors.toList());
        
        int studentIndex = 0;
        
        for (Room room : sortedRooms) {
            int studentsInRoom = Math.min(room.getCapacity(), shuffledStudents.size() - studentIndex);
            
            for (int i = 0; i < studentsInRoom; i++) {
                Student student = shuffledStudents.get(studentIndex);
                SeatingAssignment assignment = createSeatingAssignment(student, room, i + 1);
                assignments.add(assignment);
                studentIndex++;
            }
        }
        
        return assignments;
    }
    
    /**
     * Create a seating assignment for a student in a specific room
     * 
     * @param student The student
     * @param room The room
     * @param seatNumber The seat number
     * @return Seating assignment
     */
    private SeatingAssignment createSeatingAssignment(Student student, Room room, int seatNumber) {
        SeatingAssignment assignment = new SeatingAssignment();
        assignment.setStudentId(student.getStudentId());
        assignment.setRoomId(room.getRoomId());
        assignment.setSeatNumber(seatNumber);
        
        // Calculate row and column based on room layout
        int seatsPerRow = 5; // Default seats per row
        int row = ((seatNumber - 1) / seatsPerRow) + 1;
        int column = ((seatNumber - 1) % seatsPerRow) + 1;
        
        assignment.setRow(row);
        assignment.setColumn(column);
        
        // Generate QR code
        String qrCode = generateQRCode(student.getStudentId(), room.getRoomId(), seatNumber);
        assignment.setQrCode(qrCode);
        
        return assignment;
    }
    
    /**
     * Generate QR code for seating assignment
     * 
     * @param studentId Student ID
     * @param roomId Room ID
     * @param seatNumber Seat number
     * @return QR code string
     */
    private String generateQRCode(String studentId, String roomId, int seatNumber) {
        return String.format("QR_%s_%s_%d", studentId, roomId, seatNumber);
    }
    
    /**
     * Validate input parameters
     * 
     * @param exam Exam object
     * @param students List of students
     * @param rooms List of rooms
     */
    private void validateInputs(Exam exam, List<Student> students, List<Room> rooms) {
        if (exam == null) {
            throw new IllegalArgumentException("Exam cannot be null");
        }
        
        if (students == null || students.isEmpty()) {
            throw new IllegalArgumentException("Students list cannot be null or empty");
        }
        
        if (rooms == null || rooms.isEmpty()) {
            throw new IllegalArgumentException("Rooms list cannot be null or empty");
        }
        
        // Check for duplicate students
        Set<String> studentIds = new HashSet<>();
        for (Student student : students) {
            if (!studentIds.add(student.getStudentId())) {
                throw new IllegalArgumentException("Duplicate student ID found: " + student.getStudentId());
            }
        }
        
        // Check for duplicate rooms
        Set<String> roomIds = new HashSet<>();
        for (Room room : rooms) {
            if (!roomIds.add(room.getRoomId())) {
                throw new IllegalArgumentException("Duplicate room ID found: " + room.getRoomId());
            }
        }
    }
    
    /**
     * Generate seating arrangement with special requirements consideration
     * 
     * @param exam The exam
     * @param students List of students
     * @param rooms List of rooms
     * @return Seating arrangement with special requirements handled
     */
    public SeatingArrangement generateSeatingWithSpecialRequirements(Exam exam, List<Student> students, List<Room> rooms) {
        // Separate students with and without special requirements
        List<Student> studentsWithRequirements = students.stream()
                .filter(s -> s.getSpecialRequirements() != null && !s.getSpecialRequirements().isEmpty())
                .collect(Collectors.toList());
        
        List<Student> studentsWithoutRequirements = students.stream()
                .filter(s -> s.getSpecialRequirements() == null || s.getSpecialRequirements().isEmpty())
                .collect(Collectors.toList());
        
        // Filter rooms that can accommodate special requirements
        List<Room> accessibleRooms = rooms.stream()
                .filter(room -> room.getFacilities().contains("Wheelchair Access"))
                .collect(Collectors.toList());
        
        // Generate seating for students with special requirements first
        SeatingArrangement arrangement = new SeatingArrangement();
        arrangement.setExamId(exam.getId());
        arrangement.setGeneratedAt(new Date());
        arrangement.setTotalStudents(students.size());
        arrangement.setTotalRooms(rooms.size());
        
        List<SeatingAssignment> assignments = new ArrayList<>();
        
        // Assign students with special requirements to accessible rooms
        if (!studentsWithRequirements.isEmpty() && !accessibleRooms.isEmpty()) {
            List<SeatingAssignment> specialAssignments = generateOptimizedAssignments(studentsWithRequirements, accessibleRooms);
            assignments.addAll(specialAssignments);
        }
        
        // Assign remaining students to all available rooms
        List<Student> remainingStudents = new ArrayList<>(studentsWithoutRequirements);
        if (assignments.size() < studentsWithRequirements.size()) {
            // Some students with requirements couldn't be accommodated
            remainingStudents.addAll(studentsWithRequirements.subList(assignments.size(), studentsWithRequirements.size()));
        }
        
        if (!remainingStudents.isEmpty()) {
            List<SeatingAssignment> regularAssignments = generateOptimizedAssignments(remainingStudents, rooms);
            assignments.addAll(regularAssignments);
        }
        
        arrangement.setAssignments(assignments);
        return arrangement;
    }
    
    /**
     * Calculate seating statistics
     * 
     * @param arrangement Seating arrangement
     * @return Statistics map
     */
    public Map<String, Object> calculateSeatingStatistics(SeatingArrangement arrangement) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalStudents", arrangement.getTotalStudents());
        stats.put("totalRooms", arrangement.getTotalRooms());
        stats.put("averageStudentsPerRoom", (double) arrangement.getTotalStudents() / arrangement.getTotalRooms());
        
        // Calculate room utilization
        Map<String, Long> roomUtilization = arrangement.getAssignments().stream()
                .collect(Collectors.groupingBy(SeatingAssignment::getRoomId, Collectors.counting()));
        
        stats.put("roomUtilization", roomUtilization);
        
        return stats;
    }
}
