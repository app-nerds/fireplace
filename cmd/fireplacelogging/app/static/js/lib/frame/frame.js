/* Copyright © 2022 App Nerds LLC  */
/*
 * alert is a simple toast library inspired by vanilla-toast (https://github.com/mehmetemineker/vanilla-toast)
 * It is self contained and only relies on styles provided by alert.css.
 *
 * Copyright © 2022 App Nerds LLC
 */
const alertPosition = {
  TopLeft: "top-left",
  TopCenter: "top-center",
  TopRight: "top-right",
  BottomLeft: "bottom-left",
  BottomCenter: "bottom-center",
  BottomRight: "bottom-right"
};

const alertPositionIndex = [
  [alertPosition.TopLeft, alertPosition.TopCenter, alertPosition.TopRight],
  [alertPosition.BottomLeft, alertPosition.BottomCenter, alertPosition.BottomRight]
];

const svgs = {
  success: '<svg viewBox="0 0 426.667 426.667" width="18" height="18"><path d="M213.333 0C95.518 0 0 95.514 0 213.333s95.518 213.333 213.333 213.333c117.828 0 213.333-95.514 213.333-213.333S331.157 0 213.333 0zm-39.134 322.918l-93.935-93.931 31.309-31.309 62.626 62.622 140.894-140.898 31.309 31.309-172.203 172.207z" fill="#6ac259"></path></svg>',
  warn: '<svg viewBox="0 0 310.285 310.285" width=18 height=18> <path d="M264.845 45.441C235.542 16.139 196.583 0 155.142 0 113.702 0 74.743 16.139 45.44 45.441 16.138 74.743 0 113.703 0 155.144c0 41.439 16.138 80.399 45.44 109.701 29.303 29.303 68.262 45.44 109.702 45.44s80.399-16.138 109.702-45.44c29.303-29.302 45.44-68.262 45.44-109.701.001-41.441-16.137-80.401-45.439-109.703zm-132.673 3.895a12.587 12.587 0 0 1 9.119-3.873h28.04c3.482 0 6.72 1.403 9.114 3.888 2.395 2.485 3.643 5.804 3.514 9.284l-4.634 104.895c-.263 7.102-6.26 12.933-13.368 12.933H146.33c-7.112 0-13.099-5.839-13.345-12.945L128.64 58.594c-.121-3.48 1.133-6.773 3.532-9.258zm23.306 219.444c-16.266 0-28.532-12.844-28.532-29.876 0-17.223 12.122-30.211 28.196-30.211 16.602 0 28.196 12.423 28.196 30.211.001 17.591-11.456 29.876-27.86 29.876z" fill="#FFDA44" /> </svg>',
  info: '<svg viewBox="0 0 23.625 23.625" width=18 height=18> <path d="M11.812 0C5.289 0 0 5.289 0 11.812s5.289 11.813 11.812 11.813 11.813-5.29 11.813-11.813S18.335 0 11.812 0zm2.459 18.307c-.608.24-1.092.422-1.455.548a3.838 3.838 0 0 1-1.262.189c-.736 0-1.309-.18-1.717-.539s-.611-.814-.611-1.367c0-.215.015-.435.045-.659a8.23 8.23 0 0 1 .147-.759l.761-2.688c.067-.258.125-.503.171-.731.046-.23.068-.441.068-.633 0-.342-.071-.582-.212-.717-.143-.135-.412-.201-.813-.201-.196 0-.398.029-.605.09-.205.063-.383.12-.529.176l.201-.828c.498-.203.975-.377 1.43-.521a4.225 4.225 0 0 1 1.29-.218c.731 0 1.295.178 1.692.53.395.353.594.812.594 1.376 0 .117-.014.323-.041.617a4.129 4.129 0 0 1-.152.811l-.757 2.68a7.582 7.582 0 0 0-.167.736 3.892 3.892 0 0 0-.073.626c0 .356.079.599.239.728.158.129.435.194.827.194.185 0 .392-.033.626-.097.232-.064.4-.121.506-.17l-.203.827zm-.134-10.878a1.807 1.807 0 0 1-1.275.492c-.496 0-.924-.164-1.28-.492a1.57 1.57 0 0 1-.533-1.193c0-.465.18-.865.533-1.196a1.812 1.812 0 0 1 1.28-.497c.497 0 .923.165 1.275.497.353.331.53.731.53 1.196 0 .467-.177.865-.53 1.193z" fill="#006DF0" /> </svg>',
  error: '<svg viewBox="0 0 51.976 51.976" width=18 height=18> <path d="M44.373 7.603c-10.137-10.137-26.632-10.138-36.77 0-10.138 10.138-10.137 26.632 0 36.77s26.632 10.138 36.77 0c10.137-10.138 10.137-26.633 0-36.77zm-8.132 28.638a2 2 0 0 1-2.828 0l-7.425-7.425-7.778 7.778a2 2 0 1 1-2.828-2.828l7.778-7.778-7.425-7.425a2 2 0 1 1 2.828-2.828l7.425 7.425 7.071-7.071a2 2 0 1 1 2.828 2.828l-7.071 7.071 7.425 7.425a2 2 0 0 1 0 2.828z" fill="#D80027" /> </svg>'
};

function setup() {
  const container = document.createElement("div");
  container.className = "alert-container";

  for (const rowIndex of [0, 1]) {
    const row = document.createElement("div");
    row.className = "alert-row";

    for (const colIndex of [0, 1, 2]) {
      const col = document.createElement("div");
      col.className = `alert-col ${alertPositionIndex[rowIndex][colIndex]}`;

      row.appendChild(col);
    }

    container.appendChild(row);
  }

  document.body.appendChild(container);
}

/*
 * Returns an object with functions to call to display alerts
 */
function alert(baseOptions = {
  title: undefined,
  position: alertPosition.TopRight,
  duration: 3000,
  closable: true,
  focusable: true,
  callback: undefined,
}) {
  /*
   * If the outer container doesn't exist, make it
   */
  if (!document.getElementsByClassName("alert-container").length) {
    setup();
  }

  /*
   * Internal functions
   */
  function show(message = "Welcome to NerdAlert!", options, type) {
    options = { ...baseOptions, ...options };
    const col = document.getElementsByClassName(options.position)[0];

    const card = document.createElement("div");
    card.className = `alert-card ${type}`;
    card.innerHTML += svgs[type];
    card.options = {
      ...options, ...{
        message,
        type: type,
        yPos: options.position.indexOf("top") > -1 ? "top" : "bottom",
        inFocus: false,
      },
    };

    setContent(card);
    setIntroAnimation(card);
    bindEvents(card);
    autoDestroy(card);

    col.appendChild(card);
  }

  function setContent(card) {
    const div = document.createElement("div");
    div.className = "text-group";

    if (card.options.title) {
      div.innerHTML = `<h4>${card.options.title}</h3>`;
    }

    div.innerHTML += `<p>${card.options.message}</p>`;
    card.appendChild(div);
  }

  function setIntroAnimation(card) {
    card.style.setProperty(`margin-${card.options.yPos}`, "-15px");
    card.style.setProperty(`opacity`, "0");

    setTimeout(() => {
      card.style.setProperty(`margin-${card.options.yPos}`, "15px");
      card.style.setProperty("opacity", "1");
    }, 50);
  }

  function bindEvents(card) {
    card.addEventListener("click", () => {
      if (card.options.closable) {
        destroy(card);
      }
    });

    card.addEventListener("mouseover", () => {
      card.options.isFocus = card.options.focusable;
    });

    card.addEventListener("mouseout", () => {
      card.options.isFocus = false;
      autoDestroy(card, card.options.duration);
    });
  }

  function autoDestroy(card) {
    if (card.options.duration !== 0) {
      setTimeout(() => {
        if (!card.options.isFocus) {
          destroy(card);
        }
      }, card.options.duration);
    }
  }

  function destroy(card) {
    card.style.setProperty(`margin-${card.options.yPos}`, `-${card.offsetHeight}px`);
    card.style.setProperty("opacity", "0");

    setTimeout(() => {
      card.remove();

      if (typeof card.options.callback === "function") {
        card.options.callback();
      }
    }, 500);
  }

  /*
   * Return the interface the user sees.
   */
  return {
    success(message, options) {
      show(message, options, "success");
    },

    info(message, options) {
      show(message, options, "info");
    },

    warn(message, options) {
      show(message, options, "warn");
    },

    error(message, options) {
      show(message, options, "error");
    },
  };
}

/*
 * shim displays a full screen shim to cover elements. CSS is provided by shim.css.
 * Copyright © 2022 App Nerds LLC
 */

function shim(baseOptions = {
  closeOnClick: false,
}) {
  /*
   * internal constructor function to build a new shim
   */
  function newShim(options) {
    options = { ...baseOptions, ...options };
    let shim = undefined;

    function calculateHeight() {
      const body = document.body;
      const html = document.documentElement;

      const bodyHeight = body.getBoundingClientRect().height;
      const htmlHeight = html.getBoundingClientRect().height;

      const height = Math.max(bodyHeight, htmlHeight);
      return height;
    }

    function calculateTop() {
      const r = document.documentElement.getBoundingClientRect();
      return r.top;
    }

    function show() {
      if (!shim && !document.getElementsByClassName("shim").length) {
        shim = document.createElement("div");
        shim.style.top = `${calculateTop()}px`;
        shim.style.height = `${calculateHeight()}px`;
        shim.classList.add("shim");

        if (options.closeOnClick) {
          shim.addEventListener("click", (e) => {
            destroy(true);
          });
        }

        document.body.appendChild(shim);
      } else if (document.getElementsByClassName("shim").length) {
        shim = document.getElementsByClassName("shim")[0];
      }
    }

    function destroy(fireCallback = true) {
      if (shim) {
        shim.remove();
        shim = undefined;

        if (typeof options.callback === "function" && fireCallback) {
          options.callback();
        }
      }
    }

    return {
      hide(fireCallback = true) {
        destroy(fireCallback);
      },

      show() {
        show();
      },
    }
  }

  /*
   * Public functions
   */
  return {
    new(options) {
      options = { ...{ callback: undefined }, ...options };
      return newShim(options);
    }
  };
}

/*
 * confirm is a function to display a confirmation dialog. It has two mode: "yesno", "other". 
 * "yesno" mode will display two buttons: Yes and No. "other" will only display a Close button.
 * The result of the click will be returned in a promise value.
 *
 * Styling is provided by confirm.css. It relies on variables: 
 *   - --dialog-background-color 
 *   - --border-color
 *
 * Example:
 *    const confirmation = confirm();
 *    const result = await confirmation.yesNo("Are you sure?");
 *
 * Copyright © 2022 App Nerds LLC
 */

function confirm(baseOptions = {
  width: "25%",
  height: "25%",
  callback: undefined,
}) {
  const shimBuilder = shim({ closeOnClick: true });
  let _shim;

  function calculateTop() {
    const r = document.body.getBoundingClientRect();
    return Math.abs(r.top);
  }

  function show(type, message, options) {
    options = { ...baseOptions, ...options };

    const container = document.createElement("div");
    container.classList.add("confirm-container");
    container.style.setProperty("width", options.width);
    container.style.setProperty("height", options.height);
    container.style.setProperty("top", `calc((50% - ${options.height}) + ${calculateTop()}px)`);
    container.style.setProperty("left", `calc(50% - (${options.width}/2))`);

    _shim = shimBuilder.new({ callback: () => { close(container, options.callback, false); } });

    setContent(container, message);
    addButtons(container, type, options.callback);

    _shim.show();
    document.body.appendChild(container);
  }

  function setContent(container, message) {
    container.innerHTML += `<p>${message}</p>`;
  }

  function addButtons(container, type, callback) {
    let buttons = [];

    switch (type) {
      case "yesno":
        const noB = document.createElement("button");
        noB.innerText = "No";
        noB.classList.add("cancel-button");
        noB.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          _shim.hide(false);
          close(container, callback, false);
        });

        const yesB = document.createElement("button");
        yesB.innerText = "Yes";
        yesB.classList.add("action-button");
        yesB.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          _shim.hide(false);
          close(container, callback, true);
        });

        buttons.push(noB);
        buttons.push(yesB);
        break;

      default:
        const b = document.createElement("button");
        b.innerText = "Close";
        b.classList.add("action-button");
        b.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          _shim.hide(false);
          close(container, callback);
        });

        buttons.push(b);
        break;
    }

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-row");

    buttons.forEach((button) => { buttonContainer.appendChild(button); });
    container.appendChild(buttonContainer);
  }

  function close(container, callback, callbackValue) {
    container.remove();
    if (typeof callback === "function") {
      callback(callbackValue);
    }
  }

  return {
    confirm(message, options) {
      show("confirm", message, options);
    },

    yesNo(message, options) {
      return new Promise((resolve) => {
        const cb = (result) => {
          return resolve(result);
        };

        options = { ...{ callback: cb }, ...options };
        show("yesno", message, options);
      });
    },
  };
}

/*
 * PopupMenu is a Web Component that displays a popup menu. It attaches to a trigger element 
 * that, when clicked, will show a list of menu items. It supports icons through the Feather 
 * Icons library (https://feathericons.com/).
 *
 * Styling is provided by popup-menu.css. It relies on variables: 
 *   - --dialog-background-color 
 *   - --prmiary-color (for the hover).
 *   - --border-color
 *
 * Usage example:
 *    <popup-menu trigger="#trigger">
 *       <popup-menu-item id="item1" text="Menu Item 1" icon="log-out"></popup-menu-item>
 *    </popup-menu>
 *
 * Copyright © 2022 App Nerds LLC
 */

class PopupMenu extends HTMLElement {
  constructor() {
    super();
    this._trigger = null;
    this._el = null;
  }

  connectedCallback() {
    this._trigger = this.getAttribute("trigger");

    if (!this._trigger) {
      throw new Error(
        "You must provide a query selector for the element used to trigger this popup."
      );
    }

    this.style.visibility = "hidden";

    document
      .querySelector(this._trigger)
      .addEventListener("click", this.toggle.bind(this));
  }

  disconnectedCallback() {
    let el = document.querySelector(this._trigger);

    if (el) {
      el.removeEventListener("click", this.toggle.bind(this));
    }
  }

  toggle(e) {
    if (e) {
      e.preventDefault();
    }

    let triggerRect = document
      .querySelector(this._trigger)
      .getBoundingClientRect();
    let thisRect = this.getBoundingClientRect();
    let buffer = 3;

    if (thisRect.right > window.innerWidth) {
      this.style.left =
        "" +
        (triggerRect.x + (window.innerWidth - thisRect.right) - buffer) +
        "px";
    } else {
      this.style.left = "" + triggerRect.x + "px";
    }

    this.style.top =
      "" + (triggerRect.y + triggerRect.height + buffer) + "px";

    if (this.style.visibility === "hidden") {
      this.style.visibility = "visible";
    } else {
      this.style.visibility = "hidden";
    }
  }
}

class PopupMenuItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    let text = this.getAttribute("text");
    let icon = this.getAttribute("icon");

    const div = document.createElement("div");
    div.classList.add("popup-menu-item");

    let inner = "";

    if (icon) {
      inner += `<i data-feather="${icon}"></i> `;
    }

    inner += text;
    div.innerHTML = inner;

    div.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("click", { detail: e }));

      const parent = e.target.parentElement.parentElement;
      parent.style.visibility = "hidden";
    });

    this.insertAdjacentElement("beforeend", div);
  }
}

const showPopup = (el) => {
  document.querySelector(el).style.visibility = "visible";
};

const hidePopup = (el) => {
  document.querySelector(el).style.visibility = "hidden";
};

if (!customElements.get("popup-menu")) {
  customElements.define("popup-menu", PopupMenu);
}

if (!customElements.get("popup-menu-item")) {
  customElements.define("popup-menu-item", PopupMenuItem);
}

/*
 * spinner is simple library for displaying a loading spinner. It makes use
 * of the whole page to display the spinner. The spinner is pure CSS, SVG, and JavaScript.
 * Copyright © 2022 App Nerds LLC
 */
function spinner() {
  let spinner = undefined;

  function calculateHeight() {
    const body = document.body;
    const html = document.documentElement;

    const bodyHeight = body.getBoundingClientRect().height;
    const htmlHeight = html.getBoundingClientRect().height;

    const height = Math.max(bodyHeight, htmlHeight);
    return height;
  }

  function calculateTop() {
    const r = document.body.getBoundingClientRect();
    return Math.abs(r.top);
  }

  function show() {
    if (!spinner) {
      spinner = document.createElement("div");
      spinner.classList.add("spinner");
      spinner.style.top = `${calculateTop()}px`;
      spinner.style.height = `${calculateHeight()}px`;
      spinner.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" />
        </svg>
      `;

      document.body.appendChild(spinner);
    }
  }

  function hide() {
    if (spinner) {
      spinner.remove();
      spinner = undefined;
    }
  }

  return {
    hide() {
      hide();
    },

    show() {
      show();
    },
  }
}

/*
 * Copyright © 2022 App Nerds LLC
 */

async function fetcher(url, options, spinner) {
  let timerID;

  if (spinner) {
    timerID = setTimeout(() => {
      spinner.show();
    }, 1000);
  }

  const response = await fetch(url, options);

  if (spinner) {
    clearTimeout(timerID);
    spinner.hide();
  }

  return response;
}

/*
 * Copyright © 2022 App Nerds LLC
 */

class GraphQL {
  constructor(queryURL, options = {
    http: fetcher,
    tokenGetterFunction: null,
    expiredTokenCallback: null,
    spinner: null,
    navigateTo: null,
  }) {
    options = {
      http: fetcher,
      tokenGetterFunction: null,
      expiredTokenCallback: null,
      spinner: null,
      navigateTo: null,
      ...options,
    };

    this.queryURL = queryURL;
    this.http = options.http;
    this.tokenGetterFunction = options.tokenGetterFunction;
    this.expiredTokenCallback = options.expiredTokenCallback;
    this.spinner = options.spinner;
    this.navigateTo = options.navigateTo;
  }

  /**
   * Executes a query against a GraphQL API
   * @param query string A graphql query. Omit the "query {}" portion.
   */
  async query(query) {
    if (this.expiredTokenCallback && !this.expiredTokenCallback(null, "/", this.navigateTo)) {
      return;
    }

    const token = (this.tokenGetterFunction) ? this.tokenGetterFunction() : "";

    query = `query {
			${query}
		}`;

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query }),
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    let response = await this.http(this.queryURL, options, this.spinner);

    if (response.status === 400 || response.status === 401) {
      if (this.expiredTokenCallback) {
        this.expiredTokenCallback(response, "/", this.navigateTo);
      }
      return;
    }

    let result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  }

  /**
   * Executes a mutation against a GraphQL API
   * @param query string A graphql mutation. Omit the "mutation {}" portion
   */
  async mutation(query) {
    if (this.expiredTokenCallback && !this.expiredTokenCallback(null, "/", this.navigateTo)) {
      return;
    }

    const token = (this.tokenGetterFunction) ? this.tokenGetterFunction() : "";

    query = `mutation {
			${query}
		}`;

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query }),
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    let response = await this.http(this.queryURL, options, this.spinner);

    if (response.status === 400 || response.status === 401) {
      if (this.expiredTokenCallback) {
        this.expiredTokenCallback(response, "/", this.navigateTo);
      }

      return;
    }

    let result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result;
  }
}

/*
 * Copyright © 2022 App Nerds LLC
 */

const debounce = (fn, delay = 400) => {
  let id = null;

  return function() {
    let args = arguments;

    clearTimeout(id);

    id = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/*
 * Copyright © 2022 App Nerds LLC
 */

/**
 * Converts a classic JS object to a Map
 * @param o object The object to convert
 */
const objectToMap = (o = {}) => {
  let result = new Map();

  for (const key in o) {
    result.set(key, o[key]);
  }

  return result;
};

/*
 * Copyright © 2022 App Nerds LLC
 */

const ErrTokenExpired = "token expired";

class SessionService {
  static clearMember() {
    window.sessionStorage.removeItem("member");
  }

  static clearToken() {
    window.sessionStorage.removeItem("token");
  }

  static getMember() {
    return JSON.parse(window.sessionStorage.getItem("member"));
  }

  static getToken() {
    return JSON.parse(window.sessionStorage.getItem("token"));
  }

  static hasMember() {
    return window.sessionStorage.getItem("member") !== null;
  }

  static hasToken() {
    return window.sessionStorage.getItem("token") !== null;
  }

  static navigateOnTokenExpired(e, path, navigateTo) {
    if (e.message === ErrTokenExpired) {
      SessionService.clearToken();
      navigateTo(path);
    }
  }

  static setMember(member) {
    window.sessionStorage.setItem("member", JSON.stringify(member));
  }

  static setToken(token) {
    window.sessionStorage.setItem("token", JSON.stringify(token));
  }

  static tokenExpireFunc(httpResponse, path, navigateTo) {
    if (httpResponse && httpResponse.status === 401) {
      SessionService.clearToken();
      SessionService.navigateOnTokenExpired({ message: ErrTokenExpired }, path, navigateTo);
      return false;
    }

    if (!SessionService.hasToken()) {
      SessionService.navigateOnTokenExpired({ message: ErrTokenExpired }, path, navigateTo);
      return false;
    }

    return true;
  };
}

/*
 * Copyright © 2022 App Nerds LLC
 */

class BaseView extends HTMLElement {
  constructor(params, _onRenderComplete) {
    super();

    this._title = "";
    this.params = params;
    this._state = {};
    this._onRenderComplete = window._router.onRenderComplete || null;

    this.router = window._router;
  }

  async connectedCallback() {
    await this.beforeRender();
    await this.render();
    this._setDocumentTitle();
    await this.afterRender();

    if (this._onRenderComplete) {
      this._onRenderComplete(this);
    }
  }

  disconnectedCallback() {
    this.onUnload();
  }

  _setDocumentTitle() {
    let titles = this.querySelectorAll("title");

    if (titles && titles.length > 0) {
      this._title = titles[0].innerText;
      document.title = this._title;
      this.removeChild(titles[0]);
      return;
    }
  }

  async beforeRender() { }
  async afterRender() { }
  async onUnload() { }

  async render() {
    throw new Error("not implemented");
  }

  get title() {
    return this._title;
  }

  get html() {
    return this._html;
  }

  get state() {
    return this._state;
  }

  set state(newState) {
    this._state = newState;
  }

  getQueryParam(paramName) {
    return this.router.getQueryParam(paramName);
  }

  navigateTo(url, queryParams = {}, state = {}) {
    this.router.navigateTo(url, queryParams, state);
  }
}

// Used when a route cannot be found
class DefaultPageNotFound extends BaseView {
  constructor(params) {
    super(params);
  }

  async render() {
    return `
			<title>Page Not Found</title>
			<p>The page ${this.params.path} could not be found.</p>
		`;
  }
}

if (!customElements.get("default-page-not-found")) {
  customElements.define("default-page-not-found", DefaultPageNotFound);
}

/*
 * Copyright © 2022 App Nerds LLC
 */

/*
 * Router
 */
class Router {
  constructor(targetEl, routes, pageNotFoundView = null) {
    this.targetEl = targetEl;
    this.routes = routes;
    this.pageNotFoundView = pageNotFoundView;

    this.beforeRoute = null;
    this.afterRoute = null;
    this.injectParams = null;
    this.onRenderComplete = null;

    if (this.pageNotFoundView) {
      this.routes.push({
        path: "/404notfound/:path",
        view: this.pageNotFoundView,
      });
    } else {
      this.routes.push({
        path: "/404notfound/:path",
        view: DefaultPageNotFound,
      });
    }
  }

  _pathToRegex(path) {
    return new RegExp(
      "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$"
    );
  }

  _getParams(match) {
    let index = 0;

    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
      (result) => result[1]
    );

    let result = {};

    for (index = 0; index < values.length; index++) {
      result[keys[index]] = values[index];
    }

    if (this.injectParams) {
      const whatToInject = this.injectParams(match);

      for (const key in whatToInject) {
        result[key] = whatToInject[key];
      }
    }

    return result;
  }

  async _route(e) {
    let state = {};

    if (e.state) {
      state = e.state;
    }

    const potentialMatches = this.routes.map((route) => {
      return {
        route,
        result: location.pathname.match(this._pathToRegex(route.path)),
      };
    });

    let match = potentialMatches.find(
      (potentialMatch) => potentialMatch.result !== null
    );

    /*
     * Route not found - return first route
     */
    if (!match) {
      this.navigateTo(`/404notfound${location.pathname}`);
      return;
    }

    if (this.beforeRoute) {
      if (this.beforeRoute.apply(this, match.route) === false) {
        return;
      }
    }

    /*
     * Get parameters, then initialie the view and render.
     */
    const params = this._getParams(match);
    const view = new match.route.view(params);
    view.state = state;

    const el = document.querySelector(this.targetEl);
    el.innerHTML = "";
    el.appendChild(view);

    if (this.afterRoute) {
      this.afterRoute(match.route);
    }
  }

  getQueryParam(paramName) {
    let params = new URLSearchParams(location.search);
    return params.get(paramName);
  }

  navigateTo(url, queryParams = {}, state = {}) {
    let q = "";

    if (Object.keys(queryParams).length > 0) {
      let m = objectToMap(queryParams);
      q += "?";

      for (const [key, value] of m) {
        let encodedKey = encodeURIComponent(key);
        let jsonValue = value;

        if (typeof value === "object") {
          jsonValue = JSON.stringify(value);
        }

        let encodedValue = encodeURIComponent(jsonValue);

        q += `${encodedKey}=${encodedValue}&`;
      }
    }

    history.pushState(state, null, `${url}${q}`);
    this._route({
      state: state,
    });
  }
}

/*
 * Copyright © 2022 App Nerds LLC
 */

const application = (
  targetElement,
  routes,
  pageNotFoundView = DefaultPageNotFound
) => {
  window._router = new Router(targetElement, routes, pageNotFoundView);
  window.navigateTo = window._router.navigateTo.bind(window._router);

  window.addEventListener("popstate", (e) => {
    window._router._route({
      state: e.state,
    });
  });

  return {
    routes: routes,
    targetElement: targetElement,
    router: window._router,

    afterRoute: (f) => {
      window._router.afterRoute = f.bind(window._router);
    },

    beforeRoute: (f) => {
      window._router.beforeRoute = f.bind(window._router);
    },

    injectParams: (f) => {
      window._router.injectParams = f.bind(window._router);
    },

    onRenderComplete: (f) => {
      window._router.onRenderComplete = f.bind(window._router);
    },

    go: () => {
      window._router._route({});
    },
  };
};

class MemberService {
  spinnerEl;

  constructor(spinnerEl) {
    this.spinnerEl = spinnerEl;
  }

  async getCurrentMember() {
    let options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    let response = await fetcher(`/api/member/current`, options, this.spinnerEl);
    let result = await response.json();
    return result;
  }
}

/*
 * MemberLoginBar is a component used to display a member dropdown in the header of websites. 
 * It displays either a user-uploaded image or the letter of the first initial of the user's name. 
 * When logged in the menu provides links to the user's account and log off. If the user is not logged 
 * in then a log in link is displayed.
 *
 * To work with member data this component requires service component that provides the following.
 *   - getCurrentMember - Must return an object with fields memberID, firstName, lastName, profilePictureURL
 *
 * This component uses Feather Icons. https://feathericons.com/
 * 
 * Copyright © 2022 App Nerds LLC
*/

class MemberLoginBar extends HTMLElement {
  memberService;
  loginPath;

  constructor() {
    super();

    this.loginPath = this.getAttribute("login-path") || "/member/login";
    const spinner = this.getAttribute("spinner") || null;
    let spinnerEl = null;

    if (spinner) {
      spinnerEl = document.querySelector(spinner);
    }

    this.memberService = new MemberService(spinnerEl);
  }

  static get observedAttributes() {
    return ["login-path"];
  }

  set memberService(/** @type {any} */ service) {
    this.memberService = service;
  }

  attributedChangedCallback(name, _, newValue) {
    if (name === "login-path") {
      this.loginPath = newValue;
    }
  }

  async connectedCallback() {
    let member = null;

    member = await this.memberService.getCurrentMember();

    const containerEl = this.createContainerEl();
    this.createAvatarEl(containerEl, member);
    this.createTextEl(containerEl, member);
    this.createPopupMenu(containerEl, member);

    this.insertAdjacentElement("beforeend", containerEl);
    feather.replace();
  }

  /*******************************************************************************
   * Event methods
   ******************************************************************************/

  /*******************************************************************************
   * UI elements
   ******************************************************************************/

  createContainerEl() {
    const el = document.createElement("div");
    return el;
  }

  createAvatarEl(container, member) {
    let el;

    if (member && member.avatarURL) {
      el = document.createElement("img");
      el.classList.add("avatar");
      el.src = member.avatarURL;
    } else {
      el = document.createElement("div");
      el.classList.add("avatar");
      el.innerHTML = `<i data-feather="user"></i>`;
    }

    container.insertAdjacentElement("beforeend", el);
  }

  createTextEl(container, member) {
    let markup;

    const el = document.createElement("a");
    el.id = "member-link";

    if (member && member.email) {
      let name = "";

      el.href = "#";

      if (member.firstName) {
        name += member.firstName;
      }

      if (member.lastName) {
        name += ` ${member.lastName}`;
      }

      if (name === "") {
        name = "User";
      }

      markup = `${name} <i data-feather="chevron-down"></i>`;
    } else {
      el.href = this.loginPath;
      markup = "Log In";
    }

    el.innerHTML = markup;
    container.insertAdjacentElement("beforeend", el);
  }

  createPopupMenu(container, member) {
    if (member && member.email) {
      const el = document.createElement("popup-menu");
      el.setAttribute("trigger", "#member-link");

      const menuItems = [
        { id: "member-my-account-link", text: "My Account", icon: "home", handler: this.onMyAccountClick.bind(this) },
        { id: "member-log-out-link", text: "Log Out", icon: "log-out", handler: this.onLogOutClick.bind(this) },
      ];

      menuItems.forEach(data => {
        const menuItem = document.createElement("popup-menu-item");
        menuItem.setAttribute("id", data.id);
        menuItem.setAttribute("text", data.text);
        menuItem.setAttribute("icon", data.icon);
        menuItem.addEventListener("click", data.handler);

        el.insertAdjacentElement("beforeend", menuItem);
      });

      container.insertAdjacentElement("beforeend", el);
    }
  }

  /*******************************************************************************
   * Private methods
   ******************************************************************************/

  onMyAccountClick() {
    window.location = "/member/profile";
  }

  onLogOutClick() {
    window.location = "/api/member/logout";
  }
}

if (!customElements.get("member-login-bar")) {
  customElements.define("member-login-bar", MemberLoginBar);
}

/*
 * Copyright © 2022 App Nerds LLC
 */

class GoogleLoginForm extends HTMLElement {
  loginPath;
  createAccountPath;
  signInButtonURL;

  constructor() {
    super();

    this.loginPath = this.getAttribute("login-path") || "/auth/google";
    this.createAccountPath = this.getAttribute("create-account-path") || "/create-account";
    this.signInButtonURL = this.getAttribute("sign-in-button-url") || "/static/images/sign-in-with-google.jpg";
  }

  connectedCallback() {
    const sectionEl = document.createElement("section");
    sectionEl.classList.add("google-login-form");

    const footerEl = document.createElement("div");
    footerEl.classList.add("sign-up-footer");

    sectionEl.innerHTML = `
      <a href="${this.loginPath}"><img src="${this.signInButtonURL}" alt="Sign in with Google" style="width:100%;" /></a>
    `;

    footerEl.innerHTML = `
      <p>
        Don't have an account? Click <a href="${this.createAccountPath}">here</a> to create one.
      </p>
    `;

    sectionEl.insertAdjacentElement("beforeend", footerEl);
    this.insertAdjacentElement("beforeend", sectionEl);
  }
}

if (!customElements.get("google-login-form")) {
  customElements.define("google-login-form", GoogleLoginForm);
}

/*
 * MessageBar is a component used to display a message on the screen. It is typically used to display 
 * the results of submitting a form. It can also be used to provide informational breakout.
 *
 * Copyright © 2022 App Nerds LLC
*/

class MessageBar extends HTMLElement {
  constructor() {
    super();

    this.messageType = this.getAttribute("message-type") || "info";
    this.message = this.getAttribute("message") || "";

    this.containerEl = null;
  }

  connectedCallback() {
    this.containerEl = this.createContainerEl();
    const closeButtonEl = this.createCloseButtonEl();
    const textEl = this.createTextEl();

    this.containerEl.insertAdjacentElement("beforeend", closeButtonEl);
    this.containerEl.insertAdjacentElement("beforeend", textEl);

    this.insertAdjacentElement("beforeend", this.containerEl);
  }

  createContainerEl() {
    const el = document.createElement("div");
    el.classList.add("message-bar");

    switch (this.messageType) {
      case "error":
        el.classList.add("message-bar-error");
        break;

      case "warn":
        el.classList.add("message-bar-warn");
        break;

      case "info":
        el.classList.add("message-bar-info");
        break;

      case "success":
        el.classList.add("message-bar-success");
        break;
    }

    return el;
  }

  createCloseButtonEl() {
    const el = document.createElement("span");
    el.innerHTML = "&times;";

    el.addEventListener("click", () => {
      if (this.containerEl) {
        this.containerEl.remove();
      }
    });

    return el;
  }

  createTextEl() {
    const el = document.createElement("p");
    el.setAttribute("role", "alert");
    el.innerHTML = this.message;

    return el;
  }
}

customElements.define("message-bar", MessageBar);

/*
 * Copyright © 2022 App Nerds LLC
 */

var frame = {
  alertPosition,
  alert,
  confirm,
  PopupMenu,
  PopupMenuItem,
  showPopup,
  hidePopup,
  shim,
  spinner,
  fetcher,
  GraphQL,
  debounce,
  objectToMap,
  SessionService,
  ErrTokenExpired,
  application,
  BaseView,
  MemberLoginBar,
  MemberService,
  GoogleLoginForm,
  MessageBar,
};

export { frame as default };
