import React, { Component } from "react";
import PropTypes from "prop-types";

export class DateTimeSpan extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return <span>{moment(this.props.date).format("YYYY-MM-DD hh:mm:ss A")}</span>;
	}
}

DateTimeSpan.propTypes = {
	date: PropTypes.any.isRequired
};