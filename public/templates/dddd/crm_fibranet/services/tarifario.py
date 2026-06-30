"""Servicio de tarifario: carga/persistencia del catálogo comercial."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from openpyxl import Workbook


class TarifarioService:
    def __init__(self, source: Path):
        self.source = Path(source)
        self._data = self._load()

    def _load(self) -> dict[str, Any]:
        if self.source.exists():
            return json.loads(self.source.read_text(encoding="utf-8"))
        return self._seed()

    def _seed(self) -> dict[str, Any]:
        data = {
            "campanas": [
                "Promo Basica", "Promo Call Center", "Promo Digital", "Promo Empresas",
                "Promo Especial Campo", "Promo Flash", "Promo Gamer", "Promo Migracion",
                "Promo Premium Plus", "Promo Regular", "Promo Verano", "Promo Zona Norte",
            ],
            "planes": ["Fibra 300 Mbps", "Fibra 500 Mbps", "Fibra 1000 Mbps", "Fibra 2000 Mbps"],
            "canales": ["Web", "Call Center", "Tienda", "Campo", "Digital"],
            "distritos": ["Santiago de Surco", "Miraflores", "San Isidro", "La Molina", "San Borja", "Lima Cercado"],
            "medios_pago": ["Tarjeta", "Débito automático", "Efectivo", "Yape", "Plin"],
            "productos": [
                {
                    "id_producto": "PROD-011",
                    "campana": "Promo Flash",
                    "plan": "Fibra 500 Mbps",
                    "precio_oficial": 74.90,
                    "canales_permitidos": ["Web"],
                    "distritos": ["Todos"],
                    "vigente_desde": "2026-04-01",
                    "vigente_hasta": "2026-04-30",
                    "requiere_debito_automatico": False,
                    "velocidad_max_cobertura_mbps": 1000,
                    "restriccion": "Campaña vencida",
                },
                {
                    "id_producto": "PROD-001",
                    "campana": "Promo Basica",
                    "plan": "Fibra 300 Mbps",
                    "precio_oficial": 59.90,
                    "canales_permitidos": ["Web", "Call Center", "Tienda"],
                    "distritos": ["Todos"],
                    "vigente_desde": "2026-01-01",
                    "vigente_hasta": "2026-12-31",
                    "requiere_debito_automatico": False,
                    "velocidad_max_cobertura_mbps": 500,
                    "restriccion": "",
                },
                {
                    "id_producto": "PROD-007",
                    "campana": "Promo Gamer",
                    "plan": "Fibra 1000 Mbps",
                    "precio_oficial": 129.90,
                    "canales_permitidos": ["Web", "Digital"],
                    "distritos": ["Santiago de Surco", "Miraflores", "San Isidro", "La Molina", "San Borja"],
                    "vigente_desde": "2026-01-01",
                    "vigente_hasta": "2026-12-31",
                    "requiere_debito_automatico": True,
                    "velocidad_max_cobertura_mbps": 1000,
                    "restriccion": "",
                },
                {
                    "id_producto": "PROD-014",
                    "campana": "Promo Premium Plus",
                    "plan": "Fibra 2000 Mbps",
                    "precio_oficial": 199.90,
                    "canales_permitidos": ["Web", "Call Center"],
                    "distritos": ["Miraflores", "San Isidro", "Santiago de Surco"],
                    "vigente_desde": "2026-01-01",
                    "vigente_hasta": "2026-12-31",
                    "requiere_debito_automatico": True,
                    "velocidad_max_cobertura_mbps": 2000,
                    "restriccion": "",
                },
            ],
        }
        self.source.parent.mkdir(parents=True, exist_ok=True)
        self.source.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        return data

    # ---------- Consultas ----------
    def listar_campanas(self): return self._data["campanas"]
    def listar_planes(self): return self._data["planes"]
    def listar_canales(self): return self._data["canales"]
    def listar_distritos(self): return self._data["distritos"]
    def listar_medios_pago(self): return self._data["medios_pago"]
    def productos(self): return self._data["productos"]

    def buscar_producto(self, campana: str, plan: str) -> dict | None:
        for p in self._data["productos"]:
            if p["campana"].lower() == campana.lower() and p["plan"].lower() == plan.lower():
                return p
        return None

    def snapshot(self) -> dict[str, Any]:
        return self._data

    # ---------- Export Excel ----------
    def exportar_excel(self, destino: Path) -> Path:
        destino = Path(destino)
        wb = Workbook()
        ws = wb.active
        ws.title = "Tarifario"
        headers = [
            "ID Producto", "Campaña", "Plan", "Precio Oficial (S/)",
            "Canales permitidos", "Distritos", "Vigente desde", "Vigente hasta",
            "Requiere débito automático", "Velocidad máx. cobertura (Mbps)", "Restricción",
        ]
        ws.append(headers)
        for p in self._data["productos"]:
            ws.append([
                p["id_producto"], p["campana"], p["plan"], p["precio_oficial"],
                ", ".join(p["canales_permitidos"]), ", ".join(p["distritos"]),
                p["vigente_desde"], p["vigente_hasta"],
                "Sí" if p["requiere_debito_automatico"] else "No",
                p["velocidad_max_cobertura_mbps"], p["restriccion"] or "—",
            ])
        for col in ws.columns:
            length = max(len(str(c.value)) for c in col if c.value is not None)
            ws.column_dimensions[col[0].column_letter].width = min(length + 2, 40)
        destino.parent.mkdir(parents=True, exist_ok=True)
        wb.save(destino)
        return destino
