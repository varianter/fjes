import type { Point } from "./types";

// --- Field metadata for shape properties ---

type NumberField = { kind: "number"; min: number; max: number; step?: number };
type BooleanField = { kind: "boolean" };
type PointField = { kind: "point"; min: number; max: number; step?: number };

export type FieldDef = NumberField | BooleanField | PointField;

// --- Discriminated union of all shape primitives ---
// Shapes are pure geometry — spatial transforms (position, rotate) live on Group.

export type Shape =
  | { type: "line"; length: number }
  | { type: "circle"; radius: number; strokeWidth: number }
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
  | { type: "ushape"; width: number; height: number; inverted: boolean }
  | { type: "triangle"; size: number }
  | { type: "lshape"; width: number; height: number }
  | { type: "dshape"; width: number; depth: number };

// --- Defaults for each shape type ---

export const shapeDefaults: Record<Shape["type"], Shape> = {
  line: { type: "line", length: 10 },
  circle: { type: "circle", radius: 5, strokeWidth: 5 },
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
  ushape: { type: "ushape", width: 40, height: 15, inverted: false },
  triangle: { type: "triangle", size: 8 },
  lshape: { type: "lshape", width: 10, height: 10 },
  dshape: { type: "dshape", width: 10, depth: 10 },
};

// --- Field constraints per shape type ---
// Describes valid ranges and UI hints for each property.
// Consumed by tweakpane (or any future UI/validation).

export const shapeFields: Record<Shape["type"], Record<string, FieldDef>> = {
  line: {
    length: { kind: "number", min: 1, max: 50 },
  },
  circle: {
    radius: { kind: "number", min: 1, max: 25 },
    strokeWidth: { kind: "number", min: 1, max: 20 },
  },
  dot: {
    size: { kind: "number", min: 1, max: 20 },
  },
  curve: {
    start: { kind: "point", min: -50, max: 50, step: 1 },
    end: { kind: "point", min: -50, max: 50, step: 1 },
    q1: { kind: "point", min: -50, max: 50, step: 1 },
    q2: { kind: "point", min: -50, max: 50, step: 1 },
    q3: { kind: "point", min: -50, max: 50, step: 1 },
    q4: { kind: "point", min: -50, max: 50, step: 1 },
  },
  wave: {
    width: { kind: "number", min: 1, max: 80 },
    amplitude: { kind: "number", min: 1, max: 20 },
    frequency: { kind: "number", min: 1, max: 5, step: 1 },
  },
  ushape: {
    width: { kind: "number", min: 1, max: 80 },
    height: { kind: "number", min: 1, max: 40 },
    inverted: { kind: "boolean" },
  },
  triangle: {
    size: { kind: "number", min: 1, max: 20 },
  },
  lshape: {
    width: { kind: "number", min: -30, max: 30 },
    height: { kind: "number", min: 1, max: 30 },
  },
  dshape: {
    width: { kind: "number", min: 1, max: 30 },
    depth: { kind: "number", min: 1, max: 30 },
  },
};

// --- Universal shape renderer ---
// No transforms here — rotation is applied by the group.

export function renderShape(shape: Shape): string {
  switch (shape.type) {
    case "line":
      return `<path class="shape" d="m0,${(shape.length / 2) * -1} l0,${shape.length}" />`;

    case "circle":
      return `<circle class="shape" r="${shape.radius}" style="stroke-width: ${shape.strokeWidth}px" />`;

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

    case "ushape": {
      const controlY = shape.inverted ? -shape.height : shape.height;
      return `<path class="shape" d="M${-shape.width / 2},0 Q0,${controlY} ${shape.width / 2},0" />`;
    }

    case "triangle":
      return `<path class="shape shape-filled" d="M0,-${shape.size} L${shape.size / 2},0 L${-shape.size / 2},0 Z" />`;

    case "lshape": {
      const { width, height } = shape;
      const path = `M0,${-height} L0,0 L${width},0`;
      return `<path class="shape" d="${path}" />`;
    }

    case "dshape": {
      const { width, depth } = shape;
      const path = `M0,${-depth / 2} C${width},${-depth / 2} ${width},${depth / 2} 0,${depth / 2} Z`;
      return `<path class="shape" d="${path}" />`;
    }
  }
}
