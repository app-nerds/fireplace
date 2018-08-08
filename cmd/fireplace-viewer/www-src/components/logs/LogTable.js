import { LogEntry } from "./LogEntry";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { LogEntryService } from "../../services/LogEntryService";
import { deepEqual } from "fast-equals";
import { FilterPropType } from "../../propTypes/FilterPropType";
import { PagingPropType } from "../../propTypes/PagingPropType";
import { DetailsPropType } from "../../propTypes/DetailsPropType";

export class LogTable extends Component {
	constructor(props) {
		super(props);
		this.logEntryService = new LogEntryService();

		this.onSelectDetails = this.onSelectDetails.bind(this);

		this.state = {
			logs: []
		};
	}

	getLogEntries(paging, filter) {
		this.logEntryService.getLogEntries(paging, filter)
			.then((result) => {
				this.setState({
					logs: result.logs
				});

				this.props.updatePaging({
					...paging,
					totalCount: result.totalCount,
					pageSize: result.pageSize
				});
			});
	}

	componentWillReceiveProps(nextProps) {
		if (!deepEqual(this.props, nextProps)) {
			this.getLogEntries(nextProps.paging, nextProps.filter);
			// TODO: Figure out how to scroll table back to top
		}
	}

	componentWillMount() {
		this.getLogEntries(this.props.paging, this.props.filter);
	}

	onSelectDetails(log) {
		this.props.updateDetails({
			visible: true,
			logEntry: log
		});
	}

	render() {
		return (
			<div>
				<table className="table table-header">
					<thead className="thead-dark">
						<tr>
							<th className="column-icon" scope="col">Level</th>
							<th className="column-application" scope="col">Application</th>
							<th className="column-message" scope="col">Message</th>
							<th className="column-date" scope="col">Date</th>
						</tr>
					</thead>
				</table>
				<table className="table table-striped table-log-entries" id="logEntries">
					<tbody>
						{this.state.logs.length <= 0 && <tr><td colSpan="4">No log entries to display</td></tr>}
						{this.state.logs.length > 0 && this.state.logs.map((log) => {
							return (
								<LogEntry log={log} key={log.id} onSelectDetails={this.onSelectDetails} />
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
}

LogTable.propTypes = {
	details: DetailsPropType,
	filter: FilterPropType,
	paging: PagingPropType,
	updateDetails: PropTypes.func,
	updatePaging: PropTypes.func
};
