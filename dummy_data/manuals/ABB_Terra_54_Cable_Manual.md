# ABB Terra 54 DC Fast Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Cable
**Target Part:** CCS1 Liquid-Cooled DC Charging Cable (200A Rated)
**Expected Error Code:** `ERR-CBL-CCS`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The ABB Terra 54 uses a liquid-cooled CCS1 (Combined Charging System) cable assembly rated for 200A continuous DC output. This cable carries both high-voltage DC power conductors and low-voltage control pilot (CP) and proximity pilot (PP) signal lines per the IEC 62196-3 / SAE J1772 combo standard.

**Common failure modes triggering `ERR-CBL-CCS`:**

- **Connector temperature alarm:** The CCS1 connector has two embedded NTC thermistors (one per DC+ and DC- pin). If either reads above 90°C during a session, the charger will derate power and eventually fault. Normal operating temperature under 50kW load is 45-65°C.
- **Coolant leak at cable gland:** The cable passes through a sealed gland where it enters the charger housing. Ethylene glycol coolant weeping at this joint triggers the cable fault and may also set `ERR-COOL-LEAK` simultaneously.
- **Control pilot signal loss:** The CP line in the CCS1 connector communicates charging parameters via a 1kHz PWM signal. If the charger detects no valid CP state transition (State A → B → C) within 10 seconds of plug insertion, it faults with `ERR-CBL-CCS`.
- **Mechanical damage:** Physical damage to the cable jacket, crushed coolant lines inside the cable, or bent/corroded DC pins.

**Field observation:** On Terra 54 units deployed in high-use locations (>40 sessions/day), CCS1 cable assemblies typically require replacement every 18-24 months due to cumulative thermal cycling and mechanical wear on the connector latch mechanism.

### 2. Safety Precautions (CRITICAL)

> [!CAUTION]
> **DC BUS CAPACITORS RETAIN LETHAL VOLTAGE.**
> The Terra 54 DC bus operates at up to 920V. After de-energizing, wait a minimum of **5 minutes** for the bus capacitors to discharge through the internal bleed resistors before touching any DC-side wiring.
>
> **LOTO (Lockout / Tagout):** Lock out the upstream AC breaker (typically 100A, 480VAC 3-phase) AND the charger's internal DC contactor disconnect. Use a padlock and "DANGER — DO NOT ENERGIZE" tag. Verify zero voltage with a CAT III rated multimeter on the DC bus bar before proceeding.
>
> **Coolant handling:** The Terra 54 uses a 50/50 ethylene glycol/deionized water mixture. Wear nitrile gloves and safety glasses. If coolant contacts skin, wash with soap and water. Dispose of used coolant per local environmental regulations — do NOT pour into storm drains.
>
> **PPE:** Class 0 insulating gloves (rated 1000V) with leather protectors, safety glasses, arc-rated clothing (minimum 8 cal/cm²).

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Security Torx drivers | T25, T30 | Cabinet panel fasteners, cable gland retaining ring |
| Digital multimeter | CAT III 600V minimum (Fluke 87V recommended) | Voltage verification, thermistor resistance measurement |
| Insulated torque wrench | 1/4" drive, 2-12 Nm range | DC lug terminal torque (spec: 8 Nm ± 0.5 Nm) |
| Infrared thermometer | -20°C to 200°C range | Connector pin temperature verification |
| Coolant drain pan | 2-liter minimum capacity | Catching coolant when disconnecting cable |
| Coolant refill kit | 50/50 ethylene glycol/DI water premix | Topping off coolant loop after cable swap |
| CP signal tester | Pilot signal simulator (or EV emulator) | Verifying control pilot PWM after reassembly |
| CCS1 pin gauge set | Per SAE J1772 combo specification | Checking pin diameter and alignment on new cable |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage (Before Dispatching)**
1. Log into the ABB Ability platform. Navigate to the faulted unit and check the event log for `ERR-CBL-CCS`.
2. Note the timestamp and session context. Check if the fault occurred mid-session (likely thermal or coolant) or at session start (likely CP signal or connector damage).
3. Check the telemetry history for the cable thermistors. A gradual upward trend in peak connector temperature over weeks suggests coolant flow degradation inside the cable before outright failure.
4. Attempt a remote reboot from ABB Ability. If the error clears and the unit resumes normal operation, the fault may have been a transient CP signal glitch — monitor for recurrence before dispatching.

**Step 4.2: On-Site Initial Inspection**
1. Visually inspect the CCS1 cable along its full length from the charger to the holster. Look for jacket cuts, kinks, tire marks, or UV degradation (white chalking on the jacket surface).
2. Inspect the CCS1 connector pins. The DC+ and DC- pins should be smooth, cylindrical, and free of pitting or carbon deposits. Measure pin diameter with the gauge set — replace if worn below minimum SAE J1772 specification.
3. Check the connector latch mechanism. It should click firmly and hold the connector in the vehicle inlet with spring resistance. A loose or broken latch causes intermittent CP signal drops.
4. Inspect the cable holster and the strain relief boot where the cable exits the charger housing. Look for coolant residue (slightly oily green/yellow film).

**Step 4.3: De-Energize and Access the Cable Entry Point**
1. Power down the charger using the front panel shutdown sequence (Settings → Shutdown → Confirm).
2. Open the upstream AC breaker and apply LOTO.
3. Wait 5 minutes, then verify 0V on the DC bus using a CAT III multimeter on the bus bar test points (located on the power stack, labeled TB-DC+ and TB-DC-).
4. Remove the front panel: 4x T30 Security Torx fasteners on top, 2x T30 on each side.
5. Locate the cable entry gland on the lower-left side of the chassis. The CCS1 cable enters through a compression fitting with a rubber seal.

**Step 4.4: Diagnostic Measurements**
1. **Thermistor check:** Disconnect the thermistor connector (4-pin JST-XH, labeled J14 on the control board). Measure resistance across pins 1-2 (DC+ thermistor) and pins 3-4 (DC- thermistor). At 25°C ambient, expect 10kΩ ± 5%. An open circuit (>1MΩ) means the thermistor wire is broken inside the cable. A short (<100Ω) suggests water intrusion into the thermistor housing.
2. **DC conductor continuity:** Measure resistance from the bus bar lug to the corresponding CCS1 pin tip. Expect <50mΩ for a healthy cable. Values >200mΩ indicate internal conductor damage or a corroded lug connection.
3. **CP/PP signal lines:** Measure resistance from the CP pin on the connector to the CP wire terminal on the control board (labeled J8, pin 3). Expect <2Ω. Do the same for the PP line (J8, pin 4).
4. **Coolant line inspection:** Gently squeeze the coolant supply and return hoses where they enter the cable. They should feel firm and resilient. Soft or spongy lines indicate internal delamination.

**Step 4.5: Cable Replacement**
1. Place the coolant drain pan under the cable gland.
2. Close the coolant loop isolation valves (quarter-turn ball valves on the supply and return lines near the pump assembly). Residual coolant in the cable will drain when disconnected — expect 200-400 mL.
3. Disconnect the thermistor plug (J14), the CP/PP signal harness (J8), and the DC power lugs from the bus bar. The DC lugs are secured with M8 flanged nuts — use the insulated torque wrench to remove.
4. Loosen the cable gland compression fitting (requires T25 Security Torx on the retaining ring). Slide the old cable assembly out through the gland.
5. Feed the new cable assembly through the gland. Ensure the coolant lines are not kinked or twisted.
6. Reconnect in reverse order: DC lugs first (torque to **8 Nm**), then signal harness (J8), then thermistor plug (J14).
7. Reconnect the coolant lines to the isolation valves. Open the valves slowly and check for leaks at all fittings. Top off the coolant reservoir if the level drops below the MIN mark.
8. Tighten the cable gland compression fitting until the rubber seal grips the cable jacket firmly — do not over-tighten or the jacket will deform.

### 5. Verification & Testing

1. Remove LOTO, close the upstream AC breaker.
2. Power on the charger. Allow the full boot sequence (approximately 90 seconds on the Terra 54).
3. Monitor the ABB Ability dashboard — confirm `ERR-CBL-CCS` has cleared from the active fault list.
4. Check coolant pressure on the dashboard telemetry. Normal operating pressure is 1.5-2.5 bar. If below 1.0 bar, there may be an air bubble — the system should self-purge within 5-10 minutes of pump operation.
5. Use the CP signal tester or EV emulator to simulate a vehicle connection. Verify the charger transitions through CP states A → B → C and initiates a charging session.
6. Run a **10-minute test charge** at maximum power (50kW). Monitor the connector thermistors via telemetry — both should stay below 70°C at full load.
7. After the test charge completes, inspect the cable gland and all coolant fittings for leaks. Wipe the area dry and recheck after 5 minutes.
8. Re-install the front panel (4x T30 top, 2x T30 each side).
9. Log the repair in ABB Ability: note the old cable serial number, new cable serial number, and coolant top-off volume.
