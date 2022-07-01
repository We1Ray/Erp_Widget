import React, { useEffect, useContext } from "react";
import { ComponentContext } from "./ComponentContext";
import { ProgramContext, statusContext, STATUS } from "./ProgramContext";
import PublicMethod from "../../methods/PublicMethod";
import { None } from "../system-ui/None";
import { SystemContext } from "../system-control/SystemContext";
interface Props {
  /**
   * 作業名稱
   */
  program_code: string;
  /**
   * 作業資料的key
   */
  dataKey: object;
  /**
   * 判斷個體作業還是群體作業
   */
  individual?: boolean;
  /**
   * 設定外觀
   */
  style?: React.CSSProperties; //設定額外的style參數
}
/**
 * Form 作業的主行程，會預先載入作業的初始資料和狀態
 */
export const Form: React.FC<Props> = ({
  program_code,
  dataKey,
  individual,
  style,
  ...props
}) => {
  const { System } = useContext(SystemContext);
  const { Component, ComponentDispatch } = useContext(ComponentContext);
  const { status, send, service } = useContext(statusContext);
  const { Program, ProgramDispatch } = useContext(ProgramContext);

  /**初始載入狀態執行的地方*/
  useEffect(() => {
    try {
      ProgramDispatch({ type: "dataKey", value: dataKey });
      ProgramDispatch({ type: "program_code", value: program_code });
      ProgramDispatch({ type: "individual", value: individual ? true : false });
    } catch (error) {
      console.log("EROOR: Form.useEffect[]");
      console.log(error);
    }
  }, []);

  /** 將program目前的資料傳給Component*/
  useEffect(() => {
    try {
      ComponentDispatch({
        type: "selectedData",
        value: { [program_code]: Program.selectedData },
      });
    } catch (error) {
      console.log(
        "EROOR: Form.useEffect[JSON.stringify(Program.selectedData)]"
      );
      console.log(error);
    }
  }, [JSON.stringify(Program.selectedData)]);
  useEffect(() => {
    try {
      ComponentDispatch({
        type: "selectedMultiData",
        value: { [program_code]: Program.selectedMultiData },
      });
    } catch (error) {
      console.log(
        "EROOR: Form.useEffect[JSON.stringify(Program.selectedMultiData)]"
      );
      console.log(error);
    }
  }, [JSON.stringify(Program.selectedMultiData)]);
  useEffect(() => {
    try {
      if (!individual) {
        ComponentDispatch({
          type: "loading",
          value: { [program_code]: Program.loading },
        });
      }
    } catch (error) {
      console.log("EROOR: Form.useEffect[Program.loading]");
      console.log(error);
    }
  }, [Program.loading]);

  /**狀態改變時需執行的方法*/
  useEffect(() => {
    try {
      if (!individual) {
        ComponentDispatch({
          type: "status",
          value: { [program_code]: status.value },
        }); //將program目前的狀態傳給Component
      }
      switch (status.value) {
        case STATUS.READ:
          ProgramDispatch({ type: "loading", value: "READ" });
          break;
        default:
          break;
      }
    } catch (error) {
      console.log("EROOR: Form.useEffect[status]");
      console.log(error);
    }
  }, [status]);

  return (
    <>
      {PublicMethod.checkValue(Program.program_code) &&
      PublicMethod.checkValue(System.factory.ip) ? (
        <div
          className={Program.loading === "READ" ? "" : "whirl helicopter"}
          style={style}
        >
          {props.children}
        </div>
      ) : (
        <None />
      )}
    </>
  );
};
