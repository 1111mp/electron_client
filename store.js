import { action, observable } from 'mobx'
import { useStaticRendering } from 'mobx-react'

const isServer = typeof window === 'undefined'
useStaticRendering(isServer)

export class Store {
  @observable lastUpdate = 0
  @observable light = false

  // hydrate(serializedStore) {
  //   this.lastUpdate =
  //     serializedStore.lastUpdate != null
  //       ? serializedStore.lastUpdate
  //       : Date.now()
  //   this.light = !!serializedStore.light
  // }
}

// export async function fetchInitialStoreState() {
//   // You can do anything to fetch initial store state
//   return {}
// }