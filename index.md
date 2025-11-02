---
layout: home
title: Home
---

# Stratosonde Technical Blog

Welcome to the technical blog for **Stratosonde**—an open science initiative developing ultra-lightweight, solar-powered radiosondes for long-duration atmospheric measurements at stratospheric altitudes.

## About This Site

This documentation site provides technical updates, development progress, and deep-dives into the engineering challenges of building a <15 gram radiosonde that can survive days or weeks at 40,000 feet in -50°C temperatures.

For the complete project overview, mission statement, and heritage story connecting to Canada's 1986 Project Stratosonde, visit the [**Stratosonde Landing Page**](https://github.com/stratosonde/.github).

## Project Repositories

The Stratosonde project is organized into several repositories:

- **[sonde](https://github.com/stratosonde/sonde)** - Core firmware for the radiosonde device, including power management, sensor integration, and autonomous LoRaWAN region detection
- **[h3lite](https://github.com/stratosonde/h3lite)** - Embedded H3 geospatial indexing library for automatic LoRaWAN region detection (<50KB flash footprint)
- **[hardware](https://docs.google.com/document/d/1UvLQhTHOeyt-fdj2o6CyQJJvrkRZcYuKuNxAXdWrK4A/edit?usp=sharing)** - PCB designs, schematics, and component information
- **[docs](https://github.com/stratosonde/docs)** - This documentation site

## Interactive Tools & Resources

We've developed several interactive calculators and visualization tools to support radiosonde design and mission planning:

- **[Balloon Float Calculator](https://stratosonde.github.io/.github/profile/float1g_visual.html)** - Step-by-step superpressure balloon flight design with physics explanations, safety analysis, and pressure visualization. Calculate gas fill volume, float altitude, and differential pressure based on balloon size, payload weight, and free lift.

- **[Power Budget Calculator](https://stratosonde.github.io/.github/profile/solar_radiosonde_power_budget.html)** - Comprehensive power consumption, battery capacity, and solar energy harvesting analysis. Model multi-day missions with extreme cold temperature derating, component duty cycles, and energy balance calculations.

- **[Cesium LoRaWAN Viewer](https://stratosonde.github.io/.github/profile/cesium-lorawan-viewer.html)** - Interactive 3D globe visualization of all LoRaWAN regions worldwide, showing the coverage areas used for automatic region detection via H3 geospatial indexing.

## Recent Posts

Check out the latest development updates and technical deep-dives below:
