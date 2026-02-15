import type { Point } from "./types";

// --- Discriminated union of all shape primitives ---

export type Shape =
  | { type: "line"; length: number; rotate: number }
  | { type: "circle"; radius: number; filled: boolean }
  | { type: "dot"; size: number }
  | {
      type: "curve";
      start: Point;
      end: Point;
      q1: Point;
      q2: Point;
      q3: Point;
      q4: Point;
    }
  | { type: "wave"; width: number; amplitude: number; frequency: number }
  | { type: "smile"; width: number; height: number; inverted: boolean }
  | { type: "triangle"; size: number };

// --- Defaults for each shape type ---

export const shapeDefaults: Record<Shape["type"], Shape> = {
  line: { type: "line", length: 10, rotate: 0 },
  circle: { type: "circle", radius: 5, filled: false },
  dot: { type: "dot", size: 4 },
  curve: {
    type: "curve",
    start: { x: -30, y: 0 },
    end: { x: 30, y: 0 },
    q1: { x: -30, y: 0 },
    q2: { x: -20, y: 20 },
    q3: { x: 0, y: 20 },
    q4: { x: 30, y: 0 },
  },
  wave: { type: "wave", width: 40, amplitude: 5, frequency: 2 },
  smile: { type: "smile", width: 40, height: 15, inverted: false },
  triangle: { type: "triangle", size: 8 },
};

// --- Universal shape renderer ---

export function renderShape(shape: Shape): string {
  switch (shape.type) {
    case "line":
      return `<path class="shape" d="m0,${(shape.length / 2) * -1} l0,${shape.length}" transform="rotate(${shape.rotate})" />`;

    case "circle":
      return `<circle class="shape${shape.filled ? " shape-filled" : ""}" r="${shape.radius}" />`;

    case "dot":
      return `<circle class="shape shape-filled shape-no-stroke" r="${shape.size}" />`;

    case "curve": {
      const { start, q1, q2, q3, q4, end } = shape;
      return `<path class="shape" d="M${start.x},${start.y} C${q1.x},${q1.y} ${q2.x},${q2.y} ${q3.x},${q3.y} S ${q4.x},${q4.y} ${end.x},${end.y}" />`;
    }

    case "wave": {
      const segments = shape.frequency * 2;
      const segmentWidth = shape.width / segments;
      let path = `M${-shape.width / 2},0`;
      for (let i = 0; i < segments; i++) {
        const x1 = -shape.width / 2 + i * segmentWidth;
        const x2 = x1 + segmentWidth;
        const xControl = x1 + segmentWidth / 2;
        const yControl = i % 2 === 0 ? shape.amplitude : -shape.amplitude;
        path += ` Q${xControl},${yControl} ${x2},0`;
      }
      return `<path class="shape" d="${path}" />`;
    }

    case "smile": {
      const controlY = shape.inverted ? -shape.height : shape.height;
      return `<path class="shape" d="M${-shape.width / 2},0 Q0,${controlY} ${shape.width / 2},0" />`;
    }

    case "triangle":
      return `<path class="shape shape-filled" d="M0,-${shape.size} L${shape.size / 2},0 L${-shape.size / 2},0 Z" />`;
  }
}