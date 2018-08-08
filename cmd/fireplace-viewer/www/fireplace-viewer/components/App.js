import { Main } from "./main/Main";
import { Navigation } from "./navigation/Navigation";
import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";

export class App extends Component {
	constructor(props) {
		super(props);

		this.updateDetailsModal = this.updateDetailsModal.bind(this);
		this.updatePaging = this.updatePaging.bind(this);
		this.updateFilter = this.updateFilter.bind(this);

		this.state = {
			filter: {
				application: "All",
				level: "",
				searchTerm: "",
				visible: false
			},
			paging: {
				page: 1,
				totalCount: 0,
				pageSize: 0
			},
			detailsModal: {
				visible: false,
				logEntry: null
			}
		};
	}

	updateDetailsModal(newDetails) {
		this.setState({
			detailsModal: newDetails
		});
	}

	updateFilter(newFilter) {
		console.log(newFilter);
		this.setState({
			filter: newFilter
		});
	}

	updatePaging(newPaging) {
		this.setState({
			paging: newPaging
		});
	}

	render() {
		return (
			<div className="app">
				<Navigation filter={this.state.filter} paging={this.state.paging} updatePaging={this.updatePaging} updateFilter={this.updateFilter} />
				<Switch>
					<Route exact={true} path="/" render={() =>
						<Main
							details={this.state.detailsModal}
							filter={this.state.filter}
							paging={this.state.paging}
							updateDetails={this.updateDetailsModal}
							updatePaging={this.updatePaging}
							updateFilter={this.updateFilter}
							updateDetailsModal={this.updateDetailsModal} />
					} />
				</Switch>
			</div>
		);
	}
}
