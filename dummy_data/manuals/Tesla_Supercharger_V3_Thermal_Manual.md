# Tesla Supercharger V3 (250kW)
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Thermal Monitoring
**Target Part:** Stall Ambient and Cabinet Thermal Sensor Array
**Expected Error Code:** `VC-STC-TMP`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

**Tesla V3 Thermal Sensor System:**

The V3 installation has a distributed network of thermal sensors serving different purposes:

1. **Cabinet internal sensors:** Monitor the AC/DC converter modules, DC bus bar, and coolant fluid temperature inside the Power Cabinet. These sensors are managed by the cabinet controller and feed into the liquid cooling control loop.

2. **Stall ambient sensors:** Each stall pedestal has a small NTC thermistor that measures the ambient air temperature at the stall. This is used to adjust the power derating threshold — in extremely hot climates (>40°C ambient), the V3 derate begins earlier to protect the connector and cable.

3. **Cable handle sensors:** Each NACS cable has two NTC sensors embedded in the connector handle (one per DC pin contact area). These directly measure connector temperature during a session and trigger emergency power-off if the connector overheats.

**Error `VC-STC-TMP` is generated when:**
- A stall ambient temperature sensor reads out of its valid range (either -50°C or above +80°C static — indicating a failed sensor, not actual temperature)
- The sensor reading changes erratically (fluctuating ±20°C within seconds — indicates a broken wire or corroded connector)
- The stall ambient sensor reads >55°C while the adjacent stalls read normal ambient (suggesting a localized heat source or sensor drift)
- The cable handle sensor reports a static value (same value regardless of session status) — sensor stuck/frozen

**Important distinction:** `VC-STC-TMP` is specifically a **sensor health fault**, not necessarily a thermal overtemperature event. An actual thermal overtemperature event generates `VC-THRM-001`. A `VC-STC-TMP` without concurrent `VC-THRM-001` means the temperature sensors themselves are malfunctioning, not that the unit is overheating.

**Common causes:**

| Sensor type | Common failure | Symptom |
|-------------|---------------|---------|
| Stall ambient NTC | Wire fracture (from thermal cycling) | Reads open circuit → -50°C or 999°C in portal |
| Stall ambient NTC | Water intrusion into sensor housing | Erratic readings, often correlates with rainfall events |
| Cable handle NTC | Cable damage near connector | Reading that changes abruptly when cable is flexed |
| Cable handle NTC | Connector overtemperature damage | Reads static high value (sensor cooked) |

### 2. Safety Precautions

> [!NOTE]
> The thermal sensors themselves are low-voltage components (NTC thermistors, typically 5V supply or lower). However, **accessing the stall pedestal internals requires LOTO** because the DC busway and cable terminations are inside the same enclosure.

**Stall ambient sensor** (mounted externally on the stall pedestal, accessible without opening the enclosure on most V3 configurations): No LOTO required if the sensor can be accessed from outside. Verify the sensor mounting location before deciding.

**Cable handle sensor:** This sensor is embedded inside the NACS cable connector handle and is only accessible during a full cable assembly replacement (not user-serviceable separately). If the cable handle sensor has failed, the entire cable assembly must be replaced (see Cable Manual `VC-CBL-LIQ`).

**For stall pedestal interior access (ambient sensor mounting inside):** LOTO the Power Cabinet's 400A AC disconnect. Wait 10 minutes. Verify 0V DC.

**PPE:** Safety glasses, Class 0 insulating gloves if LOTO required, ESD wrist strap for sensor PCB work.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Torx T20, T25 (Tesla security) | Tesla service driver set | Stall pedestal panel fasteners |
| Digital multimeter | CAT III 1000V rated, resistance mode | LOTO verification, NTC thermistor resistance measurement |
| Infrared thermometer | -20°C to 200°C | Verifying actual ambient temperature at stall to compare with sensor reading |
| Replacement stall ambient NTC sensor | Tesla-issued part for V3 stall | Sensor replacement |
| 2-pin JST connector tool (optional) | For crimping replacement wires | If sensor wire harness is damaged and needs repair |
| Tesla service laptop | Tesla Service Mode software | Verifying sensor readings after replacement |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage — Tesla Fleet Operations Portal**
1. Log into the Fleet Operations portal. Identify the stall and sensor triggering `VC-STC-TMP`.
2. Check the sensor reading value in the telemetry:
   - A reading of **-50°C or below** → Open circuit (broken wire or disconnected sensor)
   - A reading of **>80°C in ambient conditions** (static, not session-related) → Short circuit or sensor drift
   - **Erratic fluctuations** → Intermittent connection or water intrusion
3. Compare the affected stall's temperature reading against the other stalls on the same cabinet. If they all read a similar reasonable ambient (e.g., 22°C) and the faulted stall reads -50°C, the fault is definitely the sensor hardware, not actual ambient conditions.
4. Use the infrared thermometer in your smartphone or service kit to check the actual ambient temperature at the site and compare.
5. Attempt a remote restart. A soft reboot re-initializes the sensor reading logic. If the fault was a transient communication error rather than a hardware failure, a reboot may clear it.

**Step 4.2: Stall Ambient Sensor Inspection (External)**
1. On most Tesla V3 stall pedestals, the ambient temperature sensor is a small cylindrical probe (approximately 8mm diameter) mounted in a small hole in the stall housing near the base, with a weather-protective cap. It is accessible from the outside without opening the stall.
2. Inspect the sensor probe tip and its grommet seal. If the grommet is missing or degraded, water can enter the sensor housing.
3. Check the sensor probe for physical damage — a cracked or crushed probe tip indicates mechanical damage (possibly from a vehicle bump).
4. Gently wiggle the sensor probe. If the connector inside the housing is loose, you may see the reading change in the Fleet portal telemetry in real time.

**Step 4.3: LOTO and Stall Pedestal Access**
1. If the sensor is not externally accessible or external inspection was inconclusive:
2. Lock out the Power Cabinet 3-phase AC disconnect. Wait 10 minutes. Verify 0V DC.
3. Open the stall pedestal (4x Tesla T25 Torx).
4. Locate the ambient sensor connector inside the pedestal. It is a 2-pin JST connector on the stall PCB, labeled "AMB-TEMP" or "T-AMB."

**Step 4.4: Sensor Resistance Measurement**
1. Disconnect the ambient sensor's 2-pin connector from the stall PCB.
2. Measure resistance across the two sensor pins using the multimeter in resistance mode.
3. At typical ambient temperatures, an NTC thermistor follows this relationship:
   - **At 0°C:** approximately 32.7 kΩ
   - **At 25°C:** approximately 10 kΩ
   - **At 50°C:** approximately 3.6 kΩ
4. Compare your measured resistance to the expected value at the current ambient temperature. If the measurement is:
   - **Open circuit (>1 MΩ):** Broken wire or open thermistor — replace sensor
   - **Short circuit (<100 Ω):** Thermistor damaged by overtemperature or water — replace sensor
   - **Within ±20% of expected:** Sensor resistance is correct — the fault may be in the wiring between the sensor and the stall PCB

**Step 4.5: Wiring Inspection**
1. Trace the sensor cable from the connector on the stall PCB back to the external sensor probe, looking for:
   - Pinch points where the cable routes through panel holes (abrasion through the insulation)
   - Corrosion at the connector pins (green oxidation)
   - Chafed insulation where the cable contacts a sharp edge inside the stall
2. If a wire break is found in an accessible location, the wire can be repaired with a proper wire splice (heat-shrink butt connector, not electrical tape). Ensure the repair is waterproof.

**Step 4.6: Sensor Replacement**
1. Remove the external sensor probe: press the tab on the mounting grommet from inside the stall housing and push the probe outward through its mounting hole.
2. Disconnect the 2-pin JST connector from the stall PCB.
3. Route the new sensor cable through the stall housing in the same path as the original.
4. Connect the new sensor's 2-pin JST connector to the stall PCB (keyed connector — only fits one way).
5. Insert the new probe into the mounting hole and press the grommet until it seats and the retaining tab clicks.
6. Verify the new sensor's resistance at ambient: should match the table in Step 4.4.

### 5. Verification & Testing

1. Remove LOTO. Restore the Power Cabinet 3-phase AC disconnect.
2. Allow the V3 system to boot.
3. In the Tesla Fleet Operations portal, verify the affected stall's ambient temperature sensor is now reading a value within ±5°C of actual ambient temperature (compare with your infrared thermometer reading at the stall).
4. Verify `VC-STC-TMP` has cleared from the active alerts.
5. Run the Tesla Service Mode sensor diagnostic from the service laptop to confirm all thermal sensors on the stall are reporting valid values.
6. Initiate a test charging session on the stall. Monitor the cable handle temperature in the telemetry — it should show a rising trend from ambient toward 60-80°C as the session progresses under load, confirming the cable handle sensors are also healthy.
7. After the session, verify the stall ambient temperature returns to near-ambient (within 5°C of measured ambient) within 10 minutes of session end — confirming the sensor is tracking correctly, not stuck on a high value.
8. Log the repair: note whether the root cause was an open circuit, short circuit, or wiring damage, and document the resistance measurements taken before and after replacement.
