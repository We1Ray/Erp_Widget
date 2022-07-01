import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { None } from "../../system-ui/None";
import { LabelProps } from "./Label";

export const CommonLabel: React.FC<LabelProps> = forwardRef(
  (
    { text, visible, query, bind, style, callbackRef, ...props },
    forwardedRef
  ) => {
    const [display, setDisplay] = useState(true);
    const labelRef = useRef(null);

    useImperativeHandle(forwardedRef, () => labelRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(labelRef);
        }
      } catch (error) {
        console.log("EROOR: CommonLabel.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: CommonLabel.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(labelRef);
        }
      } catch (error) {
        console.log("EROOR: CommonLabel.useEffect()");
        console.log(error);
      }
    });

    return (
      <>
        {display ? (
          <p className="col-form-label" style={style} ref={labelRef} {...props}>
            {PublicMethod.checkValue(text) ? text : props.children}
          </p>
        ) : (
          <None />
        )}
      </>
    );
  }
);
