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

export const QryCheckBox: React.FC<CheckBoxProps> = forwardRef(
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
    const [checked, setChecked] = useState(
      PublicMethod.checkValue(defaultValue)
        ? defaultValue == checkedValue
        : false
    );
    const [checkboxText, setCheckboxText] = useState(
      PublicMethod.checkValue(defaultValue)
        ? defaultValue == checkedValue
          ? checkedText
          : notCheckedText
        : notCheckedText
    );
    const [checkboxDisable, setCheckboxDisable] = useState(false);
    const [display, setDisplay] = useState(true);
    const checkboxRef = useRef(null);

    useImperativeHandle(forwardedRef, () => checkboxRef.current);

    useEffect(() => {
      try {
        setDisplay(
          PublicMethod.visibility(name, Program.queryConditions, visible)
        );
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(checkboxRef);
        }
      } catch (error) {
        console.log("EROOR: QryCheckBox.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        let value = checked ? checkedValue : notCheckedValue;
        let text = checked ? checkedText : notCheckedText;
        setCheckboxText(text);
        setQryCheckboxValueToChangeData(value);
        if (result) {
          result(value, text);
        }
      } catch (error) {
        console.log("EROOR: QryCheckBox.useEffect[checked]");
        console.log(error);
      }
    }, [checked, notCheckedText, notCheckedValue, checkedValue, checkedText]);

    /** Query useEffect */
    useEffect(() => {
      try {
        if (PublicMethod.checkValue(value)) {
          setChecked(value == checkedValue);
        }
      } catch (error) {
        console.log("EROOR: QryCheckBox.useEffect[defaultValue]");
        console.log(error);
      }
    }, [value, checkedValue]);

    /** 狀態改變執行的地方 */
    useEffect(() => {
      checkStatus();
    }, [status]);

    /**loading時設定無法編輯 */
    useEffect(() => {
      checkLoading();
    }, [Program.loading]);

    /** 確認目前作業狀態後更改欄位狀態 */
    function checkStatus() {
      try {
        switch (status.value) {
          case STATUS.READ:
          case STATUS.CREATE:
          case STATUS.UPDATE:
            checkDisable();
            break;
          default:
            break;
        }
      } catch (error) {
        console.log("EROOR: QryCheckBox.checkStatus");
        console.log(error);
      }
    }

    function checkLoading() {
      try {
        if (Program.loading !== "READ") {
          setCheckboxDisable(true);
        } else {
          checkDisable();
        }
      } catch (error) {
        console.log("EROOR: QryCheckBox.checkLoading");
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
        console.log("EROOR: QryCheckBox.checkDisable");
        console.log(error);
      }
    }

    function setQryCheckboxValueToChangeData(text: string) {
      try {
        let parameter = Program.queryParameters;
        parameter[name] = text;
        ProgramDispatch({ type: "queryParameters", value: parameter });
        if (Program.changeData[name] !== text) {
          ProgramDispatch({ type: "changeData", value: { [name]: text } });
        }
      } catch (error) {
        console.log("EROOR: QryCheckBox.setQryCheckboxValueToChangeData");
        console.log(error);
      }
    }

    function handleChange(e) {
      try {
        setChecked(e.target.checked);
      } catch (error) {
        console.log("EROOR: QryCheckBox.handleChange");
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
