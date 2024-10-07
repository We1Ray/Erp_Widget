import React, { useState, useEffect, useContext } from "react";
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
import useSysBtnAuth from "./hooks/useSysBtnAuth.tsx";
import useStatus from "../../methods/useStatus";
import useSysBtnEnable from "./hooks/useSysBtnEnable";

/**
 * BtnQuery 查詢按鈕，按下後會改變狀態讓資料更新
 */
export const BtnQuery: React.FC<{
  /**
   * 設定是否可使用
   */
  disableFilter?: () => Promise<boolean>;
  /**
   * 覆寫查詢功能，回傳覆寫查詢的JSON資料表
   */
  doQuery?: () => Promise<object>;
  /**
   * 設定查詢時的預設參數
   */
  defaultQueryParameters?: object;
  /**
   * 資料查詢API的路徑
   */
  queryApi: string;
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
  /**
   * 設定是否初始查詢
   */
  initialQuery?: boolean;
}> = ({
  style,
  disableFilter,
  queryApi,
  defaultQueryParameters,
  doQuery,
  childObject,
  onClick,
  title,
  initialQuery = true,
}) => {
  const { System } = useContext(SystemContext);
  const { Component } = useContext(ComponentContext);
  const { status, send } = useContext(statusContext);
  const { Program, ProgramDispatch } = useContext(ProgramContext);
  const [queryDisable, setQueryDisable] = useState(true);
  const [queryPermission, setQueryPermission] = useState(false);

  useSysBtnAuth(() => {
    const flag = System.authority.filter(
      (permmission: any) =>
        permmission.program_code === Program.program_code &&
        permmission.function_code === "query" &&
        permmission.is_open === "Y"
    );
    if (PublicMethod.checkValue(flag)) {
      disable(true);
    } else {
      disable(false);
    }
  }, [disableFilter]);

  async function disable(permission: boolean) {
    try {
      if (PublicMethod.checkValue(disableFilter)) {
        setQueryPermission(!(await disableFilter()));
      } else {
        setQueryPermission(permission);
      }
    } catch (error) {
      console.log("EROOR: BtnQuery.disable");
      console.log(error);
    }
  }

  useSysBtnEnable(
    (latest) => {
      async function checkEnable() {
        try {
          let check = false;
          if (!Program.individual) {
            for (var key in Component.status) {
              if (check) break;
              if (Component.status[key] === STATUS.READ) {
                for (var key2 in Component.loading) {
                  if (check) break;
                  if (Component.loading[key2] === "READ") {
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
            !check &&
            Program.loading === "READ"
          ) {
            if (PublicMethod.checkValue(Program.validation.query)) {
              if (Program.queryConditions !== undefined) {
                for (
                  let index = 0;
                  index < Program.queryConditions.length;
                  index++
                ) {
                  if (
                    Program.validation.query[
                      Program.queryConditions[index].value
                    ]
                  ) {
                    check = true;
                    break;
                  } else {
                    check = !queryPermission;
                  }
                }
              } else {
                if (Program.validation.query) {
                  check = true;
                } else {
                  check = !queryPermission;
                }
              }
            } else {
              check = !queryPermission;
            }
          } else {
            check = true;
          }

          if (latest()) {
            setQueryDisable(check);
          }
        } catch (error) {
          console.log("EROOR: BtnQuery.checkEnable");
          console.log(error);
        }
      }
      checkEnable();
    },
    [
      JSON.stringify(Program.validation.query),
      JSON.stringify(Program.queryConditions),
      queryPermission,
    ]
  );

  useStatus(() => {
    onQuery();
  });

  async function onQuery() {
    try {
      if (status.matches(STATUS.QUERY)) {
        await ProgramDispatch({ type: "loading", value: "QUERY" });
      }
    } catch (error) {
      console.log("EROOR: BtnQuery.onQuery");
      console.log(error);
    }
  }

  useEffect(() => {
    programLoading();
  }, [
    Program.loading,
    JSON.stringify(Program.queryParameters),
    queryPermission,
  ]);

  async function programLoading() {
    try {
      if (queryPermission) {
        if (Program.loading !== "READ" && Program.loading !== "LOADING") {
          await Query(Program.loading);
          await send(STATUS.READ);
          await ProgramDispatch({ type: "loading", value: "READ" }); //pag
        }
      } else {
        ProgramDispatch({ type: "data", value: [] });
        ProgramDispatch({ type: "selectedData", value: {} });
        ProgramDispatch({ type: "selectedMultiData", value: [] });
        await send(STATUS.READ);
        await ProgramDispatch({ type: "loading", value: "READ" });
      }
    } catch (error) {
      await send(STATUS.READ);
      await ProgramDispatch({ type: "loading", value: "READ" });
      console.log("EROOR: BtnQuery.programLoading");
      console.log(error);
    }
  }

  async function Query(type: string) {
    try {
      let parameter = {};
      if (Program.queryConditions !== undefined) {
        for (let index = 0; index < Program.queryConditions.length; index++) {
          parameter[Program.queryConditions[index].value] =
            Program.queryParameters[Program.queryConditions[index].value];
        }
      } else {
        parameter = Program.queryParameters;
      }

      parameter = defaultQueryParameters
        ? PublicMethod.mergeJSON(parameter, defaultQueryParameters)
        : parameter;

      if (PublicMethod.checkValue(doQuery)) {
        //覆寫查詢功能
        await QueryPatch(await doQuery(), type);
      } else {
        await CallApi.ExecuteApi(
          System.factory.name,
          System.factory.ip + queryApi,
          parameter
        )
          .then((res) => {
            if (res) {
              QueryPatch(res.data, type);
              if (type === "pageLoadSelectAll") {
                ProgramDispatch({ type: "selectedMultiData", value: res.data });
              }
            }
          })
          .catch((error) => {
            ProgramDispatch({ type: "data", value: [] });
            ProgramDispatch({ type: "selectedData", value: {} });
            ProgramDispatch({ type: "selectedMultiData", value: [] });
            console.log("EROOR: BtnQuery.Query.GetApiPageData: " + queryApi);
            console.log(error);
          });
      }
    } catch (error) {
      console.log("EROOR: BtnQuery.Query");
      console.log(error);
    }
  }

  async function QueryPatch(data, type) {
    try {
      if (!data.error) {
        ProgramDispatch({ type: "data", value: data });
        if (PublicMethod.checkValue(data[0])) {
          //刪除和查詢後指定第一筆資料
          switch (type) {
            case "QUERY":
              if (PublicMethod.checkValue(Program.selectedData)) {
                let select = false;
                let row = {};
                for (let i = 0; i < data.length; i++) {
                  //設定selectedData的RowID
                  if (!select) {
                    for (let j = 0; j < Program.dataKey.length; j++) {
                      if (
                        Program.selectedData[Program.dataKey[j]] ===
                        data[i][Program.dataKey[j]]
                      ) {
                        select = true;
                        row = data[i];
                      } else {
                        select = false;
                      }
                    }
                  } else {
                    break;
                  }
                }
                if (select) {
                  ProgramDispatch({ type: "selectedData", value: row });
                } else {
                  ProgramDispatch({ type: "selectedData", value: data[0] });
                }
              } else {
                ProgramDispatch({ type: "selectedData", value: data[0] });
              }

              ProgramDispatch({ type: "selectedMultiData", value: [] });
              break;
            case "SAVE":
              let select = false;
              let row = {};
              for (let i = 0; i < data.length; i++) {
                //設定selectedData的RowID
                if (!select) {
                  for (let j = 0; j < Program.dataKey.length; j++) {
                    if (
                      Program.selectedData[Program.dataKey[j]] ===
                      data[i][Program.dataKey[j]]
                    ) {
                      select = true;
                      row = data[i];
                    } else {
                      select = false;
                    }
                  }
                } else {
                  break;
                }
              }
              if (select) {
                ProgramDispatch({ type: "selectedData", value: row });
                break;
              }
              ProgramDispatch({ type: "selectedMultiData", value: [] });
              break;
            default:
              break;
          }
        } else {
          ProgramDispatch({ type: "data", value: [] });
          ProgramDispatch({ type: "selectedData", value: {} });
          ProgramDispatch({ type: "selectedMultiData", value: [] });
        }
      } else {
        ProgramDispatch({ type: "data", value: [] });
        ProgramDispatch({ type: "selectedData", value: {} });
        ProgramDispatch({ type: "selectedMultiData", value: [] });
      }
    } catch (error) {
      console.log("EROOR: BtnQuery.QueryPatch");
      console.log(error);
    }
  }

  useEffect(() => {
    if (System.factory.name && System.factory.ip && queryPermission) {
      if (initialQuery) {
        send(STATUS.QUERY);
      }
    }
  }, [JSON.stringify(System.factory), queryPermission]);

  async function buttonClick() {
    if (onClick) {
      await onClick();
      await ProgramDispatch({ type: "selectedData", value: {} });
      await send(STATUS.QUERY);
    } else {
      await ProgramDispatch({ type: "selectedData", value: {} });
      await send(STATUS.QUERY);
    }
  }

  return (
    <Button
      style={style}
      color="green"
      disabled={queryDisable}
      onClick={() => buttonClick()}
      title={title}
    >
      {PublicMethod.checkValue(childObject) ? (
        childObject
      ) : (
        <>
          <em className={"fab fa-sistrix"} />
          &ensp;
          {System.getLocalization("Public", "Query")}
        </>
      )}
    </Button>
  );
};
