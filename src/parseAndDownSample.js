import Papa from "papaparse";

const parseAndDownSample = (
  file,
  startIndex,
  windowSize,
  onDataParsed,
  stopSliding,
  dataLocations,
  threshold = 300
) => {
  const sampled = [];
  const errorMargins = { min: [], max: [] };
  const bucketSize = Math.max(1, Math.floor(windowSize / threshold));
  const offset = dataLocations[Math.floor(startIndex / 1000)];
  let bucket = [];
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let sumSq = 0;
  let average = 0;
  let variance = 0;
  let count = 0;

  const saveBucketStats = () => {
    const avgX =
      bucket.reduce((sum, point) => sum + point.x, 0) / bucket.length;
    const avgY =
      bucket.reduce((sum, point) => sum + point.y, 0) / bucket.length;

    const yMin = Math.min(...bucket.map((point) => point.y));
    const yMax = Math.max(...bucket.map((point) => point.y));

    sampled.push({ x: avgX, y: avgY });
    errorMargins.min.push({ x: avgX, y: yMin });
    errorMargins.max.push({ x: avgX, y: yMax });

    bucket = [];
  };

  console.log(offset);

  Papa.parse(file.slice(offset), {
    beforeFirstChunk: () => {
      stopSliding(false);
    },
    step: (result, parser) => {
      const row = result.data;
      const point = {
        x: parseFloat(row[0]),
        y: parseFloat(row[1]),
      };
      bucket.push(point);
      min = Math.min(min, point.y);
      max = Math.max(max, point.y);
      sum += point.y;
      sumSq += point.y * point.y;
      average = sum / count;
      variance = sumSq / count - average * average;
      if (bucket.length === bucketSize) {
        saveBucketStats();
      }
      if (count === windowSize) {
        if (bucket.length) {
          saveBucketStats();
        }
        onDataParsed({ sampled, errorMargins, min, max, average, variance });
        parser.pause();
      }
      count++;
    },
    complete: () => {
      stopSliding(true);
      if (bucket.length) {
        saveBucketStats();
        console.log(sampled);
        onDataParsed({ sampled, errorMargins, min, max, average, variance });
      }
    },
    skipEmptyLines: true,
  });
};

export default parseAndDownSample;
