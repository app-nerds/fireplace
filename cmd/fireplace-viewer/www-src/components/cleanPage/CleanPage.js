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
			date: moment(),
			message: ""
		};

		this.logEntryService = new LogEntryService();
	}

	componentDidMount() {
		$("#successModal").modal({
			show: false
		});
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
				this.setState({
					message: result
				}, () => {
					$("#successModal").modal("show");
				});

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
					prior to and on this date will be deleted.
				</div>

				<form>
					<div className="form-group">
						<label htmlFor="date">Date</label>
						<DatePicker id="date" selected={this.state.date} onChange={this.onDateChange} />
					</div>

					<button type="button" className="btn btn-danger" onClick={this.onDeleteClick}>Delete</button>
				</form>

				<div className="modal fade" id="successModal" tabIndex="-1" role="dialog" aria-hidden="true">
					<div className="modal-dialog modal-dialog-centered" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Success!</h5>
								<button type="button" className="close" data-dismiss="modal" aria-label="close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>

							<div className="modal-body">
								<p>{this.state.message}</p>
							</div>

							<div className="modal-footer">
								<button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
							</div>
						</div>
					</div>
				</div>

			</div>
		);
	}
}

CleanPage.propTypes = {
	paging: PagingPropType,
	updatePaging: PropTypes.func
};