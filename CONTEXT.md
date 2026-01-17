# BioScan Frontend - Context & Decisions

## Project Overview

**Name:** BioScan Frontend - Protocol Validator UI

**Purpose:** User-friendly interface for uploading and analyzing experimental protocols

**Framework:** React 18 + Vite

**Hackathon:** Disrupt Bio Hackathon (Jan 18, 2026, 12pm-6pm)

## Design Philosophy

### User Experience Goals
1. **Dead Simple**: Upload PDF → Get Results (2 clicks max)
2. **Visual Impact**: Color-coded results for instant understanding
3. **Professional**: Clean, modern design that inspires confidence
4. **Fast**: No unnecessary loading states or delays

### Visual Design
- **Color Scheme**: Purple gradient header (scientific/premium feel)
- **Icons**: Emoji for personality without icon library bloat
- **Typography**: System fonts for speed and familiarity
- **Layout**: Single column, mobile-first responsive

## Key Design Decisions

### Why React?
- Fast to build with (familiar for most developers)
- Component-based architecture
- Large ecosystem
- Easy to maintain

### Why Vite?
- ⚡ Blazing fast dev server (instant hot reload)
- Simple configuration
- Modern build tool (better than Create React App)
- Native ES modules support

### Why No UI Library?
- **Custom CSS** gives us exact control
- No bundle bloat from unused components
- Faster load times
- Unique design (not "another Bootstrap site")
- Can build in 4-5 hours without learning a library

### State Management
- **No Redux/Zustand needed** - too simple
- React `useState` in App.jsx is sufficient
- Props and callbacks for component communication
- Keep it simple for a 6-hour hackathon

## Component Architecture

```
App (Main State Container)
├── Header (Logo, Title)
├── FileUpload (Drag-drop, Validation)
│   └── Upload Form
└── Results (Display Analysis)
    ├── Score Card
    ├── Critical Issues
    ├── Warnings
    ├── Good Practices
    └── Suggestions
```

### Component Responsibilities

| Component | Responsibility | State |
|-----------|----------------|-------|
| App | Global state, error handling | results, loading, error |
| Header | Branding, navigation | None (stateless) |
| FileUpload | File handling, API calls | selectedFile, dragActive |
| Results | Display parsed results | None (props only) |

## User Flow

```
1. Land on page → See hero message
2. Drag PDF or click to browse
3. See file preview with name/size
4. Click "Analyze Protocol"
5. See loading spinner (10-15 sec)
6. Results appear with score + issues
7. Click "Analyze Another" to reset
```

## Color-Coded System

The app uses traffic light colors:

| Color | Meaning | Used For |
|-------|---------|----------|
| 🔴 Red | Critical (will fail) | Critical issues, low scores |
| 🟡 Yellow | Warning (should improve) | Warnings, moderate scores |
| 🟢 Green | Good (well done) | Passed checks, high scores |

**Score Ranges:**
- 70-100%: Green (Good)
- 40-69%: Yellow (Moderate)
- 0-39%: Red (Poor)

## API Integration

### Axios vs Fetch
Using **Axios** because:
- Automatic JSON parsing
- Better error handling
- Request timeouts built-in
- Cleaner syntax

### Error Handling Strategy

```javascript
try {
  // API call
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    // Timeout
  } else if (error.response) {
    // Backend returned error
  } else if (error.request) {
    // Network error
  } else {
    // Unknown error
  }
}
```

All errors show user-friendly messages (no technical jargon).

## File Upload UX

### Drag-and-Drop
- Visual feedback on drag (border color change)
- Prevent default browser behavior
- Support both drag and click

### Validation
1. **File Type**: PDF only (check extension)
2. **File Size**: 20MB max (same as backend)
3. **Visual Feedback**: Show file name + size
4. **Easy Reset**: X button to remove file

### Why These Limits?
- **PDF only**: Most protocols are PDFs, keeps scope manageable
- **20MB max**: Reasonable for most documents, prevents abuse

## Results Display Design

### Success Probability Score
- **Circular Progress**: Visual representation (like fitness apps)
- **Large Number**: Easy to scan
- **Color-Coded**: Instant understanding of quality
- **Context**: Cost and time estimates when available

### Issue Cards
- **Grouped by Severity**: Critical → Warnings → Good
- **Expandable Design**: Easy to add more info later
- **Hover Effects**: Subtle animation for interactivity
- **Clear Hierarchy**: Title + description format

### Suggestions Section
- **Action-Oriented**: Arrow bullets → suggests "do this"
- **Yellow Background**: Stands out but not alarming
- **Light Bulb Icon**: Universal symbol for ideas

## Responsive Design

### Breakpoints
- **Desktop**: > 768px (default)
- **Mobile**: ≤ 768px (stacked layout)

### Mobile Optimizations
- Smaller fonts
- Stacked score card
- Full-width buttons
- Touch-friendly tap targets (44px min)

## Performance Considerations

### Bundle Size
- No heavy libraries (no MUI, Ant Design, etc.)
- Axios is only 13KB gzipped
- Total bundle ~150KB (very light)

### Loading States
- Show spinner immediately on upload
- Display time estimate ("10-15 seconds")
- Prevent duplicate submissions

### Image Optimization
- Use emoji instead of icon fonts (0KB overhead)
- No custom fonts (system fonts are fast)

## Accessibility (Basic)

- Semantic HTML (`<header>`, `<main>`, `<button>`)
- Alt text for important elements
- Keyboard navigation works
- Color contrast meets WCAG AA

*(Full accessibility audit would be post-hackathon)*

## Development Workflow

### Hot Module Replacement (HMR)
Vite's HMR is instant:
- Edit CSS → See changes immediately
- Edit component → React updates without full reload
- Very fast iteration

### Component Development Order
1. ✅ App shell (Header, layout)
2. ✅ FileUpload (most complex)
3. ✅ Results (visual showcase)
4. ✅ Styling polish

## Browser Testing Strategy

**Priority 1 (Must Work):**
- Chrome (judges likely use this)
- Safari (Mac users)

**Priority 2 (Nice to Have):**
- Firefox
- Edge

**Not Tested:**
- IE11 (dead)
- Opera, Brave (too niche)

## Demo Strategy

### What to Emphasize
1. **Easy Upload**: Drag-drop is slick
2. **Fast Analysis**: 10 seconds is impressive
3. **Clear Results**: Color-coding is intuitive
4. **Professional Look**: Purple gradient + clean design

### Demo Protocol Prep
Need 2 test protocols:
1. **Bad Protocol** (score ~30%):
   - Missing controls
   - Vague methods
   - Shows red flags prominently
2. **Good Protocol** (score ~85%):
   - All controls present
   - Clear methodology
   - Shows green checks

## What Makes This Winnable

1. **Polish**: Professional UI inspires confidence
2. **Speed**: Fast upload → analysis → results flow
3. **Clarity**: Anyone can understand red/yellow/green
4. **No Bugs**: Simple architecture = less to break

## Future Enhancements (Post-Hackathon)

### Phase 2
- Download results as PDF report
- Save analysis history (local storage)
- Protocol comparison mode
- Share results via link

### Phase 3
- User accounts
- Protocol templates library
- Collaborative editing
- Real-time suggestions as you type

## Known Limitations

### What We're NOT Doing (for now)
- ❌ User authentication (no time, not needed for demo)
- ❌ Database (stateless for hackathon)
- ❌ Multiple file upload (one at a time is enough)
- ❌ OCR for scanned PDFs (backend limitation)
- ❌ Dark mode (nice-to-have)

## Current State (Friday Night Build)

- [x] All components built
- [x] Styling complete
- [x] API integration done
- [x] Error handling implemented
- [ ] Test with real backend (next)
- [ ] Find sample protocols
- [ ] Demo rehearsal

---

**Last Updated:** January 16, 2026 - Initial build complete
**Next Steps:** Test with backend, prepare demo protocols
