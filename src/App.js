import React, { useState } from "react";
import axios from "axios";

const API_BASE = "https://csv-cleaner-backend.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [preview, setPreview] = useState([]); // will remain empty
  const [renameMap, setRenameMap] = useState({});

  // Upload
  const uploadFile = async () => {
    if (!file) return alert("Select file first");

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_BASE}/upload`, formData);

    setColumns(res.data.columns);
    setSelectedCols(res.data.columns);

    // ❗ Backend didn’t send preview → stays empty
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

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>CSV Cleaner</h2>

      {/* Upload */}
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadFile} style={{ marginLeft: 10 }}>
        Upload
      </button>

      {columns.length > 0 && (
        <div style={{ display: "flex", marginTop: 20, gap: "20px" }}>

          {/* LEFT PANEL */}
          <div style={{ width: "35%" }}>
            <h3>Select Columns</h3>

            {columns.map(col => (
              <div key={col}>
                <input
                  type="checkbox"
                  checked={selectedCols.includes(col)}
                  onChange={() => toggleColumn(col)}
                /> {col}
              </div>
            ))}

            <h3 style={{ marginTop: 20 }}>Rename Columns</h3>

            {selectedCols.map(col => (
              <div key={col}>
                {col} →
                <input
                  style={{ marginLeft: 5 }}
                  onChange={(e) => handleRename(col, e.target.value)}
                />
              </div>
            ))}

            <h3 style={{ marginTop: 20 }}>Reorder</h3>

            {selectedCols.map((col, index) => (
              <div key={col}>
                {col}
                <button onClick={() => moveColumn(index, -1)}>↑</button>
                <button onClick={() => moveColumn(index, 1)}>↓</button>
              </div>
            ))}
          </div>

          {/* RIGHT PANEL → PREVIEW */}
          <div style={{ width: "65%" }}>
            <h3>Live Preview</h3>

            <table border="1" cellPadding="5" style={{ width: "100%" }}>
              <thead>
                <tr>
                  {selectedCols.map(col => (
                    <th key={col}>{renameMap[col] || col}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* ❗ Will render nothing because preview = [] */}
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
      )}
    </div>
  );
}

export default App;