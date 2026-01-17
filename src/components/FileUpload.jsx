import { useState, useRef } from 'react'
import axios from 'axios'
import './FileUpload.css'

const FileUpload = ({ onAnalysisComplete, onAnalysisStart, onError }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      onError('Please upload a PDF file')
      return
    }

    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024
    if (file.size > maxSize) {
      onError('File size exceeds 20MB limit')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    onAnalysisStart()

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post('http://localhost:8000/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout
      })

      onAnalysisComplete(response.data)
      setSelectedFile(null)
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        onError('Request timeout. The file might be too large or the server is slow.')
      } else if (error.response) {
        onError(error.response.data.detail || 'Analysis failed. Please try again.')
      } else if (error.request) {
        onError('Cannot connect to server. Make sure the backend is running on port 8000.')
      } else {
        onError('An unexpected error occurred. Please try again.')
      }
      setSelectedFile(null)
    }
  }

  const onButtonClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'file-selected' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {!selectedFile ? (
          <>
            <div className="upload-icon">📄</div>
            <h3>Upload Your Protocol</h3>
            <p>Drag and drop your PDF here, or click to browse</p>
            <button className="browse-button" onClick={onButtonClick}>
              Browse Files
            </button>
            <span className="file-info">PDF only, max 20MB</span>
          </>
        ) : (
          <>
            <div className="file-preview">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button 
                className="remove-file"
                onClick={() => setSelectedFile(null)}
              >
                ✕
              </button>
            </div>
            <button 
              className="analyze-button"
              onClick={handleUpload}
            >
              Analyze Protocol
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default FileUpload
