import type { Point } from "./types";
import { renderShape, type Shape } from "./shapes";

// --- A group is a named, positioned collection of shape layers ---

export type Group = {
  name: string;
  position: Point;
  mirrored: boolean;
  distance: number;
  blink: boolean;
  layers: Shape[];
};

export type Config = {
  groups: Group[];
};

// --- Default face config ---

export const defaultConfig: Config = {
  groups: [
    {
      name: "Eyes",
      position: { x: 0, y: -10 },
      mirrored: true,
      distance: 24,
      blink: true,
      layers: [{ type: "line", length: 10, rotate: 0 }],
    },
    {
      name: "Nose",
      position: { x: 6, y: 0 },
      mirrored: false,
      distance: 0,
      blink: false,
      layers: [{ type: "line", length: 15, rotate: 0 }],
    },
    {
      name: "Mouth",
      position: { x: 0, y: 15 },
      mirrored: false,
      distance: 0,
      blink: false,
      layers: [{ type: "smile", width: 40, height: 15, inverted: false }],
    },
  ],
};

// --- Renders a single group (with optional mirroring + blink) ---

export function renderGroup(group: Group): string {
  const shapesMarkup = group.layers.map(renderShape).join("\n");
  const blinkClass = group.blink ? "blink" : "";

  if (group.mirrored) {
    return `
      <g class="group">
        <g transform="translate(${group.position.x} ${group.position.y})">
          <g class="${blinkClass}" transform="translate(${-group.distance / 2} 0)">
            ${shapesMarkup}
          </g>
          <g class="${blinkClass}" transform="translate(${group.distance / 2} 0) scale(-1, 1)">
            ${shapesMarkup}
          </g>
        </g>
      </g>`;
  }

  return `
    <g class="group">
      <g transform="translate(${group.position.x} ${group.position.y})">
        ${shapesMarkup}
      </g>
    </g>`;
}

// --- Renders all groups ---

export function renderAllGroups(config: Config): string {
  return config.groups.map(renderGroup).join("\n");
}