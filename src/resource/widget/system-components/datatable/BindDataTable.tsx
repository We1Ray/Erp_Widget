import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import paginationFactory from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import { SystemContext } from "../../system-control/SystemContext";
import { ComponentContext } from "../../system-control/ComponentContext";
import {
  ProgramContext,
  statusContext,
  STATUS,
} from "../../system-control/ProgramContext";
import PublicMethod from "../../../methods/PublicMethod";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { None } from "../../system-ui/None";
import { BtnCancel } from "../../system-button/BtnCancel";
import DraggableDialog from "../../system-ui/DraggableDialog";
import { DataTableProps, SelectNode } from "./DataTable";
import useLatest from "../../../methods/useLatest";

export const BindDataTable: React.FC<DataTableProps> = forwardRef(
  (
    {
      data,
      columns,
      keyField,
      Expand,
      dialog,
      multipleSelection,
      sizePerPageList,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const { System } = useContext(SystemContext);
    const { Component } = useContext(ComponentContext);
    const { Program, ProgramDispatch } = useContext(ProgramContext);
    const { status, send } = useContext(statusContext);
    const [tableData, setTableData] = useState(data);
    const [dialogOn, setDialogOn] = useState(false);
    const [onDataChange, setOnDataChange] = useState(false);
    const [expandedRow, setExpandedRow] = useState([]);
    const [padOptions, setPadOptions] = useState(
      paginationFactory({
        pageStartIndex: 1,
        sizePerPage: PublicMethod.checkValue(sizePerPageList)
          ? sizePerPageList[0]
          : 5,
        sizePerPageList: PublicMethod.checkValue(sizePerPageList)
          ? sizePerPageList
          : [5, 10, 20, 50, 100],
        pageNumber: 1,
        alwaysShowAllBtns: true,
      })
    );
    const [Select, setSelect] = useState<SelectNode>({
      mode: "radio",
      hideSelectColumn: true,
      clickToSelect: true,
      bgColor: "#98d6ea",
    });
    const datatableRef = useRef(null);

    const rowEvents = {
      onClick: (e, row, rowIndex) => {
        if (checkStatus()) {
          ChangeData(row);
        }
      },
      onDoubleClick: (e, row, rowIndex) => {
        if (checkStatus()) {
          if (PublicMethod.checkValue(dialog) && !Expand) {
            setDialogOn(true);
          }
        }
      },
    };

    const expandRow = {
      renderer: (row: any) => (
        <>
          <Expand row={row} />
        </>
      ),
      className: "expand-row",
      expanded: expandedRow,
      onExpand: (row, isExpand, rowIndex, e) => {
        if (isExpand) {
          setExpandedRow(expandedRow.concat([row["row_num_id"]]));
        } else {
          setExpandedRow(remove(expandedRow, row["row_num_id"]));
        }
      },
      onExpandAll: (isExpandAll, results, e) => {
        if (isExpandAll) {
          let expandall = [];
          for (let index = 0; index < tableData.length; index++) {
            expandall.push(tableData[index]["row_num_id"]);
          }
          setExpandedRow(expandall);
        } else {
          setExpandedRow([]);
        }
      },
      expandHeaderColumnRenderer: ({ isAnyExpands }) => {
        if (isAnyExpands) {
          return <b style={{ cursor: "pointer" }}>(-)</b>;
        }
        return <b style={{ cursor: "pointer" }}>(+)</b>;
      },
      expandColumnRenderer: ({ expanded }) => {
        if (expanded) {
          return <b style={{ cursor: "pointer" }}>(-)</b>;
        }
        return <b style={{ cursor: "pointer" }}>(+)</b>;
      },
      showExpandColumn: true,
      expandByColumnOnly: true,
      onlyOneExpanding: true,
    };

    useImperativeHandle(forwardedRef, () => datatableRef.current);

    useEffect(() => {
      try {
        if (multipleSelection) {
          //多選設定
          setSelect({
            mode: "checkbox",
            clickToSelect: true,
            bgColor: "#98d6ea",
            onSelect: handleOnSelect,
            onSelectAll: handleOnSelectAll,
          });
        }
      } catch (error) {
        console.log("EROOR: BindDataTable.useEffect[]");
        console.log(error);
      }
    }, []);

    useEffect(() => {
      setPadOptions(
        paginationFactory({
          pageStartIndex: 1,
          sizePerPage: PublicMethod.checkValue(sizePerPageList)
            ? sizePerPageList[0]
            : 5,
          sizePerPageList: PublicMethod.checkValue(sizePerPageList)
            ? sizePerPageList
            : [5, 10, 20, 50, 100],
          pageNumber: 1,
          alwaysShowAllBtns: true,
        })
      );
    }, [sizePerPageList]);

    useEffect(() => {
      //設定資料
      try {
        setTableData(data);
      } catch (error) {
        console.log("EROOR: BindDataTable.useEffect[data]");
        console.log(error);
      }
    }, [data]);

    function ChangeData(isSelect) {
      try {
        ProgramDispatch({ type: "selectedData", value: isSelect });
      } catch (error) {
        console.log("EROOR: BindDataTable.ChangeData");
        console.log(error);
      }
    }

    function handleOnSelectAll(isSelect, rows) {
      //全選
      try {
        if (isSelect) {
          ProgramDispatch({ type: "loading", value: "pageLoadSelectAll" });
        } else {
          ProgramDispatch({ type: "selectedMultiData", value: [] });
        }
      } catch (error) {
        console.log("EROOR: BindDataTable.handleOnSelectAll");
        console.log(error);
      }
    }

    function handleOnSelect(row, isSelect) {
      //多選
      try {
        if (isSelect) {
          ProgramDispatch({
            type: "selectedMultiData",
            value: [...Program.selectedMultiData, row],
          });
        } else {
          let multidata = Program.selectedMultiData.filter((x) =>
            deleteMultiDataCheck(x, row)
          ); //將取消的資料排除
          ProgramDispatch({ type: "selectedMultiData", value: multidata });
        }
      } catch (error) {
        console.log("EROOR: BindDataTable.handleOnSelect");
        console.log(error);
      }
    }

    function deleteMultiDataCheck(x, row) {
      let flag = false;
      try {
        if (x["row_num_id"] === row["row_num_id"]) {
          flag = false;
        } else {
          flag = true;
        }
      } catch (error) {
        console.log("EROOR: BindDataTable.deleteMultiDataCheck");
        console.log(error);
      }
      return flag;
    }

    function checkStatus() {
      //只有狀態:READ時可點換資料
      let check = true;
      try {
        if (Program.individual) {
          if (status.matches(STATUS.READ)) {
            if (Program.loading == "READ") {
              check = true;
            } else {
              check = false;
            }
          } else {
            check = false;
          }
        } else {
          for (var key in Component.status) {
            if (!check) break;
            if (Component.status[key] == STATUS.READ) {
              for (var key2 in Component.loading) {
                if (!check) break;
                if (Component.loading[key2] == "READ") {
                  check = true;
                } else {
                  check = false;
                }
              }
            } else {
              check = false;
            }
          }
        }
      } catch (error) {
        console.log("EROOR: BindDataTable.checkStatus");
        console.log(error);
      }
      return check;
    }

    useLatest(
      (latest) => {
        //狀態 or 資料變更時
        try {
          if (latest()) {
            if (multipleSelection) {
              multiSelection(checkStatus);
            } else {
              selection(checkStatus);
            }
          }
        } catch (error) {
          console.log(
            "EROOR: BindDataTable.useEffect[Program.individual, status, Program.loading, JSON.stringify(Component.status), JSON.stringify(Component.loading), JSON.stringify(Program.selectedData), JSON.stringify(Program.selectedMultiData)]"
          );
          console.log(error);
        }
      },
      [
        JSON.stringify(Component.status),
        JSON.stringify(Component.loading),
        JSON.stringify(Program.selectedData),
        JSON.stringify(Program.selectedMultiData),
        Program.individual,
        Program.loading,
        status,
      ]
    );

    function multiSelection(checkStatus) {
      try {
        if (checkStatus()) {
          let multiSelected = [];
          if (onDataChange) {
            setOnDataChange(false);
          } else {
            for (
              let index = 0;
              index < Program.selectedMultiData.length;
              index++
            ) {
              multiSelected.push(
                Program.selectedMultiData[index]["row_num_id"]
              );
            }
          }
          setSelect({
            mode: "checkbox",
            clickToSelect: true,
            bgColor: "#98d6ea",
            onSelect: handleOnSelect,
            onSelectAll: handleOnSelectAll,
            selected: multiSelected,
          });
        } else {
          setSelect({
            mode: "checkbox",
            hideSelectColumn: true,
            clickToSelect: false,
            bgColor: "#98d6ea",
          });
        }
      } catch (error) {
        console.log("EROOR: BindDataTable.multiSelection");
        console.log(error);
      }
    }

    function selection(checkStatus) {
      try {
        if (checkStatus()) {
          if (onDataChange) {
            setOnDataChange(false);
          }
          setSelect({
            mode: "radio",
            hideSelectColumn: true,
            clickToSelect: true,
            bgColor: "#98d6ea",
            selected: [Program.selectedData["row_num_id"]],
          });
        } else {
          setSelect({
            mode: "radio",
            hideSelectColumn: true,
            clickToSelect: false,
            bgColor: "#98d6ea",
          });
        }
      } catch (error) {
        console.log("EROOR: BindDataTable.selection");
        console.log(error);
      }
    }

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(dialog))
          //若使用視窗開窗則判斷狀態為CREATE時自動開啟編輯視窗
          switch (status.value) {
            case STATUS.CREATE:
              setOnDataChange(true);
              setDialogOn(true);
              if (Expand) {
                setExpandedRow([]);
              }
              break;
            case STATUS.UPDATE:
              setOnDataChange(true);
              break;
            case STATUS.SAVE:
              if (multipleSelection) {
                ProgramDispatch({ type: "selectedMultiData", value: [] });
              }
              setDialogOn(false);
              break;
            case STATUS.CANCEL:
              setOnDataChange(false);
              break;
            default:
              break;
          }
      } catch (error) {
        console.log("EROOR: BindDataTable.useEffect[status]");
        console.log(error);
      }
    }, [status]);

    function dialogClose() {
      try {
        send(STATUS.CANCEL);
        setDialogOn(false);
      } catch (error) {
        console.log("EROOR: BindDataTable.dialogClose");
        console.log(error);
      }
    }

    function remove(aray, val) {
      try {
        let index = aray.indexOf(val);
        if (index > -1) {
          aray.splice(index, 1);
        }
        return aray;
      } catch (error) {
        console.log("EROOR: BindDataTable.remove");
        console.log(error);
      }
    }
    return (
      <div className="cardbox-body">
        <p />
        <BootstrapTable
          ref={datatableRef}
          keyField={keyField} //將資料全部加入RowID設定為table的Key值
          data={tableData}
          columns={columns}
          pagination={padOptions}
          rowEvents={rowEvents}
          selectRow={Select}
          noDataIndication={System.getLocalization(
            "Public",
            "NoInformationFound"
          )}
          expandRow={PublicMethod.checkValue(Expand) ? expandRow : {}}
          {...props}
        />
        {PublicMethod.checkValue(dialog) ? (
          <DraggableDialog open={dialogOn} style={dialog.style}>
            <DialogContent style={dialog.style}>{dialog.content}</DialogContent>
            <DialogActions>
              <Button
                onClick={() => dialogClose()}
                color="primary"
                variant="contained"
                disableElevation
              >
                <em className={"fas fa-minus-circle"} />
                &ensp;
                {System.getLocalization("Public", "Close")}
              </Button>
              <BtnCancel style={{ display: "none" }} />
            </DialogActions>
          </DraggableDialog>
        ) : (
          <None />
        )}
        <p />
      </div>
    );
  }
);
