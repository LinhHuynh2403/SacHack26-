import os

MANUALS_DIR = "dummy_data/manuals"
os.makedirs(MANUALS_DIR, exist_ok=True)

chargers = {
    "ABB_Terra_54": {
        "name": "ABB Terra 54 DC Fast Charger",
        "components": {
            "Cooling": {"code": "ERR-0X1A", "part": "Coolant Pump Assembly (3HEA80234)", "action": "Replace cooling pump and bleed lines"},
            "Payment": {"code": "ERR-PAY-01", "part": "NFC/RFID Reader Module (Nayax VPOS)", "action": "Reset reader and test cellular pulse"},
            "Cable": {"code": "ERR-CBL-CCS", "part": "CCS1 Liquid Cooled Cable (200A)", "action": "Check thermal sensors in the pins"},
            "Power": {"code": "ERR-REC-04", "part": "10kW Rectifier Module", "action": "Swap rectifier module, check phase balance"},
            "Comms": {"code": "ERR-NET-4G", "part": "LTE Cellular Modem (Sierra Wireless)", "action": "Cycle SIM, reseat antenna connections"},
            "Screen": {"code": "ERR-HMI-BLK", "part": "15-inch Capacitive Touch Screen", "action": "Replace LVDS cable from mainboard"},
        }
    },
    "ChargePoint_CT4000": {
        "name": "ChargePoint CT4000 Series (Level 2)",
        "components": {
            "Payment": {"code": "CP-ERR-RFID", "part": "RFID Authentication Board", "action": "Reseat ribbon cable, update firmware via USB"},
            "Cable": {"code": "CP-ERR-RET", "part": "Retractor Mechanism & J1772 Cable", "action": "Adjust retractor spring tension, replace holster"},
            "Power": {"code": "CP-ERR-CON", "part": "30A Contactor Board", "action": "Measure voltage drop across poles, replace contactor"},
            "Comms": {"code": "CP-ERR-WIFI", "part": "Wi-Fi / Cellular Node gateway", "action": "Provision new MAC address in backend"},
            "Screen": {"code": "CP-ERR-LCD", "part": "Monochrome LCD Display", "action": "Check backlight voltage, replace LCD unit"},
            "Mount": {"code": "CP-ERR-TIL", "part": "Bollard Mounting Base", "action": "Re-torque anchor bolts to 50 ft-lbs"}
        }
    },
    "Tesla_Supercharger_V3": {
        "name": "Tesla Supercharger V3 (250kW)",
        "components": {
            "Cooling": {"code": "VC-THRM-001", "part": "Liquid Cooling Loop Radiator", "action": "Top off Glycol mix, clear radiator debris"},
            "Cable": {"code": "VC-CBL-LIQ", "part": "Liquid-Cooled NACS Cable", "action": "Inspect for pin melting, perform dielectric test"},
            "Power": {"code": "VC-CAB-ACDC", "part": "Supercharger Cabinet AC/DC Converter", "action": "Check busbar torque, inspect IGBT modules"},
            "Comms": {"code": "VC-CAN-BS", "part": "CAN Bus Communication Node", "action": "Verify 120 ohm termination resistor"},
            "Thermal": {"code": "VC-STC-TMP", "part": "Stall Temperature Sensor", "action": "Replace thermistor on the cable handle logic board"},
            "Pedestal": {"code": "VC-PED-LED", "part": "Tesla Logo LED Assembly", "action": "Replace 12V LED driver"},
        }
    },
    "Tritium_Veefil_RT": {
        "name": "Tritium Veefil-RT 50kW",
        "components": {
            "Cooling": {"code": "TR-CL-09", "part": "Intake Fan Assembly", "action": "Clean filter, check fan RPM via software tool"},
            "Payment": {"code": "TR-CC-NA", "part": "Credit Card Terminal", "action": "Verify heartbeat to banking backend"},
            "Cable": {"code": "TR-CHA-CHd", "part": "CHAdeMO Connector", "action": "Check proximity pilot pin impedance"},
            "Power": {"code": "TR-PWR-ISO", "part": "Isolation Fault Monitor", "action": "Measure resistance to ground (Must be > 100kOhm)"},
            "Comms": {"code": "TR-SYS-OFF", "part": "Main Processor Board", "action": "Hard reboot sequence, serial interface diagnostic"},
            "Screen": {"code": "TR-UI-HMI", "part": "HMI Glass Panel", "action": "Replace IP65 sealed front panel"},
        }
    },
}

template = """# {charger_name}
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** {category}
**Target Part:** {part}
**Expected Error Code:** `{code}`
**Revision:** 1.4
**Date:** 2024-03-12

---

### 1. Symptom & Identification
When a failure occurs in the {part}, the system will typically issue the error code `{code}` to the central operations dashboard. 
Drivers at the station may report the station as "Out of Order" or experience unexpected session terminations.

### 2. Safety Precautions (CRITICAL)
> [!CAUTION]
> **HIGH VOLTAGE CAPACITORS PRESENT.**
> Wait exactly 5 minutes after disconnecting utility power before opening the primary cabinet.
> **LOTO (Lockout / Tagout)** procedures must be strictly followed at the upstream breaker.
> Wearing Class 0 (1000V) electrical safety gloves is mandatory when working near the busbars.

### 3. Required Tools
*   T25 and T30 Security Torx Drivers
*   Digital Multimeter (Fluke 87V or equivalent)
*   Insulated Torque Wrench
*   Replacement {part}

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Initial Triage**
1. Do not immediately remove the component. First, reboot the station to clear any software latches.
2. If `{code}` persists after boot sequence, proceed with physical inspection.

**Step 4.2: Accessing the Enclosure**
1. Remove the front-facing cosmetic panel.
2. Unfasten the 6x M5 bolts holding the weather-seal plate.
3. Locate the {part} inside the chassis.

**Step 4.3: Diagnostic Testing**
1. Disconnect the logic/control cables from the {part}.
2. Check for continuity. If the multimeter reads an open circuit where 120 ohms is expected, the internal bus is compromised. 
3. *Recommendation: {action}*

**Step 4.4: Replacement**
1. Unplug the main harness. 
2. Slide the {part} out of the bracket. 
3. Insert the new component and torque all electrical lugs to the specification found on the part sticker (typically 6.5 Nm).

### 5. Verification & Testing
1. Re-engage the main breaker.
2. Wait 120 seconds for the boot sequence to complete.
3. Ping the charger from the diagnostic technician app to verify `{code}` has cleared.
4. Perform a 5-minute test charge sequence using the EV emulator tool.
"""

for charger_id, data in chargers.items():
    for category, details in data["components"].items():
        filename = f"{MANUALS_DIR}/{charger_id}_{category}_Manual.md"
        content = template.format(
            charger_name=data["name"],
            category=category,
            part=details["part"],
            code=details["code"],
            action=details["action"]
        )
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)

print(f"Successfully generated 24 markdown test manuals in {MANUALS_DIR}")
