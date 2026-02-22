# ABB Terra 54 DC Fast Charger — Cooling System
## Maintenance & Troubleshooting Manual
**Component Category:** Cooling  
**Target Part:** Coolant Pump Assembly (Part #3HEA80234)  
**Expected Error Code:** `ERR-0X1A`  
**Charger Specs:** 50 kW DC output, up to 920 VDC, CCS1/CCS2/CHAdeMO, air-cooled cabinet with auxiliary liquid cooling loop  
**Revision:** 2.1  
**Date:** 2025-09-15  

---

### 1. Symptom & Identification

The ABB Terra 54 uses a hybrid cooling architecture: the main power electronics are air-cooled via forced convection (dual 120mm fans at the rear), while the CCS connector and charging cable use an auxiliary liquid cooling loop driven by the Coolant Pump Assembly (3HEA80234).

When the coolant pump degrades or fails, the system issues error code `ERR-0X1A` on the ABB Ability connected services dashboard. Common symptoms include:

- Charger auto-derates from 50 kW to 25 kW or lower during sustained sessions
- Connector handle feels noticeably warm or hot to the touch
- Sessions terminate prematurely after 5-10 minutes with a "Charging Interrupted" message on the driver display
- Telemetry shows pump RPM dropping below 2800 (normal operating range: 3000-3500 RPM)
- Coolant loop pressure drops below 2.0 bar (normal: 2.5-3.5 bar)

**Degradation pattern:** Coolant pump failure is typically gradual. Over 48-72 hours, pump RPM drops 15-20% as the impeller bearings wear. Stator temperature rises correspondingly — expect a 10-15°C increase above the 45°C baseline during peak charging. Pressure in the coolant loop decreases from ~2.8 bar to below 1.5 bar as flow rate degrades.

### 2. Safety Precautions

> **DANGER — HIGH VOLTAGE DC**  
> The ABB Terra 54 operates at up to **920 VDC** internally. Lethal voltage is present on the DC busbars and capacitor bank even after the unit is powered down.

1. **LOTO (Lockout/Tagout):** Disconnect and lock out the upstream AC breaker (typically 100A, 480V 3-phase). Tag the breaker with your name, date, and "DO NOT ENERGIZE."
2. **Capacitor discharge:** Wait a minimum of **5 minutes** after power-down before opening the primary cabinet. The internal DC link capacitors (450V, 2200µF) must fully discharge.
3. **PPE required:**
   - Class 0 electrical safety gloves rated to 1000V (ASTM D120)
   - Safety glasses with side shields
   - Arc-flash rated clothing (minimum 8 cal/cm²)
4. **Coolant hazard:** The cooling loop contains a 50/50 propylene glycol/deionized water mixture. Wear nitrile gloves when handling. If coolant contacts skin, wash with soap and water. Dispose of used coolant per local environmental regulations.
5. Verify zero-energy state with a CAT III rated multimeter before touching any internal components.

### 3. Required Tools

- T25 and T30 Security Torx drivers
- 10mm and 13mm socket wrench set
- Digital multimeter (Fluke 87V or equivalent, CAT III 1000V rated)
- Coolant pressure gauge (0-6 bar range, with Schrader valve adapter)
- Coolant refill kit (1L premixed 50/50 propylene glycol/DI water — ABB Part #3HEA80500)
- Replacement Coolant Pump Assembly (Part #3HEA80234)
- Hose clamp pliers
- Drain pan (minimum 2L capacity)
- Shop towels / absorbent pads

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1 — Initial Triage (Power On)**
1. Before opening the cabinet, check the ABB Ability dashboard for active fault codes. Confirm `ERR-0X1A` is present.
2. Reboot the station via the dashboard or by cycling the main breaker (OFF for 30 seconds, then ON). Wait 120 seconds for the full boot sequence.
3. If `ERR-0X1A` clears after reboot, the fault may have been a transient software latch. Monitor the unit for 24 hours before closing the ticket.
4. If `ERR-0X1A` persists, proceed to physical inspection.

**Step 4.2 — Accessing the Cooling System**
1. Perform LOTO on the upstream breaker. Wait 5 minutes for capacitor discharge.
2. Remove the front cosmetic panel by unfastening the 4x T30 Security Torx screws at the corners.
3. Remove the weather-seal plate behind the cosmetic panel (6x M5 hex bolts).
4. The Coolant Pump Assembly is located in the lower-left quadrant of the chassis, mounted to a vibration-isolating bracket with 4x M6 bolts.

**Step 4.3 — Diagnostic Testing**
1. **Visual inspection:** Check for coolant leaks around the pump housing, hose connections, and the heat exchanger. Look for wet spots or crystallized glycol deposits (white residue).
2. **Pump RPM test:** Temporarily re-energize the unit (close breaker, keep cabinet open with caution). Using the ABB service tablet or the built-in diagnostic mode (hold STATUS button for 10 seconds), read the pump RPM. Normal: 3000-3500 RPM. Below 2800 RPM indicates bearing wear.
3. **Pressure test:** Connect the coolant pressure gauge to the Schrader test port on the outlet manifold. Normal operating pressure: 2.5-3.5 bar. Below 2.0 bar indicates pump degradation or a leak.
4. **Flow rate check:** With the pump running, observe the flow indicator window on the heat exchanger. Normal flow: >5 L/min. Sluggish or no visible flow confirms pump failure.
5. **Electrical test:** De-energize and disconnect the pump's 4-pin connector (2x power, 2x tachometer signal). Measure winding resistance across the power pins: expected 8-12 ohms. Open circuit indicates a burned winding. Measure tachometer signal pins: expected 120 ohms. Open circuit means the tach sensor is dead.

**Step 4.4 — Coolant Pump Replacement**
1. De-energize the unit and confirm zero-energy state.
2. Place the drain pan beneath the pump. Use hose clamp pliers to release the inlet and outlet hoses from the pump barbs. Allow coolant to drain (~1.5L expected).
3. Disconnect the 4-pin electrical connector from the pump.
4. Unbolt the pump from the vibration-isolating bracket (4x M6 bolts, 10mm socket).
5. Remove the old pump and inspect the bracket for cracks or excessive vibration wear.
6. Install the new Coolant Pump Assembly (Part #3HEA80234). Torque the 4x M6 mounting bolts to **8 Nm**.
7. Reconnect the inlet and outlet hoses. Ensure the hose clamps are seated in the groove on each barb — do not overtighten.
8. Reconnect the 4-pin electrical connector. Confirm it clicks into the locking tab.
9. Refill the coolant loop using the ABB refill kit. Pour slowly into the fill port on top of the heat exchanger until coolant is visible at the sight glass. Cap the fill port.

### 5. Verification & Testing

1. Re-engage the upstream breaker. Wait 120 seconds for the boot sequence to complete.
2. Check the ABB Ability dashboard — confirm `ERR-0X1A` has cleared.
3. Using the diagnostic mode, verify:
   - Pump RPM is within 3000-3500 RPM
   - Coolant pressure is 2.5-3.5 bar
   - No new fault codes are present
4. Perform a **10-minute test charge** at maximum power using the EV emulator tool or a compatible vehicle. Monitor connector temperature — it should stabilize below 55°C.
5. Inspect the pump area for leaks after 5 minutes of operation.
6. Log the repair in ABB Ability with the new pump part number and coolant volume added.
