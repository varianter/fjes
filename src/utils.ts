import type { Point } from "./features/types.ts";

export function helperDot({ x, y }: Point, label = "lol") {
  return `<g transform="translate(${x} ${y})">
    <circle class="helper-dot" cx="-0" cy="-0" r="1" fill="red"  />
    <text x="2" y="2">${label}</text>
  </g>`;
}
