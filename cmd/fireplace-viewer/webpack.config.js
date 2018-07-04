var path = require("path");

module.exports = {
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			}
		]
	},
	entry: [
		path.resolve("./www/fireplace-viewer/components/ViewerPage")
	]
};
