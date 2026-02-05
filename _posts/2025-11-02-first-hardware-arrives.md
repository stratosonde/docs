---
layout: post
title: "Building Stratosonde v1: First PCBAs Arrive"
date: 2025-11-02 12:00:00 -0600
categories: hardware build
tags: [pcba, jlcpcb, smt, assembly, components, hardware, lto, solar]
---

> **🎧 Listen to this article:** [NotebookLM Podcast]({{ site.baseurl }}/assets/audio/Stratosonde_Hardware_vs_The_15_Gram_Limit.m4a)  
> *An AI-generated audio discussion created by Google's NotebookLM*

# First Hardware from JLCPCB

After months of design work, the first manufactured Stratosonde PCBAs have arrived from JLCPCB! This is a major milestone - seeing the design transition from schematic to actual hardware you can hold in your hand.

## JLCPCB Manufacturing Experience

JLCPCB offers a unique personal inventory system that proved invaluable for this project. Rather than just ordering one-off assemblies, they allow you to purchase components and store them in your personal inventory for future builds. This is particularly useful for:

- Components they don't normally stock (like the Seeed STM32WLE5 module)
- Parts with long lead times
- Maintaining consistent component versions across builds

When I needed the Seeed STM32WLE5 module, JLCPCB even ordered it directly from Digikey on my behalf and added it to my personal inventory. This flexibility makes them an excellent choice for small-batch production of custom designs.

## Component Weights

Weight is critical for balloon-launched radiosondes. Every gram matters when you're trying to achieve multi-day flights on inexpensive party balloons. Here's how the components measured:

### Solar Panels
![Solar Panels Weight]({{ site.baseurl }}/assets/images/posts/2025-11-02-first-hardware-arrives/solar_cells_weight.jpg)

**2x solar wafers: 0.93g total (0.465g each)**

The 52x19mm solar wafers came in right around the expected weight. These will provide 0.5V each when wired in series for a total of 1.0V input to the BQ25570 boost charger.

### LTO Battery Cell
![LTO Cell Weight]({{ site.baseurl }}/assets/images/posts/2025-11-02-first-hardware-arrives/lto_cell_weight.jpg)

**1x HTC1030 LTO cell: 5.09g**

The lithium titanate cell is slightly heavier than the datasheet specification of 4.7g, but still well within acceptable range. LTO chemistry was chosen for its excellent low-temperature performance - critical for

 operation at -50°C at 40,000 feet.

### Populated PCB
![Populated PCB Weight]({{ site.baseurl }}/assets/images/posts/2025-11-02-first-hardware-arrives/pcb_populated_weight.jpg)

**Populated PCB (minus LTO cells and supercap): 6.4g**

The SMT-assembled board includes:
- Seeed STM32WLE5JC module (MCU + LoRa radio)
- ATGM336H GPS module
- MS5607 pressure sensor
- SHT31 temperature/humidity sensor
- BQ25570 energy harvester
- W25Q80 flash memory
- All passives and supporting circuitry

### Complete Assembly
![Complete Assembly Weight]({{ site.baseurl }}/assets/images/posts/2025-11-02-first-hardware-arrives/full_assembly_weight_1.jpg)

**Complete PCBA with LTO cells and supercap: 14.10g**

This is the fully populated board with everything except solar panels, antenna wire, and fishing line harness.

## Weight Analysis

Breaking down the total system weight:

| Component | Weight |
|-----------|--------|
| Populated PCBA + LTO + Supercap | 14.10g |
| Solar panels (2x) | 0.93g |
| Wire antenna | ~0.1g (est.) |
| Fishing line harness | ~0.1g (est.) |
| **Estimated Total** | **~15.6g** |

### Meeting the Target?

The [Stratosonde specification]({{ site.baseurl }}/Stratosonde.pdf) sets two weight targets:
- **Must:** <15g
- **Nice to have:** <12g

At an estimated 15.6g, we're slightly over the "must" target but still extremely competitive with commercial picoballoon trackers. The <12g "nice to have" was always going to be challenging without sacrificing functionality.

This weight is still light enough for:
- 32" Yokohama balloons (8g lift with 0.07m³ He)
- SAG Orb balloons (similar specs)
- Larger 36" balloons with significant margin

### Where the Weight Went

The 14.10g core assembly is actually excellent engineering - consider what's packed in:
- Full LoRa transceiver with

 integrated MCU
- GNSS Receiver
- Three environmental sensors
- 50mAh LTO battery (2S configuration possible)
- Solar charge controller
- 1MB flash storage
- Complete power management

For perspective, many trackers use *just* a GPS module that weighs 3-4g by itself.

## Next Steps

With hardware in hand, the focus shifts to:

1. **Firmware Development**
   - STM32WLE5 initialization
   - Sensor drivers
   - LoRaWAN stack integration
   - H3Lite region lookup
   - Flash logging system

2. **Power Testing**
   - Measure actual current consumption
   - Validate sleep modes
   - Test solar charging at temperature
   - Verify battery runtime

3. **Integration Testing**
   - GPS acquisition performance
   - LoRaWAN join and transmission
   - Sensor accuracy
   - Regional frequency plan selection

4. **Environmental Testing**
   - Temperature cycling (-50°C to +25°C)
   - Altitude simulation
   - Long-duration battery test

## Looking Ahead

Holding the first physical hardware is incredibly rewarding. The design moved from concept to concrete reality, and while we're slightly over the ideal weight target, we've successfully packed tremendous functionality into a tiny, lightweight package.

The slightly higher weight is a trade-off for features that enable truly autonomous, global operation:
- Automatic LoRaWAN region detection (H3Lite)
- Multi-sensor environmental data
- Flash logging for offline data retention
- Flexible solar charging
- Extended temperature operation

These capabilities make Stratosonde suitable for serious atmospheric research and long-duration flights, not just basic tracking.

Next up: getting the firmware running and conducting the first powered tests!

---

*Weight specifications sourced from [Stratosonde Product Specification]({{ site.baseurl }}/Stratosonde.pdf)*

*For more information on the power system design: [Power Budget Calculator](https://stratosonde.github.io/.github/profile/solar_radiosonde_power_budget.html)*

