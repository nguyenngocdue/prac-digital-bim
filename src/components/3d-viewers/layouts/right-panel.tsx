"use client";

import { Activity, Box, Camera, Map } from "lucide-react";
import type { FC } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useBoxContext } from "@/app/contexts/box-context";
import { mockCameras } from "@/data/mock-cameras";
import { mockRooms } from "@/data/mock-rooms";

type RightPanelProps = {
  projectId?: string;
};

const RightPanel: FC<RightPanelProps> = ({ projectId }) => {
  const { boxes, creationMode, creationTool, selectedId, setBoxes } = useBoxContext();
  const selectedBox = selectedId ? boxes.find((box) => box.id === selectedId) : undefined;
  const stats = [
    { label: "Objects", value: boxes.length, icon: Box },
    { label: "Rooms", value: mockRooms.length, icon: Map },
    { label: "Cameras", value: mockCameras.length, icon: Camera },
  ];
  const getBounds = (vertices: [number, number, number][]) => {
    let minX = vertices[0]![0];
    let maxX = vertices[0]![0];
    let minZ = vertices[0]![2];
    let maxZ = vertices[0]![2];
    vertices.forEach(([x, , z]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    });
    return { minX, maxX, minZ, maxZ };
  };

  const currentWidth = (() => {
    if (!selectedBox) return 0;
    if (selectedBox.type === "room") {
      if (selectedBox.vertices?.length) {
        const { minX, maxX } = getBounds(selectedBox.vertices);
        return Math.max(0.1, maxX - minX);
      }
      return selectedBox.width ?? 0;
    }
    if (selectedBox.size) return selectedBox.size[0];
    if (selectedBox.footprint?.length) {
      const { minX, maxX } = getBounds(selectedBox.footprint.map(([x, z]) => [x, 0, z]));
      return Math.max(0.1, maxX - minX);
    }
    return selectedBox.width ?? 0;
  })();

  const currentLength = (() => {
    if (!selectedBox) return 0;
    if (selectedBox.type === "room") {
      if (selectedBox.vertices?.length) {
        const { minZ, maxZ } = getBounds(selectedBox.vertices);
        return Math.max(0.1, maxZ - minZ);
      }
      return selectedBox.depth ?? 0;
    }
    if (selectedBox.size) return selectedBox.size[2];
    if (selectedBox.footprint?.length) {
      const { minZ, maxZ } = getBounds(selectedBox.footprint.map(([x, z]) => [x, 0, z]));
      return Math.max(0.1, maxZ - minZ);
    }
    return selectedBox.depth ?? 0;
  })();

  const currentHeight = selectedBox?.size
    ? selectedBox.size[1]
    : selectedBox?.height ?? 0;

  const updatePosition = (axis: 0 | 1 | 2, value: number) => {
    if (!selectedBox || Number.isNaN(value)) return;
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id !== selectedBox.id) return box;
        const next = [...box.position] as [number, number, number];
        next[axis] = value;
        return { ...box, position: next };
      })
    );
  };

  const updateRotation = (degrees: number) => {
    if (!selectedBox || Number.isNaN(degrees)) return;
    const radians = (degrees * Math.PI) / 180;
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id !== selectedBox.id) return box;
        return { ...box, rotationY: radians };
      })
    );
  };

  const updateDimensions = (nextWidth: number, nextLength: number, nextHeight: number) => {
    if (!selectedBox) return;
    if ([nextWidth, nextLength, nextHeight].some((value) => Number.isNaN(value))) return;
    const width = Math.max(0.1, nextWidth);
    const length = Math.max(0.1, nextLength);
    const height = Math.max(0.1, nextHeight);

    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id !== selectedBox.id) return box;
        if (box.type === "room") {
          const vertices: [number, number, number][] = [
            [-width / 2, 0, length / 2],
            [width / 2, 0, length / 2],
            [width / 2, 0, -length / 2],
            [-width / 2, 0, -length / 2],
          ];
          return { ...box, width, depth: length, height, vertices };
        }
        if (box.footprint?.length) {
          const bounds = getBounds(box.footprint.map(([x, z]) => [x, 0, z]));
          const centerX = (bounds.minX + bounds.maxX) / 2;
          const centerZ = (bounds.minZ + bounds.maxZ) / 2;
          const currentW = Math.max(0.1, bounds.maxX - bounds.minX);
          const currentL = Math.max(0.1, bounds.maxZ - bounds.minZ);
          const scaleX = width / currentW;
          const scaleZ = length / currentL;
          const nextFootprint = box.footprint.map(([x, z]) => [
            centerX + (x - centerX) * scaleX,
            centerZ + (z - centerZ) * scaleZ,
          ]) as [number, number][];
          const nextTop = box.topFootprint
            ? box.topFootprint.map(([x, z]) => [
                centerX + (x - centerX) * scaleX,
                centerZ + (z - centerZ) * scaleZ,
              ]) as [number, number][]
            : undefined;
          return { ...box, footprint: nextFootprint, topFootprint: nextTop, height };
        }
        if (box.size) {
          return { ...box, size: [width, height, length] };
        }
        return { ...box, width, depth: length, height };
      })
    );
  };

  const rotationDegrees = selectedBox?.rotationY
    ? (selectedBox.rotationY * 180) / Math.PI
    : 0;

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
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
              selectedBox
                ? "border-emerald-200 bg-emerald-500/10 text-emerald-700"
                : "viewer-border viewer-muted"
            }`}
          >
            {selectedBox ? "Editable" : "Read only"}
          </span>
        </div>

        {selectedBox ? (
          <div className="mt-3 rounded-xl border viewer-border viewer-panel-strong p-3">
            <div className="text-sm font-semibold">{selectedBox.type || "box"} selected</div>
            <p className="mt-1 text-[11px] viewer-muted">
              Edit position, size, and rotation.
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border viewer-border viewer-panel-strong p-3">
            <div className="text-sm font-semibold">No selection</div>
            <p className="mt-1 text-[11px] viewer-muted">
              Select a model, camera, or sensor to inspect attributes.
            </p>
          </div>
        )}
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

          {selectedBox && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] viewer-muted">
                Transform
              </h3>
              <div className="mt-3 grid gap-3 rounded-xl border viewer-border viewer-panel-strong p-3">
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <label className="flex flex-col gap-1">
                    X (m)
                    <Input
                      value={selectedBox.position[0]}
                      onChange={(e) => updatePosition(0, Number(e.target.value))}
                      className="h-8 text-xs"
                      type="number"
                      step={0.01}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Y (m)
                    <Input
                      value={selectedBox.position[1]}
                      onChange={(e) => updatePosition(1, Number(e.target.value))}
                      className="h-8 text-xs"
                      type="number"
                      step={0.01}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Z (m)
                    <Input
                      value={selectedBox.position[2]}
                      onChange={(e) => updatePosition(2, Number(e.target.value))}
                      className="h-8 text-xs"
                      type="number"
                      step={0.01}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <label className="flex flex-col gap-1">
                    Length (m)
                    <Input
                      value={Number(currentLength.toFixed(3))}
                      onChange={(e) => updateDimensions(currentWidth, Number(e.target.value), currentHeight)}
                      className="h-8 text-xs"
                      type="number"
                      step={0.01}
                      min={0.1}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Width (m)
                    <Input
                      value={Number(currentWidth.toFixed(3))}
                      onChange={(e) => updateDimensions(Number(e.target.value), currentLength, currentHeight)}
                      className="h-8 text-xs"
                      type="number"
                      step={0.01}
                      min={0.1}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Height (m)
                    <Input
                      value={Number(currentHeight.toFixed(3))}
                      onChange={(e) => updateDimensions(currentWidth, currentLength, Number(e.target.value))}
                      className="h-8 text-xs"
                      type="number"
                      step={0.01}
                      min={0.1}
                    />
                  </label>
                </div>

                <div className="grid gap-2 text-[11px]">
                  <label className="flex flex-col gap-1">
                    Rotation (degree)
                    <Input
                      value={Number(rotationDegrees.toFixed(2))}
                      className="h-8 text-xs"
                      type="number"
                      step={1}
                      readOnly
                    />
                  </label>
                  <input
                    className="h-2 w-full cursor-pointer accent-cyan-400"
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={Number(rotationDegrees.toFixed(0))}
                    onChange={(e) => updateRotation(Number(e.target.value))}
                  />
                </div>
              </div>
            </section>
          )}

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
