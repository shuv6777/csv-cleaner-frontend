import React, { useState } from "react";
import axios from "axios";

const API_BASE = "https://csv-cleaner-backend.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_BASE}/upload`, formData);
    setColumns(res.data.columns);
    setSelectedCols(res.data.columns);
  };

  const processFile = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      columns: selectedCols,
      rename: {}
    };

    formData.append("config", JSON.stringify(config));

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
    <div style={{ padding: 20 }}>
      <h2>CSV Cleaner</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br /><br />

      <button onClick={uploadFile}>Upload</button>

      <br /><br />

      {columns.length > 0 && (
        <div>
          <h4>Select Columns</h4>
          {columns.map((col) => (
            <div key={col}>
              <input
                type="checkbox"
                checked={selectedCols.includes(col)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCols([...selectedCols, col]);
                  } else {
                    setSelectedCols(selectedCols.filter(c => c !== col));
                  }
                }}
              />
              {col}
            </div>
          ))}
        </div>
      )}

      <br />

      <button onClick={processFile}>Process & Download</button>
    </div>
  );
}

export default App;