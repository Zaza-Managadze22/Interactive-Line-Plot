import React from "react";
import FileInput from "./FileInput";

const FileUpload = ({ onUpload }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    onUpload(file);
  };

  return <FileInput handleFileUpload={handleFileUpload} />;
};

export default FileUpload;
