const FIXED_N = 10;

function renderTicker(data) {
  const html = data.map(item => {
    const delta = item.current_value - item.previous_value;
    const deltaStr = delta > 0 ? `(+${delta.toFixed(3)})` : delta < 0 ? `(${delta.toFixed(3)})` : `(0)`;
    const changeClass = delta > 0 ? 'up' : delta < 0 ? 'down' : '';
    return `<span class="item">${item.county}: <span class="number ${changeClass}">${item.current_value.toFixed(3)} ${deltaStr}</span></span>`;
  }).join('');

  const tickerContent = document.getElementById('ticker-content');
  tickerContent.innerHTML = html;

  // Dynamically calculate duration:
  requestAnimationFrame(() => {
    const contentWidth = tickerContent.scrollWidth;
    const tickerWidth = document.getElementById("ticker").clientWidth;
    const distance = contentWidth + tickerWidth;
    const speed = 100; // pixels/sec baseline

    let duration = distance / speed;

    // Optional: adjust speed for small screens:
    if (window.innerWidth <= 600) {
      duration *= 1.5;  // 50% slower on small screens
    }

    tickerContent.style.animation = `ticker-scroll ${duration}s linear infinite`;
  });
}

function fetchAndRender() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  fetch(`/state?mode=${mode}&n=${FIXED_N}`)
    .then(response => response.json())
    .then(data => renderTicker(data))
    .catch(err => console.error("Error fetching state:", err));
}

document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.addEventListener("change", fetchAndRender);
});

// Initial fetch:
fetchAndRender();

// Refresh periodically:
setInterval(fetchAndRender, 5000);