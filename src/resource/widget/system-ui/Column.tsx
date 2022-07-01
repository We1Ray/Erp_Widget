import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Col } from "reactstrap";
import PublicMethod from "../../methods/PublicMethod";
import { ProgramContext } from "../system-control/ProgramContext";
import { None } from "./None";
interface Props {
  /**
   * 設定是否可視
   */
  visible?: boolean;
  /**
   * 設定與配對的元件相同名稱
   */
  name?: string;
  xs?: string | number;
  sm?: string | number;
  md?: string | number;
  lg?: string | number;
  xl?: string | number;
  [x: string]: any;
  /**
   * 元件的Reference
   */
  ref?: React.Ref<any>;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}
export const Column: React.FC<Props> = forwardRef(
  ({ visible, name, callbackRef, ...props }, forwardedRef) => {
    const { Program } = useContext(ProgramContext);
    const [display, setDisplay] = useState(true);
    const columnRef = useRef(null);

    useImperativeHandle(forwardedRef, () => columnRef.current);

    /** 設定欄位是否可視 */
    useEffect(() => {
      try {
        setDisplay(
          PublicMethod.visibility(name, Program.queryConditions, visible)
        );
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(columnRef);
        }
      } catch (error) {
        console.log("EROOR: Column.useEffect()");
        console.log(error);
      }
    });

    return (
      <>
        {display ? (
          <Col ref={columnRef} {...props}>
            {props.children}
          </Col>
        ) : (
          <None />
        )}
      </>
    );
  }
);
