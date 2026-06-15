---
name: agent-00-figma-analyzer
model: fast
---

# Agent 00: Figma Analyzer (React Native – Mobile Only)

**Role:** Extract design specifications from Figma **mobile frame only** for React Native implementation.  
**Trigger:** User invokes with Feature name, Mobile Figma URL, Mobile Frame name, Section description.  
**Output:** `.cursor/cache/figma-specs-{feature-name}.md`  
**Focus:** Mobile UI only. Extract what EXISTS in Figma. Output React Native–friendly: StyleSheet, ColorCode/COLORS, FONTS/fontFamily/fontSize, **fontWeight** (mandatory for every text node), spacing. No assumptions about interactivity, hover, or animations not present in the design.

**Asset extraction (automatic):** **Any asset (image or icon) in the given Figma screen must be extracted and managed automatically.** Steps 2.5 (SVG icons) and 2.6 (PNG/raster) run for **every** image and icon found in the frame hierarchy — no separate user instruction is required. Identify all icon/vector and image/raster nodes from the design context and export them; document placement (SVG path, or drawable + Xcode for PNG).

---

## 🚨 CRITICAL FILE LOCATION

**Save to:** `.cursor/cache/figma-specs-{feature-name}.md`  
**Not to:** `/docs/`, project root, or any other path.  
**Only:** ✅ `.cursor/cache/`

**Setup (required for asset export when no Figma MCP):** This project has **no Figma MCP** in the MCP folder (only browser-related MCPs). For Step 2.5 (SVG) and Step 2.6 (PNG) to run — e.g. for the Login page (M_Login_Screen, node-id 8-6335) — you **must** set **`FIGMA_ACCESS_TOKEN`** (or **`FIGMA_TOKEN`**) so the agent can use the Figma REST API to (1) get the frame's children and (2) export icons/images.

- **Where to set:** Copy `.env.example` to `.env` in the project root and set `FIGMA_ACCESS_TOKEN=<your-token>`. Or set in Cursor/IDE environment variables. **Never hardcode the token in repo or in agent files.**
- **Get token:** Figma → Settings → Account → Personal access tokens.
- **Usage:** When present, the agent uses the token for `GET https://api.figma.com/v1/files/{fileKey}/nodes?ids={nodeId}` (to get hierarchy/children) and `GET https://api.figma.com/v1/images/{fileKey}?ids={nodeIds}&format=svg|png` for export. Do not store the actual token in any agent or config committed to version control.

**Why Step 2.5 / 2.6 may not run for Login (or any screen):**
1. **No FIGMA_ACCESS_TOKEN** — Without it, the analyzer cannot call the Figma API. Steps 2.5 and 2.6 then only document assets in the spec and add a note to set the token and re-run.
2. **No Figma MCP** — The project does not have a Figma MCP. Design context and export must use the Figma REST API (see Step 2 alt and Step 2.5).
3. **Screen/frame node (e.g. Login 8-6335)** — The URL node-id is the **whole screen**. Exporting that node id yields the entire screen as one image, not individual icons. The analyzer must first **fetch the frame's children** via the API, then export only **child** node ids (VECTOR, image fill, etc.), not the frame id itself. See Step 2.4 below.

---

## 🎯 WORKFLOW (5 STEPS)

**Asset extraction:** Steps 2.5 (SVG icons) and 2.6 (PNG/raster) run **automatically** for every image and icon found in the frame. The user does not need to give separate instructions to export assets.

### STEP 1: Extract and Validate Input

**Required (4 items):**
1. **Feature name** (required) — kebab-case for filename (e.g. `product-card`, `auth-login`)
2. **Mobile Figma URL** (required) — must include `node-id` (e.g. `?node-id=488-37713`)
3. **Mobile Frame name** (required) — exact name from Figma layers
4. **Section description** (required) — what to analyze (e.g. "Product card with image, title, price, and CTA")

**Example invocation:**
```
@figma-analyzer

Feature name: product-card
Mobile URL: https://www.figma.com/design/ABC123/App?node-id=488-37713
Mobile Frame: Product Card Mobile
Section: Product card with image, title, price, and CTA
```

**Parse and validate:**
- `feature-name` → kebab-case; use as filename segment
- `fileKey` → from URL (segment after `/design/` and before next `/` or `?`)
- `nodeId` → from URL `node-id`; convert `488-37713` → `488:37713` (colon for MCP)
- `frame-name` → exact string from user (case-sensitive)
- `section-description` → from user

**If anything missing:** Reply with:
```
⚠️ Required for mobile analysis:

@figma-analyzer

Feature name: {kebab-case}
Mobile URL: {figma-url-with-node-id}
Mobile Frame: {exact frame name from Figma}
Section: {section description}
```

**Error handling:** If URL has no `node-id`, ask user to open the frame in Figma and copy link with node-id. If feature name has spaces or capitals, normalize to kebab-case.

---

### STEP 2: Query Figma (Mobile Frame Only)

Use Figma MCP **once** per invocation (mobile frame only). Check MCP tool descriptors in the project's MCP folder before calling.

**Recommended calls (use available MCP tools):**
- **Design context** — fileKey, nodeId in `488:37713` format → hierarchy, dimensions, fills, typography, layout
- **Screenshot** — fileKey, nodeId → visual reference for spec
- **Variable definitions** (optional) — if design uses variables; add Design Tokens subsection when present

**Extract from response:**
- Component hierarchy and node types (FRAME, GROUP, TEXT, RECTANGLE, etc.)
- Dimensions: width, height, x, y (in px)
- Colors: hex, rgba → map to ColorCode-style tokens (e.g. `ColorCode.backgroundColorFFFFFF`)
- **Typography (mandatory for every TEXT node):** fontFamily, fontSize, **fontWeight**, lineHeight, letterSpacing, textDecorationLine. **You MUST extract font weight** from each text node: use `style.fontWeight` (Figma API: 100–900, e.g. 400 = Regular, 500 = Medium, 700 = Bold) or `styleOverrideTable` when present. Record both the numeric value and the name (e.g. Regular/Medium/Bold) so the spec TYPOGRAPHY table and React Native mapping use the correct fontFamily token (e.g. MONTSERRAT_REGULAR, MONTSERRAT_MEDIUM, MONTSERRAT_BOLD). Do not omit weight when writing the spec.
- Spacing: padding, gap, itemSpacing (Auto Layout)
- Layout: layoutMode (HORIZONTAL/VERTICAL), primaryAxisAlignItems, counterAxisAlignItems → flexDirection, justifyContent, alignItems
- Effects: shadows (color, blur, offset), opacity
- Constraints: if present, note for RN layout
- **Assets (mandatory for extraction):** Identify **every** image and icon in the frame — image fills (photos, backgrounds), vector/icon nodes (VECTOR, BOOLEAN_OPERATION, COMPONENT used as icon), raster nodes. List each node id and type so Steps 2.5 and 2.6 can export them automatically; no separate instruction from the user is needed.

**Verify frame:** Compare expected `{frame-name}` with name from MCP response. If mismatch, note in spec: "Requested frame: X; analyzed node: Y" and proceed if node is the intended mobile frame.

**Do not assume:** Hover/active/focus states, animations, or behavior not visible in the design. Document only what is present.

**If MCP fails (e.g. connection, 404):** Save a partial spec with "Figma source: URL + node-id; MCP unavailable — complete from screenshot or re-run when Figma MCP is available" and still write layout/color/typography placeholders from user description if any.

**Step 2 when no Figma MCP is available:** Use the Figma REST API to get design context. **Requires FIGMA_ACCESS_TOKEN.**  
- **Request:** `GET https://api.figma.com/v1/files/{fileKey}/nodes?ids={nodeId}` (nodeId in colon format, e.g. `8:6335`).  
- **Header:** `X-Figma-Token: {FIGMA_ACCESS_TOKEN}`  
- **Response:** JSON with `nodes` containing the node and its **document** (children tree). Parse the document to extract hierarchy, node types (FRAME, GROUP, VECTOR, RECTANGLE, etc.), fills (including image fills), and typography. Use this to build the spec and to collect **child node ids** for Step 2.4 / 2.5 / 2.6.

---

### STEP 2.4: Get Frame Children (Required for Screen/Frame Nodes — e.g. Login 8-6335)

**Purpose:** When the user provides a **screen or frame** node (e.g. Login M_Login_Screen, node-id `8-6335`), the analyzer must get that frame's **children** (and optionally deeper descendants) to find icon and image nodes. **Do not export the frame id itself** — exporting `8:6335` produces the whole Login screen as one image, not the fingerprint icon or background image.

**When to run:** Always when the input node is a full screen or frame (e.g. M_Login_Screen, Frame 8429, any "Screen" or "Frame" in the name). Not needed when the input is already a single icon/component node.

**How:**
1. **If Figma MCP:** Use the MCP tool that returns the node document (design context) and parse the response for **children** of the frame.
2. **If Figma REST API (no MCP):** Call `GET https://api.figma.com/v1/files/{fileKey}/nodes?ids={frameId}` (e.g. `ids=8:6335`). Parse the response; traverse the returned `document` tree to collect every **descendant** node whose `type` is `VECTOR`, `BOOLEAN_OPERATION`, `COMPONENT`, or has an `image` fill (for PNG). Note each node's `id` and `name` (sanitize name for filename).
3. **Output:** A list of **child/descendant node ids** (e.g. fingerprint icon id, background image node id) and sanitized names. Use **only these ids** in Step 2.5 (SVG) and Step 2.6 (PNG). Never use the frame id (e.g. `8:6335`) for icon or image export.

**Example (Login):** Frame id `8:6335` (M_Login_Screen) → fetch nodes; from document find e.g. a child group "Use Touch ID" containing a VECTOR (fingerprint icon) with id `12:3456`, and a RECTANGLE with image fill (background) with id `12:3457`. Export `12:3456` as SVG (icon-fingerprint.svg) and `12:3457` as PNG (login_bg.png). Do **not** export `8:6335`.

---

### STEP 2.5: Export SVG Icons (Automatic — All Icons in Frame)

**Purpose:** Export **all** SVG-capable icons from the frame so development can use them directly (e.g. `react-native-svg` or `react-native-svg-transformer`). **Runs automatically** for every vector/icon node found; no separate user instruction required.

**Identify icon/vector nodes from design context (Step 2) or from Step 2.4 (screen/frame):**
- Node types that are typically icons: `VECTOR`, `BOOLEAN_OPERATION`, `COMPONENT` / `COMPONENT_SET` (when used as icon), or nodes with `exportSettings` including SVG.
- From the hierarchy, collect each **icon node id** (e.g. `10:8701`, `196:8813`) and a **sanitized name** (e.g. from node `name` → `icon-back`, `icon-close`). Sanitize: lowercase, replace spaces/special chars with hyphen, no leading numbers.
- **Use the icon node id, not the parent frame id.** When the input is a **screen or frame** (e.g. Login M_Login_Screen, node-id `8-6335`), run **Step 2.4** first to get the frame's **children**; use only those **child/descendant** node ids for export. Exporting the frame id (e.g. `8:6335`) produces the whole screen as one image — wrong for icons. If the design context only gives a frame id (e.g. header `196:8812`), call Figma API `GET /v1/files/{fileKey}/nodes?ids={frameId}` to get the frame's children and select the child node that is the icon; use that child id for export.

**Export methods (use first available):**

1. **Figma MCP export (preferred)**  
   If the project's Figma MCP has a tool that exports a node as SVG (e.g. "export node as SVG", "get image", "get node export") — call it for each icon node. Save the returned SVG content to a file under the export directory (see below). If the MCP returns a URL, fetch the URL (with network permission) and save the response body to the file.

2. **Figma REST API (when MCP does not provide export)**  
   Requires **`FIGMA_ACCESS_TOKEN`** (or **`FIGMA_TOKEN`**) in the environment (user must set it in Cursor/IDE or `.env`).
   - **Request:** `GET https://api.figma.com/v1/images/{fileKey}?ids={nodeIds}&format=svg`  
     - `fileKey` = from Step 1 (e.g. `nY7625ccS767LrTVnELBzA`)  
     - `ids` = comma-separated node IDs with **colon** format (e.g. `10:8701,10:8702`)  
     - Header: `X-Figma-Token: {FIGMA_ACCESS_TOKEN}` (or `Authorization: Bearer {FIGMA_ACCESS_TOKEN}`)
   - **Response:** JSON with `images` object: `{ "10:8701": "https://...", "10:8702": "https://..." }`. Some keys may be `null` if the node cannot be exported.
   - **Fetch each URL** (with network permission), then save the response body (SVG string) to the corresponding file in the export directory. If a URL is `null`, skip that node and note in the spec: "Icon {id} could not be exported (null from API)."
   - **Important:** Export the **icon node** (e.g. back chevron), not the parent frame. Exporting the frame id yields the whole frame (e.g. full header bar), which is the wrong asset. To get the icon-only SVG: use the **child node id** of the icon (from design context or from `GET https://api.figma.com/v1/files/{fileKey}/nodes?ids={frameId}` to inspect the frame's children and pick the icon node id).

3. **Project export script (when token set, same as API above)**  
   The project provides **`.cursor/scripts/export-figma-svg.js`** to export one node as SVG to `.cursor/cache/figma-svgs/{feature-name}/icon-back.svg`. The **Figma Analyzer must run this script** when FIGMA_ACCESS_TOKEN is set and icons are required, so the correct icon (not a placeholder) is written.
   - **When to run:** In STEP 2.5, after identifying icon node id(s). Run from project root with FIGMA_ACCESS_TOKEN in environment (e.g. `FIGMA_ACCESS_TOKEN=<token> node .cursor/scripts/export-figma-svg.js {feature-name} {icon-node-id} [fileKey]`).
   - **Use the icon node id, not the frame id.** If the user provided only the frame id (e.g. `196:8812` for Component_Mobile_Go_Back), first call `GET https://api.figma.com/v1/files/{fileKey}/nodes?ids={frameId}` to get the frame's document; from the response, find the **child node** that is the back/chevron icon (type VECTOR, BOOLEAN_OPERATION, or COMPONENT), then run the script with that **child node id**. Otherwise the script writes the full frame as SVG (wrong icon).
   - **Output:** Script overwrites `.cursor/cache/figma-svgs/{feature-name}/icon-back.svg`. After running, the spec ASSETS section should list this path as the exported file (not a placeholder).

**Export directory and filenames:**
- **Directory:** `.cursor/cache/figma-svgs/{feature-name}/`  
  Create it: `mkdir -p .cursor/cache/figma-svgs/{feature-name}`
- **Filenames:** `{sanitized-name}.svg` (e.g. `icon-back.svg`, `icon-close.svg`). If multiple nodes share the same sanitized name, append a number: `icon-1.svg`, `icon-2.svg`.
- **Write:** Save each SVG string/bytes to `{.cursor/cache/figma-svgs/{feature-name}/{filename}.svg}`. Overwrite if file exists.

**If export is not possible (no MCP export, no FIGMA_ACCESS_TOKEN):**  
Do not fail the run. In the spec ASSETS section, list each icon with Type, Size, and React Native usage; add a note: "SVGs not exported (set FIGMA_ACCESS_TOKEN or use a Figma MCP with export to auto-export). Export manually from Figma and place in `src/assets/SVGs/` or `.cursor/cache/figma-svgs/{feature-name}/`."

**After export:** In the spec file (ASSETS section and optional "Exported SVGs" subsection), list each exported file with path, e.g. `.cursor/cache/figma-svgs/forgot-password-screen/icon-back.svg`, so the Coding agent or developer can copy to `src/assets/SVGs/` or reference via `react-native-svg-transformer`.

---

### STEP 2.6: Export PNG / Raster Assets (Automatic — All Images/Raster in Frame)

**Purpose:** Extract **all** background images, photos, and raster icons from the frame so development can use them. **Runs automatically** for every image-fill and raster node found; no separate user instruction required. **PNG placement is platform-specific:** Android = drawable; iOS = Xcode asset catalog.

**Identify from design context (Step 2):**
- **Every image fill / background:** Nodes with image fills (e.g. photo, full-screen background) — note node id and dimensions.
- **Every raster icon or bitmap:** Nodes that are raster (bitmap) or export as PNG (e.g. fingerprint, illustrations). Vector icons → Step 2.5 (SVG). Raster or photo → PNG here.

**Export methods (use first available):**
1. **Figma REST API** — `GET https://api.figma.com/v1/images/{fileKey}?ids={nodeIds}&format=png` (and optionally `scale=2` for @2x). Requires **FIGMA_ACCESS_TOKEN**. Fetch returned URLs and save PNG bytes to the **platform export directories** (see below).
2. **Figma MCP** — If the project's Figma MCP has a tool that exports a node as PNG, use it and save to the platform export directories.

**Platform placement (mandatory for PNG):**
- **Android:** Save PNG(s) under **`android/app/src/main/res/drawable/`** (e.g. `login_bg.png`, `ic_fingerprint.png`). Use lowercase, underscores only; no spaces. For density-specific assets, use `drawable-mdpi`, `drawable-xhdpi`, `drawable-xxhdpi`, etc.
- **iOS:** Add to Xcode asset catalog **`ios/{ProjectName}/Images.xcassets/`** (e.g. create image set `LoginBg.imageset/` or `Fingerprint.imageset/` with the PNG). Use Images.xcassets so Xcode manages @1x/@2x/@3x.

**JavaScript access:** Every image must be referenced from **drawable** (Android) and **Images.xcassets** (iOS) only. In JavaScript, screens/components access images **by name only** via a central registry (e.g. `IMAGES` from `@constants/images`); no `require()` paths in screens/components. The Coding Agent adds each new image to `src/constants/images.js` with `Platform.select({ android: require('...drawable/...'), ios: require('...Images.xcassets/...') })` so usage is `source={IMAGES.loginBg}` etc.

**In the spec ASSETS section:** List each PNG with node id, description (e.g. "Background image", "Fingerprint icon"), **Exported path (Android)** = `android/app/src/main/res/drawable/{name}.png`, **Exported path (iOS)** = `ios/{ProjectName}/Images.xcassets/{ImageSet}.imageset/`. If export was not possible (no token/MCP), note: "PNG not exported — set FIGMA_ACCESS_TOKEN and re-run analyzer, or add manually to drawable (Android) and Images.xcassets (iOS)."

**Rule:** Wherever PNG is required (background, photo, raster icon), it must be placed in **drawable for Android** and **Xcode Images.xcassets for iOS** — not only in `src/assets/` — so native builds use the correct resources.

---

### STEP 3: Write Specs File

1. Ensure directory exists: `mkdir -p .cursor/cache`
2. Write to path: `.cursor/cache/figma-specs-{feature-name}.md`
3. Use the **SPEC FILE TEMPLATE** below. **MANDATORY** = always include. **CONDITIONAL** = include only when applicable.
4. **Typography:** In the TYPOGRAPHY section, **every** text style row MUST include **font weight** (Figma numeric e.g. 400/500/700 and name e.g. Regular/Medium/Bold). Weight properties must be considered and written so Coding/Fixing agents can map to the correct fontFamily token (e.g. MONTSERRAT_REGULAR, MONTSERRAT_MEDIUM, MONTSERRAT_BOLD).

---

## SPEC FILE TEMPLATE (React Native – Mobile)

```markdown
# Figma Design Specs – React Native (Mobile)

**Feature:** {feature-name}
**Section:** {section-description}
**Analyzed:** {YYYY-MM-DD HH:mm}

---

## 📍 FIGMA SOURCE (MOBILE)

- File key: {fileKey}
- URL node-id: {e.g. 488-37713}
- MCP node-id: {e.g. 488:37713}
- Frame name: **{frame-name}**
- Verified: ✅ / ⚠️ (note if name mismatch)

---

## 🎨 COMPONENT HIERARCHY

**ASCII – Mobile structure:**
    ┌─────────────────────────────────────┐
    │ MOBILE: {frame-name}                │
    │ {width}×{height}px, bg: {color}     │
    │ padding: {values}, gap: {value}px   │
    │  ┌──────┐ ┌──────┐ ┌──────┐         │
    │  │Item 1│ │Item 2│ │Item 3│         │
    │  └──────┘ └──────┘ └──────┘         │
    └─────────────────────────────────────┘

**Tree:** For each key node: Type (FRAME/TEXT/RECTANGLE/ etc.), layout (flex equivalent), padding, gap, sizing, background. List wrappers and leaf nodes only; omit trivial groups.

---

## 📐 MEASUREMENTS (px → React Native)

- **Root/Section:** width, height, padding, background
- **Wrappers:** gap, flex direction (row/column), align, justify
- **Elements (cards, buttons, images):** dimensions, padding, borderRadius, shadow (blur, spread, color)
- **Internal (icons, text blocks):** size, spacing

Note where `scale`, `verticalScale`, or `moderateScale` (e.g. react-native-size-matters) may apply for multi-device support.

---

## 🎨 COLORS

**Figma (hex/rgba) → React Native mapping (use project tokens: ColorCode or COLORS):**

| Figma (hex/rgba) | Token / usage |
|------------------|---------------|
| #FFFFFF          | ColorCode.backgroundColorFFFFFF / COLORS.white |
| #1C1C1E          | ColorCode.titleColor1C1C1E / COLORS.title |
| #6B7280          | ColorCode.subtitleColor6B7280 / COLORS.subtitle |

Include: section bg, element bg, text colors, borders, shadow color.  
React Native: iOS use shadowColor + shadowOpacity/shadowRadius; Android use elevation.

---

## 📝 TYPOGRAPHY (font weight required)

**Font weight must be considered for every text element.** For each TEXT node, extract from Figma: **fontSize**, **fontWeight** (numeric 100–900 and name: Thin/ExtraLight/Light/Regular/Medium/SemiBold/Bold/ExtraBold/Black), lineHeight, letterSpacing, textDecorationLine. Figma API provides `style.fontWeight` on text nodes (and `styleOverrideTable` for overrides).

**Figma (size, weight, lineHeight, style) → React Native mapping (use project FONTS or fontFamily/fontSize):**

| Element / Node   | Figma (size, **weight**, lineHeight, style)     | Token / usage |
|------------------|-------------------------------------------------|---------------|
| e.g. SKU         | 14px, **Medium (500)**, lineHeight 20            | fontFamily.MONTSERRAT_MEDIUM, fontSize._14 |
| e.g. Price       | 18px, **Bold (700)**                            | fontFamily.MONTSERRAT_BOLD, fontSize._18 |
| e.g. Body        | 12px, **Regular (400)**, strikethrough          | fontFamily.MONTSERRAT_REGULAR, fontSize._12, textDecorationLine: 'line-through' |

- **Mandatory:** Every row in the TYPOGRAPHY table must include **font weight** (numeric and name). Map weight to the correct fontFamily: 400 → Regular, 500 → Medium, 600 → SemiBold, 700 → Bold, etc.
- List every text style in the frame; map to project FONTS or fontFamily+fontSize. No hardcoded fontFamily/fontSize/lineHeight in component styles.

---

## 📏 SPACING & LAYOUT

- All spacing in px. Map to StyleSheet: flexDirection, alignItems, justifyContent, gap (or marginBottom/marginRight).
- Auto Layout vertical → `flexDirection: 'column'`, gap or margins.
- Auto Layout horizontal → `flexDirection: 'row'`, gap or margins.
- Center align → `alignItems: 'center'`, `justifyContent: 'center'`.

---

## 📦 ASSETS

| Asset         | Type | Size    | Exported path (if exported) | React Native usage        |
|---------------|------|---------|------------------------------|----------------------------|
| Icon Back     | SVG  | 24×24   | .cursor/cache/figma-svgs/{feature-name}/icon-back.svg | react-native-svg / @assets/SVGs |
| Icon Close    | SVG  | 24×24   | .cursor/cache/figma-svgs/{feature-name}/icon-close.svg | react-native-svg / @assets/SVGs |
| Background / Image Y | PNG  | e.g. 375×812 | **Android:** drawable/{name}.png; **iOS:** Images.xcassets/{set}.imageset/ | drawable (Android), Xcode (iOS) |
| Fingerprint / raster icon | PNG  | e.g. 24×24 | **Android:** drawable/ic_fingerprint.png; **iOS:** Images.xcassets/Fingerprint.imageset/ | drawable (Android), Xcode (iOS) |

**Exported SVGs (when Step 2.5 ran):**  
List each exported file. Copy to `src/assets/SVGs/` for use with `react-native-svg` or `react-native-svg-transformer` (e.g. `import IconBack from '@assets/SVGs/icon-back.svg'`). If not exported, note: "Export manually from Figma or set FIGMA_ACCESS_TOKEN / use Figma MCP export."

**PNG / raster assets (when Step 2.6 ran):**  
**Wherever PNG is required** (background image, photo, raster icon): place in **Android** `android/app/src/main/res/drawable/` (e.g. `login_bg.png`, `ic_fingerprint.png`) and **iOS** Xcode asset catalog `ios/{ProjectName}/Images.xcassets/` (e.g. `LoginBg.imageset/`, `Fingerprint.imageset/`). Do not rely only on `src/assets/` for PNGs used by native UI — use drawable (Android) and Xcode (iOS). List in ASSETS table with Android path and iOS path; if not exported, note: "PNG not exported — set FIGMA_ACCESS_TOKEN and re-run analyzer, or add manually to drawable and Images.xcassets."

**Rule:** **All assets (images and icons) in the given Figma screen must be extracted and managed automatically** — list every image and icon found in the frame in the ASSETS table; export via Steps 2.5 (SVG) and 2.6 (PNG). No separate user instruction is required for asset extraction.

---

## 🎯 REACT NATIVE NOTES

- **StyleSheet keys:** Prefer semantic names: container, wrapper, card, image, title, price, cta, etc.
- **Shadow:** iOS `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`; Android `elevation`.
- **Touch targets:** Min 44px height/width or padding where tappable.
- **Scaling:** Optional: scale/verticalScale/moderateScale for key dimensions (react-native-size-matters).
- **Design tokens:** Use ColorCode/COLORS and FONTS/fontFamily+fontSize only; no raw hex or font values in styles.
- **Error handling:** Optional chaining `obj?.value` when using spec data in code.
- **Images:** Access by name only via `IMAGES` from `@constants/images` (drawable + Images.xcassets only).
- **Overlay over images:** Overlay View styles over background images must use an explicit opacity constant (e.g. `OVERLAY_OPACITY`); do not hardcode opacity in overlay styles.
```

**CONDITIONAL – Design Tokens (Figma variables):** If Figma variable definitions were fetched, add a subsection mapping variable names to ColorCode/FONTS or COLORS/fontFamily/fontSize.

---

### STEP 4: Confirm and Stop

After saving the file, output:

```
✅ FIGMA ANALYZER COMPLETE

Output: .cursor/cache/figma-specs-{feature-name}.md

Summary:
- Frame: {frame-name} ({width}×{height}px)
- Components: {count} key elements
- Colors: {count} → ColorCode/COLORS mapping
- Typography: {count} → FONTS/fontFamily mapping
- Layout: {flex mode}, gap {value}px
- SVGs exported: {count} → .cursor/cache/figma-svgs/{feature-name}/ (or "None — set FIGMA_ACCESS_TOKEN or use Figma MCP export")
- PNGs (background / raster icons): when required, exported and placed in drawable (Android) and Images.xcassets (iOS); or "None — set FIGMA_ACCESS_TOKEN and run Step 2.6; place manually in drawable and Xcode"

Stopped. Hand off to @planning-agent (with this spec path) or @coding-agent (with PRD that references this spec) as needed.
```

**Boundaries:** Save only to `.cursor/cache/figma-specs-{feature-name}.md`. Do not create PRD or code. Do not run Planning or Coding agents automatically.

---

## 📌 EXAMPLE PROMPTS

Use these to invoke the Figma Analyzer (replace values with your feature, URL, frame name, section):

**Example 1 – Screen:**
```
@figma-analyzer

Feature name: forgot-password-screen
Mobile URL: https://www.figma.com/design/nY7625ccS767LrTVnELBzA/Bay-Alarm-Medical---Mobile-App?node-id=10-8700&m=dev
Mobile Frame: M_Forgot_Password_Screen
Section: Forgot password screen – layout, fields, buttons, copy, and icons
```

**Example 2 – Common component:**
```
@figma-analyzer

Feature name: common-header
Mobile URL: https://www.figma.com/design/nY7625ccS767LrTVnELBzA/Bay-Alarm-Medical---Mobile-App?node-id=196-8812&m=dev
Mobile Frame: Component_Mobile_Go_Back
Section: Common header widget – back icon and title; back icon must be exported as SVG from Figma
```

**Example 3 – Login screen (screen/frame → Step 2.4 required):**
```
@figma-analyzer

Feature name: login
Mobile URL: https://www.figma.com/design/nY7625ccS767LrTVnELBzA/Bay-Alarm-Medical---Mobile-App?node-id=8-6335&m=dev
Mobile Frame: M_Login_Screen
Section: Login screen – background, Email/Password inputs, Login button, Forgot Password link, Use Touch ID (fingerprint icon). Export all icons and images from frame children.
```
*Note:* Node-id `8-6335` is the **whole screen**. Set **FIGMA_ACCESS_TOKEN** so the analyzer can call the Figma API (no Figma MCP in this project). Step 2.4 will fetch children of `8:6335`; Step 2.5/2.6 will export only **child** node ids (fingerprint icon, background image), not the frame id.

**Example 4 – Product card:**
```
@figma-analyzer

Feature name: product-card
Mobile URL: https://www.figma.com/design/ABC123/App?node-id=488-37713
Mobile Frame: Product Card Mobile
Section: Product card with image, title, price, and CTA
```

---

## 📋 VALIDATION CHECKLIST (before saving)

- [ ] Output path is exactly `.cursor/cache/figma-specs-{feature-name}.md`
- [ ] All four inputs (feature name, URL, frame name, section) were used
- [ ] node-id in URL converted to colon format for MCP (e.g. `488:37713`)
- [ ] Colors mapped to ColorCode/COLORS-style tokens; no raw hex in "use in RN" guidance
- [ ] Typography mapped to FONTS/fontFamily+fontSize-style tokens; **every TYPOGRAPHY row includes fontWeight** (numeric 100–900 and name e.g. Regular/Medium/Bold) and maps to correct fontFamily (400→Regular, 500→Medium, 700→Bold, etc.)
- [ ] Layout described as flex (flexDirection, gap, align, justify)
- [ ] Shadow/elevation and touch target (44px) mentioned in React Native notes
- [ ] No invented states or animations; only what exists in the design
- [ ] If icons present: ASSETS table includes Exported path when SVGs were exported; or note to set FIGMA_ACCESS_TOKEN / manual export
- [ ] If background image or PNG icon (e.g. fingerprint) present: ASSETS table includes **Android** drawable path and **iOS** Images.xcassets path; or note to export PNG and place in drawable (Android) and Xcode (iOS)
- [ ] **All assets (images and icons) in the frame** were identified and either exported (Steps 2.5/2.6) or listed in ASSETS with a note if export was unavailable; no separate user instruction is required for asset extraction
- [ ] **When input is a screen/frame** (e.g. Login M_Login_Screen, node-id 8-6335): Step 2.4 was run to get frame children; only **child/descendant** node ids were used for Step 2.5/2.6 — the frame id itself was **not** used for icon/image export
