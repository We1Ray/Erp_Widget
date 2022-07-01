import React, { useReducer } from "react";
import { Machine } from "xstate";
import { useMachine } from "@xstate/react";
import PublicMethod from "../../methods/PublicMethod";

const ProgramInitialState = {
  program_code: "",
  data: [],
  dataKey: {},
  selectedData: {},
  selectedMultiData: [],
  queryParameters: {},
  updateParameters: {},
  insertParameters: {},
  changeData: {},
  validation: {
    query: {},
    bind: {},
    common: {},
  },
  loading: "LOADING",
  queryConditions: undefined,
  individual: false,
};

interface ProgramProps {
  Program: {
    /**
     * 作業碼
     */
    program_code: string;
    /**
     * 查詢的所有資料
     */
    data: any[];
    /**
     * 資料的key
     */
    dataKey: any;
    /**
     * 選擇的單筆資料(若為多選擇為最後選的一筆)
     */
    selectedData: any;
    /**
     * 選擇的多筆資料(若為單選則為空)
     */
    selectedMultiData: any[];
    /**
     * 給查詢API使用的參數
     */
    queryParameters: any;
    /**
     * 給更新API使用的參數
     */
    updateParameters: any;
    /**
     * 給新增API使用的參數
     */
    insertParameters: any;
    /**
     * 取得目前Binding欄位的異動資料
     */
    changeData: any;
    /**
     * 判斷目前是否可以儲存資料
     */
    validation: {
      query: any;
      bind: any;
      common: any;
    };
    /**
     * 狀態變更時進行loading(loaing時會執行該loading狀態的方法)
     */
    loading: string;
    /**
     * 判斷那些查詢條件需要加入
     */
    queryConditions: any;
    /**
     * 是否為獨立作業(不受Component內其他Program的狀態影響)
     */
    individual: boolean;
  };
  ProgramDispatch?: any;
}

interface statusProps {
  /**
   * 作業的狀態，有 READ、QUERY、CREATE、UPDATE、DELETE、SAVE、CANCEL
   */
  status: any;
  send?: any;
  service?: any;
}

const STATUS = {
  READ: "READ",
  QUERY: "QUERY",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  CANCEL: "CANCEL",
  DELETE: "DELETE",
  SAVE: "SAVE",
};
const ProgramContext = React.createContext<ProgramProps>({
  Program: ProgramInitialState,
});
const statusContext = React.createContext<statusProps>({
  status: STATUS.READ,
});
/**
 * 設定作業的公用方法和資料的Context
 */
function ProgramProvider(props: any) {
  const [Program, ProgramDispatch] = useReducer(
    ProgramReducer,
    ProgramInitialState
  );
  const [status, send, service] = useMachine(programStatus);
  return (
    <ProgramContext.Provider value={{ Program, ProgramDispatch }}>
      <statusContext.Provider value={{ status, send, service }}>
        {props.children}
      </statusContext.Provider>
    </ProgramContext.Provider>
  );
}

const ProgramReducer = (state: any, action: any) => {
  switch (action.type) {
    case "program_code":
      return { ...state, program_code: action.value, queryParameters: {} };
    case "data":
      return { ...state, data: action.value };
    case "dataKey":
      return { ...state, dataKey: action.value };
    case "selectedData":
      return { ...state, selectedData: action.value };
    case "selectedMultiData":
      return { ...state, selectedMultiData: action.value };
    case "queryParameters":
      return { ...state, queryParameters: action.value };
    case "updateParameters":
      if (action.value === null) {
        return { ...state, updateParameters: {} };
      } else {
        return {
          ...state,
          updateParameters: PublicMethod.mergeJSON(
            state.updateParameters,
            action.value
          ),
        };
      }
    case "insertParameters":
      if (action.value === null) {
        return { ...state, insertParameters: {} };
      } else {
        return {
          ...state,
          insertParameters: PublicMethod.mergeJSON(
            state.insertParameters,
            action.value
          ),
        };
      }
    case "changeData":
      return {
        ...state,
        changeData: PublicMethod.mergeJSON(state.changeData, action.value),
      };
    case "validation":
      return { ...state, validation: action.value };
    case "loading":
      return { ...state, loading: action.value };
    case "queryConditions":
      return { ...state, queryConditions: action.value };
    case "individual":
      return { ...state, individual: action.value };
    default:
      return state;
  }
};

const programStatus = Machine({
  initial: STATUS.READ,
  states: {
    [STATUS.READ]: {
      on: {
        [STATUS.QUERY]: STATUS.QUERY,
        [STATUS.CREATE]: STATUS.CREATE,
        [STATUS.UPDATE]: STATUS.UPDATE,
        [STATUS.DELETE]: STATUS.DELETE,
      },
    },
    [STATUS.QUERY]: {
      on: {
        [STATUS.READ]: STATUS.READ,
      },
    },
    [STATUS.CREATE]: {
      on: {
        [STATUS.SAVE]: STATUS.SAVE,
        [STATUS.CANCEL]: STATUS.CANCEL,
      },
    },
    [STATUS.UPDATE]: {
      on: {
        [STATUS.SAVE]: STATUS.SAVE,
        [STATUS.CANCEL]: STATUS.CANCEL,
      },
    },
    [STATUS.CANCEL]: {
      on: {
        [STATUS.READ]: STATUS.READ,
      },
    },
    [STATUS.DELETE]: {
      on: {
        [STATUS.QUERY]: STATUS.QUERY,
      },
    },
    [STATUS.SAVE]: {
      on: {
        [STATUS.READ]: STATUS.READ,
        [STATUS.QUERY]: STATUS.QUERY,
      },
    },
  },
});
export { ProgramContext, ProgramProvider, statusContext, STATUS };
