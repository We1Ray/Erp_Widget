import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { QryCheckBox } from "./QryCheckBox";
import { BindCheckBox } from "./BindCheckBox";
import { CommonCheckBox } from "./CommonCheckBox";

interface CheckBoxProps {
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
  defaultValue?: string;
  /**
   * 設定給予值
   */
  value?: string;
  /**
   * 勾選後顯示的文字
   */
  checkedText: string;
  /**
   * 無勾選時顯示的文字
   */
  notCheckedText: string;
  /**
   * 勾選後的值
   */
  checkedValue: string;
  /**
   * 無勾選的值
   */
  notCheckedValue: string;
  /**
   * 元件回傳目前的值
   */
  result?: (
    value: string,
    text: string
  ) => any | ((value: string, text: string) => Promise<any>);
  /**
   * 元件的Reference
   */
  ref?: React.Ref<any>;

  [x: string]: any;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}
const CheckBox: React.FC<CheckBoxProps> = forwardRef(
  (
    {
      visible,
      disabled,
      bind,
      query,
      name,
      defaultValue,
      value,
      checkedText,
      notCheckedText,
      checkedValue,
      notCheckedValue,
      result,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const checkboxRef = useRef(null);

    useImperativeHandle(forwardedRef, () => checkboxRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(checkboxRef);
        }
      } catch (error) {
        console.log("EROOR: CheckBox.useEffect()");
        console.log(error);
      }
    });
    return (
      <>
        {query ? (
          <QryCheckBox
            visible={visible}
            disabled={disabled}
            name={name}
            defaultValue={defaultValue}
            value={value}
            checkedText={checkedText}
            notCheckedText={notCheckedText}
            checkedValue={checkedValue}
            notCheckedValue={notCheckedValue}
            result={result}
            ref={checkboxRef}
            {...props}
          />
        ) : bind ? (
          <BindCheckBox
            visible={visible}
            disabled={disabled}
            name={name}
            defaultValue={defaultValue}
            value={value}
            checkedText={checkedText}
            notCheckedText={notCheckedText}
            checkedValue={checkedValue}
            notCheckedValue={notCheckedValue}
            result={result}
            ref={checkboxRef}
            {...props}
          />
        ) : (
          <CommonCheckBox
            visible={visible}
            disabled={disabled}
            defaultValue={defaultValue}
            value={value}
            checkedText={checkedText}
            notCheckedText={notCheckedText}
            checkedValue={checkedValue}
            notCheckedValue={notCheckedValue}
            result={result}
            ref={checkboxRef}
            {...props}
          />
        )}
      </>
    );
  }
);
export { CheckBox };
export type { CheckBoxProps };
