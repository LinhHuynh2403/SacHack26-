# Tesla Supercharger V3 (250kW)
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Pedestal
**Target Part:** Stall Pedestal — Status LED Assembly and Pedestal Integrity
**Expected Error Code:** `VC-PED-LED`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

**Stall Pedestal Overview:**

Each Tesla Supercharger V3 stall is served by a **stall pedestal** — a slender aluminum extrusion column approximately 1.2m tall and 15cm × 10cm in cross-section. The pedestal houses:
- The NACS cable holster and cable entry point (cable routes through the pedestal to underground conduit leading to the Power Cabinet)
- The **status LED assembly** — an illuminated ring or strip at the top of the pedestal that communicates charging status visually
- A CAN bus connection to the Power Cabinet
- A minimal amount of stall-local electronics (connector temperature monitoring, cable management)

**LED status light meaning:**
| LED state | Meaning |
|-----------|---------|
| **Blue pulsing** | Ready — vehicle can connect |
| **Green solid** | Charging actively in progress |
| **Blue rapid flash** | Vehicle connected, waiting for authentication or BMS negotiation |
| **White** | Standby / no vehicle |
| **Red** | Fault — stall out of service |
| **Off** | Power fault or LED assembly failure |

**Error `VC-PED-LED` is generated when** the stall controller detects that the LED driver has not responded to the last status update command for >60 seconds. This is typically a low-priority fault — the stall can continue to charge vehicles even with a non-functional LED. The primary user impact is that drivers cannot visually confirm a stall's status from a distance.

**Common causes:**

| Cause | Notes |
|-------|-------|
| LED driver PCB failure (thermal fatigue) | Most common — the driver is exposed to wide temperature cycling in the pedestal |
| LED strip failure (individual LEDs burned out) | Causes partial or fully dark LED ring |
| LED cable connector loosened (vibration or vehicle impact) | Connector between LED strip and driver PCB |
| Vandalism — LED ring physically damaged | Impact cracks the polycarbonate diffuser |
| Pedestal tilt or structural damage | Accompanying alert alongside `VC-PED-LED` |

**Important:** Always check whether a concurrent `VC-CAN-BS` or power fault is present when `VC-PED-LED` appears. A stall that has lost CAN communication will also lose LED control — fix the CAN issue first, as the LEDs will recover automatically.

### 2. Safety Precautions

> [!NOTE]
> The LED assembly operates at **12V or 24V DC** (low voltage, not hazardous). However, **accessing the LED assembly requires opening the stall pedestal**, which also provides access to the DC busway connection (high voltage). Full LOTO is required before opening the pedestal.

**Exception: External LED inspection** (viewing the LED ring, checking for cracked diffuser, noting LED behavior) can be done without LOTO since the pedestal does not need to be opened.

**LOTO procedure:** Lock out the Power Cabinet 400A 3-phase AC disconnect. Wait 10 minutes. Verify 0V DC at the busway test points before working inside the pedestal.

**PPE:** Safety glasses, Class 0 insulating gloves when inside the pedestal (near DC busway), ESD precautions for LED PCB handling.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Tesla T20 and T25 security Torx drivers | Tesla service driver set | Pedestal panel fasteners |
| Flat-head screwdriver | 3mm | Releasing LED cable connector clips |
| Digital multimeter | CAT III 1000V rated | LOTO verification, 12V/24V LED supply voltage check |
| Infrared thermometer | -20°C to 200°C | Checking LED driver operating temperature |
| Replacement LED ring assembly | Tesla V3 stall part | Full LED assembly replacement |
| Replacement LED driver PCB | Tesla V3 stall part | Driver-only replacement if LED strip is intact |
| Clear polycarbonate adhesive (optional) | UV-resistant type | If diffuser is cracked but not shattered |
| Camera / smartphone | Documentation | Photographing LED failure mode |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage — Tesla Fleet Operations Portal**
1. Log into the Fleet portal. Confirm `VC-PED-LED` is the active fault. Verify no concurrent CAN or power faults.
2. Check the last time the LED status changed in the telemetry. If it was synchronized with the last power cycling event (suggesting the LED was fine before a recent fault/reboot), a software hang on the LED driver is suspected.
3. Attempt a remote restart of the stall (Stall Actions → Restart in the Fleet portal). The LED driver firmware reboots with the stall controller. If the LED comes back on, the fault was a software hang.
4. If the LED does not respond after a remote restart, physical inspection is required.

**Step 4.2: On-Site Visual Inspection (No LOTO Required)**
1. Approach the pedestal and observe the LED ring at the top of the stall:
   - **Completely dark:** LED strip, driver, or power supply fault
   - **Partially lit (some segments dark):** Individual LED segment failure
   - **Wrong color for the session state:** LED driver firmware issue or color channel failure
   - **Flickering:** Poor connector or LED strip connection
2. Inspect the LED ring diffuser (the polycarbonate lens covering the LED strip). Look for:
   - Cracks or chips (vehicle impact)
   - UV yellowing (reduces brightness after years of exposure — cosmetic only)
   - Condensation inside the diffuser (water intrusion from a cracked seal)
3. Check whether the pedestal itself is plumb. A noticeably tilted pedestal may have been hit, potentially damaging the internal cable connections.

**Step 4.3: LOTO and Pedestal Access**
1. Lock out the Power Cabinet 3-phase AC disconnect. Wait 10 minutes. Verify 0V DC.
2. Open the stall pedestal: 4x Tesla T25 Torx fasteners on the pedestal's rear or side access panel (varies by V3 installation vintage — some have a full-length rear panel, others have a small upper access panel).
3. Attach ESD wrist strap to the bare metal chassis inside the pedestal.

**Step 4.4: Check LED Power Supply**
1. Locate the LED driver PCB inside the pedestal (typically a small PCB approximately 8cm × 5cm, mounted at the upper section of the pedestal near the LED ring).
2. Check the LED supply voltage:
   - Find the input power connector to the LED driver PCB (2-pin connector from the stall's 12V or 24V auxiliary bus).
   - Remove LOTO temporarily for a controlled voltage check (exercise extreme caution — work only on the low-voltage sections, away from the DC busway).
   - Measure voltage at the LED driver's input connector: expect 12V ± 0.5V or 24V ± 1V depending on your V3 stall variant.
   - If 0V: the auxiliary bus powering the LED driver has failed — this is a stall PCB issue, not an LED issue. Escalate to Tesla service.
   - If correct voltage is present: proceed with LED assembly inspection.
   - Re-apply LOTO before continuing physical work.

**Step 4.5: Inspect LED Connections**
1. Trace the cable from the LED driver PCB to the LED ring/strip. On V3 pedestals, this is a 3-pin or 4-pin JST connector (power + data/PWM signal).
2. Check the connector at both ends — press firmly to reseat.
3. Inspect the LED cable for damage: the cable routes around the inside perimeter of the pedestal top section and may have been pinched when the diffuser bezel was previously removed.

**Step 4.6: LED Assembly Replacement**
1. **LED strip only (if driver PCB is healthy):**
   - Remove the diffuser bezel: it is secured by 3 Phillips M2 screws and a snap-fit. Release the snaps with a flat pry tool.
   - The LED strip is an adhesive-backed flexible PCB attached around the inside perimeter of the diffuser ring. Peel the old strip off.
   - Clean the mounting surface with IPA.
   - Adhere the new LED strip, aligning the start/end point with the driver PCB connector location.
   - Connect the LED strip to the driver PCB connector.
   - Replace the diffuser bezel and snap it closed.

2. **LED driver PCB replacement:**
   - Disconnect all connectors from the old driver PCB.
   - Remove the 2x M3 mounting screws.
   - Install the replacement driver PCB. Connect power, LED strip, and CAN/control connectors.
   - The replacement driver PCB does NOT require programming — it reads its configuration from the stall controller on first boot.

3. **Full assembly replacement (LED ring, driver, and diffuser as one unit):**
   - Remove the diffuser bezel.
   - Disconnect all connectors from the driver PCB.
   - Remove the mounting screws.
   - Install the new assembly.
   - Connect all connectors.
   - Re-install the diffuser bezel.

### 5. Verification & Testing

1. Remove LOTO. Restore the Power Cabinet 3-phase AC disconnect.
2. Allow the V3 system to boot.
3. Observe the LED ring. It should illuminate in the correct "Ready" state (blue pulsing) within 30 seconds of power on.
4. Verify the color and pattern match the stall's actual state (Ready = blue pulsing, no vehicle connected).
5. In the Tesla Fleet Operations portal, confirm `VC-PED-LED` has cleared from active alerts.
6. Run a test session: plug in a test vehicle. The LED should transition from blue-pulsing (ready) to blue rapid flash (negotiating) to green solid (charging) as the session progresses.
7. End the session: the LED should return to blue pulsing (ready) within 30 seconds of unplug.
8. Test the LED visibility at night or in low-light conditions if the repair was done during the day — ensure the new LED assembly is bright enough to be visible from the parking lot approach.
9. Check the diffuser bezel seal for any gaps that could allow water ingress. Apply a thin bead of clear silicone sealant if any gaps are noted.
10. Log the repair: note whether the root cause was LED strip, driver PCB, or cable connector, and document the part serial numbers replaced.
