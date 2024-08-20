import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import "./App.css";

const getDatasets = (data, errorMargins) => {
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
  return datasets;
};

const Plot = ({ data, errorMargins, basketIds, N }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const prevInfo = useRef({ data, errorMargins, basketIds, N });

  useEffect(() => {
    Chart.register(...registerables);
    const ctx = canvasRef.current.getContext("2d");
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: getDatasets(data, errorMargins),
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
    return () => chart.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.options.scales.x.min = data[0].x;
    chart.options.scales.x.max = data[data.length - 1].x;
    if (prevInfo.current && prevInfo.current.N === N) {
      const { basketIds: prevBasketIds } = prevInfo.current;
      let i = 0;
      let j = 0;
      while (i < prevBasketIds.length || j < basketIds.length) {
        const oldBasket = prevBasketIds[i];
        const newBasket = basketIds[j];
        if (oldBasket && newBasket && oldBasket.id === newBasket.id) {
          if (newBasket.shouldReplace) {
            chart.data.datasets[0].data[j] = data[j];
            if (errorMargins) {
              chart.data.datasets[1].data[j] = errorMargins.min[j];
              chart.data.datasets[2].data[j] = errorMargins.max[j];
            }
          }
          i++;
          j++;
        } else if (!newBasket || (oldBasket && oldBasket.id < newBasket.id)) {
          // remove old point
          chart.data.datasets[0].data.splice(j, 1);
          chart.data.datasets[1].data.splice(j, 1);
          chart.data.datasets[2].data.splice(j, 1);
          i++;
        } else if (newBasket) {
          // add new point
          chart.data.datasets[0].data.splice(j, 0, data[j]);
          chart.data.datasets[1].data.splice(j, 0, errorMargins.min[j]);
          chart.data.datasets[2].data.splice(j, 0, errorMargins.max[j]);
          j++;
        }
      }
    } else {
      chart.data.datasets = getDatasets(data, errorMargins);
    }
    prevInfo.current = { data, errorMargins, basketIds };
    chart.update();
  }, [data, errorMargins, basketIds, N]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Plot;
