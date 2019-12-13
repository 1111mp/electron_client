import * as React from 'react';
import { Component } from 'react';
import { Button } from 'antd';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render(): JSX.Element {
    return (
      <div>
        <h2>Home</h2>
        <Button type="primary">Primary</Button>
      </div>
    );
  }
}
