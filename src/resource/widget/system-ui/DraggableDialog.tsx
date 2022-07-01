import React, { useRef } from "react";
import Popover from "@material-ui/core/Popover";
import Grow from "@material-ui/core/Grow";
import Draggable from "react-draggable";
// import { ResizableBox } from "react-resizable";
// import { makeStyles } from "@material-ui/styles";

let handle = 0;
interface DraggableGrowProps {
  children: any;
  [x: string]: any;
}
const DraggableGrow: React.FC<DraggableGrowProps> = ({
  children,
  ...other
}) => {
  return (
    <>
      <Grow {...other} timeout={0}>
        <Draggable handle={".handle" + (handle ? handle : "")} bounds="parent">
          {React.cloneElement(children, { ...other })}
        </Draggable>
      </Grow>
    </>
  );
};

// const useStyles = makeStyles({
//   resizable: {
//     position: "relative",
//     "& .react-resizable-handle": {
//       position: "absolute",
//       width: 20,
//       height: 20,
//       bottom: 10,
//       right: 5,
//       background:
//         "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+')",
//       "background-position": "bottom right",
//       padding: "0 3px 3px 0",
//       "background-repeat": "no-repeat",
//       "background-origin": "content-box",
//       "box-sizing": "border-box",
//       cursor: "se-resize",
//     },
//   },
// });
interface Props {
  open: boolean;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  [x: string]: any;
}
export const DraggableDialog: React.FC<Props> = ({
  open,
  style,
  contentStyle,
  ...props
}) => {
  const dialogRef = useRef(null);
  // const classes = useStyles();

  // const [height, setHeight] = useState(600);
  // const [width, setWidth] = useState(400);
  handle = Math.floor(Math.random() * 10000);

  // function getheight(ref: React.MutableRefObject<any>) {
  //   try {
  //     if (ref.current) {
  //       let scrollHeight = ref.current.scrollHeight;
  //       setHeight(scrollHeight);

  //       let scrollWidth = ref.current.scrollWidth;
  //       setWidth(scrollWidth);
  //     }
  //   } catch (error) {
  //     console.log("EROOR: TextBox.getheight");
  //     console.log(error);
  //   }
  // }

  // useEffect(() => {
  //   try {
  //     getheight(dialogRef);
  //     console.log(dialogRef);
  //   } catch (error) {
  //     console.log("EROOR: DraggableDialog.useEffect");
  //     console.log(error);
  //   }
  // });

  return (
    <Popover
      PaperProps={{ style: style }}
      open={open}
      anchorOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      TransitionComponent={DraggableGrow}
      ref={dialogRef}
      {...props}
    >
      {/* <ResizableBox height={height} width={width} className={classes.resizable}> */}
      <div
        className={"handle" + handle}
        style={{
          height: "25px",
          width: "100%",
          backgroundColor: "#6ECB63",
          cursor: "move",
        }}
      />
      {props.children}
      {/* </ResizableBox> */}
    </Popover>
  );
};
export default DraggableDialog;
