# Tesla Supercharger V3 (250kW)
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Cable
**Target Part:** Liquid-Cooled NACS (North American Charging Standard) Cable Assembly
**Expected Error Code:** `VC-CBL-LIQ`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The Tesla Supercharger V3 uses a **liquid-cooled NACS (North American Charging Standard, SAE J3400) cable** — one per stall pedestal. The NACS connector is significantly smaller and lighter than CCS1, but the cable itself is liquid-cooled to enable the sustained high current (up to 615A DC at low voltage on some vehicles) that achieves 250kW output.

**Cable architecture:**
- **DC power conductors:** Two high-gauge stranded copper conductors (DC+ and DC-), each carrying up to 615A
- **Liquid cooling lines:** Two small-diameter polyurethane hoses running inside the cable jacket, carrying the same 50/50 glycol coolant loop as the Power Cabinet
- **NACS signal lines:** Data communication between the charger and vehicle (proprietary Tesla Ethernet-over-DC bus protocol)
- **Connector:** NACS/J3400 connector — a single compact unit with integrated thermal management

**Error `VC-CBL-LIQ` is generated when:**
- Coolant temperature in the NACS connector handle exceeds **95°C** (per SAE J3400, max handle temperature 105°C)
- Coolant flow through the cable circuit drops below the per-stall minimum
- The NACS connector's internal health monitor reports a fault (reported via the in-cable communication bus)

**Failure modes:**

| Failure | Likely Cause |
|---------|-------------|
| Connector overheating with normal coolant flow | Blocked micro-channel in connector handle cooling circuit |
| Connector overheating with low coolant flow | Kinked cable, damaged coolant tube, or coolant pump issue |
| DC pin corrosion or damage | High-resistance connection at vehicle inlet — check vehicle-side |
| Cable jacket cracked/stiff | UV/ozone degradation — common after 3+ years outdoor use |
| Communication loss mid-session | Signal line damage inside cable (usually near connector after impact) |
| Connector latch failure | Mechanical wear — the NACS latch sees high cycle count at busy V3 sites |

**Important V3 context:** Each stall pedestal has its own dedicated cable connected to the shared Power Cabinet via a high-current DC busway. The cable cannot be repaired in the field — the entire cable assembly is replaced as a unit. Tesla-authorized technicians must request cable assemblies through the Tesla parts portal.

### 2. Safety Precautions (CRITICAL)

> [!CAUTION]
> **The DC cable and connector carry up to 920V DC during a charging session (at low-current, high-voltage battery configurations). This is a lethal voltage.**
>
> The NACS cable automatically de-energizes when disconnected from a vehicle (the DC contactors in the Power Cabinet open). A cable that is NOT plugged into a vehicle carries **0V on its DC pins** — safe to handle.
>
> However, before performing any work that requires opening the stall pedestal (accessing the cable termination inside the pedestal), the Power Cabinet must be LOTO'd. All four stalls share one Power Cabinet — LOTO on the cabinet affects all 4 stalls simultaneously.

**LOTO for cable termination work:**
1. Notify Tesla Fleet Operations that all 4 stalls will be taken offline.
2. Lock out the 400A 3-phase AC disconnect on the Power Cabinet exterior.
3. Wait **10 minutes** for DC bus capacitors to discharge.
4. Verify 0V DC at the DC busway test points before opening any stall pedestal.

**For external cable inspection (connector and cable jacket, no pedestal opening):** No LOTO required. The cable is de-energized when unplugged.

**PPE:** Class 0 insulating gloves (1000V rated) for any work near the DC cable terminations. Safety glasses. Nitrile gloves for coolant handling.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Torx T20, T25 (Tesla-specific) | Tesla security Torx | Stall pedestal panel fasteners |
| Digital multimeter | CAT III 1000V rated | DC voltage verification during LOTO, cable conductor resistance |
| Infrared thermometer | -20°C to 200°C range | Checking connector handle temperature during test charge |
| NACS pin gauge set | Per SAE J3400 | Verifying pin diameter on replacement cable |
| Torque wrench | 3/8" drive, 5-50 Nm range | DC busway connection torque (Tesla spec: varies by connection point, see service bulletin) |
| Replacement NACS cable assembly | Tesla-issued part, stall-length specific | Full cable swap |
| Tesla service laptop | With Tesla Service Mode software | Running post-repair self-test and cable diagnostics |
| Coolant drain container | 500mL minimum | Catching coolant from cable cooling lines on disconnect |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage via Tesla Fleet Operations**
1. Log into the Tesla Fleet Operations portal. Identify the affected stall and fault code `VC-CBL-LIQ`.
2. Review the stall's cable temperature history in the telemetry view. Normal peak connector temperatures under full load are 60-85°C. Values consistently approaching 95°C before the fault indicate gradual cooling degradation (blocked micro-channel or reduced coolant flow in that cable branch).
3. Check if the fault correlates with specific vehicle types. Some older non-Tesla vehicles using NACS adapters have suboptimal cable cooling usage — if the fault only occurs with a specific vehicle, the vehicle-side adapter may be the root cause.
4. Attempt a remote stall restart from the Tesla Fleet portal (Stall Actions → Restart). The cable cooling micro-pump (a small secondary pump in some V3 configurations) may have stalled — a power cycle can restart it.
5. Check if adjacent stalls are also faulting. If all 4 stalls trigger `VC-CBL-LIQ`, the issue is in the shared cooling loop (Power Cabinet pump or coolant level) — refer to the Cooling Manual.

**Step 4.2: On-Site Cable Visual Inspection (No LOTO Required)**
1. Pull the cable to its full extension (the V3 cable is approximately 2.4m long from the stall base to the connector).
2. Inspect the entire cable jacket for:
   - **Kinks:** Even a moderate kink in the cable pinches the internal coolant tubes, restricting coolant flow to the connector handle. Kinks near the base (where the cable exits the stall housing) are most common.
   - **Cuts or punctures:** Can expose the coolant tubing or power conductors. Any visible coolant weeping from the cable jacket is a definitive sign.
   - **UV brittleness:** Cracks in the outer jacket, white chalking. V3 cables at outdoor sites have a 3-5 year jacket life depending on UV exposure.
3. Inspect the NACS connector:
   - **DC pins:** NACS has 2 large DC pins and several smaller communication pins. The DC pins should have no visible pitting, melting, or discoloration.
   - **Communication pins:** Small and delicate — check for bending or contamination.
   - **Latch:** The NACS latch should engage firmly and release cleanly. A sticky or stiff latch can prevent proper connector seating, leading to poor thermal contact.
   - **Connector sealing:** The connector has an IP-rated seal around the pin face. Check for debris or damage to this seal — it also acts as a thermal insulator between the connector and vehicle.
4. Check the cable's holster (the bracket where the cable hangs when not in use). If the holster is cracked or misaligned, it can create a chronic kink point in the cable.

**Step 4.3: Check Coolant Flow (External Assessment)**
1. With the charger running (a session active on this stall or an adjacent stall that shares the cooling loop), carefully touch the cable near the base and near the connector handle using the back of your hand (do not grip — surfaces can be hot).
2. There should be a slight temperature gradient along the cable — slightly warmer near the connector during a session. If the cable feels the same temperature at both ends (cool) even during a session, coolant is not flowing through that cable branch.
3. Use the infrared thermometer: measure the cable temperature at the base where it exits the stall housing and at the connector handle during a session. A healthy cable will show the connector handle 10-20°C warmer than the cable base during peak charging.

**Step 4.4: LOTO and Cable Replacement**
1. Coordinate with Tesla Fleet Operations to schedule the cable replacement — all 4 stalls on this cabinet will be out of service during the work.
2. Lock out the Power Cabinet 3-phase AC disconnect. Wait 10 minutes. Verify 0V DC.
3. Remove the stall pedestal front panel: 4x Tesla T25 Torx fasteners.
4. Inside the stall pedestal, locate the cable assembly's DC connection point (two large copper lugs on the DC bus bar) and the coolant line connections (two push-fit poly hose connections with blue and red collars for supply and return).
5. Place the coolant drain container under the coolant connections. Disconnect the supply and return hoses by pressing the collar inward while pulling the hose — expect 150-300mL of coolant to drain from the cable.
6. Remove the DC lugs from the bus bar (torque spec per Tesla service bulletin for this cabinet revision — typically M8 fasteners). Record the torque value from the service bulletin before removing.
7. Thread the old cable assembly out through the stall housing's cable gland.
8. Install the new cable: thread through the gland, connect DC lugs to the bus bar (torque to specification), reconnect coolant hoses (press firmly until the collar clicks).
9. Top off the coolant reservoir on the Power Cabinet if the level dropped below MIN during the cable swap.

### 5. Verification & Testing

1. Remove LOTO, restore the Power Cabinet's 3-phase AC disconnect.
2. Allow the charger to boot (approximately 2 minutes for the V3 Power Cabinet). All 4 stalls will come back online.
3. Run the **Tesla Service Mode cable diagnostic** from the service laptop. This runs a communication self-test on the new cable's internal sensors and verifies the coolant flow sensor in the cable handle.
4. Initiate a test session on the replaced stall using a Tesla test vehicle or the Tesla EV emulator tool. Ramp to full power (250kW or the vehicle's maximum).
5. Monitor the connector handle temperature in the Fleet Operations portal telemetry. Under full load, it should stay below **85°C** with healthy coolant flow.
6. Monitor coolant flow rate: the per-stall flow measurement should read within 10% of the baseline for the other three stalls on the same cabinet.
7. Complete a 15-minute test charge at full power. Check for any new `VC-CBL-LIQ` faults.
8. Inspect the cable exit gland and all coolant connections in the pedestal for leaks after the test charge.
9. Log the repair in the Tesla Fleet Operations portal: record the old cable serial number, new cable serial number, coolant volume lost/topped-off, and any observations about the root cause (kink, UV damage, connector wear, etc.).
