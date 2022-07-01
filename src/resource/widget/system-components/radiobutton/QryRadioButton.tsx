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

export const QryRadioButton: React.FC<RadioButtonProps> = forwardRef(
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
    const [radioButtonValue, setRadioButtonValue] = useState(
      PublicMethod.checkValue(defaultValue) ? defaultValue : ""
    );
    const [radioButtonText, setRadioButtonText] = useState("");
    const [radioButtonDisable, setRadioButtonDisable] = useState(false);
    const [display, setDisplay] = useState(true);
    const radioButtonRef = useRef(null);

    useImperativeHandle(forwardedRef, () => radioButtonRef.current);

    useEffect(() => {
      try {
        setDisplay(
          PublicMethod.visibility(name, Program.queryConditions, visible)
        );
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(radioButtonRef);
        }
      } catch (error) {
        console.log("EROOR: QryRadioButton.useEffect()");
        console.log(error);
      }
    });

    /** Query useEffect */
    useEffect(() => {
      try {
        if (value !== undefined) {
          if (value) {
            setRadioButtonValue(value);
          } else {
            setRadioButtonValue("");
          }
        }
      } catch (error) {
        console.log("EROOR: QryRadioButton.useEffect[value]");
        console.log(error);
      }
    }, [JSON.stringify(value)]);

    /** 狀態改變執行的地方 */
    useEffect(() => {
      checkStatus();
    }, [status]);

    /**loading時設定無法編輯 */
    useEffect(() => {
      checkLoading();
    }, [Program.loading]);

    useEffect(() => {
      try {
        setQryRadioButtonValueToChangeData();
        setRadioButtonText(
          options.find((obj) => obj.value === radioButtonValue).text
        );
      } catch (error) {
        console.log("EROOR: QryRadioButton.useEffect[radioButtonValue]");
        console.log(error);
      }
    }, [radioButtonValue]);

    useEffect(() => {
      try {
        if (result) {
          result(radioButtonValue, radioButtonText);
        }
      } catch (error) {
        console.log("EROOR: QryRadioButton.useEffect[radioButtonText]");
        console.log(error);
      }
    }, [radioButtonText]);

    useLatest(
      (latest) => {
        /** 設定欄位值的正規表示式*/
        const validation = async (newValue) => {
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
            console.log("EROOR: QryRadioButton.validation");
            console.log(error);
          }
        };
        validation(Program.changeData[name]);
      },
      [System.lang, status, JSON.stringify(Program.changeData)]
    );

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
        console.log("EROOR: QryRadioButton.checkStatus");
        console.log(error);
      }
    }

    function checkLoading() {
      try {
        if (Program.loading !== "READ") {
          setRadioButtonDisable(true);
        } else {
          checkDisable();
        }
      } catch (error) {
        console.log("EROOR: QryRadioButton.checkLoading");
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
        console.log("EROOR: QryRadioButton.checkDisable");
        console.log(error);
      }
    }

    function setQryRadioButtonValueToChangeData() {
      try {
        let parameter = Program.queryParameters;
        parameter[name] = radioButtonValue;
        ProgramDispatch({ type: "queryParameters", value: parameter });
        if (Program.changeData[name] !== radioButtonValue) {
          ProgramDispatch({
            type: "changeData",
            value: { [name]: radioButtonValue },
          });
        }
      } catch (error) {
        console.log("EROOR: QryRadioButton.setRadioButtonValueToChangeData");
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
        console.log("EROOR: QryRadioButton.InputDisable");
        console.log(error);
      }
    }

    function changeValue(change) {
      try {
        setRadioButtonValue(change);
      } catch (error) {
        console.log("EROOR: QryRadioButton.changeValue");
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
