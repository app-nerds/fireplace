export class FormatDateTime extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return <span>{moment(this.props.date).format("YYYY-MM-DD hh:mm:ss A")}</span>;
	}
}

//window.FormatDateTime = FormatDateTime;