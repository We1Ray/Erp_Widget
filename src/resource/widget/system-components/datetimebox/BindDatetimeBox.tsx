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
import moment from "moment";
import "./DatetimeBox.scss";
import { None } from "../../system-ui/None";
import { DatetimeBoxProps } from "./DatetimeBox";
import useLatest from "../../../methods/useLatest";

export const BindDatetimeBox: React.FC<DatetimeBoxProps> = forwardRef(
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
    const [datetimeValue, setDatetimeValue] = useState<Date>(null);
    const [datetimeBoxDisable, setDatetimeBoxDisable] = useState(false);
    const [backColor, setBackColor] = useState(undefined);
    const [display, setDisplay] = useState(true);
    const datetimeBoxRef = useRef(null);

    useImperativeHandle(forwardedRef, () => datetimeBoxRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(datetimeBoxRef);
        }
      } catch (error) {
        console.log("EROOR: BindDatetimeBox.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: BindDatetimeBox.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

    /** 狀態改變執行的地方 */
    useEffect(() => {
      checkStatus();
    }, [status, disabled]);

    useEffect(() => {
      try {
        if (value !== undefined && datetimeValue !== value) {
          if (value) {
            setDatetimeValue(value);
          } else {
            setDatetimeValue(null);
          }
        }
      } catch (error) {
        console.log("EROOR: BindDatetimeBox.useEffect[value]");
        console.log(error);
      }
    }, [value]);

    /**當查詢資料變更時的動作*/
    useEffect(() => {
      try {
        bindData();
      } catch (error) {
        console.log(
          "EROOR: BindDatetimeBox.useEffect[JSON.stringify(Program.selectedData[bindColumn])]"
        );
        console.log(error);
      }
    }, [JSON.stringify(Program.selectedData[name])]);

    useEffect(() => {
      try {
        setBindValueToStatusParameter();
      } catch (error) {
        console.log("EROOR: BindDatetimeBox.useEffect[datetimeValue, status]");
        console.log(error);
      }
    }, [datetimeValue, status]);

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
            console.log("EROOR: BindDatetimeBox.valueValidation");
            console.log(error);
          }
        };
        validation(Program.changeData[name]);
      },
      [System.lang, status, JSON.stringify(Program.changeData)]
    );

    useEffect(() => {
      try {
        let time = PublicMethod.timeToString(datetimeValue, format);
        if (Program.changeData[name] !== time) {
          ProgramDispatch({ type: "changeData", value: { [name]: time } });
        }
        if (result) {
          result(datetimeValue);
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.useEffect[datetimeValue]");
        console.log(error);
      }
    }, [datetimeValue]);

    /** 確認目前作業狀態後更改欄位狀態 */
    function checkStatus() {
      try {
        switch (status.value) {
          case STATUS.READ:
            bindData();
            setDatetimeBoxDisable(true);
            setBackColor(undefined);
            break;
          case STATUS.CREATE:
            checkDisable();
            if (PublicMethod.checkValue(defaultValue)) {
              //給予預設值
              setDatetimeValue(defaultValue);
            } else {
              setDatetimeValue(null);
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
              setDatetimeBoxDisable(true);
            } else {
              checkDisable();
            }
            break;
          default:
            setBackColor(undefined);
            break;
        }
      } catch (error) {
        console.log("EROOR: BindDatetimeBox.checkStatus");
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
        console.log("EROOR: BindDatetimeBox.checkDisable");
        console.log(error);
      }
    }

    /**資料變更後若有選定的資料則顯示*/
    function bindData() {
      try {
        if (!status.matches(STATUS.CREATE)) {
          if (
            PublicMethod.checkValue(Program.data) &&
            PublicMethod.checkValue(Program.selectedData[name])
          ) {
            setDatetimeValue(moment(Program.selectedData[name]).toDate());
          } else {
            setDatetimeValue(null);
          }
        }
      } catch (error) {
        console.log("EROOR: BindDatetimeBox.bindData");
        console.log(error);
      }
    }

    function setBindValueToStatusParameter() {
      try {
        switch (status.value) {
          case STATUS.CREATE:
            ProgramDispatch({
              type: "insertParameters",
              value: {
                [name]: PublicMethod.timeToString(datetimeValue, format),
              },
            });
            break;
          case STATUS.UPDATE:
            ProgramDispatch({
              type: "updateParameters",
              value: {
                [name]: PublicMethod.timeToString(datetimeValue, format),
              },
            });
            break;
          default:
            break;
        }
      } catch (error) {
        console.log(
          "EROOR: BindDatetimeBox.setBindDatetimeBoxValueToStatusParameter"
        );
        console.log(error);
      }
    }

    /** 當值改變時運作*/
    function handleChange(e) {
      try {
        setDatetimeValue(e);
      } catch (error) {
        console.log("EROOR: BindDatetimeBox.handleChange");
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
              customInput={
                <MaskedInput
                  mask={mask}
                  style={{ backgroundColor: backColor }}
                  {...props}
                />
              }
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
