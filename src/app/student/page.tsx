'use client'; // Directive: Marks this file as a client-side component (can use hooks and browser APIs)

import React, { useState } from 'react'; // Import statement: Imports React and useState hook for state management
import { searchStudent, loadSeatingData } from '../../data/seatingStorage'; // Import statement: Imports functions for student search and data loading
import { loadSeatingDataFromStorage, searchStudentInSeating } from '../../utils/csvUtils'; // Import statement: Imports CSV utility functions for data handling
import { loadSeatingFromServer, searchStudentOnServer, checkServerData } from '../../services/serverStorage'; // Import statement: Imports server storage functions for backend integration

/**
 * Student Interface Page
 * 
 * This page provides students with access to their seating information,
 * exam details, and other relevant information.
 */
export default function StudentInterface() { // Function declaration: Default export of StudentInterface component
  const [studentId, setStudentId] = useState(''); // Hook: State for student ID input (default: empty string)
  const [studentInfo, setStudentInfo] = useState<any>(null); // Hook: State for student information (default: null)
  const [seatingInfo, setSeatingInfo] = useState<any>(null); // Hook: State for seating information (default: null)
  const [hasSeatingData, setHasSeatingData] = useState(false); // Hook: State for data availability flag (default: false)
  const [error, setError] = useState(''); // Hook: State for error message (default: empty string)

  // Check if seating data exists on component mount
  React.useEffect(() => { // Hook: Effect hook that runs on component mount
    const checkData = async () => { // Function declaration: Async function to check data availability
      const localData = loadSeatingData() || loadSeatingDataFromStorage(); // Function call: Checks local storage for seating data
      if (localData) { // Conditional check: If local data exists
        setHasSeatingData(true); // State setter: Sets data availability flag to true
        return; // Return statement: Exits function early
      }
      
      try { // Try block: Begins server data check
        const serverHasData = await checkServerData(); // Async function call: Checks server for data
        setHasSeatingData(serverHasData); // State setter: Sets data availability flag from server
      } catch (error) { // Catch block: Handles server check errors
        console.error('Error checking server data:', error); // Console error: Logs error details
        setHasSeatingData(false); // State setter: Sets data availability flag to false
      }
    };
    
    checkData(); // Function call: Executes data check function
  }, []); // Dependency array: Empty array means effect runs only on mount

  const handleSearch = async () => { // Function declaration: Async function to handle student search
    setError(''); // State setter: Clears error message
    setStudentInfo(null); // State setter: Clears student info
    setSeatingInfo(null); // State setter: Clears seating info
    
    if (!studentId.trim()) { // Conditional check: Validates student ID input is not empty
      setError('Please enter a student ID'); // State setter: Sets error message
      return; // Return statement: Exits function early
    }

    const localData = loadSeatingData() || loadSeatingDataFromStorage(); // Function call: Checks local storage for data
    let student = null; // Variable declaration: Variable to hold student data
    
    if (localData && localData.seatingArrangement) { // Conditional check: If local data has seating arrangement
      student = searchStudent(studentId) || searchStudentInSeating(studentId, localData.seatingArrangement); // Function call: Searches for student in local data
    }
    
    if (!student) { // Conditional check: If student not found locally
      try { // Try block: Begins server search
        student = await searchStudentOnServer(studentId); // Async function call: Searches server for student
      } catch (error) { // Catch block: Handles server search errors
        console.error('Error searching on server:', error); // Console error: Logs error details
      }
    }
    
    if (!student) { // Conditional check: If student still not found
      setError('No seating arrangement data found. Please contact administrator.'); // State setter: Sets error message
      return; // Return statement: Exits function early
    }
    
    if (student) { // Conditional check: If student data found
      setStudentInfo({ // State setter: Sets student info state
        studentId: student.studentId, // Property: Student ID
        studentName: student.studentName, // Property: Student name
        studentExam: student.studentExam, // Property: Exam subject
        date: student.date // Property: Exam date
      });
      
      setSeatingInfo({ // State setter: Sets seating info state
        studentId: student.studentId, // Property: Student ID
        studentName: student.studentName, // Property: Student name
        studentExam: student.studentExam, // Property: Exam subject
        date: student.date, // Property: Exam date
        roomNo: student.roomNo, // Property: Room number
        roomName: student.roomName, // Property: Room name
        seatNo: student.seatNo, // Property: Seat number
        row: student.row, // Property: Row number
        column: student.column, // Property: Column number
        roomCapacity: student.roomCapacity, // Property: Room capacity
        roomLayout: student.roomLayout, // Property: Room layout
        qrCode: `QR_${student.studentId}_${student.roomNo}_${student.seatNo}` // Property: Generated QR code string
      });
    } else { // Else block: Fallback error case
      setError(`No seating information found for student ID: ${studentId}`); // State setter: Sets error message with student ID
    }
  };

  return ( // Return statement: Returns main JSX for component
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-mesh relative overflow-hidden antialiased font-sans"> // JSX element: Main container with full height and dark theme
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full filter blur-[120px] -z-10 animate-pulse"></div> // JSX element: Blue gradient blob with blur and pulse animation
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full filter blur-[120px] -z-10 bg-purple-600/10 animate-pulse delay-1000"></div> // JSX element: Purple gradient blob with blur, pulse animation, and delay

      {/* Header */}
      <header className="backdrop-blur-md border-b border-slate-900/50 sticky top-0 z-50 bg-slate-950/70"> // JSX element: Header with backdrop blur, border, sticky positioning, and z-index
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> // JSX element: Container with max-width and responsive padding
          <div className="flex justify-between items-center py-5"> // JSX element: Flex container for header content with space-between alignment
            <div> // JSX element: Logo and title container
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2"> // JSX element: Heading with logo and title
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">E</div> // JSX element: Logo div with gradient background
                <span>ExamSeat <span className="text-sm font-semibold text-purple-400">Student</span></span> // JSX text: Brand name with student badge
              </h1>
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">Student Access</div> // JSX element: Access mode badge
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> // JSX element: Main content container with max-width and padding
        {/* Search Section */}
        <div className="glass-dark rounded-2xl border border-slate-800/60 p-8 mb-8 bg-slate-900/40 glow-card"> // JSX element: Search card with glass effect
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Find Your Seat</h2> // JSX element: Section heading
          <p className="text-xs text-slate-400 mb-6">Enter your ID to retrieve real-time arrangement details.</p> // JSX element: Description text
          
          {/* Data Status Indicator */}
          <div className="mb-6"> // JSX element: Status indicator container
            {hasSeatingData ? ( // Conditional rendering: Shows active status if data exists
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20"> // JSX element: Active status badge
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span> // JSX element: Green dot indicator
                Seating data active // JSX text: Status message
              </div>
            ) : ( // Else block: Shows waiting status if no data
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"> // JSX element: Waiting status badge
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5 animate-pulse"></span> // JSX element: Pulsing yellow dot
                Awaiting arrangement // JSX text: Status message
              </div>
            )}
          </div>
          
          <div className="flex gap-4"> // JSX element: Input and button container with gap
            <div className="flex-1"> // JSX element: Input container with flex-grow
              <input // Input element: Student ID text input
                type="text" // Attribute: Input type is text
                id="studentId" // Attribute: Input ID for label association
                value={studentId} // Attribute: Controlled value from state
                onChange={(e) => setStudentId(e.target.value)} // Event handler: Updates state on input change
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }} // Event handler: Triggers search on Enter key
                placeholder="Enter Student ID (e.g., STU001)" // Attribute: Placeholder text
                className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm" // Attribute: Styling with focus states
              />
            </div>
            <button // Button element: Search button
              onClick={handleSearch} // Event handler: Calls search function
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 cursor-pointer" // Attribute: Styling with hover effects and shadow
            >
              Search // JSX text: Button label
            </button>
          </div>
          
          {/* Error Display */}
          {error && ( // Conditional rendering: Shows error if error state is set
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-xs text-red-400"> // JSX element: Error message box
              <span className="mr-2">⚠️</span> {error} // JSX text: Warning icon and error message
            </div>
          )}
        </div>

        {/* Info Cards */}
        {seatingInfo && ( // Conditional rendering: Shows info cards if seating info exists
          <div className="space-y-6 animate-fadeIn"> // JSX element: Container with vertical spacing and fade animation
            <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 bg-slate-900/40 relative overflow-hidden"> // JSX element: Exam info card with glass effect
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-3xl"></div> // JSX element: Decorative gradient blob
              <h3 className="text-sm font-bold text-slate-400 mb-4 tracking-wider uppercase">Exam Information</h3> // JSX element: Card heading
              <div className="grid grid-cols-2 gap-4"> // JSX element: Grid for info items
                <div><p className="text-xs text-slate-500">Student</p><p className="text-base font-bold text-white">{seatingInfo.studentName}</p></div> // JSX element: Student name
                <div><p className="text-xs text-slate-500">ID</p><p className="text-base font-mono text-slate-300">{seatingInfo.studentId}</p></div> // JSX element: Student ID
                <div><p className="text-xs text-slate-500">Exam</p><p className="text-base font-bold text-blue-400">{seatingInfo.studentExam}</p></div> // JSX element: Exam subject
                <div><p className="text-xs text-slate-500">Date</p><p className="text-base font-bold text-white">{seatingInfo.date}</p></div> // JSX element: Exam date
              </div>
            </div>

            <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 bg-slate-900/40 relative overflow-hidden"> // JSX element: Seating details card with glass effect
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full filter blur-3xl"></div> // JSX element: Decorative gradient blob
              <h3 className="text-sm font-bold text-slate-400 mb-4 tracking-wider uppercase">Seating Details</h3> // JSX element: Card heading
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> // JSX element: Responsive grid for seating info
                <div> // JSX element: Room info container
                  <p className="text-xs text-slate-500">Exam Room</p> // JSX element: Room label
                  <p className="text-3xl font-black text-white tracking-tight mt-1">{seatingInfo.roomNo}</p> // JSX element: Room number
                  <p className="text-xs text-slate-400 mt-1 font-medium">{seatingInfo.roomName}</p> // JSX element: Room name
                </div>
                <div> // JSX element: Seat info container
                  <p className="text-xs text-slate-500">Your Seat</p> // JSX element: Seat label
                  <p className="text-4xl font-black text-green-400 tracking-tight mt-1">{seatingInfo.seatNo}</p> // JSX element: Seat number
                  <p className="text-xs text-slate-400 mt-1">Row {seatingInfo.row}, Col {seatingInfo.column}</p> // JSX element: Row and column
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 bg-slate-900/40 flex items-center justify-between"> // JSX element: QR code card with flex layout
              <div className="flex items-center space-x-4"> // JSX element: QR and text container with spacing
                <div className="bg-white p-2 rounded-xl"> // JSX element: White QR container
                  {/* Mock QR box, just drawing with CSS or small squares */}
                  <div className="w-16 h-16 bg-slate-950 flex flex-col items-center justify-center p-1 rounded"> // JSX element: Dark QR box
                    <div className="grid grid-cols-3 gap-0.5 w-full h-full"> // JSX element: 3x3 grid for QR pattern
                      {[1,2,3,4,5,6,7,8,9].map((_, i) => <div key={i} className="bg-white rounded-[1px]"></div>)} // Array method: Maps to create 9 white squares
                    </div>
                  </div>
                </div>
                <div> // JSX element: QR description container
                  <p className="text-sm font-bold text-white">Digital Seat Ticket</p> // JSX element: Ticket title
                  <p className="text-xs text-slate-500 mt-0.5">Scan at entry to verify alignment</p> // JSX element: Description text
                  <code className="text-[10px] text-slate-600 font-mono mt-1 block">{seatingInfo.qrCode}</code> // JSX element: QR code string
                </div>
              </div>
              <div> // JSX element: Download button container
                <button className="glass text-slate-300 hover:bg-slate-800/40 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700/50 cursor-pointer">Download</button> // Button element: Download button
              </div>
            </div>

            {/* Instructions */}
            <div className="glass-dark rounded-2xl border border-slate-800/40 p-5 bg-slate-900/20"> // JSX element: Instructions card
              <h4 className="text-xs font-bold text-slate-400 mb-3 tracking-wider uppercase">Important Checklist</h4> // JSX element: Instructions heading
              <ul className="space-y-2 text-xs text-slate-300"> // JSX element: Unordered list with spacing
                <li className="flex items-start"><span className="text-blue-400 mr-2">•</span> Arrive 15 mins before strictly.</li> // JSX element: Checklist item 1
                <li className="flex items-start"><span className="text-blue-400 mr-2">•</span> Bring physical ID cards.</li> // JSX element: Checklist item 2
                <li className="flex items-start"><span className="text-blue-400 mr-2">•</span> Mobiles powered off.</li> // JSX element: Checklist item 3
              </ul>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!seatingInfo && ( // Conditional rendering: Shows help section if no seating info
          <div className="mt-8 bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 text-center"> // JSX element: Help info box
            <h3 className="text-sm font-bold text-blue-400">Need Help?</h3> // JSX element: Help heading
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Contact examination cell if you have lookup issues or details mismatch.</p> // JSX element: Help description
          </div>
        )}
      </div>
    </div> // JSX closing tag: Closes main container div
  ); // JSX closing tag: Closes return statement
} // Function closing brace: End of StudentInterface component
