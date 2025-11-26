import { useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import "./UploadCSV.css";

function UploadCSV() {
  const [file, setFile] = useState(null);
  const [sourceType, setSourceType] = useState("");
  const [status, setStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function handleChange(e) {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (
        validTypes.includes(selectedFile.type) ||
        selectedFile.name.endsWith(".csv") ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
        console.log(`Selected file's type is: ${selectedFile.type}`)
        setFile(selectedFile);
        setMessage("");
      } else {
        setMessage("Please upload a valid CSV or Excel file");
        setFile(null);
      }
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (
        validTypes.includes(droppedFile.type) ||
        droppedFile.name.endsWith(".csv") ||
        droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".xls")
      ) {
        setFile(droppedFile);
        setMessage("");
      } else {
        setMessage("Please upload a valid CSV or Excel file");
      }
    }
  }

  function handleBrowseClick() {
    document.getElementById("file-input").click();
  }

  function handleSourceTypeChange(e) {
    setSourceType(e.target.value);
    setMessage("");
  }

  async function handleScanAndMap() {

    if (!file) {
      setMessage("Please select a file first!");
      return;
    }

    if (!sourceType) {
      setMessage("Please select a source type!");
      return;
    }

    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("source_type", sourceType);
    //Printing entries of formData.
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:-`, value);
    }
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // const response = await fetch("http://192.168.18.9:8005/upload", {
      //   method: "POST",
      //   body: formData,
      // });
      const response = await fetch(`${API_ENDPOINTS.upload}`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Upload response: ", data);

      setStatus("Success");
      setUploadProgress(100);
      setMessage(`Total records ${data.total_rows}. Imported ${data.imported_rows} records. ${data.skipped_existing_in_db
} records already existed. ${data.skipped_in_file_duplicates} records were duplicates in file. ${data.skipped_in_file_duplicates
} Invalid emails.`)
      //setMessage(data.message);
      //setMessage("File uploaded and scanned successfully!");
    } catch (error) {
      console.error("File Upload error: ", error);
      setStatus("Error");
      setUploadProgress(0);
      setMessage("Upload failed. Please try again.");
    }
  }

  return (
    <div className="uploadcsv-container">
      <div className="uploadcsv-header">
        <h1 className="uploadcsv-title">Upload Contacts</h1>
        <p className="uploadcsv-subtitle">
          Upload CSV or Excel files with your contact data
        </p>
      </div>

      <div className="uploadcsv-card">
        <input
          id="file-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          style={{ display: "none" }}
        />

        <div
          className={`uploadcsv-dropzone ${isDragging ? "dragging" : ""
            } ${file ? "has-file" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="uploadcsv-dropzone-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
              <line x1="14" y1="8" x2="14" y2="2"></line>
              <line x1="11" y1="5" x2="17" y2="5"></line>
            </svg>
          </div>

          {!file ? (
            <div className="uploadcsv-dropzone-content">
              <p className="uploadcsv-dropzone-text">
                Drop your CSV or Excel file here, or{" "}
                <span
                  className="uploadcsv-browse-link"
                  onClick={handleBrowseClick}
                >
                  browse files
                </span>
              </p>
              <p className="uploadcsv-dropzone-subtext">
                Supports CSV, XLSX, and XLS files up to 10MB
              </p>
            </div>
          ) : (
            <div className="uploadcsv-file-info">
              <div className="uploadcsv-file-icon">📄</div>
              <div className="uploadcsv-file-details">
                <p className="uploadcsv-file-name">{file.name}</p>
                <p className="uploadcsv-file-meta">
                  {(file.size / 1024).toFixed(2)} KB • {file.type || "Unknown"}
                </p>
              </div>
              <button
                className="uploadcsv-remove-file"
                onClick={() => setFile(null)}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {status === "uploading" && (
          <div className="uploadcsv-progress-container">
            <div className="uploadcsv-progress-bar">
              <div
                className="uploadcsv-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="uploadcsv-progress-text">
              {uploadProgress}% uploaded
            </p>
          </div>
        )}

        {message && (
          <div
            className={`uploadcsv-message ${status === "Success"
              ? "success"
              : status === "Error"
                ? "error"
                : "warning"
              }`}
          >
            {message}
          </div>
        )}

        {/* Source Type Dropdown */}
        <div className="uploadcsv-source-type">
          <label htmlFor="source-type" className="uploadcsv-label">
            Data Source Type <span className="uploadcsv-required">*</span>
          </label>
          <select
            id="source-type"
            value={sourceType}
            onChange={handleSourceTypeChange}
            className={`uploadcsv-select ${sourceType ? "selected" : ""}`}
          >
            <option value="" disabled>
              Select data source
            </option>
            <option value="seamless">Seamless</option>
            <option value="skrapp">Skrapp</option>
          </select>
        </div>

        <button
          className={`uploadcsv-scan-button ${file && sourceType && status !== "uploading" ? "enabled" : ""
            }`}
          onClick={handleScanAndMap}
          disabled={!file || !sourceType || status === "uploading"}
        >
          {status === "uploading" ? "Uploading..." : "Scan"}
        </button>
      </div>
    </div>
  );
}

export default UploadCSV;