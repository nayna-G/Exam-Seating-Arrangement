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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exam Seating System</h1>
              <p className="text-gray-600">Student Portal</p>
            </div>
            <div className="text-sm text-gray-600">
              Find your exam seating arrangement
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Find Your Seat</h2>
          
          {/* Data Status Indicator */}
          <div className="mb-6">
            {hasSeatingData ? (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Seating data available
              </div>
            ) : (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                No seating data - Contact administrator
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your Student ID or Roll Number
              </label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., STU001 or 2024001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Student Information */}
        {studentInfo && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Student ID</label>
                <p className="text-lg text-gray-900">{studentInfo.studentId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="text-lg text-gray-900">{studentInfo.studentName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Exam</label>
                <p className="text-lg text-gray-900">{studentInfo.studentExam}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Date</label>
                <p className="text-lg text-gray-900">{studentInfo.date}</p>
              </div>
            </div>
          </div>
        )}

        {/* Seating Information */}
        {seatingInfo && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Exam Seating Details</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Exam Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Exam Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Exam</label>
                    <p className="text-lg text-gray-900">{seatingInfo.studentExam}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Date</label>
                    <p className="text-lg text-gray-900">{seatingInfo.date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Student ID</label>
                    <p className="text-lg text-gray-900">{seatingInfo.studentId}</p>
                  </div>
                </div>
              </div>

              {/* Seating Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Seating Information</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-600 mb-1">Room Number</label>
                    <p className="text-2xl font-bold text-blue-800">{seatingInfo.roomNo}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Room Name</label>
                    <p className="text-lg text-gray-900">{seatingInfo.roomName}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-600 mb-1">Seat Number</label>
                    <p className="text-3xl font-bold text-green-800">{seatingInfo.seatNo}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <label className="block text-sm font-medium text-yellow-600 mb-1">Row</label>
                      <p className="text-xl font-bold text-yellow-800">{seatingInfo.row}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <label className="block text-sm font-medium text-purple-600 mb-1">Column</label>
                      <p className="text-xl font-bold text-purple-800">{seatingInfo.column}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Position Summary</label>
                    <p className="text-lg text-gray-800">
                      <strong>Room {seatingInfo.roomNo}</strong> - <strong>Seat {seatingInfo.seatNo}</strong> - 
                      <strong> Row {seatingInfo.row}, Column {seatingInfo.column}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">QR Code</h4>
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="w-24 h-24 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-600">QR Code</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scan this QR code to verify your seat</p>
                  <p className="text-xs text-gray-500 font-mono">{seatingInfo.qrCode}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Important Instructions</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Arrive at least 15 minutes before the exam starts
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Bring your student ID and required stationery
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Mobile phones must be switched off during the exam
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Follow the seating arrangement strictly
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Help?</h3>
          <p className="text-blue-700 text-sm">
            If you have any questions about your seating arrangement or exam details, 
            please contact the examination office or your class teacher.
          </p>
        </div>
      </div>
    </div>
  );
}
