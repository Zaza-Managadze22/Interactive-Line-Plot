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
  const [data, setData] = useState([]);
  const [errorMargins, setErrorMargins] = useState(null);
  const [stats, setStats] = useState(null);
  const [stopSliding, setStopSliding] = useState(false);
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
    processFile(file, setUploadProgress, (locations) => {
      setDataLocations(locations);
      setIsFileBeingParsed(false);
    });
  };

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

  useEffect(() => {
    if (file && !isFileBeingParsed) {
      parseAndDownSample(
        file,
        params.S,
        params.N,
        onDataParsed,
        setStopSliding,
        dataLocations
      );
    }
  }, [file, params.S, params.N, isFileBeingParsed, dataLocations]);

  return isFileBeingParsed ? (
    <CircularProgressWithLabel value={uploadProgress} />
  ) : (
    <div>
      <FileUpload onUpload={onFileUpload} />
      <ChooseParams
        params={params}
        setParams={setParams}
        stopSliding={stopSliding}
      />
      {!!data.length && <Plot data={data} errorMargins={errorMargins} />}
      {!!stats && <Aggregates stats={stats} />}
    </div>
  );
};

export default App;
