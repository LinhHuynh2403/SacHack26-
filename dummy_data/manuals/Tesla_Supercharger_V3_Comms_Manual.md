# Tesla Supercharger V3 (250kW)
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Communications
**Target Part:** Stall-to-Cabinet CAN Bus and Site Network Gateway
**Expected Error Code:** `VC-CAN-BS`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

**Tesla V3 Communication Architecture:**

The Supercharger V3 site has two distinct communication layers:

1. **Internal CAN bus (Cabinet ↔ Stall pedestals):** The 4 stall pedestals communicate with the Power Cabinet via a **CAN bus (Controller Area Network)** running through the conduit alongside the DC busway. The CAN bus carries session commands, power allocation messages, stall status, and cable sensor data. The CAN bus is terminated with 120Ω resistors at each end of the bus.

2. **External network (Cabinet ↔ Tesla Fleet servers):** The Power Cabinet has a cellular modem (4G LTE, AT&T or T-Mobile depending on region) and optionally an Ethernet port for site Wi-Fi or wired LAN. This carries telemetry, remote commands, and over-the-air (OTA) software updates.

**Error `VC-CAN-BS` indicates a CAN bus communication fault.** Specific subtypes:
- `VC-CAN-BS-1/2/3/4`: A specific stall (1-4) is not responding on the CAN bus
- `VC-CAN-BS-ALL`: All stalls not responding (likely cabinet-side CAN controller fault, not individual stalls)
- `VC-CAN-BS-TRM`: CAN bus termination fault (missing 120Ω terminator — causes bus reflections that disrupt all stalls)

**A CAN bus fault takes the affected stall(s) completely offline** — the Power Cabinet cannot allocate power to a stall it cannot communicate with. Other stalls on the same cabinet are usually unaffected (unless the fault corrupts the whole bus).

**Common causes:**

| Cause | Typical Scenario |
|-------|-----------------|
| Loose CAN connector at stall pedestal | After mechanical work on the stall, connector not fully reseated |
| CAN cable damage in conduit | Rodent damage, conduit crush, or water intrusion into conduit |
| Missing or failed 120Ω terminator at stall | Terminator plug removed and not replaced during service |
| CAN controller fault in stall PCB | Usually after a lightning strike or power surge event |
| Cabinet CAN gateway failure | `VC-CAN-BS-ALL`: all stalls simultaneously lose communication |

### 2. Safety Precautions

> [!NOTE]
> The CAN bus signal wires carry **low voltage (5V logic level)** and are not hazardous from a shock perspective. However, **the CAN bus conduit runs alongside the high-voltage DC busway conduit** — in some V3 installations these conduits are bundled together. Do not cut or splice any conduit at the installation unless you have confirmed which conduit carries which cable.

**For work inside a stall pedestal** (accessing CAN connector): LOTO the Power Cabinet first (all 4 stalls go out of service). Even though the CAN cable is low-voltage, opening the stall pedestal exposes the DC busway connection which is high-voltage.

**For external conduit inspection** (visual only, no opening): No LOTO required.

**LOTO procedure:** Lock the 400A 3-phase AC disconnect on the Power Cabinet exterior. Wait 10 minutes. Verify 0V DC before opening any stall pedestal.

**PPE:** Class 0 insulating gloves when inside a stall pedestal, safety glasses, ESD wrist strap for handling CAN PCB components.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Torx T20, T25 (Tesla-specific security Torx) | Tesla service driver set | Stall pedestal panel fasteners |
| Digital multimeter | CAT III 1000V rated | LOTO verification, CAN bus voltage and resistance measurement |
| CAN bus analyzer (optional) | USB-based CAN analyzer (Peak PCAN-USB or equivalent) | Active CAN bus diagnostics (requires Tesla Service Mode access) |
| Flashlight | High-lumen | Inspecting inside stall pedestal and conduit entry |
| ESD wrist strap | Grounded type | Handling stall PCB |
| Tesla service laptop | With Tesla Service Mode software | Running CAN bus diagnostics and post-repair self-test |
| Replacement CAN terminator plug | 120Ω, 2-pin CAN terminator for Tesla stall connector | Replacing missing terminator |
| Replacement stall CAN interface PCB | Tesla-issued part | If stall CAN controller is failed |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage — Tesla Fleet Operations Portal**
1. Log into Tesla Fleet Operations. Identify the specific `VC-CAN-BS` subtype:
   - A single stall number (e.g., `VC-CAN-BS-2`): Fault is in that stall's CAN connection or stall PCB
   - `VC-CAN-BS-ALL`: Fault is in the cabinet's CAN gateway
   - `VC-CAN-BS-TRM`: Bus termination issue
2. Check the timeline: did the fault appear suddenly (immediately after any recent service at the site) or gradually (suggesting degradation)?
3. Check whether any recent OTA software updates were pushed to the site around the time of the fault. A failed OTA update can corrupt the CAN stack firmware on a stall controller.
4. Attempt a remote restart from the Fleet portal. A soft reboot often re-initializes the CAN stack and recovers from transient bus errors caused by temporary RF interference or software hangs.

**Step 4.2: On-Site External Inspection**
1. Walk the conduit runs between the Power Cabinet and each stall pedestal. Look for:
   - Conduit that has been driven over (look for tire marks, cracked conduit body)
   - Conduit that has separated from a junction box
   - Conduit fill ports or pull boxes that have been left open (water intrusion)
2. Inspect the base of each stall pedestal for any sign of water pooling or entry through the conduit base fitting. Water in the CAN cable (a differential twisted pair) dramatically alters the bus impedance and causes communication errors.

**Step 4.3: LOTO and Stall Pedestal Access**
1. Lock out the Power Cabinet 3-phase AC disconnect. Wait 10 minutes. Verify 0V DC.
2. Open the affected stall pedestal: 4x Tesla T25 security Torx.
3. Inside the stall, locate the CAN bus connector. It is a 4-pin Deutsch DT-series connector (typically labeled "CAN" or "COMM" on the stall PCB). The 4 pins are: CAN-H (CAN High), CAN-L (CAN Low), GND (signal ground), and shield.

**Step 4.4: CAN Bus Electrical Diagnosis**
1. With the LOTO in place (bus de-energized), the CAN bus will have no active signal. Measure static values:
   - **Bus voltage (with power on — requires controlled energized test, see Step 4.4.a):** Normal CAN-H = ~3.5V, CAN-L = ~1.5V during bus idle. Equal voltages suggest no termination.
   - **Bus termination resistance:** With LOTO in place, measure resistance between CAN-H and CAN-L at the stall's CAN connector (with the connector disconnected from the stall PCB). You are measuring the cable back to the Power Cabinet side. Expect **60Ω** (two 120Ω terminators in parallel). If you read 120Ω, the terminator at the stall end is missing. If you read >300Ω, there is an open circuit in the CAN cable run.

2. **Step 4.4.a (Controlled energized CAN test — requires Tesla service laptop):**
   - With Tesla Service Mode active on the laptop connected via USB to the cabinet, and with the Power Cabinet powered on (remove LOTO temporarily for this test — exercise extreme caution), the Tesla service software can actively query the CAN bus and list all responding nodes.
   - Run the "CAN Node Discovery" function. Each healthy stall will appear as a node. A missing stall identifies which stall's CAN interface is offline.
   - Re-apply LOTO after this test before performing any physical work.

**Step 4.5: CAN Connector Reseat**
1. The most common fix: disconnect the CAN connector at the stall PCB and reconnect firmly. The Deutsch DT connector requires pressing the wedge lock fully home — a partially mated DT connector can appear connected but have intermittent pin contact.
2. Check the CAN cable at the conduit entry point inside the pedestal. If the cable has been pulled taut (cable slightly short after conduit settling), the stress on the connector can cause intermittent contact.

**Step 4.6: Terminator Check and Replacement**
1. Each stall should have a 120Ω terminator plug installed in the secondary CAN connector port on the stall PCB (if this stall is the end of the CAN bus). Check whether the terminator is present and properly seated.
2. If the terminator is missing (possibly removed during a previous service visit), install a replacement 120Ω terminator.
3. Re-measure bus termination resistance at the cable (should read 60Ω if both terminators are installed and the bus is properly connected).

**Step 4.7: Stall CAN Interface PCB Replacement (if hardware failed)**
1. If the CAN connector and terminator are intact but the stall does not appear in the CAN node scan, the stall's CAN interface PCB is likely damaged.
2. Remove the stall PCB (4x Phillips M3 mounting screws, multiple connectors — photograph all connections before disconnecting).
3. Install the replacement PCB. Reconnect all connectors.
4. The replacement PCB requires **VIN registration** via the Tesla service laptop — it must be paired to this specific V3 site and stall number using the Tesla Service Mode software. Follow the on-screen pairing procedure.

### 5. Verification & Testing

1. Remove LOTO. Restore the Power Cabinet 3-phase AC disconnect.
2. Wait for the V3 system to boot (2-3 minutes).
3. In the Tesla Fleet Operations portal, verify the affected stall is back online with no `VC-CAN-BS` fault.
4. Run the Tesla Service Mode "CAN Node Discovery" scan — all 4 stalls should appear.
5. Initiate a test charging session on the previously-faulted stall. The session should start normally — CAN communication is required for power allocation.
6. Check the stall's real-time power delivery in the Fleet portal — should receive appropriate power based on vehicle demand and available cabinet capacity.
7. Run a 10-minute test session. Monitor for any CAN communication errors in the portal event log.
8. Test the other 3 stalls remain functional (confirm the CAN bus repair did not introduce a bus imbalance affecting other stalls).
9. Log the repair: specify which stall was affected, the root cause (loose connector, missing terminator, PCB replacement), and the result of the CAN node discovery test.
