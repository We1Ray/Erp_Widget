import { DependencyList, useEffect, useContext } from "react";
import { SystemContext } from "../../../system-control/SystemContext";
import { ProgramContext } from "../../../system-control/ProgramContext";

/**
 * BtnCancel 取消按鈕，按下後會改變狀態為Read
 */
export default function useSysBtnAuth(
  effect: () => void,
  deps?: DependencyList
) {
  const { System } = useContext(SystemContext);
  const { Program } = useContext(ProgramContext);
  useEffect(() => {
    effect();
  }, [System.authority, Program.program_code, deps]);
}
