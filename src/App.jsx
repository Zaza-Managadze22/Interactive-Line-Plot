import { useEffect, useState } from "react";
import Aggregates from "./Aggregates";
import "./App.css";
import ChooseParams from "./ChooseParams";
import FileUpload from "./FileUpload";
import parseAndDownSample from "./parseAndDownSample";
import Plot from "./Plot";
import processFile from "./processFile";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

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

  const onFileUpload = (file) => {
    setIsFileBeingParsed(true);
    setFile(file);
    processFile(file, setUploadProgress, (numRows, locations) => {
      setDataLocations(locations);
      setNumRows(numRows);
      setIsFileBeingParsed(false);
    });
  };

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
    if (file && !isFileBeingParsed) {
      parseAndDownSample(file, params.S, params.N, onDataParsed, dataLocations);
    }
  }, [file, params.S, params.N, isFileBeingParsed, dataLocations]);

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
