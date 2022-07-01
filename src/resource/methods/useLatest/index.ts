import { DependencyList, useEffect } from "react";

function useLatest(
  effect: (arg0: () => boolean) => void,
  deps: DependencyList
) {
  useEffect(() => {
    let latest = true;
    const checkCurrent = () => latest;
    effect(checkCurrent);
    return () => {
      latest = false;
    };
  }, deps);
}
export default useLatest;
