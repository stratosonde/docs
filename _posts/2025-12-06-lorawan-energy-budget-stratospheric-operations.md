---
layout: post
title: "LoRaWAN Energy Budget for Stratospheric Operations"
date: 2025-12-06 11:00:00 -0700

> **🎧 Listen to this article:** [NotebookLM Podcast]({{ site.baseurl }}/assets/audio/Transmitting_From_Space_With_Frozen_Batteries.m4a)  
> *An AI-generated audio discussion created by Google's NotebookLM*
categories: firmware power rf
tags: [lorawan, energy, spreading factor, SF7, SF10, stratosphere, US915, power budget, transmission]
---

# LoRaWAN Energy Budget for Stratospheric Operations

The cascading power architecture defines *how much energy* is available at each temperature regime. But knowing what's available is only half the equation—we must also understand *how much energy each transmission costs* to intelligently adapt the firmware strategy.

This post connects the LoRaWAN RF parameters to the temperature-dependent power delivery capability, answering the critical question: **Which spreading factor and payload size can we actually use at -60°C?**

## The Energy Equation

A LoRaWAN transmission's energy cost depends on three factors:

$ E_{tx} = P_{tx} \times t_{airtime} = (V \times I) \times t_{airtime} $

Where:
- **V** = Supply voltage (3.3V for the STM32WLE5 radio)
- **I** = PA current draw (varies with TX power setting)
- **t_airtime** = On-air time (determined by SF, bandwidth, and payload size)

For the Stratosonde at +14 dBm (US915 legal limit):
- Voltage: 3.3V
- Current: 26 mA
- Power: 85.8 mW

The variable is airtime—and it varies enormously with spreading factor.

## Energy vs Spreading Factor: The Data

STM32WLE5 LoRa radio characterization at +14 dBm, 125 kHz bandwidth, 4/5 coding rate:

| SF | Payload (app) | Payload (total) | Airtime (ms) | Energy (mJ) | US915 Legal |
|----|---------------|-----------------|--------------|-------------|-------------|
| **SF7** | 11 B | 24 B | 59 ms | **5.0 mJ** | ✓ |
| **SF7** | 51 B | 64 B | 120 ms | 10.3 mJ | ✓ |
| **SF7** | 115 B | 128 B | 212 ms | 18.2 mJ | ✓ |
| **SF7** | 222 B | 235 B | 366 ms | 31.4 mJ | ✓ |
| **SF8** | 11 B | 24 B | 107 ms | 9.2 mJ | ✓ |
| **SF8** | 51 B | 64 B | 209 ms | 18.0 mJ | ✓ |
| **SF8** | 115 B | 128 B | 373 ms | 32.0 mJ | ✓ |
| **SF8** | 222 B | 235 B | 650 ms | 55.8 mJ | ✗ (>400ms) |
| **SF9** | 11 B | 24 B | 194 ms | 16.6 mJ | ✓ |
| **SF9** | 51 B | 64 B | 378 ms | 32.4 mJ | ✓ |
| **SF9** | 115 B | 128 B | 685 ms | 58.8 mJ | ✗ |
| **SF10** | 11 B | 24 B | 387 ms | **33.2 mJ** | ✓ |
| **SF10** | 51 B | 64 B | 715 ms | 61.3 mJ | ✗ |
| **SF11** | 11 B | 24 B | 774 ms | 66.4 mJ | ✗ |
| **SF12** | 11 B | 24 B | 1548 ms | 132.8 mJ | ✗ |

**Key observation**: SF7 11-byte packets cost just **5 mJ**—that's 6.6× cheaper than SF10 11-byte packets.

![LoRaWAN Energy vs Spreading Factor]({{ site.baseurl }}/assets/images/posts/2025-12-06-lorawan-energy-budget/lorawan_energy_plot.png)

## The US915 400ms Constraint

Under US915 regulations, dwell time is limited to 400ms per channel hop. This constrains our options:

**Legal combinations (< 400ms airtime):**
- SF7: All payloads up to 222 bytes
- SF8: Up to 115 bytes
- SF9: Up to 51 bytes
- SF10: Only 11 bytes (our baseline telemetry packet)

**The Stratosonde strategy**: Use **SF10 with 11-byte packets** as the normal mode—maximum range within legal limits, 33.2 mJ per transmission, 387 ms airtime.

## Mapping Energy to Temperature Regimes

The cascading power architecture provides different energy budgets at different temperatures:

| Temperature | Power Source | Available Energy | Max SF/Payload |
|-------------|--------------|------------------|----------------|
| Above -50°C | LTO Battery direct | 100+ mJ | SF10+ any |
| -50°C to -58°C | Supercap buffered | 50+ mJ | SF10 11B |
| -58°C to -63°C | Aluminum polymer | 12.4 mJ | **SF7 51B max** |
| Below -63°C | Ceramic bank | 12.4 mJ | **SF7 11B only** |

**The critical insight**: Below -58°C, we can no longer afford SF10 transmissions. The aluminum polymer capacitor can deliver 12.4 mJ—enough for SF7 (5-18 mJ) but not SF10 (33+ mJ).

## GNSS vs LoRa Ping: The Surprising Tradeoff

Position data is critical for a stratospheric balloon. Two ways to obtain it:

**Option 1: GNSS Fix**
- Hot fix: 25 mA × 1s = **25 mJ**
- Cold fix (ephemeris refresh): 25 mA × 30s = **750 mJ**

**Option 2: LoRa Beacon (gateway-based localization)**
- SF7 11B ping: 26 mA × 59ms = **5 mJ**
- Position derived from gateway RSSI/TDOA metadata

**The math at extreme cold (-60°C):**
- Available energy: 12.4 mJ
- GNSS hot fix: 25 mJ → **Not possible**
- SF7 ping: 5 mJ → **Possible, with margin for 2 pings**

From 20km altitude, line-of-sight extends hundreds of kilometers. Even without coordinates in the packet, if *any* gateway receives the ping, the gateway metadata (location, RSSI, timestamp) provides coarse position data.

**Emergency strategy**: Skip GNSS entirely, send SF7 beacon pings. Geographic uncertainty increases, but mission continuity is preserved.

## Adaptive Transmission Firmware Strategy

Based on energy characterization, the firmware implements temperature-adaptive transmission:

```c
typedef enum {
    TX_MODE_NORMAL,      // SF10, full telemetry, GNSS position
    TX_MODE_DEGRADED,    // SF10, reduced telemetry, GNSS hotfix only
    TX_MODE_EMERGENCY,   // SF7, minimal telemetry, skip GNSS if cold
    TX_MODE_BEACON       // SF7, position ping only, no GNSS
} TransmissionMode_t;

TransmissionMode_t GetTransmissionMode(int8_t temperature_C, uint16_t voltage_mV) {
    // Check both temperature and voltage under load
    if (temperature_C > -50 && voltage_mV > 4000) {
        return TX_MODE_NORMAL;
    } else if (temperature_C > -58 && voltage_mV > 3500) {
        return TX_MODE_DEGRADED;
    } else if (temperature_C > -63 && voltage_mV > 2500) {
        return TX_MODE_EMERGENCY;
    } else {
        return TX_MODE_BEACON;
    }
}
```

### Mode Details

**TX_MODE_NORMAL** (Above -50°C)
- SF10, 11-byte packet: 33.2 mJ
- Full GNSS fix: 25 mJ hot, up to 750 mJ cold
- Total: 58-783 mJ per cycle
- Energy available: 100+ mJ (LTO direct)

**TX_MODE_DEGRADED** (-50°C to -58°C)
- SF10, 11-byte packet: 33.2 mJ
- GNSS hotfix only: 25 mJ (skip if no cached ephemeris)
- Total: 33-58 mJ per cycle
- Energy available: 50+ mJ (supercap buffered)

**TX_MODE_EMERGENCY** (-58°C to -63°C)
- SF7, 11-byte packet: 5.0 mJ
- GNSS hotfix if cached: 25 mJ (skip if unavailable)
- Total: 5-30 mJ per cycle
- Energy available: 12.4 mJ (aluminum polymer)
- **Note**: May need to skip GNSS, use cached position

**TX_MODE_BEACON** (Below -63°C)
- SF7, minimal ping: 5.0 mJ
- No GNSS (cannot afford)
- Total: 5 mJ per cycle
- Energy available: 12.4 mJ (ceramic bank, barely)
- Position: Gateway metadata only

## Transmission Interval Scaling

When energy becomes constrained, extend the transmission interval:

| Mode | Interval | Rationale |
|------|----------|-----------|
| Normal | 5 min | Full solar recharge between transmissions |
| Degraded | 10 min | Allow supercap full recharge |
| Emergency | 15 min | Allow aluminum polymer recovery through cold battery |
| Beacon | 30 min | Maximum conservation, ceramic bank takes time to charge |

At 30-minute intervals in beacon mode, a 5 mJ ping represents just 2.8 µW average power—the system could theoretically operate indefinitely on any trickle current.

## The Complete Energy Flow

Tying together the cascading power architecture and LoRaWAN energy budget:

```
Solar Panel (50-100 mW daytime)
        ↓
BQ25570 Energy Harvester (70% efficiency)
        ↓
2S LTO Battery (40 mAh × 4.8V = 691 J total)
        ↓ (above -50°C: direct)
        ↓ (below -50°C: trickle charge)
        ↓
1.5F Supercapacitor (50+ mJ per burst)
        ↓ (below -58°C: trickle charge)
        ↓
3300µF Aluminum Polymer (12.4 mJ per burst)
        ↓ (below -63°C: trickle charge)
        ↓
1.32mF Ceramic Bank (12.4 mJ per burst)
        ↓
Buck Converter (85% efficiency)
        ↓
3.3V Rail → STM32WLE5 → LoRa Radio
        
Energy delivered to RF transmission:
- Normal mode: 33.2 mJ (SF10 11B)
- Emergency mode: 5.0 mJ (SF7 11B)
```

**The cascade match**: The ceramic bank's 12.4 mJ capacity is *precisely sized* for SF7 11-byte transmissions (5 mJ) with 2.5× margin—enough for the buck converter losses and some MCU processing overhead.

## Batch Transmission Strategy

The firmware implements intelligent batching to maximize data throughput:

**Normal operation (plenty of energy):**
1. Send latest telemetry **confirmed** @ SF10 → Wait for ACK
2. If ACK: Send N packets **unconfirmed** @ SF10 → No wait
3. Send oldest unsent packet **confirmed** @ SF10 → Verify link still up

**Energy-constrained operation:**
1. Send latest telemetry **unconfirmed** @ SF7 → Save ACK energy
2. Queue additional packets in flash for later transmission
3. When conditions improve: Burst upload queued data

The confirmed/unconfirmed tradeoff:
- Confirmed: Must wait for RX windows → More time at full power
- Unconfirmed: Fire and forget → Minimum energy, no delivery guarantee

At extreme cold, unconfirmed SF7 pings maximize the probability of *some* data getting through rather than guaranteed delivery of nothing.

## Power Budget Summary

Putting it all together for a typical 24-hour period at altitude:

| Phase | Duration | Mode | Energy/TX | Interval | TX Count | Total Energy |
|-------|----------|------|-----------|----------|----------|--------------|
| Day, warm | 6 hr | Normal | 58 mJ | 5 min | 72 | 4.2 J |
| Day, cold | 6 hr | Degraded | 33 mJ | 10 min | 36 | 1.2 J |
| Night, cold | 6 hr | Emergency | 5 mJ | 15 min | 24 | 0.12 J |
| Night, extreme | 6 hr | Beacon | 5 mJ | 30 min | 12 | 0.06 J |
| **Total** | 24 hr | — | — | — | 144 | **5.58 J** |

LTO battery capacity: 691 J (at room temperature)
Solar harvest (daytime, 6 hr at 50 mW avg, 70% eff): 756 J

**Energy balance: +750 J harvested − 5.58 J transmitted = positive margin**

The system is solar-positive during any day with reasonable sunshine, with enough battery reserve for multi-day nighttime or cloudy operation.

## Conclusion: The SF7 Lifeline

The key insight from this analysis: **SF7 is the stratospheric survival mode**.

- SF10 provides range and reliability when energy is plentiful
- SF7 provides mission continuity when energy is scarce
- The 6.6× energy reduction (33.2 mJ → 5 mJ) matches the cascade power degradation

At -60°C, when the battery can barely deliver 25 mA and the supercap has frozen solid, those 5 millijoules from the aluminum polymer capacitor can still push a ping out to space. And from 20km altitude, line-of-sight to gateways hundreds of kilometers away makes even low-power SF7 viable.

The firmware ties it together: monitor temperature and voltage, adapt SF automatically, and keep transmitting until the physics says stop.

**Design for SF10 performance. Plan for SF7 survival.**

---

## Related Posts

This post completes the Stratosonde power system characterization series:

- [HTC1015 LTO Temperature Characterization]({% post_url 2025-11-23-htc1015-lto-temperature-characterization %}) - Battery performance at extreme cold
- [BQ25570 Bench Characterization]({% post_url 2025-11-23-bq25570-bench-characterization %}) - Solar harvester efficiency
- [Stratosonde Cascading Power Architecture]({% post_url 2025-11-24-stratosonde-cascading-power-architecture %}) - The multi-layer power design
- [Ceramic Capacitor Bank Validation]({% post_url 2025-11-25-ceramic-capacitor-bank-extreme-cold-validation %}) - Ceramic layer at -70°C
- [Aluminum Polymer Capacitor Integration]({% post_url 2025-12-06-aluminum-polymer-capacitor-integration %}) - Bridge layer characterization

---

*LoRaWAN parameters: STM32WLE5 integrated radio, +14 dBm TX power, 125 kHz bandwidth, 4/5 coding rate, US915 frequency plan.*

*Raw energy data: [lorawan_energy_data.csv]({{ site.baseurl }}/assets/data/lorawan_energy_data.csv)*

