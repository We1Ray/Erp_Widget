import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import PropTypes from "prop-types";
import TreeItem from "@material-ui/lab/TreeItem";
import PublicMethod from "../../../methods/PublicMethod";
import { BindTreeView } from "./BindTreeView";
import { CommonTreeView } from "./CommonTreeView";

interface TreeViewProps {
  /**
   * 設定高度
   */
  height?: number | string;
  /**
   * 設定寬度
   */
  width?: number | string;
  /**
   * 設定是否可點選
   */
  disabled?: boolean;
  /**
   * 設定是否綁定Program
   */
  bind?: boolean;
  /**
   * 給予Tree的資料
   */
  data: TreeViewitem[];
  /**
   * 點選後的事件
   */
  onClickValue?: (arg: any) => void;
  /**
   * 雙重點擊後的事件
   */
  onDoubleClickValue?: (arg: any) => void;
  /**
   * 元件的Reference
   */
  ref?: React.Ref<any>;
  callbackRef?: (arg: React.MutableRefObject<any>) => void;
}
interface TreeViewitem {
  id: string;
  label: string;
  icon: string;
  data: any;
  children?: any;
  expand?: string;
}
const Tree: React.FC<TreeViewProps> = forwardRef(
  (
    {
      height,
      width,
      disabled,
      bind,
      data,
      onClickValue,
      onDoubleClickValue,
      callbackRef,
      ...props
    },
    forwardedRef
  ) => {
    const treeRef = useRef(null);
    useImperativeHandle(forwardedRef, () => treeRef.current);

    useEffect(() => {
      try {
        if (PublicMethod.checkValue(callbackRef)) {
          callbackRef(treeRef);
        }
      } catch (error) {
        console.log("EROOR: Tree.useEffect()");
        console.log(error);
      }
    });

    return (
      <>
        {bind ? (
          <BindTreeView
            height={height}
            width={width}
            disabled={disabled}
            data={data}
            onClickValue={onClickValue}
            onDoubleClickValue={onDoubleClickValue}
            ref={treeRef}
            {...props}
          />
        ) : (
          <CommonTreeView
            height={height}
            width={width}
            disabled={disabled}
            data={data}
            onClickValue={onClickValue}
            onDoubleClickValue={onDoubleClickValue}
            ref={treeRef}
            {...props}
          />
        )}
      </>
    );
  }
);

StyledTreeItem.propTypes = {
  nodeId: PropTypes.string,
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired,
  children: PropTypes.any,
  onIconClick: PropTypes.func,
  onLabelClick: PropTypes.func,
};

function StyledTreeItem(props) {
  // const classes = useTreeItemStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    labelInfo,
    color,
    bgColor,
    ...other
  } = props;
  return (
    <TreeItem
      // label={
      //   <div className={classes.labelRoot}>
      //     <LabelIcon color="inherit" className={classes.labelIcon} />
      //     <Typography variant="body2" className={classes.labelText}>
      //       {labelText}
      //     </Typography>
      //     <Typography variant="caption" color="inherit">
      //       {labelInfo}
      //     </Typography>
      //   </div>
      // }
      label={labelText}
      // style={{
      //   '--tree-view-color': color,
      //   '--tree-view-bg-color': bgColor,
      // }}
      // classes={{
      //   root: classes.root,
      //   content: classes.content,
      //   expanded: classes.expanded,
      //   selected: classes.selected,
      //   group: classes.group,
      //   label: classes.label,
      // }}
      {...other}
    >
      {props.children}
    </TreeItem>
  );
}

export { Tree, StyledTreeItem };

export type { TreeViewProps, TreeViewitem };
