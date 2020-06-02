import * as React from 'react';
import { Component } from 'react';

type Props = {};

export default class Red extends Component<Props> {
  props: Props;

  render(): JSX.Element {
    return (
      <div>
        <h2>Red</h2>
      </div>
    );
  }
}
