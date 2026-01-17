# BioScan Frontend - API Documentation

## Backend Connection

**Base URL:** `http://localhost:8000`

**Proxy:** Vite proxies `/api` to backend (configured in `vite.config.js`)

---

## Endpoints Used

### 1. POST /api/analyze

**Purpose:** Upload and analyze a protocol PDF

#### Request

**Method:** POST  
**URL:** `http://localhost:8000/api/analyze`  
**Content-Type:** `multipart/form-data`

**Body:**
```javascript
const formData = new FormData()
formData.append('file', pdfFile)  // PDF File object
```

**Timeout:** 60 seconds

**Example:**
```javascript
const response = await axios.post(
  'http://localhost:8000/api/analyze',
  formData,
  {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  }
)
```

#### Response (Success)

**Status:** 200 OK  
**Content-Type:** `application/json`

**Body:**
```json
{
  "success_probability": 75,
  "critical_issues": [
    {
      "issue": "Missing negative control",
      "description": "Protocol does not include a no-enzyme control..."
    }
  ],
  "warnings": [
    {
      "issue": "Unclear sample size",
      "description": "Protocol states 'multiple replicates' without..."
    }
  ],
  "passed_checks": [
    {
      "check": "Positive control present",
      "description": "Protocol includes known activator..."
    }
  ],
  "estimated_cost": "$5,000",
  "estimated_time": "4 weeks",
  "suggestions": [
    "Add negative control (no enzyme)",
    "Specify n=5 biological replicates"
  ],
  "raw_analysis": "... full LLM response ..."
}
```

#### Response (Error)

**Status:** 400, 500  
**Content-Type:** `application/json`

**Body:**
```json
{
  "detail": "Error message string"
}
```

**Common Error Messages:**

| Status | Message | Cause |
|--------|---------|-------|
| 400 | "Only PDF files are supported" | Wrong file type |
| 400 | "File size exceeds 20MB limit" | File too large |
| 400 | "Could not extract text from PDF" | Empty or scanned PDF |
| 500 | "Error analyzing protocol: ..." | Backend error |

---

### 2. GET /health

**Purpose:** Check if backend is running

#### Request

**Method:** GET  
**URL:** `http://localhost:8000/health`

#### Response

**Status:** 200 OK  
**Body:**
```json
{
  "status": "healthy"
}
```

---

### 3. GET /api/providers

**Purpose:** List available LLM providers (informational)

#### Request

**Method:** GET  
**URL:** `http://localhost:8000/api/providers`

#### Response

**Status:** 200 OK  
**Body:**
```json
{
  "available": ["groq", "claude", "openai"],
  "current": "groq"
}
```

---

## API Client Configuration

### Axios Setup

```javascript
import axios from 'axios'

// No global config needed
// Configured per-request in FileUpload.jsx
```

### Request Configuration

```javascript
{
  headers: {
    'Content-Type': 'multipart/form-data'  // For file upload
  },
  timeout: 60000  // 60 seconds (LLM can be slow)
}
```

---

## Error Handling

### Error Types

#### 1. Timeout Error
```javascript
if (error.code === 'ECONNABORTED') {
  // Request took > 60 seconds
  message = 'Request timeout. File might be too large.'
}
```

#### 2. Server Error (4xx, 5xx)
```javascript
if (error.response) {
  // Backend returned error response
  message = error.response.data.detail || 'Analysis failed'
}
```

#### 3. Network Error
```javascript
if (error.request) {
  // Request sent but no response
  message = 'Cannot connect to server. Make sure backend is running.'
}
```

#### 4. Unknown Error
```javascript
else {
  // Something else went wrong
  message = 'An unexpected error occurred.'
}
```

### User-Facing Messages

All errors are converted to user-friendly messages:

| Technical Error | User Message |
|----------------|--------------|
| ECONNABORTED | "Request timeout. The file might be too large..." |
| 400 (PDF type) | "Please upload a PDF file" |
| 400 (size) | "File size exceeds 20MB limit" |
| 400 (empty) | "Could not extract text. Make sure it's not a scanned image" |
| 500 | "Analysis failed. Please try again" |
| Network | "Cannot connect to server. Make sure backend is running on port 8000" |

---

## API Flow Diagram

```
Frontend                      Backend
   │                            │
   │  POST /api/analyze        │
   │  (PDF file)                │
   ├───────────────────────────>│
   │                            │
   │                            │ Extract text (PyPDF2)
   │                            │ Analyze (LLM)
   │                            │
   │  200 OK                    │
   │  (Analysis JSON)           │
   │<───────────────────────────┤
   │                            │
   │  Display Results           │
   │                            │
```

---

## CORS Configuration

### Backend CORS Settings

```python
# In main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Why This Works

- Frontend runs on `localhost:5173` (Vite default)
- Backend allows requests from that origin
- No CORS errors during development

---

## Request/Response Examples

### Example 1: Successful Analysis

**Request:**
```javascript
// File: protocol.pdf (2.3 MB)
const formData = new FormData()
formData.append('file', selectedFile)

const response = await axios.post(
  'http://localhost:8000/api/analyze',
  formData,
  {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  }
)
```

**Response:**
```json
{
  "success_probability": 85,
  "critical_issues": [],
  "warnings": [
    {
      "issue": "Statistical test not specified",
      "description": "While n=5 is stated, no mention of which test..."
    }
  ],
  "passed_checks": [
    {
      "check": "All controls present",
      "description": "Both positive and negative controls included."
    },
    {
      "check": "Clear replication",
      "description": "n=5 biological replicates clearly stated."
    }
  ],
  "estimated_cost": "$3,000",
  "estimated_time": "3 weeks",
  "suggestions": [
    "Specify statistical test (e.g., one-way ANOVA)"
  ],
  "raw_analysis": "..."
}
```

### Example 2: File Too Large

**Request:**
```javascript
// File: huge_protocol.pdf (25 MB)
const formData = new FormData()
formData.append('file', selectedFile)
```

**Response:**
```json
{
  "detail": "File size exceeds 20MB limit"
}
// Status: 400
```

**Frontend Handling:**
```javascript
onError("File size exceeds 20MB limit")
// Shows error message to user
```

### Example 3: Wrong File Type

**Request:**
```javascript
// File: protocol.docx
const formData = new FormData()
formData.append('file', selectedFile)
```

**Response:**
```json
{
  "detail": "Only PDF files are supported"
}
// Status: 400
```

**Frontend Handling:**
```javascript
// Caught before API call
if (!file.name.toLowerCase().endsWith('.pdf')) {
  onError('Please upload a PDF file')
  return  // Don't make API call
}
```

### Example 4: Backend Offline

**Request:**
```javascript
const response = await axios.post('http://localhost:8000/api/analyze', formData)
```

**Error:**
```javascript
// error.request exists but no error.response
if (error.request) {
  onError('Cannot connect to server. Make sure backend is running on port 8000.')
}
```

---

## API Testing

### Manual Testing

#### 1. Test Backend Health
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

#### 2. Test Analysis Endpoint
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@test_protocol.pdf"
# Should return JSON with analysis
```

#### 3. Test Error Handling
```bash
# Wrong file type
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@test.txt"
# Should return 400 error
```

### Frontend Testing

Use browser DevTools Network tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Upload file
4. Inspect request/response

**Check:**
- Request method: POST
- Content-Type: multipart/form-data
- Response status: 200
- Response body: Valid JSON

---

## Performance Considerations

### Request Time

Typical analysis takes:
- PDF parsing: 1-2 seconds
- LLM analysis: 5-10 seconds (Groq is fastest)
- **Total: 6-12 seconds**

### Timeout Strategy

- **Frontend timeout:** 60 seconds
- **Backend timeout:** None (relies on LLM provider timeouts)
- **Why 60s:** Gives LLM plenty of time, but prevents infinite hangs

### Loading UX

```javascript
onAnalysisStart()          // Show spinner immediately
// ... API call (6-12 seconds) ...
onAnalysisComplete(data)   // Hide spinner, show results
```

User sees:
- Loading spinner
- "Analyzing your protocol..."
- "This may take 10-15 seconds"

---

## Security Notes

### Input Validation

**Frontend (FileUpload.jsx):**
- File type check (`.pdf` extension)
- File size check (20MB max)

**Backend (main.py):**
- File type check (`.pdf` extension)
- File size check (20MB max)
- PDF parsing safety (PyPDF2 handles malicious PDFs)

### API Keys

- Never sent to frontend
- Stored in backend `.env` file
- Not exposed in API responses

### CORS

- Restricted to `localhost:5173` (frontend)
- No wildcard (`*`) origins
- Prevents unauthorized access

---

## Troubleshooting

### "Cannot connect to server"

**Cause:** Backend not running

**Fix:**
```bash
cd ../Scan_backend
python main.py
```

### "Request timeout"

**Cause:** Backend is slow or file is huge

**Fix:**
- Check file size (should be < 20MB)
- Check backend logs for errors
- Try a smaller file

### CORS Errors

**Symptom:** Console shows "CORS policy blocked..."

**Cause:** Frontend URL not in backend CORS config

**Fix:** Make sure frontend runs on `localhost:5173`

### Empty Response

**Symptom:** Response is `{}`

**Cause:** Backend returned unexpected format

**Fix:** Check backend logs for errors

---

**Last Updated:** January 16, 2026 - Initial API integration
