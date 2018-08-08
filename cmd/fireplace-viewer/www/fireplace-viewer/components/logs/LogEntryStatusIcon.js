import PropTypes from "prop-types";
import React, { Component } from "react";

export class LogEntryStatusIcon extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		let statusIcon = "fas ";

		switch (this.props.log.level) {
			case "panic":
			case "fatal":
			case "error":
				statusIcon += "fa-exclamation-circle icon-error-status";
				break;

			case "warning":
				statusIcon += "fa-hand-paper icon-warning-status";
				break;

			case "debug":
				statusIcon += "fa-bug icon-debug-status";
				break;

			default:
				statusIcon += "fa-check-circle icon-info-status";
				break;
		}

		return (
			<i className={statusIcon}></i>
		);
	}
}

LogEntryStatusIcon.propTypes = {
	log: PropTypes.object
};