import PropTypes from "prop-types";

export const PagingPropType = PropTypes.exact({
	page: PropTypes.number.isRequired,
	totalCount: PropTypes.number.isRequired,
	pageSize: PropTypes.number.isRequired,
	refresh: PropTypes.bool
});