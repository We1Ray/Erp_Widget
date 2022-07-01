import moment from "moment";

const CENTER_IP = "http://localhost:80";
const CENTER_FACTORY = "DS";

export default new (class PublicMethod {
  /**
   * 確認目前值是否存在或為空 不為空(有值)為true，空值(undefined)為false
   */
  checkValue(obj: any) {
    // null and undefined are "empty"
    if (obj == null) return false;

    if (typeof obj === "number") return true;
    if (typeof obj === "function") return true;
    if (typeof obj === "boolean") return true;
    if (typeof obj.getMonth === "function") return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return true;
    if (obj.length === 0) return false;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return false;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
      if (PublicMethod.hasOwnProperty.call(obj, key)) return true;
    }
    return false;
  }
  /**
   * 合併兩個JSON資料成一個
   */
  mergeJSON(jsonbject1: object, jsonbject2: object) {
    var resultJsonObject = {};
    try {
      for (var attr in jsonbject1) {
        resultJsonObject[attr] = jsonbject1[attr];
      }
      for (var attr in jsonbject2) {
        resultJsonObject[attr] = jsonbject2[attr];
      }
    } catch (error) {
      console.log("EROOR: PublicMethod.mergeJSON");
      console.log(error);
    }
    return resultJsonObject;
  }
  /**
   * 輸入時間和時間格式回傳字串時間
   */
  timeToString(time: Date, format: string) {
    try {
      let timeformat = format.replace("yyyy", "YYYY").replace("dd", "DD");
      let timeValue = moment(time).isValid()
        ? moment(time).format(timeformat)
        : time;
      return timeValue;
    } catch (error) {
      console.log("EROOR: PublicMethod.timeToString");
      console.log(error);
    }
  }
  /**
   * 輸入任意值若為空或undefined則回傳空字串，不為空則回傳值
   */
  getValue(value: any) {
    if (this.checkValue(value)) return value;
    return "";
  }

  visibility(name: string, queryConditions: any[], visible: boolean) {
    try {
      if (this.checkValue(name) && queryConditions === undefined) {
        if (this.checkValue(visible)) {
          if (visible) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      } else if (this.checkValue(name) && queryConditions !== undefined) {
        let x = queryConditions.find(function (item, index, array) {
          return item.value === name;
        });
        if (this.checkValue(x)) {
          if (this.checkValue(visible)) {
            if (visible) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return false;
        }
      } else {
        if (this.checkValue(visible)) {
          if (visible) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    } catch (error) {
      console.log("EROOR: PublicMethod.visibility");
      console.log(error);
    }
  }
  /**
   * 從ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789的字元裡面隨機產生指定長度的亂數
   */
  makeid(length: number) {
    try {
      var result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    } catch (error) {
      console.log("EROOR: PublicMethod.makeid");
      console.log(error);
    }
  }
  /**
   * 給於兩個陣列，比較兩陣列若相同則回傳True 不同為false
   */
  arrayEquals(array1: any[], array2: any[]) {
    // if the other array is a falsy value, return
    if (!array1 || !array2) return false;

    // compare lengths - can save a lot of time
    if (array1.length != array2.length) return false;

    for (var i = 0, l = array1.length; i < l; i++) {
      // Check if we have nested arrays
      if (array1[i] instanceof Array && array2[i] instanceof Array) {
        // recurse into the nested arrays
        if (!array1[i].equals(array2[i])) return false;
      } else if (array1[i] != array2[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  }
  /**
   * 判斷兩個陣列裡的項目(不比較順序)
   */
  isArrayItemEqual(a = [], b = []) {
    if (a.length !== b.length) {
      return false;
    } else {
      // 循环遍历数组的值进行比较
      for (let i = 0; i < a.length; i++) {
        if (b.indexOf(a[i]) === -1) {
          return false;
        }
      }
      return true;
    }
  }
})();

export { CENTER_IP, CENTER_FACTORY };
