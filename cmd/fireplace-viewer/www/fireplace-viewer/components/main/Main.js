import { connect } from "react-redux";
import PropTypes from "prop-types";
import React, { Component } from "react";
import LogTable from "../../components/logs/LogTable";

class Main extends Component {
	constructor(props) {
		super(props);
	}

	// componentWillReceiveProps(nextProps) {
	// 	this.setState({
	// 		filter: nextProps.filter,
	// 		page: nextProps.page,
	// 	});
	// }

	render() {
		return (
			<div className="container-fluid">
				<LogTable />
			</div>
		);
	}
}

// Main.propTypes = {
// 	filter: PropTypes.exact({
// 		application: PropTypes.string.isRequired,
// 		level: PropTypes.oneOf(["", "debug", "info", "warn", "error", "fatal", "panic"]),
// 		searchTerm: PropTypes.string.isRequired
// 	}),
// 	page: PropTypes.number.isRequired
// }

export default connect(state => state)(Main);