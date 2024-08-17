import { useState } from "react";
import Aggregates from "./Aggregates";
import "./App.css";
import ChooseParams from "./ChooseParams";
import downsample from "./downsample";
import FileUpload from "./FileUpload";
import Plot from "./Plot";

const App = () => {
  const [data, setData] = useState([]);
  const [params, setParams] = useState({
    N: 100, // Default window size
    S: 0, // Default start index
    P: 10, // Default increment
    T: 500, // Default interval in ms
  });

  const window = data.slice(params.S, params.S + params.N);
  const [sampled, errorMargins] = downsample(window);

  return (
    <div>
      <FileUpload onDataParsed={setData} />
      <ChooseParams
        params={params}
        setParams={setParams}
        dataSize={data.length}
      />
      {!!sampled.length && <Plot data={sampled} errorMargins={errorMargins} />}
      {!!sampled.length && <Aggregates data={window} />}
    </div>
  );
};

export default App;
