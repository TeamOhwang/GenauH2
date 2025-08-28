from __future__ import annotations

from flask import Flask, Response
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
import json
import os
import queue
import random
import threading
import time

# ---------- Config ----------
KST = timezone(timedelta(hours=9))

TICK_SECONDS = float(os.getenv("TICK_SECONDS", "2"))
KAPPA = float(os.getenv("KAPPA", "0.05"))
ORIGINS = os.getenv("ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
FAULT_CODES = [c.strip() for c in os.getenv("FAULT_CODES", "E101,E217,E503").split(",") if c.strip()]

# Single facility spec (from first row in your table)
FACILITY = {
    "facId": 1,
    "type": "PEM",
    "pressure": 30.0,   # outlet setpoint (bar)
    "purity": 99.999,   # %
}

# Low-amplitude noise per tick
SIGMA = {
    "temp": 0.05,      # °C
    "p_stack": 0.03,   # bar
    "p_out": 0.02,     # bar
    "volt": 0.2,       # V
    "amp": 1.5,        # A
    "purity": 0.0005,  # %
}

# Status transition probabilities per tick
def next_status(prev: str) -> str:
    r = random.random()
    if prev == "RUN":
        if r < 0.010: return "IDLE"   # 1.0%
        if r < 0.012: return "FAULT"  # 0.2%
        return "RUN"
    if prev == "IDLE":
        if r < 0.100: return "RUN"    # 10%
        if r < 0.120: return "FAULT"  # 2%
        return "IDLE"
    if prev == "FAULT":
        if r < 0.400: return "IDLE"   # 40% recover to IDLE
        return "FAULT"
    return "RUN"

def targets_for(ftype: str, status: str, spec: dict) -> dict:
    # Targets tuned for PEM 500kW class (without power/production fields)
    if ftype == "PEM":
        if status == "RUN":
            return dict(temp=68.0, p_stack=30.0, p_out=spec["pressure"], volt=400.0, amp=1250.0, purity=spec["purity"])
        if status == "IDLE":
            return dict(temp=40.0, p_stack=12.0, p_out=spec["pressure"]-0.5, volt=30.0,  amp=5.0,    purity=spec["purity"]-0.004)
        if status == "FAULT":
            return dict(temp=32.0, p_stack=0.3,  p_out=0.2,                  volt=0.0,  amp=0.0,    purity=spec["purity"]-0.02)
    # Fallback (treat as PEM)
    return targets_for("PEM", status, spec)

# Gentle update: mean reversion + small noise
def step(val: dict, tgt: dict) -> dict:
    return {
        "temp":   val["temp"]   + KAPPA*(tgt["temp"]   - val["temp"])   + random.uniform(-SIGMA["temp"],   SIGMA["temp"]),
        "p_stack":val["p_stack"]+ KAPPA*(tgt["p_stack"]- val["p_stack"])+ random.uniform(-SIGMA["p_stack"], SIGMA["p_stack"]),
        "p_out":  val["p_out"]  + KAPPA*(tgt["p_out"]  - val["p_out"])  + random.uniform(-SIGMA["p_out"],  SIGMA["p_out"]),
        "volt":   val["volt"]   + KAPPA*(tgt["volt"]   - val["volt"])   + random.uniform(-SIGMA["volt"],   SIGMA["volt"]),
        "amp":    val["amp"]    + KAPPA*(tgt["amp"]    - val["amp"])    + random.uniform(-SIGMA["amp"],    SIGMA["amp"]),
        "purity": val["purity"] + KAPPA*(tgt["purity"] - val["purity"]) + random.uniform(-SIGMA["purity"], SIGMA["purity"]),
    }

def clamp(val: dict) -> dict:
    bounds = {
        "temp":   (0.0, 90.0),
        "p_stack":(0.0, 40.0),
        "p_out":  (0.0, 40.0),
        "volt":   (0.0, 450.0),
        "amp":    (0.0, 2000.0),
        "purity": (90.0, 100.0),
    }
    for k, (lo, hi) in bounds.items():
        v = val[k]
        if v < lo: v = lo
        if v > hi: v = hi
        val[k] = v
    return val

# ---------- Flask SSE ----------
app = Flask(__name__)
CORS(app, resources={r"/stream": {"origins": ORIGINS.split(",")}})

subscribers: set[queue.Queue] = set()

def publish(evt: dict) -> None:
    dead = []
    for q in list(subscribers):
        try:
            q.put_nowait(evt)
        except Exception:
            dead.append(q)
    for q in dead:
        subscribers.discard(q)

@app.get("/stream")
def stream():
    q: queue.Queue = queue.Queue()
    subscribers.add(q)

    def gen():
        try:
            while True:
                data = q.get()
                yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
        except GeneratorExit:
            subscribers.discard(q)

    headers = {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no"
    }
    return Response(gen(), mimetype="text/event-stream", headers=headers)

# ---------- State ----------
STATE = {
    "status": "RUN",
    "val": targets_for(FACILITY["type"], "RUN", FACILITY).copy()
}

def loop():
    while True:
        # Rare status transition
        STATE["status"] = next_status(STATE["status"])
        tgt = targets_for(FACILITY["type"], STATE["status"], FACILITY)

        # Gentle step and clamp
        STATE["val"] = step(STATE["val"], tgt)
        STATE["val"] = clamp(STATE["val"])

        evt = {
            "facId": FACILITY["facId"],
            "electrolyzerType": FACILITY["type"],
            "ts": datetime.now(KST).replace(microsecond=0).isoformat(),
            "status": STATE["status"],
            "stackTempC": round(STATE["val"]["temp"], 2),
            "stackPressBar": round(STATE["val"]["p_stack"], 2),
            "outletPressBar": round(STATE["val"]["p_out"], 2),
            "dcVoltageV": round(STATE["val"]["volt"], 2),
            "dcCurrentA": round(STATE["val"]["amp"], 2),
            "purityPct": round(STATE["val"]["purity"], 6),
            "faultCode": None if STATE["status"] != "FAULT" else random.choice(FAULT_CODES)
        }
        publish(evt)
        time.sleep(TICK_SECONDS)

threading.Thread(target=loop, daemon=True).start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, threaded=True)
