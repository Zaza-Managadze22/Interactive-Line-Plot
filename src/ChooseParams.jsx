import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";

const ChooseParams = ({ params, setParams, dataSize }) => {
  const paramsList = {
    N: "Window Size",
    S: "Start Index",
    P: "Increment",
    T: "Interval",
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

  useEffect(() => {
    if (params.S + Math.max(params.N, params.P) >= dataSize)
      clearInterval(intervalId);
  }, [params]);

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
            onChange={(e) =>
              setParams((params) => ({
                ...params,
                [key]: parseInt(e.target.value),
              }))
            }
          />
          <br />
        </div>
      ))}
      <Button onClick={startSlidingWindow}>Start</Button>
    </div>
  );
};

export default ChooseParams;
