# ABB Terra 54 DC Fast Charger — Payment System
## Maintenance & Troubleshooting Manual
**Component Category:** Payment  
**Target Part:** NFC/RFID Reader Module (Nayax VPOS Touch)  
**Expected Error Code:** `ERR-PAY-01`  
**Charger Specs:** 50 kW DC output, up to 920 VDC, CCS1/CCS2/CHAdeMO, integrated Nayax payment terminal  
**Revision:** 2.1  
**Date:** 2025-09-15  

---

### 1. Symptom & Identification

The ABB Terra 54 uses an integrated Nayax VPOS Touch terminal for contactless payment (NFC/RFID tap-to-pay, credit card, mobile wallet). The terminal communicates with the Nayax cloud backend over a dedicated 4G LTE cellular modem with its own SIM card, independent of the charger's main OCPP communication link.

When the payment terminal fails, the system issues error code `ERR-PAY-01` on the ABB Ability dashboard. Common symptoms include:

- Drivers cannot initiate a charging session via tap-to-pay — the NFC reader does not respond
- The Nayax VPOS screen shows "OFFLINE" or remains blank
- The ABB Ability dashboard shows the unit as "Payment Unavailable" even though charging via RFID membership card or app may still work
- The 4G signal LED on the Nayax module is solid red (no connection) instead of green (connected)
- Heartbeat messages from the Nayax terminal to the Nayax cloud stop — latency spikes from <500ms to timeout

**Failure pattern:** Payment failures often correlate with cellular network degradation. Signal strength drops from a healthy -72 dBm to below -90 dBm, heartbeat latency climbs from hundreds of milliseconds to tens of seconds, and eventually the modem loses connectivity entirely. This can be caused by a damaged antenna, SIM card failure, or network outage.

### 2. Safety Precautions

> **DANGER — HIGH VOLTAGE DC**  
> The ABB Terra 54 operates at up to **920 VDC** internally. The payment terminal itself runs on 12V DC, but it is housed inside the same cabinet as the high-voltage power electronics.

1. **LOTO (Lockout/Tagout):** Disconnect and lock out the upstream AC breaker before opening the cabinet for any reason.
2. **Capacitor discharge:** Wait **5 minutes** after power-down before opening the cabinet.
3. **PPE required:**
   - Class 0 electrical safety gloves rated to 1000V
   - Safety glasses with side shields
4. **ESD precaution:** The Nayax VPOS module contains sensitive electronics. Wear an ESD wrist strap grounded to the chassis when handling the payment terminal PCB or antenna.
5. The Nayax module has its own internal lithium coin cell battery (CR2032) for configuration retention. Handle per lithium battery safety guidelines.

### 3. Required Tools

- T25 Security Torx driver
- #2 Phillips screwdriver
- Digital multimeter (Fluke 87V or equivalent)
- ESD wrist strap
- SIM card ejector tool or small paperclip
- Laptop with USB-A cable for Nayax firmware updates (Nayax NayaxManage software)
- Replacement Nayax VPOS Touch module (if needed)
- Replacement 4G LTE antenna (ABB Part #3HEA81200, if needed)
- Replacement SIM card (contact your cellular provider or Nayax support)

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1 — Remote Triage (Before Site Visit)**
1. Check the ABB Ability dashboard for `ERR-PAY-01` fault details and timestamp.
2. Log into the Nayax NayaxManage portal (or contact Nayax support) to check the terminal's last heartbeat timestamp and connectivity status.
3. If the terminal was recently online (within 1 hour), a remote reboot via ABB Ability may resolve the issue. Trigger a remote reboot and wait 5 minutes.
4. If the terminal has been offline for >1 hour, proceed to on-site diagnosis.

**Step 4.2 — Accessing the Payment Terminal**
1. Perform LOTO on the upstream breaker. Wait 5 minutes for capacitor discharge.
2. Remove the front cosmetic panel (4x T30 Security Torx screws).
3. The Nayax VPOS module is mounted on the inside of the front panel assembly, behind the NFC tap-to-pay zone (marked with the contactless payment symbol on the exterior).
4. Disconnect the 6-pin power/data ribbon cable from the Nayax module. Note the orientation for reinstallation.

**Step 4.3 — Diagnostic Testing**
1. **SIM card check:** Eject the SIM card from the Nayax module's SIM slot (located on the side edge). Inspect for corrosion, damage, or improper seating. Reinsert firmly until it clicks.
2. **Antenna inspection:** Follow the coaxial antenna cable from the Nayax module to the external 4G antenna (mounted inside the top of the cabinet). Check for:
   - Loose SMA connector at either end (hand-tighten to snug, do NOT use pliers)
   - Damaged or kinked coaxial cable
   - Corroded antenna element (common in coastal or high-humidity locations)
3. **Power supply check:** With the 6-pin ribbon cable disconnected, measure voltage at the charger-side connector. Expected: 12.0V DC (±0.5V) between pins 1 (+) and 2 (GND). If voltage is absent or below 11V, the internal 12V DC-DC converter may have failed — escalate to ABB support.
4. **NFC antenna test:** With the Nayax module powered on (ribbon cable connected, breaker ON), hold a known-good NFC card within 2cm of the reader face. If the module's green status LED flashes, the NFC antenna and reader IC are functional. If no response, the NFC antenna coil or reader IC has failed — replace the module.
5. **Cellular signal test:** On the Nayax module's diagnostic screen (or via NayaxManage software over USB), check:
   - Signal strength: Must be above **-85 dBm** for reliable operation. Below -90 dBm will cause frequent disconnections.
   - Network registration: Should show "Registered" or "Roaming." If "Not Registered," the SIM may be deactivated.
   - APN configuration: Verify it matches the carrier's APN settings.

**Step 4.4 — Repair / Replacement**

*If SIM card issue:*
1. Replace with a new activated SIM card from the cellular provider.
2. Power cycle the Nayax module and wait for network registration (up to 3 minutes).

*If antenna issue:*
1. Replace the 4G antenna (ABB Part #3HEA81200). Route the new coaxial cable along the existing cable path. Secure with cable ties to prevent interference with the cabinet door.
2. Hand-tighten both SMA connectors to 0.5 Nm (finger-tight plus 1/4 turn).

*If Nayax module failure:*
1. Disconnect the 6-pin ribbon cable and the coaxial antenna cable.
2. Remove the module from its mounting bracket (2x Phillips screws).
3. Install the replacement module. Reconnect the ribbon cable (match orientation) and antenna cable.
4. Connect a laptop via USB and use NayaxManage to provision the new module with the site's terminal ID and merchant configuration.

### 5. Verification & Testing

1. Re-engage the upstream breaker. Wait 120 seconds for boot.
2. Check the ABB Ability dashboard — confirm `ERR-PAY-01` has cleared.
3. On the Nayax module, verify:
   - Status LED is solid green (connected to Nayax cloud)
   - Signal strength is above -85 dBm
   - Heartbeat latency is below 500ms
4. Perform a **live payment test**: Tap a credit card or mobile wallet on the NFC reader. Confirm the transaction initiates and a test charge session starts.
5. Confirm the transaction appears in the NayaxManage portal within 60 seconds.
6. Log the repair in ABB Ability with the component replaced and new SIM ICCID (if applicable).
