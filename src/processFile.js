import Papa from "papaparse";

const processFile = (file, onComplete) => {
  let numRows = 0;
  const locations = [0];
  let bytes = 0;

  Papa.parse(file, {
    step: (result) => {
      numRows++;
      const row = result.data;
      bytes += row[0].length + row[1].length + 2; // All numeric characters + comma + newline
      if (numRows % 1000 === 0) {
        locations.push(bytes);
      }
    },
    complete: () => {
      onComplete(numRows, locations);
    },
    skipEmptyLines: true,
  });
};

export default processFile;
