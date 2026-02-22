# Tritium Veefil-RT 50kW DC Fast Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Communications
**Target Part:** Main Controller Communications — OCPP Gateway and Network Interface
**Expected Error Code:** `TR-SYS-OFF`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

**Tritium Veefil-RT Communications Architecture:**

The Veefil-RT communicates with the CPO's back-end via **OCPP 1.6J (JSON over WebSocket)**, the same standard as the ABB Terra 54. Unlike the ABB unit's modular Sierra Wireless modem, the Veefil-RT has its network interface integrated directly onto the **main controller PCB**.

**Network connectivity options (hardware-dependent on Veefil-RT revision):**
- **Ethernet (RJ45):** Standard on all units, accessible via a rear service panel port
- **4G LTE cellular:** Optional upgrade module, mounted on a mini-PCIe slot on the main controller PCB
- **Wi-Fi (802.11 b/g/n):** Available on later Veefil-RT revisions

The Veefil-RT's operational status message to the OCPP backend is distinct from that of other chargers: rather than separate "Available" and "Faulted" statuses for individual ports, the Veefil-RT reports its full status under a single charger ID. `TR-SYS-OFF` is the charger's last reported event before its OCPP heartbeat stops.

**`TR-SYS-OFF` — "System Offline" — can indicate:**
1. **Network connectivity loss:** The OCPP WebSocket connection dropped and the charger cannot reconnect
2. **Controller firmware crash:** The main controller's operating system (Linux-based) has hung or kernel-panicked
3. **Main controller hardware failure:** Power supply to the controller PCB, or PCB hardware failure
4. **Physical damage to the network interface:** Damaged RJ45 port, broken LTE antenna

**Critical note:** Because `TR-SYS-OFF` is the charger going offline, you CANNOT diagnose this fault remotely via the MyTritium portal — the charger is not connected. Physical site inspection is always required.

**Distinguishing causes:**

| Situation | Likely cause |
|-----------|-------------|
| Charger is physically running (LED indicators on, screen active) but offline in portal | Network connectivity issue |
| Charger front panel screen is dark/frozen | Controller crash or hardware failure |
| Charger is running, recently updated OTA firmware | Firmware update failed — controller stuck in boot loop |
| Charger offline after power outage | Controller failed to reconnect after power restore |
| Multiple Tritium units at the same site offline | Site network outage (Ethernet switch, router, or ISP) |

### 2. Safety Precautions

> [!NOTE]
> Network interface components on the main controller PCB are low-voltage (3.3V/5V). For network troubleshooting where the controller is accessible without opening the sealed main enclosure (via the rear service panel), LOTO is NOT required.
>
> **If the rear service panel must remain closed and the main enclosure must be opened for main controller access:** Full LOTO and coolant drain are required.

**For rear service panel work (RJ45, LTE antenna):** No LOTO. Standard PPE (safety glasses).
**For main enclosure access (controller PCB replacement):** Full LOTO, 7-minute wait, 0V verification, coolant drain.

**PPE:** Safety glasses, ESD wrist strap when handling the main controller PCB.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Allen key (hex) set | Metric 4mm, 5mm | Rear service panel fasteners |
| Ethernet cable tester | Handheld cable tester (e.g., Klein VDV501-851) | Verifying Ethernet cable integrity |
| Digital multimeter | CAT II rated | Verifying 12V supply to main controller |
| Laptop with serial console cable | USB-to-RS232 / USB-to-TTL 3.3V UART cable | Direct serial console access to the Veefil-RT Linux controller for debugging |
| USB flash drive | FAT32 formatted, pre-loaded with Veefil-RT firmware recovery image | Firmware recovery (obtain from Exicom support) |
| SMA torque wrench (if LTE module installed) | 5/16" (8mm), 0.56 Nm | Antenna connector re-torque |
| Replacement main controller PCB | Exicom/Tritium part | If controller hardware has failed |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: On-Site Initial Assessment**
1. Approach the Veefil-RT. Check the status LED on the front panel:
   - **LED cycling through colors or showing a pattern:** Controller is alive — this is a network connectivity issue, not a crash
   - **LED solid red:** Fault condition — controller is running but in a halt state
   - **LED off / screen dark:** Controller may be dead or not receiving power

2. Check the Veefil-RT front panel display. If it shows the normal idle screen (even if the charger is offline from the portal's perspective), the controller is running.

3. Check the site's network infrastructure:
   - Is the Ethernet switch at the site powered and operational?
   - Are other devices on the site network (security cameras, etc.) online?
   - If the site uses cellular: is there LTE coverage at this location (check your smartphone)?

**Step 4.2: Controller Reboot (No Tools Required)**
1. Hold the physical reset button on the rear service panel for **15 seconds** (a small recessed button, accessible with a straightened paperclip through the rear panel). This is a hard reset of the Linux controller.
2. Allow 3 minutes for the controller to boot and re-establish its OCPP connection.
3. If the charger comes back online in the portal and `TR-SYS-OFF` clears, the issue was a software crash. Log it but no further action is needed.
4. If the charger does not come back online, proceed.

**Step 4.3: Rear Service Panel Access and Network Inspection**
1. Open the rear service panel (2x M5 Allen key fasteners — this panel does NOT require LOTO to open on most Veefil-RT configurations, as it only exposes the service interfaces).
2. Check the Ethernet RJ45 port on the controller's rear panel:
   - Link/Activity LEDs on the RJ45 port should show green (link) and blinking amber/yellow (activity). If no LEDs are lit, the controller is not detecting an Ethernet link.
   - Disconnect and reconnect the Ethernet cable.
3. If using an Ethernet cable, use the cable tester to verify the cable is not broken. A damaged cable (often from conduit settling or rodent damage) will fail the tester.
4. Check the router/switch at the other end of the Ethernet run:
   - Is the port the Veefil-RT is connected to showing a link? Toggle the port off/on from the switch management interface if accessible.
   - Check the switch's IP address table — is the Veefil-RT's MAC address showing a DHCP lease?
5. If LTE is the primary communication method, check the LTE antenna (an SMA connector on the rear panel or a pigtail antenna inside the rear panel). Re-torque SMA connections to 0.56 Nm.

**Step 4.4: Serial Console Diagnostics (Advanced)**
1. Connect the USB-to-TTL serial console cable to the serial console port on the controller's rear service access points (a 3-pin or 4-pin header labeled "UART" or "CONSOLE" on the controller).
2. Configure terminal software (PuTTY or Tera Term):
   - Baud rate: 115200
   - Data bits: 8, Stop bits: 1, No parity
3. Power cycle the controller (hold reset button). Watch the serial console output:
   - A healthy boot shows Linux kernel messages, then the Veefil-RT OCPP application starting, then "Connected to CSMS" confirming OCPP WebSocket establishment.
   - A boot loop shows the Linux kernel starting, then stopping at the same point repeatedly — suggests a corrupted filesystem or bad firmware update.
   - No output at all with the controller LED lit — UART console hardware failure, proceed to controller PCB replacement.
4. If a boot loop is observed, proceed to the firmware recovery procedure.

**Step 4.5: Firmware Recovery**
1. Prepare a USB flash drive (FAT32 formatted) with the Veefil-RT recovery firmware image (obtain file from Exicom support at support.exicom.com — provide the charger serial number).
2. Insert the USB drive into the Veefil-RT's rear service panel USB-A port.
3. Hold the "RECOVERY" button (labeled on the rear panel) while pressing the reset button. The controller will detect the USB drive and enter recovery mode.
4. The recovery process takes 8-12 minutes. The front panel LED will cycle rapidly during recovery, then stabilize when complete.
5. Remove the USB drive. The controller will reboot with factory firmware and then attempt to download the latest production firmware over the network.

**Step 4.6: Main Controller PCB Replacement (If Hardware Failed)**
1. Perform full LOTO. Drain coolant. Open the main enclosure.
2. The main controller PCB is in the upper control section of the enclosure (separated from the power electronics section by a metal divider).
3. Photograph all connector positions before disconnecting.
4. Disconnect all connectors from the controller PCB (power, communications, I/O, sensor inputs — typically 12-18 connectors on the Veefil-RT controller).
5. Remove the 4x M4 Allen key mounting bolts.
6. Install the replacement PCB. Connect all connectors.
7. The replacement controller PCB ships from Exicom with factory firmware. After power-on, it will need to be configured with the site's OCPP server URL, authentication credentials, and charging profile — use the serial console (Step 4.4) or the Exicom technician portal configuration upload to apply the configuration.

### 5. Verification & Testing

1. Remove LOTO (if applied). Restore the upstream AC breaker.
2. Allow the controller to complete its boot sequence (approximately 90-120 seconds for the Veefil-RT to boot and establish OCPP connection).
3. Verify the charger appears online in the MyTritium/Exicom portal.
4. Confirm `TR-SYS-OFF` has cleared from the alert history (it will remain in the history as a past event — verify it is not still active).
5. Send a **remote "Reset" OCPP command** from the portal to verify bidirectional communication is working. The charger should acknowledge within 10 seconds.
6. Check the network latency metric in the portal (if available) — it should be below 200ms for cellular connections and below 50ms for Ethernet.
7. Initiate a test charging session with the EV emulator or test vehicle. Verify that OCPP "StartTransaction" and "StopTransaction" messages are being sent and acknowledged in real time (visible in the portal's message log if your account has OCPP debug access).
8. If firmware was recovered or a new controller was installed, verify the charger's configuration settings (power limits, OCPP server URL, authentication mode) match the CPO's intended configuration.
9. Log the repair: note the root cause (network cable, firmware crash, controller replacement), the firmware version after repair, and OCPP connectivity test results.
