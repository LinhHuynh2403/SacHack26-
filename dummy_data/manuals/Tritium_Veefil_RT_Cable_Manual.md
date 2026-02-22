# Tritium Veefil-RT 50kW DC Fast Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Cable
**Target Part:** CHAdeMO DC Charging Cable and Connector
**Expected Error Code:** `TR-CHA-CHd`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The Tritium Veefil-RT is a **dual-standard DCFC** — it outputs DC through two cables:
1. **CCS1 (Combined Charging System) cable** — for most non-Japanese North American EVs
2. **CHAdeMO cable** — for Nissan Leaf, older Mitsubishi vehicles, and some Japanese imports

Error `TR-CHA-CHd` specifically refers to the **CHAdeMO cable and connector** assembly. The CHAdeMO (Charge de Move) protocol, originally developed by the CHAdeMO Association (Tokyo Electric Power Company), uses a unique large round connector with two DC pins, two interlock pins, and a 10-pin CAN communication connector.

**CHAdeMO protocol communication:** Unlike CCS, which uses power line communication (PLC/HomePlug GreenPHY), CHAdeMO uses a **CAN bus at 500 kbps** between the charger and vehicle. The charger and vehicle must negotiate charging parameters via CAN before DC power is enabled. A `TR-CHA-CHd` fault can arise from either the physical cable/connector or the CHAdeMO CAN communication link.

**Fault differentiation:**

| Symptom | Probable cause |
|---------|---------------|
| Connector latch won't engage vehicle inlet | Mechanical damage to CHAdeMO connector latch (a complex spring-loaded mechanism) |
| Session starts but trips during charging | CAN communication dropout — check cable for damage at the connector base |
| Fault at connection attempt, before charging | Interlock circuit open — interlock pins or vehicle-side interlock failure |
| Fault only with specific vehicles | Vehicle BMS issue — verify CHAdeMO cable is healthy with a different vehicle |
| DC pin burning or arcing marks | Contact resistance failure — replace cable immediately |
| `TR-CHA-CHd` at boot with no vehicle | Connector thermistor short or open circuit |

**CHAdeMO usage context:** As of 2024-2025, CHAdeMO adoption in North America is declining sharply. The Veefil-RT's CHAdeMO cable typically sees significantly less use than the CCS cable at most sites. Low-use cables can develop issues from infrequent use (oxidized contacts from lack of mating cycles, stiff latch mechanisms from UV-hardened rubber).

### 2. Safety Precautions (CRITICAL)

> [!CAUTION]
> **The CHAdeMO cable carries up to 500A DC at up to 500V (CHAdeMO protocol maximum: 200kW, though the Veefil-RT is limited to 50kW / ~125A at 400V typical). This is a lethal voltage and current.**
>
> The CHAdeMO connector de-energizes when disconnected from a vehicle — the interlock circuit (a normally-open switch that closes when the connector is fully inserted) must be closed before the charger enables DC output. An unplugged CHAdeMO connector is safe to handle.
>
> **For cable inspection and connector inspection with the cable unplugged:** No LOTO required.
> **For work accessing the cable termination inside the sealed Veefil-RT enclosure:** Full LOTO and coolant drain required (see Cooling Manual).

**LOTO procedure:** Lock out the upstream AC breaker. Engage the internal DC isolator. Wait 7 minutes. Verify 0V DC at the bus test points.

**PPE:** Class 0 insulating gloves for any work near the cable terminations or inside the enclosure. Safety glasses. Nitrile gloves for coolant handling if enclosure work is required.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Allen key (hex) set | Metric 4mm, 5mm, 6mm | Veefil-RT enclosure fasteners |
| Digital multimeter | CAT III 1000V rated | Voltage verification, CAN bus resistance check, interlock circuit test |
| CAN bus analyzer (optional) | 500 kbps capable (Peak PCAN-USB or equivalent) | Diagnosing CHAdeMO CAN protocol issues |
| CHAdeMO pin gauges | Per CHAdeMO specification | Checking DC pin diameter |
| Torque wrench | 3/8" drive, 5-30 Nm | DC cable lug termination torque (spec: 12 Nm for CHAdeMO DC lugs) |
| Infrared thermometer | -20°C to 200°C | Checking DC pin contact temperature after a session |
| Replacement CHAdeMO cable assembly | Exicom/Tritium part for Veefil-RT | Full cable swap |
| Contact cleaner | Isopropyl alcohol + lint-free swabs | Cleaning DC and CAN connector pins |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage via MyTritium Portal**
1. Log into the MyTritium/Exicom portal. Confirm `TR-CHA-CHd` is active.
2. Review the CHAdeMO session history:
   - Sessions completing with very low energy (session starts but trips within seconds): CAN communication fault
   - Sessions not starting at all: Interlock or physical connector issue
   - Sessions completing normally but fault is at boot: Thermistor fault in cable
3. Check whether the CCS cable is also faulting. If both cables have faults, the issue is the charger's main DC output stage or a common power fault, not the CHAdeMO cable specifically.
4. Attempt a remote restart. Software-latched CHAdeMO faults will clear on reboot.
5. Review the timestamp of the last successful CHAdeMO session. If the cable hasn't been used in months, oxidized connector contacts may be the issue.

**Step 4.2: On-Site Physical Cable Inspection (No LOTO Required)**
1. The CHAdeMO connector is the larger of the two connectors on the Veefil-RT (the CCS connector is typically to the right, the CHAdeMO to the left on the front panel). The CHAdeMO connector has a distinctive circular shape with a large round housing.
2. Inspect the CHAdeMO connector:
   - **DC pins (2 large pins):** Check for oxidation (dark film or green/white deposits), pitting, or melting. Oxidized contacts have high resistance that generates heat during charging.
   - **CAN communication pins (10-pin circular sub-connector at the base of the connector):** These small pins should be clean and straight. Bent CAN pins cause intermittent communication faults.
   - **Interlock pins (2 pins with spring-loaded contacts):** Press each pin — they should travel smoothly and spring back. Stiff or stuck interlock pins prevent the interlock circuit from closing.
   - **Latch mechanism:** The CHAdeMO connector latch is a spring-loaded lever that locks the connector into the vehicle inlet. Test the latch: pull it back, it should move smoothly and return to position with a positive click.
3. Clean accessible pin faces with IPA-moistened swabs. For the DC pins, wipe firmly in a circular motion to remove oxidation.
4. Check the cable jacket along its full length. The CHAdeMO cable is typically thicker and heavier than the CCS cable. Look for kinks, cuts, and brittleness.

**Step 4.3: Interlock Circuit Test**
1. Disconnect the CHAdeMO connector's communication sub-harness (the multi-pin connector on the cable body that connects to the Veefil-RT front panel). This connector is separate from the main DC terminals.
2. Using the multimeter in resistance mode, measure the interlock circuit: between the two interlock pins with the connector in the "unplugged" state (latch disengaged), expect **open circuit (>1MΩ)**.
3. Manually press the connector latch to simulate the connector being inserted into a vehicle: expect **<5Ω** (the interlock switch should close).
4. If the interlock reads open when the latch is engaged, the interlock switch inside the connector is faulty — the entire cable assembly must be replaced.

**Step 4.4: CAN Bus Integrity Check**
1. With the CHAdeMO communication harness disconnected from the Veefil-RT, measure resistance between the CAN-H and CAN-L pins in the cable's communication connector.
2. The cable end of the CAN bus has no termination resistors (the terminators are on the charger and vehicle sides of the CAN bus). Expect **open circuit** on the cable's CAN-H to CAN-L resistance at the free end of the cable.
3. Check CAN-H to cable shield and CAN-L to cable shield — both should show open circuit. A short between either CAN signal and shield indicates a damaged cable.

**Step 4.5: Full Cable Replacement (Requires LOTO and Enclosure Access)**
1. Perform LOTO per the Cooling Manual procedure. Wait 7 minutes. Verify 0V DC.
2. Drain the coolant (the Veefil-RT enclosure must be opened — coolant drain is always required).
3. Remove the enclosure access panel (M6 Allen key bolts).
4. Inside the enclosure, locate the CHAdeMO cable's DC terminations on the DC output bus bar (clearly labeled DC+ and DC- with the CHAdeMO label). The DC terminations are M8 or M10 bolted lugs.
5. Locate the CHAdeMO CAN communication harness connection to the main controller (a 10-pin Deutsch DT connector, labeled "CHA-CAN" on the PCB).
6. Disconnect the CAN harness. Remove the DC lug bolts (torque spec: **12 Nm**). Slide the cable assembly out through the cable gland on the front panel.
7. Route the new cable assembly through the gland. Connect DC lugs first (torque to **12 Nm**). Connect the CAN harness.
8. Re-seal the cable gland. Replace the enclosure panel (IP65 gasket must be fully seated — 4 Nm torque on all perimeter bolts).
9. Refill coolant, purge air per the Cooling Manual procedure.

### 5. Verification & Testing

1. Remove LOTO. Restore the upstream AC breaker.
2. Power on the Veefil-RT and allow full boot (~90 seconds).
3. In the MyTritium portal, verify `TR-CHA-CHd` has cleared.
4. Connect a CHAdeMO-compatible EV (or emulator). Verify the charger recognizes the CHAdeMO connector insertion (the portal should show "CHAdeMO vehicle connected" within 5 seconds of connection).
5. Initiate a CHAdeMO session. Monitor the CAN negotiation in the portal telemetry — the charger and vehicle should exchange CAN messages within 3 seconds, and DC power should enable within 10 seconds.
6. Run a 10-minute test charge at full rate for the test vehicle. Monitor:
   - DC output voltage (should track vehicle target voltage)
   - DC output current (should ramp to the negotiated current limit)
   - Connector temperature (should stay below 60°C for the Veefil-RT's 50kW output level)
7. End the session. Verify the charger performs the proper CHAdeMO shutdown sequence: current ramp-down → DC contactor open → CAN session close message.
8. Inspect the cable assembly and gland for coolant leaks after the test.
9. Log the repair: note the cable type (CHAdeMO), root cause, part serial numbers, and coolant volume replenished.
