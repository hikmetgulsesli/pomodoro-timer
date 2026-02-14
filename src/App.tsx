import { Timer } from 'lucide-react';
import { useSettingsPersistence } from './hooks/useSettingsPersistence';
import './App.css';

function App() {
  const { settings, isLoaded } = useSettingsPersistence();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}>
      <div className="flex items-center gap-3 mb-8">
        <Timer size={40} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 700 }}>
          Pomodoro Timer
        </h1>
      </div>
      
      {isLoaded && (
        <div className="text-center">
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>
            Ready to focus?
          </p>
          <div className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <p>Work: {settings.workDuration} min | Short Break: {settings.shortBreakDuration} min | Long Break: {settings.longBreakDuration} min</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
