import { connect } from "react-redux";
import { LogEntry } from "./LogEntry";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { setLogs } from "../../actions/logs";
import { setFilter } from "../../actions/filter";
import { LogEntryService } from "../../services/LogEntryService";

class LogTable extends Component {
	constructor(props) {
		super(props);

		this.logEntryService = new LogEntryService();
	}

	// componentWillReceiveProps(nextProps) {
	// 	this.setState({
	// 		filter: nextProps.filter,
	// 		page: nextProps.page,
	// 	});
	// }

	componentWillMount() {
		const { page } = this.props.pageReducer;
		const { filter } = this.props.filterReducer;

		this.logEntryService.getLogEntries(page, filter)
			.then((result) => {
				// TODO: Set total count and pagesize
				this.props.dispatch(setLogs(result.logs));
			});
	}

	render() {
		const { logs } = this.props.logsReducer;

		return (
			<table className="table table-striped">
				<tbody>
					{logs.length <= 0 && <tr><td colSpan="3">No log entries to display</td></tr>}
					{logs.length > 0 && logs.map((log) => {
						return (
							<LogEntry log={log} key={log.id} />
						);
					})}
				</tbody>
			</table>
		);
	}
}

// LogTable.propTypes = {
// 	filter: PropTypes.exact({
// 		application: PropTypes.string.isRequired,
// 		level: PropTypes.oneOf(["", "debug", "info", "warn", "error", "fatal", "panic"]),
// 		searchTerm: PropTypes.string.isRequired
// 	}),
// 	page: PropTypes.number.isRequired
// };

export default connect(state => state)(LogTable);