import React from "react";
import { CardBody } from "reactstrap";
interface Props {
  children?: React.AllHTMLAttributes<any>;
}
/**
 * Loading的畫面
 */
export const Loading: React.FC<Props> = ({ children }) => {
  return (
    <CardBody>
      <section className="whirl helicopter">{children}</section>
    </CardBody>
  );
};
