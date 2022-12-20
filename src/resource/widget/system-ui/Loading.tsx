import React from "react";
import { CardBody } from "reactstrap";

/**
 * Loading的畫面
 */
export const Loading: React.FC<{
  children?: React.AllHTMLAttributes<any>;
}> = ({ children }) => {
  return (
    <CardBody>
      <section className="whirl helicopter">{children}</section>
    </CardBody>
  );
};
