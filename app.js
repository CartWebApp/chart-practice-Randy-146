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
  const unitsM = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, {year, title});

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, title, priceUSD }) {
  if (type === "bar") return barBytitle(year, priceUSD);
  if (type === "line") return lineOverTime(year, ["priceUSD", "revenueUSD"]);
  if (type === "scatter") return scatterpriceUSDVsTemp(title);
  if (type === "doughnut") return doughnutrevenueUSDandpriceUSD(year, title);
  if (type === "radar") return radarComparetitles(title);
  return barBytitle(title, priceUSD);
}

// Task A: BAR — compare titles for a given year
function barBytitle(year, priceUSD) {
  const rows = chartData.filter(r => r.year === year);

  const labels = rows.map(r => r.title);
  const values = rows.map(r => r[priceUSD]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${priceUSD} in ${year}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `title comparison (${year})` }
      },
      scales: {
        y: { priceUSD: { display: true, text: priceUSD } },
        x: { title: { display: true, text: "title" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one title (2 datasets)
function lineOverTime(title, priceUSDs) {
  const rows = chartData.filter(r => r.title === title);

  const labels = rows.map(r => r.year);

  const datasets = unitsM.map(m => ({
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
        y: { title: { display: true, text: "year" } },
        x: { title: { display: true, text: "price" } }
      }
    }
  };
}

// SCATTER — relationship between temperature and priceUSD
function scatterpriceUSDVsTemp(title) {
  const rows = chartData.filter(r => r.title === title);

  const points = rows.map(r => ({ x: r.reviewScore, y: r.priceUSD }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `priceUSD vs Temp (${title})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does reviewScore affect priceUSD? (${title})` }
      },
      scales: {
        x: { title: { display: true, text: "review scores" } },
        y: { title: { display: true, text: "priceUSD" } }
      }
    }
  };
}

// DOUGHNUT — priceUSD vs revenueUSD share for one title + year
function doughnutrevenueUSDandpriceUSD(year, title) {
  const row = chartData.find(r => r.year === year && r.title === title);

  const priceUSD = Math.round(row.priceUSD * 100);
  const revenueUSD = 100 - priceUSD;

  return {
    type: "doughnut",
    data: {
      labels: ["priceUSD (%)", "revenueUSD (%)"],
      datasets: [{ label: "Rider mix", data: [priceUSD, revenueUSD] }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Rider mix: ${title} (${year})` }
      }
    }
  };
}

// RADAR — compare titles across multiple priceUSDs for one year
function radarComparetitles(year) {
  const rows = chartData.filter(r => r.year === year);

  const priceUSDs = ["priceUSD", "revenueUSD", "region", "priceUSD"];
  const labels = priceUSDs;

  const datasets = rows.map(r => ({
    label: r.title,
    data: priceUSDs.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-priceUSD comparison (${year})` }
      }
    }
  };
}