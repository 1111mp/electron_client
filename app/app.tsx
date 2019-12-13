import * as React from 'react';
import { Component } from 'react';
import { renderRoutes } from "react-router-config";

type Props = {
  route: any
};

export default class App extends Component<Props> {
  props: Props;

  render(): JSX.Element {
    const { route } = this.props;
    return (
      <div>
        <h1>app</h1>
        {/* child routes won't render without this */}
        {renderRoutes(route.routes)}
      </div>
    );
  }
}
