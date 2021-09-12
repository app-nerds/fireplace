export const EVENT_PAGE_CHANGE = "page-change";
export const EVENT_SET_SEARCH_CRITERIA = "set-search-criteria";
export const EVENT_UPDATE_INFORMATION = "update-information";
export const EVENT_LOG_ENTRY_CLICK = "log-entry-click";

/******************************************************************************
 * Dispatchers
 *****************************************************************************/

export function dispatchLogEntryClick(id, logEntries) {
	let logEntry = logEntries.find((l) => l.id === id);

	if (!logEntry) {
		throw new Error(`cannot find log entry ${id}`);
	}

	window.dispatchEvent(
		new CustomEvent(EVENT_LOG_ENTRY_CLICK, {
			detail: logEntry,
		})
	);
}

export function dispatchPageChange(page) {
	window.dispatchEvent(
		new CustomEvent(EVENT_PAGE_CHANGE, {
			detail: parseInt(page),
		})
	);
}

export function dispatchUpdateInformation(pageSize, totalCount, count) {
	window.dispatchEvent(
		new CustomEvent(EVENT_UPDATE_INFORMATION, {
			detail: {
				totalCount: totalCount,
				count: count,
				pageSize: pageSize,
			},
		})
	);
}

export function dispatchSetSearchCriteria(level, search, application) {
	window.dispatchEvent(
		new CustomEvent(EVENT_SET_SEARCH_CRITERIA, {
			detail: {
				level: level,
				search: search,
				application: application,
			},
		})
	);
}

/******************************************************************************
 * Listeners
 *****************************************************************************/

export function listenForLogEntryClick(fn) {
	window.addEventListener(EVENT_LOG_ENTRY_CLICK, fn);
}

export function shutdownLogEntryClickListener(fn) {
	window.removeEventListener(EVENT_LOG_ENTRY_CLICK, fn);
}

export function listenForPageChange(fn) {
	window.addEventListener(EVENT_PAGE_CHANGE, fn);
}

export function shutdownPageChangeListener(fn) {
	window.removeEventListener(EVENT_PAGE_CHANGE, fn);
}

export function listenForUpdateInformation(fn) {
	window.addEventListener(EVENT_UPDATE_INFORMATION, fn);
}

export function shutdownUpdateInformationListener(fn) {
	window.removeEventListener(EVENT_UPDATE_INFORMATION, fn);
}

export function listenForSetSearchCriteria(fn) {
	window.addEventListener(EVENT_SET_SEARCH_CRITERIA, fn);
}

export function shutdownSetSearchCriteriaListener(fn) {
	window.removeEventListener(EVENT_SET_SEARCH_CRITERIA, fn);
}
