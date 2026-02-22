# ChargePoint CT4000 Series Level 2 Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Cable
**Target Part:** J1772 Charging Cable and Retractor Mechanism
**Expected Error Code:** `CP-ERR-RET`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The ChargePoint CT4000 uses a **J1772 (SAE J1772) AC Level 2 charging cable** — a single-phase or split-phase AC connector rated for up to 32A continuous at 240VAC (7.68kW per port). Unlike DC fast charger cables, the CT4000's J1772 cable is air-cooled and un-tethered from any liquid cooling system. This makes replacement significantly simpler.

The CT4000 has a **spring-loaded cable retractor** that automatically retracts the cable when not in use, keeping the cable off the ground and reducing tripping hazards. A retractor failure causes the cable to hang loose or, in the case of an over-tensioned retractor, creates excessive strain on the connector.

**Error `CP-ERR-RET` is triggered when:**
- The cable position sensor detects the cable has been extended beyond the maximum travel limit for more than 30 seconds without a vehicle connected (cable jammed or sensor failure)
- The retractor spring has broken and the cable hangs to the ground (detected by the cable sensor)
- The J1772 connector's Control Pilot (CP) or Proximity Pilot (PP) signal is lost during an active session, suggesting cable damage at the connector

**Symptom differentiation:**

| Symptom | Probable Cause |
|---------|---------------|
| Cable hangs loose, won't retract | Retractor spring broken |
| Cable extremely difficult to pull out | Retractor over-tensioned (spring adjusted too tight) |
| Cable retracts fine but sessions fail to start | CP signal break in cable — usually near connector or near where cable exits housing |
| Connector pins visibly bent or burned | Vehicle-side inlet damage during prior session — replace cable assembly |
| Cable jacket cracked or cut | Physical damage — trip hazard, replace immediately |

**Note on dual-port CT4000:** The CT4000 has **two independent ports** (Port 1 left, Port 2 right), each with its own J1772 cable and retractor. `CP-ERR-RET` will specify Port 1 or Port 2 in the error detail. Only the affected port needs service — the other port remains operational.

### 2. Safety Precautions

> [!NOTE]
> The CT4000 is a 240VAC Level 2 charger. The J1772 cable carries 240VAC when a session is active, but the AC voltage is disconnected as soon as the contactor opens (when the cable is unplugged from the vehicle).
>
> **A J1772 cable that is NOT plugged into a vehicle carries 0V on its power pins.** The CP and PP signal pins carry a low-voltage pilot signal (12V peak, 1kHz PWM) when the charger is in standby. Working on an unplugged J1772 cable does NOT require LOTO — however, replacing the retractor mechanism or accessing the cable termination inside the cabinet DOES require LOTO.

**For cable visual inspection and connector pin inspection:** No LOTO required.
**For retractor replacement or cable termination work inside cabinet:** LOTO the upstream breaker.

**PPE:** Safety glasses. Gloves recommended for cable handling (cable jackets can be abrasive and may have grease on the retractor drum).

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Phillips #2 screwdriver | Standard | Cabinet access and retractor housing screws |
| Flat-head screwdriver | 3mm | Releasing cable connector terminal clips |
| Wire strippers / crimping tool | For 10 AWG wire | If replacing cable at termination (not cable assembly swap) |
| Digital multimeter | CAT II 300V minimum | CP/PP signal measurement, cable continuity |
| Torque wrench | 1/4" drive, 1-5 Nm range | Cable lug termination torque (spec: 2.8 Nm on load terminals) |
| Replacement J1772 cable assembly | ChargePoint part, 25-foot or 20-foot length as installed | Full cable swap |
| Replacement retractor spring kit | ChargePoint CT4000 retractor spring (Gen 1 or Gen 2 — check serial number suffix) | Spring replacement only |
| Cable tester (optional) | J1772 pilot signal tester | Verifying CP/PP continuity after repair |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote and Initial Triage**
1. In the ChargePoint Operations Portal, verify whether `CP-ERR-RET` is on Port 1, Port 2, or both. Note the error timestamp.
2. Check whether sessions on the affected port have been completing. If sessions were completing until recently, the cable is likely physically damaged (sudden failure) rather than having a gradually degrading retractor.
3. Remote restart the station. If the error was caused by the cable sensor getting out of position, a reboot can clear it. Wait 90 seconds after restart and check.

**Step 4.2: On-Site Physical Cable Inspection**
1. Pull the cable to its full extension and inspect the entire length of the cable jacket. Look for:
   - **Cuts or slices** — common from vehicles driving over the cable when the retractor fails
   - **Kinking** — repeated tight bending at the same point causes internal conductor fatigue
   - **UV degradation** — white chalking or cracking on outdoor installations
   - **Oil or chemical contamination** — softens the jacket and can wick into the cable
2. Inspect the J1772 connector:
   - **AC power pins (L1, L2, Ground):** Should be straight, clean, and free of carbon deposits. Any visible arcing or burning means the connector must be replaced immediately.
   - **CP pin:** Small diameter, spring-loaded pin. Check it extends and retracts freely when pressed.
   - **PP pin:** Similar to CP, check for mechanical integrity.
   - **Connector latch:** The thumb-activated latch must click firmly when the connector is inserted into a vehicle inlet. A broken latch causes the connector to fall out mid-session.
3. Inspect the cable boot at both ends — where the cable exits the charger housing and where it enters the connector. These are the highest-stress points for internal conductor fatigue.

**Step 4.3: Test CP Signal Continuity (If No Visible Damage)**
1. The CP pin should measure approximately 12V DC relative to Ground pin when the connector is not plugged in (charger in standby). Measure with a multimeter between CP pin and Ground pin: expect 11.5-12.5V DC.
2. If CP voltage is 0V, the cable's CP conductor is broken or the charger's CP generation circuit has failed. Swap the cable first (simpler repair) to isolate the fault.
3. The PP pin should measure approximately 150Ω relative to Ground (this is the pull-down resistor inside the connector that communicates "connector present" to the vehicle). Measure PP to Ground: expect 100-200Ω. An open circuit means the PP resistor inside the connector has failed — replace the connector or cable assembly.

**Step 4.4: LOTO and Cabinet Access (for Retractor or Termination Work)**
1. Lock out the upstream breaker. Apply LOTO.
2. Open the CT4000 cabinet rear panel (4x Phillips M4).
3. Locate the affected port's cable retractor. The retractor is a cylindrical drum assembly mounted at the top of the cable routing channel inside the unit, approximately 15cm in diameter.

**Step 4.5: Retractor Spring Replacement**
1. Pull the cable out to full extension and use a clamp or zip tie to hold it at full extension — this relieves spring tension and prevents the drum from spinning.
2. Remove the 3x Phillips M3 screws holding the retractor drum cover.
3. Carefully remove the drum cover. The spring is a flat coil spring inside the drum. On Gen 1 CT4000, the spring is removable — unhook the outer spring tab from the drum housing, and the inner tab from the drum axle. On Gen 2, the entire drum assembly is replaced as a unit.
4. Install the new spring (Gen 1) or new drum assembly (Gen 2). Ensure the spring coil direction matches — a reversed spring will not retract.
5. Replace the drum cover and secure screws.
6. Remove the clamp/zip tie from the cable. The cable should retract smoothly. Adjust the retraction tension by rotating the spring-adjust slot (on the axle, accessible from the front of the drum with a flat-head screwdriver): clockwise for more tension, counterclockwise for less. Target tension: cable should retract from full extension in 5-8 seconds, not snap back violently.

**Step 4.6: Full Cable Assembly Replacement**
1. Pull the cable to full extension (use a clamp to hold it out, relieving retractor tension).
2. Inside the cabinet, locate the cable termination block on the affected port's contactor board. The load wires (L1, L2, Ground — typically black, white/red, green) are connected to screw terminals.
3. Note the wire colors and terminal assignments before disconnecting (take a photo).
4. Loosen the terminal screws and remove the load wires. Also disconnect the CP and PP signal wires from the smaller signal terminal block.
5. Thread the old cable out through the cable gland at the bottom of the housing. The gland has a compression seal — loosen the compression nut counterclockwise.
6. Thread the new cable assembly through the gland. Feed the load wires and signal wires to their respective terminal blocks.
7. Terminate the load wires: torque load terminal screws to **2.8 Nm**. Do not over-tighten — the terminal blocks are self-aligning but can crack if excessively torqued.
8. Terminate the signal wires at the signal terminal block (CP and PP are labeled on the PCB silkscreen).
9. Tighten the cable gland compression nut until the seal grips the cable jacket firmly.
10. Feed the cable through the retractor drum. Attach the cable's internal anchor hook to the retractor drum anchor point, following the routing path marked by the orange arrows inside the housing.
11. Remove the holding clamp. Test retraction.

### 5. Verification & Testing

1. Remove LOTO. Restore the upstream breaker.
2. Allow the CT4000 to complete its boot sequence (~60 seconds).
3. Verify the ChargePoint Operations Portal shows the affected port as "Available" with no active `CP-ERR-RET` alert.
4. Test the retraction: pull the cable to full extension and release. It should retract smoothly with moderate tension (not snapping back hard) and fully seat in the holster.
5. Test CP signal: with the cable holstered, check the LED indicator on the affected port — it should show a steady green "Ready" state, indicating the CP circuit is intact.
6. Plug the J1772 connector into a test vehicle or EV emulator. Verify the station recognizes the connection (display shows "Plug Detected" or the session initiation screen).
7. Complete a full test charge session: authenticate with RFID → verify energy delivery at the rated port power (up to 7.2kW per port on a 240VAC/30A supply) → end session → verify kWh correctly recorded in the ChargePoint portal.
8. Re-inspect the cable boot and gland for any kinking after the test session.
9. Log the repair: note which port was affected, the root cause, cable length, and part serial number.
