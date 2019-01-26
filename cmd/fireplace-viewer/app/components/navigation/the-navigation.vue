<template>
	<nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
		<router-link to="/" class="navbar-brand">Fireplace</router-link>
		<button
			class="navbar-toggler"
			type="button"
			data-toggle="collapse"
			data-target="#main-navbar"
			aria-controls="main-navbar"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="main-navbar">
			<ul class="navbar-nav mr-auto">
				<li class="nav-item">
					<router-link to="/" class="nav-link">Logs</router-link>
				</li>
				<li class="nav-item">
					<router-link to="/clean" class="nav-link">Clean</router-link>
				</li>
			</ul>

			<form class="form-inline" v-if="showNavigation">
				<div class="form-group">
					<input
						type="text"
						class="form-control"
						placeholder="Search"
						v-model="searchTerm"
						@input="onSearchChange"
					>
				</div>
			</form>

			<ul class="navbar-nav navbar-right" v-if="showNavigation">
				<li class="nav-item">
					<a class="nav-link" @click="goToFirstPage">
						<i class="fas fa-fast-backward fa-lg"></i>
					</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" @click="goToPreviousPage">
						<i class="fas fa-caret-left fa-lg"></i>
					</a>
				</li>
				<li class="nav-item">
					<div class="page-number">{{page}} of {{lastPage}}</div>
				</li>
				<li class="nav-item">
					<a class="nav-link" @click="goToNextPage">
						<i class="fas fa-caret-right fa-lg"></i>
					</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" @click="goToLastPage">
						<i class="fas fa-fast-forward fa-lg"></i>
					</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" @click="refresh">
						<i class="fas fa-sync-alt fa-lg"></i>
					</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" @click="showFilter">
						<i class="fas fa-filter fa-lg"></i>
					</a>
				</li>
			</ul>
		</div>
	</nav>
</template>

<style scoped>
.page-number {
	padding: 0.5rem 1rem;
}
</style>

<script>
import _ from "lodash";

export default {
	mounted: function() {
		let self = this;

		this.$root.$on("clear-search-term", function() {
			self.searchTerm = "";
		});
	},
	data: function() {
		return {
			searchTerm: "",
			typingInSearchBox: false
		};
	},
	computed: {
		lastPage: function() {
			return this.$store.state.lastPage;
		},

		page: function() {
			return this.$store.state.page;
		},

		showNavigation: function() {
			return this.$store.state.showNavigation;
		}
	},
	watch: {
		searchTerm: _.debounce(function() {
			// Ensure we have a delay before dispatching the search event
			this.typingInSearchBox = false;
			this.$store.dispatch("setFilterSearchTerm", this.searchTerm);
		}, 600)
	},
	methods: {
		goToFirstPage: function() {
			this.$store.dispatch("firstPage");
			this.$root.$emit("page-changed");
		},

		goToPreviousPage: function() {
			this.$store.dispatch("previousPage");
			this.$root.$emit("page-changed");
		},

		goToNextPage: function() {
			this.$store.dispatch("nextPage");
			this.$root.$emit("page-changed");
		},

		goToLastPage: function() {
			this.$store.dispatch("lastPage");
			this.$root.$emit("page-changed");
		},

		refresh: function() {
			this.$store.dispatch("setPage", 1);
			this.$root.$emit("page-changed");
		},

		showFilter: function() {
			this.$root.$emit("toggle-filter-panel");
		},

		onSearchChange: function() {
			this.typingInSearchBox = true;
		}
	}
};
</script>