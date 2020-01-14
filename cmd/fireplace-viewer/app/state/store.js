import { ApplicationNameService } from "/app/services/ApplicationNameService.js";
import { LogEntryService } from "/app/services/LogEntryService.js";

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		application: "",
		applicationNames: [],
		level: "",
		searchTerm: "",
		page: 0,
		pageSize: 0,
		totalCount: 0,
		lastPage: 0,
		logEntries: [],
		showNavigation: true
	},
	mutations: {
		SET_FILTER_APPLICATION: (state, application) => {
			state.application = application;
		},

		SET_FILTER_LEVEL: (state, level) => {
			state.level = level;
		},

		SET_FILTER_SEARCH_TERM: (state, searchTerm) => {
			state.searchTerm = searchTerm;
		},

		SET_PAGE: function (state, page) {
			state.page = page;
		},

		SET_LAST_PAGE: (state, lastPage) => {
			state.lastPage = lastPage;
		},

		SET_LOG_ENTRIES: (state, logEntries) => {
			state.logEntries = logEntries;
		},

		SET_APPLICATION_NAMES: (state, applicationNames) => {
			state.applicationNames = applicationNames;
		},

		SET_SHOW_NAVIGATION: (state, showNavigation) => {
			state.showNavigation = showNavigation;
		}
	},
	actions: {
		clearFilters({ commit, dispatch }) {
			commit("SET_FILTER_APPLICATION", "");
			commit("SET_FILTER_LEVEL", "");
			commit("SET_FILTER_SEARCH_TERM", "");

			dispatch("getLogEntries", 1);
		},

		setFilterApplication({ commit, dispatch }, application) {
			commit("SET_FILTER_APPLICATION", application);
			dispatch("setPage", 1);
		},

		setFilterLevel({ commit, dispatch }, level) {
			commit("SET_FILTER_LEVEL", level);
			dispatch("setPage", 1);
		},

		setFilterSearchTerm({ commit, dispatch }, searchTerm) {
			commit("SET_FILTER_SEARCH_TERM", searchTerm);
			dispatch("setPage", 1);
		},

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

		async getLogEntries({ state, commit }, page) {
			let logEntryService = new LogEntryService(Vue.http);

			let filters = {
				application: state.application,
				level: state.level,
				searchTerm: state.searchTerm
			};

			let response = await logEntryService.getLogEntries(page, filters);
			let totalPages = Math.ceil(response.totalCount / response.pageSize);

			commit("SET_PAGE", page);
			commit("SET_LAST_PAGE", totalPages);
			commit("SET_LOG_ENTRIES", response.logs);
		},

		async getApplicationNames({ commit }) {
			let applicationNameService = new ApplicationNameService(Vue.http);
			let response = await applicationNameService.get();

			commit("SET_APPLICATION_NAMES", response);
		},

		showNavigation({ commit }) {
			commit("SET_SHOW_NAVIGATION", true);
		},

		hideNavigation({ commit }) {
			commit("SET_SHOW_NAVIGATION", false);
		},
	},
});

export default store;