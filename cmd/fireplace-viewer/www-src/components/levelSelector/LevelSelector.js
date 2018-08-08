import PropTypes from "prop-types";
import React, { Component } from "react";
import { FilterPropType } from "../../propTypes/FilterPropType";

export class LevelSelector extends Component {
	constructor(props) {
		super(props);

		this.onSelect = this.onSelect.bind(this);

		this.state = {
			levels: [
				{ value: "", display: "All" },
				{ value: "debug", display: "Debug" },
				{ value: "info", display: "Information" },
				{ value: "warn", display: "Warning" },
				{ value: "error", display: "Error" },
				{ value: "fatal", display: "Fatal" },
				{ value: "panic", display: "Panic" }
			]
		};
	}

	onSelect(e) {
		let value = e.target.value;
		this.props.updateFilter({
			...this.props.filter,
			level: value
		});
	}

	render() {
		return (
			<select className="form-control" onChange={this.onSelect} id="level" value={this.props.filter.level}>
				{this.state.levels.length > 0 && this.state.levels.map((level) => {
					return <option key={level.value} value={level.value}>{level.display}</option>
				})}
			</select>
		);
	}
}

LevelSelector.propTypes = {
	filter: FilterPropType,
	updateFilter: PropTypes.func
};