import { DependencyList, useEffect, useContext } from "react";
import { SystemContext } from "../../../system-control/SystemContext";
import {
  ProgramContext,
  statusContext,
} from "../../../system-control/ProgramContext";
import { ComponentContext } from "../../../system-control/ComponentContext";

/**
 * BtnCancel 取消按鈕，按下後會改變狀態為Read
 */
export default function useSysBtnEnable(
  effect: (arg0: () => boolean) => void,
  deps?: DependencyList
) {
  const { Component } = useContext(ComponentContext);
  const { Program } = useContext(ProgramContext);
  const { status } = useContext(statusContext);
  useEffect(() => {
    let latest = true;
    const checkCurrent = () => latest;
    effect(checkCurrent);
    return () => {
      latest = false;
    };
  }, [
    JSON.stringify(Component.status),
    JSON.stringify(Component.loading),
    JSON.stringify(Program.selectedData),
    Program.individual,
    Program.loading,
    status,
    deps,
  ]);
}
