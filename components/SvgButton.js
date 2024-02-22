// SVG Images
/**
 * Initialized in javascript, to manually change their fill colors on the fly.
 * Using img.src does not allow this, as at that point it is no longer an svg.
 */
const SVG_ICONS = {
  pause: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.75 2.75h3.5v10.5h-3.5zm7 0h3.5v10.5h-3.5z"/></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.75 2.75v10.5L12.25 8z"/></svg>`,
  softReset: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.25 5.25h3m0 3.5c0 2.5-2.798 5.5-6.25 5.5a6.25 6.25 0 1 1 0-12.5c3.75 0 6.25 3.5 6.25 3.5v-3.5"/></svg>`,
  hardReset: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4m-5-3a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><circle cx="8" cy="8" r="1.75"/><path d="m6.75 1.75l-.5 1.5l-1.5 1l-2-.5l-1 2l1.5 1.5v1.5l-1.5 1.5l1 2l2-.5l1.5 1l.5 1.5h2.5l.5-1.5l1.5-1l2 .5l1-2l-1.5-1.5v-1.5l1.5-1.5l-1-2l-2 .5l-1.5-1l-.5-1.5z"/></g></svg>`,
  github: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.75 14.25s-.5-2 .5-3c0 0-2 0-3.5-1.5s-1-4.5 0-5.5c-.5-1.5.5-2.5.5-2.5s1.5 0 2.5 1c1-.5 3.5-.5 4.5 0c1-1 2.5-1 2.5-1s1 1 .5 2.5c1 1 1.5 4 0 5.5s-3.5 1.5-3.5 1.5c1 1 .5 3 .5 3m-5-.5c-1.5.5-3-.5-3.5-1"/></svg>`,
  skip: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.75 13.25L11.25 8l-8.5-5.25zm11.5-9.5v8.5"/></svg>`,
};

class SvgButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this.updateComponent();
  }

  updateComponent() {
    const icon = SVG_ICONS[this.getAttribute("icon-name")];
    const size = this.getAttribute("size") || "40px";
    this.shadowRoot.innerHTML = `
    <style>
        button {
            background: none;
            border: none;
            padding: 0;
            width: ${size};
            height: ${size};
            cursor: pointer;
        }
        svg {
            width: ${size};
            height: ${size};
            color: var(--color-gray);
            opacity: 0.6;
        }

        svg:hover {
            opacity: 1;
            color: var(--color-current-session);
        }
    </style>
    <button>${icon}<slot></slot></button>
    `;
  }

  static get observedAttributes() {
    return ["icon-name"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.updateComponent();
    }
  }
}

customElements.define("svg-button", SvgButton);
