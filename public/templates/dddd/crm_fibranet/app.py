"""
CRM Products FibraNet - Validador Comercial
Aplicación Flask para validación de productos comerciales contra el tarifario vigente.
Diseñada para integrarse con un CRM y ser consumida por un bot RPA.
"""
from __future__ import annotations

import os
from datetime import datetime, date
from pathlib import Path

from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    send_from_directory,
    abort,
)

from services.tarifario import TarifarioService
from services.validador import ValidadorComercial

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"


def create_app() -> Flask:
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config["JSON_AS_ASCII"] = False

    tarifario = TarifarioService(DATA_DIR / "tarifario.json")
    validador = ValidadorComercial(tarifario)

    # ---------- Vistas ----------
    @app.route("/")
    def index():
        return render_template(
            "index.html",
            campanas=tarifario.listar_campanas(),
            planes=tarifario.listar_planes(),
            canales=tarifario.listar_canales(),
            distritos=tarifario.listar_distritos(),
            medios_pago=tarifario.listar_medios_pago(),
            hoy=date.today().isoformat(),
        )

    @app.route("/validar", methods=["POST"])
    def validar():
        """Endpoint principal de validación. Consume JSON desde el CRM/bot."""
        payload = request.get_json(silent=True) or request.form.to_dict()
        try:
            resultado = validador.validar(payload)
            return jsonify(resultado), 200
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    # ---------- API REST para el CRM ----------
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "crm-fibranet", "ts": datetime.utcnow().isoformat()})

    @app.get("/api/catalogo")
    def catalogo():
        return jsonify(tarifario.snapshot())

    @app.post("/api/crm/validar")
    def crm_validar():
        """Endpoint pensado para que el CRM/bot RPA llame de forma programática."""
        payload = request.get_json(force=True, silent=True) or {}
        try:
            return jsonify(validador.validar(payload))
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    # ---------- Descarga del tarifario ----------
    @app.get("/descargar/tarifario")
    def descargar_tarifario():
        filename = "Tarifario_Campanas_Vigente.xlsx"
        path = DATA_DIR / filename
        if not path.exists():
            tarifario.exportar_excel(path)
        return send_from_directory(DATA_DIR, filename, as_attachment=True)

    @app.errorhandler(404)
    def not_found(_):
        return render_template("404.html"), 404

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=True)
