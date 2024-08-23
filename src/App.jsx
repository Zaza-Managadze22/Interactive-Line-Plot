import { useEffect, useMemo, useState } from "react";
import Aggregates from "./Aggregates";
import "./App.css";
import ChooseParams from "./ChooseParams";
import FileUpload from "./FileUpload";
import parseAndDownSample, { Baskets } from "./parseAndDownSample";
import Plot from "./Plot";
import ProcessFile from "./processFile";

const MAX_POINTS_ON_CHART = 300;

const App = () => {
  const [file, setFile] = useState(null);
  const [chartResults, setChartResults] = useState(null);
  const [stats, setStats] = useState(null);
  const [stopSliding, setStopSliding] = useState(false);
  const [params, setParams] = useState({
    N: 10, // Default window size
    S: 0, // Default start index
    P: 10, // Default increment
    T: 500, // Default interval in ms
  });

  const basketSize = Math.max(1, Math.floor(params.N / MAX_POINTS_ON_CHART));

  const baskets = useMemo(() => new Baskets(basketSize), [basketSize]);

  const processor = useMemo(() => {
    if (!file) return null;
    window.sFile = file;
    const leftProcessor = new ProcessFile(file);
    const rightProcessor = new ProcessFile(file, () => {
      setStopSliding(true);
    });
    window.leftProcessor = leftProcessor;
    window.rightProcessor = rightProcessor;
    return { left: leftProcessor, right: rightProcessor };
  }, [file]);

  const onDataParsed = ({
    sampled,
    errorMargins,
    basketIds,
    min,
    max,
    average,
    variance,
  }) => {
    setChartResults({ data: sampled, errorMargins, basketIds });
    setStats({ min, max, average, variance });
  };

  useEffect(() => {
    if (file) {
      parseAndDownSample(
        processor,
        baskets,
        params.S,
        params.N,
        onDataParsed,
        setStopSliding
      );
    }
  }, [processor, baskets, params.S, params.N]);

  return (
    <div>
      <FileUpload onUpload={setFile} />
      <ChooseParams
        params={params}
        setParams={setParams}
        stopSliding={stopSliding}
      />
      {!!chartResults && !!chartResults.data.length && (
        <Plot N={params.N} {...chartResults} />
      )}
      {!!stats && <Aggregates stats={stats} />}
    </div>
  );
};

export default App;
