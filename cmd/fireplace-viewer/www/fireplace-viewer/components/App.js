import { connect } from "react-redux";
import Main from "./main/Main";
import Navigation from "./navigation/Navigation";
import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";

class App extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { filter } = this.props.filterReducer;
		const { page } = this.props.pageReducer;

		return (
			<div className="app">
				<Navigation filter={filter} page={page} />
				<Switch>
					<Route exact={true} path="/" component={Main} />
				</Switch>
			</div>
		);
	}
}

export default connect(state => state)(App);