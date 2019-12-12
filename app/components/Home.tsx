import * as React from 'react';
import { Component } from 'react';
const styles = require('./Home.css');

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Homes</h2>
      </div>
    );
  }
}
