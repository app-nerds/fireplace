import frame from "../lib/frame/frame.min.js";
import ServerSelector from "/static/js/components/ServerSelector.js";
import ApplicationSelector from "/static/js/components/ApplicationSelector.js";
import LogLevelSelector from "/static/js/components/LogLevelSelector.js";
import LogEntry from "/static/js/components/LogEntry.js";

document.addEventListener("DOMContentLoaded", () => {
  const serverIDEl = document.getElementById("serverID");
  const applicationEl = document.getElementById("application");
  const logLevelEl = document.getElementById("logLevel");
  const searchEl = document.getElementById("search");
  const dateFromEl = document.getElementById("dateFrom")
  const dateToEl = document.getElementById("dateTo")
  const firstButton = document.getElementById("first");
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const lastButton = document.getElementById("last");

  let server;
  let application;
  let logLevel;
  let search;
  let dateFrom = "";
  let dateTo = "";
  let page = 1;
  let hasMorePages;
  let lastPage = 0;

  // Setup server selector
  serverIDEl.graphql = window.graphql;
  serverIDEl.addEventListener("server-selected", onServerSelected);

  // Setup application selector
  applicationEl.graphql = window.graphql;
  applicationEl.addEventListener("finished-loading", onApplicationSelectorFinishedLoading);
  applicationEl.addEventListener("application-selected", onApplicationSelected);

  // Setup log level selector
  logLevelEl.addEventListener("log-level-selected", onLogLevelSelected);

  // Setup search box
  searchEl.addEventListener("keypress", frame.debounce(onSearchKeypress));
  searchEl.addEventListener("change", frame.debounce(onSearchKeypress))

  // Setup the date boxes 
  dateFromEl.addEventListener("keypress", frame.debounce(onDateFromKeyPress, 500));
  dateFromEl.addEventListener("change", frame.debounce(onDateFromKeyPress, 500));
  dateToEl.addEventListener("keypress", frame.debounce(onDateToKeyPress, 500));
  dateToEl.addEventListener("change", frame.debounce(onDateToKeyPress, 500));

  // Button events
  document.getElementById("btnClear").addEventListener("click", onClearClick);
  firstButton.addEventListener("click", onFirstClick);
  prevButton.addEventListener("click", onPreviousClick);
  nextButton.addEventListener("click", onNextClick);
  lastButton.addEventListener("click", onLastClick);

  /*******************************************************************************
   * Event handlers
   ******************************************************************************/

  async function onServerSelected(e) {
    const serverID = e.detail;
    server = await getServer(serverID);

    applicationEl.serverID = serverID;
  }

  function onApplicationSelectorFinishedLoading() {
    applicationEl.setAttribute("disabled", "false");
  }

  async function onApplicationSelected(e) {
    application = e.detail;

    logLevelEl.removeAttribute("disabled");
    searchEl.removeAttribute("disabled");
    dateFromEl.removeAttribute("disabled");
    dateToEl.removeAttribute("disabled");

    logLevelEl.reset();
    searchEl.value = "";

    logLevel = "";
    search = "";

    await getLogsAndRender();
    setPage(1);
  }

  async function onLogLevelSelected(e) {
    logLevel = e.detail;
    await getLogsAndRender();
    setPage(1);
  }

  async function onSearchKeypress() {
    search = searchEl.value;
    await getLogsAndRender();
    setPage(1);
  }

  async function onDateFromKeyPress(e) {
    if (isValidDate(e.target.value)) {
      dateFrom = `${e.target.value}Z`;
      await getLogsAndRender();
      setPage(1);
    } else {
      dateFrom = "";
    }
  }

  async function onDateToKeyPress(e) {
    if (isValidDate(e.target.value)) {
      dateTo = `${e.target.value}Z`;
      await getLogsAndRender();
      setPage(1);
    } else {
      dateTo = "";
    }
  }

  async function onClearClick() {
    logLevelEl.reset();
    searchEl.value = "";
    dateFromEl.value = "";
    dateToEl.value = "";

    logLevel = "";
    search = "";
    dateFrom = "";
    dateTo = "";

    await getLogsAndRender();
    setPage(1);
  }

  async function onFirstClick() {
    if (page > 1) {
      setPage(1);
      await getLogsAndRender();
    }
  }

  async function onPreviousClick() {
    if (page > 1) {
      decrementPage();
      await getLogsAndRender();
    }
  }

  async function onNextClick() {
    if (hasMorePages) {
      incrementPage();
      await getLogsAndRender();
    }
  }

  async function onLastClick() {
    if (hasMorePages) {
      setPage(lastPage);
      await getLogsAndRender();
    }
  }

  /*******************************************************************************
   * Private methods
   ******************************************************************************/

  async function getServer(serverID) {
    const response = await frame.fetcher(`/api/server/${serverID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }, window.spinner);

    const data = await response.json();
    return data;
  }

  async function getLogsAndRender() {
    const response = await getLogs(page);
    const resultsEl = document.getElementById("results");

    resultsEl.innerHTML = "";

    response.logEntries.forEach(logEntry => {
      const el = document.createElement("log-entry");
      resultsEl.insertAdjacentElement("beforeend", el);

      el.setAttribute("logid", logEntry.id);
      el.setAttribute("loglevel", logEntry.level);
      el.setAttribute("application", logEntry.application);
      el.setAttribute("message", logEntry.message);
      el.setAttribute("time", logEntry.time);
      el.setAttribute("details", JSON.stringify(logEntry.details));
    });

    if (hasMorePages) {
      if (nextButton.hasAttribute("disabled")) {
        nextButton.removeAttribute("disabled");
      }
    } else {
      nextButton.setAttribute("disabled", "");
    }

    if (page < lastPage) {
      if (lastButton.hasAttribute("disabled")) {
        lastButton.removeAttribute("disabled");
      }
    } else {
      lastButton.setAttribute("disabled", "");
    }

    if (page > 1) {
      if (prevButton.hasAttribute("disabled")) {
        prevButton.removeAttribute("disabled");
      }

      if (firstButton.hasAttribute("disabled")) {
        firstButton.removeAttribute("disabled");
      }
    } else {
      prevButton.setAttribute("disabled", "");
      firstButton.setAttribute("disabled", "");
    }
  }

  async function getLogs(page) {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server.password}`,
      },
    };

    let params = `page=${page}&application=${encodeURIComponent(application)}&search=${encodeURIComponent(search)}&level=${logLevel}`;

    if (dateFrom !== "") {
      params += `&dateFrom=${dateFrom}`;
    }

    if (dateTo !== "") {
      params += `&dateTo=${dateTo}`;
    }

    const response = await frame.fetcher(`${server.url}/logentry?${params}`, options, window.spinner);
    const result = await response.json();

    lastPage = Math.ceil(result.totalCount / result.pageSize);
    hasMorePages = (result.pageSize * page) < result.totalCount;
    return result;
  }

  function scrollToTop() {
    window.scroll(0, 0);
  }

  function setPage(newPage) {
    page = newPage;
    updatePageEl();
  }

  function incrementPage() {
    page++;
    updatePageEl();
  }

  function decrementPage() {
    page--;
    updatePageEl();
  }

  function updatePageEl() {
    document.getElementById("page").innerText = `Page ${page} of ${lastPage}`;
  }

  function isValidDate(d) {
    const r = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g;
    const isValid = d.match(r);
    return isValid;
  }
});
