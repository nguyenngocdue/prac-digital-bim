"use client";

import { Activity, Box, Camera, Map } from "lucide-react";
import type { FC } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useBoxContext } from "@/app/contexts/box-context";
import { mockCameras } from "@/data/mock-cameras";
import { mockRooms } from "@/data/mock-rooms";

type RightPanelProps = {
  projectId?: string;
};

const RightPanel: FC<RightPanelProps> = ({ projectId }) => {
  const { boxes, creationMode, creationTool } = useBoxContext();
  const stats = [
    { label: "Objects", value: boxes.length, icon: Box },
    { label: "Rooms", value: mockRooms.length, icon: Map },
    { label: "Cameras", value: mockCameras.length, icon: Camera },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="viewer-muted text-[10px] font-semibold uppercase tracking-[0.3em]">
              Inspector
            </div>
            <h2 className="mt-2 text-lg font-semibold">Properties</h2>
          </div>
          <span className="rounded-full border viewer-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] viewer-muted">
            Read only
          </span>
        </div>

        <div className="mt-3 rounded-xl border viewer-border viewer-panel-strong p-3">
          <div className="text-sm font-semibold">No selection</div>
          <p className="mt-1 text-[11px] viewer-muted">
            Select a model, camera, or sensor to inspect attributes.
          </p>
        </div>
      </div>

      <Separator className="viewer-border-bg" />

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-5 px-4 py-3">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] viewer-muted">
              Scene stats
            </h3>
            <div className="mt-3 grid gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between rounded-xl border viewer-border viewer-panel-strong px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <stat.icon className="h-4 w-4 viewer-muted" />
                    {stat.label}
                  </div>
                  <span className="text-sm font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] viewer-muted">
              Mode
            </h3>
            <div className="mt-3 rounded-xl border viewer-border viewer-panel-strong p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Placement</div>
                  <div className="text-[11px] viewer-muted">Boxes save to project</div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    creationMode
                      ? "border border-amber-200 bg-amber-500/10 text-amber-700"
                      : "border viewer-border viewer-muted"
                  }`}
                >
                  {creationMode ? `Active (${creationTool})` : "Idle"}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] viewer-muted">
              Health
            </h3>
            <div className="mt-3 grid gap-2">
              <div className="rounded-xl border viewer-border viewer-panel-strong px-3 py-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 viewer-muted" />
                    Sensor uptime
                  </div>
                  <span className="text-emerald-700">99.2%</span>
                </div>
                <p className="mt-1 text-[11px] viewer-muted">Last sync 2 min ago</p>
              </div>
              <div className="rounded-xl border viewer-border viewer-panel-strong px-3 py-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div>Session</div>
                  <span className="viewer-muted text-[10px] font-mono uppercase tracking-[0.18em]">
                    {projectId ? projectId.slice(0, 6) : "N/A"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] viewer-muted">Autosave is running</p>
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default RightPanel;
