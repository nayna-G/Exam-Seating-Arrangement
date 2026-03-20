'use client';

import React, { useState } from 'react';
import { searchStudent, loadSeatingData } from '../../data/seatingStorage';
import { loadSeatingDataFromStorage, searchStudentInSeating } from '../../utils/csvUtils';
import { loadSeatingFromServer, searchStudentOnServer, checkServerData } from '../../services/serverStorage';

/**
 * Student Interface Page
 * 
 * This page provides students with access to their seating information,
 * exam details, and other relevant information.
 */
export default function StudentInterface() {
  const [studentId, setStudentId] = useState('');
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [seatingInfo, setSeatingInfo] = useState<any>(null);
  const [hasSeatingData, setHasSeatingData] = useState(false);
  const [error, setError] = useState('');

  // Check if seating data exists on component mount
  React.useEffect(() => {
    const checkData = async () => {
      // First check local storage
      const localData = loadSeatingData() || loadSeatingDataFromStorage();
      if (localData) {
        setHasSeatingData(true);
        return;
      }
      
      // Then check server
      try {
        const serverHasData = await checkServerData();
        setHasSeatingData(serverHasData);
      } catch (error) {
        console.error('Error checking server data:', error);
        setHasSeatingData(false);
      }
    };
    
    checkData();
  }, []);

  const handleSearch = async () => {
    setError('');
    setStudentInfo(null);
    setSeatingInfo(null);
    
    if (!studentId.trim()) {
      setError('Please enter a student ID');
      return;
    }

    // Check if seating data exists
    const localData = loadSeatingData() || loadSeatingDataFromStorage();
    let student = null;
    
    if (localData && localData.seatingArrangement) {
      // Search in local data
      student = searchStudent(studentId) || searchStudentInSeating(studentId, localData.seatingArrangement);
    }
    
    if (!student) {
      // If not found locally, search on server
      try {
        student = await searchStudentOnServer(studentId);
      } catch (error) {
        console.error('Error searching on server:', error);
      }
    }
    
    if (!student) {
      setError('No seating arrangement data found. Please contact administrator.');
      return;
    }
    
    if (student) {
      setStudentInfo({
        studentId: student.studentId,
        studentName: student.studentName,
        studentExam: student.studentExam,
        date: student.date
      });
      
      setSeatingInfo({
        studentId: student.studentId,
        studentName: student.studentName,
        studentExam: student.studentExam,
        date: student.date,
        roomNo: student.roomNo,
        roomName: student.roomName,
        seatNo: student.seatNo,
        row: student.row,
        column: student.column,
        roomCapacity: student.roomCapacity,
        roomLayout: student.roomLayout,
        qrCode: `QR_${student.studentId}_${student.roomNo}_${student.seatNo}`
      });
    } else {
      setError(`No seating information found for student ID: ${studentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-mesh relative overflow-hidden antialiased font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full filter blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full filter blur-[120px] -z-10 bg-purple-600/10 animate-pulse delay-1000"></div>

      {/* Header */}
      <header className="backdrop-blur-md border-b border-slate-900/50 sticky top-0 z-50 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">E</div>
                <span>ExamSeat <span className="text-sm font-semibold text-purple-400">Student</span></span>
              </h1>
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">Student Access</div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="glass-dark rounded-2xl border border-slate-800/60 p-8 mb-8 bg-slate-900/40 glow-card">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Find Your Seat</h2>
          <p className="text-xs text-slate-400 mb-6">Enter your ID to retrieve real-time arrangement details.</p>
          
          {/* Data Status Indicator */}
          <div className="mb-6">
            {hasSeatingData ? (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                Seating data active
              </div>
            ) : (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5 animate-pulse"></span>
                Awaiting arrangement
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Enter Student ID (e.g., STU001)"
                className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Search
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-xs text-red-400">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}
        </div>

        {/* Info Cards */}
        {seatingInfo && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 bg-slate-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-3xl"></div>
              <h3 className="text-sm font-bold text-slate-400 mb-4 tracking-wider uppercase">Exam Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500">Student</p><p className="text-base font-bold text-white">{seatingInfo.studentName}</p></div>
                <div><p className="text-xs text-slate-500">ID</p><p className="text-base font-mono text-slate-300">{seatingInfo.studentId}</p></div>
                <div><p className="text-xs text-slate-500">Exam</p><p className="text-base font-bold text-blue-400">{seatingInfo.studentExam}</p></div>
                <div><p className="text-xs text-slate-500">Date</p><p className="text-base font-bold text-white">{seatingInfo.date}</p></div>
              </div>
            </div>

            <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 bg-slate-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full filter blur-3xl"></div>
              <h3 className="text-sm font-bold text-slate-400 mb-4 tracking-wider uppercase">Seating Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500">Exam Room</p>
                  <p className="text-3xl font-black text-white tracking-tight mt-1">{seatingInfo.roomNo}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{seatingInfo.roomName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Your Seat</p>
                  <p className="text-4xl font-black text-green-400 tracking-tight mt-1">{seatingInfo.seatNo}</p>
                  <p className="text-xs text-slate-400 mt-1">Row {seatingInfo.row}, Col {seatingInfo.column}</p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="glass-dark rounded-2xl border border-slate-800/60 p-6 bg-slate-900/40 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-2 rounded-xl">
                  {/* Mock QR box, just drawing with CSS or small squares */}
                  <div className="w-16 h-16 bg-slate-950 flex flex-col items-center justify-center p-1 rounded">
                    <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                      {[1,2,3,4,5,6,7,8,9].map((_, i) => <div key={i} className="bg-white rounded-[1px]"></div>)}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Digital Seat Ticket</p>
                  <p className="text-xs text-slate-500 mt-0.5">Scan at entry to verify alignment</p>
                  <code className="text-[10px] text-slate-600 font-mono mt-1 block">{seatingInfo.qrCode}</code>
                </div>
              </div>
              <div>
                <button className="glass text-slate-300 hover:bg-slate-800/40 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700/50 cursor-pointer">Download</button>
              </div>
            </div>

            {/* Instructions */}
            <div className="glass-dark rounded-2xl border border-slate-800/40 p-5 bg-slate-900/20">
              <h4 className="text-xs font-bold text-slate-400 mb-3 tracking-wider uppercase">Important Checklist</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start"><span className="text-blue-400 mr-2">•</span> Arrive 15 mins before strictly.</li>
                <li className="flex items-start"><span className="text-blue-400 mr-2">•</span> Bring physical ID cards.</li>
                <li className="flex items-start"><span className="text-blue-400 mr-2">•</span> Mobiles powered off.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!seatingInfo && (
          <div className="mt-8 bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 text-center">
            <h3 className="text-sm font-bold text-blue-400">Need Help?</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Contact examination cell if you have lookup issues or details mismatch.</p>
          </div>
        )}
      </div>
    </div>
  );
 }
