# electron-client

基础架构基于[`electron-react-boilerplate`](https://github.com/electron-react-boilerplate/electron-react-boilerplate)，开发的一个[`electron`](https://github.com/electron/electron) IM 客户端项目

## 启动项目

```
cd electron-client
yarn
yarn start
```

## 打包

```
yarn package
```

## debug

使用 vscode 的 debug 模式调试项目
选中`Electron: All`，然后点击`start debugging`启动

### 问题
1、在electron 10+ 会存在 @journeyapps/sqlcipher 5.0.0版本 编译不通过的问题，可参考地址：[https://github.com/journeyapps/node-sqlcipher/issues/56](https://github.com/journeyapps/node-sqlcipher/issues/56)
开发环境有用，但是打包之后存在问题，目前等待该库的更新
目前使用electron 9.4.0版本 @journeyapps/sqlcipher 4.1.0版本

2、如果使用electron 11.x 版本，建议electron从 11.0.1升级到11.0.4，主要因为开启 asar 之后项目构建会出问题：[https://github.com/electron/electron/issues/26819](https://github.com/electron/electron/issues/26819)
