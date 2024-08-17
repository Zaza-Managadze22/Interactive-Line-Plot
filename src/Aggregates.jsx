import { useMemo } from "react";

const Aggregates = ({ data }) => {
  const stats = useMemo(() => {
    const values = data.map((point) => point.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const average =
      values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
      (values.length - 1);
    return { min, max, average, variance };
  }, [data]);

  return (
    <div>
      {Object.entries(stats).map(([key, value]) => (
        <span key={key}>
          {key}: {value.toFixed(4)} &emsp;
        </span>
      ))}
    </div>
  );
};

export default Aggregates;
