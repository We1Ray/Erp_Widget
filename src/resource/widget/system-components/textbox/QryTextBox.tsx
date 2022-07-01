import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { SystemContext } from "../../system-control/SystemContext";
import {
  ProgramContext,
  statusContext,
  STATUS,
} from "../../system-control/ProgramContext";
import PublicMethod from "../../../methods/PublicMethod";
import { None } from "../../system-ui/None";
import { showCurrentValue } from "./TextBox";
import { TextBoxProps, handleKeyDown, getheight } from "./TextBox";
import useLatest from "../../../methods/useLatest";

export const QryTextBox: React.FC<TextBoxProps> = forwardRef(
  (
    {
      visible,
      disabled,
      name,
      maxLength,
      defaultValue,
      value,
      handleValidation,
      result,
      area,
      style,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const { System } = useContext(SystemContext);
    const { Program, ProgramDispatch } = useContext(ProgramContext);
    const { status } = useContext(statusContext);
    const [textboxValue, setTextboxValue] = useState(
      PublicMethod.checkValue(defaultValue) ? defaultValue : ""
    );
    const [textboxDisable, setTextboxDisable] = useState(false);
    const [display, setDisplay] = useState(true);
    const [focus, setFocus] = useState(false);
    const [initial, setInitial] = useState(true);
    const [textArea] = useState(PublicMethod.checkValue(area) ? area : false);
    const textboxRef = useRef(null);

    useImperativeHandle(forwardedRef, () => textboxRef.current);

    useEffect(() => {
      try {
        setDisplay(
          PublicMethod.visibility(name, Program.queryConditions, visible)
        );
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(textboxRef);
        }
      } catch (error) {
        console.log("EROOR: QryTextBox.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        showCurrentValue(textboxRef, textboxValue);
        setQryTextboxValueToChangeData();
        if (result) {
          result(textboxValue);
        }
      } catch (error) {
        console.log("EROOR: QryTextBox.useEffect[textboxValue, status]");
        console.log(error);
      }
    }, [textboxValue]);

    useEffect(() => {
      try {
        if (textArea) {
          if (style) {
            if (!style.height) {
              getheight(textboxRef);
            }
          } else {
            getheight(textboxRef);
          }
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.useEffect");
        console.log(error);
      }
    });

    /** Qry useEffect */
    useEffect(() => {
      try {
        if (value !== undefined) {
          if (value) {
            setTextboxValue(value);
          } else {
            setTextboxValue("");
          }
        }
      } catch (error) {
        console.log("EROOR: QryTextBox.useEffect[status]");
        console.log(error);
      }
    }, [value]);

    useEffect(() => {
      checkStatus();
    }, [status]);

    useEffect(() => {
      if (Program.loading !== "READ") {
        setTextboxDisable(true);
      } else {
        checkDisable();
      }
    }, [Program.loading]);

    useEffect(() => {
      try {
        checkDisable();
      } catch (error) {
        console.log("EROOR: QryTextBox.useEffect[disable]");
        console.log(error);
      }
    }, [disabled]);

    useLatest(
      (latest) => {
        /** 設定欄位值的正規表示式*/
        const validation = async (newValue: any) => {
          try {
            let valid = "";
            if (PublicMethod.checkValue(handleValidation)) {
              valid = await handleValidation(newValue);
            }

            if (latest()) {
              let validation = Program.validation;
              if (PublicMethod.checkValue(valid)) {
                validation["query"][name] = valid;
                await ProgramDispatch({
                  type: "validation",
                  value: validation,
                });
              } else {
                delete validation["query"][name];
                await ProgramDispatch({
                  type: "validation",
                  value: validation,
                });
              }
            }
          } catch (error) {
            console.log("EROOR: TextBox.valueValidation");
            console.log(error);
          }
        };
        validation(Program.changeData[name]);
      },
      [System.lang, JSON.stringify(Program.changeData)]
    );

    useEffect(() => {
      try {
        if (initial) {
          setInitial(false);
        } else {
          if (!focus) {
            setTextboxValue(textboxRef.current.value);
          }
        }
      } catch (error) {
        console.log("EROOR: QryTextBox.useEffect[focus]");
        console.log(error);
      }
    }, [focus]);

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
        console.log("EROOR: QryTextBox.checkStatus");
        console.log(error);
      }
    }

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setTextboxDisable(disabled);
        } else {
          setTextboxDisable(false);
        }
      } catch (error) {
        console.log("EROOR: QryTextBox.checkDisable");
        console.log(error);
      }
    }

    function setQryTextboxValueToChangeData() {
      try {
        //查詢欄位，欄位值異動時將值寫入查詢參數
        let parameter = Program.queryParameters;
        parameter[name] = textboxValue;
        ProgramDispatch({ type: "queryParameters", value: parameter });
        if (Program.changeData[name] !== textboxValue) {
          ProgramDispatch({
            type: "changeData",
            value: { [name]: textboxValue },
          });
        }
      } catch (error) {
        console.log("EROOR: QryTextBox.setQryTextboxValueToChangeData");
        console.log(error);
      }
    }

    return (
      <>
        {display ? (
          <>
            {textArea ? (
              <textarea
                ref={textboxRef}
                className="form-control"
                disabled={textboxDisable}
                defaultValue={textboxValue}
                maxLength={maxLength}
                style={
                  style
                    ? Object.assign(
                        {
                          minHeight: "40px",
                        },
                        style
                      )
                    : {
                        minHeight: "40px",
                      }
                }
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onKeyDown={handleKeyDown}
                {...props}
              />
            ) : (
              <input
                type={"text"}
                ref={textboxRef}
                className=" form-control input-rounded"
                disabled={textboxDisable}
                defaultValue={textboxValue}
                style={style}
                maxLength={maxLength}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                {...props}
              />
            )}
          </>
        ) : (
          <None />
        )}
      </>
    );
  }
);
