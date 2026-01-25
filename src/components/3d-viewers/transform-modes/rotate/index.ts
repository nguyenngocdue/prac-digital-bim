export type ScheduleRotationParams = {
  selectedId: string;
  rotationY: number;
  setBoxes: React.Dispatch<
    React.SetStateAction<import("@/app/contexts/box-context").Box[]>
  >;
  rafRef: React.MutableRefObject<number | null>;
};

export const scheduleRotationUpdate = ({
  selectedId,
  rotationY,
  setBoxes,
  rafRef,
}: ScheduleRotationParams) => {
  if (rafRef.current !== null) return;
  rafRef.current = requestAnimationFrame(() => {
    rafRef.current = null;
    setBoxes((prev) =>
      prev.map((box) => (box.id === selectedId ? { ...box, rotationY } : box))
    );
  });
};
