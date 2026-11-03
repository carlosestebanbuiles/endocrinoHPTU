// Formatea fechas en español y marca sesiones próximas/pasadas del club de revistas.
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
