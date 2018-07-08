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
			}
		]
	},
	entry: [
		"./www/fireplace-viewer/components/Index",
	],
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "www/fireplace-viewer/dist")
	}
};
