import ApplicationSelector from "/app/components/application-selector/application-selector.js";
import LevelSelector from "/app/components/level-selector/level-selector.js";
import { Actions, Getters } from "/app/state/store.js";
import { FilterPanelActions, FilterPanelGetters } from "/app/components/filter-panel/filter-panel-state.js";

export default {
	props: {
		id: String,
		width: Number,
	},

	components: {
		ApplicationSelector,
		LevelSelector
	},

	computed: {
		get() {
			let visible = this.$store.getters[Getters.filterPanelVisible];

			if (visible) {
				this.showPanel();
			} else {
				this.closePanel();
			}
		},

		right: {
			get() {
				return this.$store.getters[FilterPanelGetters.right];
			},
		},

		styles: {
			get() {
				return {
					width: `${this.width}px`,
					right: `${this.right}px`,
				};
			},
		},

	},

	created() {
		this.$store.dispatch(FilterPanelActions.setWidth, this.width);
		this.$store.dispatch(FilterPanelActions.close);
	},

	methods: {
		clear() {
			this.$store.dispatch(FilterPanelActions.clear);
			this.$store.dispatch(Actions.firstPage);
		},

		close() {
			this.$store.dispatch(FilterPanelActions.close);
		},
	},

	template: `
		<div class="right-panel" :id="id" :style="styles">
			<form>
				<div class="form-group">
					<label for="application">Application</label>
					<application-selector></application-selector>
				</div>

				<div class="form-group">
					<label for="level">Level</label>
					<level-selector></level-selector>
				</div>

				<button type="button" class="btn btn-primary" @click="close">Close</button>
				<button type="button" class="btn btn-secondary" @click="clear">Clear</button>
			</form>
		</div>
	`
}
;

