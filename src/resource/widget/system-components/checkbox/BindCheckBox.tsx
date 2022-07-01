import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  ProgramContext,
  statusContext,
  STATUS,
} from "../../system-control/ProgramContext";
import PublicMethod from "../../../methods/PublicMethod";
import { Input } from "reactstrap";
import "./CheckBox.scss";
import { None } from "../../system-ui/None";
import { CheckBoxProps } from "./CheckBox";

export const BindCheckBox: React.FC<CheckBoxProps> = forwardRef(
  (
    {
      visible,
      disabled,
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
    const { Program, ProgramDispatch } = useContext(ProgramContext);
    const { status } = useContext(statusContext);
    const [checked, setChecked] = useState(false);
    const [checkboxText, setCheckboxText] = useState(notCheckedText);
    const [checkboxDisable, setCheckboxDisable] = useState(false);
    const [display, setDisplay] = useState(true);
    const checkboxRef = useRef(null);

    useImperativeHandle(forwardedRef, () => checkboxRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(checkboxRef);
        }
      } catch (error) {
        console.log("EROOR: BindCheckBox.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: BindCheckBox.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

    useEffect(() => {
      try {
        let value = checked ? checkedValue : notCheckedValue;
        let text = checked ? checkedText : notCheckedText;
        setCheckboxText(text);
        if (Program.changeData[name] !== value) {
          ProgramDispatch({ type: "changeData", value: { [name]: value } });
        }
        if (result) {
          result(value, text);
        }
      } catch (error) {
        console.log("EROOR: BindCheckBox.useEffect[checked]");
        console.log(error);
      }
    }, [checked, notCheckedText, notCheckedValue, checkedValue, checkedText]);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(value)) {
          if ((value == checkedValue) != checked) {
            setChecked(value == checkedValue);
          }
        }
      } catch (error) {
        console.log("EROOR: BindCheckBox.useEffect[defaultValue]");
        console.log(error);
      }
    }, [value, checkedValue]);

    /** Bind useEffect */
    useEffect(() => {
      checkStatus();
    }, [status, disabled]);

    /**當查詢資料變更時的動作*/
    useEffect(() => {
      bindData();
    }, [JSON.stringify(Program.selectedData[name])]);

    useEffect(() => {
      try {
        setBindValueToStatusParameter();
      } catch (error) {
        console.log("EROOR: BindCheckBox.useEffect[checked, status]");
        console.log(error);
      }
    }, [checked, status]);

    /** 確認目前作業狀態後更改欄位狀態 */
    function checkStatus() {
      try {
        switch (status.value) {
          case STATUS.READ:
            bindData();
            setCheckboxDisable(true);
            break;
          case STATUS.CREATE:
            checkDisable();
            if (PublicMethod.checkValue(defaultValue)) {
              //給予預設值
              setChecked(defaultValue == checkedValue);
            } else {
              setChecked(false);
            }
            break;
          case STATUS.UPDATE:
            if (Program.dataKey.indexOf(name) > -1) {
              //設定Key值不可編輯
              setCheckboxDisable(true);
            } else {
              checkDisable();
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.log("EROOR: BindCheckBox.checkStatus");
        console.log(error);
      }
    }

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setCheckboxDisable(disabled);
        } else {
          setCheckboxDisable(false);
        }
      } catch (error) {
        console.log("EROOR: BindCheckBox.checkDisable");
        console.log(error);
      }
    }

    /**資料變更後若有選定的資料則顯示*/
    function bindData() {
      try {
        if (!status.matches(STATUS.CREATE)) {
          if (PublicMethod.checkValue(Program.data)) {
            //若有資料則綁定
            setChecked(Program.selectedData[name] == checkedValue);
          } else {
            setChecked(false);
          }
        }
      } catch (error) {
        console.log("EROOR: BindCheckBox.bindData");
        console.log(error);
      }
    }

    function setBindValueToStatusParameter() {
      try {
        switch (status.value) {
          case STATUS.CREATE:
            ProgramDispatch({
              type: "insertParameters",
              value: { [name]: checked ? checkedValue : notCheckedValue },
            });
            break;
          case STATUS.UPDATE:
            ProgramDispatch({
              type: "updateParameters",
              value: { [name]: checked ? checkedValue : notCheckedValue },
            });
            break;
          default:
            break;
        }
      } catch (error) {
        console.log("EROOR: BindCheckBox.setBindValueToStatusParameter");
        console.log(error);
      }
    }

    function handleChange(e) {
      try {
        setChecked(e.target.checked);
      } catch (error) {
        console.log("EROOR: BindCheckBox.handleChange");
        console.log(error);
      }
    }

    return (
      <>
        {display ? (
          <label className="c-checkbox" {...props}>
            <div className="input-group">
              <Input
                ref={checkboxRef}
                type="checkbox"
                disabled={checkboxDisable}
                defaultChecked={checked}
                checked={checked}
                onChange={handleChange}
              />
              <span className="fa fa-check" />
              <p>{checkboxText}</p>
            </div>
          </label>
        ) : (
          <None />
        )}
      </>
    );
  }
);
