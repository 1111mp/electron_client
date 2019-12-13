import * as React from 'react';
import { Component } from 'react';

type Props = {};

export default class Header extends Component<Props> {
  props: Props;

  render(): JSX.Element {
    return (
      <div>
        <h2>Header</h2>
      </div>
    );
  }
}
