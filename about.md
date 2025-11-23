---
layout: page
title: About
permalink: /about/
---

# About Stratosonde

Stratosonde is an open-source platform for ultra-lightweight, solar-powered atmospheric sensing at stratospheric altitudes. This documentation site tracks development progress, technical decisions, and test results as we build toward multi-day autonomous flights.

## Development Approach

We're taking a methodical, validation-first approach:

1. **Platform Validation** (current phase) - Prove the technology through test flights
2. **Model Refinement** - Validate thermal models, power budgets, and trajectory predictions
3. **Extended Operations** - Push toward week-long missions
4. **Scientific Missions** - Deploy validated platform for atmospheric research

## Technology Stack

**Hardware:** STM32WLE5 MCU with integrated LoRa radio, solar energy harvesting (BQ25570), LTO batteries, environmental sensors (SHT31, MS5607), GNSS positioning

**Firmware:** Real-time power management, H3Lite geospatial indexing for autonomous LoRaWAN region detection, adaptive transmission scheduling, flash-based data logging

**Target Specs:** <15g total weight, -50°C to +60°C operation, multi-day mission duration, 12-18km float altitude

## Community Foundation

Stratosonde builds on decades of work by the amateur radio and picoballoon communities. We contribute back through open-source designs, detailed documentation, and active participation in these communities.

**Key Resources:**
- [Picoballoon Group](https://groups.io/g/picoballoon) - High-altitude balloon community
- [UKHAS](https://ukhas.org.uk) - Documentation and tools
- [Amateur Radio Networks](https://aprs.fi) - APRS tracking infrastructure

## Get Involved

**Join the Discussion**  
- **Discord**: [discord.gg/CdqQqW7n](https://discord.gg/CdqQqW7n)
- **GitHub**: [@stratosonde](https://github.com/stratosonde)
- **Email**: info@stratosonde.org

**Contribute**
- Review code and hardware designs
- Test components and subsystems
- Improve documentation
- Share flight data and results
- Build your own platform

**Repositories**
- [firmware](https://github.com/stratosonde/firmware)
- [hardware](https://github.com/stratosonde/hardware)
- [h3lite](https://github.com/stratosonde/h3lite)
- [ground](https://github.com/stratosonde/ground)
- [docs](https://github.com/stratosonde/docs)
- [.github](https://github.com/stratosonde/.github)

## Project Background

The name Stratosonde honors Environment Canada's 1986 atmospheric research program - a reminder that impactful science doesn't require massive institutional resources. Today's platform weighs grams instead of kilograms and operates on party balloons, making stratospheric research accessible to a wider community.

For complete project details and mission objectives, visit the [Stratosonde landing page](https://github.com/stratosonde/.github).

---

All hardware designs, firmware, and documentation are open source under permissive licenses (CERN-OHL-S v2, MIT, CC BY-SA 4.0).
