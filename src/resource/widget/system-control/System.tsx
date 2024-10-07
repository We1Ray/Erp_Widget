import React, { useEffect, useState, useContext } from "react";
import { SystemProvider, SystemContext } from "./SystemContext";
import PublicMethod, {
  CENTER_FACTORY,
  CENTER_IP,
} from "../../methods/PublicMethod";
import CallApi from "../../api/CallApi";
import hmacSHA512 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64";
import SystemFunc from "../../methods/SystemFunc";
import { None } from "../system-ui/None";
import "./System.scss";

/**
 * 設定系統的公用方法和資料的Context
 */
export const System: React.FC<{
  /**
   * 系統UID
   */
  system_uid: string;
}> = ({ system_uid, ...props }) => {
  return (
    <SystemProvider>
      <SystemContent system_uid={system_uid}>{props.children}</SystemContent>
    </SystemProvider>
  );
};

const SystemContent: React.FC<{
  system_uid: string;
}> = ({ system_uid, ...props }) => {
  const { System, SystemDispatch } = useContext(SystemContext);
  const [location, setLocation] = useState("");
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
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const jsessionid = urlParams.get("jsessionid");
        let urlPs = [];
        urlParams.forEach((value, key) => {
          urlPs.push({ key: key, value: value });
        });
        if (jsessionid) localStorage.setItem("jsessionid", jsessionid);
        fetch("http://appstore.deanshoes.com:8888/cas/sso", {
          body: JSON.stringify({
            redirect_url: window.location.href.split("?")[0], // (jsessionid) ? window.location.href.split("?")[0] : window.location.href,
            jsessionid: localStorage.jsessionid,
            urlParams: urlPs,
          }),
          cache: "no-cache",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            credentials: "include",
          },
          method: "POST",
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.redirect) {
              window.location.href = response.redirect;
            } else if (response.ldapid) {
              if (PublicMethod.checkValue(SystemFunc.getUser_Token())) {
                CallApi.ExecuteApi(
                  CENTER_FACTORY,
                  CENTER_IP + "/public/get_ticket_granting_cookie",
                  { access_token: SystemFunc.getUser_Token() }
                )
                  .then((res) => {
                    if (PublicMethod.checkValue(res.data)) {
                      if (response.ldapid === res.data[0].ldap_id) {
                        SystemDispatch({
                          type: "token",
                          value: SystemFunc.getUser_Token(),
                        });
                        SystemDispatch({ type: "userstate", value: "login" });
                      } else {
                        //換帳號
                        reLogin(response.ldapid);
                      }
                    } else {
                      //Token過期
                      reLogin(response.ldapid);
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              } else {
                //第一次登入
                reLogin(response.ldapid);
              }
            }
          })
          .catch((error) => {
            SystemDispatch({ type: "userstate", value: "logout" });
            console.log(error);
          });
      }
    } catch (error) {
      SystemDispatch({ type: "userstate", value: "logout" });
      console.log(error);
    }
  }, [location, System.mustlogin]);

  async function reLogin(ldapid) {
    try {
      await CallApi.ExecuteApi(
        CENTER_FACTORY,
        CENTER_IP + "/public/get_account",
        { account: ldapid }
      )
        .then(async (res) => {
          if (res.data) {
            let access_token = await asyncGetLoginToKen(ldapid);
            let create_account_access_token_body = {
              ldap_id: ldapid,
              access_token: access_token,
              system_uid: system_uid,
            };
            await CallApi.ExecuteApi(
              CENTER_FACTORY,
              CENTER_IP + "/public/create_account_access_token",
              create_account_access_token_body
            )
              .then((res) => {
                if (res.status === 200) {
                  if (SystemFunc.setUser_Token(access_token)) {
                    SystemDispatch({ type: "token", value: access_token });
                    SystemDispatch({ type: "userstate", value: "login" });
                  } else {
                    window.location.replace(
                      "https://cas.deanshoes.com:8443/cas/login?service=" +
                        window.location.href.split("?")[0]
                    );
                  }
                } else {
                  console.log(
                    "EROOR: System.reLogin.create_account_access_token_body"
                  );
                  console.log(res);
                  console.log(create_account_access_token_body);
                }
              })
              .catch((error) => {
                console.log(error);
                if (System.mustlogin) {
                  window.location.replace(
                    "https://cas.deanshoes.com:8443/cas/login?service=" +
                      window.location.href.split("?")[0]
                  );
                } else {
                  SystemDispatch({ type: "token", value: "" });
                  SystemDispatch({ type: "userstate", value: "logout" });
                  console.log(error);
                }
              });
          } else {
            SystemDispatch({ type: "userstate", value: "NoAccount" });
          }
        })
        .catch((error) => {
          console.log(error);
          if (System.mustlogin) {
            window.location.replace(
              "https://cas.deanshoes.com:8443/cas/login?service=" +
                window.location.href.split("?")[0]
            );
          } else {
            SystemDispatch({ type: "token", value: "" });
            SystemDispatch({ type: "userstate", value: "logout" });
            console.log(error);
          }
        });
    } catch (error) {
      console.log("EROOR: System.reLogin");
      console.log(error);
    }
  }

  function base64urlEncode(str) {
    try {
      return base64urlEscape(Buffer.from(str).toString("base64"));
    } catch (error) {
      console.log("EROOR: System.base64urlEncode");
      console.log(error);
    }
  }

  function base64urlEscape(str) {
    try {
      return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    } catch (error) {
      console.log("EROOR: System.base64urlEscape");
      console.log(error);
    }
  }

  function sign(input, key, method, type) {
    try {
      let base64str;
      if (type === "hmac") {
        base64str = Base64.stringify(hmacSHA512(input, key));
      } else {
        throw new Error("Algorithm type not recognized");
      }

      return base64urlEscape(base64str);
    } catch (error) {
      console.log("EROOR: System.sign");
      console.log(error);
    }
  }

  async function asyncGetLoginToKen(ldapid) {
    try {
      var header = { typ: "JWT", alg: "HS256" };
      var segments = [];

      segments.push(base64urlEncode(JSON.stringify(header)));
      segments.push(base64urlEncode(JSON.stringify({ ldapid: ldapid })));
      segments.push(
        sign(
          segments.join("."),
          PublicMethod.timeToString(new Date(), "YYYY-MM-DD hh:mm:ss"),
          "HS256",
          "hmac"
        )
      );
      return "TK-" + segments.join(".");
    } catch (error) {
      console.log("EROOR: System.asyncGetLoginToKen");
      console.log(error);
    }
  }
  useEffect(() => {
    try {
      if (
        !PublicMethod.checkValue(System.token) &&
        System.userstate !== "login"
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

        CallApi.ExecuteApi(
          CENTER_FACTORY,
          CENTER_IP + "/system/get_system_info",
          {
            access_token: token,
            system_uid: System.system_uid,
            location: System.lang,
          }
        )
          .then((res) => {
            if (res.data) {
              SystemDispatch({ type: "system_info", value: res.data });
            }
          })
          .catch((error) => {
            console.log("EROOR: SystemFunc.get_system_info");
            console.log(error);
          });
      }
    } catch (error) {
      console.log(error);
    }
  }, [
    System.system_uid,
    JSON.stringify(System.factory),
    System.token,
    System.userstate,
  ]);
  return (
    <>
      {localizationLoad ? (
        PublicMethod.checkValue(System.system_uid) ? (
          props.children
        ) : (
          <None />
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
