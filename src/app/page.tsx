import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-mesh relative overflow-hidden antialiased font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full filter blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full filter blur-[120px] -z-10 animate-pulse delay-1000"></div>

      {/* Header */}
      <header className="backdrop-blur-md border-b border-slate-900/50 sticky top-0 z-50 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20">E</div>
              <h1 className="text-xl font-extrabold tracking-tight">ExamSeat</h1>
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">v1.0.0</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
            The Smart Way to <br />
            <span className="text-gradient">Arrange Exams</span>
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Automate examination seating with fair, anti-cheating algorithms. 
            Save hours of administration time with frictionless CSV uploads.
          </p>
        </div>

        {/* Access Cards */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <Link href="/admin" className="group">
            <div className="glass-dark rounded-2xl p-8 border border-slate-800/60 hover:border-blue-500/40 transition-all duration-300 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] flex flex-col h-full glow-card bg-slate-900/40">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">👨‍💼</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Administrator</h3>
              <p className="text-slate-400 text-sm mb-6 flex-grow">Manage students, room capacities, and generate optimized seating arrangements.</p>
              <div className="flex items-center text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Enter Dashboard <span className="ml-1">→</span>
              </div>
            </div>
          </Link>

          <Link href="/student" className="group">
            <div className="glass-dark rounded-2xl p-8 border border-slate-800/60 hover:border-purple-500/40 transition-all duration-300 hover:shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] flex flex-col h-full glow-card bg-slate-900/40">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">👨‍🎓</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">Student Portal</h3>
              <p className="text-slate-400 text-sm mb-6 flex-grow">Quickly lookup your assigned room, seat number, and access lookup details.</p>
              <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Find My Seat <span className="ml-1">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="glass-dark rounded-3xl p-10 border border-slate-800/40 relative bg-slate-900/20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 rounded-3xl -z-10"></div>
          <h3 className="text-xl font-bold mb-10 text-center tracking-tight text-slate-200">System Capabilities</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "⚡", title: "Fast Setup", desc: "Instant CSV processing" },
              { icon: "🎯", title: "Proportional", desc: "Even room distribution" },
              { icon: "🔒", title: "Anti-Cheat", desc: "Alternating exam patterns" },
              { icon: "📱", title: "QR Access", desc: "Mobile seat verification" }
            ].map((feature, i) => (
              <div key={i} className="text-center group p-4 rounded-xl hover:bg-slate-800/30 transition-colors duration-300">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-sm mb-1 text-slate-200">{feature.title}</h4>
                <p className="text-xs text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 mt-20 py-10 text-center text-sm text-slate-500 bg-slate-950/80 backdrop-blur-sm">
        <p>© 2026 <span className="font-semibold text-slate-400">ExamSeat</span> Arrangement System. All rights reserved.</p>
      </footer>
    </div>
  );
}
