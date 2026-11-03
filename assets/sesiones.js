// Formatea fechas en español y marca sesiones próximas/pasadas del club de revistas.
// Botón "Agregar a mi calendario" (Google Calendar). Hora de Colombia (UTC-5).
function agregarCalendario(el, fecha) {
  const slot = el.querySelector(".cal-slot");
  if (!slot) return;
  const m = (slot.dataset.hora || "11:00").match(/(\d{1,2}):(\d{2})\s*([ap])?/i);
  let h = m ? +m[1] : 11; const min = m ? +m[2] : 0;
  if (m && m[3] && m[3].toLowerCase() === "p" && h < 12) h += 12;
  const [y, mo, d] = fecha.split("-").map(Number);
  const ini = new Date(Date.UTC(y, mo - 1, d, h + 5, min));
  const fin = new Date(ini.getTime() + 60 * 60 * 1000);
  const f = (x) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: "Club de revistas · Endocrinología HPTU" + (slot.dataset.title ? " · " + slot.dataset.title : ""),
    dates: f(ini) + "/" + f(fin),
    location: slot.dataset.aula || "",
    details: slot.dataset.articulo ? "Artículo: " + slot.dataset.articulo : "",
  });
  slot.innerHTML = `<a class="btn btn-sm btn-outline-primary cal-btn" href="https://calendar.google.com/calendar/render?${p}" target="_blank" rel="noopener"><i class="bi bi-calendar-plus"></i> Agregar a mi calendario</a>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const fmt = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

  const sesiones = [...document.querySelectorAll(".session[data-date]")];
  let proxima = null;
  sesiones.forEach((el) => {
    const f = parse(el.dataset.date);
    el.querySelector(".fecha").textContent = fmt.format(f);
    const badge = el.querySelector(".estado");
    if (f >= hoy) {
      el.classList.add("upcoming");
      agregarCalendario(el, el.dataset.date);
      badge.textContent = "Próxima"; badge.classList.add("text-bg-success");
      if (!proxima || f < parse(proxima.dataset.date)) proxima = el;
    } else {
      el.classList.add("past");
      badge.textContent = "Realizada"; badge.classList.add("text-bg-secondary");
    }
  });

  // Ordena: próximas primero (más cercana arriba), luego pasadas (más reciente arriba)
  const cont = document.querySelector(".sessions-list");
  if (cont) {
    sesiones.sort((a, b) => {
      const fa = parse(a.dataset.date), fb = parse(b.dataset.date);
      const pa = fa >= hoy, pb = fb >= hoy;
      if (pa !== pb) return pa ? -1 : 1;
      return pa ? fa - fb : fb - fa;
    }).forEach((el) => cont.appendChild(el));
  }

  // Tarjeta "próxima sesión" en el inicio
  const destino = document.getElementById("proxima-sesion");
  if (destino) {
    if (proxima) {
      const c = proxima.cloneNode(true); c.classList.remove("session", "upcoming");
      c.querySelector(".estado")?.remove();
      destino.innerHTML = ""; destino.appendChild(c);
    } else {
      destino.innerHTML = '<span class="opacity-75">La próxima sesión se anunciará pronto. Consulta el <a href="club.html">histórico</a>.</span>';
    }
  }
});
