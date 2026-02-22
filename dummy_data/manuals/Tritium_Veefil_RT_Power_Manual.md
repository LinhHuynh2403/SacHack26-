# Tritium Veefil-RT 50kW DC Fast Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Power
**Target Part:** DC Output Isolation Fault Monitor
**Expected Error Code:** `TR-PWR-ISO`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

**What is an Isolation Fault Monitor?**

A DC fast charger's output is an **isolated DC bus** — the DC+ and DC- rails are electrically floating relative to earth ground. This isolation is a critical safety feature: if a person touches one DC output terminal while standing on the ground, they are not in a complete circuit (no current flows). The **Isolation Fault Monitor (IFM)** continuously measures the impedance between each DC rail and earth ground to verify this isolation is intact.

The Veefil-RT's IFM is based on a low-level AC test signal injected onto the DC bus. It measures the impedance to ground and reports:
- **Isolation resistance > 100 kΩ:** Normal — isolation is intact
- **Isolation resistance 20-100 kΩ:** Warning — insulation degrading, monitor closely
- **Isolation resistance < 20 kΩ:** Fault (`TR-PWR-ISO`) — charger halts immediately for safety

**Why isolation faults occur:**

| Cause | Explanation |
|-------|-------------|
| Water/moisture inside the DC cable assembly | Conductive water path between DC conductor and cable shield/ground |
| Damaged DC cable jacket (conductor exposed) | Direct path from DC conductor to ground via exposed wire |
| Degraded insulation on internal wiring | Thermal cycling weakens insulation over years |
| Contamination inside CCS or CHAdeMO connector | Road salt, mud, or corrosive spray on connector pins can create a conductive path |
| Vehicle-side insulation fault | The vehicle's high-voltage battery isolation has failed — the Veefil-RT's IFM detects this through the charging cable |

> [!WARNING]
> **An isolation fault means there is a conductive path between a lethal DC voltage and ground.** This is a serious safety condition. **Do NOT attempt to clear this fault by simply rebooting the charger.** Identify and fix the insulation failure before returning the unit to service. A charger in isolation fault that is returned to service without repair could pose an electrocution hazard to users.

**Vehicle-caused isolation faults:** Approximately 30% of `TR-PWR-ISO` faults on the Veefil-RT are caused by the connected vehicle having a battery isolation fault rather than the charger itself. Always test the charger in isolation (without a vehicle connected) before assuming the fault is in the charger.

### 2. Safety Precautions (CRITICAL)

> [!CAUTION]
> **Elevated risk compared to other fault types.** An isolation fault means part of the DC circuit is not properly isolated. Treat the charger as having a potential ground fault until the isolation is fully verified and repaired.
>
> **Do NOT work on the DC side of the charger (cables, connectors, internal wiring) with the charger energized when an isolation fault is present.** The ground fault could create a complete circuit through your body if you contact the DC side while grounded.
>
> **Full LOTO and coolant drain required** for any internal inspection related to isolation fault diagnosis:
> 1. Lock out the upstream AC breaker.
> 2. Engage the internal DC isolator.
> 3. Wait **7 minutes** for capacitor discharge.
> 4. Verify 0V DC at the bus test points.
> 5. Drain coolant before opening main enclosure.

**PPE:** Class 0 insulating gloves (1000V), safety glasses, arc-rated clothing (8 cal/cm²). Insulated tools only when working near any wiring in the isolation fault condition.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Allen key (hex) set | Metric 4mm, 5mm, 6mm | Veefil-RT enclosure fasteners |
| High-voltage insulation tester (Megohmmeter) | 500VDC or 1000VDC test voltage, measures up to 1 GΩ | Measuring insulation resistance of cable conductors to ground |
| Digital multimeter | CAT III 1000V rated | LOTO verification, continuity checks |
| Infrared camera (optional) | Thermal imaging | Identifying hotspots in wiring due to prior isolation fault arcing |
| Coolant drain kit | 3-liter container | Draining coolant before enclosure access |
| Replacement DC cable (CCS or CHAdeMO) | Exicom/Tritium part | If cable insulation is confirmed degraded |
| Replacement internal wiring harness | Exicom/Tritium part | If internal wiring is the fault source |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage via MyTritium Portal**
1. Log into the MyTritium/Exicom portal. Confirm `TR-PWR-ISO` is active. Note which output (CCS, CHAdeMO, or "general DC bus") the fault is associated with.
2. Check the portal's isolation resistance reading (displayed in kΩ or MΩ in the telemetry). Note the value — this will help after repairs to confirm isolation has been restored.
3. Review recent session history. Was a vehicle connected when the fault appeared?
   - **Fault appeared during a session:** The vehicle's battery isolation may have failed, or a cable fault occurred during high-current stress.
   - **Fault appeared at power-on with no vehicle:** The charger has an internal insulation failure — likely cable damage or internal wiring.
4. **Do NOT attempt a remote restart** to clear this fault — it requires physical investigation first.

**Step 4.2: Isolate Vehicle vs. Charger as Root Cause**
1. On-site, ensure no vehicle is connected to either cable.
2. From the MyTritium portal, request a diagnostic check with cables disconnected. The IFM will measure isolation with only the charger's internal DC wiring (no cables attached) by disabling the output contactors.
3. If the **isolation reading is normal (>100 kΩ) with no cables connected:** The fault is in the cable assembly (CCS or CHAdeMO cable) or was in the vehicle. Reconnect the CCS cable only and check — if isolation drops, the CCS cable is faulty. Reconnect the CHAdeMO cable only and check — if isolation drops, the CHAdeMO cable is faulty.
4. If the **isolation reading is still low (<100 kΩ) with no cables connected:** The fault is in the charger's internal DC wiring. Proceed to Step 4.4.

**Step 4.3: Cable Insulation Test (If Cable is Suspected)**
1. The suspected cable should be removed from service and tested separately. To test the cable without the charger:
2. Perform LOTO. Drain coolant. Open the enclosure.
3. Disconnect the suspected cable from the DC bus bar (disconnect both DC+ and DC- lugs).
4. Use the megohmmeter to measure insulation resistance of each cable conductor:
   - **DC+ conductor to cable shield/outer jacket:** Apply 500VDC test voltage. Expect **>100 MΩ** for a healthy cable. Values <1 MΩ indicate severely degraded insulation.
   - **DC- conductor to cable shield:** Same test.
   - **DC+ to DC-:** Expect open circuit (the two conductors are not connected inside the cable).
5. A megohmmeter reading of <10 MΩ on either conductor to shield indicates the cable insulation must be replaced. Cable insulation failures in a DC cable assembly cannot be repaired — replace the entire cable.

**Step 4.4: Internal Wiring Inspection (If Internal Source Suspected)**
1. With LOTO applied and enclosure opened (after coolant drain):
2. Visually inspect all internal DC wiring for signs of:
   - **Insulation cracking or brittleness:** Especially in wiring routed near heat sources (near the power modules)
   - **Chafed insulation:** Where wires contact metal edges or pass through grommets without adequate protection
   - **Moisture:** Water staining (mineral deposits) near any wiring bundles, especially around cable glands and the coolant pump
   - **Arc marks or burnt insulation:** Black or brown carbonized areas on wire insulation indicate previous arcing events
3. If using an infrared camera, scan all DC wiring bundles. Prior arcing may have created hotspots visible as elevated temperature areas.
4. The IFM module itself (a small PCB in the control section, labeled "ISO-MON" or "GROUND FAULT MONITOR") can also fail and generate false isolation fault reports. If all wiring and cables test clean on the megohmmeter, replace the IFM module.

**Step 4.5: IFM Module Replacement**
1. Locate the IFM PCB in the control section (upper portion of the sealed enclosure, away from the power electronics section).
2. Disconnect the IFM's connectors: a DC bus sampling connector (2 small wires to DC+ and DC-, with high-impedance resistors), a ground reference connector, and an output signal connector to the main controller.
3. Remove the 2x M4 Allen key mounting bolts.
4. Install the replacement IFM PCB in reverse order.
5. The replacement IFM does not require calibration — it has an internal calibration routine that runs on first power-up.

### 5. Verification & Testing

1. After repairs, use the megohmmeter to verify isolation resistance on all DC conductors before energizing:
   - Each cable DC+ to shield: >100 MΩ
   - Each cable DC- to shield: >100 MΩ
   - Internal DC bus to chassis ground: >100 MΩ
2. Replace the enclosure panel (M6 Allen key, 4 Nm torque). Refill coolant.
3. Remove LOTO. Restore the upstream AC breaker.
4. Power on the Veefil-RT and allow full boot.
5. In the MyTritium portal, verify the isolation resistance reading has returned to the normal range (>100 kΩ on the IFM, ideally showing "Isolation OK").
6. Verify `TR-PWR-ISO` has cleared from the active alerts.
7. Connect the EV emulator or a test vehicle. Initiate a DC charging session. Verify the session starts and charges normally (the IFM monitors isolation during the session and will immediately halt if it detects a new fault during charging).
8. Run a 15-minute test session at full 50kW. Monitor the IFM reading in the portal throughout — it should remain stable and well above the 100 kΩ threshold.
9. After the session, remove the cable and re-measure cable insulation resistance with the megohmmeter to confirm the repair is durable under thermal cycling.
10. Log the repair with full documentation: isolation resistance values before and after repair, root cause identification (cable vs. internal vs. vehicle), parts replaced, and megohmmeter test results.
