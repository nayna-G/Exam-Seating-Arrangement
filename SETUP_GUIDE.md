# Exam Seating System - Setup Guide

## Prerequisites

Before setting up the Exam Seating Arrangement System, ensure you have the following installed:

### Required Software
- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Java** (version 11 or higher)
- **Maven** (for Java backend)

## Installation Steps

### 1. Install Node.js and npm
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Or use package manager:
# Ubuntu/Debian: sudo apt install nodejs npm
# macOS: brew install node
# Windows: Download from nodejs.org
```

### 2. Install Java
```bash
# Check if Java is installed
java --version

# If not installed:
# Ubuntu/Debian: sudo apt install openjdk-11-jdk
# macOS: brew install openjdk@11
# Windows: Download from Oracle or OpenJDK
```

### 3. Install Maven
```bash
# Check if Maven is installed
mvn --version

# If not installed:
# Ubuntu/Debian: sudo apt install maven
# macOS: brew install maven
# Windows: Download from https://maven.apache.org/
```

### 4. Fix Dependency Issues (if encountered)
If you encounter dependency issues like the ones shown in the terminal:

```bash
# Fix broken dependencies
sudo apt --fix-broken install

# Update package lists
sudo apt update

# Upgrade packages
sudo apt upgrade

# Install Maven with dependencies
sudo apt install maven
```

## Alternative Setup Methods

### Method 1: Using SDKMAN (Recommended for Java/Maven)
```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java
sdk install java 11.0.19-tem

# Install Maven
sdk install maven 3.9.5
```

### Method 2: Using Docker (No local installation needed)
```bash
# Create a Dockerfile for the backend
# This avoids local Java/Maven installation issues
```

### Method 3: Frontend-Only Development
If you want to focus on frontend development first:

```bash
cd exam-seating
npm install
npm run dev
```

The frontend can work independently with mock data while you resolve backend setup issues.

## Project Setup

### 1. Clone and Navigate
```bash
cd /home/abhi/Documents/nayana/exam-seating
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at: http://localhost:3000
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Clean and install dependencies
mvn clean install

# Run the application
mvn spring-boot:run

# Access at: http://localhost:8080
```

## Troubleshooting

### Common Issues

#### 1. Maven Installation Issues
**Problem**: Dependency conflicts during Maven installation
**Solution**: 
```bash
# Remove conflicting packages
sudo apt remove rabbitmq-server
sudo apt autoremove

# Fix broken dependencies
sudo apt --fix-broken install

# Install Maven
sudo apt install maven
```

#### 2. Java Version Issues
**Problem**: Wrong Java version
**Solution**:
```bash
# Check available Java versions
sudo update-alternatives --list java

# Set default Java version
sudo update-alternatives --config java
```

#### 3. Port Already in Use
**Problem**: Port 3000 or 8080 already in use
**Solution**:
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :8080

# Kill process
sudo kill -9 <PID>
```

#### 4. Permission Issues
**Problem**: Permission denied errors
**Solution**:
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

## Development Workflow

### 1. Start Development Servers
```bash
# Terminal 1: Frontend
cd exam-seating
npm run dev

# Terminal 2: Backend
cd exam-seating/backend
mvn spring-boot:run
```

### 2. Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Admin Panel**: http://localhost:3000/admin
- **Student Portal**: http://localhost:3000/student

### 3. Development Tips
- Use the frontend first to understand the UI
- Backend can be developed later with mock data
- Check browser console for frontend errors
- Check terminal for backend errors

## Production Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Backend Deployment
```bash
# Build JAR file
mvn clean package

# Run JAR file
java -jar target/exam-seating-backend-1.0.0.jar
```

## File Structure Reminder
```
exam-seating/
├── src/app/          # Frontend (Next.js)
├── backend/          # Backend (Java/Spring Boot)
├── src/data/         # Data files (TypeScript)
└── package.json      # Frontend dependencies
```

## Getting Help

If you encounter issues:
1. Check the error messages carefully
2. Ensure all prerequisites are installed
3. Try the alternative setup methods
4. Start with frontend-only development
5. Gradually add backend functionality

## Quick Start (Frontend Only)
If you want to see the system working immediately:

```bash
cd exam-seating
npm install
npm run dev
```

Then visit http://localhost:3000 to see the beautiful interface we've created!
