---
layout: page
title: Tools
icon: fas fa-tools
order: 3
---

# Interactive Tools

We've built open-source calculators and visualizations to support platform design and mission planning:

## Design Calculators

### [Balloon Float Calculator](https://stratosonde.github.io/.github/profile/float1g_visual.html)
Physics-based altitude prediction with step-by-step calculations. Model superpressure balloon behavior, gas expansion, differential pressure, and safety margins.

**Features:**
- Interactive step-by-step physics calculations
- Visual charts for volume, forces, and pressure
- Mylar balloon specifications and safety limits
- Detailed explanations for each calculation step

### [Power Budget Calculator](https://stratosonde.github.io/.github/profile/solar_radiosonde_power_budget.html)
Comprehensive energy analysis with temperature derating, duty cycle modeling, and multi-day mission simulation.

**Features:**
- Solar panel and battery sizing
- Temperature-dependent performance modeling
- Component duty cycle analysis
- Multi-day mission energy balance

## Visualization Tools

### [LoRaWAN Region Viewer](https://stratosonde.github.io/.github/profile/cesium-lorawan-viewer.html)
Interactive 3D globe showing worldwide LoRaWAN regulatory regions with H3 hexagonal grid used for autonomous region detection.

**Features:**
- 3D visualization of all LoRaWAN regions
- H3 hexagon overlay at multiple resolutions
- Interactive globe navigation
- Region metadata and specifications

### [Atmospheric Flow Viewer](https://stratosonde.github.io/atmospheric-flow-viewer.html)
Real-time NOAA GFS wind data visualization at multiple pressure levels for trajectory prediction.

**Features:**
- Wind vectors at stratospheric pressure levels
- Multiple altitude layers (50mb to 1000mb)
- Real-time GFS data integration
- Trajectory prediction support

## Source Code

All tools are open source and available in the project repositories:
- [Calculators](https://github.com/stratosonde/.github/tree/main/profile) - HTML/JavaScript visualization tools
- [Python Tools](https://github.com/stratosonde/sonde) - Data processing and analysis utilities
- [H3 Library](https://github.com/stratosonde/h3lite) - Geospatial indexing for embedded systems
