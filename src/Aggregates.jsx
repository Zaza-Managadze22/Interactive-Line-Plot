const Aggregates = ({ stats }) => {
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
