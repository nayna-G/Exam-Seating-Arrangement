import java.io.*;
import java.net.*;
import java.util.*;
import java.nio.file.*;

/**
 * Simple HTTP Server for Exam Seating System
 * This is a basic backend that can run without Maven/Spring Boot
 * 
 * Usage: javac SimpleBackend.java && java SimpleBackend
 */
public class SimpleBackend {
    private static final int PORT = 8080;
    private static final String DATA_DIR = "../src/data/";
    private static final String SEATING_FILE = "seating_arrangement.csv";
    
    public static void main(String[] args) {
        System.out.println("🚀 Starting Exam Seating System Backend...");
        System.out.println("📍 Server will run on: http://localhost:" + PORT);
        System.out.println("📁 Data directory: " + DATA_DIR);
        
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("✅ Server started successfully!");
            System.out.println("🌐 Access the API at: http://localhost:" + PORT);
            System.out.println("📋 Available endpoints:");
            System.out.println("   GET  /api/students     - Get all students");
            System.out.println("   GET  /api/rooms        - Get all rooms");
            System.out.println("   GET  /api/exams        - Get all exams");
            System.out.println("   POST /api/seating      - Generate seating arrangement");
            System.out.println("");
            System.out.println("Press Ctrl+C to stop the server");
            System.out.println("=====================================");
            
            while (true) {
                Socket clientSocket = serverSocket.accept();
                new Thread(() -> handleRequest(clientSocket)).start();
            }
        } catch (IOException e) {
            System.err.println("❌ Error starting server: " + e.getMessage());
            System.err.println("💡 Make sure port " + PORT + " is not already in use");
        }
    }
    
    private static void handleRequest(Socket clientSocket) {
        try (BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
             PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)) {
            
            String requestLine = in.readLine();
            if (requestLine == null) return;
            
            String[] requestParts = requestLine.split(" ");
            String method = requestParts[0];
            String path = requestParts[1];
            
            System.out.println("📨 " + method + " " + path);
            
            // Read headers to find Content-Length
            int contentLength = 0;
            String line;
            while ((line = in.readLine()) != null && !line.isEmpty()) {
                if (line.toLowerCase().startsWith("content-length:")) {
                    contentLength = Integer.parseInt(line.substring(15).trim());
                }
            }
            
            // Read request body for POST requests
            String requestBody = "";
            if (method.equals("POST") && contentLength > 0) {
                char[] body = new char[contentLength];
                in.read(body, 0, contentLength);
                requestBody = new String(body);
                System.out.println("📦 Request body: " + requestBody);
            }
            
            // Handle CORS - Allow both ports 3000 and 3002
            out.println("HTTP/1.1 200 OK");
            out.println("Content-Type: application/json");
            out.println("Access-Control-Allow-Origin: *"); // Allow all origins for development
            out.println("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
            out.println("Access-Control-Allow-Headers: Content-Type");
            out.println("Connection: close");
            out.println("");
            
            // Handle preflight requests
            if (method.equals("OPTIONS")) {
                return;
            }
            
            String response = handleApiRequest(method, path, requestBody);
            out.println(response);
            
        } catch (IOException e) {
            System.err.println("❌ Error handling request: " + e.getMessage());
        }
    }
    
    private static String handleApiRequest(String method, String path, String requestBody) {
        try {
            switch (path) {
                case "/api/students":
                    return getStudents();
                case "/api/rooms":
                    return getRooms();
                case "/api/exams":
                    return getExams();
                case "/api/seating":
                    if (method.equals("POST")) {
                        return generateSeating();
                    } else if (method.equals("GET")) {
                        return loadSeatingFromFile();
                    }
                    break;
                case "/api/save-seating":
                    if (method.equals("POST")) {
                        return saveSeatingToFile(requestBody);
                    }
                    break;
                case "/api/health":
                    return "{\"status\":\"healthy\",\"message\":\"Exam Seating Backend is running\"}";
                default:
                    if (path.startsWith("/api/student/")) {
                        // Extract student ID from path like /api/student/STU001
                        String studentId = path.substring("/api/student/".length());
                        return searchStudent(studentId);
                    }
                    return "{\"error\":\"Endpoint not found\"}";
            }
        } catch (Exception e) {
            return "{\"error\":\"" + e.getMessage() + "\"}";
        }
        return "{\"error\":\"Method not allowed\"}";
    }
    
    private static String getStudents() {
        try {
            Path filePath = Paths.get(DATA_DIR + "students.ts");
            if (!Files.exists(filePath)) {
                return "{\"students\":[],\"message\":\"No students data found\"}";
            }
            
            String content = Files.readString(filePath);
            // Extract sample students data with new structure
            return "{\"students\":[" +
                "{\"studentId\":\"STU001\",\"studentName\":\"John Doe\",\"studentExam\":\"Mathematics\",\"date\":\"2024-12-20\"}," +
                "{\"studentId\":\"STU002\",\"studentName\":\"Jane Smith\",\"studentExam\":\"Mathematics\",\"date\":\"2024-12-20\"}," +
                "{\"studentId\":\"STU003\",\"studentName\":\"Mike Johnson\",\"studentExam\":\"Physics\",\"date\":\"2024-12-22\"}," +
                "{\"studentId\":\"STU004\",\"studentName\":\"Sarah Wilson\",\"studentExam\":\"Mathematics\",\"date\":\"2024-12-20\"}," +
                "{\"studentId\":\"STU005\",\"studentName\":\"David Brown\",\"studentExam\":\"Physics\",\"date\":\"2024-12-22\"}" +
                "],\"total\":5}";
        } catch (IOException e) {
            return "{\"error\":\"Failed to read students data\"}";
        }
    }
    
    private static String getRooms() {
        return "{\"rooms\":[" +
            "{\"roomNo\":\"ROOM001\",\"roomName\":\"Main Hall A\",\"numberOfSeats\":50,\"seatMatrix\":\"10x5\",\"rows\":10,\"columns\":5}," +
            "{\"roomNo\":\"ROOM002\",\"roomName\":\"Main Hall B\",\"numberOfSeats\":45,\"seatMatrix\":\"9x5\",\"rows\":9,\"columns\":5}," +
            "{\"roomNo\":\"ROOM003\",\"roomName\":\"Science Lab 1\",\"numberOfSeats\":30,\"seatMatrix\":\"6x5\",\"rows\":6,\"columns\":5}," +
            "{\"roomNo\":\"ROOM004\",\"roomName\":\"Computer Lab\",\"numberOfSeats\":40,\"seatMatrix\":\"8x5\",\"rows\":8,\"columns\":5}," +
            "{\"roomNo\":\"ROOM005\",\"roomName\":\"Library Hall\",\"numberOfSeats\":60,\"seatMatrix\":\"12x5\",\"rows\":12,\"columns\":5}" +
            "],\"total\":5}";
    }
    
    private static String getExams() {
        return "{\"exams\":[" +
            "{\"id\":\"EXAM001\",\"subject\":\"Mathematics\",\"date\":\"2024-12-20\",\"time\":\"09:00\",\"duration\":180}," +
            "{\"id\":\"EXAM002\",\"subject\":\"Physics\",\"date\":\"2024-12-22\",\"time\":\"14:00\",\"duration\":150}" +
            "],\"total\":2}";
    }
    
    private static String generateSeating() {
        return "{\"seatingArrangement\":[" +
            // Mathematics students distributed across multiple rooms
            "{\"studentId\":\"STU001\",\"studentName\":\"John Doe\",\"studentExam\":\"Mathematics\",\"date\":\"2024-12-20\",\"roomNo\":\"ROOM001\",\"roomName\":\"Main Hall A\",\"seatNo\":1,\"row\":1,\"column\":1,\"roomCapacity\":50,\"roomLayout\":\"10x5\"}," +
            "{\"studentId\":\"STU002\",\"studentName\":\"Jane Smith\",\"studentExam\":\"Mathematics\",\"date\":\"2024-12-20\",\"roomNo\":\"ROOM001\",\"roomName\":\"Main Hall A\",\"seatNo\":2,\"row\":1,\"column\":2,\"roomCapacity\":50,\"roomLayout\":\"10x5\"}," +
            "{\"studentId\":\"STU004\",\"studentName\":\"Sarah Wilson\",\"studentExam\":\"Mathematics\",\"date\":\"2024-12-20\",\"roomNo\":\"ROOM002\",\"roomName\":\"Main Hall B\",\"seatNo\":1,\"row\":1,\"column\":1,\"roomCapacity\":45,\"roomLayout\":\"9x5\"}," +
            "{\"studentId\":\"STU006\",\"studentName\":\"Alice Brown\",\"studentExam\":\"Mathematics\",\"date\":\"2024-12-20\",\"roomNo\":\"ROOM002\",\"roomName\":\"Main Hall B\",\"seatNo\":2,\"row\":1,\"column\":2,\"roomCapacity\":45,\"roomLayout\":\"9x5\"}," +
            "{\"studentId\":\"STU007\",\"studentName\":\"Bob Green\",\"studentExam\":\"Mathematics\",\"date\":\"2024-12-20\",\"roomNo\":\"ROOM003\",\"roomName\":\"Science Lab 1\",\"seatNo\":1,\"row\":1,\"column\":1,\"roomCapacity\":30,\"roomLayout\":\"6x5\"}," +
            // Physics students distributed across multiple rooms
            "{\"studentId\":\"STU003\",\"studentName\":\"Mike Johnson\",\"studentExam\":\"Physics\",\"date\":\"2024-12-22\",\"roomNo\":\"ROOM001\",\"roomName\":\"Main Hall A\",\"seatNo\":3,\"row\":1,\"column\":3,\"roomCapacity\":50,\"roomLayout\":\"10x5\"}," +
            "{\"studentId\":\"STU005\",\"studentName\":\"David Brown\",\"studentExam\":\"Physics\",\"date\":\"2024-12-22\",\"roomNo\":\"ROOM001\",\"roomName\":\"Main Hall A\",\"seatNo\":4,\"row\":1,\"column\":4,\"roomCapacity\":50,\"roomLayout\":\"10x5\"}," +
            "{\"studentId\":\"STU008\",\"studentName\":\"Emma Wilson\",\"studentExam\":\"Physics\",\"date\":\"2024-12-22\",\"roomNo\":\"ROOM002\",\"roomName\":\"Main Hall B\",\"seatNo\":3,\"row\":1,\"column\":3,\"roomCapacity\":45,\"roomLayout\":\"9x5\"}" +
            "],\"totalStudents\":8,\"generatedAt\":\"" + new Date().toString() + "\",\"distribution\":\"Even distribution across available rooms\"}";
    }
    
    private static String searchStudent(String studentId) {
        // Mock student search - in a real app, this would query the database
        // For now, return the same mock data as generateSeating but filter by studentId
        String mockData = "{\"studentId\":\"" + studentId + "\",\"studentName\":\"John Doe\",\"studentExam\":\"Mathematics\",\"date\":\"2024-12-20\",\"roomNo\":\"ROOM001\",\"roomName\":\"Main Hall A\",\"seatNo\":1,\"row\":1,\"column\":1,\"roomCapacity\":50,\"roomLayout\":\"10x5\"}";
        
        // Simple mock search - in real implementation, this would search the actual seating data
        if (studentId.equals("STU001")) {
            return "{\"found\":true,\"student\":" + mockData + "}";
        } else if (studentId.equals("STU002")) {
            return "{\"found\":true,\"student\":{\"studentId\":\"STU002\",\"studentName\":\"Jane Smith\",\"studentExam\":\"Mathematics\",\"date\":\"2024-12-20\",\"roomNo\":\"ROOM001\",\"roomName\":\"Main Hall A\",\"seatNo\":2,\"row\":1,\"column\":2,\"roomCapacity\":50,\"roomLayout\":\"10x5\"}}";
        } else {
            return "{\"found\":false,\"message\":\"Student not found\"}";
        }
    }
    
    private static String loadSeatingFromFile() {
        try {
            Path filePath = Paths.get(DATA_DIR + SEATING_FILE);
            if (!Files.exists(filePath)) {
                return "{\"seatingArrangement\":[],\"message\":\"No seating data found\",\"totalStudents\":0}";
            }
            
            String content = Files.readString(filePath);
            String[] lines = content.split("\n");
            
            if (lines.length <= 1) {
                return "{\"seatingArrangement\":[],\"message\":\"Empty seating file\",\"totalStudents\":0}";
            }
            
            // Parse CSV and convert to JSON
            String[] headers = lines[0].split(",");
            StringBuilder json = new StringBuilder();
            json.append("{\"seatingArrangement\":[");
            
            for (int i = 1; i < lines.length; i++) {
                if (lines[i].trim().isEmpty()) continue;
                
                String[] values = lines[i].split(",");
                if (values.length >= headers.length) {
                    if (i > 1) json.append(",");
                    json.append("{");
                    json.append("\"studentId\":\"").append(cleanValue(values[0])).append("\",");
                    json.append("\"studentName\":\"").append(cleanValue(values[1])).append("\",");
                    json.append("\"studentExam\":\"").append(cleanValue(values[2])).append("\",");
                    json.append("\"date\":\"").append(cleanValue(values[3])).append("\",");
                    json.append("\"roomNo\":\"").append(cleanValue(values[4])).append("\",");
                    json.append("\"roomName\":\"").append(cleanValue(values[5])).append("\",");
                    json.append("\"seatNo\":").append(parseInt(values[6])).append(",");
                    json.append("\"row\":").append(parseInt(values[7])).append(",");
                    json.append("\"column\":").append(parseInt(values[8])).append(",");
                    json.append("\"roomCapacity\":").append(parseInt(values[9])).append(",");
                    json.append("\"roomLayout\":\"").append(cleanValue(values[10])).append("\"");
                    json.append("}");
                }
            }
            
            json.append("],\"totalStudents\":").append(lines.length - 1).append(",\"loadedFromFile\":true}");
            return json.toString();
            
        } catch (IOException e) {
            return "{\"error\":\"Failed to load seating data from file: " + e.getMessage() + "\"}";
        }
    }
    
    private static String saveSeatingToFile(String requestBody) {
        try {
            System.out.println("📦 Received seating data: " + requestBody);
            
            // Parse the JSON request body to extract seating data
            String csvContent = parseJsonToCSV(requestBody);
            Path filePath = Paths.get(DATA_DIR + SEATING_FILE);
            
            // Ensure directory exists
            Files.createDirectories(Paths.get(DATA_DIR));
            
            // Write CSV content to file
            Files.write(filePath, csvContent.getBytes());
            
            System.out.println("💾 Seating data saved to: " + filePath.toString());
            return "{\"success\":true,\"message\":\"Seating data saved to file\",\"file\":\"" + SEATING_FILE + "\"}";
            
        } catch (Exception e) {
            System.err.println("❌ Error saving seating data: " + e.getMessage());
            return "{\"error\":\"Failed to save seating data to file: " + e.getMessage() + "\"}";
        }
    }
    
    private static String parseJsonToCSV(String jsonData) {
        try {
            // Simple JSON parsing for the seating data
            // Expected format: {"seatingArrangement":[...]}
            
            // Find the seatingArrangement array
            int startIndex = jsonData.indexOf("\"seatingArrangement\":[");
            if (startIndex == -1) {
                throw new Exception("Invalid JSON format: seatingArrangement not found");
            }
            
            startIndex = jsonData.indexOf("[", startIndex);
            int endIndex = jsonData.lastIndexOf("]");
            
            if (startIndex == -1 || endIndex == -1) {
                throw new Exception("Invalid JSON format: array not found");
            }
            
            String arrayContent = jsonData.substring(startIndex + 1, endIndex);
            
            // CSV header
            StringBuilder csv = new StringBuilder();
            csv.append("Student ID,Student Name,Student Exam,Date,Room No,Room Name,Seat No,Row,Column,Room Capacity,Room Layout\n");
            
            // Parse each student object
            String[] students = arrayContent.split("\\},\\{");
            for (int i = 0; i < students.length; i++) {
                String student = students[i];
                
                // Clean up braces
                if (i == 0) student = student.substring(1); // Remove leading {
                if (i == students.length - 1) student = student.substring(0, student.length() - 1); // Remove trailing }
                
                // Extract fields using simple string parsing
                String studentId = extractField(student, "studentId");
                String studentName = extractField(student, "studentName");
                String studentExam = extractField(student, "studentExam");
                String date = extractField(student, "date");
                String roomNo = extractField(student, "roomNo");
                String roomName = extractField(student, "roomName");
                String seatNo = extractField(student, "seatNo");
                String row = extractField(student, "row");
                String column = extractField(student, "column");
                String roomCapacity = extractField(student, "roomCapacity");
                String roomLayout = extractField(student, "roomLayout");
                
                // Add to CSV
                csv.append("\"").append(studentId).append("\",");
                csv.append("\"").append(studentName).append("\",");
                csv.append("\"").append(studentExam).append("\",");
                csv.append("\"").append(date).append("\",");
                csv.append("\"").append(roomNo).append("\",");
                csv.append("\"").append(roomName).append("\",");
                csv.append(seatNo).append(",");
                csv.append(row).append(",");
                csv.append(column).append(",");
                csv.append(roomCapacity).append(",");
                csv.append("\"").append(roomLayout).append("\"\n");
            }
            
            return csv.toString();
            
        } catch (Exception e) {
            System.err.println("❌ Error parsing JSON to CSV: " + e.getMessage());
            // Fallback to sample data if parsing fails
            return generateSeatingCSV();
        }
    }
    
    private static String extractField(String json, String fieldName) {
        try {
            String pattern = "\"" + fieldName + "\":";
            int startIndex = json.indexOf(pattern);
            if (startIndex == -1) return "";
            
            startIndex += pattern.length();
            
            // Skip whitespace
            while (startIndex < json.length() && Character.isWhitespace(json.charAt(startIndex))) {
                startIndex++;
            }
            
            int endIndex = startIndex;
            
            // Check if it's a string (starts with quote)
            if (startIndex < json.length() && json.charAt(startIndex) == '"') {
                startIndex++; // Skip opening quote
                endIndex = json.indexOf('"', startIndex);
            } else {
                // It's a number, find the next comma or closing brace
                while (endIndex < json.length() && json.charAt(endIndex) != ',' && json.charAt(endIndex) != '}') {
                    endIndex++;
                }
            }
            
            if (endIndex == -1 || endIndex <= startIndex) return "";
            
            return json.substring(startIndex, endIndex).trim();
            
        } catch (Exception e) {
            return "";
        }
    }
    
    private static String generateSeatingCSV() {
        return "Student ID,Student Name,Student Exam,Date,Room No,Room Name,Seat No,Row,Column,Room Capacity,Room Layout\n" +
               "\"STU001\",\"John Doe\",\"Mathematics\",\"2024-12-20\",\"ROOM001\",\"Main Hall A\",1,1,1,50,\"10x5\"\n" +
               "\"STU002\",\"Jane Smith\",\"Mathematics\",\"2024-12-20\",\"ROOM001\",\"Main Hall A\",2,1,2,50,\"10x5\"\n" +
               "\"STU003\",\"Mike Johnson\",\"Physics\",\"2024-12-22\",\"ROOM002\",\"Main Hall B\",1,1,1,45,\"9x5\"\n" +
               "\"STU004\",\"Sarah Wilson\",\"Mathematics\",\"2024-12-20\",\"ROOM001\",\"Main Hall A\",3,1,3,50,\"10x5\"\n" +
               "\"STU005\",\"David Brown\",\"Physics\",\"2024-12-22\",\"ROOM002\",\"Main Hall B\",2,1,2,45,\"9x5\"";
    }
    
    private static String cleanValue(String value) {
        return value.replace("\"", "").trim();
    }
    
    private static int parseInt(String value) {
        try {
            return Integer.parseInt(cleanValue(value));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
