export class Baskets {
  constructor(basketSize) {
    this.basketSize = basketSize;
    this.baskets = [];
    this.minBasket = Infinity;
    this.maxBasket = -Infinity;
  }

  getBasketById = (id) => {
    return this.baskets[id];
  };

  deleteBasket = (id) => {
    delete this.baskets[id];
  };

  addBasket = (index, basket) => {
    this.baskets[index] = basket;
  };

  calculateBasketStats = (lines) => {
    let sumY = 0;
    let sumX = 0;
    let sumSq = 0;
    let yMin = Infinity;
    let yMax = -Infinity;
    for (const point of lines) {
      sumY += point.y;
      sumX += point.x;
      sumSq += point.y * point.y;
      yMin = Math.min(yMin, point.y);
      yMax = Math.max(yMax, point.y);
    }
    const avgX = sumX / lines.length;
    const avgY = sumY / lines.length;

    return { avgX, avgY, yMin, yMax, sumY, sumSq, count: lines.length };
  };

  getBasketRanges = (startLine, endLine) => {
    const results = [];
    const startBasket = Math.floor(startLine / this.basketSize);
    const endBasket = Math.floor((endLine - 1) / this.basketSize);

    for (
      let basketIndex = startBasket;
      basketIndex <= endBasket;
      basketIndex++
    ) {
      const basketStartLine = basketIndex * this.basketSize;
      const basketEndLine = basketStartLine + this.basketSize;
      const isFull = startLine <= basketStartLine && endLine >= basketEndLine;

      results.push({
        basketId: basketIndex,
        isFull,
        startLineIndex: Math.max(startLine, basketStartLine),
        endLineIndex: Math.min(endLine, basketEndLine),
      });
    }

    return results;
  };
}

const calculateTotalStats = (basketsStats) => {
  let sumY = 0;
  let sumSq = 0;
  let yMin = Infinity;
  let yMax = -Infinity;
  let count = 0;
  for (const basket of basketsStats) {
    if (basket.count === 0) continue;
    sumY += basket.sumY;
    sumSq += basket.sumSq;
    yMin = Math.min(yMin, basket.yMin);
    yMax = Math.max(yMax, basket.yMax);
    count += basket.count;
  }
  const average = sumY / count;
  const variance = sumSq / count - average * average;
  return { min: yMin, max: yMax, average, variance };
};

const parseAndDownSample = async (
  processor,
  baskets,
  startIndex,
  linesCount,
  onDataParsed,
  stopSliding
) => {
  // console.log("started", startIndex, linesCount);
  const basketsStats = [];
  const basketRanges = baskets.getBasketRanges(
    startIndex,
    startIndex + linesCount
  );
  const linesContent = await getNewLines(processor, baskets, basketRanges);
  // console.log(linesContent);

  for (const range of basketRanges) {
    if (range.isFull && baskets.getBasketById(range.basketId)) {
      basketsStats.push(baskets.getBasketById(range.basketId));
      continue;
    }
    const lines = getInterval(
      linesContent,
      range.startLineIndex,
      range.endLineIndex
    );
    const stats = baskets.calculateBasketStats(lines);
    basketsStats.push(stats);
    if (range.isFull) {
      baskets.addBasket(range.basketId, stats);
    }
  }

  // TODO: get min id of baskets and then delete unused baskets to avoid memory leak

  stopSliding(true);

  const windowStats = calculateTotalStats(basketsStats);

  // console.log(basketsStats.map((e) => ({ x: e.avgX, y: e.avgY })));

  onDataParsed({
    basketIds: basketRanges.map((e) => ({
      id: e.basketId,
      shouldReplace: !e.isFull,
    })),
    sampled: basketsStats.map((e) => ({ x: e.avgX, y: e.avgY })),
    errorMargins: {
      min: basketsStats.map((e) => ({ x: e.avgX, y: e.yMin })),
      max: basketsStats.map((e) => ({ x: e.avgX, y: e.yMax })),
    },
    min: windowStats.min,
    max: windowStats.max,
    average: windowStats.average,
    variance: windowStats.variance,
  });

  stopSliding(false);

  // console.log("finished", startIndex, linesCount);
};

const getNewLines = async (processor, baskets, basketRanges) => {
  if (basketRanges.length === 0) return [];
  const firstBucket = basketRanges[0];
  const firstLinesIndices =
    firstBucket.isFull && baskets.getBasketById(firstBucket.basketId)
      ? null
      : [firstBucket.startLineIndex, firstBucket.endLineIndex];
  const linesToFetch = basketRanges.slice(1).reduce((acc, range) => {
    if (range.isFull && baskets.getBasketById(range.basketId)) {
      return acc;
    }
    if (acc.length > 0 && acc[acc.length - 1][1] === range.startLineIndex) {
      acc[acc.length - 1][1] = range.endLineIndex;
      return acc;
    } else {
      acc.push([range.startLineIndex, range.endLineIndex]);
      return acc;
    }
  }, []);
  const readLines = [];

  if (firstLinesIndices) {
    await processor.left
      .readLines(firstLinesIndices[0], firstLinesIndices[1])
      .then((lines) => pushFromIndex(readLines, firstLinesIndices[0], lines));
  }

  for (const [start, end] of linesToFetch) {
    await processor.right
      .readLines(start, end)
      .then((lines) => pushFromIndex(readLines, start, lines));
  }

  return readLines;
};

const pushFromIndex = (arr, index, data) => {
  for (let i = 0; i < data.length; i++) {
    arr[index + i] = data[i];
  }
};

const getInterval = (arr, startIndex, endIndex) => {
  const result = [];
  for (let i = startIndex; i < endIndex; i++) {
    if (!arr[i]) break;
    result.push(arr[i]);
  }
  return result;
};

export default parseAndDownSample;
