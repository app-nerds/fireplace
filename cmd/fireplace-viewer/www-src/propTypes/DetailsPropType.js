import PropTypes from "prop-types";

export const DetailsPropType = PropTypes.exact({
	visible: PropTypes.bool.isRequired,
	logEntry: PropTypes.object
});