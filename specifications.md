---
layout: page
title: Technical Specifications
permalink: /specifications/
---

# Stratosonde Technical Specifications

*Living document — Last updated: November 2025*

This page consolidates validated specifications from component characterization and system testing. Values are updated as new test data becomes available.

---

## System Overview

| Parameter | Specification | Source |
|-----------|---------------|--------|
| **Total Weight** | <15g target (15.6g prototype) | [Hardware Validation]({% post_url 2025-11-02-first-hardware-arrives %}) |
| **Target Altitude** | 12-18 km (40,000-60,000 ft) | Design target |
| **Mission Duration** | Multi-day validation → weeks goal | Design target |
| **Operating Temperature** | -65°C to +60°C (validated) | [Ceramic Cap Testing]({% post_url 2025-11-25-ceramic-capacitor-bank-extreme-cold-validation %}) |
| **System Voltage** | 3.3V regulated | Design |

---

## Power System

### Energy Harvesting (BQ25570)

| Parameter | Specification | Source |
|-----------|---------------|--------|
| **Harvester IC** | Texas Instruments BQ25570 | Design |
| **Measured Efficiency** | 70-75% (cold start to MPPT) | [BQ25570 Characterization]({% post_url 2025-11-23-bq25570-bench-characterization %}) |
| **MPPT Voltage** | 80% of Voc (programmable) | Design |
| **Cold Start Voltage** | 330mV minimum | Datasheet |

### Battery (2S LTO Configuration)

| Parameter | Specification | Source |
|-----------|---------------|--------|
| **Cell Type** | Huahui HTC1015 LTO | Design |
| **Configuration** | 2S (series) | Design |
| **Cell Capacity** | 40mAh nominal | Datasheet |
| **Cell Weight** | 2.4g each (4.8g total) | Measured |
| **Nominal Voltage** | 4.4V (2× 2.2V) | Design |
| **Voltage Range** | 3.2V - 5.6V | Design |

**Internal Resistance vs Temperature (per cell):**

| Temperature | R_int | Source |
|-------------|-------|--------|
| +25°C | 0.75 Ω | [LTO Characterization]({% post_url 2025-11-23-htc1015-lto-temperature-characterization %}) |
| 0°C | 1.13 Ω | [LTO Characterization]({% post_url 2025-11-23-htc1015-lto-temperature-characterization %}) |
| -20°C | 2.25 Ω | [LTO Characterization]({% post_url 2025-11-23-htc1015-lto-temperature-characterization %}) |
| -40°C | 9.88 Ω | [LTO Characterization]({% post_url 2025-11-23-htc1015-lto-temperature-characterization %}) |
| -50°C | 590 Ω | [LTO Characterization]({% post_url 2025-11-23-htc1015-lto-temperature-characterization %}) |
| -60°C | 8000 Ω | [LTO Characterization]({% post_url 2025-11-23-htc1015-lto-temperature-characterization %}) |

### Supercapacitor

| Parameter | Specification | Source |
|-----------|---------------|--------|
| **Capacitance** | 1.5F | Design |
| **Rated Voltage** | 5.5V | Design |
| **ESR** | <100 mΩ | Datasheet |
| **Function** | Peak current buffer for RF transmission | [Cascading Power]({% post_url 2025-11-24-stratosonde-cascading-power-architecture %}) |

### Ceramic Capacitor Bank (Emergency Reserve)

| Parameter | Specification | Source |
|-----------|---------------|--------|
| **Configuration** | 15× 100μF X5R 0805 | Design |
| **Total Capacitance** | 1.5mF nominal | Design |
| **Operating Floor** | -65°C (voltage collapse below) | [Ceramic Validation]({% post_url 2025-11-25-ceramic-capacitor-bank-extreme-cold-validation %}) |
| **Capacity at -50°C** | ~40% of nominal | [Ceramic Validation]({% post_url 2025-11-25-ceramic-capacitor-bank-extreme-cold-validation %}) |

---

## Radio & Communication

### LoRa Radio (STM32WLE5 Integrated)

| Parameter | Specification | Source |
|-----------|---------------|--------|
| **Frequency** | 868 MHz (EU) / 915 MHz (US) | Design |
| **Max TX Power** | +22 dBm | Datasheet |
| **TX Current** | ~100mA at +22 dBm | [Power Calculator]({% post_url 2025-10-27-stratosonde-power-calculator %}) |
| **Spreading Factor** | SF7-SF12 (adaptive) | Design |
| **Protocol** | LoRaWAN Class A | Design |

### Region Detection (H3Lite)

| Parameter | Specification | Source |
|-----------|---------------|--------|
| **Resolution** | R3 (~11,000 entries) | [H3Lite Blog]({% post_url 2025-10-29-h3lite-lorawan-region-detection %}) |
| **Flash Size** | ~44KB | [H3Lite Blog]({% post_url 2025-10-29-h3lite-lorawan-region-detection %}) |
| **Regions Supported** | 16 LoRaWAN frequency plans | Design |

---

## Sensors

| Component | Function | Interface |
|-----------|----------|-----------|
| **ATGM336H** | GPS position | UART |
| **SHT31** | Temperature, Humidity | I²C |
| **MS5607** | Pressure, Altitude | I²C |

---

## Microcontroller

| Parameter | Specification |
|-----------|---------------|
| **MCU** | STM32WLE5JC |
| **Core** | ARM Cortex-M4 @ 48MHz |
| **Flash** | 256KB |
| **RAM** | 64KB |
| **Integrated Radio** | Sub-GHz LoRa |
| **Operating Voltage** | 1.8V - 3.6V |

---

## Balloon & Flight

### Mylar Superpressure Balloon

| Parameter | Specification | Source |
|-----------|---------------|--------|
| **Material** | Mylar (metallized polyester) | Design |
| **Safe ΔP** | < 2.8 kPa (0.4 psi) | [Balloon Calculator]({% post_url 2025-10-26-balloon-float-calculator %}) |
| **Caution ΔP** | 2.8-3.5 kPa (0.4-0.5 psi) | [Balloon Calculator]({% post_url 2025-10-26-balloon-float-calculator %}) |
| **Burst ΔP** | ~4.8 kPa (0.7 psi) | [Balloon Calculator]({% post_url 2025-10-26-balloon-float-calculator %}) |
| **Lift Gas** | Hydrogen or Helium | Design |

---

## Thermal Limits

| Component | Min Temp | Max Temp | Notes |
|-----------|----------|----------|-------|
| **System** | -65°C | +60°C | Validated operating range |
| **LTO Battery** | -60°C | +70°C | Severely degraded below -50°C |
| **Ceramic Caps** | -65°C | +85°C | Voltage collapse floor at -65°C |
| **MCU** | -40°C | +85°C | Industrial grade |

---

## Power Budget Summary

**Nominal Operating Power (at 25°C):**

| Mode | Current | Duration | Energy/Cycle |
|------|---------|----------|--------------|
| Sleep | ~3 μA | Continuous | Baseline |
| GPS Fix | 15 mA | 3 sec | 150 mJ |
| Sensors | 2 mA | 10 sec | 66 mJ |
| LoRa TX | 100 mA | 400 ms | 132 mJ |
| **Total per 5-min cycle** | — | — | ~350 mJ |

**Solar Input (Stratospheric, 45° latitude):**
- Peak: 100-150 mW
- Average (day): 50 mW
- Average (24hr): 25 mW

---

## Changelog

| Date | Change | Reference |
|------|--------|-----------|
| Nov 2025 | Operating floor established at -65°C | Ceramic cap validation |
| Nov 2025 | LTO R_int characterized to -60°C | LTO characterization |
| Nov 2025 | Supercap updated to 1.5F | Architecture refinement |
| Nov 2025 | Balloon burst pressure validated | Calculator update |
| Nov 2025 | GPS module confirmed as ATGM336H | Hardware validation |

---

*For component datasheets, see the [hardware repository](https://github.com/stratosonde/hardware/tree/main/datasheets).*
