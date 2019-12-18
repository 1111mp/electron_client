import * as React from 'react';
import { ReactElement, Component, Fragment } from 'react';
import { Route, Redirect } from 'react-router-dom';
import allRoutes, { RouterConfig } from './routeConfig';
import Config from 'app/config';

export function parseRoutes(routes: RouterConfig[]): ReactElement[] {
  if (!routes || !routes.length) return [];

  return routes.map((route: RouterConfig, index: number) => {
    return <Route {...route} key={`${index}_${new Date().getTime()}`} />
  });
}

export default function createRoutes() {
  class Routes extends Component {
    render() {
      return (
        <Fragment>
          {Config.isBorwserHistory && <Redirect to="/" />}
          {parseRoutes(allRoutes)}
        </Fragment>
      )
    }
  }

  return Routes;
}
