import { Power, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

type HistoryAction = 'ON' | 'OFF';

type HistoryEvent = {
  action: HistoryAction;
  timestamp: string;
};

interface PumpControlCardProps {
  isPumpOn: boolean;
  setIsPumpOn: (v: boolean) => void;
  mode: 'OTOMATIS' | 'MANUAL';
  setMode: (m: 'OTOMATIS' | 'MANUAL') => void;
  minHumidity: number;
  setMinHumidity: (v: number) => void;
  maxHumidity: number;
  setMaxHumidity: (v: number) => void;
  onSave?: () => void;
  onHistoryEvent?: (event: HistoryEvent) => void;
}

export function PumpControlCard({
  isPumpOn,
  setIsPumpOn,
  mode,
  setMode,
  minHumidity,
  setMinHumidity,
  maxHumidity,
  setMaxHumidity,
  onSave,
}: PumpControlCardProps) {

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pumpSettings');
      if (raw) {
        const obj = JSON.parse(raw) as { mode?: string; minHumidity?: string; maxHumidity?: string; isPumpOn?: boolean };
        if (obj.mode) setMode(obj.mode);
        if (obj.minHumidity) setMinHumidity(obj.minHumidity);
        if (obj.maxHumidity) setMaxHumidity(obj.maxHumidity);
        if (typeof obj.isPumpOn === 'boolean') setIsPumpOn(obj.isPumpOn);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="border-2 border-black bg-white p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-black">
        <h2 className="text-base font-bold text-black tracking-wide">
          KONTROL POMPA AIR
        </h2>
        <Power className="w-5 h-5 text-black" />
      </div>

      {/* Pump Status */}
      <div className="mb-6 pb-6 border-b border-black">
        <div className="text-xs font-medium text-black mb-2">STATUS POMPA:</div>
        <div className="text-4xl font-bold text-black mb-4">
          {isPumpOn ? 'MENYALA' : 'MATI'}
        </div>

        {/* Toggle Switch */}
        <div className="flex flex-col items-start gap-2">
          <div
            onClick={() => {
              const next = !isPumpOn;
              setIsPumpOn(next);
              // when toggled manually on, record event
              if (next) {
                const ts = new Date().toISOString();
                onHistoryEvent?.({ action: 'ON', timestamp: ts });
              } else {
                const ts = new Date().toISOString();
                onHistoryEvent?.({ action: 'OFF', timestamp: ts });
              }
            }}
            className="relative w-20 h-10 border-2 border-black bg-white cursor-pointer"
          >
            {/* Switch track */}
            <div
              className={`absolute top-1 transition-all duration-200 w-8 h-6 bg-black ${
                isPumpOn ? 'right-1' : 'left-1'
              }`}
            ></div>
          </div>
          <span className="text-xs font-medium text-black">ON/OFF</span>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-6 pb-6 border-b border-black">
        <div className="text-xs font-medium text-black mb-2">MODUS:</div>
        <div className="relative">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value === 'MANUAL' ? 'MANUAL' : 'OTOMATIS')}
            className="w-full px-4 py-2 border-2 border-black bg-white text-black font-medium appearance-none cursor-pointer"
          >
            <option value="OTOMATIS">OTOMATIS</option>
            <option value="MANUAL">MANUAL</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black pointer-events-none" />
        </div>
      </div>

      {/* Threshold Settings */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-black mb-4 tracking-wide">
          BATAS PENYIRAMAN (THRESHOLD)
        </h3>

        <div className="space-y-4">
          {/* Min Humidity */}
          <div>
            <label className="text-xs text-black mb-2 block">
              Minimum Kelembapan (Pompa ON):
            </label>
            <div className="flex items-center border-2 border-black">
                <input
                type="number"
                value={minHumidity}
                onChange={(e) => setMinHumidity(Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-white text-black outline-none"
              />
              <span className="px-3 text-black font-medium">%</span>
            </div>
          </div>

          {/* Max Humidity */}
          <div>
            <label className="text-xs text-black mb-2 block">
              Maximum Kelembapan (Pompa OFF):
            </label>
            <div className="flex items-center border-2 border-black">
                <input
                type="number"
                value={maxHumidity}
                onChange={(e) => setMaxHumidity(Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-white text-black outline-none"
              />
              <span className="px-3 text-black font-medium">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            try {
              const obj = { mode, minHumidity, maxHumidity, isPumpOn };
              localStorage.setItem('pumpSettings', JSON.stringify(obj));
            } catch (e) {
              // ignore
            }
            onSave?.();
          }}
          className="px-8 py-3 border-2 border-black bg-white text-black font-bold hover:bg-black hover:text-white transition-colors"
        >
          SIMPAN
        </button>
      </div>
    </div>
  );
}
