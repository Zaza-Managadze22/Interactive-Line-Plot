import { Button } from "@mui/material";
import { useRef } from "react";

const FileInput = ({ handleFileUpload }) => {
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

export default FileInput;
