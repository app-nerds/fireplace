import PropTypes from "prop-types";
import React, { Component } from "react";

export class LogEntryApplication extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return <p className="log-application">{this.props.log.application}</p>;
	}
}

LogEntryApplication.propTypes = {
	log: PropTypes.object
};