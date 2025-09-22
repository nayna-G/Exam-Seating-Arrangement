package com.examseating.model;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

/**
 * SeatingArrangement entity representing a complete seating arrangement for an exam
 */
@Entity
@Table(name = "seating_arrangements")
public class SeatingArrangement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Exam ID is required")
    private Long examId;
    
    @Min(value = 0, message = "Total students cannot be negative")
    private Integer totalStudents;
    
    @Min(value = 0, message = "Total rooms cannot be negative")
    private Integer totalRooms;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date generatedAt;
    
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "arrangement_id")
    private List<SeatingAssignment> assignments;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public SeatingArrangement() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.generatedAt = new Date();
    }
    
    public SeatingArrangement(Long examId, Integer totalStudents, Integer totalRooms) {
        this();
        this.examId = examId;
        this.totalStudents = totalStudents;
        this.totalRooms = totalRooms;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getExamId() {
        return examId;
    }
    
    public void setExamId(Long examId) {
        this.examId = examId;
    }
    
    public Integer getTotalStudents() {
        return totalStudents;
    }
    
    public void setTotalStudents(Integer totalStudents) {
        this.totalStudents = totalStudents;
    }
    
    public Integer getTotalRooms() {
        return totalRooms;
    }
    
    public void setTotalRooms(Integer totalRooms) {
        this.totalRooms = totalRooms;
    }
    
    public Date getGeneratedAt() {
        return generatedAt;
    }
    
    public void setGeneratedAt(Date generatedAt) {
        this.generatedAt = generatedAt;
    }
    
    public List<SeatingAssignment> getAssignments() {
        return assignments;
    }
    
    public void setAssignments(List<SeatingAssignment> assignments) {
        this.assignments = assignments;
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
        return "SeatingArrangement{" +
                "id=" + id +
                ", examId=" + examId +
                ", totalStudents=" + totalStudents +
                ", totalRooms=" + totalRooms +
                ", generatedAt=" + generatedAt +
                ", assignments=" + (assignments != null ? assignments.size() + " assignments" : "null") +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
