class ViewerPage extends React.Component {
	constructor(props) {
		super(props);

		this.logEntryService = new LogEntryService();

		this.state = {
			entries: [],
			selectedEntry: undefined,
			detailsActive: false,
			page: 1,
			application: "All",
			level: "",
			searchTerm: ""
		};

		this.onRefresh = this.onRefresh.bind(this);
		this.onShowDetails = this.onShowDetails.bind(this);
		this.handleDetailsOnClose = this.handleDetailsOnClose.bind(this);
		this.onNextPage = this.onNextPage.bind(this);
		this.onPreviousPage = this.onPreviousPage.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.onApplicationSelect = this.onApplicationSelect.bind(this);
		this.onLevelSelect = this.onLevelSelect.bind(this);
		this.updateEntryState = this.updateEntryState.bind(this);
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

	handleDetailsOnClose() {
		this.setState({ detailsActive: false });
	}

	onRefresh() {
		this.logEntryService.refresh()
			.then(this.updateEntryState)
			.catch((err) => {
				console.log(err);
				alert(err);
			});
	}

	onShowDetails(entry) {
		this.setState({
			detailsActive: true,
			selectedEntry: entry
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

	componentDidMount() {
		this.logEntryService.getLogEntries()
			.then((entries) => {
				this.setState({ entries: entries });
			})
			.catch((err) => {
				alert(err);
				console.log(err);
			});
	}

	render() {
		return (
			<Grommet.App centered={false}>
				<Header
					showEntryManagement={true}
					onRefresh={this.onRefresh}
					onNextPage={this.onNextPage}
					onPreviousPage={this.onPreviousPage}
					onSearch={this.onSearch}
					onApplicationSelect={this.onApplicationSelect}
					onLevelSelect={this.onLevelSelect}
					application={this.state.application}
					level={this.state.level}
					page={this.state.page} />
				<Grommet.Box flex={true}>
					<LogEntryDetails active={this.state.detailsActive} selectedEntry={this.state.selectedEntry} onClose={this.handleDetailsOnClose} />
					<EntriesList entries={this.state.entries} onShowDetails={this.onShowDetails} />
				</Grommet.Box>
			</Grommet.App>
		);
	}
}

ReactDOM.render(<ViewerPage />, document.getElementById("content"));