import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { LogEntryService } from "../../services/LogEntryService";
import { SearchBox } from "../../components/searchbox/SearchBox";

export class Navigation extends Component {
	constructor(props) {
		super(props);

		this.onNextPage = this.onNextPage.bind(this);
		this.onPreviousPage = this.onPreviousPage.bind(this);
		this.onFirstPage = this.onFirstPage.bind(this);
		this.onLastPage = this.onLastPage.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.showFilter = this.showFilter.bind(this);

		this.logEntryService = new LogEntryService();
	}

	onNextPage() {
		if (this.logEntryService.hasNextPage(this.props.paging)) {
			this.props.updatePaging({
				...this.props.paging,
				page: this.props.paging.page + 1
			});
		}
	}

	onPreviousPage() {
		if (this.logEntryService.hasPreviousPage(this.props.paging)) {
			this.props.updatePaging({
				...this.props.paging,
				page: this.props.paging.page - 1
			});
		}
	}

	onFirstPage() {
		this.props.updatePaging({
			...this.props.paging,
			page: 1
		});
	}

	onLastPage() {
		let lastPage = this.logEntryService.getLastPage(this.props.paging);
		this.props.updatePaging({
			...this.props.paging,
			page: lastPage
		});
	}

	onSearch(searchTerm) {
		this.props.updateFilter({
			...this.props.filter,
			searchTerm: searchTerm
		});
	}

	showFilter() {
		this.props.updateFilter({
			...this.props.filter,
			visible: true
		});
	}

	render() {
		const lastPage = this.logEntryService.getLastPage(this.props.paging);

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
							<SearchBox value="" onChange={this.onSearch} />
						</div>
					</form>

					<ul className="navbar-nav navbar-right">
						<li className="nav-item">
							<a className="nav-link" onClick={this.onFirstPage}><i className="fas fa-fast-backward fa-lg"></i></a>
						</li>
						<li className="nav-item">
							<a className="nav-link" onClick={this.onPreviousPage}><i className="fas fa-caret-left fa-lg"></i></a>
						</li>
						<li className="nav-item">
							<div className="page-number">{this.props.paging.page} of {lastPage}</div>
						</li>
						<li className="nav-item">
							<a className="nav-link" onClick={this.onNextPage}><i className="fas fa-caret-right fa-lg"></i></a>
						</li>
						<li className="nav-item">
							<a className="nav-link" onClick={this.onLastPage}><i className="fas fa-fast-forward fa-lg"></i></a>
						</li>
						<li className="nav-item">
							<a className="nav-link" onClick={this.showFilter}><i className="fas fa-filter fa-lg"></i></a>
						</li>
					</ul>
				</div>
			</nav >
		);
	}
}

Navigation.propTypes = {
	filter: PropTypes.exact({
		application: PropTypes.string.isRequired,
		level: PropTypes.oneOf(["", "debug", "info", "warn", "error", "fatal", "panic"]),
		searchTerm: PropTypes.string.isRequired,
		visible: PropTypes.bool.isRequired
	}),
	paging: PropTypes.exact({
		page: PropTypes.number.isRequired,
		totalCount: PropTypes.number.isRequired,
		pageSize: PropTypes.number.isRequired
	}),
	updateFilter: PropTypes.func,
	updatePaging: PropTypes.func
};