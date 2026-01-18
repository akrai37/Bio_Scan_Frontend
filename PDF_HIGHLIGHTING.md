# PDF Inline Highlighting Feature

## Overview
The PDF viewer now features **inline text highlighting** that visually marks problematic sections directly on the PDF canvas. This makes it easy for judges and users to instantly see where issues occur in the protocol document.

## How It Works

### 1. Keyword Extraction (Results.jsx)
When analysis results are received, we extract key phrases from each issue:

```javascript
const extractKeyPhrases = (text) => {
  // Extracts:
  // - Quoted text: "450nm", "incubation time"
  // - Measurements: 450nm, 30 minutes, 2mg/ml
  // - Technical terms: incubation, centrifuge, temperature, concentration
}
```

### 2. Text Layer Scanning (PDFViewer.jsx)
The PDF viewer scans the rendered text layer and matches keywords:

```javascript
useEffect(() => {
  // 1. Wait for PDF text layer to render
  // 2. Get all text spans from the PDF
  // 3. For each highlight keyword, find matching spans
  // 4. Calculate position coordinates
  // 5. Create highlight overlay
}, [pageNumber, highlights])
```

### 3. Visual Overlay
Highlights are rendered as semi-transparent colored overlays:

- **Critical issues**: Pulsing red highlight (`#ff4444`)
- **Warnings**: Pulsing yellow highlight (`#ffaa00`)
- **Animation**: Gentle pulse effect (opacity 0.4 ↔ 0.6)

## Technical Implementation

### Component Structure
```
<PDFViewer>
  <pdf-page-wrapper>
    <Page /> <!-- react-pdf renders PDF here -->
    <div className="pdf-highlight-overlay" /> <!-- Our highlights -->
    <div className="pdf-highlight-overlay" />
    ...
  </pdf-page-wrapper>
</PDFViewer>
```

### Coordinate Mapping
```javascript
const rect = span.getBoundingClientRect()
const pageRect = textLayer.getBoundingClientRect()

// Convert to relative coordinates
highlight = {
  left: rect.left - pageRect.left,
  top: rect.top - pageRect.top,
  width: rect.width,
  height: rect.height
}
```

### Smart Keyword Matching
The system intelligently extracts and matches:

1. **Exact phrases** from quotes
2. **Measurements** (450nm, 30 minutes, 2mg/ml, etc.)
3. **Numbers** that appear in issue descriptions
4. **Technical terms** (incubation, centrifuge, buffer, temperature, etc.)

### Duplicate Prevention
Before adding a highlight, we check if the same position is already highlighted:

```javascript
const isDuplicate = newHighlights.some(h => 
  Math.abs(h.left - newLeft) < 5 && 
  Math.abs(h.top - newTop) < 5
)
```

## Demo Tips

### For Judges
"Watch as BioScan not only identifies issues but **shows you exactly where they are in your protocol**. The red highlights indicate critical problems, while yellow marks warnings."

### Best Practices
1. **Upload PDFs with clear text** (not scanned images)
2. **Use page navigation** to see highlights on different pages
3. **Hover over highlights** to see the full issue description
4. **Reference the list below** for detailed explanations

## Limitations
- Works best with text-based PDFs (not scanned images)
- Highlights keyword matches (not full sentence ranges)
- Some generic terms may match multiple locations
- Requires text layer to be rendered (500ms delay)

## Future Enhancements
- [ ] Click highlight to jump to detailed analysis
- [ ] Filter highlights by severity
- [ ] Export highlighted PDF
- [ ] Support for scanned PDFs with OCR
- [ ] Highlight full sentences instead of keywords

## Performance Notes
- Highlights recalculate on page change (~500ms)
- Minimal performance impact (<50 highlights)
- Uses CSS transforms for smooth rendering
- React.memo optimization prevents unnecessary re-renders

---

**Created for Disrupt Bio Hackathon 2026**
"Because seeing the problem is half the solution." 🔬✨
