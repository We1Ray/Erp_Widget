import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PublicMethod from "../../../methods/PublicMethod";
import { BindDataTable } from "./BindDataTable";
import { CommonDatatable } from "./CommonDatatable";
import "./DataTable.scss";

interface DataTableProps {
  /**
   * 是否綁定目前作業
   */
  bind?: boolean;
  /**
   * DataTable的資料
   */
  data: object[];
  /**
   * DataTable的唯一Key值
   * (若bind為True，在Select資料時需加ROW_NUM_ID ex:SELECT A.ROW_NUM_ID ,A.* FROM DSPB00)
   */
  keyField?: string;
  /**
   * DataTable的欄位設定，可參考:https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/column-props.html
   */
  columns: {
    dataField: string;
    text: string;
    sort?: boolean;
    formatter?: (
      cell: any,
      row: any,
      rowIndex: any,
      formatExtraData: any
    ) => JSX.Element;
    hidden?: boolean;
    align?: string;
    [x: string]: any;
  }[];
  /**
   * 每行Row展開的畫面
   */
  Expand?: ({ row }: { row: any }) => JSX.Element;
  /**
   * 新增、修改(若有Expand則不會觸發)或雙點擊時將資料視窗化，視窗內的畫面
   */
  dialog?: {
    content: JSX.Element;
    style?: React.CSSProperties;
  };
  /**
   * 設定是否為多選
   */
  multipleSelection?: boolean;
  /**
   * 設定每頁的筆數的List
   */
  sizePerPageList?: object;
  [x: string]: any;
  ref?: React.Ref<any>;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}
interface SelectNode {
  mode?: string;
  hideSelectColumn?: boolean;
  clickToSelect?: boolean;
  bgColor?: string;
  selected?: object;
  onSelect?: (arg1: any, arg2: any) => void;
  onSelectAll?: (arg1: any, arg2: any) => void;
}

/**
 * DataTable，可參考:https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/table-props.html#columns-required-object
 */
const DataTable: React.FC<DataTableProps> = forwardRef(
  (
    {
      bind,
      data,
      keyField,
      columns,
      Expand,
      dialog,
      multipleSelection,
      sizePerPageList,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const datatableRef = useRef(null);

    useImperativeHandle(forwardedRef, () => datatableRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(datatableRef);
        }
      } catch (error) {
        console.log("EROOR: DataTable.useEffect()");
        console.log(error);
      }
    });

    return (
      <>
        {bind ? (
          <BindDataTable
            data={data}
            keyField="row_num_id"
            columns={columns}
            Expand={Expand}
            dialog={dialog}
            multipleSelection={multipleSelection}
            sizePerPageList={sizePerPageList}
            ref={datatableRef}
            {...props}
          />
        ) : (
          <CommonDatatable
            data={data}
            keyField={keyField}
            columns={columns}
            ref={datatableRef}
            {...props}
          />
        )}
      </>
    );
  }
);

export { DataTable };
export type { DataTableProps, SelectNode };
