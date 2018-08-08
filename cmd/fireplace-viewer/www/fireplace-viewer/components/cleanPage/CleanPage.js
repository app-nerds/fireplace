import PropTypes from "prop-types";
import React, { Component } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import { LogEntryService } from "../../services/LogEntryService";
import { PagingPropType } from "../../propTypes/PagingPropType";

import "react-datepicker/dist/react-datepicker.css";

export class CleanPage extends Component {
	constructor(props) {
		super(props);

		this.onDateChange = this.onDateChange.bind(this);
		this.onDeleteClick = this.onDeleteClick.bind(this);

		this.state = {
			date: moment()
		};

		this.logEntryService = new LogEntryService();
	}

	onDateChange(date) {
		this.setState({
			date: date
		});
	}

	onDeleteClick(e) {
		e.preventDefault();
		this.logEntryService.delete(this.state.date)
			.then((result) => {
				alert(result);
				this.props.updatePaging({
					...this.props.paging,
					page: 1
				});
			})
			.catch((err) => {
				console.log(err);
				alert("Error deleting log entries");
			});
	}

	render() {
		return (
			<div className="container-fluid">
				<div className="alert alert-primary" role="alert">
					Select a date using the date selector below. All log entries
					prior to this date will be deleted.
				</div>

				<form>
					<div className="form-group">
						<label htmlFor="date">Date</label>
						<DatePicker id="date" selected={this.state.date} onChange={this.onDateChange} />
					</div>

					<button type="button" className="btn btn-danger" onClick={this.onDeleteClick}>Delete</button>
				</form>
			</div>
		);
	}
}

CleanPage.propTypes = {
	paging: PagingPropType,
	updatePaging: PropTypes.func
};