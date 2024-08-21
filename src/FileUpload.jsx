import { Button } from "@mui/material";
import React, { useRef } from "react";

const FileUpload = ({ onUpload }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    onUpload(file);
  };

  const inputRef = useRef(null);

  function handleButtonClick(e) {
    e.preventDefault();
    if (!inputRef || !inputRef.current) return;

    inputRef.current.click();
  }

  return (
    <>
      <Button onClick={handleButtonClick}>Upload File</Button>
      <input ref={inputRef} type="file" hidden onChange={handleFileUpload} />
    </>
  );
};

export default FileUpload;
