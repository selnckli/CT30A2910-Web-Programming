const POP_URL = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/statfin_vaerak_pxt_11ra.px";
const EMP_URL = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/statfin_tyokay_pxt_115b.px";

async function loadQuery(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function fetchData(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${url} returned ${res.status}`);
  return res.json();
}

// table rows
function setupTable(popData, empData) {
    // check if data is valid
  const cat   = popData.dimension.Alue.category;
  // extract codes, labels, and data arrays
  // handle both single and multiple codes (e.g. id or index)
  const codes = Array.isArray(cat.id)
               ? cat.id
               : Array.isArray(cat.index)
               ? cat.index
               : Object.keys(cat.label);
  const labels      = codes.map(code => cat.label[code]);
  const populations = popData.value;
  const employments = empData.value;
  const tbody       = document.getElementById("table-rows");

  labels.forEach((muni, i) => {
    const pop = populations[i] || 0;
    const emp = employments[i] || 0;
    const pct = pop > 0 ? +(emp / pop * 100).toFixed(2) : 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${muni}</td>
      <td>${pop.toLocaleString()}</td>
      <td>${emp.toLocaleString()}</td>
      <td>${pct}%</td>
    `;

    if (pct > 45)      tr.style.backgroundColor = "#abffbd";
    else if (pct < 25) tr.style.backgroundColor = "#ff9e9e";

    tbody.appendChild(tr);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const [popQuery, empQuery] = await Promise.all([
      loadQuery("info/population_query.json"),
      loadQuery("info/employment_query.json")
    ]);

    const [popData, empData] = await Promise.all([
      fetchData(POP_URL, popQuery),
      fetchData(EMP_URL, empQuery)
    ]);

    setupTable(popData, empData);
  } catch (err) {
    console.error("Data loading failed:", err);
  }
});
