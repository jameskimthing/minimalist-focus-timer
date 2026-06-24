class RangeInput extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.loadSettingsData();

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
          <span name="inputInfoName">${this.name}</span>
          <span name="inputInfoValue"></span>
        </div>
        <input type="range" name="sessionLength" min="0" max="${this.max}" step="${this.step}">
      </div>`;

    const input = this.shadowRoot.querySelector("input");

    this.setSettingsSlider();

    input.addEventListener("input", async (event) => {
      this.updateSettingsSlider();
    
      // Update settings 
      const val = event.currentTarget.value * 60 * 1000 + TIMER_PADDING;
      this.type === "mins"
        ? (SETTINGS.sessionLength[this.key] = val)
        : (SETTINGS[this.key] = event.currentTarget.value);
      
      localStorage.setItem(sessionsToLocalStorage[this.id], event.currentTarget.value);
      
      sendMessage("update_settings", SETTINGS);
    });

  }

  // Added: Loading all variables in one place
  loadSettingsData() {
    this.id = this.getAttribute("id");
    this.key = this.getAttribute("key");
    this.name = this.getAttribute("name");
    this.step = this.getAttribute("step") || 1;
    this.type = this.getAttribute("type") || "mins";
    this.value = this.getAttribute("value") || (this.type==="mins")?SETTINGS.sessionLength[this.key]:SETTINGS.sessionRounds;
    this.max = this.getAttribute("max") || 100;
  }

  // Updated: update slider settings, when the component is already loaded
  updateSettingsSlider() {
    const inputInfoValue = this.shadowRoot.querySelector(
      'span[name="inputInfoValue"]'
    );

    const slider = this.shadowRoot.querySelector("input");
    const sliderValue = Math.max(slider.value, 1);

    if (this.type === "mins") {
      const value = sliderValue * 60 * 1000 + TIMER_PADDING;
      inputInfoValue.innerText = durationToString(value, { isVerbose: true });
    } else {
      const innerText = `${sliderValue} round${sliderValue > 1 ? "s" : ""}`;
      inputInfoValue.innerText = innerText;
    }
  }

  // Added: update slider settings when the component is loading 
  setSettingsSlider() {
    const inputInfoValue = this.shadowRoot.querySelector(
      'span[name="inputInfoValue"]'
    );

    const slider = this.shadowRoot.querySelector("input");
    slider.step = this.step;

    if (this.type === "mins") {
      const sliderValue = Math.max(SETTINGS.sessionLength[this.key], 1);
      slider.value = millisecondToMinutes(sliderValue);
      inputInfoValue.innerText = durationToString(sliderValue, { isVerbose: true });
    } else {
      const sliderValue = Math.max(SETTINGS.sessionRounds, 1);
      slider.value = sliderValue;
      const innerText = `${sliderValue} round${sliderValue > 1 ? "s" : ""}`;
      inputInfoValue.innerText = innerText;
    }
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


