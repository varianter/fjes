# fjes

A customizable face generator with URL-based configuration sharing.

## Getting Started

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.html
```

## Features

### URL-Based Face Sharing

All face configurations are automatically synchronized to the URL hash, making it easy to save and share your creations:

- **Auto-sync**: Every change you make is immediately saved to the URL
- **Shareable links**: Copy the URL to share your face with others
- **Preset gallery**: Click any preset link to load that configuration
- **No database needed**: Everything is encoded in the URL itself

#### How it works

The face configuration (groups, layers, shapes, positions, etc.) is serialized to JSON, base64-encoded, and stored in the URL hash fragment:

```
https://example.com/#eyJncm91cHMiOlt7Im5hbWUiOi...
                      └─ base64-encoded config JSON
```

#### Saving and sharing faces

1. Adjust the face using the Tweakpane controls
2. Click **"📋 Copy link"** to copy the current URL
3. Share the URL with others or bookmark it for later

#### Creating a gallery

The preset faces in `index.html` are just regular links with pre-configured hashes. To add your own:

1. Create a face using the controls
2. Copy the URL hash
3. Add a new link to the presets section:

```html
<li>
  <a href="#YOUR_HASH_HERE">My Cool Face</a>
</li>
```

## Technical Details

- **Serialization**: `src/url.ts` handles config ↔ URL hash conversion
- **Config structure**: See `src/features/groups.ts` for the `Config` type
- **URL limits**: Default config is ~600 chars. Complex faces stay under 2,000 chars (well within browser limits)

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
