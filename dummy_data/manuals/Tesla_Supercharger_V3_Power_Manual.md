# Tesla Supercharger V3 (250kW)
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Power
**Target Part:** Supercharger Power Cabinet — AC/DC Converter Stack
**Expected Error Code:** `VC-CAB-ACDC`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

**V3 Power Architecture Overview:**

The Tesla Supercharger V3 uses a centralized power conversion model that differs fundamentally from other chargers in this manual series:

- A single **Power Cabinet** (approximately 1.8m tall × 0.6m wide × 0.4m deep) serves up to **4 stall pedestals**
- The cabinet's total power capacity is **350kW** (shared across all 4 stalls)
- Inside the cabinet are **AC/DC converter modules** — each approximately 50kW capacity — arranged in parallel to achieve the total 350kW
- The DC output from the cabinet is distributed to stall pedestals via high-current DC busways inside conduit

**Power sharing logic:** The V3 dynamically allocates power between stalls based on demand. A single vehicle can use the full 250kW if it is the only one connected. With multiple vehicles, power is split intelligently — a vehicle near full charge receives less power (it needs less), freeing capacity for a vehicle at a lower state of charge.

**Error `VC-CAB-ACDC` indicates a fault in the Power Cabinet's AC/DC conversion chain,** which affects all 4 stalls simultaneously (since they share the same cabinet). Common fault scenarios:

| Fault scenario | Observable effect |
|----------------|-------------------|
| Single AC/DC module failure | All 4 stalls throttle to share the remaining capacity (e.g., 4 stalls throttle from 87.5kW each to 75kW each if one 50kW module fails) |
| Multiple AC/DC module failures | All stalls severely throttled or offline |
| AC input phase loss | One or more modules fault; characteristic phase imbalance signature in telemetry |
| DC bus overvoltage | All stalls receive `VC-CAB-ACDC` simultaneously after a vehicle BMS disconnect event |
| Cabinet control board failure | No output from any stall despite modules showing healthy status |

> [!WARNING]
> **The Tesla V3 Power Cabinet is NOT user-serviceable by field technicians.** Internal repair and AC/DC module replacement are performed exclusively by Tesla-authorized service teams with Tesla-issued tools and clearance. This manual covers what the field technician can diagnose, report, and do externally.

**Field technician scope for `VC-CAB-ACDC`:**
1. Remote triage to characterize the fault
2. External visual inspection
3. Confirming the site's AC utility supply is healthy
4. Escalating to Tesla service with complete telemetry data

### 2. Safety Precautions (CRITICAL)

> [!DANGER]
> **THE TESLA SUPERCHARGER V3 POWER CABINET CONTAINS UP TO 920V DC ON THE INTERNAL BUS AND 480VAC 3-PHASE INPUT.**
>
> **Do NOT open the Power Cabinet under any circumstances** unless you are a Tesla-authorized service technician with the specific training and equipment for V3 Power Cabinet service. The cabinet is sealed with tamper-evident seals. Breaking these seals without authorization voids all warranty and service agreements and may create a lethal electrical hazard.
>
> **All high-voltage work on the V3 Power Cabinet requires:**
> - Tesla-issued authorization code
> - Tesla-certified arc flash PPE (minimum 40 cal/cm² for 480VAC 3-phase cabinet work)
> - Tesla-provided insulated tools rated to 1000V DC
> - Second technician on-site (no solo high-voltage work on V3 cabinets)

**For external assessment (what field technicians do):**
- No LOTO required for external visual inspection or AC utility check at the distribution panel
- Keep a minimum 1-meter clearance from the Power Cabinet if any door or panel is open or damaged

**PPE for external assessment:** Safety glasses, standard work wear. No additional arc flash PPE required for external assessment with cabinet closed and intact.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Digital multimeter | CAT III 600V minimum | Checking AC utility supply voltages at the distribution panel |
| AC power quality analyzer | 3-phase (Fluke 435-II or equivalent) | Verifying phase balance and voltage at the cabinet utility connection |
| Flashlight | High-lumen, for visual inspection | Inspecting exterior of cabinet, conduit, and base |
| Camera / smartphone | Documentation | Photographing cabinet exterior, any damage, LED status indicators |
| Tesla Fleet Service app | Tesla-issued technician device | Remote diagnostics, service escalation |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage — Tesla Fleet Operations Portal**
1. Log into the Tesla Fleet Operations portal. Confirm `VC-CAB-ACDC` is active and identify the affected Power Cabinet (sites may have multiple cabinets if they have more than 4 stalls).
2. Review the cabinet telemetry:
   - **Per-module status:** The portal shows each AC/DC module's health status individually. Identify which modules are reporting faults.
   - **AC input voltages:** Check L1, L2, L3 phase voltages. All three should be within 2% of the nominal site voltage (typically 480VAC or 208VAC depending on the site's transformer). A phase imbalance or dropped phase is often a utility issue rather than a cabinet fault.
   - **DC bus voltage:** Should be within the expected range for the connected vehicles' battery voltages (varies widely: 300-920V). An abnormally high DC bus voltage (>950V) indicates an overvoltage event.
   - **Cabinet internal temperature:** Should correlate with coolant temperature (see Cooling Manual). High cabinet temp with a thermal fault is a secondary concern.
3. Check the event history for any concurrent alerts on other Tesla sites served by the same utility substation. A utility event can simultaneously affect multiple sites.
4. Attempt a **remote cabinet restart** from the Tesla Fleet portal (Cabinet Actions → Restart). This resets all module fault latches and re-initializes the power conversion software. Wait 3 minutes and check if the fault clears.

**Step 4.2: On-Site External Inspection**
1. Approach the Power Cabinet. The V3 Power Cabinet has external **LED status indicators** on the front panel (a row of small LEDs, one per AC/DC module):
   - **Green:** Module healthy and operating
   - **Amber:** Module in standby (no current session, or module derated)
   - **Red:** Module faulted
   - **Off:** Module not communicating with cabinet controller

2. Count how many modules are showing red/off. Each module is approximately 50kW. Document the count and photograph the LED row.
3. Inspect the cabinet exterior for any physical damage (vehicle impact, vandalism, water ingress around door seals).
4. Check the cabinet's external ventilation. The V3 uses forced-air cooling for the cabinet interior (separate from the liquid cooling loop). Inspect the intake and exhaust vents on the cabinet sides — ensure they are not blocked by debris, vegetation, or snow.
5. Check the **AC utility disconnect** on the side of the cabinet (a lockable 400A rotary disconnect). Ensure it is fully in the ON position. A partially rotated disconnect (vibrated partially off) can cause intermittent phase loss.

**Step 4.3: AC Utility Power Quality Check**
1. At the site's electrical distribution panel (or the utility transformer secondary if accessible), connect the AC power quality analyzer.
2. Measure all three phase voltages and record:
   - Phase-to-phase voltage (L1-L2, L2-L3, L3-L1)
   - Phase-to-neutral if applicable
   - Phase imbalance percentage
   - Total Harmonic Distortion (THD)
3. Acceptable values for V3 operation: phase imbalance <3%, THD <5%, voltage sag <5% of nominal.
4. If any of these values are out of spec, this is likely the root cause of the `VC-CAB-ACDC` fault. Document the readings and contact the site's utility provider for service. Do not replace internal modules until utility quality is confirmed acceptable — AC input issues will cause repeated module faults.

**Step 4.4: Escalation to Tesla Service**
1. Submit a service request through the Tesla Fleet Operations portal (Service → Power Cabinet Fault → VC-CAB-ACDC).
2. Include in the escalation:
   - Number of modules faulted (from LED inspection)
   - AC utility power quality readings
   - Cabinet telemetry screenshots from the portal
   - Photos of the cabinet exterior and LED indicators
   - Whether a remote restart was attempted and the result
3. Tesla's support team will either remote-diagnose the fault further or schedule a hardware service visit. Module replacement in the V3 typically requires 2 Tesla technicians and 4-8 hours depending on the number of modules being replaced.

### 5. Verification & Testing

**For field technician verification (after Tesla service completes cabinet repair):**

1. Confirm all cabinet module LEDs show green (healthy) status.
2. In the Tesla Fleet Operations portal, verify all 4 stalls on the cabinet show "Available" status with no active faults.
3. Initiate test sessions on all 4 stalls simultaneously (if possible with test vehicles or EV emulators). Verify each stall can receive power.
4. Check the cabinet's power allocation: with 4 vehicles all requesting maximum charge, the 350kW cabinet should divide power dynamically. The Fleet portal shows real-time per-stall power delivery.
5. Verify the cabinet delivers the correct maximum power to a single vehicle when others are at low charge state (vehicle requesting maximum should receive up to 250kW).
6. Run a 30-minute multi-vehicle load test. Monitor for any new `VC-CAB-ACDC` events and for temperature alarms.
7. After the test, verify the AC power quality readings at the distribution panel are still within spec under the combined charging load.
8. Log the service completion in the Tesla Fleet Operations portal, noting the modules replaced, their part serial numbers, and the test results.
