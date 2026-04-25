import React, { useState } from "react";
import axios from "axios";

const API_BASE = "https://csv-cleaner-backend.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [preview, setPreview] = useState([]);
  const [renameMap, setRenameMap] = useState({});

  // Upload
  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_BASE}/upload`, formData);

    setColumns(res.data.columns);
    setSelectedCols(res.data.columns);
    setPreview(res.data.preview || []);
  };

  // Toggle column
  const toggleColumn = (col) => {
    if (selectedCols.includes(col)) {
      setSelectedCols(selectedCols.filter(c => c !== col));
    } else {
      setSelectedCols([...selectedCols, col]);
    }
  };

  // Rename
  const handleRename = (col, newName) => {
    setRenameMap({
      ...renameMap,
      [col]: newName
    });
  };

  // Reorder (move up/down)
  const moveColumn = (index, direction) => {
    const newCols = [...selectedCols];
    const swapIndex = index + direction;

    if (swapIndex < 0 || swapIndex >= newCols.length) return;

    [newCols[index], newCols[swapIndex]] = [newCols[swapIndex], newCols[index]];
    setSelectedCols(newCols);
  };

  // Process & Download
  const processFile = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      columns: selectedCols,
      rename: renameMap
    };

    formData.append("config", JSON.stringify(config));

    const res = await axios.post(`${API_BASE}/process`, formData);

    const byteNumbers = new Array(res.data.file.length)
      .fill(0)
      .map((_, i) => res.data.file.charCodeAt(i));

    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: res.data.mime
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", res.data.filename);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h2>CSV & Excel Cleaner</h2>

      {/* Upload */}
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={uploadFile} disabled={!file}>Upload</button>

      {/* ACTIONS */}
      {columns.length > 0 && (
        <>
          <h3 style={{ marginTop: 30 }}>Column Actions</h3>

          {/* SELECT / DELETE */}
          <details open>
            <summary><b>Select / Delete Columns</b></summary>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: 10 }}>
              {columns.map(col => (
                <label key={col} style={{
                  border: "1px solid #ccc",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  background: selectedCols.includes(col) ? "#d4f8d4" : "#f5f5f5"
                }}>
                  <input
                    type="checkbox"
                    checked={selectedCols.includes(col)}
                    onChange={() => toggleColumn(col)}
                  /> {col}
                </label>
              ))}
            </div>
          </details>

          {/* RENAME */}
          <details>
            <summary><b>Rename Columns</b></summary>

            {selectedCols.map(col => (
              <div key={col} style={{ marginTop: 10 }}>
                {col} →
                <input
                  placeholder="New name"
                  style={{ marginLeft: 10 }}
                  onChange={(e) => handleRename(col, e.target.value)}
                />
              </div>
            ))}
          </details>

          {/* REORDER */}
          <details>
            <summary><b>Reorder Columns</b></summary>

            {selectedCols.map((col, index) => (
              <div key={col} style={{ marginTop: 5 }}>
                {col}
                <button onClick={() => moveColumn(index, -1)} style={{ marginLeft: 10 }}>↑</button>
                <button onClick={() => moveColumn(index, 1)}>↓</button>
              </div>
            ))}
          </details>

          <p style={{ marginTop: 10 }}>
            Selected: {selectedCols.length} / {columns.length}
          </p>
        </>
      )}

      {/* LIVE PREVIEW */}
      {preview.length > 0 && (
        <>
          <h3 style={{ marginTop: 30 }}>Live Preview</h3>

          <div style={{ overflowX: "auto" }}>
            <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {selectedCols.map(col => (
                    <th key={col}>{renameMap[col] || col}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {selectedCols.map(col => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* PROCESS */}
      {columns.length > 0 && (
        <button onClick={processFile} style={{ marginTop: 20 }}>
          Process & Download
        </button>
      )}
    </div>
  );
}

export default App;