//import { connect } from "react-redux";
import { LogEntryMessage } from "./LogEntryMessage";
import { LogEntryStatusIcon } from "./LogEntryStatusIcon";
import PropTypes from "prop-types";
import React, { Component } from "react";

export class LogEntry extends Component {
	constructor(props) {
		super(props);
	}

	// componentWillReceiveProps(nextProps) {
	// 	this.setState({
	// 		log: nextProps.log
	// 	});
	// }

	render() {
		return (
			<tr>
				<td className="column-icon"><LogEntryStatusIcon log={this.props.log} /></td>
				<td className="column-message"><LogEntryMessage log={this.props.log} /></td>
			</tr>
		);
	}
}

// LogEntry.propTypes = {
// 	log: PropTypes.object
// };

//export default connect(state => state)(LogEntry);