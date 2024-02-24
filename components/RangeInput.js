/**
 * This is too specific to be a web component.
 * TODO: Generalize
 */
class RangeInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    console.log("outside");
    console.log(SETTINGS);
    ensureInitialized().then(() => {
      console.log("inside");
      console.log(SETTINGS);
      this.updateComponent();
      this.updateSettingsSlider();
      this.shadowRoot
        .querySelector("input")
        .addEventListener("input", async () => {
          this.updateSettingsSlider();
          await sendMessage("update_settings", SETTINGS);
        });
    });
  }

  updateComponent() {
    const name = this.getAttribute("name");
    const key = this.getAttribute("key");
    const min = this.getAttribute("min") || 1;
    const max = this.getAttribute("max") || 100;
    const type = this.getAttribute("type") || "mins";

    let value;
    switch (type) {
      case "mins":
        value = (SETTINGS.sessionLength[key] - TIMER_PADDING) / 60 / 1000;
        break;
      case "rounds":
        value = SETTINGS[key];
        break;
    }

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
        margin-left: 2px;
        width: 100%;
      }
      
      input {
        width: 100%;
        height: 5px;
        background: #ddd;
        outline: none;
        opacity: 0.7;
        cursor: pointer;
      }
    </style>

    <div class="settings-slider-wrapper">
      <div class="settings-slider-info-wrapper">
        <span name="inputInfoName">${name}</span>
        <span name="inputInfoValue"></span>
      </div>
      <input type="range" name="sessionLength" min="${min}" max="${max}" step="1" value="${value}">
    </div>`;
  }

  updateSettingsSlider() {
    const type = this.getAttribute("type") || "mins";
    const key = this.getAttribute("key");
    const inputInfoValue = this.shadowRoot.querySelector(
      'span[name="inputInfoValue"]'
    );
    const slider = this.shadowRoot.querySelector("input");

    switch (type) {
      case "mins":
        const value = slider.value * 60 * 1000 + TIMER_PADDING;
        inputInfoValue.innerText = durationToString(value, { isVerbose: true });
        SETTINGS.sessionLength[key] = value;
        break;
      case "rounds":
        inputInfoValue.innerText =
          slider.value + " round" + (slider.value > 1 ? "s" : "");
        SETTINGS[key] = slider.value;
        break;
    }
  }
}

customElements.define("range-input", RangeInput);
