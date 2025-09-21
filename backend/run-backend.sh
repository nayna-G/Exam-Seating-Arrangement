#!/bin/bash

# Exam Seating System - Backend Runner Script
# This script provides alternative ways to run the backend

echo "🚀 Exam Seating System - Backend Setup"
echo "======================================"

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 11 or higher."
    echo "   Ubuntu/Debian: sudo apt install openjdk-11-jdk"
    echo "   macOS: brew install openjdk@11"
    exit 1
fi

echo "✅ Java found: $(java -version 2>&1 | head -n 1)"

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed."
    echo ""
    echo "🔧 Solutions to install Maven:"
    echo "1. Fix dependencies and install:"
    echo "   sudo apt remove rabbitmq-server"
    echo "   sudo apt autoremove"
    echo "   sudo apt --fix-broken install"
    echo "   sudo apt install maven"
    echo ""
    echo "2. Use SDKMAN (recommended):"
    echo "   curl -s 'https://get.sdkman.io' | bash"
    echo "   source ~/.sdkman/bin/sdkman-init.sh"
    echo "   sdk install maven 3.9.5"
    echo ""
    echo "3. Manual download:"
    echo "   wget https://archive.apache.org/dist/maven/maven-3/3.9.5/binaries/apache-maven-3.9.5-bin.tar.gz"
    echo "   tar -xzf apache-maven-3.9.5-bin.tar.gz"
    echo "   export PATH=\$PATH:\$(pwd)/apache-maven-3.9.5/bin"
    echo ""
    echo "4. Use the frontend-only version for now:"
    echo "   The frontend is already working at http://localhost:3000"
    echo "   You can demonstrate the system without the backend initially."
    exit 1
fi

echo "✅ Maven found: $(mvn -version | head -n 1)"

# Try to build and run
echo ""
echo "🔨 Building the backend..."
mvn clean install

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting the backend server..."
    mvn spring-boot:run
else
    echo "❌ Build failed. Please check the error messages above."
    echo ""
    echo "💡 Alternative: Use the frontend-only version for demonstration"
    echo "   Frontend is running at: http://localhost:3000"
fi
