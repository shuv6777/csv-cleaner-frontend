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
    setRenameMap({});
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

  // Reorder
  const moveColumn = (index, direction) => {
    const newCols = [...selectedCols];
    const swapIndex = index + direction;

    if (swapIndex < 0 || swapIndex >= newCols.length) return;

    [newCols[index], newCols[swapIndex]] = [newCols[swapIndex], newCols[index]];
    setSelectedCols(newCols);
  };

  // Save config
  const saveConfig = () => {
    const config = {
      selectedCols,
      renameMap
    };
    localStorage.setItem("csvConfig", JSON.stringify(config));
    alert("Configuration saved!");
  };

  // Load config
  const loadConfig = () => {
    const saved = localStorage.getItem("csvConfig");

    if (!saved) {
      alert("No saved configuration found");
      return;
    }

    const config = JSON.parse(saved);
    setSelectedCols(config.selectedCols || []);
    setRenameMap(config.renameMap || {});
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
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>CSV & Excel Cleaner</h2>

      {/* Upload */}
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadFile} disabled={!file} style={{ marginLeft: 10 }}>
        Upload
      </button>

      {columns.length > 0 && (
        <div style={{ display: "flex", marginTop: 20, gap: "20px" }}>

          {/* LEFT PANEL */}
          <div style={{ width: "35%", maxHeight: "80vh", overflowY: "auto" }}>

            <h3>Configuration</h3>
            <button onClick={saveConfig}>Save</button>
            <button onClick={loadConfig} style={{ marginLeft: 10 }}>
              Load
            </button>

            {/* SELECT */}
            <details open style={{ marginTop: 20 }}>
              <summary><b>Select / Delete Columns</b></summary>

              {columns.map(col => (
                <div key={col}>
                  <input
                    type="checkbox"
                    checked={selectedCols.includes(col)}
                    onChange={() => toggleColumn(col)}
                  /> {col}
                </div>
              ))}
            </details>

            {/* RENAME */}
            <details style={{ marginTop: 20 }}>
              <summary><b>Rename Columns</b></summary>

              {selectedCols.map(col => (
                <div key={col}>
                  {col} →
                  <input
                    style={{ marginLeft: 5 }}
                    onChange={(e) => handleRename(col, e.target.value)}
                  />
                </div>
              ))}
            </details>

            {/* REORDER */}
            <details style={{ marginTop: 20 }}>
              <summary><b>Reorder Columns</b></summary>

              {selectedCols.map((col, index) => (
                <div key={col}>
                  {col}
                  <button onClick={() => moveColumn(index, -1)}>↑</button>
                  <button onClick={() => moveColumn(index, 1)}>↓</button>
                </div>
              ))}
            </details>

            <button onClick={processFile} style={{ marginTop: 20 }}>
              Download File
            </button>

          </div>

          {/* RIGHT PANEL */}
          <div style={{
            width: "65%",
            position: "sticky",
            top: 10,
            alignSelf: "flex-start"
          }}>
            <h3>Live Preview</h3>

            <div style={{
              maxHeight: "70vh",
              overflow: "auto",
              border: "1px solid #ccc"
            }}>
              <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
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

          </div>

        </div>
      )}
    </div>
  );
}

export default App;