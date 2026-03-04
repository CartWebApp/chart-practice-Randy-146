// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const titleSelect = document.getElementById("titleSelect");
const metricSelect = document.getElementById("metricSelect");
const genreselect = document.getElementById("genreSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const year = [...new Set(chartData.map(r => r.year))];
const title = [...new Set(chartData.map(r => r.title))];
const genre = [...new Set(chartData.map(r => r.genre))];
const metric = [...new Set(chartData.map(r => r.metric))];

year.forEach(y => yearSelect.add(new Option(y, y)));
title.forEach(h => titleSelect.add(new Option(h, h)));
genre.forEach(g => genreSelect.add(new Option( g, g)));
metric.forEach(m => metricSelect.add(new Option(m, m)));

yearSelect.value = year[0];
titleSelect.value = title[0];
genreSelect.value =genre[0];
metricSelect.value = metric[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = yearSelect.value;
  const title = titleSelect.value;
  const metric = metricSelect.value;
  const genre = genreSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, {year, title, metric, genre});

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, title, metric, genre }) {
  if (type === "bar") return barBytitle(genre, metric);
  if (type === "line") return lineOverTime(year, metric);
  if (type === "scatter") return scatterreviewScoreVsRevenue(title);
  if (type === "doughnut") return doughnutRevenueByRegion(year, title);
  if (type === "radar") return radarComparePublishers(year);
  return barBytitle(year, metric);
}

// Task A: BAR — compare titles for a given year
function barBytitle(genre, metric) {
  const rows = chartData.filter(r => r.genre === genre);
  const labels = rows.map(r => r.title);
  const values = rows.map(r => r[metric]);
  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${genreSelect.value}`,
        data: values,
        backgroundColor: "rgba(54, 162, 235, 0.7)"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Title comparison (${genreSelect.value})` }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: metric } },
        x: { title: { display: true, text: "Genre" } }
      },
    }
  };
}


// Task B: LINE — trend over time for one title (2 datasets)
function lineOverTime(year, metric) {
  const rows = chartData.filter(r => r.title === titleSelect.value).sort((a, b) => a.year - b.year);

  const labels = rows.map(r => r.year);
const values = rows.map(r => r[metric]);


  return {
    type: "line",
    data: { labels, datasets: [{
      label: `${metric} over time for ${titleSelect.value}`,
      data: values,
    }] },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${titleSelect.value}` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "Year" } }
      }
    }
  };
  };

// SCATTER — Review Score vs. Sales
function scatterreviewScoreVsRevenue(title) {
  
  const rows = chartData.filter(r => r.title === titleSelect.value);
const points = rows.map(r => ({ x: r.reviewScore, y: r.revenueUSD }));

if(rows.length === 0) {
  alert("No data found.");
  return;
}

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `reviewScore vs revenue (${titleSelect.value})`,
        data: points
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Review Score vs Revenue for (${titleSelect.value})` }
      },
      scales: {
        x: { title: { display: true, text: "Review Scores" } },
        y: { title: { display: true, text: "Revenue (USD)" } }
      }
    }
  };
}

// DOUGHNUT — Region vs revenueUSD share for one title + year
function doughnutRevenueByRegion(year, title) {
  const rows = chartData.filter(r => r.year === Number(year) && r.title === title);

if (rows.length === 0) {
   alert("No data found.");
   return;
}

const labels = rows.map(r => r.region);
const values = rows.map(r => r.revenueUSD);

  return {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ label: "Revenue per Region", data: values }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Revenue per Region: ${title} (${year})` }
      }
    }
  };
}

// RADAR — compare publishers across multiple metrics for one year
function radarComparePublishers(year) {

  const rows = chartData.filter(r =>
    r.year === Number(year)
  );

  if (rows.length === 0) {
    alert("No data found.");
    return;
  }

  // Get unique publishers
  const publishers = [...new Set(rows.map(r => r.publisher))];

  const labels = [
    "Total Revenue",
    "Total Units (M)",
    "Avg Review Score",
    "Avg Price"
  ];

  const datasets = publishers.map(pub => {

    const pubRows = rows.filter(r => r.publisher === pub);

    const totalRevenue =
      pubRows.reduce((sum, r) => sum + r.revenueUSD, 0);

    const totalUnits =
      pubRows.reduce((sum, r) => sum + r.unitsM, 0);

    const avgReview =
      pubRows.reduce((sum, r) => sum + r.reviewScore, 0) / pubRows.length;

    const avgPrice =
      pubRows.reduce((sum, r) => sum + r.priceUSD, 0) / pubRows.length;

    return {
      label: pub,
      data: [
        totalRevenue,
        totalUnits,
        avgReview,
        avgPrice
      ]
    };
  });

  return {
    type: "radar",
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Publisher Comparison (${year})`
        }
      }
    }
  };
}