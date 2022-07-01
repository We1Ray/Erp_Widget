import React, { useState, useEffect, useContext } from "react";
import swal from "sweetalert";
import CallApi from "../../api/CallApi";
import { Button } from "reactstrap";
import { SystemContext } from "../system-control/SystemContext";
import { ComponentContext } from "../system-control/ComponentContext";
import {
  ProgramContext,
  statusContext,
  STATUS,
} from "../system-control/ProgramContext";
import PublicMethod from "../../methods/PublicMethod";
import useLatest from "../../methods/useLatest";

interface Props {
  /**
   * 設定是否可使用
   */
  disableFilter?: () => Promise<boolean>;
  /**
   * 刪除前進行的動作 true則會繼續動作 false 則結束
   */
  beforeDoDelete?: () => Promise<boolean>;
  /**
   * 覆寫刪除的功能
   */
  doDelete?: () => Promise<boolean>;
  /**
   * 刪除後進行的動作 true則為新增成功 false 則失敗
   */
  afterDoDelete?: () => Promise<boolean>;
  /**
   * 預設為false，刪除單筆(最後)指定的資料，若設定true則刪除指定多筆的資料
   */
  multiple?: boolean;
  /**
   * 資料刪除API的路徑
   */
  deleteApi?: string;
  /**
   * 設定刪除時的預設參數
   */
  defaultParameters?: object;
  /**
   * 設定外觀
   */
  style?: React.CSSProperties;
  /**
   * 設定其他畫面顯示
   */
  childObject?: React.AllHTMLAttributes<any>;
  /**
   * 按下按鈕時觸發(觸發後會改變狀態)
   */
  onClick?: () => Promise<any>;
  /**
   * 滑鼠移動至按鈕顯示的字眼
   */
  title?: string;
}
/**
 * BtnDelete 刪除按鈕，按下後會改變狀態刪除資料
 */
export const BtnDelete: React.FC<Props> = ({
  disableFilter,
  multiple,
  beforeDoDelete,
  doDelete,
  afterDoDelete,
  deleteApi,
  style,
  defaultParameters,
  childObject,
  onClick,
  title,
}) => {
  const { System } = useContext(SystemContext);
  const { Component } = useContext(ComponentContext);
  const { Program, ProgramDispatch } = useContext(ProgramContext);
  const { status, send } = useContext(statusContext);
  const [deleteDisable, setDeleteDisable] = useState(true);
  const [deletePermission, setDeletePermission] = useState(false);

  useEffect(() => {
    const flag = System.authority.filter(
      (permmission: any) =>
        permmission.program_code === Program.program_code &&
        permmission.function_code === "delete" &&
        permmission.is_open === "Y"
    );
    if (PublicMethod.checkValue(flag)) {
      disable(true);
    } else {
      disable(false);
    }
  }, [System.authority, Program.program_code, disableFilter]);

  async function disable(permission: boolean) {
    try {
      if (PublicMethod.checkValue(disableFilter)) {
        setDeletePermission(!(await disableFilter()));
      } else {
        setDeletePermission(permission);
      }
    } catch (error) {
      console.log("EROOR: BtnQuery.disable");
      console.log(error);
    }
  }

  useLatest(
    (latest) => {
      async function checkEnable() {
        try {
          let check = false;
          if (!Program.individual) {
            for (var key in Component.status) {
              if (check) break;
              if (
                Component.status[key] == STATUS.READ &&
                PublicMethod.checkValue(Program.selectedData)
              ) {
                //狀態為READ且有指定資料
                if (multiple) {
                  //多選則還需判斷多選的指定資料
                  if (PublicMethod.checkValue(Program.selectedMultiData)) {
                    for (var key2 in Component.loading) {
                      if (check) break;
                      if (Component.loading[key2] == "READ") {
                        check = false;
                      } else {
                        check = true;
                      }
                    }
                  } else {
                    check = true;
                  }
                } else {
                  for (var key2 in Component.loading) {
                    if (check) break;
                    if (Component.loading[key2] == "READ") {
                      check = false;
                    } else {
                      check = true;
                    }
                  }
                }
              } else {
                check = true;
              }
            }
          }
          if (
            status.matches(STATUS.READ) &&
            PublicMethod.checkValue(Program.selectedData) &&
            !check
          ) {
            if (multiple) {
              if (PublicMethod.checkValue(Program.selectedMultiData)) {
                if (Program.loading == "READ") {
                  check = !deletePermission;
                } else {
                  check = true;
                }
              } else {
                check = true;
              }
            } else {
              if (Program.loading == "READ") {
                check = !deletePermission;
              } else {
                check = true;
              }
            }
          } else {
            check = true;
          }
          if (latest()) {
            setDeleteDisable(check);
          }
        } catch (error) {
          console.log("EROOR: BtnDelete.checkEnable");
          console.log(error);
        }
      }
      checkEnable();
    },
    [
      JSON.stringify(Component.status),
      JSON.stringify(Component.loading),
      JSON.stringify(Program.selectedData),
      JSON.stringify(Program.selectedMultiData),
      Program.individual,
      Program.loading,
      status,
      deletePermission,
    ]
  );

  useEffect(() => {
    const deleteStatus = async () => {
      try {
        if (status.matches(STATUS.DELETE)) {
          await ProgramDispatch({ type: "loading", value: "LOADING" });
          await ProgramDispatch({ type: "updateParameters", value: null });
          await ProgramDispatch({ type: "insertParameters", value: null });
          await onDelete();
          await send(STATUS.QUERY);
        }
      } catch (error) {
        console.log("EROOR: BtnDelete.deleteStatus");
        console.log(error);
      }
    };
    deleteStatus();
  }, [status]);

  async function onDelete() {
    let flag = true;
    try {
      if (await beforeDelete()) {
        if (PublicMethod.checkValue(doDelete)) {
          if (await doDelete()) {
            flag = await afterDelete();
          } else {
            flag = false;
          }
        } else {
          if (multiple) {
            let deletedata = [];
            deletedata = Program.selectedMultiData;
            if (PublicMethod.checkValue(defaultParameters)) {
              //結合預設的查詢條件
              for (let index = 0; index < deletedata.length; index++) {
                deletedata[index] = PublicMethod.mergeJSON(
                  deletedata[index],
                  defaultParameters
                );
              }
            }
            await CallApi.ExecuteApi(
              System.factory.name,
              System.factory.ip + deleteApi,
              deletedata
            )
              .then(async (res) => {
                if (res.status === 200) {
                  flag = await afterDelete();
                } else {
                  swal(
                    System.getLocalization("Public", "Fail"),
                    System.getLocalization("Public", "DeleteFail"),
                    "error"
                  );
                  console.log("EROOR: BtnDelete.onDelete: " + deleteApi);
                  console.log(res);
                  flag = false;
                }
              })
              .catch((error) => {
                swal(
                  System.getLocalization("Public", "Fail"),
                  System.getLocalization("Public", "DeleteFail"),
                  "error"
                );
                console.log("EROOR: BtnDelete.onDelete: " + deleteApi);
                console.log(error);
                flag = false;
              });
          } else {
            let deletedata = {};
            deletedata = Program.selectedData;
            if (PublicMethod.checkValue(defaultParameters)) {
              //結合預設的查詢條件
              deletedata = PublicMethod.mergeJSON(
                deletedata,
                defaultParameters
              );
            }
            await CallApi.ExecuteApi(
              System.factory.name,
              System.factory.ip + deleteApi,
              deletedata
            )
              .then(async (res) => {
                if (res.status === 200) {
                  flag = await afterDelete();
                } else {
                  swal(
                    System.getLocalization("Public", "Fail"),
                    System.getLocalization("Public", "DeleteFail"),
                    "error"
                  );
                  console.log("EROOR: BtnDelete.onDelete: " + deleteApi);
                  console.log(res);
                  flag = false;
                }
              })
              .catch((error) => {
                swal(
                  System.getLocalization("Public", "Fail"),
                  System.getLocalization("Public", "DeleteFail"),
                  "error"
                );
                console.log("EROOR: BtnDelete.onDelete: " + deleteApi);
                console.log(error);
                flag = false;
              });
          }
        }
      } else {
        flag = false;
      }
    } catch (error) {
      console.log("EROOR: BtnDelete.onDelete");
      console.log(error);
    }
    return flag;
  }
  /** 刪除前*/
  async function beforeDelete() {
    try {
      if (PublicMethod.checkValue(beforeDoDelete)) {
        return await beforeDoDelete();
      } else {
        return true;
      }
    } catch (error) {
      console.log("EROOR: BtnDelete.beforeDelete");
      console.log(error);
    }
  }
  /** 刪除後*/
  async function afterDelete() {
    try {
      if (PublicMethod.checkValue(afterDoDelete)) {
        return await afterDoDelete();
      } else {
        swal(
          System.getLocalization("Public", "Success"),
          System.getLocalization("Public", "DeleteSuccess"),
          "success"
        );
      }
    } catch (error) {
      console.log("EROOR: BtnDelete.afterDelete");
      console.log(error);
    }
  }

  async function buttonClick() {
    if (onClick) {
      await onClick();
      await send(STATUS.DELETE);
    } else {
      await send(STATUS.DELETE);
    }
  }

  return (
    <Button
      style={style}
      color="danger"
      disabled={deleteDisable}
      onClick={() => buttonClick()}
      title={title}
    >
      {PublicMethod.checkValue(childObject) ? (
        childObject
      ) : (
        <>
          <em className={"far fa-trash-alt"} />
          &ensp;
          {System.getLocalization("Public", "Delete")}
        </>
      )}
    </Button>
  );
};
