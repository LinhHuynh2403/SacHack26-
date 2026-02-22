# Tesla Supercharger V3 (250kW)
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Cooling
**Target Part:** Cabinet Liquid Cooling Loop — Radiator, Pump, and Coolant Circuit
**Expected Error Code:** `VC-THRM-001`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

**Architecture overview:** The Tesla Supercharger V3 uses a centralized liquid cooling architecture. Each V3 installation consists of one **Power Cabinet** (approximately 1.8m tall) shared by up to four charging stalls (pedestals). The power conversion electronics (AC/DC converters, IGBTs, DC bus capacitors) are housed in the Power Cabinet and are cooled by a dedicated liquid cooling loop.

The liquid cooling loop consists of:
- An **external radiator** mounted on the power cabinet (typically the rear panel) — a flat-fin aluminum heat exchanger
- An **electric coolant pump** (brushless DC, approximately 200W)
- **Coolant lines** running from the cabinet through conduit to the connector handles at each stall (the NACS cable handles are also liquid-cooled)
- **Coolant:** 50/50 ethylene glycol/deionized water (same mixture as the ABB Terra 54)

**Error `VC-THRM-001`** is sent to the Tesla Operations portal when:
- A coolant temperature sensor in the power cabinet exceeds **75°C** (normal operating range: 35-60°C under full 250kW load)
- A coolant flow rate sensor detects flow below **4 L/min** (normal: 8-12 L/min)
- Coolant pressure drops below **0.8 bar** (normal: 1.5-2.5 bar), indicating a possible leak

The V3 will **throttle output power** starting at 60°C coolant temperature and will **suspend charging** above 80°C to protect the power electronics. A site with all 4 stalls occupied (all vehicles requesting full power) may hit thermal limits in extreme ambient temperatures (>40°C) if the radiator is obstructed.

**Common causes:**

| Cause | Telemetry signature |
|-------|-------------------|
| Radiator fins clogged (debris, cottonwood seeds) | Rising coolant temperature with normal flow rate |
| Coolant pump degrading | Declining flow rate reading over weeks, rising temperature |
| Coolant loop leak (external) | Pressure drop + puddle under cabinet |
| Coolant loop leak (internal) | Pressure drop, no visible puddle, possible steam from cabinet vents |
| Air in the coolant loop | Erratic pressure readings, pump noise, reduced heat transfer |

### 2. Safety Precautions (CRITICAL)

> [!CAUTION]
> **The Tesla V3 Power Cabinet operates at up to 1000V DC on the bus and 480VAC 3-phase on the input.** This is the highest voltage environment in this manual series.
>
> **Tesla Supercharger V3 cabinets are serviced ONLY by Tesla-authorized technicians with Tesla-specific training.** This manual is for reference and triage. Tesla service appointments are managed through the **Tesla Fleet Operations portal** — standard field technicians do not perform internal power cabinet repairs. Internal work requires Tesla proprietary service tools and authorization.
>
> **What field technicians CAN do:** External radiator cleaning, identifying and reporting leak locations, topping off coolant from the external reservoir (if accessible without opening the main cabinet).
>
> **What requires a Tesla service escalation:** Any work involving opening the main power cabinet, replacing the coolant pump, or replacing coolant lines inside the cabinet.

**For external radiator cleaning and coolant top-off (what this manual covers):**
- LOTO is NOT required for external radiator work
- Wear safety glasses and nitrile gloves (coolant contact)
- Do NOT open the main power cabinet under any circumstances

**For Tesla escalation:**
- LOTO: lock the main 400A 3-phase AC disconnect on the cabinet exterior before any Tesla-authorized internal work
- Wait 10 minutes after LOTO — the V3's DC bus capacitors are larger than other chargers (higher energy storage)
- Verify 0V DC at the cabinet's service window (if accessible) before internal work

**PPE for external work:** Safety glasses, nitrile gloves, PPE appropriate for coolant handling.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Compressed air canister or garden hose | Low-pressure water rinse (do NOT use high-pressure washer — can bend radiator fins) | Clearing radiator fin debris |
| Soft bristle brush | Non-metallic, nylon bristles | Gentle cleaning of radiator fins |
| Infrared thermometer | -20°C to 200°C | Checking radiator inlet/outlet temperature differential |
| Flashlight / inspection light | For examining radiator and coolant lines | Visual inspection |
| Coolant test strips | For ethylene glycol concentration check | Coolant quality verification (if top-off needed) |
| 50/50 ethylene glycol / DI water premix | Approximately 500mL | Coolant reservoir top-off |
| Nitrile gloves + safety glasses | PPE | Coolant handling |
| Tesla Fleet Service app | On Tesla-issued technician device | Remote diagnostics and Tesla escalation |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage via Tesla Fleet Operations Portal**
1. Log into the Tesla Fleet Operations portal (accessible only to Tesla-authorized operators). Navigate to the V3 site and identify the specific power cabinet triggering `VC-THRM-001`.
2. Review the telemetry history:
   - **Coolant temperature (°C):** A gradual rise over days/weeks suggests radiator fouling or pump degradation. A sudden spike suggests a leak or pump failure.
   - **Coolant flow (L/min):** Should be 8-12 L/min during a charging session. If declining over time (e.g., 12 → 9 → 6 → alarm), the pump is degrading.
   - **Cabinet internal temperature:** Should track coolant temperature. If cabinet temp is high but coolant temp is normal, the airflow sensors inside the cabinet may be the issue (separate fault path).
3. Check which stalls are affected. If all 4 stalls are throttling, the shared Power Cabinet is the issue. If only 1-2 stalls are throttling, the per-stall cable cooling lines may be restricted.
4. Attempt a remote charger restart. Some thermal faults latch after a brief spike and can be cleared by rebooting the control system.

**Step 4.2: On-Site External Radiator Inspection**
1. Locate the radiator on the back of the V3 Power Cabinet. It is a flat aluminum fin-and-tube heat exchanger, typically 60cm × 40cm, mounted to the rear panel with the fins facing outward.
2. **Visually inspect the radiator fins.** Common debris: cottonwood/poplar seeds (pack into the fins like cotton), leaves, insects, road dust compacted into a film. Debris severely reduces airflow and thermal performance.
3. Use the soft bristle brush to gently remove loose debris from the fin surface — brush parallel to the fin channels (top-to-bottom), not across them.
4. If debris is packed deep in the fins, use low-pressure water (garden hose, NOT a power washer) to rinse through the fins from the inside (clean side) outward. Allow the radiator to dry before the charger resumes full operation.
5. Use the infrared thermometer to measure temperature at the radiator inlet pipe and outlet pipe. Under load, the temperature differential should be **5-15°C** (inlet cooler, outlet warmer). A differential of <3°C with a high coolant temperature alarm suggests poor flow, not a blocked radiator.

**Step 4.3: Coolant Level Check and Top-Off**
1. The coolant reservoir (a translucent plastic bottle, approximately 1 liter capacity) is located on the exterior of the Power Cabinet near the base. The MIN and MAX markings are visible on the side of the bottle.
2. If the coolant level is below MIN, top off with the 50/50 glycol/DI water premix. Add slowly — do not overfill above MAX.
3. Use coolant test strips to verify glycol concentration: should be 40-60% glycol for freeze protection and corrosion inhibition. A concentration below 30% provides inadequate protection below -15°C.
4. Check around the reservoir, the coolant lines, and the base of the cabinet for signs of coolant leakage (dried glycol residue has a characteristic shiny greenish-yellow film, and coolant smells faintly sweet).

**Step 4.4: Coolant Line Inspection**
1. Trace the coolant lines from the Power Cabinet down through the conduit to each stall pedestal. Look for:
   - Drips or puddles at the conduit entry points
   - Bulging or soft spots on the hoses at connection fittings
   - Ice formation (in winter) at a joint that is weeping coolant
2. Note any leakage locations and report them in the Tesla Fleet Operations portal with photographs. Coolant line repair inside the conduit requires Tesla service.

**Step 4.5: Escalation to Tesla Service**
1. If radiator cleaning and coolant top-off do not resolve the thermal alarm, escalate through the Tesla Fleet Operations portal (Service → Request Repair → Thermal System).
2. Tesla will schedule a service visit. Internal cooling system components (pump, lines, fittings inside the cabinet) require Tesla-proprietary service tools and cannot be independently serviced.

### 5. Verification & Testing

1. After external radiator cleaning, allow the radiator and system to return to ambient temperature (approximately 15-30 minutes in a hot environment).
2. Monitor the Tesla Fleet Operations portal for the thermal alarm status. After the charger resumes normal operation, check that coolant temperature during a full-power session stays below 60°C.
3. Verify coolant flow rate in the portal telemetry: should return to 8-12 L/min with a clean radiator and healthy pump.
4. Observe the power output on all 4 stalls. If the V3 was throttling before the cleaning, it should now deliver full 250kW (up to the limit based on how many cars are connected and sharing the 350kW cabinet capacity).
5. Check for any new coolant leaks 30 minutes after the system resumes operation (thermal cycling of fittings can reveal slow weeps).
6. Log all work performed in the Tesla Fleet Operations portal, including before/after photos of the radiator, coolant level measurement, and any leak locations noted.
