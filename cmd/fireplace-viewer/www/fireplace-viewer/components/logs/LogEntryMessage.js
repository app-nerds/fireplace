import PropTypes from "prop-types";
import React, { Component } from "react";

export class LogEntryMessage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			log: props.log
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			log: nextProps.log
		});
	}

	render() {
		return <p className="log-message">{this.state.log.message}</p>;
	}
}

// LogEntryMessage.propTypes = {
// 	log: PropTypes.object
// };