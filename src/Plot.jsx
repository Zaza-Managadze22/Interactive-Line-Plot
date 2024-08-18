import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import "./App.css";

const Plot = ({ data, errorMargins }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    Chart.register(...registerables);
    const ctx = canvasRef.current.getContext("2d");
    const datasets = [
      {
        label: "Data Series",
        data,
        borderColor: "purple",
        fill: false,
      },
    ];
    if (errorMargins) {
      datasets.push({
        label: "Error Margin (min)",
        data: errorMargins.min,
        borderColor: "#8000802e",
        fill: "0",
        backgroundColor: "#8000802e",
        pointRadius: 0,
        borderWidth: 0,
      });
      datasets.push({
        label: "Error Margin (max)",
        data: errorMargins.max,
        borderColor: "#8000802e",
        fill: "0",
        backgroundColor: "#8000802e",
        pointRadius: 0,
        borderWidth: 0,
      });
    }
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        datasets,
      },
      options: {
        legend: {
          display: false,
        },
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            min: data[0].x,
            max: data[data.length - 1].x,
          },
          y: { beginAtZero: true },
        },
        animation: {
          duration: 0,
        },
      },
    });
    return () => {
      chart.destroy();
    };
  }, [data]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Plot;
