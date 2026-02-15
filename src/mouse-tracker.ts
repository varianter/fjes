class MouseTracker extends HTMLElement {
  private rect: DOMRect | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private variablePrefix = "--mouse";

  constructor() {
    super();
    if (this.getAttribute("variable-name") !== null) {
      this.variablePrefix =
        this.getAttribute("variable-name") || this.variablePrefix;
    }
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  connectedCallback(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateRect();
    });

    this.resizeObserver.observe(this);

    document.addEventListener("mousemove", this.handleMouseMove, {
      passive: true,
    });

    this.updateRect();

    this.style.setProperty(`${this.variablePrefix}-x`, "0");
    this.style.setProperty(`${this.variablePrefix}-y`, "0");
  }

  disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    document.removeEventListener("mousemove", this.handleMouseMove);
  }

  private updateRect(): void {
    this.rect = this.getBoundingClientRect();
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.rect) return;

    const centerX = this.rect.left + this.rect.width / 2;
    const centerY = this.rect.top + this.rect.height / 2;

    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;

    // Normalize to -1 to 1 range based on element dimensions
    const normalizedX = deltaX / (this.rect.width / 2);
    const normalizedY = deltaY / (this.rect.height / 2);

    // Clamp values to reasonable range (allow some overflow for outside tracking)
    const clampedX = Math.max(-2, Math.min(2, normalizedX));
    const clampedY = Math.max(-2, Math.min(2, normalizedY));

    this.style.setProperty(`${this.variablePrefix}-x`, clampedX.toFixed(3));
    this.style.setProperty(`${this.variablePrefix}-y`, clampedY.toFixed(3));
  }
}

// Register the custom element
customElements.define("mouse-tracker", MouseTracker);
