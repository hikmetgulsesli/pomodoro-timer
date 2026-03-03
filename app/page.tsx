import { Timer } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 text-text-primary">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <Timer size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-display">Pomodoro</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="#" 
            className="text-sm font-semibold text-text-primary/70 hover:text-primary transition-colors"
          >
            Stats
          </a>
          <a 
            href="#" 
            className="text-sm font-semibold text-text-primary/70 hover:text-primary transition-colors"
          >
            Settings
          </a>
          <div className="h-4 w-px bg-gray-300"></div>
          <a 
            href="#" 
            className="text-sm font-semibold text-text-primary hover:text-primary transition-colors"
          >
            Log In
          </a>
          <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
            Sign Up
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4 font-display">Welcome to Pomodoro Timer</h2>
          <p className="text-text-secondary text-center max-w-md">
            A beautiful, minimal Pomodoro productivity timer to help you stay focused and productive.
          </p>
        </div>
      </main>
    </div>
  )
}
