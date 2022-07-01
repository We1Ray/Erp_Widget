import React, { useContext, useState, useEffect } from "react";
import { Card, ButtonToolbar } from "reactstrap";
import { Row } from "../src/resource/widget/system-ui/Row";
import { Column } from "../src/resource/widget/system-ui/Column";
import { DataTable } from "../src/resource/widget/system-components/datatable/DataTable";
import { Label } from "../src/resource/widget/system-components/label/Label";
import { TextBox } from "../src/resource/widget/system-components/textbox/TextBox";
import {
  ProgramContext,
  ProgramProvider,
} from "../src/resource/widget/system-control/ProgramContext";
import { SystemContext } from "../src/resource/widget/system-control/SystemContext";
import { Form } from "../src/resource/widget/system-control/Form";
import { BtnQuery } from "../src/resource/widget/system-button/BtnQuery";
import { getLocalization } from "../src/resource/methods/PublicMethod";

export default function Qry_accounts() {
  return (
    <ProgramProvider>
      <Qry_accounts_Content />
    </ProgramProvider>
  );
}

function Qry_accounts_Content() {
  const { System } = useContext(SystemContext);
  const { Program } = useContext(ProgramContext);
  const [localization, setLocalization] = useState({});

  useEffect(() => {
    initLocalization();
  }, [System.lang]);

  async function initLocalization() {
    setLocalization({
      ACCOUNT: await getLocalization(
        System.lang,
        "system_administrator",
        "ACCOUNT"
      ),
      NAME: await getLocalization(System.lang, "system_administrator", "NAME"),
    });
  }

  return (
    <Card>
      <Form
        programID="Qry_accounts"
        dataKey={["ACCOUNT_UID"]}
        individual={true}
      >
        <Column md={12}>
          <Row>
            <Column md={12}>
              <ButtonToolbar>
                <BtnQuery
                  queryOperation="get_account_info"
                  queryApi="get_account_info"
                  disableFilter={async () => false}
                />
              </ButtonToolbar>
            </Column>
            <Column>
              <Label text={localization["ACCOUNT"]} />
              <TextBox maxLength={20} query={true} name="Qry_accounts_Key" />
            </Column>
          </Row>
        </Column>
        <Column md={12}>
          <Column>
            <DataTable
              bind={true}
              data={Program.data}
              columns={[
                {
                  dataField: "ACCOUNT_UID",
                  text: localization["ACCOUNT"],
                  sort: true,
                  hidden: true,
                },
                {
                  dataField: "ACCOUNT",
                  text: localization["ACCOUNT"],
                  sort: true,
                },
                { dataField: "NAME", text: localization["NAME"], sort: true },
              ]}
            />
          </Column>
        </Column>
      </Form>
    </Card>
  );
}
