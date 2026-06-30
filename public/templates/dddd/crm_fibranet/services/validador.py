"""Reglas de validación comercial alineadas con el bot RPA."""
from __future__ import annotations

from datetime import datetime, date
from typing import Any

from .tarifario import TarifarioService


def _parse_date(value: str | date | None) -> date | None:
    if value is None or value == "":
        return None
    if isinstance(value, date):
        return value
    return datetime.strptime(value, "%Y-%m-%d").date()


class ValidadorComercial:
    """Aplica las reglas del tarifario vigente sobre los datos capturados del CRM."""

    REQUIRED = ("campana", "plan", "precio_registrado", "canal_venta",
                "distrito", "medio_pago", "fecha_venta", "velocidad_max_cobertura_mbps")

    def __init__(self, tarifario: TarifarioService):
        self.tarifario = tarifario

    def validar(self, payload: dict[str, Any]) -> dict[str, Any]:
        for k in self.REQUIRED:
            if payload.get(k) in (None, ""):
                raise ValueError(f"Falta el campo requerido: {k}")

        campana = payload["campana"]
        plan = payload["plan"]
        precio_reg = float(payload["precio_registrado"])
        canal = payload["canal_venta"]
        distrito = payload["distrito"]
        fecha_venta = _parse_date(payload["fecha_venta"])
        vel_cobertura = int(payload["velocidad_max_cobertura_mbps"])

        producto = self.tarifario.buscar_producto(campana, plan)

        if producto is None:
            return self._resultado(
                resultado="PRODUCTO_NO_ENCONTRADO",
                decision="RECHAZAR",
                score=0,
                observacion="No existe producto para la combinación de campaña y plan indicada.",
                producto=None, precio_reg=precio_reg, canal=canal,
                vel_cobertura=vel_cobertura,
            )

        vigente_desde = _parse_date(producto["vigente_desde"])
        vigente_hasta = _parse_date(producto["vigente_hasta"])
        vigente = vigente_desde <= fecha_venta <= vigente_hasta

        canal_ok = canal in producto["canales_permitidos"]
        distrito_ok = "Todos" in producto["distritos"] or distrito in producto["distritos"]
        precio_ok = abs(precio_reg - producto["precio_oficial"]) < 0.01
        cobertura_ok = vel_cobertura >= producto["velocidad_max_cobertura_mbps"]

        # Reglas (mismo orden que el bot RPA)
        if not vigente:
            return self._resultado(
                "CAMPANA_NO_VALIDA", "RECHAZAR", 0,
                f"El producto comercial se encuentra inactivo. La campaña no está vigente "
                f"para la fecha de venta. Precio registrado S/ {precio_reg:.2f} no coincide "
                f"con precio oficial S/ {producto['precio_oficial']:.2f}.",
                producto, precio_reg, canal, vel_cobertura,
            )

        if not precio_ok or not canal_ok:
            score = 40 if precio_ok or canal_ok else 20
            obs = []
            if not precio_ok:
                obs.append(f"Precio registrado S/ {precio_reg:.2f} difiere del oficial S/ {producto['precio_oficial']:.2f}.")
            if not canal_ok:
                obs.append(f"Canal '{canal}' no permitido para esta campaña.")
            return self._resultado(
                "OBSERVAR", "OBSERVAR", score, " ".join(obs),
                producto, precio_reg, canal, vel_cobertura,
            )

        if not cobertura_ok:
            return self._resultado(
                "PLAN_SUPERIOR_A_COBERTURA", "REVISION_HUMANA", 55,
                f"El plan contratado supera la velocidad de cobertura disponible ({vel_cobertura} Mbps).",
                producto, precio_reg, canal, vel_cobertura,
            )

        if not distrito_ok:
            return self._resultado(
                "DISTRITO_NO_CUBIERTO", "REVISION_HUMANA", 50,
                f"El distrito '{distrito}' no está cubierto por esta campaña.",
                producto, precio_reg, canal, vel_cobertura,
            )

        return self._resultado(
            "CAMPANA_VALIDA", "CONTINUAR", 100,
            "Todos los datos comerciales son consistentes con el tarifario vigente.",
            producto, precio_reg, canal, vel_cobertura,
        )

    def _resultado(self, resultado, decision, score, observacion,
                   producto, precio_reg, canal, vel_cobertura):
        return {
            "res_resultado_producto": resultado,
            "res_decision_rpa": decision,
            "res_score_comercial": score,
            "res_observacion_producto": observacion,
            "res_precio_oficial": producto["precio_oficial"] if producto else None,
            "res_precio_registrado": precio_reg,
            "res_canal_permitido": canal,
            "res_velocidad_plan_mbps": producto["velocidad_max_cobertura_mbps"] if producto else None,
            "detalle_producto": producto,
            "fecha_consulta": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "regla_aplicada": self._regla_humana(resultado),
        }

    @staticmethod
    def _regla_humana(resultado: str) -> str:
        return {
            "CAMPANA_NO_VALIDA": "Campaña vencida o producto no encontrado: rechazar. Precio o canal incorrecto: observar. Plan superior a cobertura: revisión humana. Todo correcto: continuar.",
            "OBSERVAR": "Precio o canal incorrecto: observar.",
            "PLAN_SUPERIOR_A_COBERTURA": "Plan superior a cobertura: revisión humana.",
            "DISTRITO_NO_CUBIERTO": "Distrito fuera de cobertura: revisión humana.",
            "PRODUCTO_NO_ENCONTRADO": "Producto no encontrado: rechazar.",
            "CAMPANA_VALIDA": "Todo correcto: continuar.",
        }.get(resultado, "")
