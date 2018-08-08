import PropTypes from "prop-types";
import React, { Component } from "react";

const WAIT_INTERVAL = 1000;
const ENTER_KEY = 13;

export class SearchBox extends Component {
	constructor(props) {
		super(props);

		this.onChange = this.onChange.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.triggerChange = this.triggerChange.bind(this);

		this.state = {
			value: props.value
		};
	}

	componentWillMount() {
		this.timer = null;
	}

	onChange(e) {
		clearTimeout(this.timer);
		this.setState({
			value: e.target.value
		});
		this.timer = setTimeout(this.triggerChange, WAIT_INTERVAL);
	}

	onKeyDown(e) {
		if (e.keyCode === ENTER_KEY) {
			e.preventDefault();
			this.triggerChange();
		}
	}

	triggerChange() {
		const value = this.state.value;
		this.props.onChange(value);
	}

	render() {
		return (
			<input
				type="text"
				className="form-control"
				placeholder="Search"
				onChange={this.onChange}
				onKeyDown={this.onKeyDown}
				value={this.state.value} />
		);
	}
}

SearchBox.propTypes = {
	onChange: PropTypes.func,
	value: PropTypes.string.isRequired
};