import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { None } from "../../system-ui/None";
import { handleKeyDown, showCurrentValue, getheight } from "./TextBox";
import { TextBoxProps } from "./TextBox";

export const CommonTextBox: React.FC<TextBoxProps> = forwardRef(
  (
    {
      visible,
      disabled,
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
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(textboxRef);
        }
      } catch (error) {
        console.log("EROOR: CommonTextBox.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: CommonTextBox.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

    useEffect(() => {
      try {
        if (!focus && !initial) {
          setTextboxValue(textboxRef.current.value);
        }
        setInitial(false);
      } catch (error) {
        console.log("EROOR: CommonTextBox.useEffect[focus]");
        console.log(error);
      }
    }, [focus]);

    /** Input useEffect */
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
        console.log("EROOR: CommonTextBox.useEffect[value]");
        console.log(error);
      }
    }, [value]);

    useEffect(() => {
      try {
        showCurrentValue(textboxRef, textboxValue);
        if (result) {
          result(textboxValue);
        }
      } catch (error) {
        console.log("EROOR: CommonTextBox.useEffect[textboxValue, status]");
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
      try {
        checkDisable();
      } catch (error) {
        console.log("EROOR: TextBox.useEffect[disable]");
        console.log(error);
      }
    }, [disabled]);

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setTextboxDisable(disabled);
        } else {
          setTextboxDisable(false);
        }
      } catch (error) {
        console.log("EROOR: CommonTextBox.checkDisable");
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
