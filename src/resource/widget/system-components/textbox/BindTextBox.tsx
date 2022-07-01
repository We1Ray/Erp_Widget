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

export const BindTextBox: React.FC<TextBoxProps> = forwardRef(
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
    const [textboxValue, setTextboxValue] = useState("");
    const [textboxDisable, setTextboxDisable] = useState(false);
    const [backColor, setBackColor] = useState(undefined);
    const [display, setDisplay] = useState(true);
    const [focus, setFocus] = useState(false);
    const [initial, setInitial] = useState(true);
    const [textArea] = useState(PublicMethod.checkValue(area) ? area : false);
    const textboxRef = useRef(null);

    useImperativeHandle(forwardedRef, () => textboxRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(textboxRef);
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

    useEffect(() => {
      try {
        showCurrentValue(textboxRef, textboxValue);
        //綁定欄位，新增欄位值異動時將值寫入新增參數
        if (Program.changeData[name] !== textboxValue) {
          ProgramDispatch({
            type: "changeData",
            value: { [name]: textboxValue },
          });
        }
        if (result) {
          result(textboxValue);
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.useEffect[textboxValue, status]");
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

    useEffect(() => {
      checkStatus();
    }, [status, disabled]);

    useEffect(() => {
      try {
        if (value !== undefined && textboxValue !== value) {
          if (value) {
            setTextboxValue(value);
          } else {
            setTextboxValue("");
          }
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.useEffect[value]");
        console.log(error);
      }
    }, [value]);

    /**當查詢資料變更時的動作*/
    useEffect(() => {
      bindData();
    }, [JSON.stringify(Program.selectedData[name])]);

    useEffect(() => {
      try {
        setBindValueToStatusParameter();
      } catch (error) {
        console.log("EROOR: BindTextBox.useEffect[textboxValue, status]");
        console.log(error);
      }
    }, [textboxValue, status]);

    useLatest(
      (latest) => {
        /** 設定欄位值的正規表示式*/
        const validation = async (newValue: any) => {
          try {
            let valid = "";
            if (
              status.matches(STATUS.CREATE) &&
              Program.dataKey.indexOf(name) > -1 &&
              !PublicMethod.checkValue(newValue)
            ) {
              //判斷Key值是否為空
              valid = System.getLocalization("Public", "ErrorMsgEmpty");
            } else if (
              (status.matches(STATUS.UPDATE) ||
                status.matches(STATUS.CREATE)) &&
              PublicMethod.checkValue(handleValidation)
            ) {
              //判斷新增/修改時 是否有正規表示式
              valid = await handleValidation(newValue);
            }
            if (latest()) {
              let validation = Program.validation;
              if (PublicMethod.checkValue(valid)) {
                validation.bind[name] = valid;
                await ProgramDispatch({
                  type: "validation",
                  value: validation,
                });
              } else {
                delete validation.bind[name];
                await ProgramDispatch({
                  type: "validation",
                  value: validation,
                });
              }
            }
          } catch (error) {
            console.log("EROOR: BindTextBox.valueValidation");
            console.log(error);
          }
        };
        validation(Program.changeData[name]);
      },
      [System.lang, status, JSON.stringify(Program.changeData)]
    );

    /** 確認目前作業狀態後更改欄位狀態 */
    function checkStatus() {
      try {
        switch (status.value) {
          case STATUS.READ:
            bindData();
            setTextboxDisable(true);
            setBackColor(undefined);
            break;
          case STATUS.CREATE:
            checkDisable();
            if (PublicMethod.checkValue(defaultValue)) {
              //給予預設值
              setTextboxValue(defaultValue);
            } else {
              setTextboxValue("");
            }
            if (Program.dataKey.indexOf(name) > -1) {
              //設定Key欄位新增時的底色
              setBackColor("#f9eb40");
            } else {
              setBackColor(undefined);
            }
            break;
          case STATUS.UPDATE:
            setBackColor(undefined);
            if (Program.dataKey.indexOf(name) > -1) {
              //設定Key值不可編輯
              setTextboxDisable(true);
            } else {
              checkDisable();
            }
            break;
          default:
            setBackColor(undefined);
            break;
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.checkStatus");
        console.log(error);
      }
    }

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
        console.log("EROOR: BindTextBox.useEffect[focus]");
        console.log(error);
      }
    }, [focus]);

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setTextboxDisable(disabled);
        } else {
          setTextboxDisable(false);
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.checkDisable");
        console.log(error);
      }
    }

    /**資料變更後若有選定的資料則顯示*/
    function bindData() {
      try {
        if (!status.matches(STATUS.CREATE)) {
          if (PublicMethod.checkValue(Program.data)) {
            //若有資料則綁定
            setTextboxValue(Program.selectedData[name]);
          } else {
            setTextboxValue("");
          }
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.bindData");
        console.log(error);
      }
    }

    function setBindValueToStatusParameter() {
      try {
        switch (status.value) {
          case STATUS.CREATE:
            if (Program.insertParameters[name] !== textboxValue) {
              ProgramDispatch({
                type: "insertParameters",
                value: { [name]: textboxValue },
              });
            }
            break;
          case STATUS.UPDATE:
            if (Program.updateParameters[name] !== textboxValue) {
              ProgramDispatch({
                type: "updateParameters",
                value: { [name]: textboxValue },
              });
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.setBindValueToStatusParameter");
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
                          backgroundColor: backColor,
                        },
                        style
                      )
                    : {
                        minHeight: "40px",
                        backgroundColor: backColor,
                      }
                }
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onKeyDown={handleKeyDown}
                draggable={false}
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
