# Graph Report - RegletStudio  (2026-11-17)

## Corpus Check
- Corpus is ~13,978 words - fits in a single context window. You may not need a graph.

## Summary
- 83 nodes · 127 edges · 14 communities (8 shown, 6 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- State & Undo History
- CorelDRAW UI Markup
- Canvas Engine
- Docs & CDN Dependencies
- Order, Preflight & Print Flow
- UI Controllers
- Print PDF Export
- Preview, Mockup & Cart
- Pricing & Finishing
- 3D Mockup Rendering
- Product Configuration
- Business-Card Templates

## God Nodes (most connected - your core abstractions)
1. `REGLET Studio Interface Markup (index.html)` - 18 edges
2. `REGLET Studio README` - 7 edges
3. `getPxPerMm()` - 6 edges
4. `renderDocumentCanvas()` - 6 edges
5. `beginDragObject()` - 6 edges
6. `bindAllEvents()` - 6 edges
7. `Single-Screen Workspace` - 6 edges
8. `updateCorelRulers()` - 5 edges
9. `applyBusinessCardTemplate()` - 5 edges
10. `renderLayersDocker()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `REGLET Studio Interface Markup (index.html)` --implements--> `Online Print Product Constructor (CorelDRAW-style)`  [INFERRED]
  index.html → README.md
- `bindAllEvents()` --indirect_call--> `updateCorelRulers()`  [INFERRED]
  js/ui.js → js/canvas.js
- `Business-Card Template Gallery Drawer with Contact Auto-Fill` --conceptually_related_to--> `Six Ready Business-Card Templates`  [INFERRED]
  index.html → README.md
- `Canvas Rendering, mm Rulers, Drag/Resize/Rotate` --conceptually_related_to--> `Document Sheet with Bleed, Trim and Safe-Zone Frames`  [INFERRED]
  README.md → index.html
- `REGLET Studio README` --references--> `REGLET Studio Interface Markup (index.html)`  [EXTRACTED]
  README.md → index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Prepress geometry to preflight to print PDF flow** — index_document_sheet, index_preflight_panel, readme_preflight, readme_pdf_export [INFERRED 0.85]
- **Order configuration to preview to cart flow** — index_order_pricing_docker, index_preview_modal, index_cart_modal, readme_pricing_model [INFERRED 0.85]
- **CorelDRAW-style single-screen workspace composition** — index_corel_property_bar, index_tool_palette, index_order_pricing_docker, index_inspector_docker, readme_single_screen_workspace [INFERRED 0.85]

## Communities (14 total, 6 thin omitted)

### Community 0 - "State & Undo History"
Cohesion: 0.26
Nodes (8): applyBusinessCardTemplate(), AppState, getProduct(), getTrimDims(), pushHistory(), showToast(), uid(), updateUndoRedoUI()

### Community 1 - "CorelDRAW UI Markup"
Cohesion: 0.29
Nodes (11): Dynamic CorelDRAW Property Bar (#corelPropertyBar), Document Sheet with Bleed, Trim and Safe-Zone Frames, Document Page Tabs (Front / Back / 3D Mockup), Object Inspector Docker (text / shape / image panels), Layers Docker (#dockerLayersList), Millimetre Ruler System with Cursor and Object Markers, REGLET Studio Interface Markup (index.html), Active Object Selection Box with CorelDRAW Handles (+3 more)

### Community 2 - "Canvas Engine"
Cohesion: 0.47
Nodes (10): beginDragObject(), beginHandleTransform(), createObjectElement(), generateQrMatrix(), getPointerXY(), getPxPerMm(), onGlobalPointerMove(), renderDocumentCanvas() (+2 more)

### Community 3 - "Docs & CDN Dependencies"
Cohesion: 0.28
Nodes (8): Google Fonts: Inter, Montserrat, Playfair Display, Roboto Mono, Module Structure (css/, js/ split), Online Print Product Constructor (CorelDRAW-style), opentype.js 1.3.4 (CDN), REGLET Studio README, Shared State with Undo/Redo History and Toasts, Tailwind CSS (CDN), Six Ready Business-Card Templates

### Community 4 - "Order, Preflight & Print Flow"
Cohesion: 0.29
Nodes (8): Back-Side Lock for One-Sided Printing (4+0), Order and Price Docker (product, size, material, sides, finishing, qty), Preflight Panel (badge + messages), Canvas Rendering, mm Rulers, Drag/Resize/Rotate, Print PDF 1.4 Export (curves + crop marks), Preflight (layout check before printing), Price Calculation and Finishing Compatibility, Single-Screen Workspace

### Community 5 - "UI Controllers"
Cohesion: 0.46
Nodes (5): bindAllEvents(), rotatePage90(), renderLayersDocker(), renderOrderDocker(), syncAll()

### Community 6 - "Print PDF Export"
Cohesion: 0.67
Nodes (5): buildPrintReadyPdf(), convertTextToPdfCurves(), extractJpegBytes(), hexToRgbPdf(), loadVectorFont()

### Community 7 - "Preview, Mockup & Cart"
Cohesion: 0.50
Nodes (4): Inline 3D Mockup View (#inline3dMockupView), Order Cart Modal (#cartModal), Preview and PDF Generation Modal (#previewModal), 3D Product Mockup

## Knowledge Gaps
- **5 isolated node(s):** `Print PDF 1.4 Export (curves + crop marks)`, `Shared State with Undo/Redo History and Toasts`, `Left Tool Palette (pick, text, image, rect, circle, line, QR)`, `Document Page Tabs (Front / Back / 3D Mockup)`, `Snap Guides (SnapLineV / SnapLineH)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 19 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `REGLET Studio Interface Markup (index.html)` connect `CorelDRAW UI Markup` to `Docs & CDN Dependencies`, `Order, Preflight & Print Flow`, `Preview, Mockup & Cart`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `Print PDF 1.4 Export (curves + crop marks)`, `Shared State with Undo/Redo History and Toasts`, `Left Tool Palette (pick, text, image, rect, circle, line, QR)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `REGLET Studio README` connect `Docs & CDN Dependencies` to `CorelDRAW UI Markup`, `Order, Preflight & Print Flow`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `updateCorelRulers()` connect `Canvas Engine` to `UI Controllers`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._