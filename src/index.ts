import {
  renderAllGroups,
  defaultConfig,
  type Config,
} from "./features/groups.ts";
import { helperDot } from "./utils.ts";
import { loadConfigFromUrl } from "./url.ts";

export const FACE_SIZE = 100;
const HALF = FACE_SIZE / 2;

export type { Config };

const configFromUrl = loadConfigFromUrl();
export const config: Config = configFromUrl ?? structuredClone(defaultConfig);

const sheet = new CSSStyleSheet();

sheet.replaceSync(/*css*/ `
  :host {
    display: inline-block;
    --depth: 1.5;
    --scale-down: 0.3;
    transform:
      perspective(800px)
      rotateY(calc(atan2(var(--mouse-x) * var(--scale-down), var(--depth))))
      rotateX(calc(atan2(var(--mouse-y) * (var(--scale-down) * -1), var(--depth))));
    /*transition: transform 0.15s ease-out;*/
  }

  :host([debug]) {
    transform: none;
  }

  @keyframes breathe {
    0%, 100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-2px) scale(1.005); }
  }

  svg.fjes {
    overflow: visible;
    font-family: system-ui;
    background: #FFD02F;
    color: #282828;
    border-radius: 1rem;
    animation: breathe 4s ease-in-out infinite;
  }

  /* Universal shape styles */
  .shape {
    stroke-width: 5px;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke: currentColor;
    fill: none;
  }

  .shape-filled {
    fill: currentColor;
  }

  .shape-no-stroke {
    stroke: none;
  }

  /* Blink animation */
  @keyframes blink {
    0%    { clip-path: inset(0); }
    98%   { clip-path: inset(0); }
    100%  { clip-path: inset(100% 0 0 0); }
  }

  .blink {
    animation: blink 3s infinite alternate ease-in-out;
  }

  /* Mouse parallax for groups */
  .group {
    transform: translate(
      calc(var(--mouse-x) * var(--offset, 2px)),
      calc(var(--mouse-y) * var(--offset, 2px))
    );
    /*transition: transform 0.2s ease-out;*/
  }

  :host([debug]) .group {
    transform: none;
  }

  /* Debug helpers */
  text { font-size: 5px; }

  .helpers {
    opacity: 0;
  }

  :host([debug]) .helpers {
    opacity: 1;
  }

  .helpers line {
    stroke: oklch(0.63 0.26 29.23 / 0.12);
  }

  [hidden] {
    display: none;
  }
`);

class FjesElement extends HTMLElement {
  static observedAttributes = ["mode"];
  private root: ShadowRoot;
  mode = "hard";

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];
    if (this.shadowRoot === null) {
      throw new Error("Shadow root is not available");
    }
    this.root = this.shadowRoot;
    this.mode = this.getAttribute("mode") || "hard";
  }

  render(currentConfig: Config) {
    // Collect curve control points for debug helpers
    const curveHelpers: string[] = [];
    for (const group of currentConfig.groups) {
      for (const layer of group.layers) {
        if (layer.type === "curve") {
          curveHelpers.push(
            helperDot(layer.start, "start"),
            helperDot(layer.end, "end"),
            helperDot(layer.q1, "q1"),
            helperDot(layer.q2, "q2"),
            helperDot(layer.q3, "q3"),
            helperDot(layer.q4, "q4"),
          );
        }
      }
    }

    this.root.innerHTML = /*html*/ `
    <svg class="fjes" viewBox="-${HALF} -${HALF} ${FACE_SIZE} ${FACE_SIZE}" width="200" height="200">
      ${renderAllGroups(currentConfig)}
      <g class="helpers">
        <line x1="-${HALF}" y1="0" x2="${HALF}" y2="0" stroke="red" stroke-width="0.5" />
        <line x1="0" y1="-${HALF}" x2="0" y2="${HALF}" stroke="red" stroke-width="0.5" />
        ${curveHelpers.join("\n")}
      </g>
    </svg>`;
  }

  connectedCallback() {
    this.render(config);
  }
}

customElements.define("fjes-fjes", FjesElement);
