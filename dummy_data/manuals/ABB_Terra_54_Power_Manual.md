# ABB Terra 54 DC Fast Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Power
**Target Part:** 10kW Rectifier Module (Hot-Swappable Power Stack)
**Expected Error Code:** `ERR-REC-04`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The ABB Terra 54 achieves its 50kW DC output through five modular 10kW rectifier modules arranged in a parallel power stack. Each module independently converts 480VAC 3-phase input to isolated DC output (200-920V range, current-limited per module). The modules are numbered 1-5 from bottom to top in the rack.

**Error code `ERR-REC-04` specifically identifies Rectifier Module #4** (second from top). Each module has its own error code: `ERR-REC-01` through `ERR-REC-05`. If multiple modules fail simultaneously, all corresponding codes will be active.

**Common failure modes:**

- **Single module failure (most common):** The charger continues to operate at reduced power (40kW with 4 modules, 30kW with 3, etc.). The ABB Ability dashboard will show the unit as "Degraded" rather than "Faulted" unless 3 or more modules fail.
- **Module overtemperature:** Each rectifier has an internal NTC thermistor. Normal operating temperature is 40-65°C. The module will derate at 75°C and shut down at 85°C. Overtemperature is often caused by blocked air intake filters rather than module failure.
- **AC input phase imbalance:** If the facility's 3-phase supply is unbalanced by more than 5%, the rectifier modules will cycle between fault and recovery. Check utility power quality before replacing modules.
- **DC bus overvoltage:** If the vehicle's battery management system (BMS) stops drawing current abruptly (communication fault), the DC bus voltage can spike above the rectifier's 920V maximum. The modules have overvoltage protection that triggers `ERR-REC-xx` and requires a power cycle to reset.

**Degraded operation note:** The Terra 54 is designed so that a single module failure does NOT require immediate dispatch. The unit can operate at 40kW (80% capacity) until a scheduled maintenance visit. Only dispatch urgently if 2+ modules are faulted or if the site has no backup chargers.

### 2. Safety Precautions (CRITICAL)

> [!CAUTION]
> **LETHAL VOLTAGES PRESENT ON THE DC BUS (UP TO 920V) AND AC INPUT (480VAC 3-PHASE).**
>
> **LOTO mandatory:** Lock out the upstream 100A AC breaker AND the charger's internal DC disconnect switch (located inside the cabinet, upper-right corner). Apply your personal padlock and "DANGER" tag to both.
>
> **Capacitor discharge:** After LOTO, wait a minimum of **5 minutes**. Then verify 0V at the DC bus test points (TB-DC+ and TB-DC-) using a CAT III 1000V rated multimeter. Also verify 0VAC at the AC input terminal block (TB-AC, 3 phases + neutral).
>
> **Module weight:** Each rectifier module weighs approximately 4.5 kg. Use both hands and proper lifting posture when removing or inserting modules.
>
> **PPE:** Class 00 insulating gloves (500V rated minimum) with leather protectors, safety glasses, arc-rated shirt and pants (8 cal/cm²).

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Security Torx drivers | T25, T30 | Cabinet panel fasteners |
| Digital multimeter | CAT III 1000V rated (Fluke 87V or equivalent) | Bus voltage verification, phase voltage measurement |
| AC power quality analyzer | 3-phase capable (Fluke 435-II recommended) | Checking input phase balance and THD |
| Insulated torque wrench | 3/8" drive, 5-25 Nm | Not required for module swap (hot-swap connectors), but needed if inspecting bus bar connections |
| Replacement rectifier module | ABB part number specific to Terra 54 HW revision | Spare module |
| Compressed air canister | Electronics-safe, non-conductive | Clearing dust from module bay and air intake |
| Infrared thermometer | -20°C to 200°C | Checking module and bus bar temperatures before energizing |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Diagnosis**
1. Log into ABB Ability. Navigate to the faulted unit and open the event timeline.
2. Identify which module(s) are faulted. `ERR-REC-04` = Module #4. Check if other `ERR-REC-xx` codes are also present.
3. Review the power output history. A healthy Terra 54 should deliver a steady 50kW during CCS sessions to vehicles requesting full power. If the output has been gradually declining over weeks (e.g., 50kW → 47kW → 42kW → fault), this suggests progressive module degradation rather than sudden failure.
4. Check the air intake filter status. ABB Ability reports filter differential pressure. If the filter alarm is also active, the root cause may be airflow restriction rather than a module defect.
5. Check the AC input voltage logs. If voltage sags or phase imbalance events correlate with the rectifier faults, the issue is upstream power quality — coordinate with the facility electrician.

**Step 4.2: On-Site Power Quality Check**
1. Before opening the charger, connect the AC power quality analyzer to the facility's distribution panel feeding the charger.
2. Measure all three phase voltages (L1-L2, L2-L3, L3-L1). They should be within 2% of each other. If imbalance exceeds 5%, do NOT replace the module — report the power quality issue to the site owner.
3. Measure Total Harmonic Distortion (THD). The Terra 54 input filter is designed for <5% THD. Higher THD (common in buildings with many VFDs or LED drivers) can cause premature rectifier module failures.

**Step 4.3: De-Energize and Access the Power Stack**
1. Power down the charger using the front panel (Settings → Shutdown → Confirm).
2. Open the upstream AC breaker and apply LOTO.
3. Wait 5 minutes, then verify 0V DC at TB-DC+ / TB-DC- and 0V AC at TB-AC using the multimeter.
4. Remove the front panel: 4x T30 Security Torx on top, 2x T30 on each side.
5. The power stack is the large vertical rack on the right side of the cabinet. Five rectifier modules are stacked with Module #1 at the bottom and Module #5 at the top. Each has a status LED on the faceplate:
   - **Green steady:** Module healthy
   - **Green blinking:** Module in standby (no active session)
   - **Amber:** Module derated (overtemperature)
   - **Red:** Module faulted
   - **Off:** Module not communicating with controller

**Step 4.4: Air Filter and Thermal Inspection**
1. Before swapping the module, inspect the air intake filter on the bottom of the cabinet. If it is clogged with dust, debris, or insects, clean or replace it. A blocked filter restricts airflow across all modules and can cause cascading thermal faults.
2. With the cabinet open, use the infrared thermometer to scan the power stack. All modules should be near ambient temperature (since the unit is de-energized). If Module #4 is significantly warmer than adjacent modules, it may have an internal short — handle with extra caution.
3. Use compressed air to blow out any dust accumulation in the module bay and on the module's intake vents.

**Step 4.5: Module Replacement**
1. The rectifier modules use a hot-swap connector system. No tools are needed for the module itself — the module slides in and out on rails.
2. Flip the module's ejector lever (orange handle on the left side of the faceplate) to the "unlocked" position.
3. Grasp the module by the front handle and the ejector lever. Pull the module straight out of the bay. It will disconnect from the backplane connector automatically. Support the module's weight — it's 4.5 kg.
4. Inspect the backplane connector in the empty bay. Look for bent pins, carbon deposits, or corrosion. Clean with contact cleaner spray if needed.
5. Unbox the replacement module. Verify the part number matches and check the module's faceplate label for the correct hardware revision.
6. Align the replacement module with the bay rails and slide it in firmly until the backplane connector seats. You should feel a positive click.
7. Flip the ejector lever to the "locked" position.

### 5. Verification & Testing

1. Replace the front panel and secure all fasteners.
2. Remove LOTO, close the upstream AC breaker.
3. Power on the charger. Allow 90 seconds for the boot sequence.
4. Observe the new module's faceplate LED. It should transition from Off → Amber (self-test) → Green blinking (standby) within 30 seconds.
5. Check ABB Ability: `ERR-REC-04` should have cleared. The unit status should return to "Available" (or "Degraded" if other modules are still faulted).
6. Verify the total available power on the dashboard. With all 5 modules healthy, the unit should report 50kW maximum output.
7. Initiate a test charge using the EV emulator. Ramp to full power (50kW) and hold for 10 minutes. Monitor all 5 module temperatures — they should stay below 65°C with a clean filter and good airflow.
8. Check the AC input current balance on the power quality analyzer during the test charge. All three phases should be within 5% of each other.
9. Log the repair in ABB Ability: record the faulted module's serial number, the replacement module's serial number, and whether the air filter was also serviced.
10. If the facility's AC power quality was marginal (>3% imbalance or >5% THD), note this in the service report and recommend the site owner consult an electrician about power conditioning.
