import { LogEntryApplication } from "./LogEntryApplication";
import { LogEntryMessage } from "./LogEntryMessage";
import { LogEntryStatusIcon } from "./LogEntryStatusIcon";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { DateTimeSpan } from "../dateTimeSpan/DateTimeSpan";

export class LogEntry extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<tr>
				<td className="column-icon" scope="row"><LogEntryStatusIcon log={this.props.log} /></td>
				<td className="column-appliation"><LogEntryApplication log={this.props.log} /></td>
				<td className="column-message"><LogEntryMessage log={this.props.log} onSelectDetails={this.props.onSelectDetails} /></td>
				<td className="column-date"><DateTimeSpan date={this.props.log.time} /></td>
			</tr>
		);
	}
}

LogEntry.propTypes = {
	log: PropTypes.object,
	onSelectDetails: PropTypes.func
};

