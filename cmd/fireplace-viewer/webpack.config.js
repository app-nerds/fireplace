var path = require("path");
var rootDir = path.join(__dirname, "app");

const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
	entry: [
		path.join(rootDir, "index.js")
	],
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "www/fireplace-viewer/js")
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["es2015"]
					}
				}
			},
			{
				test: /\.vue$/,
				use: {
					loader: "vue-loader"
				}
			},
			{
				test: /\.css$/,
				use: [
					"vue-style-loader",
					"css-loader"
				]
			}
		]
	},
	plugins: [
		new VueLoaderPlugin()
	],
	resolve: {
		extensions: [".js", ".vue"],
		alias: {
			"vue$": "vue/dist/vue.esm.js"
		}
	},
	watch: true
};
