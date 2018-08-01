import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import React, { Component } from "react";

export default class Navigation extends Component {
	constructor(props) {
		super(props);
	}

	// componentWillReceiveProps(nextProps) {
	// 	this.setState({
	// 		filter: nextProps.filter,
	// 		page: nextProps.page
	// 	});
	// }

	render() {
		return (
			<nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
				<Link to="/" className="navbar-brand">Fireplace</Link>
				<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#main-navbar" aria-controls="main-navbar" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="main-navbar">
					<ul className="navbar-nav mr-auto">
						<li className="nav-item">
							<Link to="/" className="navbar-brand">Logs</Link>
						</li>
						<li className="nav-item">
							<Link to="/clean" className="nav-link">Clean</Link>
						</li>
					</ul>

					<form className="form-inline">
						<div className="form-group">
							<input type="text" className="form-control" placeholder="Search" />
						</div>
					</form>

					<ul className="navbar-nav navbar-right">
						<li className="nav-item">
							<a href="javascript:void" className="nav-link"><i className="fas fa-caret-left fa-lg"></i></a>
						</li>
						<li className="nav-item">
							<a href="javascript:void" className="nav-link"><i className="fas fa-caret-right fa-lg"></i></a>
						</li>
						<li className="nav-item">
							<a href="javascript:void" className="nav-link"><i className="fas fa-filter fa-lg"></i></a>
						</li>
					</ul>
				</div>
			</nav >
		);
	}
}

// Navigation.propTypes = {
// 	filter: PropTypes.exact({
// 		application: PropTypes.string.isRequired,
// 		level: PropTypes.oneOf(["", "debug", "info", "warn", "error", "fatal", "panic"]),
// 		searchTerm: PropTypes.string.isRequired
// 	}),
// 	page: PropTypes.number.isRequired
// };