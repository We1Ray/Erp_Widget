import React, { useState, useContext } from "react";
import { Input } from "reactstrap";
import { SystemContext } from "./SystemContext";
import FormValidator from "./Validator.js";
import PublicMethod, {
  CENTER_FACTORY,
  CENTER_IP,
} from "../../methods/PublicMethod";
import hmacSHA512 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64";
import CallApi from "../../api/CallApi";
import SystemFunc from "../../methods/SystemFunc";

interface formLoginProps {
  email?: string;
  password?: string;
  [x: string]: {};
}

export default function Login({ system_uid, ...props }) {
  const { System, SystemDispatch } = useContext(SystemContext);
  const [formLogin, setFormLogin] = useState<formLoginProps>({
    email: "",
    password: "",
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function validateOnChange(event) {
    const input = event.target;
    const form = input.form;
    const value = input.type === "checkbox" ? input.checked : input.value;

    const result = FormValidator.validate(input);
    if (input.name === "email") {
      setEmail(value);
    } else if (input.name === "password") {
      setPassword(value);
    }

    setFormLogin({
      [form.name]: {
        ...[form.name],
        [input.name]: value,
        errors: {
          ...[form.name]["errors"],
          [input.name]: result,
        },
      },
    });
  }

  function onSubmit(e) {
    const form = e.target;
    const inputs = [...form.elements].filter((i) =>
      ["INPUT", "SELECT"].includes(i.nodeName)
    );
    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    setFormLogin({
      [form.name]: {
        ...[form.name],
        errors,
      },
    });
    console.log(hasError ? "Form has errors. Check!" : "Form Submitted!");
    e.preventDefault();
  }

  const hasError = (formName, inputName, method) => {
    return (
      [formName] &&
      [formName]["errors"] &&
      [formName]["errors"][inputName] &&
      [formName]["errors"][inputName][method]
    );
  };

  function login() {
    if (PublicMethod.checkValue(email) && PublicMethod.checkValue(password)) {
      CallApi.ExecuteApi(CENTER_FACTORY, CENTER_IP + "/public/login", {
        email: email,
        password: password,
      }).then(async (res) => {
        if (PublicMethod.checkValue(res.data.rows)) {
          let access_token = await asyncGetLoginToKen(res.data.rows[0].account);
          let create_account_access_token_body = {
            ldap_id: res.data.rows[0].account,
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
              SystemDispatch({ type: "token", value: "" });
              SystemDispatch({ type: "userstate", value: "logout" });
              console.log(error);
            });
        } else {
          alert("account or password incorrect!");
        }
      });
    } else {
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

  return (
    <>
      <div className="wrapper">
        <div className="block-center mt-4 wd-xl">
          <div className="card card-flat">
            <div className="card-header text-center bg-dark">
              <a href="">
                <img
                  className="block-center rounded"
                  src="/static/img/icon.png"
                  alt="Logo"
                  width="50"
                  height="50"
                />
              </a>
            </div>
            <div className="card-body">
              <p className="text-center py-2">SIGN IN TO CONTINUE.</p>
              <p className="text-center py-2">{}</p>
              <form className="mb-3" name="formLogin" onSubmit={onSubmit}>
                <div className="form-group">
                  <div className="input-group with-focus">
                    <Input
                      type="email"
                      name="email"
                      className="border-right-0"
                      placeholder="Enter email"
                      invalid={
                        hasError("formLogin", "email", "required") ||
                        hasError("formLogin", "email", "email")
                      }
                      onChange={validateOnChange}
                      data-validate='["required", "email"]'
                      value={formLogin.email}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-envelope"></em>
                      </span>
                    </div>
                    {hasError("formLogin", "email", "required") && (
                      <span className="invalid-feedback">
                        Field is required
                      </span>
                    )}
                    {hasError("formLogin", "email", "email") && (
                      <span className="invalid-feedback">
                        Field must be valid email
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-group with-focus">
                    <Input
                      type="password"
                      id="id-password"
                      name="password"
                      className="border-right-0"
                      placeholder="Password"
                      invalid={hasError("formLogin", "password", "required")}
                      onChange={validateOnChange}
                      data-validate='["required"]'
                      value={formLogin.password}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text text-muted bg-transparent border-left-0">
                        <em className="fa fa-lock"></em>
                      </span>
                    </div>
                    <span className="invalid-feedback">Field is required</span>
                  </div>
                </div>
                <button
                  className="btn btn-block btn-primary mt-3"
                  type="submit"
                  onClick={() => login()}
                >
                  Login
                </button>
              </form>
            </div>
          </div>
          <div className="p-3 text-center">
            <span className="mx-2">Copyright</span>
            <span className="mr-2">&copy;</span>
            <span>{new Date().getFullYear() + " WeiRay."}</span>
          </div>
        </div>
      </div>
    </>
  );
}
