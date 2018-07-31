import Main from "./main/Main";
import Navigation from "./navigation/Navigation";
import React, { Component } from "react";

export default class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			page: 1,
			filter: {
				application: "All",
				level: "",
				searchTerm: ""
			}
		};
	}

	render() {
		return (
			<div className="app">
				<Navigation />
				<Main />
			</div>
		);
	}
}