import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Row as Roa } from "reactstrap";
import PublicMethod from "../../methods/PublicMethod";
import { ProgramContext } from "../system-control/ProgramContext";
import { None } from "./None";
/**
 * Row
 */
interface Props {
  /**
   * 設定是否可視
   */
  visible?: boolean;
  /**
   * 設定與配對的元件相同名稱
   */
  name?: string;
  [x: string]: any;
  /**
   * 元件的Reference
   */
  ref?: React.Ref<any>;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}
export const Row: React.FC<Props> = forwardRef(
  ({ visible, name, callbackRef, ...props }, forwardedRef) => {
    const { Program } = useContext(ProgramContext);
    const [display, setDisplay] = useState(true);
    const rowRef = useRef(null);

    useImperativeHandle(forwardedRef, () => rowRef.current);

    /** 設定欄位是否可視 */
    useEffect(() => {
      try {
        setDisplay(
          PublicMethod.visibility(name, Program.queryConditions, visible)
        );
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(rowRef);
        }
      } catch (error) {
        console.log("EROOR: Row.useEffect()");
        console.log(error);
      }
    });

    return (
      <>
        {display ? (
          <Roa ref={rowRef} {...props}>
            {props.children}
          </Roa>
        ) : (
          <None />
        )}
      </>
    );
  }
);
