import { Wifi } from 'lucide-react';

export function Header() {
  return (
    <div className="border-b-2 border-black pb-6 mb-6">
      <h1 className="text-3xl font-bold text-black mb-3 tracking-tight">
        PEMANTAUAN KEBUN OTOMATIS (WIREFRAME)
      </h1>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-black">
          STATUS SISTEM: ONLINE (WIFI ACTIVE)
        </span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-black"></div>
          <Wifi className="w-4 h-4 text-black" />
        </div>
      </div>
    </div>
  );
}
