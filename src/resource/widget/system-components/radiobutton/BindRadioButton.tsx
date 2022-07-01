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
import { Input, Col } from "reactstrap";
import { Row } from "../../system-ui/Row";
import { None } from "../../system-ui/None";
import { RadioButtonProps } from "./RadioButton";
import useLatest from "../../../methods/useLatest";

export const BindRadioButton: React.FC<RadioButtonProps> = forwardRef(
  (
    {
      visible,
      disabled,
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
    const { System } = useContext(SystemContext);
    const { Program, ProgramDispatch } = useContext(ProgramContext);
    const { status } = useContext(statusContext);
    const [radioButtonValue, setRadioButtonValue] = useState("");
    const [radioButtonText, setRadioButtonText] = useState("");
    const [radioButtonDisable, setRadioButtonDisable] = useState(false);
    const [display, setDisplay] = useState(true);
    const radioButtonRef = useRef(null);

    useImperativeHandle(forwardedRef, () => radioButtonRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(radioButtonRef);
        }
      } catch (error) {
        console.log("EROOR: BindRadioButton.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: BindRadioButton.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

    /** Bind useEffect*/
    /** 狀態改變執行的地方 */
    useEffect(() => {
      checkStatus();
    }, [status, disabled]);

    /**當查詢資料變更時的動作*/
    useEffect(() => {
      bindData();
    }, [JSON.stringify(Program.selectedData[name])]);

    useEffect(() => {
      try {
        if (value !== undefined && radioButtonValue !== value) {
          if (value) {
            setRadioButtonValue(value);
          } else {
            setRadioButtonValue("");
          }
        }
      } catch (error) {
        console.log("EROOR: BindRadioButton.useEffect[value]");
        console.log(error);
      }
    }, [value]);

    /**當查詢資料變更時的動作*/
    useEffect(() => {
      bindData();
    }, [JSON.stringify(Program.selectedData[name])]);

    useEffect(() => {
      setBindValueToStatusParameter();
    }, [radioButtonValue, status]);

    useEffect(() => {
      try {
        //綁定欄位，新增欄位值異動時將值寫入新增參數
        if (Program.changeData[name] !== radioButtonValue) {
          ProgramDispatch({
            type: "changeData",
            value: { [name]: radioButtonValue },
          });
        }
        setRadioButtonText(
          options.find((obj) => obj.value === radioButtonValue).text
        );
      } catch (error) {
        console.log("EROOR: BindRadioButton.useEffect[textboxValue]");
        console.log(error);
      }
    }, [radioButtonValue]);

    useEffect(() => {
      try {
        if (result) {
          result(radioButtonValue, radioButtonText);
        }
      } catch (error) {
        console.log("EROOR: BindRadioButton.useEffect[radioButtonText]");
        console.log(error);
      }
    }, [radioButtonText]);

    useLatest(
      (latest) => {
        /** 設定欄位值的正規表示式*/
        const validation = async (newValue) => {
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
            console.log("EROOR: BindRadioButton.validation");
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
            setRadioButtonDisable(true);
            break;
          case STATUS.CREATE:
            checkDisable();
            if (PublicMethod.checkValue(defaultValue)) {
              //給予預設值
              setRadioButtonValue(defaultValue);
            } else {
              setRadioButtonValue("");
            }
            break;
          case STATUS.UPDATE:
            if (Program.dataKey.indexOf(name) > -1) {
              //設定Key值不可編輯
              setRadioButtonDisable(true);
            } else {
              checkDisable();
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.log("EROOR: BindRadioButton.checkStatus");
        console.log(error);
      }
    }

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setRadioButtonDisable(disabled);
        } else {
          setRadioButtonDisable(false);
        }
      } catch (error) {
        console.log("EROOR: BindRadioButton.checkDisable");
        console.log(error);
      }
    }

    /**資料變更後若有選定的資料則顯示*/
    function bindData() {
      try {
        if (!status.matches(STATUS.CREATE)) {
          if (PublicMethod.checkValue(Program.data)) {
            //若有資料則綁定
            setRadioButtonValue(Program.selectedData[name]);
          } else {
            setRadioButtonValue("");
          }
        }
      } catch (error) {
        console.log("EROOR: BindRadioButton.bindData");
        console.log(error);
      }
    }

    function setBindValueToStatusParameter() {
      try {
        switch (status.value) {
          case STATUS.CREATE:
            ProgramDispatch({
              type: "insertParameters",
              value: { [name]: radioButtonValue },
            });
            break;
          case STATUS.UPDATE:
            ProgramDispatch({
              type: "updateParameters",
              value: { [name]: radioButtonValue },
            });
            break;
          default:
            break;
        }
      } catch (error) {
        console.log("EROOR: BindRadioButton.setBindValueToStatusParameter");
        console.log(error);
      }
    }

    function InputDisable(optionsDisabled, radioButtonDisable) {
      try {
        if (radioButtonDisable) {
          return true;
        } else {
          if (optionsDisabled) {
            return true;
          } else {
            return false;
          }
        }
      } catch (error) {
        console.log("EROOR: BindRadioButton.InputDisable");
        console.log(error);
      }
    }

    function changeValue(change) {
      try {
        setRadioButtonValue(change);
      } catch (error) {
        console.log("EROOR: BindRadioButton.changeValue");
        console.log(error);
      }
    }

    let Selection = [];
    for (let index = 0; index < options.length; index++) {
      Selection.push(
        <Col
          md={
            PublicMethod.checkValue(optionColumnProportion)
              ? optionColumnProportion
              : 1
          }
        >
          <label className="c-radio">
            <Input
              type="radio"
              disabled={InputDisable(
                options[index].disabled,
                radioButtonDisable
              )}
              onChange={() => changeValue(options[index].value)}
              checked={options[index].value === radioButtonValue}
            />
            <span className="fa fa-check" />
            <p style={options[index].style}>{options[index].text}</p>
          </label>
        </Col>
      );
    }

    return (
      <>
        {display ? (
          <>
            <Row ref={radioButtonRef} {...props}>
              {Selection}
            </Row>
          </>
        ) : (
          <None />
        )}
      </>
    );
  }
);
