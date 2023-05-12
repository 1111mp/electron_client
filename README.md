# electron_client

基础架构基于[`electron-react-boilerplate`](https://github.com/electron-react-boilerplate/electron-react-boilerplate)，开发的一个[`electron`](https://github.com/electron/electron) IM 客户端项目

## 启动项目

```
cd electron_client
yarn install or npm install
yarn start or npm start
```

或者直接 `F5` 一键启动（Debug 模式）

## debug

使用 vscode 的 debug 模式调试项目
选中`Electron: All`，然后点击`start debugging`启动

或者直接 `F5` 一键启动（Debug 模式）

## 打包

```
yarn package
```

## 发布

```
yarn publish
yarn publish:full:win64 // Windows 全量包
yarn publish:full:mac   // MacOS全量包
yarn publish:asar:win64 // Windows 增量包
yarn publish:asar:win64 // MacOS 增量包
```

发布的代码在这个文件：[.erb/scripts/publish.ts](https://github.com/1111mp/electron_client/blob/master/.erb/scripts/publish.ts)

对应的后台发布服务的代码：[/api/v1/electron](https://github.com/1111mp/im_server/blob/nestjs/src/api/electron/electron.controller.ts)

### 补充

启动项目之后默认打开登录窗口，需要点击注册登录之后才能进入主界面。
需要本地启动后台服务器：[im_server](https://github.com/1111mp/im_server)

### 问题

1、如果使用 electron 11.x 版本，建议 electron 从 11.0.1 升级到 11.0.4，主要因为开启 asar 之后项目构建会出问题：[https://github.com/electron/electron/issues/26819](https://github.com/electron/electron/issues/26819)
