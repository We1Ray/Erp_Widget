import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Portal } from "react-overlays";
import { SystemContext } from "../../system-control/SystemContext";
import {
  ProgramContext,
  statusContext,
  STATUS,
} from "../../system-control/ProgramContext";
import PublicMethod from "../../../methods/PublicMethod";
import DatePicker from "react-datepicker";
import "./react-datepicker.css";
import MaskedInput from "react-maskedinput";
import "./DatetimeBox.scss";
import { None } from "../../system-ui/None";
import { DatetimeBoxProps } from "./DatetimeBox";
import useLatest from "../../../methods/useLatest";

export const QryDatetimeBox: React.FC<DatetimeBoxProps> = forwardRef(
  (
    {
      visible,
      disabled,
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
    const { System } = useContext(SystemContext);
    const { Program, ProgramDispatch } = useContext(ProgramContext);
    const { status } = useContext(statusContext);
    const [datetimeValue, setDatetimeValue] = useState(
      PublicMethod.checkValue(defaultValue) ? defaultValue : null
    );
    const [datetimeBoxDisable, setDatetimeBoxDisable] = useState(false);
    const [display, setDisplay] = useState(true);
    const datetimeBoxRef = useRef(null);

    useImperativeHandle(forwardedRef, () => datetimeBoxRef.current);

    useEffect(() => {
      try {
        setDisplay(
          PublicMethod.visibility(name, Program.queryConditions, visible)
        );
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(datetimeBoxRef);
        }
      } catch (error) {
        console.log("EROOR: QryDatetimeBox.useEffect()");
        console.log(error);
      }
    });

    /** Query useEffect */
    useEffect(() => {
      try {
        if (value !== undefined) {
          if (value) {
            setDatetimeValue(value);
          } else {
            setDatetimeValue(null);
          }
        }
      } catch (error) {
        console.log("EROOR: QryDatetimeBox.useEffect[value]");
        console.log(error);
      }
    }, [value]);

    /** 狀態改變執行的地方 */
    useEffect(() => {
      checkStatus();
    }, [status]);

    useEffect(() => {
      checkLoading();
    }, [Program.loading]);

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
            console.log("EROOR: QryDatetimeBox.valueValidation");
            console.log(error);
          }
        };
        validation(Program.changeData[name]);
      },
      [System.lang, status, JSON.stringify(Program.changeData)]
    );

    useEffect(() => {
      try {
        setQryDatetimeBoxValueToChangeData();
        if (result) {
          result(datetimeValue);
        }
      } catch (error) {
        console.log("EROOR: QryDatetimeBox.useEffect[datetimeValue]");
        console.log(error);
      }
    }, [datetimeValue]);

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
        console.log("EROOR: QryDatetimeBox.checkStatus");
        console.log(error);
      }
    }

    function checkLoading() {
      try {
        if (Program.loading !== "READ") {
          setDatetimeBoxDisable(true);
        } else {
          checkDisable();
        }
      } catch (error) {
        console.log("EROOR: QryDatetimeBox.checkLoading");
        console.log(error);
      }
    }

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setDatetimeBoxDisable(disabled);
        } else {
          setDatetimeBoxDisable(false);
        }
      } catch (error) {
        console.log("EROOR: QryDatetimeBox.checkDisable");
        console.log(error);
      }
    }

    function setQryDatetimeBoxValueToChangeData() {
      try {
        let time = PublicMethod.timeToString(datetimeValue, format);
        let parameter = Program.queryParameters;
        if (PublicMethod.checkValue(datetimeValue)) {
          parameter[name] = time;
        } else {
          delete parameter[name];
        }
        ProgramDispatch({ type: "queryParameters", value: parameter });
        if (Program.changeData[name] !== time) {
          ProgramDispatch({ type: "changeData", value: { [name]: time } });
        }
      } catch (error) {
        console.log("EROOR: QryDatetimeBox.setQryDatetimeBoxValueToChangeData");
        console.log(error);
      }
    }

    /** 當值改變時運作*/
    function handleChange(e) {
      try {
        setDatetimeValue(e);
      } catch (error) {
        console.log("EROOR: QryDatetimeBox.handleChange");
        console.log(error);
      }
    }

    const CalendarContainer = ({ children }) => {
      let handle = Math.floor(Math.random() * 10000);
      const el = document.getElementById("calendar-portal" + handle);

      return <Portal container={el}>{children}</Portal>;
    };

    return (
      <>
        {display ? (
          <>
            <DatePicker
              ref={datetimeBoxRef}
              selected={datetimeValue}
              disabled={datetimeBoxDisable}
              timeInputLabel="Time:"
              dateFormat={format}
              showTimeInput
              onChange={(value) => handleChange(value)}
              type="text"
              className="form-control"
              customInput={<MaskedInput mask={mask} {...props} />}
              popperContainer={CalendarContainer}
            />
          </>
        ) : (
          <None />
        )}
      </>
    );
  }
);
