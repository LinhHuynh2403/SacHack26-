# Tritium Veefil-RT 50kW DC Fast Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Screen / HMI
**Target Part:** IP65 Sealed HMI Front Panel Assembly
**Expected Error Code:** `TR-UI-HMI`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

**Tritium Veefil-RT HMI Design:**

The Veefil-RT's user interface is notably different from other chargers in this manual series. Rather than a standalone display panel, the Veefil-RT uses an **integrated HMI assembly** that is part of the IP65 sealed front panel. The entire front panel is sealed as a unit — the display, touch input, and status indicators are all behind a continuous sealed glass or polycarbonate front face. There is no separate display module that can be swapped independently of the front panel seal.

**HMI components:**
- **7-inch color LCD display** (some earlier Veefil-RT revisions use a 4.3-inch display)
- **Resistive or capacitive touchscreen** (varies by hardware revision — resistive is more common on early units, capacitive on late units)
- **Status LED ring** around the front panel perimeter
- **RFID/NFC reader window** integrated into the front face below the display
- **Physical navigation buttons** (on some revisions — 4 soft-key buttons below the display)
- All enclosed in a **continuous IP65 polycarbonate front panel with silicone gasket sealing**

**Error `TR-UI-HMI` is triggered when:**
- The main controller loses communication with the display (SPI or I2C bus timeout)
- The touchscreen controller reports a failure at power-on self-test
- The front panel LED ring driver fails

**Critical service note:** Because the Veefil-RT's HMI is integrated into the IP65-sealed front panel, **replacing the display requires replacing the entire front panel assembly as a unit and re-sealing the enclosure.** This is a more complex procedure than replacing a plug-in display on the ABB Terra 54 or the ChargePoint CT4000. Always confirm the replacement part is available from Exicom before dispatching.

**Operational impact:** A failed HMI display does NOT prevent charging. The Veefil-RT can initiate and complete sessions via:
- RFID card tap (even with the screen off, the RFID reader still operates for most Veefil-RT firmware versions)
- Remote session start from the MyTritium portal (the CPO can start a session remotely without any user interaction at the charger)
- Mobile app (if the CPO has enabled app-start sessions)
This makes `TR-UI-HMI` a **medium-priority** fault — schedule repair without disrupting site availability.

**Common causes:**

| Cause | Notes |
|-------|-------|
| Display cable loosened inside sealed enclosure | Most common — thermal cycling can work connectors loose over time |
| UV-degraded polycarbonate front panel | Display appears dim or yellowed — cosmetic but affects usability in bright sunlight |
| Water intrusion behind front panel seal | Leads to display condensation and eventual display failure |
| Display backlight LED aging | Gradual dimming over 3-5 years in direct sunlight installations |
| Touch controller hardware failure | Touch input fails while display image is fine |
| Front panel impact damage | Physical crack or shattering of the front panel face |

### 2. Safety Precautions (CRITICAL)

> [!CAUTION]
> **Replacing the Veefil-RT front panel assembly requires opening the sealed main enclosure, which ALSO exposes the high-voltage power section. Full LOTO and coolant drain are ALWAYS required for HMI repair work on the Veefil-RT.**
>
> There is no separate low-voltage access panel for the display on the Veefil-RT — the entire front face is part of the sealed unit.

**LOTO procedure:**
1. Power down via front panel (if accessible) or MyTritium portal remote shutdown.
2. Lock out the upstream AC breaker. Apply padlock and DANGER tag.
3. Turn the internal DC isolator to OFF (rear lower access panel).
4. Wait **7 minutes** for capacitor discharge.
5. Verify 0V DC at bus test points.
6. Drain coolant before opening main enclosure.

> [!WARNING]
> **The IP65 front panel seal must be fully intact after reassembly.** The Veefil-RT is often installed in outdoor environments with direct rain exposure. A compromised IP65 seal will allow water ingress into the power electronics section, leading to insulation faults, corrosion, and potentially lethal conditions. After any front panel work, perform an IP rating verification (see Section 5).

**PPE:** Class 0 insulating gloves (1000V), safety glasses, nitrile gloves for coolant work, arc-rated clothing (8 cal/cm²).

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Allen key (hex) set | Metric 4mm, 5mm, 6mm | All Veefil-RT fasteners — NO Torx used |
| Plastic pry tools | Non-metallic spudger set | Separating front panel from chassis without damaging the IP65 gasket |
| Digital multimeter | CAT III 1000V rated | LOTO verification, display power supply check |
| Torque wrench | 0-10 Nm, 1/4" drive | Front panel perimeter bolts (exact torque critical for IP65 seal) |
| Coolant drain kit | 3-liter container | Draining before enclosure access |
| Replacement Veefil-RT front panel assembly | Exicom part — specify hardware revision (check nameplate) | Full panel swap |
| Replacement IP65 gasket | Specific to Veefil-RT front panel | New gasket required for re-sealing after panel replacement |
| Isopropyl alcohol + lint-free cloth | 90%+ IPA | Cleaning gasket mating surfaces before reassembly |
| IP65 seal test kit (spray test, optional) | Low-pressure water spray | Verifying IP65 seal after reassembly |
| Silicone touch-up sealant (optional) | Clear, UV-resistant, compatible with Veefil-RT housing material | Filling minor gasket gaps if needed |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote and Initial Triage**
1. Log into the MyTritium portal. Confirm `TR-UI-HMI` is active.
2. Attempt a remote restart from the portal. A controller reboot also re-initializes the display communication bus — approximately 25% of `TR-UI-HMI` faults clear on reboot.
3. Review the fault history. If `TR-UI-HMI` has recurred multiple times over weeks with reboots resolving it temporarily, the display cable connection is likely intermittent due to thermal cycling — schedule a physical repair.

**Step 4.2: On-Site Visual Assessment (No LOTO Required for External)**
1. Inspect the front panel from outside:
   - Is the display completely dark (no backlight) or showing a corrupted/frozen image?
   - Is the polycarbonate front face cracked, cratered from impact, or showing UV yellowing?
   - Are there any water stains or condensation visible between the front panel and the display (liquid ingress behind the panel)?
   - Is the status LED ring completely off, partially lit, or wrong color?
2. Try touching the display. On capacitive touch models, the touch should register with a visual cursor or response. On resistive touch models, apply gentle pressure — it requires a small amount of force.
3. If the display is showing a frozen image (not responding to touch and not updating the time/session display), this is a controller software hang — try the physical reset button first.

**Step 4.3: LOTO and Coolant Drain**
1. Perform full LOTO (see Section 2). Wait 7 minutes. Verify 0V DC.
2. Drain the coolant per the Cooling Manual procedure (drain cock at the base, collect 1.5-2.5 liters).

**Step 4.4: Access the Front Panel Assembly**
1. The Veefil-RT front panel is secured by **M6 Allen key perimeter bolts** around the full perimeter of the front face. These are typically 16-24 bolts depending on the unit revision.
2. Remove all perimeter bolts. Keep them in order (note which position each bolt came from — some installations use different-length bolts in different positions based on the panel geometry).
3. With all bolts removed, the front panel is held only by the IP65 gasket compression. Gently insert the plastic pry tool between the front panel and the chassis at one corner. Work around the perimeter slowly, breaking the gasket adhesion. Do NOT use metal tools — they will cut the gasket.
4. Once the gasket seal is broken, the front panel will swing open (it is typically hinged on one side, or it may be fully removable — check the hardware manual supplement for your specific unit).

**Step 4.5: Internal Connection Inspection**
1. With the front panel open, locate the cables connecting the HMI assembly to the main controller:
   - **Display data cable:** A flat flex cable (FFC) or a round MIPI/LVDS ribbon cable from the display to the controller PCB
   - **Touchscreen USB cable:** USB-A to Micro-B or a dedicated USB cable from the touchscreen controller to the main PCB
   - **LED ring cable:** Multi-pin cable from the LED ring driver to the main controller
   - **RFID reader cable:** USB or I2C cable from the RFID module to the main controller
2. Check each connector at both ends. The FFC connectors have ZIF (Zero Insertion Force) locks — verify the brown locking bar is fully closed (locked position = down).
3. Disconnect and firmly reconnect each connector.
4. Inspect cables for pinch damage from the gasket compression over years of use.

**Step 4.6: Display Power Supply Check**
1. Using the multimeter (with LOTO removed temporarily for this controlled test), measure the 5V and 12V supply rails at the display power connector:
   - 5V rail (display logic): expect 4.8-5.2V
   - 12V rail (backlight): expect 11.5-12.5V
2. If either supply is absent, trace back to the relevant power supply on the main controller. A missing 12V backlight supply is a common cause of a "dark but functioning" display.
3. Re-apply LOTO before continuing physical work.

**Step 4.7: Full Front Panel Replacement**
1. Disconnect ALL cables from the old front panel assembly (display FFC, touchscreen USB, LED ring, RFID, buttons if present).
2. Remove the front panel assembly. If it is hinged, lift it clear of the hinge pins.
3. Prepare the chassis gasket mating surface: clean thoroughly with IPA on a lint-free cloth. Remove all old gasket material, adhesive residue, and debris. The surface must be perfectly clean and dry for the new gasket to seal properly.
4. Install the new front panel assembly onto the hinge pins (or align it with the mounting holes).
5. Connect all cables to the new panel. Verify each connector is fully seated and locked.
6. Place the new IP65 gasket around the full perimeter of the front panel mounting surface. The gasket has a specific orientation — verify the corners align with the chassis corners.
7. Bring the front panel into the closed position, compressing the gasket evenly.
8. Install all perimeter bolts by hand first (finger-tight, all bolts in), then torque in a cross pattern to **4 Nm**. Torque evenly — uneven torque will create areas where the gasket is not fully compressed, creating water ingress paths.

### 5. Verification & Testing

1. **IP65 Seal Verification (Critical):** Before refilling coolant and restoring power, perform a water spray test on the front panel seam. Use a garden hose with a gentle shower head (not a jet stream) or an IP65 spray test nozzle. Apply water around the full perimeter of the front panel seal for at least 3 minutes. Then open the front panel and inspect inside — there should be NO water ingress at any point. If water is present, re-torque the affected bolts or investigate gasket alignment.
2. Refill the coolant loop. Purge air per the Cooling Manual procedure.
3. Remove LOTO. Restore the upstream AC breaker.
4. Allow the Veefil-RT to boot (approximately 90 seconds).
5. Verify the new display shows the normal boot screen and transitions to the idle screen (showing "Available" or "Ready" status).
6. Test touchscreen responsiveness across the full display surface — tap all four corners and center.
7. Test the RFID reader by tapping an RFID card at the reader window. The display should respond immediately.
8. In the MyTritium portal, verify `TR-UI-HMI` has cleared.
9. Test the LED ring status light — it should show the correct color for the charger's current state (available = typically green or blue on the Veefil-RT).
10. Initiate a full test charging session and verify the display correctly shows each stage (authentication, plug-in prompt, charging, session summary).
11. After 30 minutes of operation, re-inspect the front panel gasket seal — thermal cycling during normal operation can reveal slow seeps that are not apparent immediately after reassembly.
12. Log the repair: note the root cause, front panel revision numbers (old and new), IP65 seal test result, and coolant volumes.
