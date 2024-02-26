class CheckboxInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const checked = this.getAttribute("checked");
    const label = this.getAttribute("label");

    this.shadowRoot.innerHTML = `
    <style>
      .container {
        display: block;
        position: relative;
        height: 20px;
        padding-left: 25px;
        cursor: pointer;
        font-size: 14px;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* Hide the browser's default checkbox */
      .container input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }
      
      /* Create a custom checkbox */
      .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: 20px;
        width: 20px;
        background-color: #4a5d79;
        border-radius: 5px;
      }
      
      /* On mouse-over, add a grey background color */
      .container:hover input ~ .checkmark {
        background-color: #556c8b;
      }
      
      /* When the checkbox is checked, add a blue background */
      .container input:checked ~ .checkmark {
        background-color: var(--color-current-session);
      }
      
      /* Create the checkmark/indicator (hidden when not checked) */
      .checkmark:after {
        content: "";
        position: absolute;
        display: none;
      }
      
      /* Show the checkmark when checked */
      .container input:checked ~ .checkmark:after {
        display: block;
      }
      
      /* Style the checkmark/indicator */
      .container .checkmark:after {
        left: 6px;
        top: 2px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 3px 3px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg) scale(1);
      }
    </style>

    <label class="container">
      <input type="checkbox">
      <span class="checkmark"></span>
      ${label}
    </label>`;

    const checkbox = this.shadowRoot.querySelector("input");
    if (checked == "true") checkbox.setAttribute("checked", "true");
    else checkbox.removeAttribute("checked");

    checkbox.addEventListener("click", async () => {
      const checked = checkbox.getAttribute("checked");
      if (checked == "true") checkbox.removeAttribute("checked");
      else checkbox.setAttribute("checked", "true");

      this.dispatchEvent(
        new CustomEvent("checkbox-input", {
          bubbles: true,
          composed: true,
          detail: { value: checkbox.getAttribute("checked") },
        })
      );
    });
  }

  updateComponent() {}

  static get observedAttributes() {
    return ["checked"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == "checked") {
      const checkbox = this.shadowRoot.querySelector("input");
      if (newValue == "true") checkbox.setAttribute("checked", "true");
      else checkbox.removeAttribute("checked");
    }
    if (oldValue !== newValue) this.updateComponent();
  }
}

customElements.define("checkbox-input", CheckboxInput);

// <style>
// input {
//   -ms-transform: scale(1.4);
//   -moz-transform: scale(1.4);
//   -webkit-transform: scale(1.4);
//   -o-transform: scale(1.4);
//   transform: scale(1.4);
//   padding: 10px;
//   accent-color: var(--color-current-session);
//   outline: none;
//   cursor: pointer;
// }

// label {
//   cursor: pointer;
//   display: flex;
//   flex-direction: row;
//   align-items: center;
//   gap: 5px;
//   font-size: 14px;
// }

// </style>
