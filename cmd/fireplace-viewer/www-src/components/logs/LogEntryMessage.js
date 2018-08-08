import PropTypes from "prop-types";
import React, { Component } from "react";

export class LogEntryMessage extends Component {
	constructor(props) {
		super(props);

		this.onSelectDetails = this.onSelectDetails.bind(this);
	}

	onSelectDetails(e) {
		e.preventDefault();
		this.props.onSelectDetails(this.props.log);
	}

	render() {
		return (
			<p className="log-message">
				{this.props.log.details.length > 0 && (
					<a className="pointer link" onClick={this.onSelectDetails}>{this.props.log.message}</a>
				)}
				{this.props.log.details.length <= 0 && this.props.log.message}
			</p>
		);
	}
}

LogEntryMessage.propTypes = {
	log: PropTypes.object,
	onSelectDetails: PropTypes.func
};