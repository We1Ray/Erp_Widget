import React, { useState, useEffect, useContext, useRef } from "react";
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
   * 更新前進行的動作 true則會繼續動作 false 則結束
   */
  beforeDoUpdate?: () => Promise<boolean>;
  /**
   * 覆寫更新方法 true為成功 false 則失敗
   */
  doUpdate?: () => Promise<boolean>;
  /**
   * 更新後進行的動作 true則為新增成功 false 則失敗
   */
  afterDoUpdate?: () => Promise<boolean>;
  /**
   * 資料更新API的路徑
   */
  updateApi?: string;
  /**
   * 設定外觀
   */
  style?: React.CSSProperties;
  /**
   * 設定其他畫面顯示
   */
  childObject?: React.AllHTMLAttributes<any>;
  /**
   * 設定更新時的預設參數
   */
  defaultParameters?: object;
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
 * BtnUpdate 更新按鈕，按下後會改變狀態讓資料更新
 */
export const BtnUpdate: React.FC<Props> = ({
  disableFilter,
  updateApi,
  beforeDoUpdate,
  doUpdate,
  afterDoUpdate,
  style,
  childObject,
  defaultParameters,
  onClick,
  title,
}) => {
  const { System } = useContext(SystemContext);
  const { Component } = useContext(ComponentContext);
  const { Program, ProgramDispatch } = useContext(ProgramContext);
  const { status, send } = useContext(statusContext);
  const [onCreate, setOnCreate] = useState(false);
  const [updateDisable, setUpdateDisable] = useState(true);
  const [updatePermission, setUpdatePermission] = useState(false);
  const statusRef = useRef(status);

  useEffect(() => {
    const flag = System.authority.filter(
      (permmission: any) =>
        permmission.program_code === Program.program_code &&
        permmission.function_code === "update" &&
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
        setUpdatePermission(!(await disableFilter()));
      } else {
        setUpdatePermission(permission);
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
            }
          }
          if (
            status.matches(STATUS.READ) &&
            PublicMethod.checkValue(Program.selectedData) &&
            !check
          ) {
            if (Program.loading == "READ") {
              check = !updatePermission;
            } else {
              check = true;
            }
          } else {
            check = true;
          }
          if (latest()) {
            setUpdateDisable(check);
          }
        } catch (error) {
          console.log("EROOR: BtnUpdate.checkEnable");
          console.log(error);
        }
      }
      checkEnable();
    },
    [
      JSON.stringify(Component.status),
      JSON.stringify(Component.loading),
      JSON.stringify(Program.selectedData),
      Program.loading,
      Program.individual,
      status,
      updatePermission,
    ]
  );

  useEffect(() => {
    onUpdate();
  }, [status]);

  async function onUpdate() {
    try {
      switch (status.value) {
        case STATUS.CREATE:
          setOnCreate(true);
          break;
        case STATUS.UPDATE:
          ProgramDispatch({ type: "insertParameters", value: null });
          setOnCreate(false);
          break;
        case STATUS.SAVE:
          if (statusRef.current.value !== STATUS.SAVE && !onCreate) {
            await ProgramDispatch({ type: "loading", value: "LOADING" });
            await Update();
            await ProgramDispatch({ type: "loading", value: "SAVE" }); //重新查詢
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.log("EROOR: BtnUpdate.onUpdate");
      console.log(error);
    }
  }

  /** 儲存資料*/
  async function Update() {
    let flag = true;
    try {
      if (await beforeUpdate()) {
        if (PublicMethod.checkValue(doUpdate)) {
          if (await doUpdate()) {
            flag = await afterUpdate();
          } else {
            flag = false;
          }
        } else {
          if (Program.updateParameters && updateApi) {
            let update = Program.updateParameters;
            if (PublicMethod.checkValue(defaultParameters)) {
              //結合預設的查詢條件
              if (Array.isArray(update)) {
                for (let index = 0; index < update.length; index++) {
                  update[index] = PublicMethod.mergeJSON(
                    update[index],
                    defaultParameters
                  );
                }
              } else {
                update = PublicMethod.mergeJSON(update, defaultParameters);
              }
            }
            await CallApi.ExecuteApi(
              System.factory.name,
              System.factory.ip + updateApi,
              update
            )
              .then(async (res) => {
                if (res.status === 200) {
                  flag = await afterUpdate();
                } else {
                  swal(
                    System.getLocalization("Public", "Fail"),
                    System.getLocalization("Public", "UpdateFail"),
                    "error"
                  );
                  console.log("EROOR: BtnUpdate.Update: " + updateApi);
                  console.log(res);
                  flag = false;
                }
              })
              .catch((error) => {
                swal(
                  System.getLocalization("Public", "Fail"),
                  System.getLocalization("Public", "UpdateFail"),
                  "error"
                );
                console.log("EROOR: BtnUpdate.Update: " + updateApi);
                console.log(error);
                flag = false;
              });
          } else {
            flag = false;
          }
        }
      } else {
        flag = false;
      }
    } catch (error) {
      console.log("EROOR: BtnUpdate.Update");
      console.log(error);
    }
    return flag;
  }
  /** 儲存前*/
  async function beforeUpdate() {
    try {
      if (PublicMethod.checkValue(beforeDoUpdate)) {
        return await beforeDoUpdate();
      } else {
        return true;
      }
    } catch (error) {
      console.log("EROOR: BtnUpdate.beforeUpdate");
      console.log(error);
    }
  }
  /** 儲存後*/
  async function afterUpdate() {
    try {
      if (PublicMethod.checkValue(afterDoUpdate)) {
        return await afterDoUpdate();
      } else {
        await swal(
          System.getLocalization("Public", "Success"),
          System.getLocalization("Public", "UpdateSuccess"),
          "success"
        );
        return true;
      }
    } catch (error) {
      console.log("EROOR: BtnUpdate.afterUpdate");
      console.log(error);
    }
  }

  async function buttonClick() {
    if (onClick) {
      await onClick();
      await send(STATUS.UPDATE);
    } else {
      await send(STATUS.UPDATE);
    }
  }

  return (
    <Button
      style={style}
      color="warning"
      disabled={updateDisable}
      onClick={() => buttonClick()}
      title={title}
    >
      {PublicMethod.checkValue(childObject) ? (
        childObject
      ) : (
        <>
          <em className={"far fa-edit"} />
          &ensp;
          {System.getLocalization("Public", "Update")}
        </>
      )}
    </Button>
  );
};
