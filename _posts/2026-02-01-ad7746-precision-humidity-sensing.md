---
layout: post
title: "Precision Humidity Sensing for Stratospheric Flight: Replacing the SHT31"
date: 2026-02-01 10:00:00 -0700
categories: hardware sensors testing
tags: [humidity, AD7746, capacitive sensing, sensors, characterization, stratosphere, SHT31, temperature]
---

> **🎧 Listen to this article:** [NotebookLM Podcast]({{ site.baseurl }}/assets/audio/Building_a_Frankenstein_Sensor_for_the_Stratosphere.m4a)  
> *An AI-generated audio discussion created by Google's NotebookLM*

# Precision Humidity Sensing for Stratospheric Flight: Replacing the SHT31

The Stratosonde currently carries a Sensirion SHT31 digital humidity sensor—a reliable, low-power device that works perfectly for terrestrial weather stations. But stratospheric balloons don't operate in terrestrial conditions. At float altitude, the SHT31 hits two fundamental limits: it stops functioning below -40°C, and its accuracy degrades catastrophically below 5% relative humidity. The stratosphere routinely operates at -56.5°C with sub-1% RH. **The SHT31 wasn't designed for this environment, and no amount of clever firmware can change the physics.**

This post documents the characterization of a replacement sensor system: the Analog Devices AD7746 24-bit capacitive-to-digital converter paired with an Innovative Sensor DHP14-Rapid-W capacitive humidity element and IST AG PT1000 Class A RTD for temperature. The goal is simple: measure humidity and temperature with laboratory-grade precision across the full stratospheric operating envelope, including conditions where commercial sensors become decorative paperweights.

The validation test ran for 10,000 seconds (~2.77 hours) in a custom-built aluminum test chamber, measuring against a saturated magnesium chloride salt solution reference. The preliminary results show **0.09% RH measurement repeatability** at a single calibration point—promising performance that warrants further investigation.

But this is early-stage characterization, not a validated sensor system. A few hours of data at one temperature and one humidity point proves the measurement chain works, not that it's ready for stratospheric deployment. The question ahead is whether extended testing validates the potential, and whether that capability justifies the integration complexity versus keeping the simpler SHT31.

## Why the SHT31 Fails at Altitude

The SHT31 is an excellent sensor—for its intended operating environment. Sensirion specifies:

**SHT31 Operating Limits:**
- **Temperature Range**: -40°C to +125°C (measurement)
- **Humidity Range**: 0-100% RH
- **Accuracy**: ±2% RH (typical, at 25°C, 10-90% RH range)
- **Low Temperature Degradation**: Accuracy degrades significantly below -10°C
- **Low Humidity Degradation**: Accuracy degrades below 10% RH

The stratosphere violates both critical limits:

**Stratospheric Operating Conditions:**
- **Temperature at Float Altitude (18-25 km)**: -56.5°C (ISA standard atmosphere)
- **Relative Humidity**: Often <1% RH (stratosphere is extremely dry)
- **Pressure**: ~5-10% of sea level (can affect sensor packaging and moisture exchange)

At -56.5°C, the SHT31 is **16.5°C below its rated minimum operating temperature**. The polymer-based capacitive sensor element becomes sluggish, response time increases dramatically, and calibration drifts unpredictably. Below -40°C, you're not measuring humidity—you're measuring the increasingly random output of a frozen sensor.

The low humidity problem is equally severe. Most commercial humidity sensors are calibrated and validated in the 10-90% RH range where terrestrial weather occurs. At <5% RH, sensor noise becomes comparable to the signal, and published accuracy specs no longer apply.

**Commercial Sensor Comparison at Stratospheric Conditions:**

| Sensor | Temp Min | Low RH Accuracy | Stratosphere Viable? |
|--------|----------|-----------------|---------------------|
| SHT31 (current) | -40°C | Degrades <10% RH | ❌ No (temp limit) |
| SHT85 | -40°C | ±3% RH @ 0-10% RH | ❌ No (temp limit) |
| BME680 | -40°C | ±3% RH typical | ❌ No (temp limit) |
| HDC3020 | -40°C | Not specified <10% RH | ❌ No (temp limit) |

Every commercial integrated humidity sensor hits the same wall: **-40°C is the lower limit of silicon-based sensor technology**. Going colder requires different physics.

## The AD7746 + P14 Rapid Architecture

Rather than using an integrated digital humidity sensor, the replacement system separates the measurement chain into specialized components:

**System Architecture:**

1. **Humidity Element**: Innovative Sensor DHP14-Rapid-W
   - Capacitive polymer sensor (140 pF @ 30% RH)
   - Sensitivity: 0.25 pF/%RH
   - Operating range: -40°C to +120°C (sensor element itself, pending validation)
   - Response time: <5 seconds

2. **Temperature Sensor**: IST AG PT1000 RTD (P1K0.232.6W.A.010)
   - Platinum resistance thermometer, 1000Ω @ 0°C
   - Class A accuracy: ±0.15°C (±(0.15 + 0.002|t|)°C)
   - Operating range: -200°C to +600°C (vastly exceeds requirements)
   - Self-heating: <90 µW @ 300 µA measurement current

3. **Interface IC**: Analog Devices AD7746
   - 24-bit capacitance-to-digital converter
   - Noise floor: 4 aF RMS (attoFarads—yes, really)
   - Simultaneous capacitance + voltage measurement
   - Built-in CAPDAC for range extension
   - Operating range: -40°C to +125°C (IC limit, not sensor limit)

**Why This Architecture?**

The AD7746 is a high-precision analog front-end that measures *anything* that changes capacitance or resistance. By using separate, specialized sensor elements:

- **Humidity sensor can be selected for low-temperature capability** (not constrained by silicon IC limits)
- **Temperature sensor is platinum** (inert, stable, traceable to NIST standards)
- **AD7746 provides the precision interface** (24-bit resolution, sub-femtoFarad noise)

The integrated SHT31 packages sensor + ADC + microcontroller + calibration into one chip—optimized for convenience, not extreme performance. The AD7746 system trades convenience for capability.

**Power Consumption Trade-offs:**

While the SHT31 draws ~0.3 mA during measurement bursts, the AD7746 system requires:

- **AD7746 IC**: <1 mA active, <1 µA sleep
- **PT1000 measurement current**: 300 µA (can be switched off via GPIO when not measuring)
- **DHP14 humidity sensor**: Passive (zero standby power)
- **Total measurement power**: ~1.3 mA for ~1 second every 5 minutes
- **Average continuous power**: ~4.3 µW

For a Stratosonde power budget measured in tens of milliwatts, this is negligible. The ability to GPIO-control the PT1000 excitation current means the sensor can be completely powered down between measurements, consuming zero power. The AD7746 can also be powered via GPIO for complete software control.

## The Validation Test Box

To characterize the sensor system, I built a controlled-environment test chamber using readily available components:

![Humidity Test Chamber]({{ site.baseurl }}/assets/images/posts/2026-02-01-ad7746-precision-humidity-sensing/test_chamber.jpg)

**Test Box Components:**

- **Enclosure**: Bud Industries 1590C aluminum project box
- **Observation Window**: Acrylic cover panel for visual inspection
- **Humidity Access**: Silicone porthole grommet for sensor probe insertion
- **Circulation**: Miniature 5V cooling fan for air mixing (prevents stratification)
- **Cable Gland**: Waterproof pass-through for sensor wiring
- **Humidity Reference**: Saturated salt solution in open container

**Why This Design?**

The aluminum enclosure provides thermal mass for temperature stability, while the fan ensures uniform humidity distribution throughout the chamber volume. The acrylic window allows visual confirmation that the salt solution remains saturated (crystallization visible at bottom of container). The silicone porthole permits sensor insertion while maintaining reasonable humidity seal—not hermetic, but sufficient for quasi-equilibrium testing.

**Humidity Reference: MgCl₂·6H₂O Saturated Salt Solution**

Saturated salt solutions are internationally recognized humidity standards (ASTM E104). At equilibrium in a sealed or quasi-sealed environment, they establish a known relative humidity:

- **Magnesium Chloride Hexahydrate**: 32.78% RH ± 0.16% @ 25°C
- **Temperature dependence**: -0.14% RH per °C (requires temperature correction)

This provides a **traceable humidity reference** without requiring expensive calibrated instrumentation. The ±0.16% RH absolute uncertainty represents the fundamental reference limit—no measurement system can be more accurate than its calibration standard.

## The 10,000 Second Characterization

The validation test collected continuous data for 10,000 seconds (2 hours, 46 minutes, 40 seconds), sampling the AD7746 at approximately 1 Hz:

**Test Conditions:**
- **Duration**: 10,000 seconds (8,594 valid samples after filtering)
- **Reference Humidity**: MgCl₂ saturated salt solution (32.78% @ 25°C nominal)
- **Temperature Control**: None (laboratory ambient conditions)
- **Temperature Range Observed**: 16.58°C to 18.55°C (1.97°C variation)
- **Sampling Rate**: ~1 Hz

**Temperature Variation:**

The test was conducted in a residential environment where a furnace cycled on and off, creating visible temperature excursions in the data. Rather than viewing this as a flaw, it's actually **valuable validation**—the sensor system maintained excellent humidity measurement stability despite nearly 2°C of environmental temperature swing.

![AD7746 Characterization Results]({{ site.baseurl }}/assets/images/posts/2026-02-01-ad7746-precision-humidity-sensing/AD7746_Analysis.png)

This plot shows three key measurements over the test duration:

1. **Humidity (%RH)** - Remarkably stable around 33.04% RH
2. **RTD Temperature (°C)** - Cycling between ~17.3°C and ~18.3°C (furnace effects)
3. **Internal Temperature (°C)** - Tracks environmental changes

The temperature cycling provides an unintentional stress test: if the humidity measurement were sensitive to temperature drift, we'd see humidity tracks following the temperature oscillations. The data shows no such correlation—temperature compensation is working correctly.

## Performance Results: Laboratory-Grade at Commercial Cost

The 10,000 second dataset permits rigorous statistical analysis:

**Humidity Measurement Performance:**

| Metric | Value | Assessment |
|--------|-------|------------|
| **Mean humidity (raw)** | 33.04% RH | Reference = 32.78% RH @ 25°C |
| **Temperature-corrected offset** | -0.20% RH | After MgCl₂ temp coefficient correction |
| **Standard deviation (1σ)** | 0.0915% RH | Excellent repeatability |
| **Peak-to-peak variation** | 0.51% RH | ~3σ noise envelope |
| **Drift rate** | -0.005% RH/hour | Negligible over test period |
| **Total uncertainty (95% CI)** | **±0.22% RH** | √(0.20² + 0.16²) including reference |

**Temperature Measurement Performance:**

| Metric | Value | Assessment |
|--------|-------|------------|
| **Mean temperature (RTD)** | 17.60°C | Ambient laboratory conditions |
| **Standard deviation** | 0.245°C | Precision typical of Class A RTD |
| **Temperature range** | 16.58°C to 18.55°C | Furnace cycling observed |
| **Resolution** | <0.03°C | AD7746 ADC limited, not sensor limited |

**Raw Capacitance Performance:**

The AD7746 measures the DHP14 sensor as a small capacitance change on top of a ~161.6 pF bulk capacitance:

| Metric | Value |
|--------|-------|
| **Mean capacitance** | 161.6111 pF |
| **Capacitance std dev** | 0.0229 pF |
| **Signal-to-noise ratio** | 76.98 dB |

A standard deviation <0.023 pF on a 24-bit ADC measuring ~162 pF demonstrates exceptional measurement precision. This low noise floor is what enables the 0.09% RH humidity resolution.

## Initial Performance: Promising But Preliminary

The 10,000 second test provides an early performance baseline, **not a full sensor validation**. With that caveat clearly stated:

**Measured Performance at ~33% RH, 17°C:**

| Metric | AD7746 System | Commercial Typical | Notes |
|--------|---------------|-------------------|-------|
| **Repeatability** | 0.09% RH (1σ) | 0.5-2% RH | Single-point, 2.77 hours only |
| **Offset from reference** | -0.20% RH | ±1-2% RH | After temp correction |
| **Drift rate** | -0.005% RH/hour | 0.01-0.05% RH/hour | Short-term only |
| **Resolution** | 0.27% RH | 0.5-1% RH | ADC-limited |

**What This Actually Proves:**

The measurement precision (0.09% RH standard deviation) is a real result—it demonstrates the AD7746's 24-bit ADC and the DHP14's capacitive stability over a few hours at stable conditions. The low drift rate is encouraging but **not** proof of long-term stability.

**What This Does NOT Prove:**

Claiming "10× better than commercial sensors" requires:
- Multi-point calibration (not just one salt solution)
- Extended temperature range validation (-40°C to +50°C minimum)
- Long-term drift measurement (weeks, not hours)
- Multiple sensor samples (batch-to-batch variation)
- Comparison testing against actual commercial sensors under identical conditions

None of that has been done yet. The numbers look good, but they're **early characterization data, not validated specifications**.

**Cost Comparison:**

| Sensor Type | Typical Cost | Accuracy (specified) |
|-------------|--------------|----------|
| **Commercial (SHT31)** | $8-15 | ±2% RH |
| **Laboratory (Vaisala HMP155)** | $600-1200 | ±1.0% RH |
| **AD7746 System** | ~$30-50 (components) | TBD (testing ongoing) |

The AD7746 system *might* achieve laboratory-grade performance at commercial pricing, but proving that requires substantially more testing than a few hours at room temperature.

## Temperature Compensation is Critical

The raw humidity measurement showed a +0.26% RH offset from the MgCl₂ reference value. After applying the salt solution's temperature coefficient (-0.14% RH per °C), the offset improved to -0.20% RH:

**MgCl₂ Temperature Correction:**

The saturated MgCl₂ solution establishes 32.78% RH at exactly 25°C. Over the test temperature range (17.60°C mean), the reference humidity shifts:

$ RH_{reference}(T) = 32.78\% + (-0.14\%/°C) \times (T - 25°C) $

At 17.60°C:
$ RH_{reference} = 32.78\% + (-0.14 \times -7.40) = 32.78\% + 1.04\% = 33.82\% $

But this assumes instantaneous thermal equilibrium between air temperature and the salt solution—in reality, thermal lag and local temperature gradients complicate the correction. The measured mean of 33.04% RH sits between the 25°C reference (32.78%) and the temperature-corrected value (33.82%), suggesting partial but incomplete thermal correction.

**The key finding**: Temperature compensation reduced measurement offset by 23% (from +0.26% to -0.20% RH). For a stratospheric platform experiencing 40-60°C temperature swings from ground to float altitude, proper temperature correction is essential for maintaining accuracy.

## Stability and Drift Analysis

Over the 2.77-hour test period, the sensor demonstrated remarkable long-term stability:

**Drift Characteristics:**

| Parameter | Value | Assessment |
|-----------|-------|------------|
| **Linear drift rate** | -0.0048% RH/hour | Excellent |
| **Total drift (test duration)** | ~0.013% RH | Negligible |
| **Projected 24-hour drift** | ~0.12% RH | Acceptable for most applications |
| **Drift correlation (R²)** | 0.0019 | Very low (good—indicates minimal systematic drift) |

A drift rate <0.005% RH/hour is exceptional for a capacitive humidity sensor. For comparison, typical commercial sensors specify 0.1-0.5% RH/year drift, which translates to roughly 0.01-0.06% RH/hour if evenly distributed (though drift is typically logarithmic, heaviest in the first hours after power-on).

**What This Means for Stratosonde:**

A week-long flight (~168 hours) could accumulate ~0.8% RH drift if the rate remains linear—still well within the ±2% RH target for atmospheric profiling. More importantly, if the sensor is used as a reference to validate other humidity sensors in flight, the <0.01% RH/hour drift ensures it remains a stable comparison point.

## What This Test Validates

The 10,000 second characterization provides initial evidence for:

✅ **Measurement chain functionality**: Sensor → ADC → calibration → output works  
✅ **Short-term repeatability**: 0.09% RH standard deviation over 2.77 hours  
✅ **Short-term stability**: <0.005% RH/hour drift (linear fit over test duration)  
✅ **Temperature compensation**: Effective correction for 2°C thermal variations  
✅ **SNR**: 77 dB for capacitance measurement (good ADC performance)  
✅ **Single-point calibration**: Reasonable agreement with MgCl₂ reference

## What This Test Does NOT Validate

This is a single-point calibration at room temperature and moderate humidity. Still unknown:

⚠ **Full humidity range**: Only tested at ~33% RH (MgCl₂), not 0-100% RH  
⚠ **Extended temperature**: Only tested 16.6-18.6°C, not -60°C to +50°C stratospheric range  
⚠ **Low temperature operation**: Does the DHP14 + AD7746 actually work at -56.5°C?  
⚠ **Low humidity accuracy**: Performance at <5% RH (critical for stratosphere)  
⚠ **Hysteresis**: Humidity cycling up/down to check for memory effects  
⚠ **Long-term drift**: 2.77 hours is not days/weeks  
⚠ **Pressure effects**: Does operation at 10 kPa vs 100 kPa affect sensor response?  

**The critical next test** is placing the entire sensor assembly in a thermal chamber at -60°C and validating:
1. Does the AD7746 IC function at this temperature? (Datasheet says no, but many ICs work beyond ratings)
2. Does the DHP14 capacitive element maintain calibration at extreme cold?
3. What is the response time at -60°C? (Polymer film moisture exchange may slow dramatically)
4. Does the PT1000 maintain accuracy? (It should—platinum RTDs are specified to -200°C)

Until these questions are answered, the AD7746 system remains a **high-precision sensor for moderate conditions, with unknown stratospheric capability**.

## Integration Options for Stratosonde

Four possible paths forward:

### Option 1: Build Into Stratosonde Revision 2 PCB

**Approach**: Integrate AD7746 + support circuitry directly onto the main Stratosonde board.

**Pros:**
- Minimal mass/volume (no connectors, dedicated PCB space)
- Proven performance at room temperature
- Single integrated unit

**Cons:**
- Commits PCB space before stratospheric validation complete
- Difficult to repair/replace if sensor fails
- Forces all Stratosondes to carry the sensor (cost/complexity for those who don't need it)

**Best for**: If humidity sensing becomes a mandatory mission requirement.

### Option 2: Population Option (DNP/Optional Assembly)

**Approach**: Design sensor into PCB, but leave unpopulated on boards that don't require it.

**Pros:**
- PCB design accommodates sensor without forcing every unit to carry it
- Flexibility for different mission profiles
- Standard manufacturing (population options common)

**Cons:**
- Still commits PCB space on all boards
- Adds BOM complexity (multiple assembly variants)

**Best for**: If ~50% of missions require precision humidity, ~50% don't.

### Option 3: External Qwiic Sensor Board

**Approach**: Separate PCB with AD7746 + sensors, connects via Qwiic I2C connector.

**Pros:**
- Zero impact on main Stratosonde board if not used
- Can be independently developed/tested/revised
- Easy to add/remove for specific missions
- Simple to replace if damaged
- Could be offered as standalone product for other platforms

**Cons:**
- Additional connectors (potential failure points)
- Slight mass penalty (extra PCB, connector)
- Cable routing complexity

**Best for**: If humidity sensing is mission-specific, not universal. Also enables using the sensor for ground-based validation testing before flight integration.

### Option 4: Reference Sensor for Comparison

**Approach**: Fly both SHT31 (existing) and AD7746 system, compare readings in flight.

**Pros:**
- Validates SHT31 behavior at temperature extremes
- Quantifies actual SHT31 degradation vs. datasheet
- Provides backup redundancy
- High-confidence dataset for publication

**Cons:**
- Highest mass penalty (two complete sensor systems)
- Highest power consumption (both sensors active)
- Most complex firmware (merging two sensor streams)

**Best for**: Flight test validation and sensor characterization research, not operational missions.

## Current Status and Next Steps

**What's Been Proven:**

The AD7746 capacitive humidity sensor + PT1000 RTD system demonstrates:
- 0.09% RH measurement repeatability (over 2.77 hours, single point)
- <0.005% RH/hour short-term drift
- Functional integration of hardware + firmware + calibration
- Promising initial performance warranting further development

**What's Still Unknown:**

1. **Does it work at -60°C?** This is the critical question. The AD7746 datasheet specifies -40°C minimum, but many ICs function beyond rated limits. Testing required.

2. **Does the DHP14 maintain calibration at extreme cold?** Polymer-based capacitive sensors can become sluggish or shift calibration at low temperature. Characterization needed.

3. **What is the sensor response time at stratospheric temperature and pressure?** Moisture diffusion into the capacitive element may slow dramatically in cold, low-pressure conditions.

4. **What is the low-RH accuracy?** The stratosphere is dry (<1% RH). Validation against controlled low-humidity references (LiCl saturated salt = 11% RH, or dry nitrogen purge for <1% RH) required.

**Planned Next Tests:**

1. **Thermal chamber characterization**: Full temperature sweep from +25°C to -60°C in 5°C steps, measuring:
   - Sensor function (does it work at all?)
   - Accuracy vs. temperature
   - Response time vs. temperature
   - Calibration shift after thermal cycling

2. **Multi-point humidity calibration**: Additional saturated salt solutions:
   - LiCl: 11.3% RH (low humidity validation)
   - NaCl: 75.3% RH (mid-high humidity)
   - K₂SO₄: 97.3% RH (near-saturation)

3. **Long-duration drift test**: 7-day continuous operation to quantify long-term stability

4. **Pressure chamber test**: Does 10 kPa vs. 100 kPa affect sensor response? (Humidity is mass mixing ratio, not partial pressure—should be insensitive, but validate)

5. **Flight test**: Actual balloon flight to 20+ km altitude provides real-world validation that no ground test can replicate

## The Trade-off Decision

**Technical Perspective:**

The AD7746 system shows promising measurement precision in initial testing. Whether this translates to superior field performance compared to commercial sensors requires extended validation—but the early data suggests potential for improvement in repeatability and low-noise measurement.

**Mission Perspective:**

Stratosonde's primary mission is atmospheric profiling for weather prediction improvement. Humidity measurements feed into:
- Water vapor vertical distribution (critical for radiative transfer)
- Cloud formation and convection modeling
- Atmospheric boundary layer characterization

For these applications, even ±5% RH humidity data is valuable. The question is whether **±0.2% RH vs. ±2% RH significantly improves the science**, or whether the precision exceeds the resolution of atmospheric models.

**Engineering Perspective:**

Integration complexity matters. The SHT31 is:
- Single I2C device
- Factory-calibrated
- Known power consumption
- Proven flight heritage (on Revision 1 hardware)

The AD7746 system requires:
- I2C interface + analog sensor connections
- Manual calibration procedure
- More complex firmware (capacitance → humidity conversion, CAPDAC management, range extension)
- Unknown flight behavior at temperature extremes

**Power Perspective:**

As noted, power consumption is acceptable:
- PT1000: 300 µA during measurement, 0 µA when GPIO-switched off
- AD7746: <1 mA active, <1 µA sleep, can be GPIO-controlled
- DHP14: Passive (zero power)
- Average power: ~4.3 µW (negligible compared to 20-50 mW system budget)

This is actually **lower** than keeping an SHT31 powered continuously (0.3 mA × 3.3V = 1 mW vs. 4.3 µW for AD7746 duty-cycled).

**The Decision Matrix:**

| Criterion | SHT31 (Keep) | AD7746 (Replace) |
|-----------|--------------|------------------|
| **Accuracy** | ±2% RH (specified) | TBD (early testing: -0.20% RH offset) |
| **Repeatability** | ±1% RH | 0.09% RH (2.77 hr test) |
| **Low temp capability** | -40°C limit | Unknown (testing needed) |
| **Low RH capability** | Degrades <10% RH | Unknown (testing needed) |
| **Power consumption** | 1 mW continuous | 4.3 µW average ✓ |
| **Integration complexity** | Simple ✓ | Complex |
| **Flight heritage** | Proven ✓ | None |
| **Cost** | ~$8 ✓ | ~$40 |

The AD7746 system shows potential advantages in repeatability and power, but unknowns in critical areas (low temp, low RH) and higher integration complexity. The decision depends on whether extended testing validates the potential and whether the mission benefits justify the engineering effort.

## Potential Applications Beyond Stratosonde

While evaluating this sensor for Stratosonde, several other applications became apparent:

**Ground-Based Validation:**

Before (or instead of) flying the AD7746 system, it could serve as a **ground reference sensor** for validating other humidity sensors:
- Characterize SHT31 behavior at temperature extremes in thermal chamber
- Compare commercial sensors against AD7746 reference
- Build humidity calibration capability for other projects

**External Sensor Platform:**

A Qwiic-based AD7746 board could be:
- Added to Stratosonde for specific missions requiring precision humidity
- Used on other balloon platforms (amateur radiosondes, high-altitude photography)
- Employed in ground weather stations requiring high precision
- Utilized in environmental chambers and controlled storage

**Standalone Data Logger:**

The existing MicroPython implementation on Raspberry Pi Pico W could become:
- Precision humidity logger for HVAC characterization
- Agricultural growth chamber monitoring
- Museum/archive climate control validation
- Pharmaceutical storage compliance monitoring

The development effort for Stratosonde could yield a useful instrument with applications beyond ballooning.

## Conclusion: Proven Precision, Unknown Stratospheric Capability

The AD7746 + DHP14 + PT1000 sensor system shows **encouraging initial performance** in room-temperature characterization. The 10,000 second test demonstrates:

- 0.09% RH measurement repeatability at ~33% RH reference point
- <0.005% RH/hour short-term drift (2.77 hours only)
- Effective temperature compensation across 2°C thermal variations
- Functional measurement chain from capacitance to calibrated humidity

Whether this translates to "laboratory-grade" performance requires substantially more validation: multi-point calibration, extended temperature range, long-term stability trials, and comparison against traceable reference standards.

For room-temperature applications, this sensor system shows **promising initial results**. The measured precision and stability are encouraging, but full validation requires extended testing across temperature and humidity ranges before deployment.

For **stratospheric applications**, the critical questions remain unanswered:

Does the AD7746 IC function at -60°C? Does the DHP14 capacitive element maintain accuracy at extreme cold? What is the sensor response time at 10 kPa and -56.5°C?

Those answers require thermal chamber testing and ultimately, flight validation. Until then, the AD7746 system remains a **high-precision sensor with proven room-temperature performance and unknown stratospheric capability**.

The next test is thermal: place the sensor assembly in a -60°C chamber, run the same validation protocol, and see if the precision survives the cold. If it does, the decision becomes easy. If it doesn't, we'll at least know the limits of the technology—and whether those limits can be engineered around with thermal management, just like we did for batteries.

Sometimes the most valuable engineering result is knowing exactly where physics draws the line.

---

## Related Posts

This post is part of the Stratosonde sensor characterization series:

- [BQ25570 Bench Characterization]({% post_url 2025-11-23-bq25570-bench-characterization %}) - Solar harvester performance
- [HTC1015 LTO Temperature Characterization]({% post_url 2025-11-23-htc1015-lto-temperature-characterization %}) - Battery performance at -60°C
- [Ceramic Capacitor Bank Validation]({% post_url 2025-11-25-ceramic-capacitor-bank-extreme-cold-validation %}) - Power system at extreme cold

---

*Raw characterization data: [humidbox.csv]({{ site.baseurl }}/assets/data/humidbox.csv)*

*AD7746 Datasheet: [ad7745_7746.pdf](https://github.com/stratosonde/hardware/blob/main/datasheets/ad7745_7746.pdf)*

*DHP14 Humidity Sensor: [Innovative Sensor_DHP14-Rapid-W_5.pdf](https://github.com/stratosonde/hardware/blob/main/datasheets/Innovative%20Sensor_DHP14-Rapid-W_5.pdf)*

*PT1000 RTD Datasheet: [DTP600_E.pdf](https://github.com/stratosonde/hardware/blob/main/datasheets/DTP600_E.pdf)*

