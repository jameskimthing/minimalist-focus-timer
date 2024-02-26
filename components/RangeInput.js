class RangeInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const name = this.getAttribute("name");

    const max = this.getAttribute("max") || 100;
    const step = this.getAttribute("step") || 1;
    const value = this.getAttribute("value");

    this.shadowRoot.innerHTML = `
      <style>
        .settings-slider-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .settings-slider-info-wrapper {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          width: 100%;
          font-size: 14px;
        }
        
        input {
          margin-left: -2px;
          width: 100%;
          height: 5px;
          background: transparent;
          outline: none;
          cursor: pointer;
          border-radius: 10px;
        }

        input::-moz-range-track,
        input::-moz-range-progress {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          background: #4a5d79;
        }

        input::-moz-range-progress {
          background: var(--color-current-session);
        }

        input::-moz-range-thumb {
          appearance: none;
          margin: 0;
          height: 12px;
          width: 12px;
          background: var(--color-current-session);
          border-radius: 100%;
          border: 0;
        }
        
        </style>
    
      <div class="settings-slider-wrapper">
        <div class="settings-slider-info-wrapper">
          <span name="inputInfoName">${name}</span>
          <span name="inputInfoValue"></span>
        </div>
        <input type="range" name="sessionLength" min="0" max="${max}" step="${step}">
      </div>`;

    this.updateSettingsSlider();
    const input = this.shadowRoot.querySelector("input");
    if (value) input.value = value;

    input.addEventListener("input", async () => {
      this.updateSettingsSlider();
    });
  }

  updateSettingsSlider() {
    const step = this.getAttribute("step") || 1;
    const type = this.getAttribute("type") || "mins";
    const inputInfoValue = this.shadowRoot.querySelector(
      'span[name="inputInfoValue"]'
    );

    const slider = this.shadowRoot.querySelector("input");
    slider.step = step;
    const sliderValue = Math.max(slider.value, 1);

    if (type === "mins") {
      const value = sliderValue * 60 * 1000 + TIMER_PADDING;
      inputInfoValue.innerText = durationToString(value, { isVerbose: true });
    } else {
      const innerText = `${sliderValue} round${sliderValue > 1 ? "s" : ""}`;
      inputInfoValue.innerText = innerText;
    }

    this.dispatchEvent(
      new CustomEvent("range-input", {
        bubbles: true,
        composed: true,
        detail: { value: Math.max(1, slider.value) },
      })
    );
  }

  static get observedAttributes() {
    return ["step", "value"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "value") {
      const slider = this.shadowRoot.querySelector("input");
      slider.value = newValue;
    }
    if (oldValue !== newValue) this.updateSettingsSlider();
  }
}

customElements.define("range-input", RangeInput);
