import Papa from "papaparse";
import React from "react";
import FileInput from "./FileInput";

const FileUpload = ({ onDataParsed }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    Papa.parse(file, {
      complete: (result) => {
        const data = result.data.map((row) => ({
          x: parseFloat(row[0]),
          y: parseFloat(row[1]),
        }));
        onDataParsed(data);
      },
      skipEmptyLines: true,
    });
  };

  return <FileInput handleFileUpload={handleFileUpload} />;
};

export default FileUpload;
