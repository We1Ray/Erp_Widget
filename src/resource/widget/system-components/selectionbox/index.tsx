import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { QrySelectionBox } from "./Qry";
import { BindSelectionBox } from "./Bind";
import { CommonSelectionBox } from "./Common";

interface option {
  value: string;
  label: string;
  isFixed?: boolean;
}
interface referApi {
  valueName: string;
  labelName: string;
  api?: string;
  defaultParameters?: object;
}
interface SelectionBoxProps {
  multiple: boolean;
  options?: option[];
  referApi?: referApi;
  visible?: boolean;
  disabled?: boolean;
  bind?: boolean;
  query?: boolean;
  name?: string;
  maxSelections?: number;
  defaultValue?: {
    value: string;
    label: string;
    isFixed?: boolean;
  }[];
  value?: {
    value: string;
    label: string;
    isFixed?: boolean;
  }[];
  handleValidation?: (value: any) => Promise<string>;
  placeholder?: string;
  result?: (
    value: {
      value: string;
      label: string;
      isFixed?: boolean;
    }[]
  ) =>
    | any
    | ((
        value: {
          value: string;
          label: string;
          isFixed?: boolean;
        }[]
      ) => Promise<any>);
  ref?: React.Ref<any>;
  [x: string]: any;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}

const SelectionBox: React.FC<{
  /**
   * 設定是否多選
   */
  multiple: boolean;
  /**
   * 設定選項
   */
  options?: {
    value: string;
    label: string;
    /**
     * 設定值選擇後是否固定
     */
    isFixed?: boolean;
  }[];
  /**
   * 設定選項來源為api，如果有設定options，則以options為主
   */
  referApi?: {
    /**
     * 查詢對應的KEY, VALUE欄位
     */
    valueName: string;
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
   * 設定選擇的上限
   */
  maxSelections?: number;
  /**
   * 設定預設值
   */
  defaultValue?: {
    value: string;
    label: string;
    /**
     * 設定值選擇後是否固定
     */
    isFixed?: boolean;
  }[]; //新增時的預設值
  value?: {
    value: string;
    label: string;
    /**
     * 設定值選擇後是否固定
     */
    isFixed?: boolean;
  }[];
  /**
   * 設定正規表示式
   */
  handleValidation?: (value: any) => Promise<string>;
  /**
   * 設定空值時的顯示文字
   */
  placeholder?: string;
  /**
   * 元件回傳目前的值
   */
  result?: (
    value: {
      value: string;
      label: string;
      isFixed?: boolean;
    }[]
  ) =>
    | any
    | ((
        value: {
          value: string;
          label: string;
          isFixed?: boolean;
        }[]
      ) => Promise<any>);
  /**
   * 元件的Reference
   */
  ref?: React.Ref<any>;

  [x: string]: any;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}> = forwardRef(
  (
    {
      visible,
      disabled,
      bind,
      query,
      name,
      maxSelections,
      defaultValue,
      value,
      handleValidation,
      options,
      referApi,
      multiple,
      placeholder,
      result,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const selectionRef = useRef(null);
    useImperativeHandle(forwardedRef, () => selectionRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(selectionRef);
        }
      } catch (error) {
        console.log("EROOR: SelectionBox.useEffect()");
        console.log(error);
      }
    });

    return (
      <>
        {query ? (
          <QrySelectionBox
            visible={visible}
            disabled={disabled}
            name={name}
            maxSelections={maxSelections}
            defaultValue={defaultValue}
            value={value}
            options={options}
            referApi={referApi}
            handleValidation={handleValidation}
            multiple={multiple}
            placeholder={placeholder}
            result={result}
            ref={selectionRef}
            {...props}
          />
        ) : bind ? (
          <BindSelectionBox
            visible={visible}
            disabled={disabled}
            name={name}
            maxSelections={maxSelections}
            defaultValue={defaultValue}
            value={value}
            options={options}
            referApi={referApi}
            handleValidation={handleValidation}
            multiple={multiple}
            placeholder={placeholder}
            result={result}
            ref={selectionRef}
            {...props}
          />
        ) : (
          <CommonSelectionBox
            visible={visible}
            disabled={disabled}
            maxSelections={maxSelections}
            defaultValue={defaultValue}
            value={value}
            options={options}
            referApi={referApi}
            handleValidation={handleValidation}
            multiple={multiple}
            placeholder={placeholder}
            result={result}
            ref={selectionRef}
            {...props}
          />
        )}
      </>
    );
  }
);

function getSelectionFromData(value, multiple, selectionOptions) {
  let selectArray = [];
  try {
    if (PublicMethod.checkValue(value)) {
      if (multiple === true) {
        let valueArray = value.split(";");
        for (let i = 0; i < valueArray.length; i++) {
          for (let j = 0; j < selectionOptions.length; j++) {
            if (valueArray[i] === selectionOptions[j].value) {
              selectArray.push(selectionOptions[j]);
              break;
            }
          }
        }
      } else {
        for (let index = 0; index < selectionOptions.length; index++) {
          if (value === selectionOptions[index].value) {
            selectArray = [selectionOptions[index]];
            break;
          }
        }
      }
    }
  } catch (error) {
    console.log("EROOR: SelectionBox.getSelectionFromData");
    console.log(error);
  }
  return selectArray;
}

function getSelectionToData(selectionList, multiple) {
  let selectValue = "";
  try {
    if (PublicMethod.checkValue(selectionList)) {
      if (multiple === true) {
        for (let index = 0; index < selectionList.length; index++) {
          selectValue = selectValue + selectionList[index].value + ";";
        }
        selectValue = selectValue.substring(0, selectValue.length - 1);
      } else {
        if (selectionList[0]) {
          selectValue = selectionList[0].value;
        } else {
          selectValue = selectionList.value;
        }
      }
    }
  } catch (error) {
    console.log("EROOR: SelectionBox.getSelectionToData");
    console.log(error);
  }
  return selectValue;
}

export { SelectionBox, getSelectionFromData, getSelectionToData };
export type { SelectionBoxProps, option };
