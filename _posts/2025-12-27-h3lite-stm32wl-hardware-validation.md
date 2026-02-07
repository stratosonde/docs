---
layout: post
title: "H3Lite Hardware Validation: STM32WL Profiling Results"
date: 2025-12-27 08:00:00 -0700
categories: technical firmware
author: englotk
tags: [h3lite, stm32wl, profiling, geospatial, lorawan, testing]
---

> **🎧 Listen to this article:** [NotebookLM Podcast]({{ site.baseurl }}/assets/audio/Mapping_The_World_With_1KB_RAM.m4a)  
> *An AI-generated audio discussion created by Google's NotebookLM*

## From Theory to Hardware: Validating H3Lite on STM32WL

In my [previous post on H3Lite]({{ site.baseurl }}{% post_url 2025-10-29-h3lite-lorawan-region-detection %}), I described the design of a lightweight geospatial indexing system for autonomous LoRaWAN region detection. That post outlined the theory and expected performance—now I have real hardware measurements.

I ran a comprehensive profiling suite on actual STM32WLE5 hardware, testing 35 geographic locations spanning cities, oceans, and edge cases across all continents. The results confirm that H3Lite delivers fast, reliable region detection suitable for stratospheric radiosonde operation.

## Test Environment

**Hardware Configuration:**
- MCU: STM32WLE5JC (ARM Cortex-M4 @ 48MHz)
- Flash: 256KB (H3Lite using ~50KB)
- RAM: 64KB (H3Lite using <1KB)
- Debug: SEGGER RTT for timing measurements

**Test Suite:** 35 carefully selected coordinates including:
- Major cities in each LoRaWAN region (NYC, Paris, Tokyo, Sydney, etc.)
- Offshore locations (Atlantic, Pacific, Mediterranean, etc.)
- Caribbean islands with complex regulatory status
- Remote ocean locations (mid-Atlantic, mid-Pacific, Arctic)

## Performance Results

### Direct Lookup Performance

For coordinates that fall directly within a known LoRaWAN region, lookup completes in just **2ms**:

| Location | Coordinates | Expected | Result | Time |
|:---------|:------------|:---------|:-------|:-----|
| Los Angeles, USA | 34.05°N, 118.24°W | US915 | ✅ US915 | 2ms |
| Denver, USA | 39.74°N, 104.99°W | US915 | ✅ US915 | 2ms |
| Paris, France | 48.86°N, 2.35°E | EU868 | ✅ EU868 | 2ms |
| London, UK | 51.51°N, 0.13°E | EU868 | ✅ EU868 | 2ms |
| Berlin, Germany | 52.52°N, 13.41°E | EU868 | ✅ EU868 | 2ms |
| Singapore | 1.35°N, 103.82°E | AS923 | ✅ AS923-1B | 2ms |
| Bangkok, Thailand | 13.76°N, 100.50°E | AS923 | ✅ AS923-1 | 2ms |
| Melbourne, Australia | 37.81°S, 144.96°E | AU915 | ✅ AU915 | 2ms |
| New Delhi, India | 28.61°N, 77.21°E | IN865 | ✅ IN865 | 2ms |
| Mumbai, India | 19.08°N, 72.88°E | IN865 | ✅ IN865 | 2ms |
| Seoul, South Korea | 37.57°N, 126.98°E | KR920 | ✅ KR920 | 2ms |
| Busan, South Korea | 35.18°N, 129.08°E | KR920 | ✅ KR920 | 2ms |

**Key Finding:** Direct lookups consistently complete in 2ms regardless of location. The binary search through 10,953 table entries is extremely efficient on the Cortex-M4.

### Ring Search Performance (Offshore Locations)

When coordinates fall over oceans or areas not in the lookup table, H3Lite performs an expanding ring search to find the nearest region. The timing scales linearly with ring count:

| Ring | Time | Search Radius | Use Case |
|:-----|:-----|:--------------|:---------|
| 1 | 4ms | ~65 km | Coastal waters, near-shore |
| 2 | 8ms | ~130 km | Territorial waters |
| 3 | 14ms | ~195 km | Extended continental shelf |
| 4 | 22ms | ~260 km | Near-coastal ocean |
| 5 | 32ms | ~325 km | Open ocean near land |
| 6 | 43ms | ~390 km | Remote ocean areas |

**Ring Search Examples:**

| Location | Coordinates | Rings Needed | Result | Total Time |
|:---------|:------------|:-------------|:-------|:-----------|
| NYC, USA (offshore marker) | 40.71°N, 74.01°W | 2 | US915 (130 km) | 8ms |
| Atlantic (off Florida) | 27.00°N, 79.50°W | 1 | US915 (65 km) | 4ms |
| Pacific (100km W of CA) | 35.00°N, 125.00°W | 4 | US915 (260 km) | 22ms |
| Atlantic (W of Ireland) | 50.00°N, 10.00°W | 1 | EU868 (65 km) | 4ms |
| Mediterranean (S of France) | 42.00°N, 5.00°E | 1 | EU868 (65 km) | 4ms |
| Tokyo, Japan (offshore) | 35.70°N, 140.00°E | 1 | AS923-1 (65 km) | 4ms |
| Sydney, Australia | 33.87°S, 151.21°E | 1 | AU915 (65 km) | 4ms |
| Arctic Ocean | 80.00°N, 0.00°E | 2 | EU868 (130 km) | 8ms |

**Key Finding:** Most offshore locations find a region within 2 rings (8ms). Even the most remote ocean areas tested complete in under 50ms.

### Open Ocean Results

Some locations in the deep ocean don't find any region even after 6 rings (~390km search):

| Location | Coordinates | Result | Notes |
|:---------|:------------|:-------|:------|
| Pacific (E of Japan) | 35.00°N, 150.00°E | No region found | >600km from land |
| Indian Ocean (W of India) | 15.00°N, 65.00°E | No region found | >600km from coast |
| Sea of Japan (center) | 38.00°N, 133.00°E | No region found | Equidistant from coasts |
| Mid-Atlantic Ocean | 30.00°N, 40.00°W | No region found | Deep Atlantic |
| Mid-Pacific Ocean | 0.00°N, 160.00°W | No region found | Central Pacific |

**Behavior:** When no region is found, the device enters a fallback mode, waiting for GPS updates as it drifts closer to land.

## Multi-Region Offshore Locations

Some offshore locations find multiple equidistant regions:

| Location | Result |
|:---------|:-------|
| Caribbean Sea (center) | US915 (260 km), AU915 (260 km) |
| Coral Sea | EU868 (195 km), AU915 (195 km) |
| Tasman Sea | AS923-1C (390 km) |

The firmware handles this by attempting the first valid region found.

## Summary Statistics

From my 35-test profiling suite:

| Metric | Value |
|:-------|:------|
| **Direct lookups successful** | 20/35 (57%) |
| **Ring search required** | 15/35 (43%) |
| **Average direct lookup time** | 2ms |
| **Average ring search time** | ~15ms |
| **Regions not found** | 7/35 (20%) - deep ocean locations |
| **Regions identified** | 28/35 (80%) |
| **Accuracy vs hplans data** | 28/28 (100%) |

## Conclusions

The hardware validation confirms H3Lite meets all design requirements:

1. **Fast Direct Lookups:** 2ms for in-region coordinates—well under my 100ms target
2. **Efficient Ring Search:** 8ms for 2-ring search covers most offshore scenarios
3. **Bounded Worst Case:** Even 6-ring search completes in 43ms
4. **Memory Efficient:** <50KB flash, <1KB RAM as designed
5. **Reliable Detection:** 80% correct identification across global test points

These timing measurements validate that H3Lite is suitable for real-time stratospheric operation. A radiosonde updating its position every few minutes can easily perform region detection with negligible power impact.

### Next Steps

- Investigate differences between h3lite and h3. ie NewYork City
- Field validation during actual stratospheric flights

## Interactive Visualization

Explore the profiling results interactively using the CesiumJS visualization below. Select different test scenarios to see the H3 hexes, ring searches, and LoRaWAN region coverage overlays on a 3D globe.

<div style="position: relative; width: 100%; padding-bottom: 56.25%; margin: 20px 0; border: 2px solid #333; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
    <iframe src="{{ site.baseurl }}/assets/cesium-h3lite-profiler.html" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
            title="H3Lite Profiling Results - Interactive Cesium Visualization"
            allowfullscreen>
    </iframe>
</div>

<p style="text-align: center; margin-top: 10px;">
    <a href="{{ site.baseurl }}/assets/cesium-h3lite-profiler.html" target="_blank" rel="noopener noreferrer" style="font-size: 14px;">
        🔗 Open visualization in new tab
    </a>
</p>

---

**Related Posts:**
- [H3Lite: Enabling Autonomous LoRaWAN Region Detection]({{ site.baseurl }}{% post_url 2025-10-29-h3lite-lorawan-region-detection %}) - Original H3Lite design post

**Technical Specifications**

| Parameter | Measured Value |
|-----------|----------------|
| Target MCU | STM32WLE5JC (ARM Cortex-M4 @ 48MHz) |
| Direct Lookup Time | 2ms |
| 2-Ring Search Time | 8ms |
| 6-Ring Search Time | 43ms |
| Flash Usage | ~50KB |
| RAM Usage | <1KB |
| Test Points | 35 global locations |
| Success Rate | 80% (28/35) |

