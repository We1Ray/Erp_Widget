import React, {
  useEffect,
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
import PublicMethod from "../../../methods/PublicMethod";
import { None } from "../../system-ui/None";
import { StyledTreeItem, TreeViewProps, TreeViewitem } from "./TreeView";

export const CommonTreeView: React.FC<TreeViewProps> = forwardRef(
  (
    {
      height,
      width,
      disabled,
      data,
      onClickValue,
      onDoubleClickValue,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
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

    useEffect(() => {
      try {
        checkDisable();
      } catch (error) {
        console.log("EROOR: CommonSelectionBox.useEffect[disable]");
        console.log(error);
      }
    }, [disabled]);

    /** 判斷欄位是否禁用*/
    function checkDisable() {
      try {
        if (PublicMethod.checkValue(disabled)) {
          setTreeViewDisable(disabled);
        } else {
          setTreeViewDisable(false);
        }
      } catch (error) {
        console.log("EROOR: CommonSelectionBox.checkDisable");
        console.log(error);
      }
    }

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
        treeitem.map((data) => {
          if (id === data.id) {
            setValue(data);
          } else if (
            id !== data.id &&
            data.children &&
            data.children.length > 0
          ) {
            idToValue(data.children, id);
          }
        });
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

// const useTreeItemStyles = makeStyles((theme) => ({
//   root: {
//     color: theme.palette.text.secondary,
//     '&:hover > $content': {
//       backgroundColor: theme.palette.action.hover,
//     },
//     '&:focus > $content, &$selected > $content': {
//       backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
//       color: 'var(--tree-view-color)',
//     },
//     '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
//       backgroundColor: 'transparent',
//     }
//   },
//   content: {
//     color: theme.palette.text.secondary,
//     borderTopRightRadius: theme.spacing(2),
//     borderBottomRightRadius: theme.spacing(2),
//     paddingRight: theme.spacing(1),
//     fontWeight: theme.typography.fontWeightMedium,
//     '$expanded > &': {
//       fontWeight: theme.typography.fontWeightRegular,
//     },
//   },
//   group: {
//     marginLeft: 0,
//     '& $content': {
//       paddingLeft: theme.spacing(2),
//     },
//   },
//   expanded: {},
//   selected: {},
//   label: {
//     fontWeight: 'inherit',
//     color: 'inherit',
//   },
//   labelRoot: {
//     display: 'flex',
//     alignItems: 'center',
//     padding: theme.spacing(0.5, 0),
//   },
//   labelIcon: {
//     marginRight: theme.spacing(1),
//   },
//   labelText: {
//     fontWeight: 'inherit',
//     flexGrow: 1,
//   },
// }))
