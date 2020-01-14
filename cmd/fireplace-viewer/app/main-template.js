const mainTemplate = `
	<div>
		<the-navigation/>

		<div class="container-fluid">
			<router-view></router-view>
			<ejs-toast ref="toast" id="toast" width="100%" :position="{ X: 'Center', Y: 20 }"></ejs-toast>
		</div>
	</div>
	`;

export { mainTemplate };
