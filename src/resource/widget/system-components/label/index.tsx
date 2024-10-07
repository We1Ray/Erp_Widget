import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { QryLabel } from "./Qry";
import { BindLabel } from "./Bind";
import { CommonLabel } from "./Common";
import { ReferLabel } from "./Refer";
interface LabelProps {
  text?: string;
  referValue?: string;
  visible?: boolean;
  query?: boolean; //query欄位
  bind?: boolean;
  refer?: boolean;
  name?: string;
  referApi?: {
    valueName: string;
    labelName: string;
    api?: string;
    defaultParameters?: object;
  };
  style?: React.CSSProperties;
  referResult?: (value: string) => any | ((value: string) => Promise<any>);
  [x: string]: any;
  ref?: React.Ref<any>;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}
const Label: React.FC<{
  /**
   * 顯示文字
   */
  text?: string;
  /**
   * 給予label的值
   */
  referValue?: string;
  /**
   * 判斷是否可視 初始值為true
   */
  visible?: boolean;
  /**
   * 是否為query欄位(bind, query, refer擇一)
   */
  query?: boolean; //query欄位
  /**
   * 是否為Binding欄位(bind, query, refer擇一)
   */
  bind?: boolean;
  /**
   * 是否為參考欄位(bind, query, refer擇一)
   */
  refer?: boolean;
  /**
   * 名稱(需與對應元件名稱相同)
   */
  name?: string;
  /**
   * label查詢的api
   */
  referApi?: {
    /**
     * 查詢對應的KEY欄位
     */
    valueName: string;
    /**
     * 查詢對應的VALUE欄位
     */
    labelName: string;
    /**
     * label查詢的api
     */
    api?: string;
    /**
     * label查詢的api的初始參數
     */
    defaultParameters?: object;
  };
  /**
   * style外觀設定
   */
  style?: React.CSSProperties;
  /**
   * 元件回傳目前的值
   */
  referResult?: (value: string) => any | ((value: string) => Promise<any>);
  [x: string]: any;
  /**
   * 元件的Reference
   */
  ref?: React.Ref<any>;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}> = forwardRef(
  (
    {
      text,
      referValue,
      visible,
      query,
      bind,
      refer,
      name,
      style,
      referApi,
      referResult,
      callbackRef,
      ...props
    },
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
        ) : refer ? (
          <ReferLabel
            text={text}
            value={referValue}
            name={name}
            referApi={referApi}
            result={referResult}
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
