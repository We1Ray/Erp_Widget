import axios from "axios";
import PublicMethod from "./PublicMethod";

class SystemFunc {
  getUser_Token() {
    try {
      return PublicMethod.checkValue(localStorage.getItem("access_token"))
        ? localStorage.getItem("access_token")
        : "";
    } catch (error) {
      console.log("EROOR: SystemFunc.getUser_Token");
      console.log(error);
    }
  }

  /**
   * 建立通用唯一辨識碼
   */
  uuid() {
    try {
      var d = Date.now();
      if (
        typeof performance !== "undefined" &&
        typeof performance.now === "function"
      ) {
        d += performance.now(); //use high-precision timer if available
      }
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
      );
    } catch (error) {
      console.log("EROOR: SystemFunc.uuid");
      console.log(error);
    }
  }

  setUser_Token(value: string) {
    try {
      if (PublicMethod.checkValue(value)) {
        window.localStorage.setItem("access_token", value);
        return true;
      } else {
        window.localStorage.setItem("access_token", "");
        return false;
      }
    } catch (error) {
      console.log("EROOR: SystemFunc.setUser_Token");
      console.log(error);
    }
  }
}
export default new SystemFunc();
