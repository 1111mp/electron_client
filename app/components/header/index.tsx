import * as React from 'react';
import { Component, Fragment } from 'react';

const styles = require('./header.scss');

type Props = {};

export default class AppHeader extends Component<Props> {
  props: Props;

  render(): JSX.Element {
    return (
      <Fragment>
        <h2 className={styles.h2}>Header</h2>
      </Fragment>
    );
  }
}
