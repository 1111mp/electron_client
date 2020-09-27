# electron-react

基于[`electron-react-boilerplate`](https://github.com/electron-react-boilerplate/electron-react-boilerplate)开发的一个[`electron`](https://github.com/electron/electron)初始化的项目

## 启动项目

```
cd electron-react
yarn
yarn dev
```

## 打包

```
yarn package
```

## debug

使用 vscode 的 debug 模式调试项目
选中`Electron: All`，然后点击`start debugging`启动

### 架构上做出调整

之前web是用的react的单页面架构，但是这样会有一个天然缺陷，就是在打开新弹窗的时候整个项目会重新初始化，项目中通过location.href去做代码差异化执行太繁琐，而且BrowserWindow的preload加载的js区分不开...所以经过思考，将单页调整为多页应用，后续弹窗之间的通信都经过主进程。
先弹窗之间的通信方案为：

1、多窗口之间数据的通信：所有的数据都在主页面appMain初始化（根据具体业务和需求初始化第一次打开项目所需的数据，并自行做优化），并将初始化好之后必要的数据通过渲染线程发送事件到主线程保存，挂载在global对象上，其他弹窗页面在打开自己通过执行的事件从主线程获取。
2、多窗口之间的交互通信：比如在新打开的弹窗A中需要在某个地方通知到主页面appMain执行对应的方法，此时，应该在主页面appMain往主线程注册一个事件，主线程保存，弹窗A在需要通知的时候告诉主线程，然后主线程直接通过executeJavaScript来调用主页面的暴露出来的全局方法，也就是jsbridge那一套东西。
