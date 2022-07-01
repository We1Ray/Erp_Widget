import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { SystemContext } from "../../system-control/SystemContext";
import { ProgramContext } from "../../system-control/ProgramContext";
import PublicMethod from "../../../methods/PublicMethod";
import { CommonSelectionBox } from "../selectionbox/CommonSelectionBox";
interface Props {
  /**
   * 預設查詢條件
   */
  defaultValue?: {
    /**
     * 元件name的值
     */
    value: string;
    /**
     * 外顯顯示值
     */
    label: string;
    isFixed?: boolean;
  }[];
  /**
   * 設定查詢條件選項
   */
  options: {
    /**
     * 元件name的值
     */
    value: string;
    /**
     * 外顯顯示值
     */
    label: string;
    isFixed?: boolean;
  }[];
  /**
   * 元件的Reference
   */
  ref?: React.Ref<any>;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}
export const QueryPattern: React.FC<Props> = forwardRef(
  ({ defaultValue, options, callbackRef, ...props }, forwardedRef) => {
    const { System } = useContext(SystemContext);
    const { Program, ProgramDispatch } = useContext(ProgramContext);
    const [selected, setSelected] = useState([]);
    const selectionRef = useRef(null);

    useImperativeHandle(forwardedRef, () => selectionRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(selectionRef);
        }
      } catch (error) {
        console.log("EROOR: QueryPattern.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (selected) {
          let conditionList = [];
          for (let index = 0; index < selected.length; index++) {
            if (selected[index].value.includes(";")) {
              let result = selected[index].value.split(";");
              for (let j = 0; j < result.length; j++) {
                conditionList.push({
                  value: result[j],
                  label: selected[index].label,
                  isFixed: PublicMethod.checkValue(selected[index].isFixed)
                    ? selected[index].isFixed
                    : false,
                });
              }
            } else {
              conditionList.push(selected[index]);
            }
          }
          ProgramDispatch({ type: "queryConditions", value: conditionList });
        }
      } catch (error) {
        console.log("EROOR: QueryPattern.useEffect[selected]");
        console.log(error);
      }
    }, [selected]);

    function getSelected(e: React.MutableRefObject<any>) {
      try {
        if (e.current) {
          if (e.current.state) {
            if (!PublicMethod.arrayEquals(e.current.state.value, selected)) {
              setSelected(e.current.state.value);
            }
          }
        }
      } catch (error) {
        console.log("EROOR: QueryPattern.getSelected()");
        console.log(error);
      }
    }

    return (
      <CommonSelectionBox
        placeholder={System.getLocalization("Public", "QuerySelectionList")}
        multiple={true}
        maxSelections={options.length}
        options={options}
        value={defaultValue}
        name="QueryPattern"
        ref={selectionRef}
        callbackRef={(e) => getSelected(e)}
        {...props}
      />
    );
  }
);
