import React from 'react';

type MenuKey = 'DASHBOARD' | 'KONTROL' | 'RIWAYAT DATA';

interface SidebarProps {
  active?: MenuKey;
  onSelect?: (key: MenuKey) => void;
}

export function Sidebar({ active = 'DASHBOARD', onSelect }: SidebarProps) {
  const menuItems: MenuKey[] = ['DASHBOARD', 'KONTROL', 'RIWAYAT DATA'];

  return (
    <div className="w-64 border-2 border-black bg-white h-full">
      <div className="flex flex-col">
        {menuItems.map((label) => (
          <div
            key={label}
            onClick={() => onSelect?.(label)}
            className={`px-6 py-4 border-b border-black cursor-pointer select-none ${
              active === label ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            <span className="font-medium tracking-wide">{label}</span>
          </div>
        ))}
        <div className="h-32 border-b border-black"></div>
      </div>
    </div>
  );
}
