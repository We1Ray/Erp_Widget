import React, { useEffect, useState, useContext } from "react";
import { SystemProvider, SystemContext } from "./SystemContext";
import PublicMethod, {
  CENTER_FACTORY,
  CENTER_IP,
} from "../../methods/PublicMethod";
import SystemFunc from "../../methods/SystemFunc";
import CallApi from "../../api/CallApi";
import { None } from "../system-ui/None";
import Login from "./Login";
import "./System.scss";

interface Props {
  system_uid: string;
}
export const System: React.FC<Props> = ({ system_uid, ...props }) => {
  return (
    <SystemProvider>
      <SystemContent system_uid={system_uid}>{props.children}</SystemContent>
    </SystemProvider>
  );
};

const SystemContent: React.FC<Props> = ({ system_uid, ...props }) => {
  const { System, SystemDispatch } = useContext(SystemContext);
  const [location, setLocation] = useState("");
  const [tokenLoad, setTokenLoad] = useState(false);
  const [localizationLoad, setLocalizationLoad] = useState(false);

  useEffect(() => {
    try {
      SystemDispatch({ type: "system_uid", value: system_uid });
      init();
    } catch (error) {
      console.log("EROOR: System.useLayoutEffect[]");
      console.log(error);
    }
  }, []);

  async function init() {
    await getLocalization();
    await initCheckToken();
  }

  async function getLocalization() {
    await CallApi.ExecuteApi(
      CENTER_FACTORY,
      CENTER_IP + "/public/ui_caption_properties",
      {}
    )
      .then((res) => {
        if (PublicMethod.checkValue(res.data)) {
          SystemDispatch({
            type: "localization",
            value: treedata(res.data),
          });
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLocalizationLoad(true);
      });
  }

  function treedata(list: Array<any>, jsonObj = {}) {
    for (let index = 0; index < list.length; index++) {
      if (!jsonObj[list[index]["language"]]) {
        jsonObj[list[index]["language"]] = {};
        treedata(list, jsonObj);
      } else {
        if (!jsonObj[list[index]["language"]][list[index]["source"]]) {
          jsonObj[list[index]["language"]][list[index]["source"]] = {};
          treedata(list, jsonObj);
        } else {
          jsonObj[list[index]["language"]][list[index]["source"]][
            list[index]["word"]
          ] = list[index]["display"];
        }
      }
    }
    return jsonObj;
  }

  async function initCheckToken() {
    if (SystemFunc.getUser_Token()) {
      await CallApi.ExecuteApi(
        CENTER_FACTORY,
        CENTER_IP + "/public/get_ticket_granting_cookie",
        { access_token: SystemFunc.getUser_Token() }
      )
        .then((res) => {
          if (PublicMethod.checkValue(res.data)) {
            SystemDispatch({
              type: "token",
              value: SystemFunc.getUser_Token(),
            });
            SystemDispatch({ type: "userstate", value: "login" });
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setTokenLoad(true);
        });
    } else {
      setTokenLoad(true);
    }
  }

  useEffect(() => {
    try {
      if (window.location.href.split("?")[0] !== location)
        setLocation(window.location.href.split("?")[0]);
    } catch (error) {
      console.log("EROOR: System.useEffect()");
      console.log(error);
    }
  });

  useEffect(() => {
    try {
      if (System.mustlogin === true) {
        if (SystemFunc.getUser_Token()) {
          CallApi.ExecuteApi(
            CENTER_FACTORY,
            CENTER_IP + "/public/get_ticket_granting_cookie",
            { access_token: SystemFunc.getUser_Token() }
          )
            .then((res) => {
              if (PublicMethod.checkValue(res.data)) {
                SystemDispatch({
                  type: "token",
                  value: SystemFunc.getUser_Token(),
                });
                SystemDispatch({ type: "userstate", value: "login" });
              } else {
                logout();
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          logout();
        }
      }
    } catch (error) {
      logout();
      console.log(error);
    }
  }, [location, System.mustlogin]);

  useEffect(() => {
    try {
      if (
        !PublicMethod.checkValue(System.token) &&
        System.userstate === "logout"
      ) {
        SystemFunc.setUser_Token("");
        SystemDispatch({ type: "authority", value: [] });
      } else if (
        PublicMethod.checkValue(System.token) &&
        System.userstate === "login"
      ) {
        let token = System.token;
        CallApi.ExecuteApi(
          CENTER_FACTORY,
          CENTER_IP + "/public/get_account_permissions",
          {
            access_token: token,
            program_code: null,
            factory_uid: System.factory.uid,
            system_uid: System.system_uid,
          }
        )
          .then((res) => {
            if (res.data) {
              SystemDispatch({ type: "authority", value: res.data });
            }
          })
          .catch((error) => {
            console.log("EROOR: SystemFunc.get_account_permissions");
            console.log(error);
          });
      }
    } catch (error) {
      console.log(error);
    }
  }, [
    System.system_uid,
    System.token,
    System.userstate,
    JSON.stringify(System.factory),
  ]);

  function logout() {
    SystemDispatch({
      type: "token",
      value: "",
    });
    SystemDispatch({ type: "userstate", value: "logout" });
  }

  return (
    <>
      {tokenLoad && localizationLoad ? (
        PublicMethod.checkValue(System.token) ? (
          PublicMethod.checkValue(System.system_uid) ? (
            props.children
          ) : (
            <None />
          )
        ) : (
          <Login system_uid={system_uid} />
        )
      ) : (
        <div className="loading">
          <div className="loading-text">
            <span className="loading-text-words">L</span>
            <span className="loading-text-words">O</span>
            <span className="loading-text-words">A</span>
            <span className="loading-text-words">D</span>
            <span className="loading-text-words">I</span>
            <span className="loading-text-words">N</span>
            <span className="loading-text-words">G</span>
          </div>
        </div>
      )}
    </>
  );
};
