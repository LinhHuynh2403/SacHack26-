# ChargePoint CT4000 Series Level 2 Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Communications
**Target Part:** 4G LTE Cellular Communications Module
**Expected Error Code:** `CP-ERR-WIFI`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

Despite its error code name (`CP-ERR-WIFI`), the ChargePoint CT4000 primarily uses **4G LTE cellular** for network communication with the ChargePoint cloud backend, not Wi-Fi. The error code name is a legacy artifact from earlier ChargePoint models that used Wi-Fi. The CT4000 also supports optional Wi-Fi on later hardware revisions (Gen 2, serial numbers > CT4G-2XXXX).

**Communication architecture:**
- **Primary:** 4G LTE via embedded Sierra Wireless module (Nano-SIM, pre-provisioned by ChargePoint)
- **Secondary (Gen 2 only):** 802.11b/g/n Wi-Fi, typically used when the charger is installed inside a covered parking structure with poor cellular signal
- **Protocol:** OCPP 1.6J (JSON over WebSocket) to ChargePoint's CSMS (Charge Station Management System)

`CP-ERR-WIFI` is reported when the station has been unable to communicate with the ChargePoint cloud for more than **10 minutes**. In offline mode, the CT4000 can still start sessions for users whose credentials are cached in the local authorization list. However, credit card / app-only users, and users not in the local cache, will be denied.

**Common causes and their relative frequency:**

| Cause | Notes |
|-------|-------|
| Cellular carrier outage (T-Mobile or AT&T depending on SIM) | Temporary — resolve within hours |
| SIM card data cap exceeded | ChargePoint manages SIM — contact ChargePoint NOC |
| Modem firmware hang | Cleared by remote or physical reboot |
| SIM card not seated properly | Check after any vibration-heavy events (earthquakes, heavy trucks) |
| LTE antenna damaged or disconnected | Often caused by cabinet entry for other service — antenna cable snagged |
| Modem hardware failure | Rare |
| Wi-Fi configuration issue (Gen 2 only) | SSID/password changed at site without updating charger config |

**Important:** The CT4000's SIM card is **ChargePoint-managed** — it is pre-provisioned and locked to the ChargePoint CSMS. You cannot use a generic carrier SIM. If the SIM itself is defective, contact ChargePoint Support (1-888-758-4389) to have a replacement shipped before dispatching.

### 2. Safety Precautions

> [!NOTE]
> The LTE/Wi-Fi module is a low-voltage component (3.3V). For modem/SIM/antenna work, the cabinet must be opened, which exposes 240VAC power wiring. **Full LOTO is required before opening the cabinet.**

> [!NOTE]
> **ESD precautions:** The LTE modem module is sensitive to electrostatic discharge. Always touch the cabinet chassis (bare metal) before handling the modem or SIM card to discharge any static buildup.

**LOTO procedure:** Lock out the upstream 240VAC breaker at the electrical panel. Verify 0VAC at the contactor input terminals before working inside the cabinet. No capacitor discharge wait needed.

**PPE:** Safety glasses, ESD awareness (touch chassis before handling electronics).

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Phillips #2 screwdriver | Standard | Cabinet access screws |
| Nano-SIM ejection tool | Standard smartphone SIM tool | Ejecting SIM from tray |
| SMA torque wrench | 5/16" (8mm), torque 0.56 Nm | Antenna cable retightening |
| Digital multimeter | CAT II 300V minimum | LOTO verification |
| Laptop with ChargePoint Operations Portal access | Chrome or Firefox | Remote triage and post-repair verification |
| Smartphone with strong LTE signal | For on-site signal quality reference | Baseline signal check |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage (Do This Before Dispatching)**
1. Log into the ChargePoint Operations Portal. Confirm `CP-ERR-WIFI` on the target station.
2. Check the **"Last Communication"** timestamp. If it was less than 30 minutes ago, the connection may have just dropped — wait and monitor.
3. Attempt a **remote restart** from the portal (Actions → Restart). If the modem is in a hung state, a power cycle resolves it. Wait 3 minutes and check if the station reconnects.
4. Call ChargePoint Support and ask them to check the SIM card status from their end. They can see whether the SIM is active, how much data it has used, and whether there are any carrier-reported issues with the SIM.
5. Check if any other ChargePoint stations in the same area are reporting connectivity issues — if so, this is likely a carrier outage, not a hardware fault with this specific unit.

**Step 4.2: On-Site Signal Check (Before LOTO)**
1. Stand at the charger and check your phone's LTE signal strength. The CT4000 antenna is inside the cabinet and has less gain than a smartphone's external antenna, so if your phone shows 2+ bars, the charger should be able to communicate.
2. If your phone shows 1 bar or less, the site may have inherently poor coverage. Consider recommending a Wi-Fi connection (if the site has Wi-Fi and the charger is Gen 2) or an external LTE antenna upgrade.
3. Look at the CT4000's front display. If it shows "Network Error" or a Wi-Fi/signal icon with an X, connectivity is confirmed lost.

**Step 4.3: LOTO and Cabinet Access**
1. Lock out the upstream breaker. Verify 0VAC at contactor input.
2. Open the CT4000 cabinet rear panel (4x Phillips M4).

**Step 4.4: SIM Card Inspection**
1. Locate the LTE modem module. On the CT4000, it is a Telit or Sierra Wireless module soldered to the main control board (not on a separate mini-PCIe card like ABB units). The SIM card slot is a spring-loaded tray on the side of the modem.
2. Use the SIM ejection tool to release the SIM tray.
3. Remove the SIM and inspect:
   - Check for visible damage or corrosion on the gold contacts
   - Check if it is a ChargePoint-issued SIM (should have ChargePoint branding or part number printed on it)
   - If the contacts appear tarnished, clean with isopropyl alcohol on a lint-free cloth
4. Re-insert the SIM tray firmly until it clicks. It can be inserted only one way — the angled corner orients the SIM.

**Step 4.5: Antenna Inspection**
1. Locate the LTE antenna. The CT4000 typically uses a flat adhesive patch antenna mounted on the inside of the cabinet door (upper section). It connects to the modem via a thin U.FL (IPEX) coaxial pigtail to an SMA bulkhead, then an SMA cable to the modem.
2. At the modem end, check the U.FL connector — these very small connectors can pop off when the cabinet door is opened/closed, especially during previous service calls.
3. Press the U.FL connector firmly onto the modem's RF port until you hear/feel a click.
4. Check the SMA connectors in the antenna cable path. Re-torque any finger-loose SMA connections to 0.56 Nm.
5. Ensure the antenna patch is still adhered to the cabinet door interior — if it has fallen loose, re-adhere it with the adhesive backing, or use double-sided foam tape. The antenna performs best when flat against the metal surface, not bunched up.

**Step 4.6: Wi-Fi Reconfiguration (Gen 2 CT4000, if Wi-Fi is the intended primary path)**
1. If the site previously used Wi-Fi and the network password or SSID was changed:
2. From the ChargePoint Operations Portal, navigate to the station's Network Configuration page.
3. Update the SSID and pre-shared key (PSK) with the new Wi-Fi credentials.
4. Apply the configuration change — the ChargePoint backend will push this to the charger on next connectivity. This is a chicken-and-egg problem if the charger is currently offline — in that case, the update must be applied via the charger's local maintenance port (USB or Ethernet, using the ChargePoint Service Tool app).

### 5. Verification & Testing

1. Remove LOTO. Restore the upstream breaker.
2. Allow the CT4000 to boot (60 seconds). Watch the front display — after boot, a cellular signal indicator should appear in the corner of the display.
3. Wait up to 3 minutes for the charger to establish its OCPP WebSocket connection to ChargePoint's servers.
4. Verify the station appears **"Online"** in the ChargePoint Operations Portal.
5. Confirm `CP-ERR-WIFI` has cleared from the active alerts list.
6. From the portal, send a **"Get Configuration"** OCPP command to the charger. The charger should respond within 5 seconds with its configuration parameters — this confirms bidirectional OCPP communication is functioning.
7. Attempt an RFID-authenticated test session to ensure end-to-end functionality (authentication, session start, energy delivery, session end, cloud record) is working over the restored connection.
8. Check the signal strength indicator in the ChargePoint portal (if available for your account tier) — should show at least 2 bars.
9. Close the cabinet. Log the repair: note whether the fix was SIM reseat, antenna reconnection, Wi-Fi reconfiguration, or modem power cycle. If no hardware issue was found and the connection restored after a power cycle, flag the modem for potential replacement on the next scheduled maintenance visit.
