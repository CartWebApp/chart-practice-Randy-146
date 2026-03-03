// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const titleSelect = document.getElementById("titleSelect");
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const year = [...new Set(chartData.map(r => r.year))];
const title = [...new Set(chartData.map(r => r.title))];

year.forEach(m => yearSelect.add(new Option(m, m)));
title.forEach(h => titleSelect.add(new Option(h, h)));

yearSelect.value = year[0];
titleSelect.value = title[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = yearSelect.value;
  const title = titleSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, {year, title, metric});

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, title, metric }) {
  if (type === "bar") return barBytitle(year, metric);
  if (type === "line") return lineOverTime(title, [metric]);
  if (type === "scatter") return scattermetricVsTemp(title);
  if (type === "doughnut") return doughnutrevenueUSDandmetric(year, title, metric);
  if (type === "radar") return radarComparetitles(year);
  return barBytitle(year, metric);
}

// Task A: BAR — compare titles for a given year
function barBytitle(year, metric) {
  const rows = chartData.filter(r => r.year === Number(year));
  const labels = rows.map(r => r.title);
  const values = rows.map(r => r[metric]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${year}`,
        data: values,
        backgroundColor: "rgba(54, 162, 235, 0.7)"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Title comparison (${year})` }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: metric } },
        x: { title: { display: true, text: "Title" } }
      },
    }
  };
}


// Task B: LINE — trend over time for one title (2 datasets)
function lineOverTime(title, metrics) {
  const rows = chartData.filter(r => r.title === title);

  const labels = rows.map(r => r.year);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${title}` }
      },
      scales: {
        y: { title: { display: true, text: "Review Score" } },
        x: { title: { display: true, text: "Revenue" } }
      }
    }
  };
}

// SCATTER — relationship between temperature and metric
function scattermetricVsTemp(title) {
  const rows = chartData.filter(r => r.title === title);

  const points = rows.map(r => ({ x: r.reviewScore, y: r.metric }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `metric vs Temp (${title})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does reviewScore affect metric? (${title})` }
      },
      scales: {
        x: { title: { display: true, text: "review scores" } },
        y: { title: { display: true, text: "metric" } }
      }
    }
  };
}

// DOUGHNUT — metric vs revenueUSD share for one title + year
function doughnutrevenueUSDandmetric(year, title) {
  const row = chartData.find(r => r.year === Number(year) && r.title === title);

if (!row) {
   alert("No data found.");
   return;
}

  return {
    type: "doughnut",
    data: {
      labels: ["metric", "Revenue (USD)"],
      datasets: [{ label: "metric vs Revenue", data: [[row.metric], row.revenueUSD] }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `metric vs Revenue: ${title} (${year})` }
      }
    }
  };
}

// RADAR — compare titles across multiple metrics for one year
function radarComparetitles(year) {
  const rows = chartData.filter(r => r.year === Number(year));

  const metrics = ["metric", "revenueUSD", "region", "metric"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.title,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${year})` }
      }
    }
  };
}