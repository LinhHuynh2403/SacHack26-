# ChargePoint CT4000 Series Level 2 Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Screen / Display
**Target Part:** Monochrome LCD Display Module
**Expected Error Code:** `CP-ERR-LCD`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The ChargePoint CT4000 uses a **small monochrome LCD panel** (approximately 128×64 pixels, STN or FSTN type) to show session status, port availability, basic user prompts, and error messages. Unlike the large touchscreen on the ABB Terra 54, this display is **not touch-enabled** — user interaction is through RFID card tap or the ChargePoint mobile app. The LCD communicates with the main control board via SPI (Serial Peripheral Interface).

The display backlight is a white LED array. The backlight is the most common LCD failure on the CT4000.

**Error `CP-ERR-LCD` is logged when the main controller detects no valid SPI response from the LCD module during the startup display test**, or when the controller is configured to monitor display health and detects a communication timeout.

**Important context:** `CP-ERR-LCD` is a **low-urgency alert** — a non-functional display does **not** prevent charging sessions from being started or completed. Drivers using the ChargePoint mobile app or RFID cards with pre-configured payment can still charge without any display interaction. Dispatch for LCD repair during scheduled maintenance rather than as an emergency, unless the site has a high proportion of walk-up users who rely on the display.

**Failure modes and visual symptoms:**

| Symptom | Probable Cause |
|---------|---------------|
| Completely dark screen (no backlight) | LED backlight array failure or backlight driver on control board |
| Screen lit but blank (no characters) | SPI communication failure — loose connector or LCD controller chip failure |
| Screen shows partial rows of pixels | Flex cable connection issue |
| Screen shows correct content but very faint | LCD contrast setting needs adjustment (software) or LCD temperature compensation drifting |
| Screen shows correct content but backlight flickers | Failing LED driver or oxidized LED contacts |
| Screen frozen on last content displayed | Control board not refreshing display — software hang on CT4000 controller |

### 2. Safety Precautions

> [!NOTE]
> The LCD display is a low-voltage component (5V logic, 12V backlight). However, **full LOTO is required** to open the CT4000 cabinet because 240VAC power wiring is exposed inside the cabinet.

**LOTO procedure:** Lock out the upstream 240VAC breaker. Verify 0VAC at contactor input before working inside. No capacitor wait required.

> [!WARNING]
> **LCD fluid hazard (unlikely but possible if display is physically cracked):** The STN LCD contains a small amount of liquid crystal fluid. If the display glass is broken, avoid skin contact and wear nitrile gloves. Liquid crystal fluid is not acutely toxic but should not be ingested or allowed to contact eyes.

**PPE:** Safety glasses, standard work gloves. Nitrile gloves if the display is cracked.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Phillips #2 screwdriver | Standard | Cabinet access and display mounting screws |
| Flat plastic pry tool | Non-metallic spudger | Releasing display bezel from front panel |
| Digital multimeter | CAT II 300V minimum | LOTO verification, backlight voltage check |
| Replacement LCD module | ChargePoint CT4000 LCD (verify Gen 1 vs Gen 2 — different connector types) | Full display replacement |
| Isopropyl alcohol + lint-free cloth | 90%+ IPA | Cleaning the display window before reassembly |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote and Software Triage**
1. In the ChargePoint Operations Portal, confirm `CP-ERR-LCD` is the active alert. Verify there are no other concurrent faults (a control board fault can cause secondary LCD errors).
2. Attempt a remote restart. If the CT4000 controller had a software hang that caused it to stop refreshing the display, a reboot resolves it.
3. Review the station's session history. If sessions are completing normally despite the LCD error, confirm the site's user traffic is primarily app/RFID-based and schedule the repair during low-usage hours.

**Step 4.2: Contrast and Configuration Check (Software — No Cabinet Access)**
1. If the screen appears blank but there is visible backlight glow, the issue may be an incorrect contrast setting rather than a hardware failure.
2. From the ChargePoint Operations Portal, navigate to Station Settings → Display → Contrast Level.
3. Adjust the contrast level in 5% increments (most CT4000s default to 60% contrast). Extreme cold temperatures (-20°C and below) can make an STN LCD appear blank unless contrast is set to 70-80%.
4. If a contrast adjustment resolves the issue, log the adjustment and note the ambient temperature — re-adjust seasonally if the site experiences extreme temperature swings.

**Step 4.3: LOTO and Cabinet Access**
1. Lock out the upstream breaker. Verify 0VAC at the contactor.
2. Open the CT4000 cabinet rear panel.
3. The LCD module is mounted on the inside of the front face panel, directly behind the display window in the front bezel.

**Step 4.4: Inspect Display Connections**
1. Locate the LCD module. It is connected to the main control board via a flat flex cable (FFC) — a thin plastic ribbon cable with gold-plated traces. The FFC is typically 10-16 conductors wide and approximately 100-150mm long.
2. Check the FFC at both ends:
   - **LCD end:** The FFC plugs into a ZIF connector on the LCD module board. The brown locking bar must be in the locked position. If it's open (raised), the FFC is not making contact. Close it firmly.
   - **Control board end:** Same ZIF connector. Check and reseat the locking bar.
3. Check for any damage to the FFC (creases, tears, or conductive traces visible through the plastic). A damaged FFC must be replaced — do not attempt to repair with tape.
4. Also check the backlight power connector. The backlight LED array typically has a separate 2-pin JST or Molex connector carrying 12V. Ensure it is seated firmly.

**Step 4.5: Check Backlight Voltage**
1. With LOTO removed and the charger powered on (control test — use caution), carefully measure voltage at the backlight connector: expect **11-13V DC**. If 0V, the 12V power supply or the backlight driver circuit on the control board has failed — the control board may need replacement.
2. Re-apply LOTO before continuing with physical work.

**Step 4.6: LCD Module Replacement**
1. The LCD module is mounted to the front panel with 4x Phillips M2 or M3 screws (depending on hardware revision — check by looking at the screw head size).
2. Remove the 4 mounting screws while supporting the module from behind.
3. Disconnect the FFC (open the ZIF locking bar, then slide the FFC out) and the backlight power connector.
4. Inspect the display window in the front bezel. Clean the inside of the window with IPA on a lint-free cloth — fingerprints and dust on the inside of the window can make even a good LCD appear dim.
5. Mount the replacement LCD module. Confirm the module orientation — the display should be right-side-up relative to the front bezel (check the sample image in the ChargePoint service bulletin for your specific CT4000 generation).
6. Connect the FFC: slide the ribbon into the ZIF connector with the gold contacts facing down. Close the locking bar firmly.
7. Connect the backlight power connector.
8. Secure the 4 mounting screws. Torque to 0.2 Nm for M2 screws or 0.3 Nm for M3 — LCD mounting screws are very small and strip easily.

### 5. Verification & Testing

1. Remove LOTO. Restore the upstream breaker.
2. Allow the CT4000 to boot. The display should show the ChargePoint startup logo within 5 seconds of power on, then transition to the "Ready" screen.
3. Verify display contrast: content should be clearly readable in direct sunlight. If the contrast is too low or too high, adjust via the ChargePoint Operations Portal (Station Settings → Display → Contrast Level).
4. Test the display's response to a session: authenticate with an RFID card and verify the display shows "Card Recognized — Please Plug In."
5. Initiate a test session and confirm the display updates to show "Charging — [Port #]" with the session timer/energy delivered.
6. End the session and confirm the display returns to the "Ready" state.
7. Verify `CP-ERR-LCD` has cleared from the ChargePoint Operations Portal active alerts.
8. Clean the exterior face of the display window with a soft microfiber cloth (do not use solvents on the exterior — can cloud the polycarbonate window).
9. Log the repair: note the failure mode (backlight, FFC, full LCD module), root cause, and replacement part.
