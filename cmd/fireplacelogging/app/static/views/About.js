import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";

export default class About extends BaseView {
  constructor(params) {
    super(params);
  }
  
  async render() {
    this.innerHTML = `
      <title>About</title>

      <h1>About</h1>

      <p>
        Welcome to the start JavaScript application. This is a template for building SPA JavaScript applications
        using basic web technologies, such as CSS3, ES6 JavaScript, and Web Components. It makes use of a 
        small library called <strong>nerdwebjs</strong>.
      </p>

      <ul>
        <li>Go 1.18 for building your API</li>
        <li>REST (<a href="https://github.com/app-nerds/nerdweb">nerdweb</a>) and GraphQL (<a href="https://gqlgen.com">gqlgen</a>)</li>
        <li><a href="https://github.com/app-nerds/nerdwebjs">nerdwebjs</a></li>
      </ul>      
    `;
  }

  async afterRender() {
    // Do any initialization, event binding, etc... here
  }
}

customElements.define("about-page", About);

