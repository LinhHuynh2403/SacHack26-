# Tritium Veefil-RT 50kW DC Fast Charger
## Document Type: Maintenance & Troubleshooting Manual
**Component Category:** Payment / Authentication
**Target Part:** Integrated Credit Card and RFID Payment Terminal
**Expected Error Code:** `TR-CC-NA`
**Revision:** 2.1
**Date:** 2025-01-08

---

### 1. Symptom & Identification

The Tritium Veefil-RT payment system differs from ChargePoint's RFID-only approach — the Veefil-RT has an **integrated multi-modal payment terminal** mounted on the front face of the unit. This terminal supports:
- **EMV credit/debit card** (chip + PIN and contactless/tap-to-pay)
- **RFID network cards** (ISO 14443-A, 13.56 MHz) — compatible with multiple charging networks depending on the CPO's configuration
- **QR code display** on some hardware revisions (drivers scan with their phone to pay via app)

The payment terminal is a **self-contained unit** (an off-the-shelf commercial payment terminal from Ingenico or Verifone in most deployments) integrated into the Veefil-RT front panel, communicating with the charger's main controller via Ethernet or USB.

**Error `TR-CC-NA` ("Credit Card Not Available") is generated when:**
- The payment terminal application fails to start or crashes during boot
- The payment terminal loses its network connection to the payment processor backend
- The terminal's tamper sensor is triggered (physical security feature — any unauthorized opening of the terminal housing triggers a security wipe and locks the terminal)
- The credit card reader magnetic stripe head fails
- The terminal's EMV chip reader contacts are worn or dirty

**Important: Payment terminal vs. charger operation:** The Veefil-RT can be configured to allow "free charging" or "network-authenticated only" sessions when the payment terminal is offline. Check the CPO's configuration before deciding urgency. If the site is configured for **network-authenticated charging only**, a payment terminal failure means no users can start sessions — high urgency. If configured for **free charging with optional payment**, the terminal failure is lower urgency.

**Common causes and frequency:**

| Cause | Notes |
|-------|-------|
| Payment network connectivity loss (backend) | Most common — transient, resolves without dispatch |
| Terminal software crash | Common — power cycle usually resolves |
| EMV reader dirty contacts | Moderate frequency — especially in dusty environments |
| Magnetic stripe reader failure | Moderate — declining relevance as EMV becomes universal |
| Terminal tamper event (weather seal broken) | Typically vandalism or aggressive cleaning — terminal must be replaced |
| Terminal hardware failure | Rare |

### 2. Safety Precautions

> [!NOTE]
> The payment terminal is a low-voltage component (5V USB or 12V DC supply) mounted in the front face of the Veefil-RT. For terminal power cycling and front-panel access, the unit does NOT need to be de-energized if the front panel terminal can be accessed without opening the main sealed enclosure.
>
> **Check your specific Veefil-RT installation.** Some configurations require opening the main enclosure to access the terminal's cabling — in those cases, full LOTO and coolant drain are required (see Cooling Manual). On most standard Veefil-RT deployments, the payment terminal has its own access panel on the front face that opens independently.

**For terminal reset and front-panel work (no main enclosure opening):** No LOTO required.
**For terminal internal cable work (requires main enclosure):** Full LOTO and coolant drain required.

**PPE:** Safety glasses. Nitrile gloves if handling the front panel in wet conditions (risk of wet contact with 12V terminal supply — not hazardous but good practice).

> [!WARNING]
> **Do NOT attempt to open the payment terminal housing.** EMV-compliant payment terminals have internal tamper-detection mechanisms (mesh overlays, switches, and security keys). Opening the terminal housing triggers a security wipe that permanently disables the terminal and may generate a PCI DSS security incident report to the payment processor. If the terminal housing is physically damaged, replace the entire terminal unit — do not repair.

### 3. Required Tools

| Tool | Specification | Purpose |
|------|--------------|---------|
| Allen key (hex) set | Metric 4mm, 5mm | Front panel access fasteners |
| Standard Phillips #1 and #2 | Screwdrivers | Terminal mounting screws inside panel |
| Digital multimeter | CAT II 300V minimum | Verifying 12V supply to terminal |
| Laptop with MyTritium Portal | Browser access | Remote diagnostics and payment backend status |
| ESD wrist strap | Grounded type | When handling the terminal PCB or connectors |
| Cleaning swabs | Lint-free, IPA-moistened | EMV chip reader contact cleaning |
| Replacement payment terminal | Specific model for your Veefil-RT deployment (Ingenico Link 2500 or Verifone V200c depending on CPO contract) | Hardware replacement |

### 4. Step-by-Step Diagnostic & Repair Procedure

**Step 4.1: Remote Triage via MyTritium Portal**
1. Log into the MyTritium/Exicom portal. Confirm `TR-CC-NA` is the active alert.
2. Check the payment transaction history. If recent transactions were completing normally and the fault just appeared, it is likely a transient payment network issue rather than hardware failure.
3. Verify the charger's network connectivity (the payment terminal uses the charger's cellular or Ethernet connection for processing). If the charger itself is also showing network issues (`TR-SYS-OFF` or similar), fix the network first.
4. Contact the payment processor directly (typically the CPO's payment integration — Payroc, Stripe, or the Verifone/Ingenico payment platform) to check for backend outages.
5. Attempt a remote restart of the unit from the MyTritium portal. This reboots the charger and the payment terminal application.

**Step 4.2: On-Site Visual Inspection**
1. Look at the payment terminal display on the Veefil-RT front panel:
   - **Dark screen:** Terminal has lost power or is in a hard failure state
   - **Error message on screen:** Note the exact message — terminal error codes (displayed on the terminal's own screen) provide specific diagnosis
   - **"Out of Service" or "Please Try Again":** Payment backend connectivity issue
   - **Frozen on boot screen:** Terminal application crash
2. Check the terminal's RFID reader light (typically a small LED near the tap-to-pay symbol). It should be illuminated in the ready state.
3. Inspect the physical condition of the terminal front face:
   - Damaged or cracked screen
   - Debris in the card slot (foreign object inserted — pry it out gently with a plastic tool)
   - Evidence of vandalism (pry marks on the terminal housing — indicates a tamper event)

**Step 4.3: Terminal Power Cycle (No Tools Required)**
1. On the Veefil-RT front panel, locate the payment terminal's dedicated power button (a small recessed button on the terminal body, accessible through the front panel opening). Press and hold for 10 seconds to force a power cycle.
2. Alternatively, from the Veefil-RT menu (accessed via the front panel navigation controls): System → Peripherals → Payment Terminal → Restart.
3. Allow 2 minutes for the terminal to boot and establish its connection to the payment backend.
4. Attempt a $0.00 or minimum-value test transaction if your CPO account allows test transactions — this confirms end-to-end payment processing.

**Step 4.4: EMV and RFID Reader Cleaning**
1. Access the payment terminal's front panel. On the Veefil-RT front access panel, there are typically 3x M5 Allen key fasteners around the terminal opening. Loosen these to pull the terminal slightly forward for access.
2. **Card slot cleaning:** Use a commercially available EMV card reader cleaning card (pre-moistened with IPA). Insert and remove the cleaning card 3-5 times. Wait 2 minutes for the contacts to dry before testing.
3. **RFID reader cleaning:** Wipe the RFID reader window with an IPA-moistened lint-free cloth. Dry with a clean cloth.
4. **Magnetic stripe reader cleaning:** Insert and remove an MagTek cleaning card 5 times.

**Step 4.5: Terminal Connectivity Check**
1. If cleaning and power cycling did not resolve the issue, check the terminal's physical network connection:
   - **USB-connected terminal:** Check the USB cable from the terminal to the Veefil-RT main controller (accessible by pulling the terminal forward from its mounting — typically a USB-A to Micro-B or USB-B cable).
   - **Ethernet-connected terminal:** Check the RJ45 cable from the terminal to the Veefil-RT's internal switch.
2. Disconnect and reconnect the cable. Check the cable for damage.

**Step 4.6: Terminal Replacement**
1. Confirm the replacement terminal model matches the original (the CPO's payment processor must provision the new terminal with the site's merchant ID and security keys before deployment — confirm the new terminal is pre-provisioned before dispatching).
2. Access the terminal mounting: 3x M5 Allen key fasteners on the front access panel.
3. Disconnect the power cable (2-pin or USB), network cable, and any additional cables (audio, if present).
4. Slide the terminal out of its mounting bracket.
5. Install the replacement terminal. Connect all cables.
6. Secure the 3x M5 fasteners.

### 5. Verification & Testing

1. Power on the terminal (it should auto-start when power is connected).
2. Allow 2 minutes for the terminal to boot and connect to the payment backend.
3. Verify the terminal display shows the payment-ready screen (displays the CPO's branding and a tap-to-pay prompt).
4. Check that the RFID reader indicator LED is on.
5. Perform a test transaction:
   - **RFID card test:** Tap a registered RFID card. The terminal should respond within 2 seconds with a session start prompt on the Veefil-RT main display.
   - **Credit card test (if live transactions are available):** Insert an EMV credit card. Verify the terminal prompts for PIN or contactless approval and completes the authorization.
6. Verify `TR-CC-NA` has cleared in the MyTritium portal.
7. Start a complete test charging session using the RFID or credit card method. Verify the session starts, energy is delivered, and the session closes with a completed transaction record in the portal.
8. Log the repair: note the root cause (network, EMV cleaning, power cycle, terminal replacement), the original terminal serial number if replaced, and the provisioning confirmation from the payment processor.
