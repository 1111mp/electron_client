import React from "react"
// import Link from "next/link"
import Head from "next/head"
import { inject, observer } from "mobx-react"
import Events from 'renderer/header-event.js';
import '../styles/index.scss'

const { winMin, winMax, winClose, funcNotOpen } = Events;

interface IStore {
  lastUpdate: any;
}
interface IProps {
  store: IStore;
}
interface IState { }

@inject('store')
@observer
class IndexPage extends React.Component<IProps, IState>{
  public state = {
    count: 1
  }

  clickHandle(str: string): void {
    // const { ipcRenderer } = window.electron
    // ipcRenderer.send('func-not-open-dialog')

    switch (str) {
      case 'min':
        winMin();
        return;
      case 'max':
        winMax();
        return;
      case 'close':
        winClose();
        return;
      case 'notOPen':
        funcNotOpen();
        return;
    }
  }

  public render(): JSX.Element {
    return (
      <div>
        <Head>
          <title>project</title>
          <meta charSet='utf-8' />
          <link rel="icon" href="/static/favicon.ico" />
          {/* <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />  */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <h1>Testing Next.js App written in TypeScript</h1>
        <h2>{this.props.store.lastUpdate}</h2>
        {/* <Link href="/login">
          <a>登录</a>
        </Link> */}
        <p onClick={this.clickHandle.bind(this, 'notOPen')}>测试</p>
      </div>
    )
  }
}

export default IndexPage
