import { Pane } from "tweakpane";
import type { ListBladeApi } from "tweakpane";
import type { FolderApi } from "@tweakpane/core";
import { config, FACE_SIZE, type Config } from "./index.ts";
import { shapeDefaults, type Shape } from "./features/shapes.ts";
import type { Group } from "./features/groups.ts";
import { syncConfigToUrl } from "./url.ts";

const pane = new Pane();
const center = FACE_SIZE / 2;

function getFjesElement():
  | (HTMLElement & { render(config: Config): void })
  | null {
  return document.querySelector("fjes-fjes") as
    | (HTMLElement & { render(config: Config): void })
    | null;
}

function render() {
  getFjesElement()?.render(config);
}

// --- Options & helpers ---

const shapeTypeOptions: Array<{ text: string; value: Shape["type"] }> = [
  { text: "Line", value: "line" },
  { text: "Circle", value: "circle" },
  { text: "Dot", value: "dot" },
  { text: "Curve", value: "curve" },
  { text: "Wave", value: "wave" },
  { text: "U shape", value: "ushape" },
  { text: "Triangle", value: "triangle" },
  { text: "L shape", value: "lshape" },
  { text: "D shape", value: "dshape" },
];

const positionOpts = {
  x: { min: -center, max: FACE_SIZE },
  y: { min: -center, max: FACE_SIZE },
};

const pointOpts = () => ({
  picker: "inline" as const,
  expanded: true,
  step: 1,
  x: { min: -center, max: center, format: (v: number) => v.toFixed(2) },
  y: { min: -center, max: center, format: (v: number) => v.toFixed(2) },
});

// --- Shape bindings ---

function addShapeBindings(folder: FolderApi, shape: Shape) {
  switch (shape.type) {
    case "line":
      folder.addBinding(shape, "length", { min: 1, max: 50 });
      folder.addBinding(shape, "rotate", {
        min: 0,
        max: 360,
        format: (v: number) => v.toFixed(0),
      });
      break;
    case "circle":
      folder.addBinding(shape, "radius", { min: 1, max: 25 });
      folder.addBinding(shape, "strokeWidth", { min: 1, max: 20 });
      break;
    case "dot":
      folder.addBinding(shape, "size", { min: 1, max: 20 });
      break;
    case "curve":
      for (const key of ["start", "end", "q1", "q2", "q3", "q4"] as const) {
        folder.addBinding(shape, key, pointOpts());
      }
      break;
    case "wave":
      folder.addBinding(shape, "width", { min: 1, max: 80 });
      folder.addBinding(shape, "amplitude", { min: 1, max: 20 });
      folder.addBinding(shape, "frequency", { min: 1, max: 5, step: 1 });
      break;
    case "ushape":
      folder.addBinding(shape, "width", { min: 1, max: 80 });
      folder.addBinding(shape, "height", { min: 1, max: 40 });
      folder.addBinding(shape, "inverted");
      break;
    case "triangle":
      folder.addBinding(shape, "size", { min: 1, max: 20 });
      break;
    case "lshape":
      folder.addBinding(shape, "width", { min: 1, max: 30 });
      folder.addBinding(shape, "height", { min: 1, max: 30 });
      folder.addBinding(shape, "mirrored");
      folder.addBinding(shape, "rotate", {
        min: 0,
        max: 360,
        format: (v: number) => v.toFixed(0),
      });
      break;
    case "dshape":
      folder.addBinding(shape, "width", { min: 1, max: 30 });
      folder.addBinding(shape, "depth", { min: 1, max: 30 });
      folder.addBinding(shape, "rotate", {
        min: 0,
        max: 360,
        format: (v: number) => v.toFixed(0),
      });
      break;
  }
}

// --- Layer folder ---

function buildLayerFolder(
  parentFolder: FolderApi,
  group: Group,
  layerIndex: number,
) {
  const layerFolder = parentFolder.addFolder({
    title: `Layer ${layerIndex + 1}`,
    expanded: layerIndex === 0,
  });

  const typeBlade = layerFolder.addBlade({
    view: "list",
    label: "type",
    options: shapeTypeOptions,
    value: group.layers[layerIndex]!.type,
  }) as ListBladeApi<Shape["type"]>;

  function buildSettings() {
    // Remove everything after the type blade
    while (layerFolder.children.length > 1) {
      layerFolder.remove(
        layerFolder.children[layerFolder.children.length - 1]!,
      );
    }

    addShapeBindings(layerFolder, group.layers[layerIndex]!);
  }

  buildSettings();

  typeBlade.on("change", (ev) => {
    const newType = ev.value;
    if (newType === group.layers[layerIndex]!.type) return;
    group.layers[layerIndex] = structuredClone(shapeDefaults[newType]);
    buildSettings();
    render();
  });

  return layerFolder;
}

// --- Group folder ---

function buildGroupFolder(group: Group, groupIndex: number): FolderApi {
  const folder = pane.addFolder({
    title: group.name,
    expanded: true,
  });

  // Editable name
  folder.addBinding(group, "name").on("change", (ev) => {
    folder.title = ev.value;
  });

  // Position
  folder.addBinding(group, "position", positionOpts);

  // Mirror settings
  const mirrorFolder = folder.addFolder({
    title: "Mirror",
    expanded: group.mirrored,
  });
  mirrorFolder.addBinding(group, "mirrored");
  mirrorFolder.addBinding(group, "distance", { min: 0, max: 100 });
  mirrorFolder.addBinding(group, "blink");

  // Depth (parallax intensity)
  folder.addBinding(group, "depth", { min: 0, max: 5, step: 0.5 });

  // Layers
  for (let i = 0; i < group.layers.length; i++) {
    buildLayerFolder(folder, group, i);
  }

  // Remove group button
  if (config.groups.length > 1) {
    folder.addButton({ title: "Remove Group" }).on("click", () => {
      config.groups.splice(groupIndex, 1);
      rebuildAll();
      render();
    });
  }

  return folder;
}

// --- Pane management ---

const addGroupButton = pane.addButton({ title: "+ Add Group" });
addGroupButton.on("click", () => {
  config.groups.push({
    name: `Group ${config.groups.length + 1}`,
    position: { x: 0, y: 0 },
    mirrored: false,
    distance: 0,
    blink: false,
    depth: 2,
    layers: [structuredClone(shapeDefaults.dot)],
  });
  rebuildAll();
  render();
  syncConfigToUrl(config);
});

let groupFolders: FolderApi[] = [];

function rebuildAll() {
  for (const f of groupFolders) pane.remove(f);
  groupFolders = [];

  for (let i = 0; i < config.groups.length; i++) {
    groupFolders.push(buildGroupFolder(config.groups[i]!, i));
  }
}

rebuildAll();

// --- Global change handler ---

pane.on("change", () => {
  render();
  syncConfigToUrl(config);
});

// --- URL hash change handler ---

window.addEventListener("hashchange", () => {
  // Reload page to re-initialize from new hash
  window.location.reload();
});
