import Papa from "papaparse";

class ProcessFile {
  constructor(file, onEndCb, intervalSize = 1000) {
    this.file = file;
    this.intervalSize = intervalSize;
    this.locations = [0];
    this.lastParsed = null;
    this.onEndCb = onEndCb;
  }

  #parseRow = (row) => {
    const [x, y] = row;
    return {
      x: parseFloat(x),
      y: parseFloat(y),
    };
  };

  #getOptimalStartPosition = (lineStart) => {
    const locationIndex = Math.floor(lineStart / this.intervalSize);
    const lastKnownIndex = Math.min(locationIndex, this.locations.length - 1);

    return {
      startOffset: this.locations[lastKnownIndex],
      startLineIndex: lastKnownIndex * this.intervalSize,
    };
  };

  #calculateBytes = (row) => {
    if (row.length > 1) {
      return row[0].length + row[1].length + 2; // All numeric characters + comma + newline
    }
    return row[0].length + 1; // All numeric characters + newline
  };

  #readLines = async (lineStart, linesCount) =>
    new Promise((resolve) => {
      // debugger;
      if (this.lastParsed && this.lastParsed.startIndex <= lineStart) {
        const existingLines = this.lastParsed.parsedLines.slice(
          lineStart - this.lastParsed.startIndex
        );
        if (existingLines.length >= linesCount) {
          resolve(existingLines.slice(0, linesCount));
          return;
        }
        this.lastParserArgs = {
          lineStart: lineStart + existingLines.length,
          linesCount: linesCount - existingLines.length,
          numRows: 0,
          bytes: this.lastParsed.bytes,
          currentLineIndex: this.lastParserArgs.currentLineIndex,
          rows: [],
          cb: (newLines) => {
            const allLines = existingLines.concat(newLines);
            this.lastParsed.startIndex =
              this.lastParserArgs.currentLineIndex - allLines.length + 1;
            this.lastParsed.parsedLines = allLines;
            resolve(allLines);
            this.lastParsed.startIndex;
          },
        };
        this.lastParsed.parser.resume();
        return;
      } else {
        // console.log(this.lastParsed, lineStart);
      }

      const { startOffset, startLineIndex } =
        this.#getOptimalStartPosition(lineStart);
      this.lastParserArgs = {
        lineStart,
        linesCount,
        numRows: 0,
        bytes: startOffset,
        currentLineIndex: startLineIndex - 1,
        rows: [],
        cb: resolve,
      };
      this.#startParsing();
    });

  #startParsing = () => {
    if (!this.lastParserArgs) {
      throw new Error("No parser args");
    }
    console.log("parsing again");
    Papa.parse(this.file.slice(this.lastParserArgs.bytes), {
      step: (result, parser) => {
        this.lastParserArgs.currentLineIndex++;
        if (this.lastParserArgs.currentLineIndex % this.intervalSize === 0) {
          this.locations[
            this.lastParserArgs.currentLineIndex / this.intervalSize
          ] = this.lastParserArgs.bytes;
        }
        //
        const row = result.data;
        this.lastParserArgs.bytes += this.#calculateBytes(row);

        if (
          this.lastParserArgs.currentLineIndex >= this.lastParserArgs.lineStart
        ) {
          this.lastParserArgs.numRows++;
          const parsedRow = this.#parseRow(row);
          this.lastParserArgs.rows.push(parsedRow);

          const parsedLines = this.lastParsed?.parsedLines ?? [];
          parsedLines.push(parsedRow);
          if (parsedLines.length > this.intervalSize) parsedLines.splice(0);
          this.lastParsed = {
            endIdx: this.lastParserArgs.currentLineIndex + 1,
            startIndex:
              this.lastParserArgs.currentLineIndex - parsedLines.length + 1,
            parsedLines,
            bytes: this.lastParserArgs.bytes,
            parser,
          };

          if (this.lastParserArgs.numRows >= this.lastParserArgs.linesCount) {
            this.lastParserArgs.cb?.(this.lastParserArgs.rows);
            parser.pause();
          }
        }
      },
      complete: () => {
        this.lastParserArgs.cb?.(this.lastParserArgs.rows);
        this.onEndCb?.();
      },
      skipEmptyLines: true,
    });
  };

  readLines = async (start, end) => {
    console.log("start", start, "end", end);
    if (start >= end) return [];
    return this.#readLines(start, end - start);
  };
}

export default ProcessFile;
