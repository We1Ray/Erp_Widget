import React from "react";
import { Card, CardHeader, CardBody, FormGroup } from "reactstrap";
import PublicMethod from "../../methods/PublicMethod";
/**
 * Block 區塊畫面，可在底下放置所需的子元件
 */
interface Props {
  /**
   * 區塊顯示名稱
   */
  head?: string;
}
export const Block: React.FC<Props> = ({ head, ...props }) => {
  let body = [];
  body.push(
    <form className="form-horizontal">
      <FormGroup row>{props.children}</FormGroup>
    </form>
  );
  return (
    <>
      {PublicMethod.checkValue(head) ? (
        <Card className="card-default">
          <CardHeader>
            <h2 className="MuiTypography-root MuiTypography-h6">
              <strong>{head}</strong>
            </h2>
          </CardHeader>
          <CardBody>{body}</CardBody>
        </Card>
      ) : (
        <>{body}</>
      )}
    </>
  );
};
