export class Paging extends React.Component {
	constructor(props) {
		super(props);

		this.onPreviousPage = this.onPreviousPage.bind(this);
		this.onNextPage = this.onNextPage.bind(this);

		this.state = {
			page: props.page
		};
	}

	onPreviousPage(e) {
		e.preventDefault();
		this.props.onPreviousPage();
	}

	onNextPage(e) {
		e.preventDefault();
		this.props.onNextPage();
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			page: nextProps.page
		});
	}

	render() {
		return (
			<span>
				<Grommet.Button icon={<Grommet.CaretPreviousIcon onClick={this.onPreviousPage} />} />
				<Grommet.Label>{this.state.page}</Grommet.Label>
				<Grommet.Button icon={<Grommet.CaretNextIcon onClick={this.onNextPage} />} />
			</span>
		);
	}
}

//window.Paging = Paging;