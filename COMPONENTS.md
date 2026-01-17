# BioScan Frontend - Components

## Component Hierarchy

```
App.jsx
├── Header.jsx
├── FileUpload.jsx
└── Results.jsx
```

---

## App.jsx (Main Container)

**Purpose:** Root component that manages global state and orchestrates child components

### State

```javascript
const [results, setResults] = useState(null)      // Analysis results from API
const [loading, setLoading] = useState(false)     // Loading state
const [error, setError] = useState(null)          // Error messages
```

### Props Passed Down

| Component | Props | Purpose |
|-----------|-------|---------|
| FileUpload | `onAnalysisComplete` | Callback when analysis succeeds |
| FileUpload | `onAnalysisStart` | Callback when upload starts |
| FileUpload | `onError` | Callback for errors |
| Results | `results` | Analysis data to display |
| Results | `onReset` | Callback to clear results |

### Conditional Rendering

```javascript
{!results && !loading}       → Show hero + FileUpload
{error}                      → Show error message
{loading}                    → Show loading spinner
{results}                    → Show Results component
```

### Layout

- Header (always visible)
- Main content area (conditional)
- Footer (always visible)

---

## Header.jsx (Branding)

**Purpose:** Display app name and tagline

### Structure
```jsx
<header>
  <div className="logo">
    <span>🔬</span>
    <h1>BioScan</h1>
  </div>
  <p>AI-Powered Protocol Validation</p>
</header>
```

### Styling
- Purple gradient background (667eea → 764ba2)
- White text
- Centered layout
- Box shadow for depth

### State
None (pure presentational component)

---

## FileUpload.jsx (Upload Interface)

**Purpose:** Handle file selection, validation, and upload to backend

### State

```javascript
const [dragActive, setDragActive] = useState(false)      // Drag-over state
const [selectedFile, setSelectedFile] = useState(null)   // Selected PDF file
```

### Props (from App)

| Prop | Type | Purpose |
|------|------|---------|
| `onAnalysisComplete` | Function | Called with API response |
| `onAnalysisStart` | Function | Called when upload begins |
| `onError` | Function | Called on errors |

### Event Handlers

#### Drag and Drop
```javascript
handleDrag(e)     // Prevent default, set dragActive
handleDrop(e)     // Get file from e.dataTransfer.files
```

#### File Selection
```javascript
handleChange(e)   // Get file from e.target.files
handleFile(file)  // Validate and set selectedFile
```

#### Upload
```javascript
handleUpload()    // POST to /api/analyze with FormData
```

### Validation Rules

| Rule | Check | Error Message |
|------|-------|---------------|
| File type | `.pdf` extension | "Please upload a PDF file" |
| File size | < 20MB | "File size exceeds 20MB limit" |

### API Call

```javascript
axios.post('http://localhost:8000/api/analyze', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 60000  // 60 seconds
})
```

### Error Handling

| Error Type | Condition | Message |
|------------|-----------|---------|
| Timeout | `error.code === 'ECONNABORTED'` | Request timeout |
| Server error | `error.response` | Backend error detail |
| Network error | `error.request` | Cannot connect to server |
| Unknown | Else | Unexpected error |

### UI States

#### 1. Empty State (No File)
- Upload icon (📄)
- "Upload Your Protocol" heading
- Drag-drop instruction
- "Browse Files" button
- "PDF only, max 20MB" note

#### 2. File Selected
- File icon + name + size
- Remove button (X)
- "Analyze Protocol" button

#### 3. Drag Active
- Border color changes to blue
- Background color lightens
- Scale slightly larger

---

## Results.jsx (Display Analysis)

**Purpose:** Display analysis results in a clear, visual format

### Props (from App)

| Prop | Type | Purpose |
|------|------|---------|
| `results` | Object | Analysis data from API |
| `onReset` | Function | Callback to analyze another file |

### Results Object Structure

```javascript
{
  success_probability: number,        // 0-100
  critical_issues: Array,             // [{issue, description}]
  warnings: Array,                    // [{issue, description}]
  passed_checks: Array,               // [{check, description}]
  estimated_cost: string | null,      // "$5,000" or "Unknown"
  estimated_time: string | null,      // "4 weeks" or "Unknown"
  suggestions: Array<string>,         // ["Add control", ...]
  raw_analysis: string                // Full LLM response (not shown)
}
```

### Layout Sections

#### 1. Header
- "Protocol Analysis Results" title
- "Analyze Another Protocol" button

#### 2. Score Card
- Circular progress indicator
- Success probability percentage
- Score label (Good/Moderate/Poor)
- Estimated cost (if available)
- Estimated time (if available)

#### 3. Critical Issues (Red 🔴)
- Section header with count
- Description: "Will likely cause failure"
- Issue cards with title + description
- Only shown if issues exist

#### 4. Warnings (Yellow 🟡)
- Section header with count
- Description: "Should be improved"
- Issue cards with title + description
- Only shown if warnings exist

#### 5. Good Practices (Green 🟢)
- Section header with count
- Description: "Well-designed aspects"
- Check cards with title + description
- Only shown if checks exist

#### 6. Suggestions (💡)
- Section header
- Bulleted list of recommendations
- Yellow background (attention but not alarm)
- Only shown if suggestions exist

### Helper Functions

#### getScoreColor(score)
```javascript
score >= 70 → '#10b981' (green)
score >= 40 → '#f59e0b' (yellow)
else        → '#ef4444' (red)
```

#### getScoreLabel(score)
```javascript
score >= 70 → 'Good'
score >= 40 → 'Moderate'
else        → 'Poor'
```

### Circular Progress Logic

Uses conic-gradient:
```css
background: conic-gradient(
  {color} {score * 3.6}deg,  /* score% of 360° */
  #e5e7eb 0deg               /* remaining gray */
)
```

### Animation

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Entire results container fades in on mount.

### Hover Effects

Issue cards:
- Lift up (translateX)
- Show shadow
- Smooth transition

---

## Component Communication Flow

```
User Action (FileUpload)
         ↓
   onAnalysisStart()
         ↓
    App sets loading=true
         ↓
   POST to /api/analyze
         ↓
  onAnalysisComplete(data)
         ↓
   App sets results=data
         ↓
   Results displays data
         ↓
  User clicks "Analyze Another"
         ↓
      onReset()
         ↓
   App clears results
         ↓
   Back to FileUpload
```

---

## Styling Strategy

### CSS Organization

Each component has its own CSS file:
- `Header.css`
- `FileUpload.css`
- `Results.css`

Global styles in:
- `index.css` (variables, resets, layout)
- `App.css` (minimal app-level styles)

### CSS Variables (in index.css)

```css
--primary-color: #2563eb      /* Blue */
--success-color: #10b981      /* Green */
--warning-color: #f59e0b      /* Yellow */
--danger-color: #ef4444       /* Red */
--bg-color: #f8fafc           /* Light gray */
--card-bg: #ffffff            /* White */
--text-primary: #1e293b       /* Dark gray */
--text-secondary: #64748b     /* Medium gray */
--border-color: #e2e8f0       /* Light border */
```

### Design Patterns

#### Cards
```css
background: var(--card-bg)
border-radius: 12px
padding: 2rem
box-shadow: var(--shadow-sm)
```

#### Buttons
```css
border-radius: 8px
padding: 0.75rem 1.5rem
font-weight: 600
transition: all 0.2s ease
```

Primary button: Blue background
Secondary button: White background, blue border

#### Sections
```css
margin-bottom: 2rem
border-left: 4px solid {color}
```

Color indicates severity (red/yellow/green)

---

## Responsive Design

### Mobile Breakpoint: 768px

```css
@media (max-width: 768px) {
  /* Stack layouts */
  /* Reduce font sizes */
  /* Full-width buttons */
}
```

### Key Mobile Changes

| Element | Desktop | Mobile |
|---------|---------|--------|
| Hero heading | 2.5rem | 2rem |
| Score card | Flex row | Flex column |
| Results header | Flex row | Flex column |
| Issue cards | Hover effects | Tap effects |

---

## Testing Checklist

### FileUpload Component
- [ ] Drag PDF → Shows file preview
- [ ] Click browse → File picker opens
- [ ] Select non-PDF → Shows error
- [ ] Select 30MB file → Shows error
- [ ] Click analyze → Shows loading
- [ ] Backend error → Shows error message
- [ ] Backend success → Calls onAnalysisComplete

### Results Component
- [ ] Score 85% → Green circle, "Good"
- [ ] Score 50% → Yellow circle, "Moderate"
- [ ] Score 25% → Red circle, "Poor"
- [ ] Has critical issues → Red section appears
- [ ] Has warnings → Yellow section appears
- [ ] Has passed checks → Green section appears
- [ ] Has suggestions → Yellow suggestion box
- [ ] Click reset → Clears results

### App Component
- [ ] Initial load → Shows hero + upload
- [ ] Error → Shows error message
- [ ] Loading → Shows spinner
- [ ] Results → Shows Results component
- [ ] Reset → Back to upload

---

## Common Patterns

### Loading States
```javascript
{loading && <div className="loading-state">...</div>}
```

### Error Display
```javascript
{error && (
  <div className="error-message">
    <div className="error-icon">⚠️</div>
    <p>{error}</p>
  </div>
)}
```

### Conditional Sections
```javascript
{items.length > 0 && (
  <div className="section">
    {items.map((item, index) => ...)}
  </div>
)}
```

---

**Last Updated:** January 16, 2026 - Initial component design
