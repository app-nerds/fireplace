var path = require("path");

module.exports = {
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["es2015", "react"]
					}
				}
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			}
		]
	},
	entry: [
		"./www/fireplace-viewer/index.js",
	],
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "www/fireplace-viewer/dist")
	}
};
