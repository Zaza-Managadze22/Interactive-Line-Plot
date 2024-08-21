import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";

const ChooseParams = ({ params, setParams, numRows }) => {
  // List of parameter labels
  const paramsList = {
    N: "Window Size",
    S: "Start Index",
    P: "Increment",
    T: "Interval",
  };

  // Handle parameter change
  const onParamChange = (key, value) => {
    if (value >= 0 && value <= numRows)
      setParams((params) => ({
        ...params,
        [key]: value,
      }));
  };

  const [intervalId, setIntervalId] = useState(null);

  const startSlidingWindow = () => {
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(() => {
      setParams((params) => ({
        ...params,
        S: params.S + params.P,
      }));
    }, params.T);
    setIntervalId(id);
  };

  // Stop sliding when we reach the end of file
  useEffect(() => {
    if (params.S + params.P >= numRows - 1) clearInterval(intervalId);
  }, [intervalId, params]);

  useEffect(() => {
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [intervalId]);

  return (
    <div>
      {Object.entries(paramsList).map(([key, title]) => (
        <div key={key}>
          <TextField
            variant="standard"
            label={`${key} (${title})`}
            type="number"
            name={key}
            value={params[key]}
            onChange={(e) => onParamChange(key, parseInt(e.target.value))}
          />
          <br />
        </div>
      ))}
      <Button onClick={startSlidingWindow}>Start</Button>
    </div>
  );
};

export default ChooseParams;
