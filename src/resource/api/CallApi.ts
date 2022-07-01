import axios from "axios";

export default new (class CallApi {
  /**
   * 輸入廠別、IP、參數呼叫API
   */
  async ExecuteApi(factory: string, ip: string, json: object) {
    if (factory && ip) {
      return axios.post(ip, json, {
        headers: {
          Factory: factory,
        },
      });
    }
  }
})();
