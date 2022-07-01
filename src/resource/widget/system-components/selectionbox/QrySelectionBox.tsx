import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import Select, { components } from "react-select";
import { SystemContext } from "../../system-control/SystemContext";
import {
  ProgramContext,
  statusContext,
  STATUS,
} from "../../system-control/ProgramContext";
import PublicMethod from "../../../methods/PublicMethod";
import { None } from "../../system-ui/None";
import NoSSR from "react-no-ssr";
import { getSelectionToData } from "./SelectionBox";
import { SelectionBoxProps } from "./SelectionBox";
import useLatest from "../../../methods/useLatest";

export const QrySelectionBox: React.FC<SelectionBoxProps> = forwardRef(
  (
    {
      visible,
      disabled,
      name,
      maxSelections,
      defaultValue,
      value,
      handleValidation,
      options,
      multiple,
      placeholder,
      result,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const { System } = useContext(SystemContext);
    const { Program, ProgramDispatch } = useContext(ProgramContext);
    const { status } = useContext(statusContext);
    const [selectionOptions, setSelectionOptions] = useState(
      PublicMethod.checkValue(options) ? options : []
    );
    const [selectedValue, setSelectedValue] = useState<
      {
        value: string;
        label: string;
        isFixed?: boolean;
      }[]
    >(PublicMethod.checkValue(defaultValue) ? defaultValue : []);
    const [selectionBoxDisable, setSelectionBoxDisable] = useState(false);
    const [display, setDisplay] = useState(true);
    const [multiSelection, setMultiSelection] = useState(false);
    const selectionRef = useRef(null);

    const MultiValueRemove = (props) => {
      if (props.data.isFixed) {
        return null;
      }
      return <components.MultiValueRemove {...props} />;
    };

    useImperativeHandle(forwardedRef, () => selectionRef.current);

    useEffect(() => {
      try {
        setDisplay(
          PublicMethod.visibility(name, Program.queryConditions, visible)
        );
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(selectionRef);
        }
      } catch (error) {
        console.log("EROOR: QrySelectionBox.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        if (multiple === true) {
          setMultiSelection(true);
        } else {
          setMultiSelection(false);
        }
        setSelectionOptions(options);
      } catch (error) {
        console.log("EROOR: QrySelectionBox.useEffect[]");
        console.log(error);
      }
    }, [options]);

    useEffect(() => {
      try {
        if (value !== undefined) {
          if (value) {
            setSelectedValue(value);
          } else {
            setSelectedValue([]);
          }
        }
      } catch (error) {
        console.log("EROOR: QrySelectionBox.useEffect[defaultValue]");
        console.log(error);
      }
    }, [JSON.stringify(value)]);

    /** 狀態改變執行的地方 */
    useEffect(() => {
      try {
        checkStatus();
      } catch (error) {
        console.log("EROOR: QrySelectionBox.useEffect[status]");
        console.log(error);
      }
    }, [status]);

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
        console.log("EROOR: QrySelectionBox.checkStatus");
        console.log(error);
      }
    }

    useEffect(() => {
      try {
        if (Program.loading !== "READ") {
          setSelectionBoxDisable(true);
        } else {
          checkDisable();
        }
      } catch (error) {
        console.log("EROOR: QrySelectionBox.useEffect[Program.loading]");
        console.log(error);
      }
    }, [Program.loading]);

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setSelectionBoxDisable(disabled);
        } else {
          setSelectionBoxDisable(false);
        }
      } catch (error) {
        console.log("EROOR: QrySelectionBox.checkDisable");
        console.log(error);
      }
    }

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
            console.log("EROOR: QrySelectionBox.valueValidation");
            console.log(error);
          }
        };
        validation(Program.changeData[name]);
      },
      [System.lang, status, JSON.stringify(Program.changeData)]
    );

    function setQrySelectedValueToChangeData() {
      try {
        let selectionValue = getSelectionToData(selectedValue, multiple);
        let parameter = Program.queryParameters;
        parameter[name] = selectionValue;
        ProgramDispatch({ type: "queryParameters", value: parameter });
        if (Program.changeData[name] !== selectionValue) {
          ProgramDispatch({
            type: "changeData",
            value: { [name]: selectionValue },
          });
        }
      } catch (error) {
        console.log("EROOR: QrySelectionBox.setSelectedValueToChangeData");
        console.log(error);
      }
    }

    useEffect(() => {
      try {
        setQrySelectedValueToChangeData();
        if (result) {
          result(selectedValue);
        }
      } catch (error) {
        console.log("EROOR: QrySelectionBox.useEffect[selectedValue]");
        console.log(error);
      }
    }, [selectedValue]);

    function onChange(e, option) {
      try {
        if (option.removedValue && option.removedValue.isFixed) return;
        setSelectedValue(e);
      } catch (error) {
        console.log("EROOR: QrySelectionBox.onChange");
        console.log(error);
      }
    }

    return (
      <>
        {display ? (
          <NoSSR>
            <Select
              ref={selectionRef}
              isDisabled={selectionBoxDisable}
              placeholder={placeholder}
              isMulti={multiSelection}
              options={
                multiSelection && maxSelections === selectedValue.length
                  ? []
                  : selectionOptions
              }
              noOptionsMessage={() => {
                return multiSelection
                  ? selectedValue.length === maxSelections
                    ? System.getLocalization("Public", "MaxSelectionsMessage")
                    : System.getLocalization("Public", "NoSelectionsMessage")
                  : null;
              }}
              value={selectedValue}
              onChange={onChange}
              closeMenuOnSelect={!multiSelection}
              components={{ MultiValueRemove }}
              isClearable={
                multiple === true
                  ? !selectedValue.some((selected) => selected.isFixed)
                  : true
              }
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              {...props}
            />
          </NoSSR>
        ) : (
          <None />
        )}
      </>
    );
  }
);
