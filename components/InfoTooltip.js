class InfoTooltip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.updateComponent();
  }

  updateComponent() {
    const text = this.getAttribute("text");
    const direction = this.getAttribute("direction") || "bottom"; // top, bottom, left, right
    const distance = this.getAttribute("distance") || 2;
    const slot = this.children[0];

    this.shadowRoot.innerHTML = `
      <style>
        .tooltip {
          background-color: #212121;
          color: white;
          padding: 4px 8px;
          border-radius: 5px;
          position: absolute;
          z-index: 5;
          font-size: 12px;
          
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.3s, visibility 0.3s;
        }

        .tooltip.show {
          opacity: 1;
          visibility: visible;
        }
      </style>
    
      <slot></slot>
      <span class="tooltip">${text}</span>
    `;

    const tooltip = this.shadowRoot.querySelector(".tooltip");
    this.matchLocationWithDirection(slot, tooltip, direction, distance);

    let timeout;
    slot.addEventListener("mouseenter", () => {
      timeout = setTimeout(() => {
        tooltip.classList.add("show");
      }, 300);
    });

    slot.addEventListener("mouseleave", () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      tooltip.classList.remove("show");
    });
  }

  matchLocationWithDirection(slot, tooltip, direction, distance) {
    const slotRect = slot.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    switch (direction) {
      case "left":
        tooltip.style.left = `${
          slotRect.left - tooltipRect.width - distance
        }px`;
        tooltip.style.top = `${
          slotRect.top + slotRect.height / 2 - tooltipRect.height / 2
        }px`;
        break;
      case "right":
        tooltip.style.left = `${slotRect.right + distance}px`;
        tooltip.style.top = `${
          slotRect.top + slotRect.height / 2 - tooltipRect.height / 2
        }px`;
        break;
      case "top":
        tooltip.style.top = `${slotRect.top - tooltipRect.height - distance}px`;
        tooltip.style.left = `${slotRect.left - tooltipRect.width / 2}px`;
        break;
      case "bottom":
        tooltip.style.top = `${slotRect.bottom + distance}px`;
        tooltip.style.left = `${
          slotRect.left - (tooltipRect.width - slotRect.width) / 2
        }px`;
        break;
      default:
        throw new Error("Invalid direction");
    }
  }
}

customElements.define("info-tooltip", InfoTooltip);
