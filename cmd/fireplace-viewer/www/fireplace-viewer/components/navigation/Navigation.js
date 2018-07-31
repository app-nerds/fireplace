import { NavLink } from "react-router-dom";
import React, { Component } from "react";

export default class Navigation extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
				<NavLink to="/" exact={true} className="navbar-brand">Fireplace</NavLink>
				<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#main-navbar" aria-controls="main-navbar" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="main-navbar">
					<ul className="navbar-nav mr-auto">
						<li className="nav-item">
							<NavLink to="/" exact={true}>Logs</NavLink>
						</li>
						<li className="nav-item">
							<NavLink to="/clean">Clean</NavLink>
						</li>
					</ul>

					<form className="form-inline">
						<div className="form-group">
							<input type="text" className="form-control" placeholder="Search" />
						</div>
					</form>

					<ul className="navbar-nav navbar-right">
						<li className="nav-item">
							<button
					</ul>
				</div>


						<div className="container-fluid">
							<div className="collapse navbar-collapse" id="main-navbar">
								<ul className="nav navbar-nav navbar-right">
									<li><button type="button" className="btn btn-default navbar-btn"><span className="glyphicon glyphicon-triangle-left" aria-label="Previous page"></span></button></li>
									<li><button type="button" className="btn btn-default navbar-btn"><span className="glyphicon glyphicon-triangle-right" aria-label="Next page"></span></button></li>
									<li><button type="button" className="btn btn-default navbar-btn"><span className="glyphicon glyphicon-filter" aria-label="Filter"></span></button></li>
								</ul>
							</div>
						</div>
			</nav>
					);
				}
}