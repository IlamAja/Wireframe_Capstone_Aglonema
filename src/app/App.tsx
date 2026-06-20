import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SoilStatusCard } from './components/SoilStatusCard';
import { PumpControlCard } from './components/PumpControlCard';
import { HistoryCard } from './components/HistoryCard';

type HistoryAction = 'ON' | 'OFF';

type HistoryEvent = {
  id?: number;
  action: HistoryAction;
  timestamp: string;
};

export default function App() {
  const [active, setActive] = useState<'DASHBOARD' | 'KONTROL' | 'RIWAYAT DATA'>('DASHBOARD');

  // Simulation state
  const [humidity, setHumidity] = useState<number>(65);
  const [history, setHistory] = useState<number[]>([]);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);

  // Pump/settings state (lifted)
  const [isPumpOn, setIsPumpOn] = useState<boolean>(false);
  const [mode, setMode] = useState<'OTOMATIS' | 'MANUAL'>('OTOMATIS');
  const [minHumidity, setMinHumidity] = useState<number>(45);
  const [maxHumidity, setMaxHumidity] = useState<number>(80);

  const firstAutoRef = useRef(true);
  const firstPumpStateRef = useRef(true);
  const prevPumpOnRef = useRef(isPumpOn);

  // Load settings and history from localStorage on mount
  useEffect(() => {
    // load settings
    (async () => {
      try {
        const resp = await fetch('http://localhost:4000/api/settings');
        if (resp.ok) {
          const settings = await resp.json();
          if (settings) {
            if (settings.mode) setMode(settings.mode === 'MANUAL' ? 'MANUAL' : 'OTOMATIS');
            if (typeof settings.min_humidity !== 'undefined') setMinHumidity(Number(settings.min_humidity));
            if (typeof settings.max_humidity !== 'undefined') setMaxHumidity(Number(settings.max_humidity));
            if (typeof settings.is_pump_on !== 'undefined') setIsPumpOn(Boolean(settings.is_pump_on));
          }
        }
      } catch (e) {
        // ignore
      }

      // load history events
      try {
        const h = await fetch('http://localhost:4000/api/history');
        if (h.ok) {
          const events = await h.json();
          setHistoryEvents(Array.isArray(events) ? events : []);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const recordHistoryEvent = async (event: HistoryEvent) => {
    try {
      await fetch('http://localhost:4000/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      const h = await fetch('http://localhost:4000/api/history');
      if (h.ok) {
        const events = await h.json();
        setHistoryEvents(Array.isArray(events) ? events : []);
      }
    } catch (e) {
      // fallback to local state
      try {
        const next = [event, ...historyEvents].slice(0, 50);
        setHistoryEvents(next);
      } catch {}
    }
  };

  // Simulation loop: update humidity every 1s
  useEffect(() => {
    const id = setInterval(() => {
      setHumidity((prev) => {
        // change amount depends on pump
        let delta = 0;
        if (isPumpOn) {
          delta = 0.8 + Math.random() * 1.2; // increase
        } else {
          delta = -0.2 - Math.random() * 1.0; // decrease
        }
        let next = Math.max(0, Math.min(100, +(prev + delta).toFixed(2)));

        // maintain small history
        setHistory((h) => {
          const nh = [next, ...h].slice(0, 20);
          return nh;
        });

        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isPumpOn]);

  // Automatic control: when in OTOMATIS mode, toggle pump based on thresholds
  useEffect(() => {
    if (mode !== 'OTOMATIS') return;

    // Avoid triggering on initial load unexpectedly
    if (firstAutoRef.current) {
      firstAutoRef.current = false;
      return;
    }

    if (humidity <= minHumidity && !isPumpOn) {
      setIsPumpOn(true);
    }

    if (humidity >= maxHumidity && isPumpOn) {
      setIsPumpOn(false);
    }
  }, [humidity, mode, minHumidity, maxHumidity, isPumpOn]);

  useEffect(() => {
    if (firstPumpStateRef.current) {
      firstPumpStateRef.current = false;
      prevPumpOnRef.current = isPumpOn;
      return;
    }

    const prev = prevPumpOnRef.current;
    if (prev !== isPumpOn) {
      recordHistoryEvent({
        action: isPumpOn ? 'ON' : 'OFF',
        timestamp: new Date().toISOString(),
      });
      prevPumpOnRef.current = isPumpOn;
    }
  }, [isPumpOn]);

  // Save settings helper
  const saveSettings = async () => {
    try {
      await fetch('http://localhost:4000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, min_humidity: minHumidity, max_humidity: maxHumidity, is_pump_on: isPumpOn }),
      });
    } catch {}
  };

  const deleteHistoryEvent = async (index: number) => {
    try {
      const ev = historyEvents[index];
      if (ev && ev.id) {
        await fetch(`http://localhost:4000/api/history/${ev.id}`, { method: 'DELETE' });
        const h = await fetch('http://localhost:4000/api/history');
        if (h.ok) setHistoryEvents(await h.json());
      }
    } catch (e) {
      // fallback
      setHistoryEvents((s) => s.filter((_, i) => i !== index));
    }
  };

  const clearHistory = async () => {
    try {
      await fetch('http://localhost:4000/api/history', { method: 'DELETE' });
      setHistoryEvents([]);
    } catch (e) {
      setHistoryEvents([]);
    }
  };
 

  return (
    <div className="min-h-screen bg-[#F0F0F0] p-8">
      {/* Main Panel */}
      <div className="flex border-2 border-black bg-white min-h-[calc(100vh-4rem)] shadow-lg">
        {/* Sidebar */}
        <Sidebar active={active} onSelect={(k) => setActive(k)} />

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Header */}
          <Header />

          {/* Content Area */}
          {active === 'RIWAYAT DATA' ? (
            <HistoryCard
              history={historyEvents}
              onDelete={deleteHistoryEvent}
              onClear={clearHistory}
            />
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <SoilStatusCard humidity={humidity} history={history} />
              <PumpControlCard
                isPumpOn={isPumpOn}
                setIsPumpOn={setIsPumpOn}
                mode={mode}
                setMode={setMode}
                minHumidity={minHumidity}
                setMinHumidity={setMinHumidity}
                maxHumidity={maxHumidity}
                setMaxHumidity={setMaxHumidity}
                onSave={saveSettings}
                onHistoryEvent={recordHistoryEvent}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
