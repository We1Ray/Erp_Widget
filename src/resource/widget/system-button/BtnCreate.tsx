import React, { useState, useEffect, useContext, useRef } from "react";
import swal from "sweetalert";
import CallApi from "../../api/CallApi";
import { Button } from "reactstrap";
import { SystemContext } from "../system-control/SystemContext";
import {
  ProgramContext,
  statusContext,
  STATUS,
} from "../system-control/ProgramContext";
import { ComponentContext } from "../system-control/ComponentContext";
import PublicMethod from "../../methods/PublicMethod";
import useLatest from "../../methods/useLatest";
interface Props {
  /**
   * 設定是否可使用
   */
  disableFilter?: () => Promise<boolean>;
  /**
   * 新增前進行的動作 true則會繼續動作 false 則結束
   */
  beforeDoCreate?: () => Promise<boolean>;
  /**
   * 覆寫新增功能
   */
  doCreate?: () => Promise<boolean>;
  /**
   * 新增後進行的動作 true則為新增成功 false 則失敗
   */
  afterDoCreate?: () => Promise<boolean>;
  /**
   * 資料新增API路徑
   */
  insertApi?: string;
  /**
   * 設定外觀
   */
  style?: React.CSSProperties;
  /**
   * 設定其他畫面顯示
   */
  childObject?: React.AllHTMLAttributes<any>;
  /**
   * 設定新增時的預設參數
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
 * BtnCreate 新增按鈕，按下後會改變狀態讓欄位可新增
 */
export const BtnCreate: React.FC<Props> = ({
  disableFilter,
  beforeDoCreate,
  doCreate,
  afterDoCreate,
  insertApi,
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
  const [onUpdate, setOnUpdate] = useState(false);
  const [createDisable, setCreateDisable] = useState(true);
  const [createPermission, setCreatePermission] = useState(false);
  const statusRef = useRef(status);

  useEffect(() => {
    const flag = System.authority.filter(
      (permmission: any) =>
        permmission.program_code === Program.program_code &&
        permmission.function_code === "create" &&
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
        setCreatePermission(!(await disableFilter()));
      } else {
        setCreatePermission(permission);
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
              if (Component.status[key] == STATUS.READ) {
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
          if (status.matches(STATUS.READ) && !check) {
            if (Program.loading == "READ") {
              check = !createPermission;
            } else {
              check = true;
            }
          } else {
            check = true;
          }
          if (latest()) {
            setCreateDisable(check);
          }
        } catch (error) {
          console.log("EROOR: BtnCreate.checkEnable");
          console.log(error);
        }
      }
      checkEnable();
    },
    [
      JSON.stringify(Component.status),
      JSON.stringify(Component.loading),
      JSON.stringify(Program.selectedData),
      Program.individual,
      Program.loading,
      status,
      createPermission,
    ]
  );

  useEffect(() => {
    onCreate();
  }, [status]);

  async function onCreate() {
    try {
      switch (status.value) {
        case STATUS.CREATE:
          ProgramDispatch({ type: "updateParameters", value: null });
          setOnUpdate(false);
          break;
        case STATUS.UPDATE:
          setOnUpdate(true);
          break;
        case STATUS.SAVE:
          if (statusRef.current.value !== STATUS.SAVE && !onUpdate) {
            await ProgramDispatch({ type: "loading", value: "LOADING" });
            if (await Create()) {
              await ProgramDispatch({ type: "loading", value: "SAVE" }); //重新查詢
            } else {
              await send(STATUS.QUERY); //重新查詢
            }
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.log("EROOR: BtnCreate.onCreate");
      console.log(error);
    }
  }

  /** 儲存資料*/
  async function Create() {
    let flag = true;
    try {
      if (await beforeCreate()) {
        if (PublicMethod.checkValue(doCreate)) {
          //覆寫
          if (await doCreate()) {
            flag = await afterCreate();
          } else {
            flag = false;
          }
        } else {
          //無覆寫
          if (Program.insertParameters && insertApi) {
            let insert = Program.insertParameters;
            if (PublicMethod.checkValue(defaultParameters)) {
              //結合預設的查詢條件
              if (Array.isArray(insert)) {
                for (let index = 0; index < insert.length; index++) {
                  insert[index] = PublicMethod.mergeJSON(
                    insert[index],
                    defaultParameters
                  );
                }
              } else {
                insert = PublicMethod.mergeJSON(insert, defaultParameters);
              }
            }
            await CallApi.ExecuteApi(
              System.factory.name,
              System.factory.ip + insertApi,
              insert
            )
              .then(async (res) => {
                if (res.status === 200) {
                  ProgramDispatch({ type: "selectedData", value: insert });
                  flag = await afterCreate();
                } else {
                  swal(
                    System.getLocalization("Public", "Fail"),
                    System.getLocalization("Public", "CreateFail"),
                    "error"
                  );
                  console.log("EROOR: BtnCreate.Create :" + insertApi);
                  console.log(res);
                  flag = false;
                }
              })
              .catch((error) => {
                swal(
                  System.getLocalization("Public", "Fail"),
                  System.getLocalization("Public", "CreateFail"),
                  "error"
                );
                console.log("EROOR: BtnCreate.Create :" + insertApi);
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
      console.log("EROOR: BtnCreate.Create");
      console.log(error);
    }
    return flag;
  }
  /** 儲存前*/
  async function beforeCreate() {
    try {
      if (PublicMethod.checkValue(beforeDoCreate)) {
        return await beforeDoCreate();
      } else {
        return true;
      }
    } catch (error) {
      console.log("EROOR: BtnCreate.beforeCreate");
      console.log(error);
    }
  }
  /** 儲存後*/
  async function afterCreate() {
    try {
      if (PublicMethod.checkValue(afterDoCreate)) {
        return await afterDoCreate();
      } else {
        await swal(
          System.getLocalization("Public", "Success"),
          System.getLocalization("Public", "CreateSuccess"),
          "success"
        );
        return true;
      }
    } catch (error) {
      console.log("EROOR: BtnCreate.afterCreate");
      console.log(error);
    }
  }

  async function buttonClick() {
    if (onClick) {
      await onClick();
      await send(STATUS.CREATE);
    } else {
      await send(STATUS.CREATE);
    }
  }

  return (
    <Button
      style={style}
      color="primary"
      disabled={createDisable}
      onClick={() => buttonClick()}
      title={title}
    >
      {PublicMethod.checkValue(childObject) ? (
        childObject
      ) : (
        <>
          <em className={"fas fa-file-medical"} />
          &ensp;
          {System.getLocalization("Public", "Create")}
        </>
      )}
    </Button>
  );
};
