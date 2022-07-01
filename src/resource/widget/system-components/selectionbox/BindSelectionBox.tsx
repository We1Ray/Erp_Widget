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
import { getSelectionFromData, getSelectionToData } from "./SelectionBox";
import { SelectionBoxProps } from "./SelectionBox";
import useLatest from "../../../methods/useLatest";

export const BindSelectionBox: React.FC<SelectionBoxProps> = forwardRef(
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
    >([]);
    const [selectionBoxDisable, setSelectionBoxDisable] = useState(false);
    const [multiSelection, setMultiSelection] = useState(false);
    const [display, setDisplay] = useState(true);
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
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: BindSelectionBox.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(selectionRef);
        }
      } catch (error) {
        console.log("EROOR: BindSelectionBox.useEffect()");
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
        console.log("EROOR: BindSelectionBox.useEffect[]");
        console.log(error);
      }
    }, [options]);

    useEffect(() => {
      try {
        if (
          value !== undefined &&
          !PublicMethod.isArrayItemEqual(selectedValue, value)
        ) {
          if (value) {
            setSelectedValue(value);
          } else {
            setSelectedValue([]);
          }
        }
      } catch (error) {
        console.log("EROOR: BindTextBox.useEffect[value]");
        console.log(error);
      }
    }, [JSON.stringify(value)]);

    /** 狀態改變執行的地方 */
    useEffect(() => {
      try {
        checkStatus();
      } catch (error) {
        console.log("EROOR: BindSelectionBox.useEffect[status]");
        console.log(error);
      }
    }, [status, disabled]);

    /** 確認目前作業狀態後更改欄位狀態 */
    function checkStatus() {
      try {
        switch (status.value) {
          case STATUS.READ:
            bindData();
            setSelectionBoxDisable(true);
            break;
          case STATUS.CREATE:
            checkDisable();
            if (PublicMethod.checkValue(defaultValue)) {
              //給予預設值
              setSelectedValue(defaultValue);
            } else {
              setSelectedValue([]);
            }
            break;
          case STATUS.UPDATE:
            if (Program.dataKey.indexOf(name) > -1) {
              //設定Key值不可編輯
              setSelectionBoxDisable(true);
            } else {
              checkDisable();
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.log("EROOR: BindSelectionBox.checkStatus");
        console.log(error);
      }
    }

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setSelectionBoxDisable(disabled);
        } else {
          setSelectionBoxDisable(false);
        }
      } catch (error) {
        console.log("EROOR: BindSelectionBox.checkDisable");
        console.log(error);
      }
    }

    /**當查詢資料變更時的動作*/
    useEffect(() => {
      try {
        bindData();
      } catch (error) {
        console.log(
          "EROOR: BindSelectionBox.useEffect[JSON.stringify(Program.selectedData[bindColumn]), selectionOptions]"
        );
        console.log(error);
      }
    }, [JSON.stringify(Program.selectedData[name]), selectionOptions]);
    /**資料變更後若有選定的資料則顯示*/
    function bindData() {
      try {
        if (!status.matches(STATUS.CREATE)) {
          if (PublicMethod.checkValue(Program.data)) {
            //若有資料則綁定
            setSelectedValue(
              getSelectionFromData(
                Program.selectedData[name],
                multiple,
                selectionOptions
              )
            );
          } else {
            setSelectedValue([]);
          }
        }
      } catch (error) {
        console.log("EROOR: BindSelectionBox.bindData");
        console.log(error);
      }
    }

    useEffect(() => {
      setBindValueToStatusParameter();
    }, [selectedValue, status]);

    useLatest(
      (latest) => {
        /** 設定欄位值的正規表示式*/
        const validation = async (newValue: any) => {
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
            console.log("EROOR: BindSelectionBox.valueValidation");
            console.log(error);
          }
        };
        validation(Program.changeData[name]);
      },
      [System.lang, status, JSON.stringify(Program.changeData)]
    );

    function setBindValueToStatusParameter() {
      try {
        switch (status.value) {
          case STATUS.CREATE:
            ProgramDispatch({
              type: "insertParameters",
              value: { [name]: getSelectionToData(selectedValue, multiple) },
            });
            break;
          case STATUS.UPDATE:
            ProgramDispatch({
              type: "updateParameters",
              value: { [name]: getSelectionToData(selectedValue, multiple) },
            });
            break;
          default:
            break;
        }
      } catch (error) {
        console.log("EROOR: BindSelectionBox.setBindValueToStatusParameter");
        console.log(error);
      }
    }

    useEffect(() => {
      try {
        let selectionValue = getSelectionToData(selectedValue, multiple);
        if (Program.changeData[name] !== selectionValue) {
          ProgramDispatch({
            type: "changeData",
            value: { [name]: selectionValue },
          });
        }
        if (result) {
          result(selectedValue);
        }
      } catch (error) {
        console.log("EROOR: BindSelectionBox.useEffect[selectedValue]");
        console.log(error);
      }
    }, [selectedValue]);

    function onChange(e, option) {
      try {
        if (option.removedValue && option.removedValue.isFixed) return;
        setSelectedValue(e);
      } catch (error) {
        console.log("EROOR: BindSelectionBox.onChange");
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
