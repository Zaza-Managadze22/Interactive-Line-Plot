import Papa from "papaparse";

const processFile = (file, onProgress, onComplete) => {
  let numRows = 0;
  const locations = [0];
  let bytes = 0;
  let progress = 0;

  Papa.parse(file, {
    step: (result) => {
      numRows++;
      const row = result.data;
      bytes += row[0].length + row[1].length + 2; // All numeric characters + comma + newline
      progress = (bytes * 100) / file.size; // Percentage of progress
      if (numRows % 1000 === 0) {
        locations.push(bytes);
      }
      onProgress(progress);
    },
    complete: () => {
      onComplete(locations);
    },
    skipEmptyLines: true,
  });
};

export default processFile;
