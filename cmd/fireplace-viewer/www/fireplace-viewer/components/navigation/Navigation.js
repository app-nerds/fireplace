import { NavLink } from "react-router-dom";
import React, { Component } from "react";

export default class Navigation extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<nav className="navbar navbar-default navbar-fixed-top">
				<div className="container-fluid">
					<div className="navbar-header">
						<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-navbar" aria-expanded="false">
							<span className="sr-only">Toggle navigation</span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
							<span className="icon-bar"></span>
						</button>
						<NavLink to="/" exact={true} className="navbar-brand">Fireplace</NavLink>
					</div>
					<div className="collapse navbar-collapse" id="main-navbar">
						<ul className="nav navbar-nav">
							<li><NavLink to="/" exact={true}>Logs</NavLink></li>
							<li><NavLink to="/clean">Clean</NavLink></li>
						</ul>
						<form className="navbar-form navbar-left">
							<div className="form-group">
								<input type="text" className="form-control" placeholder="Search" />
							</div>
						</form>
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