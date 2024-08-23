import { useEffect, useState } from "react";
import Aggregates from "./Aggregates";
import "./App.css";
import ChooseParams from "./ChooseParams";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import FileUpload from "./FileUpload";
import Plot from "./Plot";
import processFile from "./processFile";

const App = () => {
  const [file, setFile] = useState(null);
  const [dataLocations, setDataLocations] = useState([]);
  const [numRows, setNumRows] = useState(0);
  const [data, setData] = useState([]);
  const [errorMargins, setErrorMargins] = useState(null);
  const [stats, setStats] = useState(null);
  const [isFileBeingParsed, setIsFileBeingParsed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [params, setParams] = useState({
    N: 100, // Default window size
    S: 0, // Default start index
    P: 10, // Default increment
    T: 500, // Default interval in ms
  });
  const [worker, setWorker] = useState(null);

  const onFileUpload = (file) => {
    setIsFileBeingParsed(true);
    setFile(file);
    processFile(file, setUploadProgress, (numRows, locations) => {
      setDataLocations(locations);
      setNumRows(numRows);
      setIsFileBeingParsed(false);
    });
  };

  useEffect(() => {
    // Create a new web worker
    const myWorker = new Worker("parseAndDownSampleWorker.js", {
      type: "module",
    });

    // Set up event listener for messages from the worker
    myWorker.onmessage = function (event) {
      onDataParsed(event.data);
    };

    // Save the worker instance to state
    setWorker(myWorker);

    // Clean up the worker when the component unmounts
    return () => {
      myWorker.terminate();
    };
  }, []);

  // Callback for when data is parsed from the file and downsampled
  const onDataParsed = ({
    sampled,
    errorMargins,
    min,
    max,
    average,
    variance,
  }) => {
    setData(sampled);
    setErrorMargins(errorMargins);
    setStats({ min, max, average, variance });
  };

  // Effect to parse and downsample data when file or parameters change
  useEffect(() => {
    if (worker && file && !isFileBeingParsed) {
      worker.postMessage({
        file,
        startIndex: params.S,
        windowSize: params.N,
        // onDataParsed,
        dataLocations,
      });
    }
  }, [file, params.S, params.N, isFileBeingParsed, dataLocations, worker]);

  return isFileBeingParsed ? (
    <CircularProgressWithLabel value={uploadProgress} />
  ) : (
    <div>
      <FileUpload onUpload={onFileUpload} />
      <ChooseParams params={params} setParams={setParams} numRows={numRows} />
      {!!data.length && <Plot data={data} errorMargins={errorMargins} />}
      {!!stats && <Aggregates stats={stats} />}
    </div>
  );
};

export default App;
