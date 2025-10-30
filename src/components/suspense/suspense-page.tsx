import {Skeleton} from "@/components/ui/skeleton";

/**
 *
 * @returns
 */
const SuspensePage = ({rows = 20}: {rows?: number}) => {
  return (
    <div className="h-full w-full overflow-hidden flex justify-center items-center">
      <div className="w-[90%] mx-auto">
        {[...Array(rows)].map((item: number, index: number) => (
          <div
            key={`${item}-${index}`}
            className="flex items-center space-x-4 my-1"
          >
            <Skeleton
              data-testid="skeleton-avatar"
              className="h-12 w-12 rounded-full bg-secondary"
            />
            <div className="space-y-2 w-full">
              <Skeleton
                data-testid="skeleton-text"
                className="h-4 w-full bg-secondary"
              />
              <Skeleton
                data-testid="skeleton-text"
                className="h-4 w-full bg-secondary"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuspensePage;
