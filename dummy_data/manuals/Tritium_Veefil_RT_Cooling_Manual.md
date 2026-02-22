# Tritium Veefil-RT 50kW DC Fast Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Cooling
**Target Part:** Liquid Cooling System — Pump, Radiator, and Internal Coolant Circuit
**Expected Error Code:** `TR-CL-09`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

**Tritium Veefil-RT Cooling Architecture — Critical Distinction:**

The Veefil-RT uses **liquid cooling for all internal power electronics** (power conversion modules, DC bus, and IGBT switching devices), enclosed in an **IP65-rated sealed enclosure**. Unlike air-cooled chargers, the Veefil-RT has NO air intake fans or vents for the main power section. **All heat is rejected through an external radiator panel.**

This sealed design means:
- Dust, insects, and rain cannot enter the power section — excellent for harsh outdoor environments
- However, **the coolant loop is the ONLY heat removal path** — a degraded cooling system causes rapid thermal faults with no "graceful degradation" via increased airflow
- **Opening the enclosure for cooling system work requires draining the coolant first** — the coolant loop is pressurized and integrated into the sealed enclosure

**Error `TR-CL-09` is triggered when:**
- Coolant temperature at the power module heat sink exceeds **70°C** (normal operating: 35-55°C at full 50kW output)
- Coolant pump current draw drops below the normal operating range (indicating pump cavitation or motor failure)
- Coolant pressure sensor reads below **0.5 bar** (normal: 1.0-2.0 bar) — indicating a leak or pump failure

**Common causes:**

| Cause | Signature in MyTritium Portal |
|-------|-------------------------------|
| Coolant pump impeller wear | Gradually declining flow, slowly rising temperature over months |
| Coolant pump motor failure | Sudden flow loss, rapid temperature rise to fault threshold |
| Coolant level low (slow leak) | Pressure trending down over weeks, temperature slightly elevated |
| External radiator fins clogged | Temperature rising but pump and pressure readings are normal |
| Air bubble in coolant loop | Erratic pressure readings, pump "hammering" sound, poor heat transfer |

**Note on Veefil-RT support:** As of 2024, Tritium was acquired by Exicom and the Veefil-RT product line is discontinued for new sales. Spare parts are available through Exicom's service network but lead times may be longer than for actively sold products. Always verify spare part availability before dispatching for a hardware replacement.

### 2. Safety Precautions (CRITICAL)

> [!CAUTION]
> **The Veefil-RT DC bus operates at up to 920V. The unit must be fully de-energized and LOTO applied before opening the enclosure for ANY reason.**
>
> **LOTO procedure specific to Veefil-RT:**
> 1. Power down via the front panel (Menu → Shutdown → Confirm).
> 2. Lock out the upstream AC breaker (typically 100A 3-phase 480VAC). Apply padlock and DANGER tag.
> 3. Locate the Veefil-RT's internal DC isolator (a rotary switch behind the lower access panel, reachable without opening the main sealed enclosure). Turn to OFF and lock if possible.
> 4. Wait **7 minutes** — the Veefil-RT has larger DC bus capacitors than the ABB Terra 54 due to its single-stage conversion design. The manufacturer specifies 7 minutes minimum capacitor discharge time.
> 5. Verify 0V DC at the DC bus test points (accessed through the lower DC access cover, which can be opened separately from the main sealed enclosure).

> [!CAUTION]
> **Coolant drain required before main enclosure opening.** The pressurized coolant loop will spray coolant if the enclosure is opened while pressurized. Always drain the coolant before removing the main top or side panels.
>
> **Coolant is a 50/50 ethylene glycol/deionized water mixture.** Wear nitrile gloves and safety glasses. Hot coolant (above 50°C) can cause burns — allow coolant to cool before draining.

**PPE:** Class 0 insulating gloves (1000V), safety glasses, nitrile gloves for coolant work, arc-rated clothing (8 cal/cm²).

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Allen key (hex) set | Metric: 4mm, 5mm, 6mm | ALL Veefil-RT enclosure fasteners (not Torx) |
| Digital multimeter | CAT III 1000V rated | LOTO verification, DC bus voltage check |
| Coolant drain kit | Clean container, 3-liter minimum; hand pump or gravity drain | Draining coolant before enclosure access |
| Coolant refill kit | 50/50 ethylene glycol/DI water premix, 2-liter minimum | Refilling after repair |
| Infrared thermometer | -20°C to 200°C | Radiator inlet/outlet temperature differential |
| Refrigerant or coolant vacuum/fill station (optional) | For system pressurization test after refill | Verifying no air in loop |
| Replacement coolant pump | Exicom/Tritium part for Veefil-RT | If pump has failed |
| Soft bristle brush | Non-metallic | Cleaning external radiator fins |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage via MyTritium Portal**
1. Log into the MyTritium portal (now operated by Exicom — portal.exicom.com or legacy mytritium.com depending on site configuration). Navigate to the faulted unit.
2. Review the cooling telemetry:
   - **Heat sink temperature trend:** A gradual rise over days suggests radiator fouling or slowly declining pump performance. Sudden rise suggests pump failure.
   - **Pump current:** The Veefil-RT's pump is a fixed-speed brushless DC pump. Normal current is approximately 2.5-3.5A. A current drop to <1.5A with no flow suggests the impeller has failed while the motor still runs (cavitation or broken impeller). A current of 0A means the pump is not receiving power.
   - **Coolant pressure:** Trending downward over weeks (losing 0.1-0.2 bar per week) suggests a slow external leak.
3. Attempt a remote reboot. If the cooling fault was a transient thermal event (vehicle requested more power than the cooling system could sustain in extreme ambient), a reboot will clear the latched fault.

**Step 4.2: External Radiator Inspection (No LOTO Required)**
1. The Veefil-RT radiator is integrated into the side or rear panel of the unit (the large flat panel with horizontal fins). Visually inspect the fin surface for:
   - Compacted debris (cottonwood seeds, leaves, dust)
   - Physical damage (bent fins from impact)
   - Evidence of coolant leaks at the radiator manifold fittings (dried glycol residue)
2. Use the soft bristle brush to remove loose debris. Use low-pressure water (garden hose) for packed debris — rinse from the clean side outward.
3. Use the infrared thermometer on the radiator inlet and outlet pipes during operation:
   - Inlet (from pump) temperature: slightly cooler side
   - Outlet (return) temperature: slightly warmer side after passing through the electronics
   - Normal differential under 50kW load: **8-15°C**
   - A differential of <3°C with a thermal alarm active suggests poor flow, not a blocked radiator

**Step 4.3: LOTO and Coolant Drain**
1. Perform full LOTO (see Section 2). Wait 7 minutes. Verify 0V DC.
2. Allow the coolant to cool to below 40°C before draining (check with infrared thermometer at the drain fitting).
3. Locate the coolant drain valve at the lowest point of the Veefil-RT chassis (a hand-turn drain cock, typically at the base rear panel, accessible from the outside without opening the main enclosure).
4. Attach a collection hose to the drain and direct into the drain container.
5. Open the drain cock. The coolant will drain by gravity — expect 1.5-2.5 liters total system volume.
6. After draining, close the drain cock.

**Step 4.4: Open Main Enclosure**
1. The Veefil-RT main enclosure is secured with **M6 Allen key (hex) bolts** around the panel perimeter — NOT Torx. This is a key differentiator from ABB equipment.
2. Remove all perimeter bolts from the access panel (typically the top panel or a side service panel, depending on the Veefil-RT hardware revision).
3. Carefully lift or swing the panel. There will be a gasket seal — do not damage it. If the gasket sticks, gently break the seal with a plastic pry tool. Never use a metal screwdriver — it will cut the IP65 gasket.
4. Set the panel aside on a clean surface. Do not allow the gasket to contact dirt or sharp objects.

**Step 4.5: Pump Inspection and Replacement**
1. The coolant pump is a cylindrical assembly approximately 15cm long and 8cm diameter, mounted on the internal frame. It connects to the coolant circuit via push-fit poly hose connections.
2. Verify the pump's power connector is secure (2-pin Molex connector to the control board).
3. With LOTO removed temporarily (controlled test), apply power and listen for the pump running. A healthy pump produces a smooth hum. A loud rattling or grinding sound indicates bearing failure or a damaged impeller. No sound at all means no power or a seized motor.
4. Re-apply LOTO. If the pump needs replacement:
   - Disconnect the pump power connector.
   - Disconnect the inlet and outlet hose connections (push-fit — press the ring collar while pulling the hose).
   - Remove the 3x M5 Allen key mounting bolts on the pump bracket.
   - Install the replacement pump in reverse order. Torque mounting bolts to 3.5 Nm.
   - Reconnect hoses and power connector.

### 5. Verification & Testing

1. Replace the access panel. Before torquing the perimeter bolts, inspect the IP65 gasket for any tears, cuts, or debris. A damaged gasket will allow water ingress — replace it if needed. Torque perimeter bolts to **4 Nm** in a cross pattern (evenly compress the gasket). Do not over-tighten — the gasket will extrude if over-compressed.
2. Refill the coolant loop:
   - Connect the refill hose to the fill port (located near the top of the unit on the service panel side).
   - Slowly add the 50/50 glycol/DI water premix until the sight glass reads between MIN and MAX.
   - Replace the fill cap.
3. Remove LOTO. Restore the upstream AC breaker.
4. Power on the Veefil-RT. The pump will start within 5 seconds of power on.
5. Purge air from the coolant loop: the Veefil-RT has an automatic air purge sequence that runs for the first 5 minutes after a coolant fill. The pump will run at high speed intermittently to dislodge air bubbles. Monitor the MyTritium portal — coolant pressure should stabilize at 1.0-2.0 bar within 10 minutes.
6. If pressure remains low (<0.8 bar) after 15 minutes, there may be an air pocket. Gently tilt the Veefil-RT slightly (if on a movable stand) or tap the housing to dislodge trapped air.
7. Check the coolant level again after 20 minutes of operation — air purge may have displaced some coolant volume. Top off if level dropped.
8. Verify `TR-CL-09` has cleared in the MyTritium portal.
9. Initiate a test charge at full 50kW. Monitor heat sink temperature — should stabilize at 40-55°C within 5 minutes of sustained load.
10. Inspect all coolant access points and the drain cock for leaks after 30 minutes of operation.
11. Log the repair: note pump current readings, coolant volume drained and refilled, panel gasket condition, and any leak findings.
