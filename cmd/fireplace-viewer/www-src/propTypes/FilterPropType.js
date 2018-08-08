import PropTypes from "prop-types";

export const FilterPropType = PropTypes.exact({
	application: PropTypes.string.isRequired,
	level: PropTypes.oneOf(["", "debug", "info", "warn", "error", "fatal", "panic"]),
	searchTerm: PropTypes.string.isRequired,
	visible: PropTypes.bool.isRequired
});