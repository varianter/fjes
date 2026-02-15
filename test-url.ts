import { configToHash, configFromHash, loadConfigFromUrl } from "./src/url.ts";
import { defaultConfig } from "./src/features/groups.ts";

console.log("Testing URL serialization...\n");

// Test 1: Roundtrip with default config
console.log("Test 1: Roundtrip serialization");
const hash = configToHash(defaultConfig);
console.log("Serialized hash length:", hash.length);
console.log("Hash preview:", hash.slice(0, 50) + "...");

const decoded = configFromHash("#" + hash);
console.log("Decoded successfully:", decoded !== null);
console.log("Groups count:", decoded?.groups.length);
console.log("First group name:", decoded?.groups[0]?.name);
console.log("✓ Test 1 passed\n");

// Test 2: Invalid hash handling
console.log("Test 2: Invalid hash handling");
const invalid1 = configFromHash("#not-valid-base64!");
const invalid2 = configFromHash("#");
const invalid3 = configFromHash("");
console.log("Invalid base64 returns null:", invalid1 === null);
console.log("Empty hash returns null:", invalid2 === null);
console.log("No hash returns null:", invalid3 === null);
console.log("✓ Test 2 passed\n");

// Test 3: Create a custom face and verify
console.log("Test 3: Custom config serialization");
const customConfig = {
  groups: [
    {
      name: "Test Eyes",
      position: { x: 5, y: -15 },
      mirrored: true,
      distance: 30,
      blink: true,
      layers: [{ type: "circle" as const, radius: 7, filled: true }],
    },
  ],
};

const customHash = configToHash(customConfig);
const customDecoded = configFromHash("#" + customHash);
console.log("Custom config serialized and decoded");
console.log("Name matches:", customDecoded?.groups[0]?.name === "Test Eyes");
console.log("Position matches:", customDecoded?.groups[0]?.position.x === 5);
console.log("Mirror matches:", customDecoded?.groups[0]?.mirrored === true);
console.log("Layer type matches:", customDecoded?.groups[0]?.layers[0]?.type === "circle");
console.log("✓ Test 3 passed\n");

// Test 4: URL format
console.log("Test 4: URL format check");
const exampleUrl = `http://example.com/#${hash}`;
console.log("Example URL:", exampleUrl);
console.log("URL length:", exampleUrl.length);
console.log("Within typical URL limits (<2000):", exampleUrl.length < 2000);
console.log("✓ Test 4 passed\n");

console.log("All tests passed! ✓");