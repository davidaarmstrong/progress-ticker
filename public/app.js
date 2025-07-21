async function fetchData(mode, n) {
  try {
    const response = await fetch(`/state?mode=${mode}&n=${n}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching state:', error);
    return [];
  }
}

function renderTicker(data) {
  const tickerContent = document.getElementById("ticker-content");

  // Generate ticker items HTML
  const itemsHtml = data.map(item => {
    const delta = item.current_value - item.previous_value;
    const deltaStr = delta > 0 ? `(+${delta.toFixed(3)})` : delta < 0 ? `(${delta.toFixed(3)})` : `(0)`;
    const changeClass = delta > 0 ? 'up' : delta < 0 ? 'down' : '';
    return `<span class="item ${changeClass}">${item.county}: ${item.current_value.toFixed(3)} ${deltaStr}</span>`;
  }).join('');

  // Duplicate content for seamless scroll
  tickerContent.innerHTML = itemsHtml + itemsHtml;

  // Calculate animation duration
  const contentWidth = tickerContent.scrollWidth / 2;  // use half since duplicated
  const tickerWidth = document.getElementById("ticker").clientWidth;
  const distance = contentWidth;
  const speed = 100;  // pixels/sec
  let duration = distance / speed;

  if (window.innerWidth <= 600) {
    duration *= 1.5;
  }

  console.log("Ticker animation duration:", duration);

  tickerContent.style.animation = `ticker-scroll ${duration}s linear infinite`;
}

async function updateTicker() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const n = 25;  // fixed value
  const data = await fetchData(mode, n);
  renderTicker(data);
}
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener("change", updateTicker);
  });

  updateTicker();
});