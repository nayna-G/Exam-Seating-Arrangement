'use client'; // Directive: Marks this file as a client-side component (can use hooks and browser APIs)

import React, { useState } from 'react'; // Import statement: Imports React and useState hook for state management
import RoomLayout from '../components/RoomLayout'; // Import statement: Imports RoomLayout component for visual room display
import { saveSeatingData } from '../../data/seatingStorage'; // Import statement: Imports function to save seating data to local storage
import { exportSeatingToCSV, downloadCSV, generateSeatingFilename, saveSeatingDataToStorage, parseCSVToSeating } from '../../utils/csvUtils'; // Import statement: Imports CSV utility functions for export/import
import { saveSeatingToServer, loadSeatingFromServer } from '../../services/serverStorage'; // Import statement: Imports server storage functions for backend integration

// Type definitions
interface Student { // Interface declaration: Defines the shape of a Student object from CSV
  'Student ID': string; // Property: Student identifier string
  'Student Name': string; // Property: Student full name
  'Student Exam': string; // Property: Exam subject the student is taking
  'Date': string; // Property: Exam date
}

interface Room { // Interface declaration: Defines the shape of a Room object from CSV
  'Room No': string; // Property: Room identifier string
  'Room Name': string; // Property: Room name/description
  'Number of Seats': string; // Property: Total seating capacity as string
  'Seat Matrix (Rows x Columns)': string; // Property: Room layout as "rows x columns" string
  rows?: number; // Optional property: Parsed number of rows
  columns?: number; // Optional property: Parsed number of columns
}

interface SeatingAssignment { // Interface declaration: Defines the shape of a seating assignment
  studentId: string; // Property: Student ID assigned to seat
  studentName: string; // Property: Student name assigned to seat
  studentExam: string; // Property: Exam subject for the student
  date: string; // Property: Exam date
  roomNo: string; // Property: Room number where student is assigned
  roomName: string; // Property: Room name where student is assigned
  seatNo: number; // Property: Seat number within the room
  row: number; // Property: Row number in room layout
  column: number; // Property: Column number in room layout
  roomCapacity: number; // Property: Total capacity of the room
  roomLayout: string; // Property: Room layout string (e.g., "5x5")
}

interface RoomInfo { // Interface declaration: Defines simplified room information for display
  roomNo: string; // Property: Room identifier
  roomName: string; // Property: Room name
  roomCapacity: number; // Property: Room capacity
  roomLayout: string; // Property: Room layout string
}

/**
 * Admin Dashboard Page
 * 
 * This page provides the main interface for administrators to manage
 * the exam seating arrangement system with Excel upload functionality.
 */
export default function AdminDashboard() { // Function declaration: Default export of AdminDashboard component
  const [activeTab, setActiveTab] = useState('dashboard'); // Hook: State for currently active tab (default: 'dashboard')
  const [students, setStudents] = useState<Student[]>([]); // Hook: State for students array (default: empty array)
  const [rooms, setRooms] = useState<Room[]>([]); // Hook: State for rooms array (default: empty array)
  const [seatingArrangement, setSeatingArrangement] = useState<SeatingAssignment[] | null>(null); // Hook: State for seating assignments (default: null)
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null); // Hook: State for selected room for modal view (default: null)
  const [isExporting, setIsExporting] = useState(false); // Hook: State for export loading state (default: false)
  const [isImporting, setIsImporting] = useState(false); // Hook: State for import loading state (default: false)
  const [isSavingToServer, setIsSavingToServer] = useState(false); // Hook: State for server save loading state (default: false)
  const [isLoadingFromServer, setIsLoadingFromServer] = useState(false); // Hook: State for server load loading state (default: false)

  const tabs = [ // Array constant: Array of tab configuration objects
    { id: 'dashboard', label: 'Dashboard', icon: '📊' }, // Object: Dashboard tab with ID, label, and icon
    { id: 'upload', label: 'Upload Data', icon: '📤' }, // Object: Upload tab with ID, label, and icon
    { id: 'seating', label: 'Seating', icon: '🪑' }, // Object: Seating tab with ID, label, and icon
    { id: 'rooms', label: 'Room View', icon: '🏢' }, // Object: Room View tab with ID, label, and icon
    { id: 'reports', label: 'Reports', icon: '📋' } // Object: Reports tab with ID, label, and icon
  ];

  // Handle Excel file upload
  const handleFileUpload = (file: File, type: 'students' | 'rooms') => { // Function declaration: Handles CSV file upload and parsing
    const reader = new FileReader(); // Object instantiation: Creates FileReader object to read file contents
    reader.onload = (e) => { // Event handler: Executes when file reading completes
      const csv = e.target?.result as string; // Type assertion: Gets file content as string
      const lines = csv.split('\n'); // String method: Splits CSV content into lines by newline
      const headers = lines[0].split(','); // String method: Splits first line to get column headers
      const data = lines.slice(1).map(line => { // Array method: Maps over data lines (skipping header)
        const values = line.split(','); // String method: Splits line into values by comma
        const obj: any = {}; // Object creation: Creates empty object to store row data
        headers.forEach((header, index) => { // Array method: Iterates over headers to map to values
          obj[header.trim()] = values[index]?.trim(); // Object assignment: Maps header to trimmed value
        });
        return obj; // Return statement: Returns the parsed row object
      }).filter(row => row[headers[0]]); // Array method: Filters out empty rows

      if (type === 'students') { // Conditional check: If uploading students data
        setStudents(data); // State setter: Sets students state with parsed data
        console.log('Students uploaded:', data); // Console log: Logs uploaded students for debugging
      } else { // Else block: If uploading rooms data
        const roomsWithMatrix = data.map(room => ({ // Array method: Maps rooms to add parsed matrix dimensions
          ...room, // Spread operator: Copies existing room properties
          rows: parseInt(room['Seat Matrix (Rows x Columns)']?.split('x')[0]) || 0, // Property: Parses rows from matrix string
          columns: parseInt(room['Seat Matrix (Rows x Columns)']?.split('x')[1]) || 0 // Property: Parses columns from matrix string
        }));
        setRooms(roomsWithMatrix); // State setter: Sets rooms state with parsed data
        console.log('Rooms uploaded:', roomsWithMatrix); // Console log: Logs uploaded rooms for debugging
      }
    };
    reader.readAsText(file); // FileReader method: Reads file as text
  };

  // Create anti-cheating pattern by alternating students from different exams
  const createAntiCheatPattern = (examGroups: Map<string, Student[]>): Student[] => { // Function declaration: Creates alternating pattern to prevent same-exam adjacency
    const antiCheatStudents: Student[] = []; // Array declaration: Array to hold rearranged students
    
    const examArrays: Student[][] = Array.from(examGroups.values()); // Array method: Converts Map values to array of arrays
    
    examArrays.forEach((examArray: Student[]) => { // Array method: Iterates over each exam group
      for (let i = examArray.length - 1; i > 0; i--) { // For loop: Fisher-Yates shuffle algorithm
        const j = Math.floor(Math.random() * (i + 1)); // Math method: Generates random index
        [examArray[i], examArray[j]] = [examArray[j], examArray[i]]; // Destructuring: Swaps array elements
      }
    });
    
    console.log('🔀 Creating anti-cheat pattern...'); // Console log: Logs anti-cheat pattern creation start
    
    const maxSize = Math.max(...examArrays.map((arr: Student[]) => arr.length)); // Math method: Finds largest exam group size
    
    for (let i = 0; i < maxSize; i++) { // For loop: Iterates through positions up to max size
      for (const examArray of examArrays) { // For-of loop: Iterates through each exam group
        if (i < examArray.length) { // Conditional check: If position exists in this exam group
          const student = examArray[i]; // Variable assignment: Gets student at position
          antiCheatStudents.push(student); // Array method: Adds student to anti-cheat arrangement
          console.log(`   Added: ${student['Student Name']} (Exam: ${student['Student Exam']})`); // Console log: Logs added student
        }
      }
    }
    
    console.log(`✅ Anti-cheat pattern created: ${antiCheatStudents.length} students arranged`); // Console log: Logs completion
    return antiCheatStudents; // Return statement: Returns rearranged student array
  };

  // Generate seating arrangement with BULLETPROOF sequential filling
  const generateSeating = async () => { // Function declaration: Async function to generate seating arrangement
    if (students.length === 0 || rooms.length === 0) { // Conditional check: Validates data is loaded
      alert('Please upload both students and rooms data first!'); // Browser API: Shows alert if data missing
      return; // Return statement: Exits function early
    }

    console.clear(); // Console method: Clears console for fresh debugging output
    console.log('🚀🚀🚀 BULLETPROOF SEATING GENERATION v2.0 STARTING 🚀🚀🚀'); // Console log: Logs algorithm start
    console.log('🔧 Algorithm ID: BULLETPROOF-SEQUENTIAL-FILL-v2.0'); // Console log: Logs algorithm identifier
    console.log('📅 Timestamp:', new Date().toISOString()); // Console log: Logs current timestamp
    console.log('👥 Total students loaded:', students.length); // Console log: Logs student count
    console.log('🏢 Total rooms loaded:', rooms.length); // Console log: Logs room count
    
    if (students.length === 0) { // Conditional check: Double-checks students data
      alert('❌ No students loaded! Please upload student data first.'); // Browser API: Shows error alert
      return; // Return statement: Exits function early
    }
    if (rooms.length === 0) { // Conditional check: Double-checks rooms data
      alert('❌ No rooms loaded! Please upload room data first.'); // Browser API: Shows error alert
      return; // Return statement: Exits function early
    }
    
    const examGroups = new Map<string, Student[]>(); // Object instantiation: Creates Map to group students by exam
    students.forEach(student => { // Array method: Iterates over students to group them
      const key = `${student['Student Exam']}-${student['Date']}`; // Template literal: Creates composite key from exam and date
      if (!examGroups.has(key)) { // Conditional check: If key doesn't exist in map
        examGroups.set(key, []); // Map method: Initializes empty array for new key
      }
      examGroups.get(key)!.push(student); // Map method: Adds student to appropriate group
    });

    console.log('📊 EXAM GROUPS ANALYSIS:'); // Console log: Logs exam groups analysis header
    examGroups.forEach((studentsInGroup, examKey) => { // Map method: Iterates over exam groups
      console.log(`   ${examKey}: ${studentsInGroup.length} students`); // Console log: Logs group size
    });

    const allStudents = createAntiCheatPattern(examGroups); // Function call: Creates anti-cheating student arrangement
    console.log(`\n🔒 ANTI-CHEAT PATTERN CREATED: ${allStudents.length} students arranged`); // Console log: Logs anti-cheat pattern completion
    
    const sortedRooms = [...rooms].sort((a, b) => // Array method: Creates copy and sorts by capacity (ascending)
      parseInt(a['Number of Seats']) - parseInt(b['Number of Seats']) // Comparison function: Compares seat counts
    );

    console.log('🏢 Available rooms (sorted by capacity):'); // Console log: Logs sorted rooms header
    sortedRooms.forEach(room => { // Array method: Iterates over sorted rooms
      console.log(`   ${room['Room No']}: ${room['Number of Seats']} seats`); // Console log: Logs room capacity
    });

    alert(`🚀 BULLETPROOF Algorithm v2.0 with ANTI-CHEATING!\nTotal Students: ${allStudents.length}\nRooms: ${sortedRooms.length}\n\n🔒 Students with same exam will NOT be adjacent\n🔀 Alternating pattern created\n\nCheck console for detailed logs.`); // Browser API: Shows algorithm start alert
    
    const seating: SeatingAssignment[] = []; // Array declaration: Array to hold seating assignments
    
    let studentIndex = 0; // Variable declaration: Index for tracking current student
    
    for (let roomIndex = 0; roomIndex < sortedRooms.length && studentIndex < allStudents.length; roomIndex++) { // For loop: Iterates through rooms while students remain
      const currentRoom = sortedRooms[roomIndex]; // Variable assignment: Gets current room from sorted array
      const roomCapacity = parseInt(currentRoom['Number of Seats']); // Function call: Parses room capacity to integer
      
      const remainingStudents = allStudents.length - studentIndex; // Arithmetic: Calculates remaining unassigned students
      const studentsForThisRoom = Math.min(roomCapacity, remainingStudents); // Math method: Calculates students to assign (prevents overflow)
      
      console.log(`🏢 Room ${currentRoom['Room No']} (capacity: ${roomCapacity}): Assigning ${studentsForThisRoom} students`); // Console log: Logs room assignment
        
      let roomColumns = 5; // Variable declaration: Default column count
      if (currentRoom['Seat Matrix (Rows x Columns)']) { // Conditional check: If room has matrix string
        const matrix = currentRoom['Seat Matrix (Rows x Columns)'].split('x'); // String method: Splits matrix string by 'x'
        if (matrix.length === 2) { // Conditional check: If split produced 2 parts
          roomColumns = parseInt(matrix[1]); // Function call: Parses column count from matrix
        }
      }
        
      for (let seatInRoom = 1; seatInRoom <= studentsForThisRoom; seatInRoom++) { // For loop: Assigns students to seats in room
        if (studentIndex >= allStudents.length) { // Conditional check: If no more students to assign
          break; // Break statement: Exits loop early
        }
        
        const student = allStudents[studentIndex]; // Variable assignment: Gets current student
          
          const row = Math.floor((seatInRoom - 1) / roomColumns) + 1; // Math method: Calculates row number from seat position
          const column = ((seatInRoom - 1) % roomColumns) + 1; // Math method: Calculates column number from seat position
          
        seating.push({ // Array method: Adds seating assignment object
          studentId: student['Student ID'], // Property: Student ID
          studentName: student['Student Name'], // Property: Student name
          studentExam: student['Student Exam'] || 'Mathematics', // Property: Exam subject with fallback
          date: student['Date'] || '2024-12-20', // Property: Date with fallback
          roomNo: currentRoom['Room No'], // Property: Room number
          roomName: currentRoom['Room Name'], // Property: Room name
          seatNo: seatInRoom, // Property: Seat number
          row: row, // Property: Row number
          column: column, // Property: Column number
          roomCapacity: roomCapacity, // Property: Room capacity
          roomLayout: currentRoom['Seat Matrix (Rows x Columns)'] // Property: Room layout string
        });
        
        studentIndex++; // Increment: Moves to next student
      }
      
      const utilization = ((studentsForThisRoom/roomCapacity)*100).toFixed(1); // Arithmetic: Calculates room utilization percentage
      console.log(`✅ Room ${currentRoom['Room No']}: Assigned ${studentsForThisRoom}/${roomCapacity} students (${utilization}% utilized)`); // Console log: Logs room completion
      
      if (studentsForThisRoom > roomCapacity) { // Conditional check: Validates no overflow occurred
        console.error(`🚨🚨🚨 CRITICAL ERROR: Room ${currentRoom['Room No']} OVERFLOW! ${studentsForThisRoom} > ${roomCapacity}`); // Console error: Logs overflow error
        alert(`CRITICAL ERROR: Room overflow detected! Room ${currentRoom['Room No']} has ${studentsForThisRoom} students but capacity is only ${roomCapacity}`); // Browser API: Shows critical error alert
        return; // Return statement: Stops execution on error
      }
    }
    
    if (studentIndex < allStudents.length) { // Conditional check: If some students remain unassigned
      const unassigned = allStudents.length - studentIndex; // Arithmetic: Calculates unassigned count
      console.warn(`⚠️ Warning: ${unassigned} students could not be assigned (insufficient room capacity)`); // Console warn: Logs warning
      alert(`Warning: ${unassigned} students could not be assigned. Please add more rooms or increase capacity.`); // Browser API: Shows warning alert
    }

    const roomSummary = new Map<string, { count: number; capacity: number }>(); // Object instantiation: Creates Map for room utilization summary
    seating.forEach(assignment => { // Array method: Iterates over seating assignments to build summary
      const roomNo = assignment.roomNo; // Variable assignment: Gets room number
      if (!roomSummary.has(roomNo)) { // Conditional check: If room not in summary
        roomSummary.set(roomNo, { count: 0, capacity: assignment.roomCapacity }); // Map method: Initializes room entry
      }
      roomSummary.get(roomNo)!.count++; // Increment: Increases student count for room
    });
    
    console.log(`\n=== FINAL SEATING SUMMARY ===`); // Console log: Logs summary header
    console.log(`Total students assigned: ${seating.length}`); // Console log: Logs total assigned
    roomSummary.forEach((data, roomNo) => { // Map method: Iterates over room summary
      const utilization = ((data.count / data.capacity) * 100).toFixed(1); // Arithmetic: Calculates utilization percentage
      console.log(`${roomNo}: ${data.count}/${data.capacity} students (${utilization}% utilized)`); // Console log: Logs room utilization
    });
    
    setSeatingArrangement(seating); // State setter: Updates seating arrangement state
    
    saveSeatingData(seating); // Function call: Saves seating data to local storage
    saveSeatingDataToStorage(seating); // Function call: Saves seating data to storage utility
    
    setIsSavingToServer(true); // State setter: Sets server save loading state
    try { // Try block: Begins server save operation
      const serverSaved = await saveSeatingToServer(seating); // Async function call: Saves seating to server
      if (serverSaved) { // Conditional check: If save succeeded
        console.log('Seating data saved to server CSV file'); // Console log: Logs success
      } else { // Else block: If save failed
        console.warn('Failed to save seating data to server'); // Console warn: Logs failure
      }
    } catch (error) { // Catch block: Handles server save errors
      console.error('Error saving to server:', error); // Console error: Logs error details
    } finally { // Finally block: Always executes regardless of success/failure
      setIsSavingToServer(false); // State setter: Resets server save loading state
    }
    
    console.log('Seating generated with even distribution:', seating); // Console log: Logs completion
    console.log('Seating data saved for student portal access'); // Console log: Logs data availability
  };

  // Export seating data to CSV
  const handleExportCSV = () => { // Function declaration: Handles CSV export of seating arrangement
    if (!seatingArrangement || seatingArrangement.length === 0) { // Conditional check: Validates seating data exists
      alert('No seating data to export. Please generate seating first.'); // Browser API: Shows alert if no data
      return; // Return statement: Exits function early
    }

    setIsExporting(true); // State setter: Sets export loading state
    
    try { // Try block: Begins CSV export operation
      const csvContent = exportSeatingToCSV(seatingArrangement); // Function call: Converts seating to CSV string
      const filename = generateSeatingFilename(); // Function call: Generates timestamped filename
      downloadCSV(csvContent, filename); // Function call: Triggers browser download
      
      console.log('Seating data exported to CSV:', filename); // Console log: Logs export success
    } catch (error) { // Catch block: Handles export errors
      console.error('Error exporting CSV:', error); // Console error: Logs error details
      alert('Error exporting CSV file. Please try again.'); // Browser API: Shows error alert
    } finally { // Finally block: Always executes regardless of success/failure
      setIsExporting(false); // State setter: Resorts export loading state
    }
  };

  // Import seating data from CSV
  const handleImportCSV = async (file: File) => { // Function declaration: Handles CSV import of seating arrangement
    if (!file) return; // Conditional check: Exits if no file provided

    setIsImporting(true); // State setter: Sets import loading state
    
    const reader = new FileReader(); // Object instantiation: Creates FileReader to read file
    reader.onload = (e) => { // Event handler: Executes when file reading completes
      try { // Try block: Begins CSV parsing operation
        const csvContent = e.target?.result as string; // Type assertion: Gets file content as string
        const seatingData = parseCSVToSeating(csvContent); // Function call: Parses CSV to seating array
        
        if (seatingData.length === 0) { // Conditional check: Validates parsed data is not empty
          alert('No valid seating data found in the CSV file.'); // Browser API: Shows alert if no data
          return; // Return statement: Exits function early
        }

        setSeatingArrangement(seatingData); // State setter: Updates seating arrangement state
        saveSeatingData(seatingData); // Function call: Saves to local storage
        saveSeatingDataToStorage(seatingData); // Function call: Saves to storage utility
        
        console.log('Seating data imported from CSV:', seatingData.length, 'students'); // Console log: Logs import success
        alert(`Successfully imported ${seatingData.length} students from CSV file.`); // Browser API: Shows success alert
      } catch (error) { // Catch block: Handles import errors
        console.error('Error importing CSV:', error); // Console error: Logs error details
        alert('Error importing CSV file. Please check the file format and try again.'); // Browser API: Shows error alert
      } finally { // Finally block: Always executes regardless of success/failure
        setIsImporting(false); // State setter: Resets import loading state
      }
    };
    
    reader.readAsText(file); // FileReader method: Reads file as text
  };

  // Load seating data from server on component mount
  React.useEffect(() => { // Hook: Effect hook that runs on component mount
    const loadFromServer = async () => { // Function declaration: Async function to load data from server
      setIsLoadingFromServer(true); // State setter: Sets server load loading state
      try { // Try block: Begins server load operation
        console.log('🔄 Loading seating data from server...'); // Console log: Logs load start
        const serverData = await loadSeatingFromServer(); // Async function call: Fetches data from server
        if (serverData && serverData.seatingArrangement && serverData.seatingArrangement.length > 0) { // Conditional check: Validates server data exists
          setSeatingArrangement(serverData.seatingArrangement); // State setter: Updates seating state
          saveSeatingData(serverData.seatingArrangement); // Function call: Saves to local storage
          saveSeatingDataToStorage(serverData.seatingArrangement); // Function call: Saves to storage utility
          console.log('✅ Seating data loaded from server:', serverData.seatingArrangement.length, 'students'); // Console log: Logs success
        } else { // Else block: If no data on server
          console.log('ℹ️ No seating data found on server'); // Console log: Logs no data found
        }
      } catch (error) { // Catch block: Handles load errors
        console.error('❌ Error loading from server:', error); // Console error: Logs error details
        console.log('ℹ️ This is normal if no seating data has been generated yet'); // Console log: Logs informational message
      } finally { // Finally block: Always executes regardless of success/failure
        setIsLoadingFromServer(false); // State setter: Resets server load loading state
      }
    };

    const timer = setTimeout(() => { // Function call: Sets timeout to delay load
      loadFromServer(); // Function call: Executes load function after delay
    }, 1000); // Timeout delay: 1000 milliseconds (1 second)

    return () => clearTimeout(timer); // Return statement: Cleanup function clears timeout on unmount
  }, []); // Dependency array: Empty array means effect runs only on mount

  const renderTabContent = () => { // Function declaration: Renders content based on active tab
    const totalStudents = students.length > 0 ? students.length : seatingArrangement ? seatingArrangement.length : 0; // Ternary: Calculates total students from either uploaded data or seating
    const totalRooms = rooms.length > 0 ? rooms.length : seatingArrangement ? new Set(seatingArrangement.map(a => a.roomNo)).size : 0; // Ternary: Calculates total rooms from either uploaded data or seating
    const upcomingExams = students.length > 0 // Ternary: Calculates unique exam count from students or seating
      ? new Set(students.map(s => `${s['Student Exam']}-${s['Date']}`)).size // Set method: Counts unique exam-date combinations
      : seatingArrangement // Else: Use seating arrangement if no students
        ? new Set(seatingArrangement.map(a => `${a.studentExam}-${a.date}`)).size // Set method: Counts unique exam-date combinations
        : 0; // Fallback: Zero if no data
    const seatingCount = seatingArrangement && seatingArrangement.length > 0 ? seatingArrangement.length : 0; // Ternary: Gets seating count or zero

    switch (activeTab) { // Switch statement: Returns JSX based on active tab
      case 'dashboard': // Case: Dashboard tab
        return ( // Return statement: Returns dashboard JSX
          <div className="space-y-6"> // JSX element: Container with vertical spacing
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Dashboard Overview</h2> // JSX element: Section heading
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> // JSX element: Responsive grid for stat cards
              {[ // Array literal: Array of stat objects for mapping
                { label: "Total Students", value: totalStudents, icon: "👥", bg: "bg-blue-500/10", text: "text-blue-400" }, // Object: Student stat
                { label: "Available Rooms", value: totalRooms, icon: "🏢", bg: "bg-green-500/10", text: "text-green-400" }, // Object: Room stat
                { label: "Upcoming Exams", value: upcomingExams, icon: "📝", bg: "bg-yellow-500/10", text: "text-yellow-400" }, // Object: Exam stat
                { label: "Students Arranged", value: seatingCount, icon: "🪑", bg: "bg-purple-500/10", text: "text-purple-400" } // Object: Seating stat
              ].map((stat, i) => ( // Array method: Maps stat objects to JSX cards
                <div key={i} className="glass-dark p-6 rounded-2xl border border-slate-800/60 glow-card bg-slate-900/40"> // JSX element: Stat card with glass effect
                  <div className="flex items-center"> // JSX element: Flex container for icon and text
                    <div className={`p-3 ${stat.bg} rounded-xl border border-white/5`}> // JSX element: Icon container with dynamic background
                      <span className="text-2xl">{stat.icon}</span> // JSX expression: Renders stat icon
                    </div>
                    <div className="ml-4"> // JSX element: Text container with left margin
                      <p className="text-xs font-medium text-slate-400">{stat.label}</p> // JSX element: Stat label
                      <p className={`text-2xl font-bold ${stat.text} tracking-tight`}>{stat.value}</p> // JSX element: Stat value with dynamic color
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'upload': // Case: Upload tab
        return ( // Return statement: Returns upload JSX
          <div className="space-y-6"> // JSX element: Container with vertical spacing
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Upload Data</h2> // JSX element: Section heading
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> // JSX element: Responsive grid for upload cards
              {/* Students Upload */}
              <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 bg-slate-900/40 glow-card"> // JSX element: Students upload card
                <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center"><span className="mr-2">📋</span> Students Data</h3> // JSX element: Card heading with icon
                <p className="text-xs text-slate-400 mb-5 leading-relaxed"> // JSX element: Instructions paragraph
                  Select CSV file with: <code className="text-blue-400">Student ID</code>, <code className="text-blue-400">Name</code>, <code className="text-blue-400">Exam</code>, <code className="text-blue-400">Date</code> // JSX text: Required CSV columns
                </p>
                <div className="relative border-2 border-dashed border-slate-700/50 rounded-xl p-8 text-center hover:border-blue-500/40 transition-colors cursor-pointer bg-slate-900/20 group"> // JSX element: File drop zone with hover effects
                  <input // Input element: Hidden file input
                    type="file" // Attribute: Input type is file
                    accept=".csv" // Attribute: Accepts only CSV files
                    onChange={(e) => { // Event handler: Handles file selection
                      const file = e.target.files?.[0]; // Variable assignment: Gets first selected file
                      if (file) handleFileUpload(file, 'students'); // Conditional check: Calls upload handler if file exists
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" // Attribute: Styles input to cover drop zone
                  />
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</div> // JSX element: Document icon with hover scale
                  <p className="text-sm font-medium text-slate-300">Choose File or Drag & Drop</p> // JSX element: Drop zone text
                  <p className="text-xs text-slate-500 mt-1">CSV files only</p> // JSX element: File type hint
                </div>
                {students.length > 0 && ( // Conditional rendering: Shows success message if students loaded
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center text-xs text-blue-400"> // JSX element: Success message box
                    <span>✅ {students.length} students loaded. Ready to generate.</span> // JSX text: Success message with count
                  </div>
                )}
              </div>

              {/* Rooms Upload */}
              <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 bg-slate-900/40 glow-card"> // JSX element: Rooms upload card
                <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center"><span className="mr-2">🏢</span> Rooms Data</h3> // JSX element: Card heading with icon
                <p className="text-xs text-slate-400 mb-5 leading-relaxed"> // JSX element: Instructions paragraph
                  Select CSV file with: <code className="text-green-400">Room No</code>, <code className="text-green-400">Name</code>, <code className="text-green-400">Capacity</code>, <code className="text-green-400">Matrix</code> // JSX text: Required CSV columns
                </p>
                <div className="relative border-2 border-dashed border-slate-700/50 rounded-xl p-8 text-center hover:border-green-500/40 transition-colors cursor-pointer bg-slate-900/20 group"> // JSX element: File drop zone with hover effects
                  <input // Input element: Hidden file input
                    type="file" // Attribute: Input type is file
                    accept=".csv" // Attribute: Accepts only CSV files
                    onChange={(e) => { // Event handler: Handles file selection
                      const file = e.target.files?.[0]; // Variable assignment: Gets first selected file
                      if (file) handleFileUpload(file, 'rooms'); // Conditional check: Calls upload handler if file exists
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" // Attribute: Styles input to cover drop zone
                  />
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏢</div> // JSX element: Building icon with hover scale
                  <p className="text-sm font-medium text-slate-300">Choose File or Drag & Drop</p> // JSX element: Drop zone text
                  <p className="text-xs text-slate-500 mt-1">CSV files only</p> // JSX element: File type hint
                </div>
                {rooms.length > 0 && ( // Conditional rendering: Shows success message if rooms loaded
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center text-xs text-green-400"> // JSX element: Success message box
                    <span>✅ {rooms.length} rooms loaded. Ready to generate.</span> // JSX text: Success message with count
                  </div>
                )}
              </div>
            </div>

            {/* Download Templates */}
            <div className="glass-dark rounded-2xl border border-slate-800/40 p-5 bg-slate-900/20 flex items-center justify-between"> // JSX element: Template download bar
              <div> // JSX element: Text container
                <h3 className="text-sm font-bold text-slate-200">Need template files?</h3> // JSX element: Template heading
                <p className="text-xs text-slate-500 mt-0.5">Download layout structures for uploading correctly.</p> // JSX element: Template description
              </div>
              <div className="flex gap-2"> // JSX element: Button container with gap
                <a href="/data/templates/students_template.csv" download className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors text-slate-300">Students Template</a> // JSX element: Students template download link
                <a href="/data/templates/rooms_template.csv" download className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors text-slate-300">Rooms Template</a> // JSX element: Rooms template download link
              </div>
            </div>
          </div>
        );
      
      case 'rooms': // Case: Room View tab
        return ( // Return statement: Returns room view JSX
          <div className="space-y-6"> // JSX element: Container with vertical spacing
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Room View</h2> // JSX element: Section heading
            
            {seatingArrangement && seatingArrangement.length > 0 ? ( // Conditional rendering: Shows room grid if seating exists
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> // JSX element: Responsive grid for room cards
                {(() => { // IIFE: Immediately invoked function expression for complex logic
                  const roomMap = new Map<string, RoomInfo>(); // Object instantiation: Creates Map to extract unique rooms
                  seatingArrangement.forEach(student => { // Array method: Iterates over seating to build room map
                    if (!roomMap.has(student.roomNo)) { // Conditional check: If room not yet in map
                      roomMap.set(student.roomNo, { // Map method: Adds room to map
                        roomNo: student.roomNo, // Property: Room number
                        roomName: student.roomName, // Property: Room name
                        roomCapacity: student.roomCapacity, // Property: Room capacity
                        roomLayout: student.roomLayout // Property: Room layout
                      });
                    }
                  });
                  
                  return Array.from(roomMap.values()).map((room: RoomInfo, index) => { // Array method: Converts map to array and maps to JSX
                    const roomStudents = seatingArrangement.filter(s => s.roomNo === room.roomNo); // Array method: Filters students in this room
                    return ( // Return statement: Returns room card JSX
                      <div // JSX element: Room card
                        key={index} // Attribute: Unique key for React
                        className="glass-dark rounded-2xl border border-slate-800/60 p-6 cursor-pointer hover:border-blue-500/40 transition-all duration-300 glow-card bg-slate-900/40" // Attribute: Styling classes with hover effects
                        onClick={() => setSelectedRoom(room)} // Event handler: Sets selected room on click
                      >
                        <h3 className="text-lg font-bold text-slate-200">{room.roomName}</h3> // JSX element: Room name heading
                        <p className="text-xs text-slate-500">No: <span className="font-mono">{room.roomNo}</span></p> // JSX element: Room number with monospace font
                        <div className="mt-4 space-y-1"> // JSX element: Details container with spacing
                          <p className="text-xs text-slate-400 flex justify-between"><span>Capacity</span> <span className="text-slate-200">{room.roomCapacity}</span></p> // JSX element: Capacity row
                          <p className="text-xs text-slate-400 flex justify-between"><span>Layout</span> <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700/50">{room.roomLayout}</span></p> // JSX element: Layout row with badge
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-800/60"> // JSX element: Footer section with top border
                          <span className="inline-block bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-full border border-blue-500/20"> // JSX element: Student count badge
                            {roomStudents.length} students assigned // JSX text: Student count
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : ( // Else block: Shows empty state if no seating data
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center"> // JSX element: Empty state container
                <p className="text-slate-400 text-sm"> // JSX element: Empty state text
                  {isLoadingFromServer ? 'Loading seating data...' : 'No seating data found. Upload data and generate seating arrangement first.'} // JSX expression: Shows loading or empty message
                </p>
              </div>
            )}

            {/* Room Details Modal */}
            {selectedRoom && ( // Conditional rendering: Shows modal if room selected
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"> // JSX element: Modal overlay with backdrop blur
                <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-slate-900/90 shadow-2xl"> // JSX element: Modal content container
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60"> // JSX element: Modal header with bottom border
                    <div> // JSX element: Title container
                      <h3 className="text-xl font-bold text-white">{selectedRoom.roomName}</h3> // JSX element: Room name title
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedRoom.roomNo}</p> // JSX element: Room number
                    </div>
                    <button // Button element: Close button
                      onClick={() => setSelectedRoom(null)} // Event handler: Clears selected room on click
                      className="text-slate-500 hover:text-white transition-colors text-xl p-1 hover:bg-slate-800/40 rounded-lg" // Attribute: Styling with hover effects
                    >
                      ✕ // JSX text: Close icon
                    </button>
                  </div>
                  
                  {seatingArrangement ? ( // Conditional rendering: Shows room layout if seating exists
                    <div> // JSX element: Room layout container
                      <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400"> // JSX element: Student count info box
                        Found <span className="font-bold">{seatingArrangement.filter(s => s.roomNo === selectedRoom.roomNo).length}</span> students in this room // JSX text: Student count
                      </div>
                      
                      {/* Visual Room Layout */}
                      <div className="mb-6 bg-slate-900/40 border border-slate-800/40 rounded-xl p-4"> // JSX element: Floor map container
                        <h4 className="text-sm font-bold text-slate-300 mb-4">Floor Map</h4> // JSX element: Floor map heading
                        <RoomLayout // JSX element: RoomLayout component for visual seat display
                          roomNo={selectedRoom.roomNo} // Prop: Room number
                          roomName={selectedRoom.roomName} // Prop: Room name
                          seatMatrix={selectedRoom.roomLayout} // Prop: Seat matrix string
                          students={seatingArrangement.filter(s => s.roomNo === selectedRoom.roomNo)} // Prop: Students in this room
                        />
                      </div>
                    </div>
                  ) : ( // Else block: Shows warning if no seating
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center"> // JSX element: Warning box
                      <p className="text-yellow-400 text-sm">No seating arrangement generated yet.</p> // JSX text: Warning message
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'seating': // Case: Seating tab
        return ( // Return statement: Returns seating arrangement JSX
          <div className="space-y-6"> // JSX element: Container with vertical spacing
            <div className="flex justify-between items-center mb-6"> // JSX element: Header with space-between alignment
              <h2 className="text-2xl font-bold tracking-tight text-white">Seating Arrangement</h2> // JSX element: Section heading
              <div className="flex gap-3"> // JSX element: Button container with gap
                <button // Button element: Generate seating button
                  onClick={generateSeating} // Event handler: Calls generateSeating function
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-green-600/20 flex items-center gap-2 text-sm cursor-pointer" // Attribute: Styling with hover effects and shadow
                >
                  <span>⚡</span> Generate Seating // JSX text: Button label with icon
                </button>
                
                {/* CSV Import */}
                <div className="relative"> // JSX element: Relative container for file input overlay
                  <input // Input element: Hidden file input for CSV import
                    type="file" // Attribute: Input type is file
                    accept=".csv" // Attribute: Accepts only CSV files
                    onChange={(e) => { // Event handler: Handles file selection
                      const file = e.target.files?.[0]; // Variable assignment: Gets first selected file
                      if (file) handleImportCSV(file); // Conditional check: Calls import handler if file exists
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" // Attribute: Styles input to cover button
                    disabled={isImporting} // Attribute: Disables input during import
                  />
                  <button // Button element: Import CSV button
                    disabled={isImporting} // Attribute: Disables button during import
                    className="glass font-semibold text-slate-200 px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-sm border border-slate-700/50 cursor-pointer hover:bg-slate-800/40" // Attribute: Styling with disabled state
                  >
                    {isImporting ? ( // Conditional rendering: Shows loading spinner if importing
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> // JSX element: Loading spinner
                        Importing... // JSX text: Loading text
                      </>
                    ) : ( // Else block: Shows normal button text
                      <>📥 Import CSV</> // JSX text: Button label with icon
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {seatingArrangement ? ( // Conditional rendering: Shows seating data if generated
              <div className="space-y-6"> // JSX element: Container with vertical spacing
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between"> // JSX element: Success banner
                  <div> // JSX element: Text container
                    <p className="text-green-400 font-bold text-sm">✅ Generated successfully!</p> // JSX element: Success message
                    <p className="text-xs text-slate-400 mt-0.5">Total students assigned: {seatingArrangement.length}</p> // JSX element: Student count
                  </div>
                </div>
                
                {/* Distribution Summary */}
                <div className="glass-dark border border-slate-800/60 rounded-2xl p-5 bg-slate-900/40"> // JSX element: Distribution summary card
                  <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center"><span className="mr-2">📊</span> Room Allocation Summary</h4> // JSX element: Summary heading with icon
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"> // JSX element: Responsive grid for room stats
                    {rooms.map(room => { // Array method: Maps rooms to stat cards
                      const studentsInRoom = seatingArrangement.filter(s => s.roomNo === room['Room No']).length; // Array method: Counts students in room
                      const cap = parseInt(room['Number of Seats']); // Function call: Parses room capacity
                      const utilization = cap > 0 ? ((studentsInRoom / cap) * 100).toFixed(1) : "0"; // Ternary: Calculates utilization percentage
                      return ( // Return statement: Returns room stat card JSX
                        <div key={room['Room No']} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/40"> // JSX element: Room stat card
                          <div className="font-bold text-slate-300">{room['Room No']}</div> // JSX element: Room number
                          <div className="text-slate-500 mt-1">{studentsInRoom}/{cap} <span className="text-[10px]">seats</span></div> // JSX element: Student count
                          <div className="mt-2 w-full bg-slate-800 rounded-full h-1"> // JSX element: Progress bar background
                            <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${Math.min(100, parseFloat(utilization))}%` }}></div> // JSX element: Progress bar fill with dynamic width
                          </div>
                          <div className="text-blue-400 mt-1 font-medium">{utilization}%</div> // JSX element: Utilization percentage
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Table wrapper */}
                <div className="glass-dark border border-slate-800/60 rounded-2xl bg-slate-900/40 overflow-hidden"> // JSX element: Table container with overflow hidden
                  <div className="p-4 border-b border-slate-800/60 flex justify-between items-center"> // JSX element: Table header with bottom border
                    <h3 className="text-sm font-bold text-slate-200">Seating Roster</h3> // JSX element: Table title
                    <span className="text-xs text-slate-500">{seatingArrangement.length} records</span> // JSX element: Record count
                  </div>
                  <div className="overflow-x-auto"> // JSX element: Scrollable container for table
                    <table className="min-w-full table-auto text-left"> // JSX element: HTML table with auto layout
                      <thead> // JSX element: Table header section
                        <tr className="bg-slate-900/80 border-b border-slate-800/80"> // JSX element: Header row with background and border
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">ID</th> // JSX element: ID column header
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">Student Name</th> // JSX element: Name column header
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">Exam</th> // JSX element: Exam column header
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">Room</th> // JSX element: Room column header
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">Seat</th> // JSX element: Seat column header
                          <th className="px-4 py-3 text-xs font-bold text-slate-400">Location</th> // JSX element: Location column header
                        </tr>
                      </thead>
                      <tbody> // JSX element: Table body section
                        {seatingArrangement.map((assignment, index) => ( // Array method: Maps assignments to table rows
                          <tr key={index} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors text-sm"> // JSX element: Table row with hover effect
                            <td className="px-4 py-3 font-mono text-slate-400 text-xs">{assignment.studentId}</td> // JSX element: Student ID cell
                            <td className="px-4 py-3 font-medium text-slate-200">{assignment.studentName}</td> // JSX element: Student name cell
                            <td className="px-4 py-3"> // JSX element: Exam cell
                              <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[11px] border border-blue-500/10"> // JSX element: Exam badge
                                {assignment.studentExam} // JSX expression: Exam subject
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-300">{assignment.roomNo}</td> // JSX element: Room number cell
                            <td className="px-4 py-3 font-bold text-green-400">{assignment.seatNo}</td> // JSX element: Seat number cell
                            <td className="px-4 py-3 text-xs text-slate-500"> // JSX element: Location cell
                              Row {assignment.row}, Col {assignment.column} // JSX text: Row and column
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex gap-3"> // JSX element: Button container with gap
                  <button // Button element: Export CSV button
                    onClick={handleExportCSV} // Event handler: Calls export function
                    disabled={isExporting} // Attribute: Disables button during export
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50" // Attribute: Styling with disabled state
                  >
                    📄 Export CSV // JSX text: Button label with icon
                  </button>
                  <button className="glass text-slate-300 hover:bg-slate-800/40 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700/50 cursor-pointer"> // Button element: Print button
                    🖨️ Print Chart // JSX text: Button label with icon
                  </button>
                </div>
              </div>
            ) : ( // Else block: Shows empty state if no seating data
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center"> // JSX element: Empty state container
                <p className="text-slate-400 text-sm">Please upload data and click "Generate Seating" to view arrangement.</p> // JSX element: Empty state message
              </div>
            )}
          </div>
        );
      
      case 'reports': // Case: Reports tab
        return ( // Return statement: Returns reports JSX
          <div className="space-y-6"> // JSX element: Container with vertical spacing
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Reports & Analytics</h2> // JSX element: Section heading
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center"> // JSX element: Placeholder container
              <p className="text-slate-400 text-sm">Analytical dashboards are fully functional in underlying engine. Highcharts integration pending design specs.</p> // JSX element: Placeholder message
            </div>
          </div>
        );
      
      default: // Default case: Fallback for unknown tabs
        return null; // Return statement: Returns null (renders nothing)
    }
  };

  return ( // Return statement: Returns main JSX for component
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-mesh relative overflow-hidden antialiased font-sans"> // JSX element: Main container with full height and dark theme
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full filter blur-[120px] -z-10 animate-pulse"></div> // JSX element: Blue gradient blob with blur and pulse animation
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full filter blur-[120px] -z-10 animate-pulse delay-1000"></div> // JSX element: Purple gradient blob with blur, pulse animation, and delay

      {/* Header */}
      <header className="backdrop-blur-md border-b border-slate-900/50 sticky top-0 z-50 bg-slate-950/70"> // JSX element: Header with backdrop blur, border, sticky positioning, and z-index
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> // JSX element: Container with max-width and responsive padding
          <div className="flex justify-between items-center py-5"> // JSX element: Flex container for header content with space-between alignment
            <div> // JSX element: Logo and title container
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2"> // JSX element: Heading with logo and title
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">E</div> // JSX element: Logo div with gradient background
                <span>ExamSeat <span className="text-sm font-semibold text-blue-400">Admin</span></span> // JSX text: Brand name with admin badge
              </h1>
              {isLoadingFromServer && ( // Conditional rendering: Shows loading spinner if syncing
                <div className="flex items-center text-blue-400 mt-1"> // JSX element: Loading indicator container
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-2"></div> // JSX element: Spinning loader
                  <span className="text-xs">Syncing with server...</span> // JSX text: Loading message
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4"> // JSX element: Header right section with spacing
              <span className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">Admin Mode</span> // JSX element: Admin mode badge
              <button className="bg-red-600/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm hover:bg-red-600/20 transition-colors"> // Button element: Logout button
                Logout // JSX text: Button label
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> // JSX element: Main content container with max-width and padding
        <div className="flex items-start"> // JSX element: Flex container for sidebar and main content
          {/* Sidebar */}
          <div className="w-56 glass-dark rounded-2xl p-4 mr-8 border border-slate-800/40 sticky top-24 bg-slate-900/30"> // JSX element: Sidebar with glass effect, sticky positioning
            <nav className="space-y-1.5"> // JSX element: Navigation container with vertical spacing
              {tabs.map((tab) => ( // Array method: Maps tabs to navigation buttons
                <button // Button element: Navigation button
                  key={tab.id} // Attribute: Unique key for React
                  onClick={() => setActiveTab(tab.id)} // Event handler: Sets active tab on click
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 cursor-pointer ${ // Attribute: Dynamic styling based on active state
                    activeTab === tab.id // Conditional: If this is the active tab
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]' // Active tab styling with glow
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200' // Inactive tab styling with hover
                  }`}
                >
                  <span className="mr-3 text-lg opacity-80">{tab.icon}</span> // JSX element: Tab icon
                  <span className="text-sm font-semibold">{tab.label}</span> // JSX element: Tab label
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1"> // JSX element: Main content area with flex-grow
            {renderTabContent()} // JSX expression: Renders content based on active tab
          </div>
        </div>
      </div>
    </div> // JSX closing tag: Closes main container div
  ); // JSX closing tag: Closes return statement
} // Function closing brace: End of AdminDashboard component
