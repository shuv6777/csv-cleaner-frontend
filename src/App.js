import React, { useState } from "react";
import axios from "axios";

const API_BASE = "https://csv-cleaner-backend.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [preview, setPreview] = useState([]);
  const [renameMap, setRenameMap] = useState({});
  const [loading, setLoading] = useState(false);

  // 🚀 Upload
  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API_BASE}/upload`, formData);

      setColumns(res.data.columns);
      setSelectedCols(res.data.columns);
      setPreview(res.data.preview || []);
      setRenameMap({});

      alert("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Toggle column
  const toggleColumn = (col) => {
    if (selectedCols.includes(col)) {
      setSelectedCols(selectedCols.filter((c) => c !== col));
    } else {
      setSelectedCols([...selectedCols, col]);
    }
  };

  // ✏️ Rename
  const handleRename = (col, newName) => {
    setRenameMap({
      ...renameMap,
      [col]: newName,
    });
  };

  // 🔀 Reorder
  const moveColumn = (index, direction) => {
    const newCols = [...selectedCols];
    const swapIndex = index + direction;

    if (swapIndex < 0 || swapIndex >= newCols.length) return;

    [newCols[index], newCols[swapIndex]] = [
      newCols[swapIndex],
      newCols[index],
    ];

    setSelectedCols(newCols);
  };

  // 💾 Save Config
  const saveConfig = () => {
    const config = {
      selectedCols,
      renameMap,
    };

    localStorage.setItem("csvConfig", JSON.stringify(config));
    alert("Configuration saved for future laziness.");
  };

  // 📂 Load Config
  const loadConfig = () => {
    const saved = localStorage.getItem("csvConfig");

    if (!saved) {
      alert("No saved configuration found.");
      return;
    }

    const config = JSON.parse(saved);

    setSelectedCols(config.selectedCols || []);
    setRenameMap(config.renameMap || {});

    alert("Last configuration loaded successfully!");
  };

  // 📥 Process & Download
  const processFile = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const config = {
        columns: selectedCols,
        rename: renameMap,
      };

      formData.append("config", JSON.stringify(config));

      const res = await axios.post(`${API_BASE}/process`, formData);

      const byteNumbers = new Array(res.data.file.length)
        .fill(0)
        .map((_, i) => res.data.file.charCodeAt(i));

      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: res.data.mime,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", res.data.filename);
      document.body.appendChild(link);
      link.click();

      alert("Download started successfully!");
    } catch (err) {
      console.error(err);
      alert("Download failed. Please try again.");
    }
  };

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "20px",
    background: "#fafafa",
  };

  const primaryButton = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    marginRight: "10px",
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "Arial, sans-serif",
        maxWidth: "1400px",
        margin: "auto",
      }}
    >
      {/* HEADER */}
      <h1 style={{ marginBottom: 5 }}>CleanMySheet</h1>

      <p style={{ color: "#555", marginTop: 0 }}>
        Because opening Excel every time to rename or delete columns is a
        full-time job nobody asked for.
      </p>

      {/* UPLOAD */}
      <div style={cardStyle}>
        <h3>Upload Your File</h3>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br />
        <br />

        <button
          onClick={uploadFile}
          disabled={!file || loading}
          style={{
            ...primaryButton,
            background: "#4CAF50",
            color: "white",
          }}
        >
          Upload File
        </button>

        <p style={{ fontSize: "12px", color: "#777", marginTop: 10 }}>
          * Make sure your column headers are placed in the first row for
          accurate detection.
        </p>

        {loading && (
          <p style={{ color: "blue", fontWeight: "bold" }}>
            Processing... Excel doesn’t need to suffer today.
          </p>
        )}
      </div>

      {/* PREVIEW */}
      {preview.length > 0 && (
        <div style={cardStyle}>
          <h3>Live Preview</h3>

          <div style={{ overflowX: "auto" }}>
            <table
              border="1"
              cellPadding="4"
              style={{
                borderCollapse: "collapse",
                fontSize: "10px",
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  {selectedCols.map((col) => (
                    <th key={col}>{renameMap[col] || col}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {preview.slice(0, 3).map((row, i) => (
                  <tr key={i}>
                    {selectedCols.map((col) => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIG */}
      {columns.length > 0 && (
        <div style={cardStyle}>
          <h3>Saved Configurations</h3>

          <button
            onClick={saveConfig}
            style={{
              ...primaryButton,
              background: "#2196F3",
              color: "white",
            }}
          >
            Save Setup
          </button>

          <button
            onClick={loadConfig}
            style={{
              ...primaryButton,
              background: "#2196F3",
              color: "white",
            }}
          >
            Load Last Setup
          </button>
        </div>
      )}

      {/* COLUMN ACTIONS */}
      {columns.length > 0 && (
        <div style={cardStyle}>
          <h3>Column Actions</h3>

          {/* SELECT */}
          <details open>
            <summary>
              <b>Select / Delete Columns</b>
            </summary>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: 10,
              }}
            >
              {columns.map((col) => (
                <label
                  key={col}
                  style={{
                    border: "1px solid #ccc",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    background: selectedCols.includes(col)
                      ? "#d4f8d4"
                      : "#f5f5f5",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCols.includes(col)}
                    onChange={() => toggleColumn(col)}
                  />{" "}
                  {col}
                </label>
              ))}
            </div>
          </details>

          {/* REORDER */}
          <details style={{ marginTop: 15 }}>
            <summary>
              <b>Reorder Columns</b>
            </summary>

            {selectedCols.map((col, index) => (
              <div key={col} style={{ marginTop: 5 }}>
                {col}
                <button
                  onClick={() => moveColumn(index, -1)}
                  style={{ marginLeft: 10 }}
                >
                  ↑
                </button>

                <button onClick={() => moveColumn(index, 1)}>
                  ↓
                </button>
              </div>
            ))}
          </details>

          {/* RENAME */}
          <details style={{ marginTop: 15 }}>
            <summary>
              <b>Rename Columns</b>
            </summary>

            {selectedCols.map((col) => (
              <div key={col} style={{ marginTop: 10 }}>
                {col} →
                <input
                  placeholder="New name"
                  style={{ marginLeft: 10 }}
                  onChange={(e) =>
                    handleRename(col, e.target.value)
                  }
                />
              </div>
            ))}
          </details>

          

          <p style={{ marginTop: 15 }}>
            Selected: {selectedCols.length} / {columns.length}
          </p>
        </div>
      )}

      {/* DOWNLOAD */}
      {columns.length > 0 && (
        <div style={cardStyle}>
          <button
            onClick={processFile}
            style={{
              ...primaryButton,
              background: "#333",
              color: "white",
            }}
          >
            Download Clean File
          </button>
        </div>
      )}
    </div>
  );
}

export default App;