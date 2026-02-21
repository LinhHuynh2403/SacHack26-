# Tritium Veefil-RT 50kW
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Power
**Target Part:** Isolation Fault Monitor
**Expected Error Code:** `TR-PWR-ISO`
**Revision:** 1.4
**Date:** 2024-03-12

---

### 1. Symptom & Identification
When a failure occurs in the Isolation Fault Monitor, the system will typically issue the error code `TR-PWR-ISO` to the central operations dashboard. 
Drivers at the station may report the station as "Out of Order" or experience unexpected session terminations.

### 2. Safety Precautions (CRITICAL)
> [!CAUTION]
> **HIGH VOLTAGE CAPACITORS PRESENT.**
> Wait exactly 5 minutes after disconnecting utility power before opening the primary cabinet.
> **LOTO (Lockout / Tagout)** procedures must be strictly followed at the upstream breaker.
> Wearing Class 0 (1000V) electrical safety gloves is mandatory when working near the busbars.

### 3. Required Tools
*   T25 and T30 Security Torx Drivers
*   Digital Multimeter (Fluke 87V or equivalent)
*   Insulated Torque Wrench
*   Replacement Isolation Fault Monitor

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Initial Triage**
1. Do not immediately remove the component. First, reboot the station to clear any software latches.
2. If `TR-PWR-ISO` persists after boot sequence, proceed with physical inspection.

**Step 4.2: Accessing the Enclosure**
1. Remove the front-facing cosmetic panel.
2. Unfasten the 6x M5 bolts holding the weather-seal plate.
3. Locate the Isolation Fault Monitor inside the chassis.

**Step 4.3: Diagnostic Testing**
1. Disconnect the logic/control cables from the Isolation Fault Monitor.
2. Check for continuity. If the multimeter reads an open circuit where 120 ohms is expected, the internal bus is compromised. 
3. *Recommendation: Measure resistance to ground (Must be > 100kOhm)*

**Step 4.4: Replacement**
1. Unplug the main harness. 
2. Slide the Isolation Fault Monitor out of the bracket. 
3. Insert the new component and torque all electrical lugs to the specification found on the part sticker (typically 6.5 Nm).

### 5. Verification & Testing
1. Re-engage the main breaker.
2. Wait 120 seconds for the boot sequence to complete.
3. Ping the charger from the diagnostic technician app to verify `TR-PWR-ISO` has cleared.
4. Perform a 5-minute test charge sequence using the EV emulator tool.
