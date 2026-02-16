import { Pane } from "tweakpane";
import type { ListBladeApi } from "tweakpane";
import type { FolderApi } from "@tweakpane/core";
import { config, FACE_SIZE, type Config } from "./index.ts";
import {
  shapeDefaults,
  shapeFields,
  type Shape,
  type FieldDef,
} from "./features/shapes.ts";
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

// --- Shape bindings (data-driven from shapeFields) ---

function addShapeBindings(folder: FolderApi, shape: Shape) {
  const fields = shapeFields[shape.type];

  for (const [key, def] of Object.entries(fields) as [string, FieldDef][]) {
    switch (def.kind) {
      case "number":
        folder.addBinding(shape, key as keyof typeof shape, {
          min: def.min,
          max: def.max,
          ...(def.step != null ? { step: def.step } : {}),
        });
        break;

      case "boolean":
        folder.addBinding(shape, key as keyof typeof shape);
        break;

      case "point":
        folder.addBinding(shape, key as keyof typeof shape, {
          picker: "inline" as const,
          expanded: true,
          ...(def.step != null ? { step: def.step } : {}),
          x: {
            min: def.min,
            max: def.max,
            format: (v: number) => v.toFixed(2),
          },
          y: {
            min: def.min,
            max: def.max,
            format: (v: number) => v.toFixed(2),
          },
        });
        break;
    }
  }
}

// --- Shape section within a group folder ---

function buildShapeSection(folder: FolderApi, group: Group) {
  const shapeFolder = folder.addFolder({
    title: "Shape",
    expanded: true,
  });

  const typeBlade = shapeFolder.addBlade({
    view: "list",
    label: "type",
    options: shapeTypeOptions,
    value: group.shape.type,
  }) as ListBladeApi<Shape["type"]>;

  function buildSettings() {
    // Remove everything after the type blade
    while (shapeFolder.children.length > 1) {
      shapeFolder.remove(
        shapeFolder.children[shapeFolder.children.length - 1]!,
      );
    }

    addShapeBindings(shapeFolder, group.shape);
  }

  buildSettings();

  typeBlade.on("change", (ev) => {
    const newType = ev.value;
    if (newType === group.shape.type) return;
    group.shape = structuredClone(shapeDefaults[newType]);
    buildSettings();
    render();
  });

  return shapeFolder;
}

// --- Group folder ---

function buildGroupFolder(group: Group, groupIndex: number): FolderApi {
  const folder = pane.addFolder({
    title: group.name,
    expanded: false,
  });

  // Editable name
  folder.addBinding(group, "name").on("change", (ev) => {
    folder.title = ev.value;
  });

  // Position & rotate (spatial transforms)
  folder.addBinding(group, "position", positionOpts);
  folder.addBinding(group, "rotate", {
    min: 0,
    max: 360,
    format: (v: number) => v.toFixed(0),
  });

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

  // Shape
  buildShapeSection(folder, group);

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
    rotate: 0,
    mirrored: false,
    distance: 0,
    blink: false,
    depth: 2,
    shape: structuredClone(shapeDefaults.dot),
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
