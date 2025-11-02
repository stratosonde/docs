---
layout: page
title: About
permalink: /about/
---

# About Stratosonde

**Stratosonde** is an open science initiative developing ultra-lightweight, solar-powered radiosondes for long-duration atmospheric measurements at stratospheric altitudes.

## The Vision

We're creating atmospheric sensors weighing less than 15 grams that can operate autonomously for days or weeks at 40,000 feet, using inexpensive party balloons rather than costly weather balloons. By drastically reducing weight, cost, and power requirements, we're making high-altitude atmospheric research accessible to researchers, educators, and citizen scientists worldwide.

## Heritage & Innovation

Our project honors the legacy of Environment Canada's "Project Stratosonde" from 1986—a pioneering atmospheric research initiative that used high-altitude balloons to study the ozone layer. Where that project used massive 20,000 cubic meter helium balloons costing thousands of dollars per flight, today's Stratosonde weighs less than 15 grams and operates on inexpensive party balloons.

We build upon three distinct traditions:
- **Scientific Research**: Drawing from Canada's atmospheric studies and ozone monitoring programs pioneered in the 1980s
- **Amateur Radio**: Embracing the spirit of ham radio operators who have pioneered long-distance communication systems
- **Pico-Ballooning**: Extending the boundaries of ultra-lightweight balloon platforms that circumnavigate the globe

## Key Innovations

- **Ultra-lightweight design** (<15g) for use with inexpensive party balloons
- **Solar-powered** with energy harvesting for multi-day or persistent operation
- **Global region awareness** with automatic LoRaWAN frequency plan selection via H3 geospatial indexing
- **LoRaWAN communication** with terrestrial gateways and future LEO satellite connectivity
- **Onboard data logging** with opportunistic transmission
- **High-altitude operation** targeting stratospheric altitudes
- **Low-temperature resilience** for extreme atmospheric conditions (-50°C)

## Technology Stack

- **Firmware**: C/C++ for embedded systems on STM32WLE5 (ARM Cortex-M4 with integrated LoRa)
- **Geospatial**: H3Lite - embedded H3 hexagonal hierarchical geospatial indexing
- **Communication**: LoRaWAN protocol with autonomous region detection
- **Power**: BQ25570 energy harvester with solar panels and LTO batteries
- **Sensors**: Environmental (SHT31, MS5607) and GNSS positioning

## Documentation Site Purpose

This site serves as the **technical blog** for the Stratosonde project, providing:
- Development updates and progress reports
- Technical deep-dives into specific subsystems
- Design decisions and engineering challenges
- Testing results and lessons learned
- Interactive tools and calculators

For the complete project overview, mission statement, and heritage story, visit the [**Stratosonde Landing Page**](https://github.com/stratosonde/.github).

## Get Involved

We welcome collaboration and contributions from the community:

- **💬 Join our Discord**: Real-time discussions and community support  
  [https://discord.gg/CdqQqW7n](https://discord.gg/CdqQqW7n)

- **🐙 Explore on GitHub**: All code, hardware designs, and documentation are open source  
  [@stratosonde](https://github.com/stratosonde)

- **📧 Get in Touch**: Questions or collaboration opportunities  
  [info@stratosonde.org](mailto:info@stratosonde.org)

- **📝 Contribute**: Review code, test designs, improve documentation, or share ideas

## Repositories

- **[sonde](https://github.com/stratosonde/sonde)** - Core firmware for the radiosonde device
- **[h3lite](https://github.com/stratosonde/h3lite)** - Embedded H3 geospatial indexing for automatic LoRaWAN region detection
- **[hardware](https://docs.google.com/document/d/1UvLQhTHOeyt-fdj2o6CyQJJvrkRZcYuKuNxAXdWrK4A/edit?usp=sharing)** - PCB designs, schematics, and component information
- **[docs](https://github.com/stratosonde/docs)** - This documentation site

## Acknowledgments

This project builds on decades of work by the high-altitude balloon community, amateur radio operators, and open-source hardware developers. Special thanks to the UKHAS community, picoballoon pioneers, and the LoRa/LoRaWAN developer community.

---

*"Between earth and sky, we drift in search of understanding."*
