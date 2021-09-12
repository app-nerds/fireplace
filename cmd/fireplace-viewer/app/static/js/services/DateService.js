export function shortDateTime(value) {
	return dayjs(value).format("M/D/YY h:mm:ssa");
}

export function longDateTime(value) {
	return dayjs(value).format("MMM D YYYY hh:mm:ssa");
}
