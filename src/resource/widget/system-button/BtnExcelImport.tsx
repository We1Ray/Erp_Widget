import React, { useState, useEffect, useContext, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "reactstrap";
import { SystemContext } from "../system-control/SystemContext";
import { ComponentContext } from "../system-control/ComponentContext";
import {
  ProgramContext,
  statusContext,
  STATUS,
} from "../system-control/ProgramContext";
import PublicMethod from "../../methods/PublicMethod";
import useLatest from "../../methods/useLatest";

// const make_cols = refstr => {
//     let o = [],
//         C = XLSX.utils.decode_range(refstr).e.c + 1;
//     for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i };
//     return o;
// }

// function OutTable({ cols, data }) {
//     return (
//         <div className="table-responsive">
//             <table className="table table-striped">
//                 <thead>
//                     <tr>
//                         {cols.map(c => (
//                             <th key={c.key}>{c.name}</th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.map((r, i) => (
//                         <tr key={i}>
//                             {cols.map(c => (
//                                 <td key={c.key}>{r[c.key]}</td>
//                             ))}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }
interface Props {
  /**
   * 設定是否可使用
   */
  disableFilter?: () => Promise<boolean>;
  /**
   * 設定外觀
   */
  style?: React.CSSProperties;
  /**
   * 設定其他畫面顯示
   */
  childObject?: React.AllHTMLAttributes<any>;
  /**
   * 設定匯入資料表執行的動作
   */
  importData: (data: any[], wb: XLSX.WorkSheet) => void;
  /**
   * 按下按鈕時觸發(觸發後會改變狀態)
   */
  onClick?: () => Promise<any>;
  /**
   * 滑鼠移動至按鈕顯示的字眼
   */
  title?: string;
}
export const BtnExcelImport: React.FC<Props> = ({
  disableFilter,
  style,
  childObject,
  importData,
  onClick,
  title,
}) => {
  const { System } = useContext(SystemContext);
  const { Component } = useContext(ComponentContext);
  const { Program } = useContext(ProgramContext);
  const { status } = useContext(statusContext);
  // const [data, setData] = useState([])
  // const [cols, setCols] = useState([])
  const [importPermission, setImportPermission] = useState(false);
  const [importDisable, setimportDisable] = useState(true);

  const hiddenFileInput = useRef(null);

  const handleClick = async (event: any) => {
    await onClick();
    await hiddenFileInput.current.click();
  };

  useEffect(() => {
    disable();
  }, [disableFilter]);

  async function disable() {
    try {
      if (PublicMethod.checkValue(disableFilter)) {
        setImportPermission(!(await disableFilter()));
      } else {
        setImportPermission(true);
      }
    } catch (error) {
      console.log("EROOR: BtnExcelImport.disable");
      console.log(error);
    }
    return disable;
  }

  useLatest(
    (latest) => {
      async function checkEnable() {
        try {
          let check = false;
          if (!Program.individual) {
            for (var key in Component.status) {
              if (check) break;
              if (
                Component.status[key] == STATUS.READ &&
                PublicMethod.checkValue(Program.selectedData)
              ) {
                for (var key2 in Component.loading) {
                  if (check) break;
                  if (Component.loading[key2] == "READ") {
                    check = false;
                  } else {
                    check = true;
                  }
                }
              } else {
                check = true;
              }
            }
          }
          if (
            status.matches(STATUS.READ) &&
            PublicMethod.checkValue(Program.selectedData) &&
            !check
          ) {
            if (Program.loading == "READ") {
              check = !importPermission;
            } else {
              check = true;
            }
          } else {
            check = true;
          }
          if (latest()) {
            setimportDisable(check);
          }
        } catch (error) {
          console.log("EROOR: BtnExcelImport.checkEnable");
          console.log(error);
        }
      }
      checkEnable();
    },
    [
      JSON.stringify(Component.status),
      JSON.stringify(Component.loading),
      JSON.stringify(Program.selectedData),
      Program.loading,
      Program.individual,
      status,
      importPermission,
    ]
  );

  function handleFile(e) {
    try {
      const file = e.target.files[0];
      /* Boilerplate to set up FileReader */
      const reader = new FileReader();
      const rABS = !!reader.readAsBinaryString;
      let data = [];
      reader.onload = (e) => {
        /* Parse data */
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });

        for (const sheet in wb.Sheets) {
          // esline-disable-next-line
          if (wb.Sheets.hasOwnProperty(sheet)) {
            const ws = wb.Sheets[sheet];
            const importAlldata = XLSX.utils.sheet_to_json(ws, { header: 1 });
            data.push(
              importAlldata.filter((item) => PublicMethod.checkValue(item))
            );
          }
        }
        /* Get first worksheet */
        // const wsname = wb.SheetNames[0]
        // const ws = wb.Sheets[wsname]

        /* Convert array of arrays */
        // const importAlldata = XLSX.utils.sheet_to_json(ws, { header: 1 })

        /* Update state */
        // setCols(make_cols(ws["!ref"]))
        // let data = importAlldata.filter(item => PublicMethod.checkValue(item))

        importData(data, wb.Sheets);
      };
      if (rABS) reader.readAsBinaryString(file);
      else reader.readAsArrayBuffer(file);
    } catch (error) {
      console.log("EROOR: BtnExcelImport.handleFile");
      console.log(error);
    }
  }

  function reset(e) {
    e.target.value = null;
  }

  return (
    <Button
      style={style}
      disabled={importDisable}
      onClick={handleClick}
      title={title}
    >
      {PublicMethod.checkValue(childObject) ? (
        childObject
      ) : (
        <>
          <em className={"far fa-file-excel"} />
          &ensp;
          {System.getLocalization("Public", "ImportExcel")}
        </>
      )}
      <input
        ref={hiddenFileInput}
        style={{ display: "none" }}
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFile}
        disabled={importDisable}
        onClick={reset}
      />
    </Button>
  );
};

// class Excel extends Component {
//     onImportExcel = file => {
//         // 获取上传的文件对象
//         const { files } = file.target;
//         // 通过FileReader对象读取文件
//         const fileReader = new FileReader();
//         fileReader.onload = event => {
//             try {
//                 const { result } = event.target;
//                 // 以二进制流方式读取得到整份excel表格对象
//                 const workbook = XLSX.read(result, { type: 'binary' });
//                 // 存储获取到的数据
//                 let data = [];
//                 // 遍历每张工作表进行读取（这里默认只读取第一张表）
//                 for (const sheet in workbook.Sheets) {
//                     // esline-disable-next-line
//                     if (workbook.Sheets.hasOwnProperty(sheet)) {
//                         // 利用 sheet_to_json 方法将 excel 转成 json 数据
//                         console.log(workbook.Sheets[sheet])
//                         data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
//                         // break; // 如果只取第一张表，就取消注释这行
//                     }
//                 }
//                 // 最终获取到并且格式化后的 json 数据
//                 console.log('upload success')
//                 console.log(data);
//             } catch (e) {
//                 // 这里可以抛出文件类型错误不正确的相关提示
//                 console.log('upload fail');
//             }
//         };
//         // 以二进制方式打开文件
//         fileReader.readAsBinaryString(files[0]);
//     }
//     render() {
//         return (
//             <div style={{ marginTop: 100 }}>
//                 <input type='file' accept='.xlsx, .xls' onChange={onImportExcel} />
//                 <span >上传文件(支持 .xlsx、.xls 格式的文件)</span>
//             </div >
//         );
//     }
// }
