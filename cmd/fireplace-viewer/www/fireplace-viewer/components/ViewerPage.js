import React, { Component } from "react";
import LogEntryService from "../services/LogEntryService";
import EntriesList from "./EntriesList";
import LogEntryDetails from "./LogEntryDetails";

export default class ViewerPage extends Component {
	constructor(props) {
		super(props);

		this.logEntryService = new LogEntryService();

		this.onShowDetails = this.onShowDetails.bind(this);
		this.handleDetailsOnClose = this.handleDetailsOnClose.bind(this);

		this.state = {
			entries: [],
			selectedEntry: undefined,
			detailsActive: false
		};
	}

	onShowDetails(entry) {
		this.setState({
			detailsActive: true,
			selectedEntry: entry
		});
	}

	handleDetailsOnClose() {
		this.setState({ detailsActive: false });
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
			<div>
				<LogEntryDetails active={this.state.detailsActive} selectedEntry={this.state.selectedEntry} onClose={this.handleDetailsOnClose} />
				<EntriesList entries={this.state.entries} onShowDetails={this.onShowDetails} />
			</div>
		);
	}
}

//ReactDOM.render(<ViewerPage />, document.getElementById("content"));