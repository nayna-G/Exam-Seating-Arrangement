# Exam Seating Arrangement System - Project Structure

## Visual Project Structure

```
nayana/
├── README.md                          # 📋 Main project documentation
├── PROJECT_STRUCTURE.md               # 📁 This file - project structure guide
├── exam-seating/                      # 🎯 Main project directory
│   ├── src/
│   │   ├── app/                       # 🌐 Next.js Frontend
│   │   │   ├── admin/                 # 👨‍💼 Admin interface
│   │   │   │   └── page.tsx          # Admin dashboard
│   │   │   ├── student/               # 👨‍🎓 Student interface
│   │   │   │   └── page.tsx          # Student portal
│   │   │   ├── api/                   # 🔌 API routes (Next.js)
│   │   │   ├── components/            # 🧩 Reusable UI components
│   │   │   ├── globals.css            # 🎨 Global styles
│   │   │   ├── layout.tsx             # 📐 Root layout
│   │   │   └── page.tsx               # 🏠 Home page
│   │   └── data/                      # 💾 Data Storage (File-based)
│   │       ├── students.ts            # 👥 Student data & management
│   │       ├── rooms.ts               # 🏢 Room data & management
│   │       ├── exams.ts               # 📝 Exam data & management
│   │       ├── seating.ts             # 🪑 Seating arrangements
│   │       └── config.ts              # ⚙️ System configuration
│   ├── backend/                       # ☕ Java Backend
│   │   ├── src/main/java/com/examseating/
│   │   │   ├── ExamSeatingApplication.java  # 🚀 Main application class
│   │   │   ├── model/                 # 📊 Data models
│   │   │   │   └── Student.java       # Student entity
│   │   │   ├── service/               # 🔧 Business logic
│   │   │   │   └── SeatingAlgorithmService.java  # Core seating algorithm
│   │   │   ├── controller/            # 🎮 REST controllers
│   │   │   ├── repository/            # 🗄️ Data access layer
│   │   │   └── config/                # ⚙️ Configuration classes
│   │   ├── src/main/resources/        # 📁 Resources
│   │   │   ├── application.properties # 🔧 Application config
│   │   │   └── static/                # 📄 Static files
│   │   ├── pom.xml                    # 📦 Maven configuration
│   │   └── target/                    # 🎯 Compiled output
│   ├── public/                        # 🌍 Static assets
│   │   ├── next.svg                   # Next.js logo
│   │   ├── vercel.svg                 # Vercel logo
│   │   └── ...                        # Other static files
│   ├── package.json                   # 📦 Node.js dependencies
│   ├── tsconfig.json                  # 🔧 TypeScript configuration
│   ├── next.config.ts                 # ⚙️ Next.js configuration
│   ├── tailwind.config.js             # 🎨 Tailwind CSS config
│   └── README.md                      # 📖 Frontend documentation
└── docs/                              # 📚 Additional documentation
    ├── api/                           # 🔌 API documentation
    ├── user-guide/                    # 📖 User manuals
    └── technical/                     # 🔧 Technical specifications
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    Exam Seating System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   Frontend      │    │   Backend       │    │   Data       │ │
│  │   (Next.js)     │◄──►│   (Java)        │◄──►│   (Files)    │ │
│  │                 │    │                 │    │              │ │
│  │ • Admin Panel   │    │ • REST APIs     │    │ • students.ts│ │
│  │ • Student Portal│    │ • Business Logic│    │ • rooms.ts   │ │
│  │ • Components    │    │ • Algorithms    │    │ • exams.ts   │ │
│  │ • API Routes    │    │ • Validation    │    │ • seating.ts │ │
│  └─────────────────┘    └─────────────────┘    │ • config.ts  │ │
│                                                 └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Admin     │    │  Frontend   │    │  Backend    │    │   Data      │
│  Inputs     │───►│  (Next.js)  │───►│  (Java)     │───►│  Storage    │
│             │    │             │    │             │    │             │
│ • Students  │    │ • Forms     │    │ • APIs      │    │ • Files     │
│ • Rooms     │    │ • Validation│    │ • Logic     │    │ • JSON      │
│ • Exams     │    │ • UI/UX     │    │ • Algorithm │    │ • TypeScript│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Student    │    │  Seating    │    │  Generated  │    │  Persistent │
│  Queries    │◄───│  Charts     │◄───│  Arrangements│◄───│  Storage    │
│             │    │             │    │             │    │             │
│ • Seat Info │    │ • Visual    │    │ • Optimized │    │ • Backup    │
│ • QR Codes  │    │ • Reports   │    │ • Fair      │    │ • History   │
│ • Schedules │    │ • Export    │    │ • Random    │    │ • Audit     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Technology Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Technology Stack                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (Next.js)          Backend (Java)        Data Layer   │
│  ┌─────────────────┐        ┌─────────────────┐    ┌──────────┐ │
│  │ • React 19.1.0  │        │ • Java 11+      │    │ • Files  │ │
│  │ • Next.js 15.5.3│        │ • Spring Boot   │    │ • JSON   │ │
│  │ • TypeScript    │        │ • Maven         │    │ • TS     │ │
│  │ • Tailwind CSS  │        │ • REST APIs     │    │ • Excel  │ │
│  │ • Responsive UI │        │ • Security      │    │ • Backup │ │
│  └─────────────────┘        └─────────────────┘    └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Development Workflow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Development │    │   Testing   │    │   Build     │    │ Deployment  │
│             │    │             │    │             │    │             │
│ • Code      │───►│ • Unit      │───►│ • Frontend  │───►│ • Frontend  │
│ • Features  │    │ • Integration│    │ • Backend   │    │ • Backend   │
│ • UI/UX     │    │ • E2E       │    │ • Assets    │    │ • Database  │
│ • APIs      │    │ • Manual    │    │ • Config    │    │ • Config    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## File Responsibilities

### Frontend Files (`src/app/`)
- **`admin/page.tsx`**: Administrator dashboard and management interface
- **`student/page.tsx`**: Student portal for viewing seating information
- **`api/`**: Next.js API routes for frontend-backend communication
- **`components/`**: Reusable UI components (buttons, forms, tables, etc.)

### Backend Files (`backend/src/main/java/`)
- **`ExamSeatingApplication.java`**: Main Spring Boot application entry point
- **`model/`**: JPA entities representing data structures
- **`service/`**: Business logic and core algorithms
- **`controller/`**: REST API endpoints
- **`repository/`**: Data access layer (if using database)

### Data Files (`src/data/`)
- **`students.ts`**: Student data management and CRUD operations
- **`rooms.ts`**: Room information and capacity management
- **`exams.ts`**: Exam scheduling and management
- **`seating.ts`**: Seating arrangement generation and storage
- **`config.ts`**: System configuration and settings

### Configuration Files
- **`package.json`**: Node.js dependencies and scripts
- **`pom.xml`**: Maven dependencies and build configuration
- **`tsconfig.json`**: TypeScript compiler configuration
- **`next.config.ts`**: Next.js framework configuration

## Key Features by Module

### Admin Module
- ✅ Student management (CRUD operations)
- ✅ Room configuration and capacity management
- ✅ Exam scheduling and planning
- ✅ Seating arrangement generation
- ✅ Report generation and export
- ✅ System configuration and settings

### Student Module
- ✅ Seat lookup and verification
- ✅ Exam information display
- ✅ QR code generation and scanning
- ✅ Mobile-responsive interface
- ✅ Historical seating data

### Seating Algorithm
- ✅ Random and fair distribution
- ✅ Special requirements handling
- ✅ Room capacity optimization
- ✅ Conflict prevention
- ✅ Performance optimization

### Data Management
- ✅ Type-safe data structures
- ✅ CRUD operations for all entities
- ✅ Data validation and error handling
- ✅ Import/export capabilities
- ✅ Backup and recovery

## Getting Started Commands

```bash
# Frontend Development
cd exam-seating
npm install
npm run dev

# Backend Development
cd exam-seating/backend
mvn clean install
mvn spring-boot:run

# Access Points
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# Admin: http://localhost:3000/admin
# Student: http://localhost:3000/student
```

This structure provides a clear separation of concerns, making the system maintainable, scalable, and easy to understand for both developers and users.
