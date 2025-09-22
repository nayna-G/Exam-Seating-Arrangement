package com.examseating.model;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * SeatingAssignment entity representing a student's seat assignment
 */
@Entity
@Table(name = "seating_assignments")
public class SeatingAssignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    @NotBlank(message = "Room ID is required")
    private String roomId;
    
    @Min(value = 1, message = "Seat number must be at least 1")
    private Integer seatNumber;
    
    @Min(value = 1, message = "Row must be at least 1")
    private Integer row;
    
    @Min(value = 1, message = "Column must be at least 1")
    private Integer column;
    
    private String qrCode;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public SeatingAssignment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public SeatingAssignment(String studentId, String roomId, Integer seatNumber, Integer row, Integer column) {
        this();
        this.studentId = studentId;
        this.roomId = roomId;
        this.seatNumber = seatNumber;
        this.row = row;
        this.column = column;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getStudentId() {
        return studentId;
    }
    
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
    
    public String getRoomId() {
        return roomId;
    }
    
    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }
    
    public Integer getSeatNumber() {
        return seatNumber;
    }
    
    public void setSeatNumber(Integer seatNumber) {
        this.seatNumber = seatNumber;
    }
    
    public Integer getRow() {
        return row;
    }
    
    public void setRow(Integer row) {
        this.row = row;
    }
    
    public Integer getColumn() {
        return column;
    }
    
    public void setColumn(Integer column) {
        this.column = column;
    }
    
    public String getQrCode() {
        return qrCode;
    }
    
    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "SeatingAssignment{" +
                "id=" + id +
                ", studentId='" + studentId + '\'' +
                ", roomId='" + roomId + '\'' +
                ", seatNumber=" + seatNumber +
                ", row=" + row +
                ", column=" + column +
                ", qrCode='" + qrCode + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
