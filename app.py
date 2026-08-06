import json
import os
import socket
import threading
from flask import Flask, render_template, request, jsonify
import random
from collections import deque
import datetime
import sqlite3

app = Flask(__name__)

# ==============================
# Latest Sensor Data
# ==============================

latest = {
    "voltage": 0.0,
    "current": 0.0,
    "power": 0.0,
    "energy": 0.0,
    "frequency": 0.0,
    "pf": 0.0,
    "time": "--:--:--"
}

SAVE_FILE = "latest_data.json"
DB_FILE = "energy_history.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            voltage REAL,
            current REAL,
            power REAL,
            energy REAL,
            frequency REAL,
            pf REAL
        )
    """)

    conn.commit()
    conn.close()

if os.path.exists(SAVE_FILE):
    try:
        with open(SAVE_FILE, "r") as f:
            latest.update(json.load(f))
    except:
        pass

# ==============================
# Graph History
# ==============================

history = {
    "labels": deque(maxlen=30),
    "voltage": deque(maxlen=30),
    "current": deque(maxlen=30),
    "power": deque(maxlen=30),
    "energy": deque(maxlen=30),
    "frequency": deque(maxlen=30),
    "pf": deque(maxlen=30)
}

# =====================================================
# 3 Phase Meter Graph History
# =====================================================

meter_history = {
    "labels": deque(maxlen=30),

    "va": deque(maxlen=30),
    "vb": deque(maxlen=30),
    "vc": deque(maxlen=30),

    "ia": deque(maxlen=30),
    "ib": deque(maxlen=30),
    "ic": deque(maxlen=30),

    "pa": deque(maxlen=30),
    "pb": deque(maxlen=30),
    "pc": deque(maxlen=30),

    "totalEnergy": deque(maxlen=30)
}
# =====================================================
# Dummy 3 Phase Meter
# =====================================================

dummy_meter = {

    "va":221.4,
    "vb":220.8,
    "vc":221.6,

    "ia":1.84,
    "ib":1.77,
    "ic":1.92,

    "pa":408,
    "pb":392,
    "pc":425,

    "ea":4.000,
    "eb":4.000,
    "ec":4.000,

    "totalPower":1225,
    "totalEnergy":12.000,

    "pf":0.98,

    "frequency":50.0

}

# =====================================================
# Dummy Generator
# =====================================================
def update_dummy_meter():

    dummy_meter["va"] = round(random.uniform(220,223),1)
    dummy_meter["vb"] = round(random.uniform(220,223),1)
    dummy_meter["vc"] = round(random.uniform(220,223),1)

    dummy_meter["ia"] = round(random.uniform(1.6,2.1),2)
    dummy_meter["ib"] = round(random.uniform(1.6,2.1),2)
    dummy_meter["ic"] = round(random.uniform(1.6,2.1),2)

    dummy_meter["pa"] = round(dummy_meter["va"]*dummy_meter["ia"],1)
    dummy_meter["pb"] = round(dummy_meter["vb"]*dummy_meter["ib"],1)
    dummy_meter["pc"] = round(dummy_meter["vc"]*dummy_meter["ic"],1)

    dummy_meter["totalPower"] = round(

        dummy_meter["pa"]+

        dummy_meter["pb"]+

        dummy_meter["pc"]

    ,1)

    dummy_meter["totalEnergy"] += 0.002

    dummy_meter["ea"] = round(dummy_meter["totalEnergy"]/3,3)
    dummy_meter["eb"] = round(dummy_meter["totalEnergy"]/3,3)
    dummy_meter["ec"] = round(dummy_meter["totalEnergy"]/3,3)

    dummy_meter["pf"] = round(random.uniform(0.96,0.99),2)

    dummy_meter["frequency"] = 50.0

    now = datetime.datetime.now().strftime("%H:%M:%S")

    meter_history["labels"].append(now)

    meter_history["va"].append(dummy_meter["va"])
    meter_history["vb"].append(dummy_meter["vb"])
    meter_history["vc"].append(dummy_meter["vc"])

    meter_history["ia"].append(dummy_meter["ia"])
    meter_history["ib"].append(dummy_meter["ib"])
    meter_history["ic"].append(dummy_meter["ic"])

    meter_history["pa"].append(dummy_meter["pa"])
    meter_history["pb"].append(dummy_meter["pb"])
    meter_history["pc"].append(dummy_meter["pc"])

    meter_history["totalEnergy"].append(dummy_meter["totalEnergy"])
# ==============================
# Dashboard
# ==============================

@app.route("/")
def index():
    return render_template("index.html")


# ==============================
# ESP32 POST Endpoint
# ==============================

@app.route("/update", methods=["POST"])
def update():

    global latest

    data = request.get_json()

    if not data:
        return jsonify({"status":"error"}),400

    latest["voltage"] = float(data.get("voltage",0))
    latest["current"] = float(data.get("current",0))
    latest["power"] = float(data.get("power",0))
    latest["energy"] = float(data.get("energy",0))
    latest["frequency"] = float(data.get("frequency",0))
    latest["pf"] = float(data.get("pf",0))
    latest["time"] = datetime.datetime.now().strftime("%H:%M:%S")

    # Save reading to SQLite database
    # Save reading to SQLite database
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO readings
        (timestamp, voltage, current, power, energy, frequency, pf)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        latest["voltage"],
        latest["current"],
        latest["power"],
        latest["energy"],
        latest["frequency"],
        latest["pf"]
    ))

    conn.commit()
    conn.close()

    with open(SAVE_FILE, "w") as f:
        json.dump(latest, f)

    history["labels"].append(latest["time"])
    history["voltage"].append(latest["voltage"])
    history["current"].append(latest["current"])
    history["power"].append(latest["power"])
    history["energy"].append(latest["energy"])
    history["frequency"].append(latest["frequency"])
    history["pf"].append(latest["pf"])

    return jsonify({"status":"success"})


# ==============================
# Latest Values
# ==============================

@app.route("/data")
def data():
    return jsonify(latest)

@app.route("/powermeter/data")

def powermeter_data():

    update_dummy_meter()

    return jsonify(dummy_meter)
# ==============================
# Graph Data
# ==============================

@app.route("/history")
def history_data():

    return jsonify({
        "labels": list(history["labels"]),
        "voltage": list(history["voltage"]),
        "current": list(history["current"]),
        "power": list(history["power"]),
        "energy": list(history["energy"]),
        "frequency": list(history["frequency"]),
        "pf": list(history["pf"])
    })

@app.route("/graph/<graph_type>")
def graph(graph_type):
    return render_template("graph.html", graph_type=graph_type)

@app.route("/powermeter/history")
def powermeter_history():

    return jsonify({
        "labels": list(meter_history["labels"]),

        "va": list(meter_history["va"]),
        "vb": list(meter_history["vb"]),
        "vc": list(meter_history["vc"]),

        "ia": list(meter_history["ia"]),
        "ib": list(meter_history["ib"]),
        "ic": list(meter_history["ic"]),

        "pa": list(meter_history["pa"]),
        "pb": list(meter_history["pb"]),
        "pc": list(meter_history["pc"]),

        "totalEnergy": list(meter_history["totalEnergy"])
    })
# ==============================
# Run
# ==============================
def udp_discovery():

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    sock.setsockopt(socket.SOL_SOCKET,
                    socket.SO_REUSEADDR,
                    1)

    sock.bind(("",4210))

    print("UDP Discovery Running...")

    while True:

        data, addr = sock.recvfrom(1024)

        message = data.decode()

        if message == "DISCOVER_ENERGY_SERVER":

            reply = "ENERGY_SERVER"

            sock.sendto(reply.encode(), addr)

            print(f"Discovery Reply -> {addr[0]}")

init_db()
            
if __name__ == "__main__":

    threading.Thread(
        target=udp_discovery,
        daemon=True
    ).start()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )

