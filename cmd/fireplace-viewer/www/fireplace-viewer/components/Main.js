import App from "grommet/components/App";
import Box from "grommet/components/Box";
import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import LogEntryService from "../services/LogEntryService";
import AppHeader from "./AppHeader";
import ViewerPage from "./ViewerPage";

export default class Main extends Component {
	constructor(props) {
		super(props);

		this.logEntryService = new LogEntryService();

		this.state = {
			// entries: [],
			// selectedEntry: undefined,
			// detailsActive: false,
			page: 1,
			application: "All",
			level: "",
			searchTerm: "",
			showEntryManagement: true
		};

		this.onRefresh = this.onRefresh.bind(this);
		this.onNextPage = this.onNextPage.bind(this);
		this.onPreviousPage = this.onPreviousPage.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.onApplicationSelect = this.onApplicationSelect.bind(this);
		this.onLevelSelect = this.onLevelSelect.bind(this);
		this.updateEntryState = this.updateEntryState.bind(this);
	}

	onRefresh() {
		this.logEntryService.refresh()
			.then(this.updateEntryState)
			.catch((err) => {
				console.log(err);
				alert(err);
			});
	}

	onNextPage() {
		if (this.logEntryService.hasNextPage()) {
			this.logEntryService.nextPage()
				.then(this.updateEntryState)
				.catch((err) => {
					console.log(err);
					alert(err);
				});
		}
	}

	onPreviousPage() {
		if (this.logEntryService.hasPreviousPage()) {
			this.logEntryService.previousPage()
				.then(this.updateEntryState)
				.catch((err) => {
					console.log(err);
					alert(err);
				});
		}
	}

	onSearch(e) {
		e.preventDefault();

		this.logEntryService.filterBySearch(e.target.value)
			.then(this.updateEntryState)
			.then(() => { this.setState({ searchTerm: e.target.value }) })
			.catch((err) => {
				console.log(err);
				alert(err);
			});
	}

	onApplicationSelect(applicationName) {
		this.logEntryService.filterByApplication(applicationName)
			.then(this.updateEntryState)
			.then(() => { this.setState({ application: applicationName }); })
			.catch((err) => {
				console.log(err);
				alert(err);
			});
	}

	onLevelSelect(level) {
		this.logEntryService.filterByLevel(level)
			.then(this.updateEntryState)
			.then(() => { this.setState({ level: level }); })
			.catch((err) => {
				console.log(err);
				alert(err);
			});
	}

	updateEntryState(entries) {
		return new Promise((resolve) => {
			this.setState({
				entries: entries,
				page: this.logEntryService.getPage()
			}, () => {
				return resolve();
			});
		});
	}

	render() {
		return (
			<HashRouter>
				<App centered={false}>
					<AppHeader
						showEntryManagement={this.state.showEntryManagement}
						onRefresh={this.onRefresh}
						onNextPage={this.onNextPage}
						onPreviousPage={this.onPreviousPage}
						onSearch={this.onSearch}
						onApplicationSelect={this.onApplicationSelect}
						onLevelSelect={this.onLevelSelect}
						application={this.state.application}
						level={this.state.level}
						page={this.state.page} />
					<Box flex={true}>
						<div className="content">
							<Route exact path="/" component={ViewerPage} />
						</div>
					</Box>
				</App>
			</HashRouter>
		);
	}
}