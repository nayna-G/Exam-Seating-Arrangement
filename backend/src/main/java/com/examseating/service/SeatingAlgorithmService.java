package com.examseating.service; // Package declaration: Defines the package this class belongs to (com.examseating.service)

import com.examseating.model.*; // Import statement: Imports all classes from the com.examseating.model package (Student, Room, Exam, etc.)
import org.springframework.stereotype.Service; // Import: Spring annotation to mark this class as a service component for dependency injection
import java.util.*; // Import: Imports all classes from java.util package (List, Map, Set, ArrayList, HashMap, Collections, etc.)
import java.util.stream.Collectors; // Import: Java 8 Stream API utilities for functional operations on collections

/**
 * Service class for implementing seating arrangement algorithms
 *
 * This service contains the core business logic for generating
 * fair and optimized seating arrangements for examinations.
 */
@Service // Spring annotation: Marks this class as a service component for automatic dependency injection by Spring container
public class SeatingAlgorithmService { // Class declaration: Public class named SeatingAlgorithmService containing seating algorithm logic

    /**
     * Generate seating arrangement using optimized algorithm
     *
     * @param exam The exam for which seating is to be generated
     * @param students List of students to be seated
     * @param rooms List of available rooms
     * @return Generated seating arrangement
     */
    public SeatingArrangement generateSeatingArrangement(Exam exam, List<Student> students, List<Room> rooms) { // Method declaration: Public method that takes Exam, List<Student>, List<Room> parameters and returns SeatingArrangement
        validateInputs(exam, students, rooms); // Method call: Validates input parameters (null checks, duplicate checks)

        int totalCapacity = rooms.stream().mapToInt(Room::getCapacity).sum(); // Stream operation: Calculates total capacity by summing all room capacities using Java 8 Stream API
        if (students.size() > totalCapacity) { // Conditional check: If number of students exceeds total room capacity
            throw new IllegalArgumentException("Not enough room capacity for all students"); // Exception: Throws IllegalArgumentException with descriptive message
        }

        SeatingArrangement arrangement = new SeatingArrangement(); // Object instantiation: Creates new SeatingArrangement object to hold the generated seating plan
        arrangement.setExamId(exam.getId()); // Setter method: Sets the exam ID in the arrangement object
        arrangement.setGeneratedAt(new Date()); // Setter method: Sets the generation timestamp to current date/time
        arrangement.setTotalStudents(students.size()); // Setter method: Sets total number of students in the arrangement
        arrangement.setTotalRooms(rooms.size()); // Setter method: Sets total number of rooms used in the arrangement

        List<SeatingAssignment> assignments = generateOptimizedAssignments(students, rooms); // Method call: Calls private method to generate optimized seating assignments
        arrangement.setAssignments(assignments); // Setter method: Sets the list of seating assignments in the arrangement

        return arrangement; // Return statement: Returns the complete SeatingArrangement object
    }

    /**
     * Generate seating assignments using optimized algorithm
     *
     * @param students List of students
     * @param rooms List of rooms
     * @return List of seating assignments
     */
    private List<SeatingAssignment> generateOptimizedAssignments(List<Student> students, List<Room> rooms) { // Method declaration: Private method that takes List<Student> and List<Room>, returns List<SeatingAssignment>
        List<SeatingAssignment> assignments = new ArrayList<>(); // Object instantiation: Creates empty ArrayList to store seating assignments

        System.out.println("🚀 BULLETPROOF Backend Seating Algorithm Starting..."); // Console output: Prints algorithm start message for debugging
        System.out.println("📊 Total students: " + students.size()); // Console output: Prints total number of students
        System.out.println("🏢 Total rooms: " + rooms.size()); // Console output: Prints total number of rooms
        System.out.println("🔒 Anti-cheating: Students with same exam will NOT be adjacent"); // Console output: Prints anti-cheating feature status

        Map<String, List<Student>> examGroups = students.stream() // Stream operation: Creates stream from students list
                .collect(Collectors.groupingBy(Student::getExamSubject)); // Stream terminal operation: Groups students by examSubject field using Collectors.groupingBy

        System.out.println("📚 Exam groups found:"); // Console output: Prints header for exam groups
        examGroups.forEach((exam, studentList) -> // Lambda expression: Iterates over each exam group entry
            System.out.println("   " + exam + ": " + studentList.size() + " students")); // Console output: Prints exam name and student count for each group

        List<Student> antiCheatStudents = createAntiCheatPattern(examGroups); // Method call: Calls private method to create alternating pattern of students from different exams

        List<Room> sortedRooms = rooms.stream() // Stream operation: Creates stream from rooms list
                .sorted((r1, r2) -> Integer.compare(r1.getCapacity(), r2.getCapacity())) // Stream intermediate operation: Sorts rooms by capacity in ascending order using comparator
                .collect(Collectors.toList()); // Stream terminal operation: Collects sorted stream back to List

        System.out.println("🔄 Rooms sorted by capacity:"); // Console output: Prints header for sorted rooms
        sortedRooms.forEach(room -> // Lambda expression: Iterates over each sorted room
            System.out.println("   " + room.getRoomId() + ": " + room.getCapacity() + " seats")); // Console output: Prints room ID and capacity

        int studentIndex = 0; // Variable declaration: Initializes index to track current student position in antiCheatStudents list

        for (Room room : sortedRooms) { // For-each loop: Iterates over each room in sorted rooms list
            if (studentIndex >= antiCheatStudents.size()) { // Conditional check: If all students have been assigned
                System.out.println("✅ All students assigned. Remaining rooms will be empty."); // Console output: Prints completion message
                break; // Break statement: Exits the loop as no more students need assignment
            }

            int remainingStudents = antiCheatStudents.size() - studentIndex; // Arithmetic operation: Calculates number of students still unassigned
            int studentsForThisRoom = Math.min(room.getCapacity(), remainingStudents); // Math function: Determines how many students to assign to this room (minimum of room capacity and remaining students)

            System.out.println("🏢 Processing Room " + room.getRoomId() + // Console output: Prints room processing message with capacity and student count
                             " (capacity: " + room.getCapacity() +
                             ", assigning: " + studentsForThisRoom + " students)");

            for (int seatNumber = 1; seatNumber <= studentsForThisRoom; seatNumber++) { // For loop: Iterates through each seat number from 1 to studentsForThisRoom
                if (studentIndex >= antiCheatStudents.size()) { // Conditional check: If no more students available
                    System.out.println("⚠️ No more students available"); // Console output: Prints warning message
                    break; // Break statement: Exits the inner loop
                }

                Student student = antiCheatStudents.get(studentIndex); // List method: Retrieves student at current index from antiCheatStudents list
                SeatingAssignment assignment = createSeatingAssignment(student, room, seatNumber); // Method call: Creates SeatingAssignment object for this student-room-seat combination
                assignments.add(assignment); // List method: Adds the assignment to the assignments list
                studentIndex++; // Increment operator: Moves to next student in the list

                if (seatNumber >= room.getCapacity()) { // Conditional check: If seat number reaches room capacity
                    System.out.println("🛑 Room " + room.getRoomId() + " is full (capacity reached)"); // Console output: Prints room full message
                    break; // Break statement: Exits the inner loop to prevent overflow
                }
            }

            double utilization = (double) studentsForThisRoom / room.getCapacity() * 100; // Arithmetic operation: Calculates room utilization percentage
            System.out.println("✅ Room " + room.getRoomId() + ": " + studentsForThisRoom + "/" + // Console output: Prints room summary with utilization percentage
                             room.getCapacity() + " students (" + String.format("%.1f", utilization) + "% utilized)");
        }

        if (studentIndex < antiCheatStudents.size()) { // Conditional check: If some students remain unassigned
            int unassigned = antiCheatStudents.size() - studentIndex; // Arithmetic operation: Calculates number of unassigned students
            System.out.println("⚠️ WARNING: " + unassigned + // Console output: Prints warning with unassigned count
                             " students could not be assigned due to insufficient room capacity");
        } else { // Else block: Executes if all students were assigned
            System.out.println("🎉 SUCCESS: All " + students.size() + " students successfully assigned with anti-cheating pattern!"); // Console output: Prints success message
        }

        return assignments; // Return statement: Returns the complete list of seating assignments
    }

    /**
     * Create anti-cheating pattern by alternating students from different exams.
     * This ensures students with same exam are never adjacent.
     */
    private List<Student> createAntiCheatPattern(Map<String, List<Student>> examGroups) { // Method declaration: Private method that takes Map of exam groups, returns List<Student> with alternating pattern
        List<Student> antiCheatStudents = new ArrayList<>(); // Object instantiation: Creates empty ArrayList to store anti-cheating student order

        List<List<Student>> examLists = new ArrayList<>(examGroups.values()); // Object instantiation: Converts Map values to List of Lists for easier manipulation

        examLists.forEach(Collections::shuffle); // Method reference: Shuffles each exam group list randomly for fairness

        System.out.println("🔀 Creating anti-cheat pattern..."); // Console output: Prints anti-cheat pattern creation start message

        int maxSize = examLists.stream().mapToInt(List::size).max().orElse(0); // Stream operation: Finds the maximum size among all exam groups

        for (int i = 0; i < maxSize; i++) { // For loop: Iterates from index 0 to maxSize (outer loop for position in pattern)
            for (List<Student> examList : examLists) { // For-each loop: Iterates over each exam group list (inner loop for alternating)
                if (i < examList.size()) { // Conditional check: If this exam group has a student at position i
                    Student student = examList.get(i); // List method: Retrieves student at index i from the exam group
                    antiCheatStudents.add(student); // List method: Adds student to anti-cheating pattern list
                    System.out.println("   Added: " + student.getName() + " (Exam: " + student.getExamSubject() + ")"); // Console output: Prints student name and exam subject
                }
            }
        }

        System.out.println("✅ Anti-cheat pattern created: " + antiCheatStudents.size() + " students arranged"); // Console output: Prints completion message with total students
        return antiCheatStudents; // Return statement: Returns the alternating pattern student list
    }

    /**
     * Create a seating assignment for a student in a specific room
     *
     * @param student The student
     * @param room The room
     * @param seatNumber The seat number
     * @return Seating assignment
     */
    private SeatingAssignment createSeatingAssignment(Student student, Room room, int seatNumber) { // Method declaration: Private method that takes Student, Room, and seatNumber, returns SeatingAssignment
        SeatingAssignment assignment = new SeatingAssignment(); // Object instantiation: Creates new SeatingAssignment object
        assignment.setStudentId(student.getStudentId()); // Setter method: Sets the student ID in the assignment
        assignment.setRoomId(room.getRoomId()); // Setter method: Sets the room ID in the assignment
        assignment.setSeatNumber(seatNumber); // Setter method: Sets the seat number in the assignment

        int seatsPerRow = 5; // Variable declaration: Defines default number of seats per row for layout calculation
        int row = ((seatNumber - 1) / seatsPerRow) + 1; // Arithmetic operation: Calculates row number using integer division (0-indexed to 1-indexed)
        int column = ((seatNumber - 1) % seatsPerRow) + 1; // Arithmetic operation: Calculates column number using modulo operation (0-indexed to 1-indexed)

        assignment.setRow(row); // Setter method: Sets the calculated row in the assignment
        assignment.setColumn(column); // Setter method: Sets the calculated column in the assignment

        String qrCode = generateQRCode(student.getStudentId(), room.getRoomId(), seatNumber); // Method call: Generates QR code string for this assignment
        assignment.setQrCode(qrCode); // Setter method: Sets the QR code in the assignment

        return assignment; // Return statement: Returns the complete SeatingAssignment object
    }

    /**
     * Generate QR code for seating assignment
     *
     * @param studentId Student ID
     * @param roomId Room ID
     * @param seatNumber Seat number
     * @return QR code string
     */
    private String generateQRCode(String studentId, String roomId, int seatNumber) { // Method declaration: Private method that takes studentId, roomId, and seatNumber, returns QR code string
        return String.format("QR_%s_%s_%d", studentId, roomId, seatNumber); // String method: Formats a QR code string using format specifiers (%s for strings, %d for integer)
    }

    /**
     * Validate input parameters
     *
     * @param exam Exam object
     * @param students List of students
     * @param rooms List of rooms
     */
    private void validateInputs(Exam exam, List<Student> students, List<Room> rooms) { // Method declaration: Private method that validates input parameters, returns void
        if (exam == null) { // Conditional check: If exam object is null
            throw new IllegalArgumentException("Exam cannot be null"); // Exception: Throws IllegalArgumentException with error message
        }

        if (students == null || students.isEmpty()) { // Conditional check: If students list is null or empty
            throw new IllegalArgumentException("Students list cannot be null or empty"); // Exception: Throws IllegalArgumentException with error message
        }

        if (rooms == null || rooms.isEmpty()) { // Conditional check: If rooms list is null or empty
            throw new IllegalArgumentException("Rooms list cannot be null or empty"); // Exception: Throws IllegalArgumentException with error message
        }

        Set<String> studentIds = new HashSet<>(); // Object instantiation: Creates HashSet to track unique student IDs for duplicate detection
        for (Student student : students) { // For-each loop: Iterates over each student in the students list
            if (!studentIds.add(student.getStudentId())) { // Conditional check: If student ID already exists in Set (add returns false for duplicates)
                throw new IllegalArgumentException("Duplicate student ID found: " + student.getStudentId()); // Exception: Throws IllegalArgumentException with duplicate ID message
            }
        }

        Set<String> roomIds = new HashSet<>(); // Object instantiation: Creates HashSet to track unique room IDs for duplicate detection
        for (Room room : rooms) { // For-each loop: Iterates over each room in the rooms list
            if (!roomIds.add(room.getRoomId())) { // Conditional check: If room ID already exists in Set (add returns false for duplicates)
                throw new IllegalArgumentException("Duplicate room ID found: " + room.getRoomId()); // Exception: Throws IllegalArgumentException with duplicate ID message
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
    public SeatingArrangement generateSeatingWithSpecialRequirements(Exam exam, List<Student> students, List<Room> rooms) { // Method declaration: Public method that handles students with special requirements (e.g., wheelchair access)
        List<Student> studentsWithRequirements = students.stream() // Stream operation: Creates stream from students list
                .filter(s -> s.getSpecialRequirements() != null && !s.getSpecialRequirements().isEmpty()) // Stream filter: Filters students who have special requirements
                .collect(Collectors.toList()); // Stream terminal operation: Collects filtered students into List

        List<Student> studentsWithoutRequirements = students.stream() // Stream operation: Creates stream from students list
                .filter(s -> s.getSpecialRequirements() == null || s.getSpecialRequirements().isEmpty()) // Stream filter: Filters students who don't have special requirements
                .collect(Collectors.toList()); // Stream terminal operation: Collects filtered students into List

        List<Room> accessibleRooms = rooms.stream() // Stream operation: Creates stream from rooms list
                .filter(room -> room.getFacilities().contains("Wheelchair Access")) // Stream filter: Filters rooms that have wheelchair access facility
                .collect(Collectors.toList()); // Stream terminal operation: Collects accessible rooms into List

        SeatingArrangement arrangement = new SeatingArrangement(); // Object instantiation: Creates new SeatingArrangement object
        arrangement.setExamId(exam.getId()); // Setter method: Sets the exam ID in the arrangement
        arrangement.setGeneratedAt(new Date()); // Setter method: Sets the generation timestamp
        arrangement.setTotalStudents(students.size()); // Setter method: Sets total number of students
        arrangement.setTotalRooms(rooms.size()); // Setter method: Sets total number of rooms

        List<SeatingAssignment> assignments = new ArrayList<>(); // Object instantiation: Creates empty ArrayList for assignments

        if (!studentsWithRequirements.isEmpty() && !accessibleRooms.isEmpty()) { // Conditional check: If there are students with requirements and accessible rooms available
            List<SeatingAssignment> specialAssignments = generateOptimizedAssignments(studentsWithRequirements, accessibleRooms); // Method call: Generates assignments for students with special requirements in accessible rooms
            assignments.addAll(specialAssignments); // List method: Adds special assignments to the main assignments list
        }

        List<Student> remainingStudents = new ArrayList<>(studentsWithoutRequirements); // Object instantiation: Creates copy of students without requirements
        if (assignments.size() < studentsWithRequirements.size()) { // Conditional check: If some students with requirements couldn't be accommodated
            remainingStudents.addAll(studentsWithRequirements.subList(assignments.size(), studentsWithRequirements.size())); // List method: Adds unaccommodated students to remaining list
        }

        if (!remainingStudents.isEmpty()) { // Conditional check: If there are remaining students to assign
            List<SeatingAssignment> regularAssignments = generateOptimizedAssignments(remainingStudents, rooms); // Method call: Generates assignments for remaining students in all rooms
            assignments.addAll(regularAssignments); // List method: Adds regular assignments to the main assignments list
        }

        arrangement.setAssignments(assignments); // Setter method: Sets the complete assignments list in the arrangement
        return arrangement; // Return statement: Returns the SeatingArrangement with special requirements handled
    }

    /**
     * Calculate seating statistics
     *
     * @param arrangement Seating arrangement
     * @return Statistics map
     */
    public Map<String, Object> calculateSeatingStatistics(SeatingArrangement arrangement) { // Method declaration: Public method that calculates statistics from seating arrangement
        Map<String, Object> stats = new HashMap<>(); // Object instantiation: Creates HashMap to store statistics

        stats.put("totalStudents", arrangement.getTotalStudents()); // Map method: Puts total students count in stats map
        stats.put("totalRooms", arrangement.getTotalRooms()); // Map method: Puts total rooms count in stats map
        stats.put("averageStudentsPerRoom", (double) arrangement.getTotalStudents() / arrangement.getTotalRooms()); // Map method: Puts calculated average students per room in stats map

        Map<String, Long> roomUtilization = arrangement.getAssignments().stream() // Stream operation: Creates stream from assignments list
                .collect(Collectors.groupingBy(SeatingAssignment::getRoomId, Collectors.counting())); // Stream terminal operation: Groups assignments by room ID and counts students per room

        stats.put("roomUtilization", roomUtilization); // Map method: Puts room utilization map in stats map

        return stats; // Return statement: Returns the statistics map
    }
} // Class closing brace: End of SeatingAlgorithmService class
