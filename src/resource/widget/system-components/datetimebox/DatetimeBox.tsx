import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { QryDatetimeBox } from "./QryDatetimeBox";
import { BindDatetimeBox } from "./BindDatetimeBox";
import { CommonDatetimeBox } from "./CommonDatetimeBox";
interface DatetimeBoxProps {
  /**
   * 判斷是否可視 初始值為true
   */
  visible?: boolean;
  /**
   * 判斷是否可用 初始值為false
   */
  disabled?: boolean;
  /**
   * 是否為Binding欄位(和query擇一)
   */
  bind?: boolean;
  /**
   * 是否為query欄位(和bind擇一)
   */
  query?: boolean;
  /**
   * 元件名稱
   */
  name?: string;
  /**
   * 新增時的預設值
   */
  defaultValue?: Date;
  /**
   * 設定給予值
   */
  value?: Date;
  /**
   * 設定正規表示式
   */
  handleValidation?: (value: any) => Promise<string>;
  /**
   * 設定日期格式 可參考:https://reactdatepicker.com/#example-default
   */
  format: string;
  /**
   * 設定輸入格式
   */
  mask: string;
  /**
   * 元件回傳目前的值
   */
  result?: (value: Date) => any | ((value: Date) => Promise<any>);
  /**
   * 元件的Reference
   */
  ref?: React.Ref<any>;

  [x: string]: any;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}
const DatetimeBox: React.FC<DatetimeBoxProps> = forwardRef(
  (
    {
      visible,
      disabled,
      bind,
      query,
      name,
      defaultValue,
      value,
      handleValidation,
      format,
      mask,
      result,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const datetimeBoxRef = useRef(null);

    useImperativeHandle(forwardedRef, () => datetimeBoxRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(datetimeBoxRef);
        }
      } catch (error) {
        console.log("EROOR: DatetimeBox.useEffect()");
        console.log(error);
      }
    });
    return (
      <>
        {query ? (
          <QryDatetimeBox
            visible={visible}
            disabled={disabled}
            name={name}
            defaultValue={defaultValue}
            value={value}
            handleValidation={handleValidation}
            format={format}
            mask={mask}
            result={result}
            ref={datetimeBoxRef}
            {...props}
          />
        ) : bind ? (
          <BindDatetimeBox
            visible={visible}
            disabled={disabled}
            name={name}
            defaultValue={defaultValue}
            value={value}
            handleValidation={handleValidation}
            format={format}
            mask={mask}
            result={result}
            ref={datetimeBoxRef}
            {...props}
          />
        ) : (
          <CommonDatetimeBox
            visible={visible}
            disabled={disabled}
            defaultValue={defaultValue}
            value={value}
            handleValidation={handleValidation}
            format={format}
            mask={mask}
            result={result}
            ref={datetimeBoxRef}
            {...props}
          />
        )}
      </>
    );
  }
);
export { DatetimeBox };
export type { DatetimeBoxProps };
