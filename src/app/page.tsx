import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exam Seating Arrangement System</h1>
              <p className="text-gray-600">Automated seating management for educational institutions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to the Exam Seating System
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your examination process with our automated seating arrangement system. 
            Generate fair, randomized seating charts that save time and prevent cheating.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Automated</h3>
            <p className="text-gray-600">
              Generate seating arrangements in seconds with our optimized algorithms
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair & Random</h3>
            <p className="text-gray-600">
              Ensure unbiased seating with our randomization algorithms
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Access</h3>
            <p className="text-gray-600">
              Students can easily find their seats with QR codes and mobile-friendly interface
            </p>
          </div>
        </div>

        {/* Access Buttons */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Choose Your Access Level</h3>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/admin"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👨‍💼</span>
                <div className="text-left">
                  <div>Administrator</div>
                  <div className="text-sm font-normal opacity-90">Manage students, rooms, and exams</div>
                </div>
              </div>
            </Link>
            
            <Link
              href="/student"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👨‍🎓</span>
                <div className="text-left">
                  <div>Student Portal</div>
                  <div className="text-sm font-normal opacity-90">Find your exam seat</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* System Features */}
        <div className="mt-20 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">System Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">👥</div>
              <h4 className="font-semibold text-gray-900">Student Management</h4>
              <p className="text-sm text-gray-600">Add, edit, and manage student information</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🏢</div>
              <h4 className="font-semibold text-gray-900">Room Configuration</h4>
              <p className="text-sm text-gray-600">Set up examination halls and capacities</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📅</div>
              <h4 className="font-semibold text-gray-900">Exam Scheduling</h4>
              <p className="text-sm text-gray-600">Plan and schedule examinations</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🪑</div>
              <h4 className="font-semibold text-gray-900">Seating Generation</h4>
              <p className="text-sm text-gray-600">Auto-generate fair seating arrangements</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900">Reports & Analytics</h4>
              <p className="text-sm text-gray-600">Generate detailed reports and insights</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold text-gray-900">Security Features</h4>
              <p className="text-sm text-gray-600">QR codes and secure access controls</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h4 className="font-semibold text-gray-900">Mobile Friendly</h4>
              <p className="text-sm text-gray-600">Responsive design for all devices</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">⚙️</div>
              <h4 className="font-semibold text-gray-900">Easy Configuration</h4>
              <p className="text-sm text-gray-600">Simple setup and customization</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300">
              © 2024 Exam Seating Arrangement System. Built with Next.js and Java.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Streamlining examination management for educational institutions worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
