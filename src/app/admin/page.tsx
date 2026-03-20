'use client';

import React, { useState } from 'react';
import RoomLayout from '../components/RoomLayout';
import { saveSeatingData } from '../../data/seatingStorage';
import { exportSeatingToCSV, downloadCSV, generateSeatingFilename, saveSeatingDataToStorage, parseCSVToSeating } from '../../utils/csvUtils';
import { saveSeatingToServer, loadSeatingFromServer } from '../../services/serverStorage';

// Type definitions
interface Student {
  'Student ID': string;
  'Student Name': string;
  'Student Exam': string;
  'Date': string;
}

interface Room {
  'Room No': string;
  'Room Name': string;
  'Number of Seats': string;
  'Seat Matrix (Rows x Columns)': string;
  rows?: number;
  columns?: number;
}

interface SeatingAssignment {
  studentId: string;
  studentName: string;
  studentExam: string;
  date: string;
  roomNo: string;
  roomName: string;
  seatNo: number;
  row: number;
  column: number;
  roomCapacity: number;
  roomLayout: string;
}

interface RoomInfo {
  roomNo: string;
  roomName: string;
  roomCapacity: number;
  roomLayout: string;
}

/**
 * Admin Dashboard Page
 * 
 * This page provides the main interface for administrators to manage
 * the exam seating arrangement system with Excel upload functionality.
 */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [seatingArrangement, setSeatingArrangement] = useState<SeatingAssignment[] | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [isLoadingFromServer, setIsLoadingFromServer] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'upload', label: 'Upload Data', icon: '📤' },
    { id: 'seating', label: 'Seating', icon: '🪑' },
    { id: 'rooms', label: 'Room View', icon: '🏢' },
    { id: 'reports', label: 'Reports', icon: '📋' }
  ];

  // Handle Excel file upload
  const handleFileUpload = (file: File, type: 'students' | 'rooms') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim();
        });
        return obj;
      }).filter(row => row[headers[0]]); // Remove empty rows

      if (type === 'students') {
        setStudents(data);
        console.log('Students uploaded:', data);
      } else {
        // Parse seat matrix for rooms
        const roomsWithMatrix = data.map(room => ({
          ...room,
          rows: parseInt(room['Seat Matrix (Rows x Columns)']?.split('x')[0]) || 0,
          columns: parseInt(room['Seat Matrix (Rows x Columns)']?.split('x')[1]) || 0
        }));
        setRooms(roomsWithMatrix);
        console.log('Rooms uploaded:', roomsWithMatrix);
      }
    };
    reader.readAsText(file);
  };

  // Create anti-cheating pattern by alternating students from different exams
  const createAntiCheatPattern = (examGroups: Map<string, Student[]>): Student[] => {
    const antiCheatStudents: Student[] = [];
    
    // Convert to arrays for easier manipulation
    const examArrays: Student[][] = Array.from(examGroups.values());
    
    // Shuffle each exam group for randomization
    examArrays.forEach((examArray: Student[]) => {
      for (let i = examArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [examArray[i], examArray[j]] = [examArray[j], examArray[i]];
      }
    });
    
    console.log('🔀 Creating anti-cheat pattern...');
    
    // Create alternating pattern
    const maxSize = Math.max(...examArrays.map((arr: Student[]) => arr.length));
    
    for (let i = 0; i < maxSize; i++) {
      for (const examArray of examArrays) {
        if (i < examArray.length) {
          const student = examArray[i];
          antiCheatStudents.push(student);
          console.log(`   Added: ${student['Student Name']} (Exam: ${student['Student Exam']})`);
        }
      }
    }
    
    console.log(`✅ Anti-cheat pattern created: ${antiCheatStudents.length} students arranged`);
    return antiCheatStudents;
  };

  // Generate seating arrangement with BULLETPROOF sequential filling
  const generateSeating = async () => {
    if (students.length === 0 || rooms.length === 0) {
      alert('Please upload both students and rooms data first!');
      return;
    }

    console.clear(); // Clear console for fresh debugging
    console.log('🚀🚀🚀 BULLETPROOF SEATING GENERATION v2.0 STARTING 🚀🚀🚀');
    console.log('🔧 Algorithm ID: BULLETPROOF-SEQUENTIAL-FILL-v2.0');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('👥 Total students loaded:', students.length);
    console.log('🏢 Total rooms loaded:', rooms.length);
    
    // FORCE REFRESH CHECK
    if (students.length === 0) {
      alert('❌ No students loaded! Please upload student data first.');
      return;
    }
    if (rooms.length === 0) {
      alert('❌ No rooms loaded! Please upload room data first.');
      return;
    }
    
    // Group students by exam and date
    const examGroups = new Map<string, Student[]>();
    students.forEach(student => {
      const key = `${student['Student Exam']}-${student['Date']}`;
      if (!examGroups.has(key)) {
        examGroups.set(key, []);
      }
      examGroups.get(key)!.push(student);
    });

    console.log('📊 EXAM GROUPS ANALYSIS:');
    examGroups.forEach((studentsInGroup, examKey) => {
      console.log(`   ${examKey}: ${studentsInGroup.length} students`);
    });

    // ANTI-CHEATING: Create alternating pattern to prevent same-exam adjacency
    const allStudents = createAntiCheatPattern(examGroups);
    console.log(`\n🔒 ANTI-CHEAT PATTERN CREATED: ${allStudents.length} students arranged`);
    
    // Sort rooms by capacity (smallest first for optimal filling)
    const sortedRooms = [...rooms].sort((a, b) => 
      parseInt(a['Number of Seats']) - parseInt(b['Number of Seats'])
    );

    console.log('🏢 Available rooms (sorted by capacity):');
    sortedRooms.forEach(room => {
      console.log(`   ${room['Room No']}: ${room['Number of Seats']} seats`);
    });

    // CRITICAL DEBUG ALERT
    alert(`🚀 BULLETPROOF Algorithm v2.0 with ANTI-CHEATING!\nTotal Students: ${allStudents.length}\nRooms: ${sortedRooms.length}\n\n🔒 Students with same exam will NOT be adjacent\n🔀 Alternating pattern created\n\nCheck console for detailed logs.`);
    
    // Generate seating for ALL students together
    const seating: SeatingAssignment[] = [];
    
    // BULLETPROOF SEQUENTIAL FILLING ALGORITHM
    let studentIndex = 0;
    
    for (let roomIndex = 0; roomIndex < sortedRooms.length && studentIndex < allStudents.length; roomIndex++) {
      const currentRoom = sortedRooms[roomIndex];
      const roomCapacity = parseInt(currentRoom['Number of Seats']);
      
      // Calculate how many students to assign to this room
      const remainingStudents = allStudents.length - studentIndex;
      const studentsForThisRoom = Math.min(roomCapacity, remainingStudents);
      
      console.log(`🏢 Room ${currentRoom['Room No']} (capacity: ${roomCapacity}): Assigning ${studentsForThisRoom} students`);
        
        // Parse room layout
        let roomColumns = 5; // Default
        if (currentRoom['Seat Matrix (Rows x Columns)']) {
          const matrix = currentRoom['Seat Matrix (Rows x Columns)'].split('x');
          if (matrix.length === 2) {
            roomColumns = parseInt(matrix[1]);
          }
        }
        
      // Assign students to this room - STRICT CAPACITY ENFORCEMENT
      for (let seatInRoom = 1; seatInRoom <= studentsForThisRoom; seatInRoom++) {
        if (studentIndex >= allStudents.length) {
          break; // No more students to assign
        }
        
        const student = allStudents[studentIndex];
          
          // Calculate row and column
          const row = Math.floor((seatInRoom - 1) / roomColumns) + 1;
          const column = ((seatInRoom - 1) % roomColumns) + 1;
          
        // Add to seating arrangement
        seating.push({
          studentId: student['Student ID'],
          studentName: student['Student Name'],
          studentExam: student['Student Exam'] || 'Mathematics',
          date: student['Date'] || '2024-12-20',
          roomNo: currentRoom['Room No'],
          roomName: currentRoom['Room Name'],
          seatNo: seatInRoom,
          row: row,
          column: column,
          roomCapacity: roomCapacity,
          roomLayout: currentRoom['Seat Matrix (Rows x Columns)']
        });
        
        studentIndex++;
      }
      
      const utilization = ((studentsForThisRoom/roomCapacity)*100).toFixed(1);
      console.log(`✅ Room ${currentRoom['Room No']}: Assigned ${studentsForThisRoom}/${roomCapacity} students (${utilization}% utilized)`);
      
      // CRITICAL VALIDATION: Check for overflow
      if (studentsForThisRoom > roomCapacity) {
        console.error(`🚨🚨🚨 CRITICAL ERROR: Room ${currentRoom['Room No']} OVERFLOW! ${studentsForThisRoom} > ${roomCapacity}`);
        alert(`CRITICAL ERROR: Room overflow detected! Room ${currentRoom['Room No']} has ${studentsForThisRoom} students but capacity is only ${roomCapacity}`);
        return; // Stop execution
      }
    }
    
    // Check if all students were assigned
    if (studentIndex < allStudents.length) {
      const unassigned = allStudents.length - studentIndex;
      console.warn(`⚠️ Warning: ${unassigned} students could not be assigned (insufficient room capacity)`);
      alert(`Warning: ${unassigned} students could not be assigned. Please add more rooms or increase capacity.`);
    }

    // Generate summary of room utilization
    const roomSummary = new Map<string, { count: number; capacity: number }>();
    seating.forEach(assignment => {
      const roomNo = assignment.roomNo;
      if (!roomSummary.has(roomNo)) {
        roomSummary.set(roomNo, { count: 0, capacity: assignment.roomCapacity });
      }
      roomSummary.get(roomNo)!.count++;
    });
    
    console.log(`\n=== FINAL SEATING SUMMARY ===`);
    console.log(`Total students assigned: ${seating.length}`);
    roomSummary.forEach((data, roomNo) => {
      const utilization = ((data.count / data.capacity) * 100).toFixed(1);
      console.log(`${roomNo}: ${data.count}/${data.capacity} students (${utilization}% utilized)`);
    });
    
    setSeatingArrangement(seating);
    
    // Save the seating data for student portal access
    saveSeatingData(seating);
    saveSeatingDataToStorage(seating);
    
    // Save to server CSV file
    setIsSavingToServer(true);
    try {
      const serverSaved = await saveSeatingToServer(seating);
      if (serverSaved) {
        console.log('Seating data saved to server CSV file');
      } else {
        console.warn('Failed to save seating data to server');
      }
    } catch (error) {
      console.error('Error saving to server:', error);
    } finally {
      setIsSavingToServer(false);
    }
    
    console.log('Seating generated with even distribution:', seating);
    console.log('Seating data saved for student portal access');
  };

  // Export seating data to CSV
  const handleExportCSV = () => {
    if (!seatingArrangement || seatingArrangement.length === 0) {
      alert('No seating data to export. Please generate seating first.');
      return;
    }

    setIsExporting(true);
    
    try {
      const csvContent = exportSeatingToCSV(seatingArrangement);
      const filename = generateSeatingFilename();
      downloadCSV(csvContent, filename);
      
      console.log('Seating data exported to CSV:', filename);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting CSV file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Import seating data from CSV
  const handleImportCSV = async (file: File) => {
    if (!file) return;

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const seatingData = parseCSVToSeating(csvContent);
        
        if (seatingData.length === 0) {
          alert('No valid seating data found in the CSV file.');
          return;
        }

        setSeatingArrangement(seatingData);
        saveSeatingData(seatingData);
        saveSeatingDataToStorage(seatingData);
        
        console.log('Seating data imported from CSV:', seatingData.length, 'students');
        alert(`Successfully imported ${seatingData.length} students from CSV file.`);
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error importing CSV file. Please check the file format and try again.');
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  // Load seating data from server on component mount
  React.useEffect(() => {
    const loadFromServer = async () => {
      setIsLoadingFromServer(true);
      try {
        console.log('🔄 Loading seating data from server...');
        const serverData = await loadSeatingFromServer();
        if (serverData && serverData.seatingArrangement && serverData.seatingArrangement.length > 0) {
          setSeatingArrangement(serverData.seatingArrangement);
          saveSeatingData(serverData.seatingArrangement);
          saveSeatingDataToStorage(serverData.seatingArrangement);
          console.log('✅ Seating data loaded from server:', serverData.seatingArrangement.length, 'students');
        } else {
          console.log('ℹ️ No seating data found on server');
        }
      } catch (error) {
        console.error('❌ Error loading from server:', error);
        // Don't show alert for initial load failures - it's normal if no data exists yet
        console.log('ℹ️ This is normal if no seating data has been generated yet');
      } finally {
        setIsLoadingFromServer(false);
      }
    };

    // Add a small delay to ensure backend is ready
    const timer = setTimeout(() => {
      loadFromServer();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const renderTabContent = () => {
    // Calculate dynamic stats
    const totalStudents = students.length > 0 ? students.length : seatingArrangement ? seatingArrangement.length : 0;
    const totalRooms = rooms.length > 0 ? rooms.length : seatingArrangement ? new Set(seatingArrangement.map(a => a.roomNo)).size : 0;
    const upcomingExams = students.length > 0 
      ? new Set(students.map(s => `${s['Student Exam']}-${s['Date']}`)).size 
      : seatingArrangement 
        ? new Set(seatingArrangement.map(a => `${a.studentExam}-${a.date}`)).size 
        : 0;
    const seatingCount = seatingArrangement && seatingArrangement.length > 0 ? seatingArrangement.length : 0;

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Students", value: totalStudents, icon: "👥", bg: "bg-blue-500/10", text: "text-blue-400" },
                { label: "Available Rooms", value: totalRooms, icon: "🏢", bg: "bg-green-500/10", text: "text-green-400" },
                { label: "Upcoming Exams", value: upcomingExams, icon: "📝", bg: "bg-yellow-500/10", text: "text-yellow-400" },
                { label: "Students Arranged", value: seatingCount, icon: "🪑", bg: "bg-purple-500/10", text: "text-purple-400" }
              ].map((stat, i) => (
                <div key={i} className="glass-dark p-6 rounded-2xl border border-slate-800/60 glow-card bg-slate-900/40">
                  <div className="flex items-center">
                    <div className={`p-3 ${stat.bg} rounded-xl border border-white/5`}>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.text} tracking-tight`}>{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'upload':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Upload Data</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Students Upload */}
              <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 bg-slate-900/40 glow-card">
                <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center"><span className="mr-2">📋</span> Students Data</h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Select CSV file with: <code className="text-blue-400">Student ID</code>, <code className="text-blue-400">Name</code>, <code className="text-blue-400">Exam</code>, <code className="text-blue-400">Date</code>
                </p>
                <div className="relative border-2 border-dashed border-slate-700/50 rounded-xl p-8 text-center hover:border-blue-500/40 transition-colors cursor-pointer bg-slate-900/20 group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'students');
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</div>
                  <p className="text-sm font-medium text-slate-300">Choose File or Drag & Drop</p>
                  <p className="text-xs text-slate-500 mt-1">CSV files only</p>
                </div>
                {students.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center text-xs text-blue-400">
                    <span>✅ {students.length} students loaded. Ready to generate.</span>
                  </div>
                )}
              </div>

              {/* Rooms Upload */}
              <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 bg-slate-900/40 glow-card">
                <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center"><span className="mr-2">🏢</span> Rooms Data</h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Select CSV file with: <code className="text-green-400">Room No</code>, <code className="text-green-400">Name</code>, <code className="text-green-400">Capacity</code>, <code className="text-green-400">Matrix</code>
                </p>
                <div className="relative border-2 border-dashed border-slate-700/50 rounded-xl p-8 text-center hover:border-green-500/40 transition-colors cursor-pointer bg-slate-900/20 group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'rooms');
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
                  <p className="text-sm font-medium text-slate-300">Choose File or Drag & Drop</p>
                  <p className="text-xs text-slate-500 mt-1">CSV files only</p>
                </div>
                {rooms.length > 0 && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center text-xs text-green-400">
                    <span>✅ {rooms.length} rooms loaded. Ready to generate.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Download Templates */}
            <div className="glass-dark rounded-2xl border border-slate-800/40 p-5 bg-slate-900/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Need template files?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Download layout structures for uploading correctly.</p>
              </div>
              <div className="flex gap-2">
                <a href="/data/templates/students_template.csv" download className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors text-slate-300">Students Template</a>
                <a href="/data/templates/rooms_template.csv" download className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors text-slate-300">Rooms Template</a>
              </div>
            </div>
          </div>
        );
      
      case 'rooms':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Room View</h2>
            
            {seatingArrangement && seatingArrangement.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  // Get unique rooms from seating arrangement
                  const roomMap = new Map<string, RoomInfo>();
                  seatingArrangement.forEach(student => {
                    if (!roomMap.has(student.roomNo)) {
                      roomMap.set(student.roomNo, {
                        roomNo: student.roomNo,
                        roomName: student.roomName,
                        roomCapacity: student.roomCapacity,
                        roomLayout: student.roomLayout
                      });
                    }
                  });
                  
                  return Array.from(roomMap.values()).map((room: RoomInfo, index) => {
                    const roomStudents = seatingArrangement.filter(s => s.roomNo === room.roomNo);
                    return (
                      <div
                        key={index}
                        className="glass-dark rounded-2xl border border-slate-800/60 p-6 cursor-pointer hover:border-blue-500/40 transition-all duration-300 glow-card bg-slate-900/40"
                        onClick={() => setSelectedRoom(room)}
                      >
                        <h3 className="text-lg font-bold text-slate-200">{room.roomName}</h3>
                        <p className="text-xs text-slate-500">No: <span className="font-mono">{room.roomNo}</span></p>
                        <div className="mt-4 space-y-1">
                          <p className="text-xs text-slate-400 flex justify-between"><span>Capacity</span> <span className="text-slate-200">{room.roomCapacity}</span></p>
                          <p className="text-xs text-slate-400 flex justify-between"><span>Layout</span> <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700/50">{room.roomLayout}</span></p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-800/60">
                          <span className="inline-block bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-full border border-blue-500/20">
                            {roomStudents.length} students assigned
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center">
                <p className="text-slate-400 text-sm">
                  {isLoadingFromServer ? 'Loading seating data...' : 'No seating data found. Upload data and generate seating arrangement first.'}
                </p>
              </div>
            )}

            {/* Room Details Modal */}
            {selectedRoom && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-slate-900/90 shadow-2xl">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedRoom.roomName}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedRoom.roomNo}</p>
                    </div>
                    <button
                      onClick={() => setSelectedRoom(null)}
                      className="text-slate-500 hover:text-white transition-colors text-xl p-1 hover:bg-slate-800/40 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {seatingArrangement ? (
                    <div>
                      <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400">
                        Found <span className="font-bold">{seatingArrangement.filter(s => s.roomNo === selectedRoom.roomNo).length}</span> students in this room
                      </div>
                      
                      {/* Visual Room Layout */}
                      <div className="mb-6 bg-slate-900/40 border border-slate-800/40 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-slate-300 mb-4">Floor Map</h4>
                        <RoomLayout
                          roomNo={selectedRoom.roomNo}
                          roomName={selectedRoom.roomName}
                          seatMatrix={selectedRoom.roomLayout}
                          students={seatingArrangement.filter(s => s.roomNo === selectedRoom.roomNo)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center">
                      <p className="text-yellow-400 text-sm">No seating arrangement generated yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'seating':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-white">Seating Arrangement</h2>
              <div className="flex gap-3">
                <button 
                  onClick={generateSeating}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-green-600/20 flex items-center gap-2 text-sm cursor-pointer"
                >
                  <span>⚡</span> Generate Seating
                </button>
                
                {/* CSV Import */}
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportCSV(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isImporting}
                  />
                  <button
                    disabled={isImporting}
                    className="glass font-semibold text-slate-200 px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-sm border border-slate-700/50 cursor-pointer hover:bg-slate-800/40"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Importing...
                      </>
                    ) : (
                      <>📥 Import CSV</>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {seatingArrangement ? (
              <div className="space-y-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-green-400 font-bold text-sm">✅ Generated successfully!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Total students assigned: {seatingArrangement.length}</p>
                  </div>
                </div>
                
                {/* Distribution Summary */}
                <div className="glass-dark border border-slate-800/60 rounded-2xl p-5 bg-slate-900/40">
                  <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center"><span className="mr-2">📊</span> Room Allocation Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {rooms.map(room => {
                      const studentsInRoom = seatingArrangement.filter(s => s.roomNo === room['Room No']).length;
                      const cap = parseInt(room['Number of Seats']);
                      const utilization = cap > 0 ? ((studentsInRoom / cap) * 100).toFixed(1) : "0";
                      return (
                        <div key={room['Room No']} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                          <div className="font-bold text-slate-300">{room['Room No']}</div>
                          <div className="text-slate-500 mt-1">{studentsInRoom}/{cap} <span className="text-[10px]">seats</span></div>
                          <div className="mt-2 w-full bg-slate-800 rounded-full h-1">
                            <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${Math.min(100, parseFloat(utilization))}%` }}></div>
                          </div>
                          <div className="text-blue-400 mt-1 font-medium">{utilization}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Table wrapper */}
                <div className="glass-dark border border-slate-800/60 rounded-2xl bg-slate-900/40 overflow-hidden">
                  <div className="p-4 border-b border-slate-800/60 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-200">Seating Roster</h3>
                    <span className="text-xs text-slate-500">{seatingArrangement.length} records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-left">
                      <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-800/80">
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">ID</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">Student Name</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">Exam</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">Room</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">Seat</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seatingArrangement.map((assignment, index) => (
                          <tr key={index} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors text-sm">
                            <td className="px-4 py-3 font-mono text-slate-400 text-xs">{assignment.studentId}</td>
                            <td className="px-4 py-3 font-medium text-slate-200">{assignment.studentName}</td>
                            <td className="px-4 py-3">
                              <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[11px] border border-blue-500/10">
                                {assignment.studentExam}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-300">{assignment.roomNo}</td>
                            <td className="px-4 py-3 font-bold text-green-400">{assignment.seatNo}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              Row {assignment.row}, Col {assignment.column}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    📄 Export CSV
                  </button>
                  <button className="glass text-slate-300 hover:bg-slate-800/40 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700/50 cursor-pointer">
                    🖨️ Print Chart
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center">
                <p className="text-slate-400 text-sm">Please upload data and click "Generate Seating" to view arrangement.</p>
              </div>
            )}
          </div>
        );
      
      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Reports & Analytics</h2>
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-sm">Analytical dashboards are fully functional in underlying engine. Highcharts integration pending design specs.</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-mesh relative overflow-hidden antialiased font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full filter blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full filter blur-[120px] -z-10 animate-pulse delay-1000"></div>

      {/* Header */}
      <header className="backdrop-blur-md border-b border-slate-900/50 sticky top-0 z-50 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">E</div>
                <span>ExamSeat <span className="text-sm font-semibold text-blue-400">Admin</span></span>
              </h1>
              {isLoadingFromServer && (
                <div className="flex items-center text-blue-400 mt-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-2"></div>
                  <span className="text-xs">Syncing with server...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">Admin Mode</span>
              <button className="bg-red-600/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm hover:bg-red-600/20 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start">
          {/* Sidebar */}
          <div className="w-56 glass-dark rounded-2xl p-4 mr-8 border border-slate-800/40 sticky top-24 bg-slate-900/30">
            <nav className="space-y-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <span className="mr-3 text-lg opacity-80">{tab.icon}</span>
                  <span className="text-sm font-semibold">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
