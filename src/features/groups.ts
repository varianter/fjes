import type { Point } from "./types";
import { renderShape, type Shape } from "./shapes";

// --- A group is a named, positioned, rotated shape ---
// Position and rotate are spatial transforms that apply universally to any shape.

export type Group = {
  name: string;
  position: Point;
  rotate: number;
  mirrored: boolean;
  distance: number;
  blink: boolean;
  depth: number;
  shape: Shape;
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
      rotate: 0,
      mirrored: true,
      distance: 24,
      blink: true,
      depth: 2,
      shape: { type: "line", length: 10 },
    },
    {
      name: "Nose",
      position: { x: 0, y: 0 },
      rotate: 0,
      mirrored: false,
      distance: 0,
      blink: false,
      depth: 4,
      shape: { type: "lshape", width: -5, height: 15 },
    },
    {
      name: "Mouth",
      position: { x: 0, y: 15 },
      rotate: 0,
      mirrored: false,
      distance: 0,
      blink: false,
      depth: 3,
      shape: { type: "ushape", width: 40, height: 15, inverted: false },
    },
  ],
};

// --- Renders a single group (with optional mirroring + blink) ---

export function renderGroup(group: Group): string {
  const shapeMarkup = renderShape(group.shape);
  const blinkClass = group.blink ? "blink" : "";
  const depthStyle = `--offset: ${group.depth}px`;
  const rotateTransform = group.rotate ? ` rotate(${group.rotate})` : "";

  if (group.mirrored) {
    return `
      <g class="group" style="${depthStyle}">
        <g transform="translate(${group.position.x} ${group.position.y})${rotateTransform}">
          <g class="${blinkClass}" transform="translate(${-group.distance / 2} 0)">
            ${shapeMarkup}
          </g>
          <g class="${blinkClass}" transform="translate(${group.distance / 2} 0) scale(-1, 1)">
            ${shapeMarkup}
          </g>
        </g>
      </g>`;
  }

  return `
    <g class="group" style="${depthStyle}">
      <g transform="translate(${group.position.x} ${group.position.y})${rotateTransform}">
        ${shapeMarkup}
      </g>
    </g>`;
}

// --- Renders all groups ---

export function renderAllGroups(config: Config): string {
  return config.groups.map(renderGroup).join("\n");
}
