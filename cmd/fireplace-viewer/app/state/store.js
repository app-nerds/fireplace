import { DetailPanelState } from "/app/components/detail-panel/detail-panel-state.js";
import { FilterPanelState } from "/app/components/filter-panel/filter-panel-state.js";

Vue.use(Vuex);

export const Actions = {
	nextPage: "nextPage",
	previousPage: "previousPage",
	firstPage: "firstPage",
	lastPage: "lastPage",
	setPage: "setPage",
	getLogEntries: "getLogEntries",
	showNavigation: "showNavigation",
	hideNavigation: "hideNavigation",
};

export const Getters = {
	lastPage: "lastPage",
	level: "level",
	logEntries: "logEntries",
	page: "page",
	showNavigation: "showNavigation",
};

const store = new Vuex.Store({
	modules: {
		detailPanel: DetailPanelState,
		filterPanel: FilterPanelState,
	},

	state: {
		page: 0,
		pageSize: 0,
		totalCount: 0,
		lastPage: 0,
		logEntries: [],
		showNavigation: true,
	},
	mutations: {
		SET_PAGE: function (state, page) {
			state.page = page;
		},

		SET_LAST_PAGE: (state, lastPage) => {
			state.lastPage = lastPage;
		},

		SET_LOG_ENTRIES: (state, logEntries) => {
			state.logEntries = logEntries;
		},

		SET_SHOW_NAVIGATION: (state, showNavigation) => {
			state.showNavigation = showNavigation;
		},
	},
	getters: {
		filterPanelVisible(state) {
			return state.filterPanelVisible;
		},

		lastPage(state) {
			return state.lastPage;
		},

		logEntries(state) {
			return state.logEntries;
		},

		page(state) {
			return state.page;
		},

		showNavigation(state) {
			return state.showNavigation;
		},
	},
	actions: {
		nextPage({ state, dispatch }) {
			if (state.page < state.lastPage) {
				let nextPage = state.page + 1;
				dispatch("setPage", nextPage);
			}
		},

		previousPage({ state, dispatch }) {
			if (context.state.page > 1) {
				let previousPage = state.page - 1;
				dispatch("setPage", previousPage);
			}
		},

		firstPage({ dispatch }) {
			dispatch("setPage", 1);
		},

		lastPage({ dispatch }) {
			dispatch("setPage", context.state.lastPage);
		},

		setPage({ dispatch }, page) {
			dispatch("getLogEntries", page);
		},

		async getLogEntries({ state, commit, getters }, page) {
			let filters = {
				application: getters["filterPanel/application"],
				level: getters["filterPanel/level"],
				searchTerm: getters["filterPanel/searchTerm"],
			};

			let response = await Vue.prototype.logEntryService.getLogEntries(page, filters);
			let totalPages = Math.ceil(response.totalCount / response.pageSize);

			commit("SET_PAGE", page);
			commit("SET_LAST_PAGE", totalPages);
			commit("SET_LOG_ENTRIES", response.logs);
		},

		showNavigation({ commit }) {
			commit("SET_SHOW_NAVIGATION", true);
		},

		hideNavigation({ commit }) {
			commit("SET_SHOW_NAVIGATION", false);
		},
	},
});

export { store };