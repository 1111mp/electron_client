import * as React from 'react';
import { Fragment } from 'react';

import BasicComponent from "components/BasicComponent";
import { Button } from 'antd';

const listener = require('app/constants/listener.json');

export default class Dialog extends BasicComponent {
  close = (): void => {
    this.$send(listener.DIALOG_CANCEL);
  }

  didMount(){
    console.log(11111)
  }

  $render() {
    return (
      <Fragment>
        <Button type="dashed" onClick={this.close}>关闭</Button>
      </Fragment>
    )
  }
}
