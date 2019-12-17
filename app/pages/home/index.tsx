import * as React from 'react';
import { Fragment } from 'react';
import BasicComponent from 'components/BasicComponent';
import { Button } from 'antd';

type Props = {};

export default class Home extends BasicComponent<Props> {
  props: Props;

  confirm = (): void => {
    console.log(11111)
    this.$confirm('是否确认清空所有消息？', '清空消息');
  }

  $render(): JSX.Element {
    return (
      <Fragment>
        <h2>Home</h2>
        <Button type="primary" onClick={this.confirm}>confirm</Button>
      </Fragment>
    );
  }
}
