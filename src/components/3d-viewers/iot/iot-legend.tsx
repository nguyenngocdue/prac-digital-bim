"use client";

interface LegendItemProps {
  color: string;
  label: string;
  range?: string;
}

const LegendItem = ({ color, label, range }: LegendItemProps) => (
  <div className="flex items-center gap-2">
    <div 
      className="w-4 h-4 rounded-sm border border-white/20"
      style={{ backgroundColor: color }}
    />
    <div className="flex flex-col">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {range && <span className="text-[10px] text-muted-foreground">{range}</span>}
    </div>
  </div>
);

interface IotLegendProps {
  className?: string;
}

export const IotLegend = ({ className = "" }: IotLegendProps) => {
  return (
    <div className={`absolute top-6 right-6 z-40 ${className}`}>
      <div className="viewer-panel rounded-xl p-4 shadow-lg min-w-[200px]">
        <h3 className="text-sm font-semibold mb-3 text-foreground">IoT Sensor Status</h3>
        
        {/* CO2 Levels */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">CO₂ Levels (ppm)</p>
          <LegendItem color="#22c55e" label="Normal" range="< 600" />
          <LegendItem color="#f97316" label="Warning" range="600 - 800" />
          <LegendItem color="#ef4444" label="Danger" range="> 800" />
        </div>
        
        {/* Temperature */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">Temperature (°C)</p>
          <div className="text-xs text-muted-foreground">
            <div>• Optimal: 20-28°C</div>
            <div>• Warning: 18-20°C, 28-30°C</div>
            <div>• Danger: &lt;18°C, &gt;30°C</div>
          </div>
        </div>
        
        {/* Info footer */}
        <div className="mt-4 pt-3 border-t border-[var(--viewer-border)]">
          <p className="text-[10px] text-muted-foreground">
            Real-time monitoring from {mockRooms.length} rooms
          </p>
        </div>
      </div>
    </div>
  );
};

// Import mock data for count
import { mockRooms } from "@/data/mock-rooms";
