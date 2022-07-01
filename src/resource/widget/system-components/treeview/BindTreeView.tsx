import React, {
  useEffect,
  useContext,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import Label from "@material-ui/icons/Label";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import { ComponentContext } from "../../system-control/ComponentContext";
import {
  ProgramContext,
  statusContext,
  STATUS,
} from "../../system-control/ProgramContext";
import PublicMethod from "../../../methods/PublicMethod";
import { None } from "../../system-ui/None";
import { StyledTreeItem, TreeViewProps, TreeViewitem } from "./TreeView";
import useLatest from "../../../methods/useLatest";

export const BindTreeView: React.FC<TreeViewProps> = forwardRef(
  (
    {
      height,
      width,
      data,
      disabled,
      onClickValue,
      onDoubleClickValue,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const { Component } = useContext(ComponentContext);
    const { Program, ProgramDispatch } = useContext(ProgramContext);
    const { status } = useContext(statusContext);
    const [value, setValue] = useState({});
    const [treeViewDisable, setTreeViewDisable] = useState(false);
    const [expand, setExpand] = useState([]);
    const [selected, setSelected] = useState([]);

    const useStyles = makeStyles({
      root: {
        height: PublicMethod.checkValue(height) ? height : 760,
        flexGrow: 1,
        maxWidth: PublicMethod.checkValue(width) ? width : 360,
        overflow: "auto",
      },
    });
    const treeviewRef = useRef(null);
    const classes = useStyles();

    useImperativeHandle(forwardedRef, () => treeviewRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(treeviewRef);
        }
      } catch (error) {
        console.log("EROOR: Label.useEffect()");
        console.log(error);
      }
    });

    useEffect(() => {
      try {
        let source = [];
        let expanded = [];
        let datas = {
          id: -1,
          children: data,
        };
        const Findid = (sourceTree, source) => {
          if (sourceTree["expand"] === "Y" && !source.includes(sourceTree.id)) {
            source.push(sourceTree.id);
          }
          sourceTree.children.forEach((item, index) => {
            if (item["expand"] === "Y") {
              // 寻找到指定的元素节点
              source.push(item.id);
            }
            Findid(item, source); // 继续寻找上层元素的位置
          });
        };
        Findid(datas, source);
        for (let index = 0; index < source.length; index++) {
          let pos = getPosByIdInTree(datas, source[index]);
          expanded = [...expanded, ...pos];
        }
        setExpand(expanded);
      } catch (error) {
        console.log("EROOR: Tree.useEffect[JSON.stringify(data)]");
        console.log(error);
      }
    }, [JSON.stringify(data)]);

    const getPosByIdInTree = (tree, id) => {
      let tmp = []; // 路径数组
      try {
        if (tree.id === id) {
          return [0];
        } //根节点

        const FindPos = (sourceTree, sourceId) => {
          if (!sourceTree.children) {
            return; // 为末端节点
          }
          sourceTree.children.forEach((item, index) => {
            if (item.id === sourceId) {
              // 寻找到指定的元素节点
              tmp.push(item.id);
              FindPos(tree, sourceTree.id); // 继续寻找上层元素的位置
            } else {
              // 当前继续寻找别的子项
              FindPos(item, sourceId);
            }
          });
        };
        FindPos(tree, id);
        // return tmp
        // 这里会有一些特定的问题,这个路径是反序存储的，所以需要存进去之后反转一次
        // 另外看自己的需求，这个是否需要push(0)作为根节点的判定
        tmp = tmp.reverse();
        tmp.pop();
      } catch (error) {
        console.log("EROOR: Tree.getPosByIdInTree");
        console.log(error);
      }
      return tmp;
    };

    useLatest(
      (latest) => {
        //狀態 or 資料變更時
        function checkStatus() {
          //只有狀態:READ時可點換資料
          let check = false;
          try {
            if (Program.individual) {
              if (status.matches(STATUS.READ)) {
                if (Program.loading == "READ") {
                  if (PublicMethod.checkValue(disabled)) {
                    check = disabled;
                  } else {
                    check = false;
                  }
                } else {
                  check = true;
                }
              } else {
                check = true;
              }
            } else {
              for (var key in Component.status) {
                if (check) break;
                if (Component.status[key] == STATUS.READ) {
                  for (var key2 in Component.loading) {
                    if (!check) break;
                    if (Component.loading[key2] == "READ") {
                      if (PublicMethod.checkValue(disabled)) {
                        check = disabled;
                      } else {
                        check = false;
                      }
                    } else {
                      check = true;
                    }
                  }
                } else {
                  check = true;
                }
              }
            }
          } catch (error) {
            console.log("EROOR: Tree.checkStatus");
            console.log(error);
          }
          return check;
        }
        if (latest()) {
          setTreeViewDisable(checkStatus());
        }
      },
      [
        JSON.stringify(Component.status),
        JSON.stringify(Component.loading),
        Program.individual,
        Program.loading,
        status,
      ]
    );

    const getTreeItemsFromData = (treeitem) => {
      try {
        return treeitem.map((treeitem) => {
          let children = undefined;
          if (treeitem.children && treeitem.children.length > 0) {
            children = getTreeItemsFromData(treeitem.children);
          }
          return (
            <StyledTreeItem
              nodeId={treeitem.id}
              labelText={treeitem.label}
              labelIcon={Label}
              children={children}
            />
          );
        });
      } catch (error) {
        console.log("EROOR: Tree.getTreeItemsFromData");
        console.log(error);
      }
    };

    function idToValue(treeitem: TreeViewitem[], id: any) {
      try {
        let check = true;
        if (Program.individual) {
          if (status.matches(STATUS.READ)) {
            if (Program.loading == "READ") {
              check = true;
            } else {
              check = false;
            }
          } else {
            check = false;
          }
        } else {
          for (var key in Component.status) {
            if (!check) break;
            if (Component.status[key] == STATUS.READ) {
              for (var key2 in Component.loading) {
                if (!check) break;
                if (Component.loading[key2] == "READ") {
                  check = true;
                } else {
                  check = false;
                }
              }
            } else {
              check = false;
            }
          }
        }

        if (check) {
          treeitem.map((data) => {
            if (id === data.id) {
              setValue(data);
              ProgramDispatch({ type: "selectedData", value: data.data });
            } else if (
              id !== data.id &&
              data.children &&
              data.children.length > 0
            ) {
              idToValue(data.children, id);
            }
          });
        }
      } catch (error) {
        console.log("EROOR: Tree.idToValue");
        console.log(error);
      }
    }

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(onClickValue)) {
          onClickValue(value);
        }
      } catch (error) {
        console.log("EROOR: Tree.useEffect[JSON.stringify(value)]");
        console.log(error);
      }
    }, [JSON.stringify(value)]);

    const handleToggle = (event, nodeIds) => {
      try {
        event.persist();
        let iconClicked = event.target.closest(".MuiTreeItem-iconContainer");
        if (iconClicked) {
          setExpand(nodeIds);
        }
      } catch (error) {
        console.log("EROOR: Tree.handleToggle");
        console.log(error);
      }
    };

    const handleSelect = (event, value) => {
      try {
        event.persist();
        let iconClicked = event.target.closest(".MuiTreeItem-iconContainer");
        if (!iconClicked) {
          setSelected(value);
        }
      } catch (error) {
        console.log("EROOR: Tree.handleSelect");
        console.log(error);
      }
    };

    useEffect(() => {
      try {
        idToValue(data, selected);
      } catch (error) {
        console.log("EROOR: Tree.useEffect[selected]");
        console.log(error);
      }
    }, [selected]);

    function doubleclick(e) {
      try {
        if (PublicMethod.checkValue(onDoubleClickValue)) {
          onDoubleClickValue(value);
        }
      } catch (error) {
        console.log("EROOR: Tree.doubleclick");
        console.log(error);
      }
    }

    return (
      <>
        {PublicMethod.checkValue(data) ? (
          <TreeView
            ref={treeviewRef}
            className={classes.root}
            expanded={expand}
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            defaultEndIcon={<div style={{ width: 18 }} />}
            onNodeSelect={handleSelect}
            disableSelection={treeViewDisable}
            onNodeToggle={handleToggle}
            onDoubleClick={(e) => doubleclick(e)}
            {...props}
          >
            {getTreeItemsFromData(data)}
          </TreeView>
        ) : (
          <None />
        )}
      </>
    );
  }
);
