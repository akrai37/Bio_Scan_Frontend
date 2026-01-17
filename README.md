# BioScan Frontend

React + Vite frontend for uploading and analyzing experimental protocols.

## Features

- **Drag-and-Drop Upload**: Easy PDF file upload
- **Real-time Analysis**: Instant feedback on protocol quality
- **Visual Results**: Color-coded issues (Red/Yellow/Green)
- **Responsive Design**: Works on desktop and mobile
- **Success Probability Score**: Clear metric for protocol viability

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 3. Make Sure Backend is Running

The frontend connects to the backend at `http://localhost:8000`.

Start the backend first:
```bash
cd ../Scan_backend
python main.py
```

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Project Structure

```
Scan_frontend/
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx       # PDF upload component
│   │   ├── FileUpload.css
│   │   ├── Results.jsx          # Analysis results display
│   │   ├── Results.css
│   │   ├── Header.jsx           # App header
│   │   └── Header.css
│   ├── App.jsx                  # Main app component
│   ├── App.css
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## How It Works

### 1. Upload Flow
```
User drags PDF → FileUpload validates → Shows file preview → User clicks "Analyze"
```

### 2. Analysis Flow
```
POST to /api/analyze → Show loading → Receive results → Display in Results component
```

### 3. Results Display
- **Success Probability**: Circular progress indicator
- **Critical Issues**: Red flags that will cause failure
- **Warnings**: Yellow flags to improve
- **Good Practices**: Green checks for well-designed aspects
- **Suggestions**: Actionable recommendations

## API Integration

The frontend connects to the backend API:

**Endpoint:** `POST http://localhost:8000/api/analyze`

**Request:**
- Content-Type: `multipart/form-data`
- Body: PDF file

**Response:**
```json
{
  "success_probability": 75,
  "critical_issues": [...],
  "warnings": [...],
  "passed_checks": [...],
  "estimated_cost": "$5,000",
  "estimated_time": "4 weeks",
  "suggestions": [...]
}
```

## Styling

Uses CSS variables for easy theming:

```css
--primary-color: #2563eb
--success-color: #10b981
--warning-color: #f59e0b
--danger-color: #ef4444
```

Gradient header: Purple gradient (667eea → 764ba2)

## Error Handling

The app handles:
- ✅ Wrong file type (non-PDF)
- ✅ File too large (>20MB)
- ✅ Backend connection errors
- ✅ Timeout errors
- ✅ API response errors

All errors show user-friendly messages.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Tips

### Hot Reload
Vite provides instant hot module replacement. Changes appear immediately.

### API Proxy
The Vite config proxies `/api` requests to `http://localhost:8000` to avoid CORS issues during development.

### Component State
State flow: `App → FileUpload → Results`
- `App` manages global state (results, loading, errors)
- Components communicate via props and callbacks

## Production Build

```bash
npm run build
```

Creates optimized production build in `dist/` folder.

To preview:
```bash
npm run preview
```

## Troubleshooting

**"Cannot connect to server"**
- Make sure backend is running on port 8000
- Check `http://localhost:8000/health`

**Styles not loading**
- Clear browser cache
- Restart dev server

**File upload not working**
- Check file is PDF
- Check file size < 20MB
- Check browser console for errors

## Future Enhancements

- Protocol comparison (before/after improvements)
- Save analysis history
- Export results as PDF report
- Share results via link
- Dark mode
