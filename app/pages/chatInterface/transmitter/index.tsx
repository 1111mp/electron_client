import React, { Component } from 'react';

const styles = require('./styles.scss');

export default class Transmitter extends Component<IAnyObject> {
  render() {
    return (
      <div className={styles.container}>
        <ul className={styles.actions_container}>
          <li>emoji</li>
          <li>files</li>
        </ul>
      </div>
    );
  }
}
