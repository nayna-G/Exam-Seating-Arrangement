import Link from "next/link"; // Import statement: Imports Link component from Next.js for client-side navigation

export default function Home() { // Function declaration: Default export of Home component (main landing page)
  return ( // Return statement: Returns JSX markup for the component
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-mesh relative overflow-hidden antialiased font-sans"> // JSX element: Main container div with Tailwind CSS classes for styling (full height, dark theme, mesh background)
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full filter blur-[120px] -z-10 animate-pulse"></div> // JSX element: Decorative blue gradient blob with blur and pulse animation
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full filter blur-[120px] -z-10 animate-pulse delay-1000"></div> // JSX element: Decorative purple gradient blob with blur, pulse animation, and delay

      {/* Header */}
      <header className="backdrop-blur-md border-b border-slate-900/50 sticky top-0 z-50 bg-slate-950/70"> // JSX element: Header section with backdrop blur, border, sticky positioning, and z-index
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> // JSX element: Container div with max-width, auto margins, and responsive padding
          <div className="flex justify-between items-center py-5"> // JSX element: Flex container for header content with space-between alignment
            <div className="flex items-center space-x-2"> // JSX element: Flex container for logo and title with horizontal spacing
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20">E</div> // JSX element: Logo div with gradient background, rounded corners, centered text, and shadow
              <h1 className="text-xl font-extrabold tracking-tight">ExamSeat</h1> // JSX element: Heading with extra-bold font weight and tight letter spacing
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">v1.0.0</div> // JSX element: Version badge with background, border, rounded corners, and muted text
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative"> // JSX element: Main content area with max-width, responsive padding, and vertical spacing
        {/* Hero Section */}
        <div className="text-center mb-24"> // JSX element: Hero section div with centered text and bottom margin
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none"> // JSX element: Hero heading with responsive font size, black weight, and tight spacing
            The Smart Way to <br /> // JSX text: First line of heading with line break
            <span className="text-gradient">Arrange Exams</span> // JSX element: Span with gradient text styling for "Arrange Exams"
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"> // JSX element: Description paragraph with muted text, max-width, and relaxed line height
            Automate examination seating with fair, anti-cheating algorithms. // JSX text: First line of description
            Save hours of administration time with frictionless CSV uploads. // JSX text: Second line of description
          </p>
        </div>

        {/* Access Cards */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-24"> // JSX element: Grid container for access cards with responsive columns and gap
          <Link href="/admin" className="group"> // JSX element: Next.js Link component to admin page with group class for hover effects
            <div className="glass-dark rounded-2xl p-8 border border-slate-800/60 hover:border-blue-500/40 transition-all duration-300 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] flex flex-col h-full glow-card bg-slate-900/40"> // JSX element: Admin card with glass effect, rounded corners, border, hover effects, and flex layout
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">👨‍💼</div> // JSX element: Icon container with background, rounded corners, centered emoji, and hover scale effect
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Administrator</h3> // JSX element: Card title with bold font and hover color change
              <p className="text-slate-400 text-sm mb-6 flex-grow">Manage students, room capacities, and generate optimized seating arrangements.</p> // JSX element: Card description with muted text and flex-grow to fill space
              <div className="flex items-center text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform"> // JSX element: Call-to-action container with hover translate effect
                Enter Dashboard <span className="ml-1">→</span> // JSX text: CTA text with arrow span
              </div>
            </div>
          </Link>

          <Link href="/student" className="group"> // JSX element: Next.js Link component to student page with group class for hover effects
            <div className="glass-dark rounded-2xl p-8 border border-slate-800/60 hover:border-purple-500/40 transition-all duration-300 hover:shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] flex flex-col h-full glow-card bg-slate-900/40"> // JSX element: Student card with glass effect, rounded corners, border, hover effects, and flex layout
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">👨‍🎓</div> // JSX element: Icon container with background, rounded corners, centered emoji, and hover scale effect
              <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">Student Portal</h3> // JSX element: Card title with bold font and hover color change
              <p className="text-slate-400 text-sm mb-6 flex-grow">Quickly lookup your assigned room, seat number, and access lookup details.</p> // JSX element: Card description with muted text and flex-grow to fill space
              <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:translate-x-1 transition-transform"> // JSX element: Call-to-action container with hover translate effect
                Find My Seat <span className="ml-1">→</span> // JSX text: CTA text with arrow span
              </div>
            </div>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="glass-dark rounded-3xl p-10 border border-slate-800/40 relative bg-slate-900/20"> // JSX element: Features container with glass effect, rounded corners, border, and background
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 rounded-3xl -z-10"></div> // JSX element: Gradient overlay for visual depth with negative z-index
          <h3 className="text-xl font-bold mb-10 text-center tracking-tight text-slate-200">System Capabilities</h3> // JSX element: Section heading with bold font, centered text, and tight spacing
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8"> // JSX element: Grid container for features with responsive columns
            {[ // Array literal: Array of feature objects for mapping
              { icon: "⚡", title: "Fast Setup", desc: "Instant CSV processing" }, // Object: Feature 1 with icon, title, and description
              { icon: "🎯", title: "Proportional", desc: "Even room distribution" }, // Object: Feature 2 with icon, title, and description
              { icon: "🔒", title: "Anti-Cheat", desc: "Alternating exam patterns" }, // Object: Feature 3 with icon, title, and description
              { icon: "📱", title: "QR Access", desc: "Mobile seat verification" } // Object: Feature 4 with icon, title, and description
            ].map((feature, i) => ( // Array method: Maps over feature array to create JSX elements
              <div key={i} className="text-center group p-4 rounded-xl hover:bg-slate-800/30 transition-colors duration-300"> // JSX element: Feature card with centered text, hover effect, and rounded corners
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300"> // JSX element: Icon container with large text and hover scale effect
                  {feature.icon} // JSX expression: Renders the feature icon emoji
                </div>
                <h4 className="font-semibold text-sm mb-1 text-slate-200">{feature.title}</h4> // JSX element: Feature title with semibold font
                <p className="text-xs text-slate-500">{feature.desc}</p> // JSX element: Feature description with small muted text
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 mt-20 py-10 text-center text-sm text-slate-500 bg-slate-950/80 backdrop-blur-sm"> // JSX element: Footer with top border, margin, padding, centered text, and backdrop blur
        <p>© 2026 <span className="font-semibold text-slate-400">ExamSeat</span> Arrangement System. All rights reserved.</p> // JSX element: Copyright text with span for brand name styling
      </footer>
    </div> // JSX closing tag: Closes main container div
  ); // JSX closing tag: Closes return statement
} // Function closing brace: End of Home component
