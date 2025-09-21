# Exam Seating Arrangement System - Complete Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Project Structure](#project-structure)
3. [Core Functionalities](#core-functionalities)
4. [Installation & Setup](#installation--setup)
5. [User Guide](#user-guide)
6. [Technical Details](#technical-details)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

The **Exam Seating Arrangement System** is a web-based application designed to automatically generate and manage examination seating arrangements for educational institutions. It helps prevent cheating, saves teachers' time, and ensures fair distribution of students across examination halls.

### Key Features
- **Smart Seating Algorithm**: Groups students by exam and distributes them evenly across available rooms
- **CSV Data Management**: Upload student and room data via Excel/CSV files
- **Real-time Room View**: Visual representation of room layouts and student assignments
- **Student Portal**: Students can search for their assigned seats
- **Data Persistence**: Server-side CSV storage ensures data survives page refreshes
- **Responsive Design**: Works on desktop and mobile devices

---

## 📁 Project Structure

```
exam-seating/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page with navigation
│   │   ├── admin/
│   │   │   └── page.tsx              # Admin dashboard (main interface)
│   │   ├── student/
│   │   │   └── page.tsx              # Student portal for seat lookup
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   └── RoomLayout.tsx            # Visual room layout component
│   ├── data/
│   │   ├── students.ts               # Student data management
│   │   ├── rooms.ts                  # Room data management
│   │   ├── exams.ts                  # Exam data management
│   │   ├── smartSeating.ts           # Core seating algorithm
│   │   ├── seatingStorage.ts         # Local storage utilities
│   │   ├── templates/                # CSV templates for data upload
│   │   │   ├── students_template.csv
│   │   │   └── rooms_template.csv
│   │   └── seating_arrangement.csv   # Generated seating data (auto-created)
│   ├── services/
│   │   └── serverStorage.ts          # Backend communication
│   └── utils/
│       └── csvUtils.ts               # CSV import/export utilities
├── backend/
│   └── SimpleBackend.java            # Java HTTP server
├── uploadData/                       # Sample data files
│   ├── students_template.csv
│   └── rooms_template.csv
└── README.md
```

---

## ⚙️ Core Functionalities

### 1. **Admin Dashboard** (`/admin`)
- **Upload Data Tab**: Upload student and room CSV files
- **Seating Tab**: Generate seating arrangements and view results
- **Room View Tab**: Visual representation of rooms with assigned students
- **Reports Tab**: Analytics and reporting (placeholder)

### 2. **Student Portal** (`/student`)
- Search for assigned seat by student ID
- View detailed seating information (room, seat, row, column)
- QR code generation for seat verification

### 3. **Smart Seating Algorithm**
- Groups students by exam and date
- Distributes students evenly across available rooms
- Prevents room capacity overflow
- Assigns seats based on room matrix (rows × columns)

### 4. **Data Management**
- **CSV Upload**: Import student and room data
- **Server Storage**: Automatic saving to CSV files
- **Data Persistence**: Data survives page refreshes and server restarts

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **Java** (v11 or higher)
- **Git** (for cloning the repository)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd exam-seating
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Start the Backend Server
```bash
cd backend
javac SimpleBackend.java
java SimpleBackend
```
The backend will start on `http://localhost:8080`

### Step 4: Start the Frontend
```bash
npm run dev
```
The frontend will start on `http://localhost:3000` (or 3002 if 3000 is occupied)

### Step 5: Access the Application
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Student Portal**: `http://localhost:3000/student`
- **Landing Page**: `http://localhost:3000`

---

## 👥 User Guide

### For Administrators

#### 1. **Upload Data**
1. Navigate to the **Admin Dashboard**
2. Go to the **"Upload Data"** tab
3. **Upload Students Data**:
   - Click "Choose File" under "Upload Students Data"
   - Select your CSV file with columns: `Student ID`, `Student Name`, `Student Exam`, `Date`
   - Click "Upload Students"
4. **Upload Rooms Data**:
   - Click "Choose File" under "Upload Rooms Data"
   - Select your CSV file with columns: `Room No`, `Room Name`, `Number of Seats`, `Seat Matrix (Rows x Columns)`
   - Click "Upload Rooms"

#### 2. **Generate Seating Arrangement**
1. Go to the **"Seating"** tab
2. Click **"Generate Seating"** button
3. The system will:
   - Group students by exam
   - Distribute them evenly across rooms
   - Assign specific seats (row, column)
   - Save data to server automatically

#### 3. **View Room Assignments**
1. Go to the **"Room View"** tab
2. See all rooms with assigned students
3. Click on any room card to view:
   - List of students in that room
   - Visual room layout
   - Seat assignments

#### 4. **Export/Import Data**
- **Export**: Click "📄 Export to CSV" to download seating data
- **Import**: Click "📥 Import CSV" to load previously saved data

### For Students

#### 1. **Find Your Seat**
1. Go to the **Student Portal** (`http://localhost:3000/student`)
2. Enter your **Student ID**
3. Click **"Search"**
4. View your assigned:
   - Room number and name
   - Seat number
   - Row and column position
   - QR code for verification

---

## 🔧 Technical Details

### Frontend Architecture
- **Framework**: Next.js 15.5.3 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React hooks (useState, useEffect)

### Backend Architecture
- **Language**: Java (no external dependencies)
- **Server**: Custom HTTP server
- **Data Storage**: CSV files
- **CORS**: Configured for cross-origin requests

### Data Flow
1. **Upload**: CSV files → Frontend parsing → State management
2. **Generation**: Student/Room data → Smart algorithm → Seating arrangement
3. **Storage**: Seating data → Server API → CSV file
4. **Retrieval**: CSV file → Server API → Frontend display

### Key Algorithms

#### Smart Seating Algorithm
```typescript
1. Group students by exam and date
2. Sort rooms by capacity (largest first)
3. Calculate optimal distribution across rooms
4. Assign students to rooms proportionally
5. Calculate row/column based on room matrix
6. Validate capacity constraints
```

---

## 🌐 API Endpoints

### Backend Endpoints (`http://localhost:8080/api/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/seating` | GET | Load seating data from CSV file |
| `/save-seating` | POST | Save seating data to CSV file |
| `/student/{id}` | GET | Search for specific student |
| `/health` | GET | Check server status |

### Example API Calls

#### Load Seating Data
```bash
curl http://localhost:8080/api/seating
```

#### Save Seating Data
```bash
curl -X POST http://localhost:8080/api/save-seating \
  -H "Content-Type: application/json" \
  -d '{"seatingArrangement":[...]}'
```

---

## 📊 Data Formats

### Student CSV Format
```csv
Student ID,Student Name,Student Exam,Date
STU001,John Doe,Mathematics,2024-12-20
STU002,Jane Smith,Physics,2024-12-22
```

### Room CSV Format
```csv
Room No,Room Name,Number of Seats,Seat Matrix (Rows x Columns)
ROOM001,Main Hall A,50,10x5
ROOM002,Main Hall B,45,9x5
```

### Generated Seating CSV Format
```csv
Student ID,Student Name,Student Exam,Date,Room No,Room Name,Seat No,Row,Column,Room Capacity,Room Layout
STU001,John Doe,Mathematics,2024-12-20,ROOM001,Main Hall A,1,1,1,50,10x5
```

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. **"Failed to fetch" Error**
- **Cause**: Backend not running or CORS issues
- **Solution**: 
  - Ensure backend is running on port 8080
  - Check if frontend is on port 3000 or 3002
  - Restart both frontend and backend

#### 2. **Port Already in Use**
- **Cause**: Another process using port 3000
- **Solution**: Next.js will automatically use port 3002

#### 3. **No Seating Data Found**
- **Cause**: No data uploaded or generated
- **Solution**: 
  - Upload student and room data first
  - Generate seating arrangement
  - Check if CSV files exist in `src/data/`

#### 4. **Java Compilation Error**
- **Cause**: Java not installed or wrong version
- **Solution**: 
  - Install Java 11 or higher
  - Check with `java -version`
  - Ensure `javac` command is available

### Debug Steps
1. Check browser console for errors
2. Verify backend is running: `curl http://localhost:8080/api/health`
3. Check CSV files in `src/data/` directory
4. Restart both frontend and backend servers

---

## 🔮 Future Enhancements

- **Database Integration**: Replace CSV files with proper database
- **QR Code Scanning**: Mobile app for seat verification
- **Real-time Updates**: WebSocket for live updates
- **Advanced Analytics**: Detailed reporting and statistics
- **Multi-language Support**: Internationalization
- **Role-based Access**: Different user roles and permissions

---

## 📞 Support

For technical support or questions:
1. Check this documentation first
2. Review the troubleshooting section
3. Check browser console for error messages
4. Verify all prerequisites are installed

---

## 📄 License

This project is developed for educational purposes. Please ensure compliance with your institution's policies when using this system.

---

*Last Updated: December 2024*
*Version: 1.0.0*
