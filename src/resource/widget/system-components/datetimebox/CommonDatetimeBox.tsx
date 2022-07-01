import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Portal } from "react-overlays";
import PublicMethod from "../../../methods/PublicMethod";
import DatePicker from "react-datepicker";
import "./react-datepicker.css";
import MaskedInput from "react-maskedinput";
import "./DatetimeBox.scss";
import { None } from "../../system-ui/None";
import { DatetimeBoxProps } from "./DatetimeBox";

export const CommonDatetimeBox: React.FC<DatetimeBoxProps> = forwardRef(
  (
    {
      visible,
      disabled,
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
    const [datetimeValue, setDatetimeValue] = useState(
      PublicMethod.checkValue(defaultValue) ? defaultValue : null
    );
    const [datetimeBoxDisable, setDatetimeBoxDisable] = useState(false);
    const [display, setDisplay] = useState(true);
    const datetimeBoxRef = useRef(null);

    useImperativeHandle(forwardedRef, () => datetimeBoxRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(datetimeBoxRef);
        }
      } catch (error) {
        console.log("EROOR: CommonDatetimeBox.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: CommonDatetimeBox.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

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

    useEffect(() => {
      try {
        if (result) {
          result(datetimeValue);
        }
      } catch (error) {
        console.log("EROOR: CommonDatetimeBox.useEffect[datetimeValue]");
        console.log(error);
      }
    }, [datetimeValue]);

    useEffect(() => {
      try {
        checkDisable();
      } catch (error) {
        console.log("EROOR: CommonDatetimeBox.useEffect[disable]");
        console.log(error);
      }
    }, [disabled]);

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setDatetimeBoxDisable(disabled);
        } else {
          setDatetimeBoxDisable(false);
        }
      } catch (error) {
        console.log("EROOR: CommonDatetimeBox.checkDisable");
        console.log(error);
      }
    }

    /** 當值改變時運作*/
    function handleChange(e) {
      try {
        setDatetimeValue(e);
      } catch (error) {
        console.log("EROOR: CommonDatetimeBox.handleChange");
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
