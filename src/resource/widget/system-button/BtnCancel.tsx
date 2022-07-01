import React, { useState, useEffect, useContext } from "react";
import { Button } from "reactstrap";
import { SystemContext } from "../system-control/SystemContext";
import {
  ProgramContext,
  statusContext,
  STATUS,
} from "../system-control/ProgramContext";
import PublicMethod from "../../methods/PublicMethod";
interface Props {
  /**
   * 設定外觀
   */
  style?: React.CSSProperties;
  /**
   * 設定其他畫面顯示
   */
  childObject?: React.AllHTMLAttributes<any>;

  /**
   * 按下按鈕時觸發(觸發後會改變狀態)
   */
  onClick?: () => Promise<any>;
  /**
   * 滑鼠移動至按鈕顯示的字眼
   */
  title?: string;
}
/**
 * BtnCancel 取消按鈕，按下後會改變狀態為Read
 */
export const BtnCancel: React.FC<Props> = ({
  style,
  childObject,
  onClick,
  title,
}) => {
  const { System } = useContext(SystemContext);
  const { Program, ProgramDispatch } = useContext(ProgramContext);
  const { status, send } = useContext(statusContext);
  const [CancelDisable, setCancelDisable] = useState(true);

  useEffect(() => {
    switch (status.value) {
      case STATUS.CREATE:
        setCancelDisable(false);
        break;
      case STATUS.UPDATE:
        setCancelDisable(false);
        break;
      case STATUS.CANCEL:
        ProgramDispatch({ type: "insertParameters", value: null });
        ProgramDispatch({ type: "updateParameters", value: null });
        send(STATUS.READ);
      case STATUS.READ:
        ProgramDispatch({ type: "insertParameters", value: null });
        ProgramDispatch({ type: "updateParameters", value: null });
        setCancelDisable(true);
        break;
      default:
        setCancelDisable(true);
        break;
    }
  }, [status]);

  async function buttonClick() {
    if (onClick) {
      await onClick();
      await send(STATUS.CANCEL);
    } else {
      await send(STATUS.CANCEL);
    }
  }

  return (
    <Button
      style={style}
      disabled={CancelDisable}
      onClick={() => buttonClick()}
      title={title}
    >
      {PublicMethod.checkValue(childObject) ? (
        childObject
      ) : (
        <>
          <em className={"fas fa-ban"} />
          &ensp;
          {System.getLocalization("Public", "Cancel")}
        </>
      )}
    </Button>
  );
};
