import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { Input, Col } from "reactstrap";
import { Row } from "../../system-ui/Row";
import { None } from "../../system-ui/None";
import { RadioButtonProps } from "./RadioButton";

export const CommonRadioButton: React.FC<RadioButtonProps> = forwardRef(
  (
    {
      visible,
      disabled,
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
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(radioButtonRef);
        }
      } catch (error) {
        console.log("EROOR: CommonRadioButton.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: CommonRadioButton.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

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
        console.log("EROOR: CommonRadioButton.useEffect[value]");
        console.log(error);
      }
    }, [value]);

    useEffect(() => {
      try {
        setRadioButtonText(
          options.find((obj) => obj.value === radioButtonValue).text
        );
      } catch (error) {
        console.log("EROOR: CommonRadioButton.useEffect[radioButtonValue]");
        console.log(error);
      }
    }, [radioButtonValue]);

    useEffect(() => {
      try {
        if (result) {
          result(radioButtonValue, radioButtonText);
        }
      } catch (error) {
        console.log("EROOR: CommonRadioButton.useEffect[radioButtonText]");
        console.log(error);
      }
    }, [radioButtonText]);

    useEffect(() => {
      try {
        checkDisable();
      } catch (error) {
        console.log("EROOR: CommonRadioButton.useEffect[disable]");
        console.log(error);
      }
    }, [disabled]);

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setRadioButtonDisable(disabled);
        } else {
          setRadioButtonDisable(false);
        }
      } catch (error) {
        console.log("EROOR: CommonRadioButton.checkDisable");
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
        console.log("EROOR: CommonRadioButton.InputDisable");
        console.log(error);
      }
    }

    function changeValue(change) {
      try {
        setRadioButtonValue(change);
      } catch (error) {
        console.log("EROOR: CommonRadioButton.changeValue");
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
