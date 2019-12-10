import React from "react"
import Link from "next/link"

interface IProps { }
interface IState { }

class IndexPage extends React.Component<IProps, IState>{
  public render(): JSX.Element {
    return (
      <div>
        <Link href="/">
          <a>首页</a>
        </Link>
      </div>
    )
  }
}

export default IndexPage
