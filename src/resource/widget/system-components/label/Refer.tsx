import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import CallApi from "../../../api/CallApi";
import { Col } from "reactstrap";
import { SystemContext } from "../../system-control/SystemContext";
import PublicMethod from "../../../methods/PublicMethod";
import { Row } from "../../system-ui/Row";
import { CommonTextBox } from "../textbox/Common";
import { Label, LabelProps } from ".";
import { None } from '../../system-ui/None';
import useLatest from "../../../methods/useLatest";
import { ProgramContext, STATUS, statusContext } from "../../system-control/ProgramContext";

//TextQryBoxProps
export const ReferLabel: React.FC<LabelProps> = forwardRef(
  (
    {
      visible,
      text,
      value,
      name,
      referApi,
      style,
      result,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const { System } = useContext(SystemContext);
    const { Program, ProgramDispatch } = useContext(ProgramContext);
    const { status } = useContext(statusContext);
    const [display, setDisplay] = useState(true);
    const [objectDisable, setObjectDisable] = useState(false);
    const [labelValue, setLabelValue] = useState("");
    const [textboxValue, setTextboxValue] = useState("");
    const [selectedValue, setSelectedValue] = useState("");

    const [textboxDisable, setTextboxDisable] = useState(true);
    const textboxRef = useRef(null);

    useImperativeHandle(forwardedRef, () => textboxRef.current);

    useEffect(() => {

      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(textboxRef);
        }
      } catch (error) {
        console.log("EROOR: ReferLabel.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: ReferLabel.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

    useEffect(() => {
      try {
        if (value !== undefined) {
          if (value) {
            setSelectedValue(value);
          } else {
            setSelectedValue("");
          }
        }
      } catch (error) {
        console.log("EROOR: ReferLabel.useEffect[status]");
        console.log(error);
      }
    }, [value]);

    /**當查詢資料變更時的動作*/
    useEffect(() => {
      if (PublicMethod.checkValue(name) && name !== '') {
        bindData();
      }
    }, [JSON.stringify(Program.selectedData[name])]);

    /**資料變更後若有選定的資料則顯示*/
    function bindData() {
      try {
        if (!status.matches(STATUS.CREATE)) {
          if (PublicMethod.checkValue(Program.data)) {
            setSelectedValue(Program.selectedData[name]);
          } else {
            setSelectedValue("");
          }
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.bindData");
        console.log(error);
      }
    }


    useLatest(
      (latest) => {
        const lableChange = async () => {
          try {
            let lable = "";
            if (PublicMethod.checkValue(textboxValue)) {
              if (PublicMethod.checkValue(text)) {
                lable = text;
              } else if (PublicMethod.checkValue(referApi) && PublicMethod.checkValue(referApi.api)) {
                await CallApi.ExecuteApi(
                  System.factory.name,
                  System.factory.ip + referApi.api,
                  PublicMethod.checkValue(referApi.defaultParameters) ? PublicMethod.mergeJSON({ [referApi.valueName]: textboxValue }, referApi.defaultParameters) : { [referApi.valueName]: textboxValue }

                ).then((res) => {
                  if (PublicMethod.checkValue(res.data)) {
                    //額外再給予Operation和api做查詢給值
                    lable = res.data[0][referApi.labelName];
                  } else {
                    lable =
                      System.getLocalization("Public", "None") +
                      textboxValue +
                      System.getLocalization("Public", "Data");
                  }
                });
              } else {
                lable =
                  System.getLocalization("Public", "None") +
                  textboxValue +
                  System.getLocalization("Public", "Data");
              }
            } else {
              lable =
                System.getLocalization("Public", "None") +
                System.getLocalization("Public", "Data");
            }
            if (latest()) {
              setLabelValue(lable);
            }
          } catch (error) {
            console.log(
              "EROOR: ReferLabel.useEffect[textboxValue, JSON.stringify(label)]"
            );
            console.log(error);
          }
        };
        lableChange();
      },
      [textboxValue, JSON.stringify(referApi)]
    );

    useEffect(() => {
      try {
        if (result) {
          result(textboxValue);
        }
      } catch (error) {
        console.log("EROOR: ReferLabel.useEffect[textboxValue]");
        console.log(error);
      }
    }, [textboxValue]);

    function resultValue(value) {
      if (textboxValue !== value) {
        setTextboxValue(value);
      }
    }

    return (
      <span {...props}>
        {display ? (
          <Row>
            {
              <Col
                md={1}
                style={{ display: "none" }}
              >
                <CommonTextBox
                  disabled={textboxDisable}
                  value={selectedValue}
                  result={(value) => resultValue(value)}
                  ref={textboxRef}
                />
              </Col>
            }
            {
              <Col md={12}>
                <span
                  style={style ? style : { fontWeight: "normal" }}
                >
                  {labelValue}
                </span>
              </Col>
            }
          </Row>
        ) : (
          <None />
        )}
      </span>
    );
  }
);
