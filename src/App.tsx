import { Timer } from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}>
      <div className="flex items-center gap-3 mb-8">
        <Timer size={40} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 700 }}>
          Pomodoro Timer
        </h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>
        Ready to focus?
      </p>
    </div>
  );
}

export default App;
