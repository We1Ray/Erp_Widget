import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { ProgramContext } from "../../system-control/ProgramContext";
import { None } from "../../system-ui/None";
import { LabelProps } from "./Label";

export const QryLabel: React.FC<LabelProps> = forwardRef(
  (
    { text, visible, query, bind, name, style, callbackRef, ...props },
    forwardedRef
  ) => {
    const { Program } = useContext(ProgramContext);
    const [display, setDisplay] = useState(true);
    const [invalidMessage, setInvalidMessage] = useState("");
    const labelRef = useRef(null);

    useImperativeHandle(forwardedRef, () => labelRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(labelRef);
        }
      } catch (error) {
        console.log("EROOR: QryLabel.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        setDisplay(
          PublicMethod.visibility(name, Program.queryConditions, visible)
        );
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(labelRef);
        }
      } catch (error) {
        console.log("EROOR: QryLabel.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(Program.validation["query"][name])) {
          setInvalidMessage(Program.validation["query"][name]);
        } else {
          setInvalidMessage("");
        }
      } catch (error) {
        console.log(
          "EROOR: QryLabel.useEffect[JSON.stringify(Program.validation)]"
        );
        console.log(error);
      }
    }, [JSON.stringify(Program.validation)]);

    return (
      <>
        {display ? (
          <p
            className="col-form-label"
            ref={labelRef}
            style={PublicMethod.mergeJSON({ fontWeight: "bold" }, style)}
            {...props}
          >
            {PublicMethod.checkValue(text) ? text : props.children}
            &nbsp; &nbsp; &nbsp;
            {invalidMessage !== "" ? (
              <span style={{ color: "red" }}>{invalidMessage}</span>
            ) : (
              <None />
            )}
          </p>
        ) : (
          <None />
        )}
      </>
    );
  }
);
