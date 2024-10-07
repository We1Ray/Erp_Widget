import { DependencyList, useEffect, useContext } from "react";
import { statusContext } from "../../widget/system-control/ProgramContext";
/**
 * BtnCancel 取消按鈕，按下後會改變狀態為Read
 */
export default function useStatus(effect: () => void, deps?: DependencyList) {
  const { status, send } = useContext(statusContext);

  useEffect(() => {
    effect();
  }, [status, deps]);
}
