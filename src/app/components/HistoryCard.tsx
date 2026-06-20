import React, { useEffect, useState } from 'react';

type HistoryAction = 'ON' | 'OFF';

type HistoryEvent = {
  action: HistoryAction;
  timestamp: string;
};

interface HistoryCardProps {
  history: HistoryEvent[];
  onDelete: (index: number) => void;
  onClear: () => void;
}

export function HistoryCard({ history, onDelete, onClear }: HistoryCardProps) {
  const formatEvent = (event: HistoryEvent) => {
    try {
      const d = new Date(event.timestamp);
      const action = event.action === 'ON' ? 'DINYALAKAN' : 'DIMATIKAN';
      return `${action} — ${d.toLocaleString()}`;
    } catch {
      return `${event.action} — ${event.timestamp}`;
    }
  };

  return (
    <div className="border-2 border-black bg-white p-6">
      <div className="mb-4 pb-2 border-b border-black flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-black tracking-wide">RIWAYAT PENYIRAMAN</h2>
          <p className="text-xs text-black">Tampilkan kapan pompa dinyalakan dan dimatikan</p>
        </div>
        <button
          onClick={onClear}
          className="px-3 py-1 border border-black text-xs font-medium text-black hover:bg-black hover:text-white transition-colors"
        >
          HAPUS SEMUA
        </button>
      </div>

      <div>
        {history.length === 0 ? (
          <div className="text-sm text-black">Belum ada riwayat penyiraman.</div>
        ) : (
          <ul className="space-y-3">
            {history.map((event, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-md border border-black p-3 bg-slate-50 text-sm text-black"
              >
                <span>{formatEvent(event)}</span>
                <button
                  onClick={() => onDelete(idx)}
                  className="px-2 py-1 border border-black text-xs font-medium text-black hover:bg-black hover:text-white transition-colors"
                >
                  HAPUS
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
