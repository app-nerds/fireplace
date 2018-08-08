import PropTypes from "prop-types";
import React, { Component } from "react";
import { FilterPropType } from "../../propTypes/FilterPropType";
import { ApplicationNameService } from "../../services/ApplicationNameService";
import { deepEqual } from "fast-equals";

export class ApplicationSelector extends Component {
	constructor(props) {
		super(props);

		this.onSelect = this.onSelect.bind(this);

		this.state = {
			applicationNames: []
		};

		this.applicationNameService = new ApplicationNameService();
	}

	componentWillMount() {
		this.getApplicationNames();
	}

	getApplicationNames() {
		this.applicationNameService.get()
			.then((applicationNames) => {
				this.setState({
					applicationNames: applicationNames
				});
			})
			.catch((err) => {
				console.log(err);
				alert("Error getting application names!");
			});
	}

	onSelect(e) {
		let value = e.target.value;
		this.props.updateFilter({
			...this.props.filter,
			application: value
		});
	}

	render() {
		return (
			<select className="form-control" onChange={this.onSelect} id="application" value={this.props.filter.application}>
				{this.state.applicationNames.length > 0 && this.state.applicationNames.map((applicationName) => {
					return <option key={applicationName} value={applicationName}>{applicationName}</option>
				})}
			</select>
		);
	}
}

ApplicationSelector.propTypes = {
	filter: FilterPropType,
	updateFilter: PropTypes.func
};