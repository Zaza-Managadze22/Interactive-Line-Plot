// Downsampling using average pooling.
// Default value of downsampling threshold is set to 300.
const downsample = (data, threshold = 300) => {
  if (data.length <= threshold) return [data];

  const sampled = [];
  const errorMargins = { min: [], max: [] };
  const bucketSize = Math.floor(data.length / threshold);

  for (let i = 0; i < threshold; i++) {
    const start = i * bucketSize;
    const end = start + bucketSize;
    const bucket = data.slice(start, end);

    const avgX =
      bucket.reduce((sum, point) => sum + point.x, 0) / bucket.length;
    const avgY =
      bucket.reduce((sum, point) => sum + point.y, 0) / bucket.length;

    const yMin = Math.min(...bucket.map((point) => point.y));
    const yMax = Math.max(...bucket.map((point) => point.y));

    sampled.push({ x: avgX, y: avgY });
    errorMargins.min.push({ x: avgX, y: yMin });
    errorMargins.max.push({ x: avgX, y: yMax });
  }

  return [sampled, errorMargins];
};

export default downsample;
