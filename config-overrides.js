const { override, fixBabelImports, addWebpackAlias, removeModuleScopePlugin, setWebpackTarget } = require('customize-cra');
const path = require('path');

module.exports = override(
	removeModuleScopePlugin(),
	fixBabelImports('import', {
		libraryName: 'antd',
		libraryDirectory: 'es',
		style: 'css',
	}),
	addWebpackAlias({
		["@"]: path.resolve(__dirname, "./src"),
		["renderer"]: path.resolve(__dirname, "./renderer-process")
	}),
	setWebpackTarget('electron-renderer')
)