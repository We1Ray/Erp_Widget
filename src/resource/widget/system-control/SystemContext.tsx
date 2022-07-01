import React, { useReducer } from "react";
import PublicMethod from "../../methods/PublicMethod";
const SystemInitialState = {
  token: "",
  system_uid: "",
  factory: {
    uid: "",
    name: "",
    ip: "",
  },
  userstate: "",
  mustlogin: false,
  lang: "TW",
  localization: [],
  getLocalization: (source: string, word: string, language = "") => {
    return "";
  },
  authority: [],
};

interface SystemProps {
  System: {
    /**
     * 使用者的登入Token
     */
    token: string;
    /**
     * 系統UID
     */
    system_uid: string;
    /**
     * 廠別資訊
     */
    factory: {
      uid: string;
      name: string;
      ip: string;
    };
    /**
     * 登入者狀態
     */
    userstate: string;
    /**
     * 目前系統是否需登入
     */
    mustlogin: boolean;
    /**
     * 語言
     */
    lang: string;
    /**
     * 語系表
     */
    localization: any[];
    /**
     * 輸入來源、字元、語言取得對應的語系顯示值
     */
    getLocalization: (
      source: string,
      word: string,
      language?: string
    ) => string;
    /**
     * 使用者權限
     */
    authority: any[];
  };
  SystemDispatch?: any;
}

const SystemContext = React.createContext<SystemProps>({
  System: SystemInitialState,
});
function SystemProvider(props) {
  const [System, SystemDispatch] = useReducer(
    SystemReducer,
    SystemInitialState
  );
  return (
    <SystemContext.Provider value={{ System, SystemDispatch }}>
      {props.children}
    </SystemContext.Provider>
  );
}

function checkWord(localization, source, word, language) {
  if (PublicMethod.checkValue(language)) {
    if (localization[language]) {
      if (localization[language][source]) {
        if (localization[language][source][word]) {
          return localization[language][source][word];
        } else {
          return "";
        }
      } else {
        return "";
      }
    } else {
      return "";
    }
  }
}

const SystemReducer = (state, action) => {
  switch (action.type) {
    case "token":
      return { ...state, token: action.value };
    case "system_uid":
      return { ...state, system_uid: action.value };
    case "factory":
      return { ...state, factory: action.value };
    case "userstate":
      return { ...state, userstate: action.value };
    case "mustlogin":
      return { ...state, mustlogin: action.value };
    case "lang":
      return {
        ...{ ...state, lang: action.value },
        getLocalization: (source, word, language = "") => {
          if (PublicMethod.checkValue(language)) {
            let wordValue = checkWord(
              state.localization,
              source,
              word,
              language
            );
            if (PublicMethod.checkValue(wordValue)) {
              return wordValue;
            } else {
              return checkWord(state.localization, source, word, "TW");
            }
          } else {
            let wordValue = checkWord(
              state.localization,
              source,
              word,
              action.value
            );
            if (PublicMethod.checkValue(wordValue)) {
              return wordValue;
            } else {
              return checkWord(state.localization, source, word, "TW");
            }
          }
        },
      };
    case "localization":
      return {
        ...{ ...state, localization: action.value },
        getLocalization: (source, word, language = "") => {
          if (PublicMethod.checkValue(language)) {
            let wordValue = checkWord(action.value, source, word, language);
            if (PublicMethod.checkValue(wordValue)) {
              return wordValue;
            } else {
              return checkWord(action.value, source, word, "TW");
            }
          } else {
            let wordValue = checkWord(action.value, source, word, state.lang);
            if (PublicMethod.checkValue(wordValue)) {
              return wordValue;
            } else {
              return checkWord(action.value, source, word, "TW");
            }
          }
        },
      };
    case "authority":
      return { ...state, authority: action.value };
    default:
      return state;
  }
};

export { SystemContext, SystemProvider };
