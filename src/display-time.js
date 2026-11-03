/*--------------------
Display Time JS
--------------------*/

export function initDisplayTime() {
  const els = document.querySelectorAll('[data-time]');
  if (!els.length) return;

  const pad = (n) => String(n).padStart(2, '0');

  function render() {
    const now = new Date();
    const time = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' +
      pad(now.getSeconds()); // e.g. "14:37:01"
    els.forEach((el) => { el.textContent = time; });
  }

  function tick() {
    render();
    // Wait until the next second starts so the clock never lags
    setTimeout(tick, 1000 - new Date().getMilliseconds());
  }

  tick();
}
