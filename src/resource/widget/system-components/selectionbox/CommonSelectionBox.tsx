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
import PublicMethod from "../../../methods/PublicMethod";
import { None } from "../../system-ui/None";
import NoSSR from "react-no-ssr";
import { SelectionBoxProps } from "./SelectionBox";

export const CommonSelectionBox: React.FC<SelectionBoxProps> = forwardRef(
  (
    {
      visible,
      disabled,
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
        if (PublicMethod.checkValue(visible)) {
          setDisplay(visible);
        }
      } catch (error) {
        console.log("EROOR: CommonSelectionBox.useEffect[visible]");
        console.log(error);
      }
    }, [visible]);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(selectionRef);
        }
      } catch (error) {
        console.log("EROOR: CommonSelectionBox.useEffect()");
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
        console.log("EROOR: CommonSelectionBox.useEffect[]");
        console.log(error);
      }
    }, [options]);

    useEffect(() => {
      try {
        setSelectedValue(PublicMethod.checkValue(value) ? value : []);
      } catch (error) {
        console.log("EROOR: CommonSelectionBox.useEffect[value]");
        console.log(error);
      }
    }, [JSON.stringify(value)]);

    useEffect(() => {
      try {
        checkDisable();
      } catch (error) {
        console.log("EROOR: CommonSelectionBox.useEffect[disable]");
        console.log(error);
      }
    }, [disabled]);

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setSelectionBoxDisable(disabled);
        } else {
          setSelectionBoxDisable(false);
        }
      } catch (error) {
        console.log("EROOR: CommonSelectionBox.checkDisable");
        console.log(error);
      }
    }

    useEffect(() => {
      try {
        if (result) {
          result(selectedValue);
        }
      } catch (error) {
        console.log("EROOR: CommonSelectionBox.useEffect[selectedValue]");
        console.log(error);
      }
    }, [selectedValue]);

    function onChange(e, option) {
      try {
        if (option.removedValue && option.removedValue.isFixed) return;
        setSelectedValue(e);
      } catch (error) {
        console.log("EROOR: CommonSelectionBox.onChange");
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
