/*
 * Copyright © 2022 App Nerds LLC
 */

import frame from "../lib/frame/frame.min.js";

document.addEventListener("DOMContentLoaded", async () => {
	await loadAndRender();
	document.getElementById("btnAddNewServer").addEventListener("click", onAddNewServerClick);

	async function getServers() {
		try {
			const response = await frame.fetcher(`/api/server`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}, window.spinner);

			const data = await response.json();
			return data;
		} catch (e) {
			console.log(e);
			window.alert.error(e.message);
		}
	}

	async function loadAndRender() {
		const servers = await getServers();
		document.getElementById("servers").innerHTML = "";
		renderServerCards(servers);
	}

	function onAddNewServerClick() {
		window.location = "/edit-server/0";
	}

	async function onDeleteServerClick(id) {
		try {
			const deleteConfirmation = await window.confirm.yesNo("Are you sure you wish to delete this server?");

			if (deleteConfirmation) {
				const options = {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				};

				await frame.fetcher(`/api/server/${id}`, options, window.spinner);
				window.alert.success("Server deleted");
			}
		} catch (e) {
			console.log(e);
			window.alert.error(e.message);
		}
	}

	function renderServerCards(servers) {
		let container = document.getElementById("servers");

		servers.forEach(s => {
			const card = renderCard(s);
			container.insertAdjacentElement("beforeend", card);
		});
	}

	function renderCard(server) {
		const cardDiv = document.createElement("article");

		const title = document.createElement("h3");
		title.innerText = server.serverName;

		const link = document.createElement("p");
		link.innerHTML = `<a href="${server.url}" target="_blank">${server.url}</a>`;

		const description = document.createElement("p");
		description.innerHTML = server.description;

		const buttonRow = document.createElement("footer");

		const editButton = document.createElement("button");
		editButton.classList.add("action-button");
		editButton.innerHTML = `<i class="icon--mdi icon--mdi--pencil"></i> Edit`;
		editButton.addEventListener("click", () => {
			window.location = `/edit-server/${server.id}`;
		});

		const deleteButton = document.createElement("button");
		deleteButton.innerHTML = `<i class="icon--mdi icon--mdi--delete"></i> Delete`;
		deleteButton.addEventListener("click", async () => {
			await onDeleteServerClick(server.id);
			loadAndRender();
		});

		buttonRow.insertAdjacentElement("beforeend", editButton);
		buttonRow.insertAdjacentElement("beforeend", deleteButton);


		cardDiv.insertAdjacentElement("beforeend", title);
		cardDiv.insertAdjacentElement("beforeend", link);
		cardDiv.insertAdjacentElement("beforeend", description);
		cardDiv.insertAdjacentElement("beforeend", buttonRow);

		return cardDiv;
	}
});
