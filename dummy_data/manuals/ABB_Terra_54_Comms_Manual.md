# ABB Terra 54 DC Fast Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Comms
**Target Part:** LTE Cellular Modem and OCPP Communications Gateway
**Expected Error Code:** `ERR-NET-4G`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The ABB Terra 54 communicates with the ABB Ability cloud platform and the Charge Point Operator's (CPO) back-end system via two independent communication pathways:

1. **Primary: 4G LTE cellular modem** — Sierra Wireless HL7800-M module on a mini-PCIe card, with an external SMA antenna mounted inside the cabinet lid. Uses a standard Nano-SIM. This is the path for OCPP 1.6J (JSON over WebSocket) messages and telemetry uploads.
2. **Secondary: Ethernet (optional)** — RJ45 port on the rear of the cabinet for sites with hardwired network connectivity. When Ethernet is connected and configured, the charger will prefer it over LTE and fall back to LTE if Ethernet drops.

**Error code `ERR-NET-4G` indicates the charger has lost its primary LTE connection** for more than 5 consecutive minutes. During a network outage, the Terra 54 continues to operate in **offline mode** — it can still initiate and complete charging sessions using locally cached authorization lists, but it cannot process credit card payments, update session records, or upload telemetry.

**Common causes of `ERR-NET-4G`:**

- **SIM card issues:** Expired SIM, unpaid data plan, SIM not properly seated in the socket. The SIM socket is spring-loaded and occasionally vibrates loose in high-traffic installations.
- **Antenna disconnection:** The SMA antenna cable connector can work loose due to thermal cycling (expansion/contraction of the cabinet). A finger-tight SMA connection loses about 3-6 dB of signal.
- **Modem firmware hang:** The HL7800-M module occasionally locks up and requires a power cycle. This is the most common cause and a remote reboot from ABB Ability will resolve it.
- **Cell tower issues:** Temporary carrier outages, tower maintenance, or a new building obstructing the signal path. Check the modem's RSSI history in ABB Ability before dispatching.
- **Modem hardware failure:** Rare. The HL7800-M module has no moving parts and typically lasts the life of the charger.

**Impact assessment:** If the charger is in offline mode, RFID-authenticated users can still charge (if their cards are in the local cache), but credit card / app-based users cannot. Prioritize dispatch based on the site's payment mix.

### 2. Safety Precautions

> [!NOTE]
> **The LTE modem and antenna are low-voltage components (3.3V DC) located in the communications compartment, which is physically separated from the high-voltage power section.** For modem/SIM/antenna work ONLY, it is NOT necessary to de-energize the entire charger or perform LOTO — the communications compartment can be accessed while the charger is energized and operational.
>
> **However:** If you need to access the communications compartment through the main cabinet (i.e., the charger does not have a separate comms access panel), you MUST follow full LOTO procedures as the main cabinet contains the high-voltage power stack.

**Verify your unit's configuration before proceeding:**
- **Units with separate comms access panel (top or side of cabinet):** Proceed without de-energizing. Use basic PPE (safety glasses, ESD wrist strap).
- **Units without separate comms panel:** Follow full LOTO per the Power Manual (de-energize, 5-minute cap discharge wait, verify 0V on DC bus).

> [!CAUTION]
> **ESD sensitive components.** The LTE modem module and SIM card are sensitive to electrostatic discharge. Wear an ESD wrist strap grounded to the cabinet chassis before handling the modem card or SIM.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Security Torx driver | T25 | Comms panel fasteners (2x screws) |
| ESD wrist strap | Grounding type with alligator clip | Protecting modem and SIM from static |
| SIM card ejection tool | Standard nano-SIM tray tool (or paperclip) | Removing SIM from spring-loaded socket |
| SMA torque wrench | 5/16" or 8mm, torque to 0.56 Nm (5 in-lbs) | Antenna connector — hand-tight is insufficient, over-tight damages connector |
| Replacement SIM card | Carrier-specific, pre-activated with data plan | If SIM is faulty — obtain from CPO/ABB before dispatch |
| Replacement LTE modem | Sierra Wireless HL7800-M on mini-PCIe carrier | If modem is confirmed dead — rare |
| Laptop with USB-to-serial cable | Terminal software (PuTTY, Tera Term) | For modem AT command diagnostics if needed |
| Cell signal meter (optional) | RF signal strength measurement | Verifying adequate LTE coverage at the cabinet antenna location |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Diagnosis (Before Dispatching)**
1. Log into ABB Ability. Check the unit's last-seen timestamp. If the unit dropped off recently (within the last few hours), it may be a transient carrier outage.
2. Check the modem RSSI (signal strength) history. Normal is -65 to -85 dBm. If RSSI has been gradually declining over weeks, an external obstruction may have been introduced (new building, new signage, vegetation growth near antenna).
3. Attempt a remote reboot from ABB Ability. This power-cycles the entire charger including the modem. Wait 5 minutes and check if the unit reconnects.
4. If the unit has Ethernet as a secondary link, check if Ethernet is also down. If both are down simultaneously, the issue is likely the charger's internal network switch or controller, not the LTE modem.
5. Contact the SIM card carrier (ATT, Verizon, T-Mobile, etc.) to verify the SIM is active and the data plan has not expired or exceeded its cap.

**Step 4.2: On-Site Signal Assessment**
1. Before opening the cabinet, use your cell phone to check your own signal strength at the charger location. If your phone shows 1 bar or less, the site may have inherently poor LTE coverage.
2. If the site has known poor coverage, consider recommending an external antenna upgrade (high-gain antenna mounted on a pole above the charger) or a switch to hardwired Ethernet.

**Step 4.3: Access the Communications Compartment**
1. Identify whether the unit has a separate comms access panel. On most Terra 54 configurations, it is a small panel on the upper-right side of the cabinet secured with 2x T25 screws.
2. If no separate panel exists, follow full LOTO procedures and remove the main front panel.
3. Attach your ESD wrist strap to the cabinet chassis (bare metal ground point).

**Step 4.4: SIM Card Inspection**
1. Locate the SIM socket on the modem carrier board. It is a push-push type socket — press the SIM in gently to release it.
2. Remove the SIM and inspect it for corrosion, scratches on the gold contacts, or physical damage.
3. Clean the SIM contacts with isopropyl alcohol on a lint-free cloth if they appear tarnished.
4. Re-insert the SIM firmly until it clicks into the locked position. Ensure it is oriented correctly — the notched corner matches the socket's guide.

**Step 4.5: Antenna Inspection**
1. Trace the SMA coaxial cable from the modem to the antenna (typically mounted on the inside of the cabinet lid with a magnetic or adhesive base).
2. Check the SMA connector at the modem end. It should be finger-tight plus a slight snug with the SMA wrench (0.56 Nm / 5 in-lbs). If it spins freely, this is likely the root cause.
3. Inspect the cable for sharp bends, pinches, or damage where the cable routes through the cabinet. A damaged coax cable causes signal loss without any visible external indication.
4. Check the antenna itself. If it has been knocked off its mounting position or is lying flat against the metal cabinet wall, LTE reception will be severely degraded. Re-mount it in the intended position (usually vertical, on the cabinet lid interior).

**Step 4.6: Modem Diagnostics**
1. Check the modem module's LED indicators on the mini-PCIe carrier board:
   - **Power LED (green):** Should be ON. If OFF, the modem is not receiving power — check the modem power cable from the control board (2-pin connector on the carrier board).
   - **Network LED (blue):** Blinking = searching for network. Steady = registered on network. OFF = modem hung or no SIM detected.
2. If the modem appears hung (Power ON, Network OFF, SIM properly seated), remove the modem's power connector for 10 seconds, then reconnect. This performs a hard power cycle of just the modem.
3. If the modem still does not register on the network after a power cycle with a known-good SIM, the modem module may be defective. Replace the mini-PCIe modem card.

**Step 4.7: Modem Replacement (if needed)**
1. Disconnect the SMA antenna cable from the modem.
2. Disconnect the 2-pin power connector.
3. Remove the single Phillips screw holding the mini-PCIe card to the carrier board standoff.
4. Slide the modem card out of the mini-PCIe socket at a slight angle (approximately 15°).
5. Install the replacement card: insert into the mini-PCIe socket at 15°, press flat, secure with the Phillips screw.
6. Reconnect the power connector and SMA antenna cable (torque to 0.56 Nm).
7. Transfer the SIM card from the old modem to the new one.

### 5. Verification & Testing

1. If the charger was de-energized, remove LOTO, close the AC breaker, and power on. If the charger was kept running (separate comms panel access), the modem will begin its registration sequence immediately.
2. Watch the modem Network LED. It should go from blinking (searching) to steady (registered) within 60-120 seconds.
3. Wait for the charger to appear online in ABB Ability. This typically takes 2-3 minutes after network registration as the charger establishes its OCPP WebSocket connection.
4. Verify `ERR-NET-4G` has cleared in the ABB Ability event log.
5. From ABB Ability, send a remote "Reset" command to the charger to verify two-way OCPP communication. The charger should acknowledge the command within 10 seconds.
6. Check the modem signal strength in ABB Ability telemetry. Acceptable values:
   - **Excellent:** -65 dBm or stronger
   - **Good:** -65 to -75 dBm
   - **Fair:** -75 to -85 dBm
   - **Poor:** -85 to -95 dBm (consider external antenna upgrade)
   - **Unusable:** weaker than -95 dBm (Ethernet or antenna upgrade required)
7. Perform a test charge with a credit card or payment app to verify that the full transaction flow (authorization → charging → session close → billing) completes successfully over the restored network connection.
8. Re-install the comms panel (2x T25 screws) or main front panel if applicable.
9. Log the repair in ABB Ability: note whether the fix was SIM reseat, antenna reconnection, modem power cycle, or modem replacement.
