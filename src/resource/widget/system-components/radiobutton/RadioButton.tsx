import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { QryRadioButton } from "./QryRadioButton";
import { BindRadioButton } from "./BindRadioButton";
import { CommonRadioButton } from "./CommonRadioButton";
interface RadioButtonProps {
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
   * 設定正規表示式
   */
  handleValidation?: (value: any) => Promise<string>;
  /**
   * 按鈕的選項
   */
  options: {
    value: string;
    text: string;
    disabled?: boolean;
    style?: React.CSSProperties;
  }[]; //選項
  /**
   * 設定給予值
   */
  value?: string;
  /**
   * 選項在畫面中的比例同Col的使用方式
   */
  optionColumnProportion: number;
  /**
   * 元件回傳目前的值
   */
  result?: (
    value: string,
    text?: string
  ) => any | ((value: string, text?: string) => Promise<any>);
  /**
   * 元件的Reference
   */
  ref?: React.Ref<any>;

  [x: string]: any;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}
const RadioButton: React.FC<RadioButtonProps> = forwardRef(
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
      options,
      optionColumnProportion,
      result,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const radioButtonRef = useRef(null);

    useImperativeHandle(forwardedRef, () => radioButtonRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(radioButtonRef);
        }
      } catch (error) {
        console.log("EROOR: RadioButton.useEffect()");
        console.log(error);
      }
    });
    return (
      <>
        {query ? (
          <QryRadioButton
            visible={visible}
            disabled={disabled}
            name={name}
            defaultValue={defaultValue}
            value={value}
            handleValidation={handleValidation}
            options={options}
            optionColumnProportion={optionColumnProportion}
            result={result}
            ref={radioButtonRef}
            {...props}
          />
        ) : bind ? (
          <BindRadioButton
            visible={visible}
            disabled={disabled}
            name={name}
            defaultValue={defaultValue}
            value={value}
            handleValidation={handleValidation}
            options={options}
            optionColumnProportion={optionColumnProportion}
            result={result}
            ref={radioButtonRef}
            {...props}
          />
        ) : (
          <CommonRadioButton
            visible={visible}
            disabled={disabled}
            defaultValue={defaultValue}
            value={value}
            handleValidation={handleValidation}
            options={options}
            optionColumnProportion={optionColumnProportion}
            result={result}
            ref={radioButtonRef}
            {...props}
          />
        )}
      </>
    );
  }
);
export { RadioButton };
export type { RadioButtonProps };
