import React from 'react';
import { MobXProviderContext, useObserver } from 'mobx-react';

export function useStores() {
  return React.useContext(MobXProviderContext);
}

export function useTargetStore(target: string) {
  const store = useStores();

  return target ? store[target] : store;
}

export function inject(selector: Function, baseComponent: React.FC): React.FC {
  const component = (ownProps: IAnyObject) => {
    const store = React.useContext(MobXProviderContext);
    return useObserver(() => baseComponent(selector({ store, ownProps })));
  };
  component.displayName = baseComponent.name;
  return component;
}
