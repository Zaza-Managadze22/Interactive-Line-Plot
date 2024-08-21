import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import "./App.css";

const Plot = ({ data, errorMargins }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Create chart only once
  useEffect(() => {
    Chart.register(...registerables);
    const ctx = canvasRef.current.getContext("2d");
    const datasets = [
      {
        label: "Data Series",
        data: [],
        borderColor: "purple",
        fill: false,
      },
    ];
    if (errorMargins) {
      datasets.push({
        label: "Error Margin (min)",
        data: [],
        borderColor: "#8000802e",
        fill: "0",
        backgroundColor: "#8000802e",
        pointRadius: 0,
        borderWidth: 0,
      });
      datasets.push({
        label: "Error Margin (max)",
        data: [],
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
    chartRef.current = chart;
    return () => {
      chart.destroy();
    };
  }, []);

  // Update chart data when necessary
  useEffect(() => {
    chartRef.current.data.datasets[0].data = data;
    chartRef.current.data.datasets[1].data = errorMargins.min;
    chartRef.current.data.datasets[2].data = errorMargins.max;
    chartRef.current.options.scales.x.min = data[0].x;
    chartRef.current.options.scales.x.max = data[data.length - 1].x;
    chartRef.current.update();
  }, [data, errorMargins]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Plot;
