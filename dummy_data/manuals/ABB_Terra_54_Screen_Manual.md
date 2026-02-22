# ABB Terra 54 DC Fast Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Screen / HMI
**Target Part:** 15-inch Capacitive Touchscreen Display Assembly
**Expected Error Code:** `ERR-HMI-BLK`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The ABB Terra 54 uses a 15-inch capacitive touchscreen as its primary Human-Machine Interface (HMI). The display runs a custom Linux-based UI (ABB HMI OS) and communicates with the main controller via LVDS (Low-Voltage Differential Signaling) for video and USB for touch input.

**Error code `ERR-HMI-BLK` ("HMI Blackout") is triggered when:**
- The main controller cannot communicate with the HMI display for more than 30 seconds
- The display backlight fails (screen is "on" but shows no image)
- The touchscreen USB device is no longer detected by the controller

**Failure modes and distinguishing symptoms:**

| Symptom | Most Likely Cause |
|---------|------------------|
| Screen completely black, no backlight glow | Backlight inverter failure or power supply to display |
| Screen shows partial image or flickering | Damaged or loose LVDS cable |
| Screen shows image but touch does not respond | USB touch controller failure or loose USB cable |
| Screen image "frozen" — displays last frame indefinitely | HMI OS kernel hang — requires software reboot |
| Screen shows static/noise pattern | LVDS signal integrity issue — cable or connector |
| Screen works, but wrong resolution or aspect ratio | LVDS cable resolution pin mismatch (wrong replacement cable) |

**Important distinction:** `ERR-HMI-BLK` can sometimes be caused by a software hang rather than hardware failure. A remote reboot resolves approximately 30% of reported HMI faults. Always attempt remote reboot first.

**Driver impact:** A faulted HMI screen prevents drivers from initiating charging sessions (they cannot select payment method or confirm start). The charger's RFID reader still functions — RFID-authenticated users with pre-set payment methods can still charge via tap-to-start.

### 2. Safety Precautions

> [!NOTE]
> The HMI display assembly is a **low-voltage subsystem** (12V DC for display power, 5V DC for USB). The display is located in the upper front section of the cabinet, physically isolated from the high-voltage power section by a metal divider plate.
>
> For display replacement work, **full LOTO of the charger is required** because accessing the display from inside the cabinet requires removing the front panel, which exposes the high-voltage power section in close proximity.

> [!CAUTION]
> **De-energize and perform LOTO before opening the main cabinet.**
> Wait 5 minutes after LOTO for DC bus capacitors to discharge.
> Verify 0V DC at bus test points TB-DC+ and TB-DC- before working near the power section.

> [!WARNING]
> **Display glass hazard.** If the touchscreen glass is cracked or shattered, wear cut-resistant gloves when handling. Glass fragments can be extremely sharp. Wrap damaged display in bubble wrap before disposal.

**PPE:** Class 0 insulating gloves, safety glasses, cut-resistant inner gloves if screen is physically damaged.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Security Torx drivers | T25, T30 | Cabinet panel fasteners |
| Phillips #2 screwdriver | Standard | HMI display mounting screws (4x M4 Phillips) |
| Flat plastic pry tool | Non-metallic, spudger type | Releasing display bezel clips without scratching |
| Digital multimeter | CAT III rated | Verifying 0V on DC bus before work, checking 12V display power supply |
| Replacement LVDS cable | ABB part — verify exact length and connector type for your hardware revision | Video signal cable |
| Replacement display assembly | ABB-sourced 15" capacitive touch assembly | Full screen replacement |
| USB bootable drive (optional) | Pre-loaded with ABB HMI OS recovery image | For HMI OS reflash if software is corrupted |
| Laptop (optional) | For SSH into HMI Linux OS via Ethernet | Advanced software diagnostics |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Software Triage**
1. Log into ABB Ability and attempt a remote reboot. Wait 3 minutes for the full boot sequence.
2. If the unit comes back online and `ERR-HMI-BLK` clears, the fault was a software hang. Monitor for recurrence — if the screen hangs more than twice per week, schedule a hardware inspection (early sign of memory or storage failure in the HMI computer).
3. If the charger is offline entirely (no network), the remote reboot is not possible. Proceed to on-site.

**Step 4.2: On-Site Visual Inspection (Before Opening Cabinet)**
1. Look at the screen. Categorize the failure mode using the table in Section 1.
2. Shine a flashlight at an angle across the screen surface. If you can faintly see the UI image but the backlight is off, this confirms a backlight/power failure rather than an LVDS or software issue.
3. Try touching the screen in multiple locations. If the backlight is on but touch is unresponsive, note this — it points to the USB touch controller.
4. Press and hold the charger's physical "Reset" button (behind a small access hole on the right side of the bezel, accessible with a straightened paperclip) for 10 seconds. This performs a hardware HMI reset without requiring cabinet access.

**Step 4.3: De-Energize and Open Cabinet**
1. Power down via front panel (Settings → Shutdown → Confirm) or the ABB Ability remote shutdown.
2. Lock out the upstream AC breaker and the internal DC disconnect. Apply LOTO tags.
3. Wait 5 minutes. Verify 0V DC at TB-DC+ and TB-DC-.
4. Remove the front panel: 4x T30 Security Torx on top, 2x T30 on each side.

**Step 4.4: Check Display Power Supply**
1. Locate the 12V DC display power supply (a small DIN-rail mounted converter on the left side of the cabinet's upper section, labeled PSU-HMI).
2. Verify the incoming 24VAC feed to PSU-HMI is connected. If the charger was running, the 24VAC bus should have been powered — but PSU-HMI fuses can blow independently.
3. With LOTO removed and power ON (carefully, in a controlled test), measure the PSU-HMI output: should be 12.0V ± 0.3V. If output is 0V or below 10V, replace PSU-HMI before replacing the display.
4. Re-apply LOTO before continuing with display work.

**Step 4.5: LVDS Cable Inspection**
1. Trace the LVDS cable from the main controller board (gray 30-pin ZIF connector, labeled J-LVDS) to the back of the display.
2. Inspect the cable for sharp bends, creases, or pinching points. LVDS cables are flat ribbon style and are sensitive to being folded.
3. At each end, verify the ZIF (Zero Insertion Force) connector is fully latched. The brown locking bar should be in the "locked" (down) position. If it's up, the cable is not making full contact.
4. Unlatch both ends, remove the LVDS cable, and re-seat it. Press the locking bar down firmly until it clicks on both ends.
5. If the cable shows any visible damage, replace it.

**Step 4.6: USB Touch Cable Inspection**
1. Locate the USB cable from the display's touchscreen controller to the main controller board (standard USB-A to Micro-B, labeled J-TOUCH).
2. Verify both ends are fully seated. Disconnect and reconnect each end.
3. Inspect the cable for damage. Replace if the outer jacket is cracked or if pins are bent.

**Step 4.7: Full Display Replacement**
1. Remove the display bezel. The bezel clips into the front panel frame — use the plastic pry tool to release the clips starting from a corner, working around the perimeter. Do not force — the clips release with about 1kg of lateral pressure.
2. With the bezel removed, access the 4x M4 Phillips screws at the corners of the display mounting bracket.
3. Support the display with one hand while removing the last screw — the display will be free and heavy (approx. 1.5 kg).
4. Disconnect the LVDS cable, USB cable, and 12V power connector (2-pin Molex, polarized).
5. Mount the replacement display in reverse order. Reconnect the 12V power (Molex, keyed — only connects one way), USB cable, and LVDS cable.
6. Torque the 4x mounting screws to 2.0 Nm. Do not over-tighten — the display bezel is plastic.
7. Re-clip the bezel starting from the top center and working outward. Press firmly until all clips click.

### 5. Verification & Testing

1. Remove LOTO, close the upstream AC breaker.
2. Power on the charger. The display should light up within 15 seconds showing the ABB boot screen, then transition to the home screen (approximately 75 seconds total boot time).
3. Test touch responsiveness by tapping all four corners and the center of the screen. All touch inputs should register immediately with no lag or dead zones.
4. Swipe across the screen to test multi-point gesture recognition (used for certain admin menu navigation).
5. Verify `ERR-HMI-BLK` has cleared in ABB Ability.
6. Test a full charging session initiation via the touchscreen: select language → select payment method → follow prompts. Verify the screen progresses correctly through each step.
7. Verify RFID payment also works (tap an RFID card against the reader and confirm the screen responds appropriately — even though the HMI was the issue, it's good practice to confirm the full payment subsystem is healthy after a cabinet-open service call).
8. Reinstall the front panel (4x T30 top, 2x T30 sides).
9. Log repair in ABB Ability: note failure mode (software hang / LVDS cable / display assembly / PSU-HMI), parts replaced, and part serial numbers.
