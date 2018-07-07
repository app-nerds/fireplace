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
	entry: {
		ViewerPage: "./www/fireplace-viewer/components/ViewerPage",
		DeleteOldEntriesPage: "./www/fireplace-viewer/components/DeleteOldEntriesPage"
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "www/fireplace-viewer/dist")
	}
};
