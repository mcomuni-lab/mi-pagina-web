const form = document.getElementById("formValidar");
const panel = document.getElementById("panelResultado");
const tpl = document.getElementById("tplResultado");

const COLOR = {
  CAMPANA_VALIDA: "ok",
  CAMPANA_NO_VALIDA: "bad",
  PRODUCTO_NO_ENCONTRADO: "bad",
  OBSERVAR: "warn",
  PLAN_SUPERIOR_A_COBERTURA: "warn",
  DISTRITO_NO_CUBIERTO: "warn",
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  const res = await fetch("/validar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) { alert(json.error || "Error"); return; }
  render(json);
});

function render(r) {
  panel.classList.remove("empty");
  panel.innerHTML = "";
  panel.appendChild(tpl.content.cloneNode(true));

  const titleEl = panel.querySelector("#res_resultado_producto");
  titleEl.textContent = r.res_resultado_producto;
  titleEl.classList.add(COLOR[r.res_resultado_producto] || "");

  panel.querySelector("#res_observacion_producto").textContent = r.res_observacion_producto;
  panel.querySelector("#res_precio_oficial").textContent = (r.res_precio_oficial ?? 0).toFixed(2);
  panel.querySelector("#res_precio_registrado").textContent = (r.res_precio_registrado ?? 0).toFixed(2);
  panel.querySelector("#res_canal_permitido").textContent = r.res_canal_permitido ?? "—";
  panel.querySelector("#res_velocidad_plan_mbps").textContent = r.res_velocidad_plan_mbps ?? "—";
  panel.querySelector("#res_score_comercial").textContent = r.res_score_comercial;
  panel.querySelector("#res_decision_rpa").textContent = r.res_decision_rpa;
  panel.querySelector("#det_fecha").textContent = r.fecha_consulta;
  panel.querySelector("#det_regla").textContent = r.regla_aplicada;
  panel.querySelector("#det_vel").textContent = (r.res_velocidad_plan_mbps ?? "—") + " Mbps";

  const dl = panel.querySelector("#detalleProducto");
  const p = r.detalle_producto || {};
  const rows = [
    ["ID Producto", p.id_producto], ["Campaña", p.campana], ["Plan", p.plan],
    ["Vigente desde", p.vigente_desde], ["Vigente hasta", p.vigente_hasta],
    ["Requiere débito automático", p.requiere_debito_automatico ? "Sí" : "NO"],
    ["Aplica a distrito", (p.distritos || []).join(", ")],
    ["Restricción", p.restriccion || "—"],
  ];
  for (const [k, v] of rows) {
    const dt = document.createElement("dt"); dt.textContent = k;
    const dd = document.createElement("dd"); dd.textContent = v ?? "—";
    dl.appendChild(dt); dl.appendChild(dd);
  }
}
