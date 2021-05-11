import React, { ReactElement, Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import allRoutes, { RouterConfig } from './route_config';

export function parseRoutes(routes: RouterConfig[]) {
  if (!routes || !routes.length) return [];

  return (
    <CacheSwitch>
      {routes.map((route: RouterConfig, index: number) => {
        return (
          <CacheRoute
            // {...route}
            path={route.path}
            when="always"
            key={index}
            render={(props) =>
              React.createElement(
                route.component,
                Object.assign({}, props, {
                  route: route,
                })
              )
            }
          />
        );
      })}
    </CacheSwitch>
  );
}

export default function createRoutes(): any {
  class Routes extends Component {
    render() {
      return (
        <Fragment>
          {/* {Config.isBorwserHistory && <Redirect to="/" />} */}
          {parseRoutes(allRoutes)}
        </Fragment>
      );
    }
  }

  return Routes;
}
