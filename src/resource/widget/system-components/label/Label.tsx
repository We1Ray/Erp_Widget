import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { QryLabel } from "./QryLabel";
import { BindLabel } from "./BindLabel";
import { CommonLabel } from "./CommonLabel";
interface LabelProps {
  /**
   * 顯示文字
   */
  text?: string;
  /**
   * 判斷是否可視 初始值為true
   */
  visible?: boolean;
  /**
   * 是否為query欄位(和bind擇一)
   */
  query?: boolean; //query欄位
  /**
   * 是否為Binding欄位(和query擇一)
   */
  bind?: boolean;
  /**
   * 名稱(需與對應元件名稱相同)
   */
  name?: string;
  /**
   * style外觀設定
   */
  style?: React.CSSProperties;
  /**
   * 元件的Reference
   */
  ref?: React.Ref<any>;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}
const Label: React.FC<LabelProps> = forwardRef(
  (
    { text, visible, query, bind, name, style, callbackRef, ...props },
    forwardedRef
  ) => {
    const labelRef = useRef(null);

    useImperativeHandle(forwardedRef, () => labelRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(labelRef);
        }
      } catch (error) {
        console.log("EROOR: Label.useEffect()");
        console.log(error);
      }
    });
    return (
      <>
        {query ? (
          <QryLabel
            text={text}
            name={name}
            visible={visible}
            style={style}
            ref={labelRef}
            {...props}
          />
        ) : bind ? (
          <BindLabel
            text={text}
            name={name}
            visible={visible}
            style={style}
            ref={labelRef}
            {...props}
          />
        ) : (
          <CommonLabel
            text={text}
            name={name}
            visible={visible}
            style={style}
            ref={labelRef}
            {...props}
          />
        )}
      </>
    );
  }
);
export { Label };
export type { LabelProps };
