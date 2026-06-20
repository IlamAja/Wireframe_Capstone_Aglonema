import { Wifi, BarChart3 } from 'lucide-react';

interface SoilStatusCardProps {
  humidity: number;
  history?: number[];
}

export function SoilStatusCard({ humidity, history = [] }: SoilStatusCardProps) {
  // Build points string for polyline using numeric coordinates (0-100)
  const points = history.length
    ? history
        .slice()
        .reverse()
        .map((v, i) => {
          const x = (i / Math.max(1, history.length - 1)) * 100;
          const y = 100 - (v / 100) * 100;
          return `${x},${y}`;
        })
        .join(' ')
    : '0,96 50,48 100,67';

  return (
    <div className="border-2 border-black bg-white p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-black">
        <h2 className="text-base font-bold text-black tracking-wide">
          STATUS TANAH SAAT INI
        </h2>
        <Wifi className="w-5 h-5 text-black" />
      </div>

      {/* Main Value */}
      <div className="mb-6 pb-6 border-b border-black">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-7xl font-bold text-black mb-2">{Math.round(humidity)}%</div>
            <div className="text-sm font-medium text-black tracking-wide">KELEMBAPAN TANAH</div>
          </div>
          <BarChart3 className="w-8 h-8 text-black mt-2" />
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6 pb-6 border-b border-black">
        <div className="relative h-48">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-black pr-3">
            <span>100%</span>
            <span>60%</span>
            <span>0%</span>
          </div>

          {/* Chart area */}
          <div className="ml-12 h-full relative border-l-2 border-b-2 border-black">
            {/* Grid lines */}
            <div className="absolute top-0 left-0 right-0 border-t border-gray-300"></div>
            <div className="absolute top-1/2 left-0 right-0 border-t border-gray-300"></div>

            {/* Line chart */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <polyline
                points={points}
                fill="none"
                stroke="black"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Data labels - omitted for dynamic history */}
          </div>

          {/* X-axis labels */}
          <div className="ml-12 mt-2 flex justify-between text-xs text-black">
            <span>3 jam ago</span>
            <span>2 jam ago</span>
            <span>1 jam ago</span>
          </div>
        </div>
      </div>

      {/* Additional Data */}
      <div className="space-y-2">
        <div className="text-sm text-black">
          <span className="font-medium">Suhu Udara:</span> 26°C
        </div>
        <div className="text-sm text-black">
          <span className="font-medium">Kelembapan Udara:</span> 50%
        </div>
      </div>
    </div>
  );
}
