# ChargePoint CT4000 Series Level 2 Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Payment / Authentication
**Target Part:** RFID/NFC Authentication Board
**Expected Error Code:** `CP-ERR-RFID`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The ChargePoint CT4000 uses a combined RFID/NFC reader module to authenticate charging sessions. The reader supports:
- **ChargePoint RFID cards** (ISO 14443-A, 13.56 MHz)
- **NFC-enabled smartphones** via the ChargePoint mobile app
- **Third-party RFID credentials** via roaming (Blink, EVgo, etc.) using the ChargePoint network backend

The reader module is mounted behind the front face panel, directly beneath the ChargePoint logo. It communicates with the main control board via a USB HID interface.

**Error `CP-ERR-RFID` is reported to the ChargePoint cloud dashboard** and logged locally when:
- The reader module is no longer detected on the USB bus (hardware failure or loose cable)
- The reader returns consecutive failed reads for >60 seconds during an active session attempt
- The reader's onboard firmware reports a self-test failure at boot

**Impact:** When RFID authentication is unavailable, drivers **cannot start a session**. The ChargePoint app will show the station as "Authentication Unavailable." However, if the site has configured **autostart** (automatically starts charging when a cable is plugged in, no auth required), sessions can still be initiated. Check the site's authentication policy in the ChargePoint dashboard before treating this as a full station outage.

**Common causes:**

| Cause | Frequency | Resolution |
|-------|-----------|-----------|
| Loose USB cable from reader to control board | Very common (vibration) | Reseat cable |
| Reader firmware crash | Common | Power cycle |
| Water intrusion into reader module | Occasional (CT4000 is IP54 rated, not sealed) | Replace reader |
| Reader board hardware failure | Rare | Replace reader |
| ChargePoint network authentication outage | Rare | Contact ChargePoint NOC |

### 2. Safety Precautions

> [!NOTE]
> The ChargePoint CT4000 is a **Level 2 AC charger** operating at 208/240VAC, 30A maximum. Unlike DC fast chargers, there are no high-voltage DC capacitors. The maximum voltage present inside the cabinet is **240VAC**.
>
> **LOTO is still required** before opening the cabinet, as 240VAC is lethal. Lock out the upstream 30A or 50A circuit breaker at the electrical panel feeding this charger.
>
> The RFID reader itself is 5V DC (USB powered) and poses no shock hazard. However, you must still de-energize the unit before opening the cabinet because the AC power terminals and contactor are in close proximity.

**LOTO procedure for CT4000:**
1. Locate the upstream breaker at the electrical panel (typically a dedicated 30A or 50A 240VAC breaker).
2. Turn the breaker to OFF. Apply your personal padlock. Tag with "DANGER — DO NOT ENERGIZE."
3. Verify the charger front panel display goes dark (no backlight) — this confirms the unit is de-energized.
4. The CT4000 has no capacitors that require a discharge wait period. You may open the cabinet immediately after LOTO.

**PPE:** Safety glasses, standard electrical insulating gloves (Class 00, rated 500V). No arc flash PPE required for 240VAC Level 2 work per NFPA 70E guidelines at this voltage level.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Phillips #2 screwdriver | Standard | Cabinet back panel access screws (4x Phillips M4) |
| Flat-head screwdriver | 3mm | Prying open cable connector clips |
| Digital multimeter | CAT II 300V minimum | Verifying LOTO, checking 5V USB supply |
| Replacement RFID/NFC reader module | ChargePoint part for CT4000 (verify Gen 1 vs Gen 2 hardware revision) | Hardware replacement |
| USB-A extension cable (optional) | 0.5m length | Testing reader outside cabinet before permanent installation |
| Laptop with ChargePoint Dashboard access | For cloud diagnostics and remote reboot | Remote triage |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage via ChargePoint Dashboard**
1. Log into the ChargePoint Operations Portal (dashboard.chargepoint.com). Find the station by name or Station ID (printed on the charger nameplate and on the management label inside the cabinet door).
2. Check the station status. `CP-ERR-RFID` should appear in the Alerts section with a timestamp.
3. Check recent session history. If sessions are still completing (some users may have used the ChargePoint app's cable-plug autostart), the reader may have just failed recently.
4. Attempt a **remote restart** from the ChargePoint dashboard (Actions → Restart Station). Wait 90 seconds and check if the error clears. A firmware crash is cleared by power cycling — this resolves ~30% of RFID faults.
5. If the remote restart fails or the error returns within minutes, dispatch for physical inspection.

**Step 4.2: On-Site Visual Inspection (Before LOTO)**
1. Look at the charger front panel display. An active `CP-ERR-RFID` fault will show on the CT4000's display as "Authentication Unavailable" or "Reader Error."
2. Inspect the RFID reader window (translucent area below the ChargePoint logo). Look for physical damage — cracks, impact marks, water pooling in the recess.
3. Try tapping an RFID card directly on the reader window. If the reader is partially functional, you may see the LED briefly flash.

**Step 4.3: LOTO and Cabinet Access**
1. Lock out the upstream breaker. Apply LOTO.
2. Verify the charger is de-energized (display dark, no LED indicators active).
3. Open the CT4000 cabinet. On pedestal-mount CT4000 units, there are 4x Phillips M4 screws on the rear of the housing. On wall-mount units, the panel is secured by a 2-point key lock (standard CT4000 service key).
4. Allow the interior to air out for 60 seconds if the cabinet has been in direct sun — internal temperatures can reach 50°C on hot days.

**Step 4.4: Inspect the USB Connection**
1. Locate the RFID reader module behind the front face panel. It is a small green PCB approximately 8cm x 5cm, mounted on standoffs directly behind the RFID reader window.
2. Trace the USB-A to USB-B cable from the reader module to the main control board. This cable routes along the left side of the cabinet.
3. Check both ends:
   - **Reader end (USB-B):** The connector should be fully seated. Press it firmly in — there is no locking mechanism, and vibration can back it out ~2-3mm over time.
   - **Control board end (USB-A):** Fully seated in the USB host port on the control board (labeled "RFID" in white text on the PCB).
4. Disconnect and reconnect both ends firmly.
5. If the cable shows any damage (cracked insulation, bent pins), replace it. A standard USB-A to USB-B cable in the correct length (check the routing path — typically 30-40cm) can be used.

**Step 4.5: Check Reader Power**
1. With a multimeter, verify 5V DC between the VBUS and GND pins of the USB connector at the reader end. If 5V is not present, the USB host controller on the main control board may have failed — in this case, the entire control board requires replacement (escalate to ChargePoint Tier 2).
2. If 5V is present but the reader is not working, the reader module itself has failed.

**Step 4.6: Reader Module Replacement**
1. Disconnect the USB cable from the reader.
2. Remove the 2x Phillips M3 screws holding the reader module to its standoffs.
3. Note the orientation of the reader board — the antenna trace (a large rectangular spiral on the PCB top side) must face outward toward the RFID reader window, not inward.
4. Install the replacement reader module. Secure with the 2x M3 screws. Do not overtighten — the PCB is fiberglass and the threads in the standoffs are plastic (max 0.3 Nm).
5. Reconnect the USB cable.

### 5. Verification & Testing

1. Close the cabinet. Remove LOTO. Restore the upstream breaker.
2. Wait for the CT4000 to complete its boot sequence — approximately 45-60 seconds for the full ChargePoint firmware to load.
3. Verify the display shows the normal "Ready" state with the ChargePoint wave animation.
4. Test RFID authentication: tap a ChargePoint RFID card on the reader. The reader LED should flash green and the display should show "Card Recognized — Plug In To Start."
5. Test with the ChargePoint mobile app if available (NFC authentication).
6. Log into the ChargePoint Operations Portal and verify `CP-ERR-RFID` has cleared from the station's active alerts.
7. Initiate a complete test session: authenticate with RFID → plug in the J1772 cable to a test vehicle (or use the EV emulator) → verify session start and energy delivery → end session and verify correct kWh recorded.
8. Log the repair: note the failed component, root cause (loose cable vs. hardware failure), and replacement part serial number in the ChargePoint service record.
