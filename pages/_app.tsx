import App from "next/app"
import React from "react"
import { Store } from "../store"
import { Provider } from "mobx-react"
import "./app.css"

class MyMobxApp extends App {
  state = {
    store: new Store(),
  }

  // Fetching serialized(JSON) store state
  // static async getInitialProps(appContext) {
  //   const appProps = await App.getInitialProps(appContext)
  //   const initialStoreState = await fetchInitialStoreState()

  //   return {
  //     ...appProps,
  //     initialStoreState,
  //   }
  // }

  // Hydrate serialized state to store
  // static getDerivedStateFromProps(props, state) {
  // state.store.hydrate(props.initialStoreState)
  //   return state
  // }

  render() {
    const { Component, pageProps } = this.props
    return (
      <Provider store={this.state.store}>
        <Component {...pageProps} />
      </Provider>
    )
  }
}
export default MyMobxApp