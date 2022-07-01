import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import BootstrapTable from "react-bootstrap-table-next";
import PublicMethod from "../../../methods/PublicMethod";
import { DataTableProps } from "./DataTable";

export const CommonDatatable: React.FC<DataTableProps> = forwardRef(
  ({ data, keyField, columns, callbackRef, ...props }, forwardedRef) => {
    const datatableRef = useRef(null);

    useImperativeHandle(forwardedRef, () => datatableRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(datatableRef);
        }
      } catch (error) {
        console.log("EROOR: CommonDatatable.useEffect()");
        console.log(error);
      }
    });

    return (
      <div className="cardbox-body">
        <p />
        <BootstrapTable
          ref={datatableRef}
          keyField={keyField}
          data={data}
          columns={columns}
          {...props}
        />
        <p />
      </div>
    );
  }
);
