# ChargePoint CT4000 Series Level 2 Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Power
**Target Part:** AC Contactor and 30A Contactor Board
**Expected Error Code:** `CP-ERR-CON`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The ChargePoint CT4000 controls AC power delivery to each port via a dedicated **30A AC contactor** — an electromechanically operated switch that connects the utility AC supply to the J1772 cable when a session is authorized. The CT4000 has **two independent contactors**, one per port, mounted on the contactor board assembly inside the cabinet.

The contactor operates on a simple principle: the main controller sends a low-voltage signal (12V DC coil voltage) to close the contactor, which connects the 240VAC main power to the output cable. When the session ends, the coil is de-energized and the contactor opens.

**Error `CP-ERR-CON` is reported when:**
- The main controller commanded the contactor to close (session authorized) but no current flow is detected on the J1772 output — contactor failed to close
- The controller commanded the contactor to open (session ended or emergency stop) but current is still detected — contactor welded shut (dangerous condition — requires immediate dispatch)
- The contactor feedback switch (a small auxiliary contact on the contactor body) disagrees with the commanded state

**Failure mode comparison:**

| Failure | Symptom | Urgency |
|---------|---------|---------|
| Contactor fails to close (open-circuit failure) | Sessions authorize but no power delivered to vehicle | High — station non-functional |
| Contactor welded shut (closed-circuit failure) | Power delivered even when no session active | **Critical — safety hazard** |
| Contactor coil failed | Station cannot start any sessions on that port | High |
| Contactor feedback switch failure | False `CP-ERR-CON` faults, occasional false starts | Medium |

> [!WARNING]
> **A welded contactor is a safety emergency.** If the CT4000 is delivering power to a J1772 cable with no active session (cable plugged in but no vehicle, or cable unplugged), the port must be immediately taken out of service. Lock out the upstream breaker before any further work.

**Note:** On the CT4000, each port has its own contactor. `CP-ERR-CON` in the portal specifies Port 1 or Port 2. The unaffected port remains operational.

### 2. Safety Precautions

> [!CAUTION]
> **The contactor board carries 240VAC on its input side at all times when the upstream breaker is closed.** Even when the charger is in "standby" with no active session, the contactor input terminals are live.
>
> **Full LOTO is mandatory before opening the cabinet for any contactor or power wiring work.**
>
> **Welded contactor:** If a welded contactor is suspected, do NOT attempt to manually separate a welded contactor (the contacts can arc explosively). Lock out the upstream breaker to de-energize the circuit, then replace the contactor.

**LOTO procedure:**
1. Navigate to the ChargePoint Operations Portal and set the affected port to "Out of Service" (prevents any remote session attempts during your work).
2. Lock out the upstream 30A/50A 240VAC breaker at the electrical panel. Apply padlock and DANGER tag.
3. Verify dead by measuring voltage at the contactor input terminals with a CAT II multimeter: should read 0VAC L1-N, L2-N, and L1-L2.
4. The CT4000 has no significant capacitors — you may begin work immediately after voltage verification.

**PPE:** Safety glasses, Class 00 insulating gloves (500V rated), long sleeves.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Phillips #2 screwdriver | Standard | Cabinet access, contactor mounting screws |
| Flat-head screwdriver | 4mm | Contactor terminal screws (cage-clamp type) |
| Digital multimeter | CAT II 300V minimum | LOTO verification, contactor coil resistance measurement |
| Insulated torque wrench | 1/4" drive, 1-5 Nm | Terminal torque specification (2.5 Nm on main terminals) |
| Replacement contactor | Schneider Electric LC1D32 or equivalent 30A DIN rail contactor (verify coil voltage: 12VDC) | Contactor replacement |
| Replacement contactor board (if PCB damaged) | ChargePoint CT4000 contactor board assembly | Full board swap |
| Current clamp meter | 200A AC range (Klein CL800 or equivalent) | Verifying current delivery during test charge |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage**
1. Log into the ChargePoint Operations Portal. Verify `CP-ERR-CON` and which port is affected.
2. Check the session history for the affected port. Look for a pattern:
   - Sessions authorized but 0 kWh delivered → contactor failing to close
   - Sessions show energy delivered after session ended → welded contactor (dispatch immediately)
3. Attempt a remote restart. If the contactor failed to close due to a firmware issue with the feedback logic, a restart may resolve it. Do not restart if a welded contactor is suspected.
4. Set the affected port to "Out of Service" in the portal to prevent unauthorized session attempts while diagnosing.

**Step 4.2: LOTO and Cabinet Access**
1. Lock out the upstream breaker. Verify 0VAC at the input terminals.
2. Open the CT4000 cabinet rear panel.
3. Identify the contactor board assembly. On the CT4000, it is the metal-framed board on the lower half of the cabinet interior, with two DIN-rail mounted contactors (one per port) labeled K1 (Port 1) and K2 (Port 2).

**Step 4.3: Visual Inspection of the Contactor**
1. Look at the contactor body. A welded contactor may show:
   - Scorch marks on the body or the surrounding PCB
   - A burning smell
   - The contactor body visibly bulged or cracked
2. Check the contactor coil terminals (small 12V wires connected to the contactor's coil pins, labeled A1 and A2). Ensure the connectors are seated — they are push-in type and can vibrate loose.
3. Press the manual operator button on the top of the contactor (small blue or orange button). This manually closes the contactor. Press and release — if the contactor does not click, the mechanism is mechanically seized.

**Step 4.4: Electrical Diagnosis**
1. Measure the contactor coil resistance (between A1 and A2 terminals with the coil wires disconnected): expect **300-500Ω** for a 12VDC coil. An open circuit (>1MΩ) means the coil is burned out. A short (<50Ω) means the coil is damaged.
2. Check the contactor main contacts. With the contactor in the OPEN position (no coil power), measure resistance between each input terminal and its paired output terminal:
   - L1-in to L1-out: should be **open circuit (>1MΩ)**
   - L2-in to L2-out: should be **open circuit (>1MΩ)**
   - If either reads <1Ω in the open state: **welded contact confirmed**. Do not attempt to operate — replace immediately.
3. Use the manual operator to close the contactor (press and hold the blue button). Re-measure each contact pair:
   - L1-in to L1-out: should be **<50mΩ** (good contact)
   - L2-in to L2-out: should be **<50mΩ**
   - If either reads >200mΩ in the closed state: high-resistance contact (worn or pitted contacts) — replace the contactor.

**Step 4.5: Contactor Replacement**
1. Note the wire connections to the contactor before disconnecting (or photograph).
2. Loosen the cage-clamp terminal screws on the main terminals (L1-in, L1-out, L2-in, L2-out, Ground). Pull out the wires.
3. Disconnect the 12V coil wires from A1 and A2.
4. The contactor clips onto a standard DIN rail. Press down on the contactor's DIN rail release tab (flat-head screwdriver) while tilting the contactor forward to unhook the top clip.
5. Snap the replacement contactor onto the DIN rail: hook the top clip first, then press the bottom until it clicks.
6. Reconnect the main wires to the correct terminals. Torque the cage-clamp screws to **2.5 Nm**.
7. Reconnect the 12V coil wires to A1 and A2.
8. Reconnect the contactor feedback switch wires (small 2-pin connector to the auxiliary contact block on the side of the contactor).

### 5. Verification & Testing

1. Verify all connections are secure and no stray wire strands are crossing between terminals.
2. Remove LOTO. Restore the upstream breaker.
3. Allow the CT4000 to complete its boot sequence (60 seconds).
4. In the ChargePoint portal, set the affected port back to "In Service."
5. Verify `CP-ERR-CON` has cleared from active alerts.
6. Perform a controlled test:
   - Connect the EV emulator or a test vehicle to the affected port's J1772 cable.
   - Authenticate a session with an RFID card.
   - **Listen for the contactor click** when the session starts — you should hear a distinct "clunk" from inside the cabinet as the contactor closes.
   - Verify current delivery using the current clamp meter on the L1 wire: at 7.2kW / 240V, expect ~30A.
7. End the session. **Listen for the contactor opening click.** Verify the current clamp reads 0A after the session ends.
8. Run a 10-minute test charge and verify kWh recorded in the ChargePoint portal matches the expected value (10min at 7.2kW = 1.2 kWh ± 5%).
9. Inspect the contactor and surrounding area for any arcing, heat, or unusual sounds.
10. Log the repair: note which contactor failed, failure mode (open-circuit vs. welded), and replacement part.
