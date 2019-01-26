import Vuex from "vuex";
import Vue from "vue";

import ApplicationNameService from "../services/ApplicationNameService";
import LogEntryService from "../services/LogEntryService";

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
		clearFilters: function (context) {
			context.commit("SET_FILTER_APPLICATION", "");
			context.commit("SET_FILTER_LEVEL", "");
			context.commit("SET_FILTER_SEARCH_TERM", "");

			context.dispatch("getLogEntries", 1);
		},

		setFilterApplication: function (context, application) {
			context.commit("SET_FILTER_APPLICATION", application);
			context.dispatch("setPage", 1);
		},

		setFilterLevel: function (context, level) {
			context.commit("SET_FILTER_LEVEL", level);
			context.dispatch("setPage", 1);
		},

		setFilterSearchTerm: function (context, searchTerm) {
			context.commit("SET_FILTER_SEARCH_TERM", searchTerm);
			context.dispatch("setPage", 1);
		},

		nextPage: function (context) {
			if (context.state.page < context.state.lastPage) {
				let nextPage = context.state.page + 1;
				context.dispatch("setPage", nextPage);
			}
		},

		previousPage: function (context) {
			if (context.state.page > 1) {
				let previousPage = context.state.page - 1;
				context.dispatch("setPage", previousPage);
			}
		},

		firstPage: function (context) {
			context.dispatch("setPage", 1);
		},

		lastPage: function (context) {
			context.dispatch("setPage", context.state.lastPage);
		},

		setPage: function (context, page) {
			context.dispatch("getLogEntries", page);
		},

		getLogEntries: function (context, page) {
			let filters = {
				application: context.state.application,
				level: context.state.level,
				searchTerm: context.state.searchTerm
			};

			LogEntryService.getLogEntries(page, filters)
				.then((response) => {
					let totalPages = Math.ceil(response.totalCount / response.pageSize);

					context.commit("SET_PAGE", page);
					context.commit("SET_LAST_PAGE", totalPages);
					context.commit("SET_LOG_ENTRIES", response.logs);
				});
		},

		getApplicationNames: function (context) {
			ApplicationNameService.get()
				.then((response) => {
					context.commit("SET_APPLICATION_NAMES", response);
				});
		},

		showNavigation: function (context) {
			context.commit("SET_SHOW_NAVIGATION", true);
		},

		hideNavigation: function (context) {
			context.commit("SET_SHOW_NAVIGATION", false);
		}
	}
});

export default store;