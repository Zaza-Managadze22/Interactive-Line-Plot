import Papa from "papaparse";

/**
 * Parses and downsamples a file, calculating running statistics.
 * @param {File} file - The file to parse.
 * @param {number} startIndex - The starting index for parsing.
 * @param {number} windowSize - The size of the window for downsampling.
 * @param {function} onDataParsed - Callback function to handle parsed data.
 * @param {Array} dataLocations - Array of data locations for chunking.
 * @param {number} [threshold=300] - The threshold for downsampling.
 */

const parseAndDownSample = (
  file,
  startIndex,
  windowSize,
  onDataParsed,
  dataLocations,
  threshold = 300
) => {
  const sampled = [];
  const errorMargins = { min: [], max: [] };
  const bucketSize = Math.max(1, Math.floor(windowSize / threshold));
  const locationIndex = Math.floor(startIndex / 1000);
  const offset = dataLocations[locationIndex];
  let index = locationIndex * 1000;
  let bucket = [];
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let sumSq = 0;
  let average = 0;
  let variance = 0;

  /**
   * Saves the statistics of the current bucket.
   */
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

  Papa.parse(file.slice(offset), {
    step: (result, parser) => {
      if (index >= startIndex) {
        const n = index - startIndex + 1;
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
        average = sum / n;
        variance = sumSq / n - average * average;
        if (bucket.length === bucketSize) {
          saveBucketStats();
        }
        if (n === windowSize) {
          if (bucket.length) {
            saveBucketStats();
          }
          onDataParsed({ sampled, errorMargins, min, max, average, variance });
          parser.pause();
        }
      }
      index++;
    },
    complete: () => {
      if (bucket.length) {
        saveBucketStats();
        onDataParsed({ sampled, errorMargins, min, max, average, variance });
      }
    },
    skipEmptyLines: true,
  });
};

export default parseAndDownSample;
