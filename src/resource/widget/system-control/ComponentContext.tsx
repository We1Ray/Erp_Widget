import React, { useReducer } from "react";
/**
 * @param {string} status 所有Program的狀態
 * @param {JSON} selectedData 所有Program的指定資料
 * @param {JsonArray} selectedMultiData 所有Program的指定的多筆資料
 */
const ComponentInitialState = {
  status: {},
  loading: {},
  selectedData: {},
  selectedMultiData: [],
};

interface ComponentProps {
  Component: {
    /**
     * 所有作業的狀態
     */
    status: any;
    /**
     * 所有作業的讀取狀態
     */
    loading: any;
    /**
     * 所有作業目前選擇的資料
     */
    selectedData: any;
    /**
     *所有作業多選的資料
     */
    selectedMultiData: any[];
  };
  ComponentDispatch?: any;
}

const ComponentContext = React.createContext<ComponentProps>({
  Component: ComponentInitialState,
});
/**
 * 設定元件的公用方法和資料的Context
 */
function ComponentProvider(props: any) {
  const [Component, ComponentDispatch] = useReducer(
    ComponentReducer,
    ComponentInitialState
  );
  return (
    <ComponentContext.Provider value={{ Component, ComponentDispatch }}>
      {props.children}
    </ComponentContext.Provider>
  );
}

const ComponentReducer = (state, action) => {
  switch (action.type) {
    case "status":
      return { ...state, status: { ...state.status, ...action.value } };
    case "loading":
      return { ...state, loading: { ...state.loading, ...action.value } };
    case "selectedData":
      return {
        ...state,
        selectedData: { ...state.selectedData, ...action.value },
      };
    case "selectedMultiData":
      return {
        ...state,
        selectedMultiData: { ...state.selectedMultiData, ...action.value },
      };
    default:
      return state;
  }
};

export { ComponentContext, ComponentProvider };
