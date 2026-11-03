// Distribución de residentes con docentes: lee datos/distribucion.json y datos/horarios.json.
(function () {
  const app = document.getElementById("distribucion-app");
  const mini = document.getElementById("esta-semana");
  if (!app && !mini) return;

  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  Promise.all([
    fetch("datos/distribucion.json").then((r) => r.json()),
    fetch("datos/horarios.json").then((r) => r.json()),
  ]).then(([dist, hor]) => {
    const vac = (doc, sem) => (dist.vacaciones || []).some((v) => v.docente === doc && (!v.semanas || v.semanas.includes(sem.etiqueta)));

    // Semana actual, o la próxima si aún no empieza el mes, o la última si ya terminó.
    let idx = dist.semanas.findIndex((s) => hoy >= parse(s.inicio) && hoy <= parse(s.fin));
    let estado = "Esta semana";
    if (idx < 0) {
      idx = dist.semanas.findIndex((s) => parse(s.inicio) > hoy);
      estado = "Próxima semana";
      if (idx < 0) { idx = dist.semanas.length - 1; estado = "Última semana del mes"; }
    }
    const sem = dist.semanas[idx];
    const reglas = dist.reglas || {};
    const reglasHTML = Object.keys(reglas).length ? `<ul class="small mb-2">${Object.entries(reglas).map(([dia, r]) => `<li><b>${esc(dia)}:</b> ${esc(r.texto)}</li>`).join("")}</ul>` : "";

    const tablaSemana = (s) => `
      <table class="table table-sm mb-0"><tbody>
      ${dist.docentes.map((d) => `<tr><th class="fw-semibold" style="width:40%">${esc(d)}</th><td>${
        vac(d, s) ? '<span class="badge text-bg-warning">Vacaciones</span>' : (s.asignacion[d] || []).map(esc).join(" + ") || '<span class="opacity-50">—</span>'
      }</td></tr>`).join("")}
      </tbody></table>`;

    if (mini) {
      mini.innerHTML = `<div class="small text-uppercase opacity-75 mb-1">${estado} · ${esc(sem.etiqueta)}</div>${tablaSemana(sem)}
        <div class="mt-2">${reglasHTML}</div><div><a href="rotacion.html#distribucion">Ver el mes completo y buscar tu nombre →</a></div>`;
    }
    if (!app) return;

    const nombres = dist.residentes.map((r) => r.nombre);
    app.innerHTML = `
      <p class="opacity-75 mb-1">${esc(dist.mes)}. ${esc(dist.nota || "")}</p>
      ${reglasHTML}
      <div class="next-session mb-4">
        <label class="form-label fw-semibold" for="buscar-residente"><i class="bi bi-search"></i> Busca tu nombre</label>
        <select id="buscar-residente" class="form-select">
          <option value="">Selecciona…</option>
          ${nombres.map((n) => `<option>${esc(n)}</option>`).join("")}
        </select>
        <div id="resultado-residente" class="mt-3"></div>
      </div>
      <h3 class="h5">Todo el mes</h3>
      <div class="table-responsive"><table class="table table-sm align-middle dist-mes">
        <thead><tr><th>Docente</th>${dist.semanas.map((s, i) => `<th class="${i === idx ? "semana-actual" : ""}">${esc(s.etiqueta)}${i === idx ? `<br><span class="badge text-bg-success">${estado}</span>` : ""}</th>`).join("")}</tr></thead>
        <tbody>${dist.docentes.map((d) => `<tr><th>${esc(d)}</th>${dist.semanas.map((s, i) => `<td class="${i === idx ? "semana-actual" : ""}">${
          vac(d, s) ? '<span class="badge text-bg-warning">Vacaciones</span>' : (s.asignacion[d] || []).map(esc).join("<br>") || "—"
        }</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div>
      <h3 class="h5 mt-4">Horario de consulta de los docentes</h3>
      <div class="table-responsive"><table class="table table-sm table-striped">
        <thead><tr><th>Docente</th>${hor.dias.map((d) => `<th>${d}</th>`).join("")}</tr></thead>
        <tbody>${Object.entries(hor.consulta).map(([d, h]) => `<tr><th>${esc(d)}</th>${h.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div>`;

    const sel = app.querySelector("#buscar-residente");
    const out = app.querySelector("#resultado-residente");
    sel.addEventListener("change", () => {
      const n = sel.value;
      if (!n) { out.innerHTML = ""; return; }
      const r = dist.residentes.find((x) => x.nombre === n);
      const filas = dist.semanas.map((s, i) => {
        const doc = Object.keys(s.asignacion).find((d) => s.asignacion[d].includes(n));
        const h = doc ? hor.dias.filter((dia) => !s.dias || s.dias.includes(dia)).map((dia) => {
          const j = hor.dias.indexOf(dia);
          const r = reglas[dia];
          const quien = r ? r.docente : doc;
          const horas = (r && r.horas) || (hor.consulta[quien] || [])[j] || "";
          return `<span class="text-nowrap"><b>${dia.slice(0, 3)}</b> ${r ? `con ${esc(quien.split(" ")[0])} ` : ""}${esc(horas)}</span>`;
        }).join(" · ") : "";
        return `<tr class="${i === idx ? "semana-actual" : ""}"><td class="text-nowrap">${esc(s.etiqueta)}${i === idx ? ` <span class="badge text-bg-success">${estado}</span>` : ""}</td><td class="fw-semibold">${doc ? esc(doc) : "—"}</td><td class="small">${h}</td></tr>`;
      }).join("");
      out.innerHTML = `<div class="small opacity-75 mb-2">${esc(r.programa)}</div>
        <div class="table-responsive"><table class="table table-sm mb-0"><thead><tr><th>Semana</th><th>Docente</th><th>Horario de consulta (con quién y cuándo)</th></tr></thead><tbody>${filas}</tbody></table></div>`;
    });
  }).catch(() => {
    const msg = '<span class="opacity-75">No se pudo cargar la distribución. Intenta recargar la página.</span>';
    if (app) app.innerHTML = msg; if (mini) mini.innerHTML = msg;
  });
})();
