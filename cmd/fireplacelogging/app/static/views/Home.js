import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";
// import { fadeAndScrollInElements } from "../js/services/UIService.js";

export default class Home extends BaseView {
  constructor(params) {
    super(params);
  }

  async render() {
    this.innerHTML = `
      <title>Home</title>

      <section class="hero-banner">
        <div class="description">
          <h2>Capture and view structured application logs.</h2>
          <p>
            Fireplace is a set of tools for capturing and viewing structured log entries
            from your applications. Fireplace Server is an HTTP server designed to capture
            log information in JSON format, which is both machine and human friendly! And
            best of all, it's open source!
          </p>
        </div>

        <img src="/static/images/screen.webp" alt="Picture of an administrative dashboard" />
      </section>

      <section class="about" id="about">
        <div>
          <h2>Simple Logging</h2>

          <article>
            <h3>00. Easy to Use</h3>
            <p>
              Fireplace is designed to do one thing: capture logs. It does this through
              an HTTP REST interface where you POST a structured JSON object it
              capture it. Easy.
            </p>
          </article>

          <article>
            <h3>01. Structured</h3>
            <p>
              Logs are sent to Fireplace using JSON. It's simple. There are four
              required fields: application, time, message, and level. The "details"
              field is optional.
            </p>

            <code>
              {<br />
                &nbsp;&nbsp;"application": "my custom application",<br />
                &nbsp;&nbsp;"time": "2022-06-15T01:28:09Z",<br />
                &nbsp;&nbsp;"message": "This is where your primary message goes",<br />
                &nbsp;&nbsp;"level": "info",<br />
                &nbsp;&nbsp;"details": [<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;{<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key": "userName",<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"value": "Add additional key/value pairs, like user information..."<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;},<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;{<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key": "pageSize",<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"value": "or request information..."<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;}<br />
                &nbsp;&nbsp;]<br />
              }
            </code>
          </article>

          <article>
            <h3>02. Searchable</h3>
            <p>
              Fireplace offers REST endpoints to search for log entries by application
              name, log level, and general search terms.
            </p>
          </article>
        </div>

        <aside>
          <img src="/static/images/phone.webp" alt="Image of a phone with a graph" />
        </aside>
      </section>

      <section class="call-to-action" id="getfireplace">
        <h2>Get Fireplace</h2>

        <p>
          Fireplace Server is written in Go, making it easy to compile and install on your
          platform of choice, be it AWS, Azure, GCP, or even a virtual private server.
          The easiest way to get started is to click on the button below, clone the code,
          and run <span class="run-code">docker compose up</span>!
        </p>

        <button id="getFireplace">Get Fireplace</button>
      </section>
    `;
  }

  async afterRender() {
    // const fadeScrollInElements = document.getElementsByClassName("fade-scroll-in");
    // const fadeInElements = document.getElementsByClassName("fade-in");

    // document.addEventListener("wheel", () => {
    //   fadeAndScrollInElements(fadeScrollInElements);
    //   fadeAndScrollInElements(fadeInElements);
    // }, { capture: false, passive: true });
  }
}

customElements.define("home-page", Home);
