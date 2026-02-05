---
layout: post
title: "Satellite Pass Prediction for a Moving Platform: Lacuna LoRaWAN from Stratospheric Balloons"
date: 2026-02-02 08:00:00 -0700
categories: firmware satellite communications
tags: [lacuna, satellite, lorawan, leo, pass-prediction, orbital-mechanics, power-management, gps]
---

> **🎧 Listen to this article:** [NotebookLM Podcast]({{ site.baseurl }}/assets/audio/Predicting_Satellite_Passes_from_a_Drifting_Balloon.m4a)  
> *An AI-generated audio discussion created by Google's NotebookLM*

# Satellite Pass Prediction for a Moving Platform: Lacuna LoRaWAN from Stratospheric Balloons

Traditional satellite pass prediction assumes a stationary observer—a ground station with a fixed latitude and longitude, patiently waiting for satellites to arc across the sky on predictable schedules. Compute the orbital parameters once, generate a pass table for the next week, set alarm clocks, profit. The mathematics are well-understood, the software is mature, and the approach works perfectly for terrestrial applications.

Stratosonde breaks this assumption. A stratospheric balloon drifting at 18-25 km altitude moves at 20-100 km/hr, covering hundreds of kilometers per day as it's carried by jet stream winds. The "ground station" is no longer stationary—it's a moving platform with a continuously changing position. By the time a predicted satellite pass arrives, the balloon may have drifted 50 km away, placing it outside the satellite's communication footprint.

This post explores the challenge of satellite pass prediction for moving platforms, focusing on Lacuna Space's LEO LoRaWAN constellation and the algorithmic strategies for maximizing successful contacts while minimizing power consumption. The core question: **How do you efficiently predict and catch satellite passes when both the satellite AND the observer are moving?**

## Why Satellite Communications Matter for Stratosonde

Stratosonde is designed for multi-day stratospheric float missions, collecting atmospheric data over extended periods and vast distances. Traditional radiosondes rely on terrestrial LoRaWAN gateways for data downlink—a reasonable assumption for short-duration ascent-only flights that remain within a few hundred kilometers of the launch site. But extended float missions quickly move beyond terrestrial infrastructure coverage.

**The Coverage Challenge:**

- **Terrestrial LoRaWAN Range**: ~10-50 km from gateways (depending on terrain, antenna height, and regulatory power limits)
- **Gateway Distribution**: Concentrated in populated areas; sparse or nonexistent in remote regions
- **Balloon Flight Range**: Can travel 500-2000+ km during multi-day missions
- **Flight Environments**: Arctic, oceanic, desert, mountainous—exactly where gateways don't exist

A balloon launched from Calgary could easily drift over the Canadian Arctic, the Pacific Ocean, or remote wilderness where the nearest LoRaWAN gateway is hundreds of kilometers away. Without satellite backup, the balloon becomes a flying data logger that only returns its data if physically recovered—assuming you can even locate it in the wilderness.

**Enter Lacuna Space:**

Lacuna Space operates a LEO (Low Earth Orbit) satellite constellation providing LoRaWAN connectivity from space. Their satellites act as orbiting gateways, visible from anywhere on Earth as they pass overhead. Key characteristics:

| Parameter | Specification | Implication |
|-----------|--------------|-------------|
| **Constellation** | 2 LEO +1 S-band satellites (growing) | Multiple pass opportunities per day |
| **Orbit Altitude** | ~580 km | LEO orbit with frequent passes |
| **Orbit Period** | ~96 minutes | Complete orbit every 1.6 hours |
| **Inclination** | 97.76° (polar) | Global coverage including polar regions |
| **Communication** | LoRaWAN (standard protocol) | No custom radio hardware needed |
| **Frequency** | Region-dependent (868/915 MHz) | Uses existing STM32WL radio |

This solves the coverage problem: anywhere the balloon drifts, multiple Lacuna satellites pass overhead each day, providing communication windows for data downlink. The challenge shifts from "can we communicate?" to "when can we communicate, and how do we minimize the power cost of catching those opportunities?"

**What This Enables:**

- **Real-time telemetry**: Stream position, altitude, and sensor data during flight
- **Remote regions**: Communicate from Arctic, oceanic, or wilderness environments
- **Mission assurance**: Retrieve critical data even if balloon is never physically recovered
- **Adaptive operations**: Downlink preliminary data to guide recovery efforts
- **Science return**: Immediate access to atmospheric measurements without waiting for recovery

The trade-off is power. Continuously listening for satellite passes would consume tens to hundreds of milliwatts—an unacceptable drain on Stratosonde's solar-harvested power budget. The solution requires intelligent pass prediction and adaptive power management.

## The Lacuna Pass Predictor (LPP2) Library

Lacuna provides the LPP2 (Lacuna Pass Predictor version 2) library—a C implementation of satellite pass prediction optimized for resource-constrained embedded systems. Given a GPS position and current time, LPP2 computes upcoming satellite contact windows with remarkable efficiency.

**Core Functionality:**

```c
// Initialize the prediction library
lpp2_init(&state, constellation_mask, &bitmap_cb, &storage_cb, &platform_cb);

// Install almanac data (satellite orbital parameters)
lpp2_offline_install(&state, almanac_data, almanac_size);

// Query for upcoming satellite passes
lpp2_contact_query query;
lpp2_init_contact_query(&query);
query.lat = current_latitude;    // From GPS
query.lon = current_longitude;   // From GPS
query.search_time = current_time();
query.service_mask = LPP2_QUERY_SERVICE_LRFHSS_UPLINK | LPP2_QUERY_SERVICE_LORA_UPLINK;

// Find next 5 contact opportunities
lpp2_contact contacts[5];
int count = lpp2_find_contacts(&state, &query, contacts, 5);

// Each contact contains:
//   - satellite_id: Which satellite (4, 5, 32, etc.)
//   - start_time: When pass begins (Unix timestamp)
//   - duration: Pass length in seconds
//   - max_elevation: Peak elevation angle during pass
```

**What It Does:**

LPP2 implements the orbital mechanics calculations needed to predict when satellites will be visible from a given location on Earth. The core algorithm:

1. **Orbital Propagation**: Given satellite almanac data (orbital period, inclination, initial position), propagate satellite position forward in time
2. **Geodetic Math**: Convert satellite orbital position to Earth-fixed coordinates (latitude, longitude, altitude)
3. **Visibility Calculation**: Determine if satellite is above the observer's horizon (accounting for Earth curvature and minimum elevation angle)
4. **Contact Window Extraction**: Identify continuous periods of visibility above minimum elevation threshold

The mathematics involve spherical geometry, Keplerian orbital elements, and Earth rotation—nontrivial calculations, but well-established in the satellite tracking community.

**Key Parameters:**

| Input | Description | Stratosonde Source |
|-------|-------------|-------------------|
| **Latitude** | Observer position (degrees or radians) | GPS receiver |
| **Longitude** | Observer position (degrees or radians) | GPS receiver |
| **Altitude** | Observer height above sea level | GPS receiver (~18-25 km for Stratosonde) |
| **Time** | Current UTC time (Unix timestamp) | RTC or GPS time |
| **Almanac** | Satellite orbital parameters | Pre-loaded or downloaded from satellite |

**Output:**

| Field | Description | Example Value |
|-------|-------------|---------------|
| `satellite_id` | Which satellite in the constellation | 4, 5, or 32 |
| `start_time` | Pass start (Unix timestamp) | 1738562400 (Feb 3, 2026 12:00:00 UTC) |
| `duration` | Contact window length (seconds) | 180 seconds (3 minutes) |
| `max_elevation` | Peak elevation angle (degrees) | 45° |

**Important Characteristics:**

- **Computational Efficiency**: Designed for microcontrollers; runs on STM32WL with minimal overhead
- **Memory Footprint**: ~17 KB code size for balloon-optimized build (removes unused features like S-band support, extensive country code tables)
- **Prediction Accuracy**: Typically ±10 seconds for pass timing over multi-day periods (almanac-dependent)
- **Almanac Validity**: Predictions require current almanac data (satellite orbits drift over time due to atmospheric drag and perturbations)

**The Almanac:**

Satellites don't maintain perfect Keplerian orbits—atmospheric drag, solar pressure, and gravitational perturbations cause orbital decay and precession. The almanac contains regularly updated orbital parameters that account for these effects. For Stratosonde:

- **Almanac Lifespan**: Valid for ~14-30 days depending on update cadence
- **Pre-loaded**: Almanac installed before flight (valid for expected mission duration)
- **Update Path**: Can receive updated almanacs via satellite broadcasts (if implemented)
- **Degradation**: Predictions become less accurate as almanac ages

For a typical 3-7 day Stratosonde mission, a fresh almanac loaded before launch provides sufficient accuracy. Longer missions might benefit from in-flight almanac updates, but that requires additional complexity for receiving and validating broadcast almanac data.

## Fixed Station vs. Moving Platform: The Problem

For a stationary ground station, satellite pass prediction is straightforward:

**Fixed Ground Station Approach:**

1. Query LPP2 once with station coordinates
2. Get list of all passes for the next week
3. Store pass schedule in memory or file
4. Power down until 5 minutes before next predicted pass
5. Wake up, turn on radio, wait for satellite
6. Communicate during pass window
7. Return to step 4

This works beautifully because the observer's position never changes. A pass predicted for Tuesday at 14:37:22 will occur at Tuesday 14:37:22 ± a few seconds (almanac accuracy permitting). The satellite follows a predictable path, the ground station sits in a fixed location, geometry is deterministic.

**Moving Platform Challenge:**

StratoSonde breaks every assumption:

| Aspect | Fixed Station | Stratosonde Balloon |
|--------|--------------|---------------------|
| **Position** | Constant (lat/lon never change) | Continuously moving (20-100 km/hr) |
| **Prediction validity** | Days to weeks | Minutes to hours |
| **Pass schedule** | Compute once, use repeatedly | Must recompute frequently |
| **Power strategy** | Sleep until scheduled pass | Unknown—sleep too long, miss pass |
| **Geometry** | Static (satellite moves, observer doesn't) | Dynamic (both satellite AND observer move) |
| **Complexity** | Low (set alarm, wake at predicted time) | High (adaptive algorithm required) |

**The Core Problem:**

Imagine this scenario:

1. **T=0 min**: Balloon at position (51.0°N, 114.0°W), LPP2 predicts satellite pass at T=60 min
2. **T=60 min**: Balloon has drifted to (51.3°N, 113.2°W)—80 km away from prediction position
3. **Result**: Satellite pass footprint no longer includes balloon; communication fails

The satellite is precisely where it should be. The prediction was correct—for the position the balloon *was* at, not where it *is now*. By the time the predicted pass arrives, the geometry has changed enough that the communication window no longer exists.

**How Bad Is This?**

LEO satellite footprints have limited ground coverage. A Lacuna satellite at 580 km altitude communicating at minimum elevation angle (e.g., 10° above horizon) has a visibility radius of approximately:

\[ r = \sqrt{(R_E + h)^2 - R_E^2 \cos^2(\epsilon)} - R_E \sin(\epsilon) \]

Where:
- \( R_E \) = Earth radius = 6371 km
- \( h \) = satellite altitude = 580 km
- \( \epsilon \) = minimum elevation = 10°

This gives a visibility radius of approximately **2,400 km**. However, communication range is much smaller—likely 200-500 km depending on transmit power, spreading factor, and link budget. 

If the balloon drifts 50-100 km during the prediction window, it can easily move outside the effective communication footprint, especially if it was near the edge of coverage in the initial prediction.

**Naive Solution Doesn't Work:**

"Just re-predict frequently!" uses power:

- GPS fix: ~25-80 mA for 30-60 seconds
- LPP2 computation: negligible (~1 mA for <1 second)
- **Wake every 5 minutes**: 12 GPS fixes per hour = 6-12 mAh/hour = 144-288 mAh/day

For a 40 mAh battery, that's 3.6-7.2 full battery cycles per day just for position updates—unacceptable.

The challenge: **balance prediction accuracy (requires frequent position updates) against power consumption (requires minimizing GPS and computation overhead).**

## Strategy 1: Predictive Wake-Up with Mid-Course Correction

The intelligent solution: predict passes from current position, but wake partway through the wait to check if the prediction is still valid. This adaptive approach balances power efficiency with prediction accuracy.

**Algorithm:**

```
1. Get current GPS position (lat, lon, time)
2. Query LPP2 for next satellite pass
3. If no pass found within search window:
     → Search failed, extend search or enter long sleep
4. If pass found:
     time_to_pass = pass.start_time - current_time
5. If time_to_pass < threshold (e.g., 5 minutes):
     → Pass imminent, stay awake and prepare for transmission
6. If time_to_pass >= threshold:
     → Sleep until halfway point: sleep_duration = time_to_pass / 2
7. Wake at mid-course checkpoint
8. Get new GPS position
9. Re-query LPP2 with updated position
10. Compare new prediction to original:
      - Is satellite getting closer? (shorter time_to_pass or better elevation)
      - Is satellite getting further? (longer time_to_pass or worse elevation)
11. If getting closer:
      → Original prediction still valid; sleep remainder until pass
12. If getting further away or pass disappeared:
      → Balloon drifted out of footprint; return to step 1 (new prediction)
13. At predicted pass time:
      → Wake, activate radio, attempt communication
14. Return to step 1
```

**Key Insight:**

By waking halfway to the predicted pass, we can detect whether the balloon's movement is taking it toward or away from the satellite's footprint. If the new prediction shows the pass getting closer or maintaining, we can confidently sleep the remaining time. If the pass is receding or has vanished, the balloon has moved significantly and we need to re-predict from the new position.

**Example Scenario:**

```
T=0:00    Balloon at (51.00°N, 114.00°W)
          LPP2 predicts pass at T=0:60 (60 minutes away)
          Sleep for 30 minutes (halfway point)

T=0:30    Wake for mid-course check
          Balloon now at (51.15°N, 113.70°W) — drifted 30 km NE
          Re-query LPP2 from new position
          
          Option A: Pass now predicts T=0:58 (28 minutes away)
                    → Getting closer! Sleep remaining 28 minutes
          
          Option B: Pass now predicts T=1:15 (45 minutes away)
                    → Getting further! Balloon drifted away from footprint
                    → Abort old prediction, compute new pass from current position
```

**Power Analysis:**

Assume typical values:
- **GPS fix**: 50 mA @ 3.3V for 45 seconds = 0.625 mAh
- **LPP2 computation**: 5 mA @ 3.3V for 1 second = negligible (~0.0014 mAh)
- **Deep sleep**: 0.010 mA average
- **Satellite communication**: 100 mA @ 3.3V for 60 seconds = 1.67 mAh

For a typical pass cycle with 60-minute prediction:

| Event | Power Consumption |
|-------|-------------------|
| Initial GPS + prediction | 0.625 mAh |
| Sleep 30 minutes | 0.005 mAh (30 min × 0.010 mA) |
| Mid-course GPS + prediction | 0.625 mAh |
| Sleep 28 minutes | 0.005 mAh |
| Wake + satellite TX | 1.67 mAh |
| **Total per successful pass** | **~2.93 mAh** |

If passes occur every 3-4 hours (typical for 3-satellite constellation):
- **Passes per day**: ~6-8
- **Daily power budget**: ~18-23 mAh/day for satellite subsystem
- **Percentage of 40 mAh battery**: 45-58% per day

This is manageable if solar harvesting provides sufficient charge current (which it does—~12 mA during daylight from our [BQ25570 characterization]({% post_url 2025-11-23-bq25570-bench-characterization %})).

**Advantages:**

✅ **Power efficient**: Only 2 GPS fixes per pass cycle (initial + mid-course)  
✅ **Adaptive**: Detects when balloon drift invalidates prediction  
✅ **High success rate**: Catches passes even with significant platform movement  
✅ **Predictable power**: Known worst-case energy budget per pass  
✅ **Suitable for long-duration missions**: Battery can support daily satellite contacts

**Trade-offs:**

⚠️ **Complexity**: Requires state machine to track prediction, mid-course timing, and pass validity  
⚠️ **Timing precision**: RTC must accurately wake at halfway point (typically ±1-2 seconds with LSE crystal)  
⚠️ **Edge cases**: Very short passes (<10 min away) may not benefit from mid-course check  
⚠️ **Threshold tuning**: The "halfway" heuristic may not be optimal for all drift rates

**Optimization Options:**

The "wake halfway" heuristic is simple but not perfect. Alternative approaches:

1. **Adaptive mid-course timing**: Wake earlier if balloon has high historical drift rate
2. **Multiple checkpoints**: For very long predictions (>2 hours), wake at 1/3 and 2/3 points
3. **Velocity-based prediction**: Use GPS velocity vector to predict future position and pre-emptively adjust
4. **Statistical confidence**: Track prediction accuracy over time; adjust checkpoint frequency based on success rate

For initial implementation, the simple halfway approach provides a good balance of efficacy and complexity.

## Strategy 2: Opportunistic Transmission

The alternative approach: don't predict at all. Simply check "is a satellite overhead right now?" during regular wake-ups for other purposes (like telemetry collection).

**Algorithm:**

```
1. Wake for regular telemetry collection (e.g., every 5 minutes)
2. Get GPS position
3. Read sensors (temperature, pressure, humidity, etc.)
4. Quick LPP2 query: "Is satellite visible NOW?"
     query.search_time = current_time
     query.max_lookahead = 60 seconds  // Only check immediate visibility
5. If satellite overhead:
     → Activate radio, attempt transmission
6. If no satellite:
     → Save telemetry to flash, return to sleep
7. Return to step 1
```

**Advantages:**

✅ **Simplicity**: No state machine, no mid-course tracking, no prediction management  
✅ **Zero additional GPS fixes**: Leverages GPS already used for telemetry  
✅ **No timing precision required**: Works with any wake schedule  
✅ **Robust**: Can't "miss" a pass due to prediction error

**Trade-offs:**

⚠️ **Very low success rate**: Probability of waking exactly during a 2-3 minute pass window is ~3-5%  
⚠️ **Wasteful**: Most satellite passes go unused  
⚠️ **Unpredictable**: Data downlink timing cannot be planned  
⚠️ **Incomplete for satellite-only missions**: Doesn't work if satellite is sole communication method

**When It Makes Sense:**

The opportunistic approach works best as a **fallback or supplement**, not the primary strategy:

- Regular telemetry wake-ups already happening for other reasons (terrestrial LoRaWAN, sensor logging)
- Satellite communication is a bonus, not critical path
- Power budget allows "wasted" computation on LPP2 queries that return no results
- Combined with predictive approach: opportunistic catches passes between predicted windows

**Power Impact:**

If already waking every 5 minutes for telemetry:
- LPP2 query adds <1 second @ 5 mA = ~0.007 mAh per wake
- 12 wakes/hour × 24 hours = 288 LPP2 queries/day
- Additional power: ~2 mAh/day

This is acceptable overhead—but the opportunity cost is low success rate.

## Hybrid Strategy: Combining Both Approaches

The optimal solution combines predictive and opportunistic strategies:

**Primary Mode: Predictive Wake-Up**
- Use mid-course correction algorithm for planned satellite contacts
- High success rate, efficient power use
- Suitable when satellite is primary or only communication method

**Fallback Mode: Opportunistic**
- During regular telemetry wake-ups, quick check for unexpected passes
- Catches satellites that weren't predicted (almanac drift, new satellites, missed predictions)
- Zero additional GPS cost, minimal computation overhead

**Adaptive Behavior:**

```
If (satellite is critical AND power budget allows):
    → Use predictive with mid-course correction

If (terrestrial gateways available AND satellite is backup):
    → Use opportunistic during regular telemetry cycles

If (prediction reliability is poor):
    → Increase opportunistic check frequency
    → Adapt prediction algorithm (more frequent checkpoints)
```

## Strategy Comparison

| Strategy | Power/Pass | Success Rate | Complexity | Best Use Case |
|----------|-----------|--------------|------------|---------------|
| **Always-on listening** | 150-300 mAh/day | ~100% | Very Low | Not viable for battery platform |
| **Fixed prediction (no adaptation)** | 1.5 mAh | ~20-30% | Low | Balloons with predictable drift |
| **Predictive + mid-course** | 2.9 mAh | ~75-90% | Medium | Primary strategy for moving platforms |
| **Opportunistic only** | 0.01 mAh/check | ~3-5% | Very Low | Fallback or bonus attempts |
| **Hybrid (predictive + opportunistic)** | 2.9-3.5 mAh | ~80-95% | Medium-High | Optimal for Stratosonde |

**Expected Performance (Hybrid Approach):**

Assuming 3-satellite constellation with 6-8 passes per day visible from balloon position:
- **Predictive catches**: 5-7 passes (75-90% success rate)
- **Opportunistic catches**: 0-1 additional pass (bonus)
- **Total successful contacts**: 5-8 per day
- **Daily power consumption**: 18-28 mAh for satellite subsystem
- **Success rate**: 80-95% of available passes

This provides excellent data return without excessive power drain.

## Implementation on Stratosonde STM32WL

The LPP2 library is designed for embedded systems and integrates cleanly with the STM32WL platform. Current status: **planning phase—not yet implemented on target hardware**, but the integration path is well-defined.

**Memory Footprint:**

The balloon-optimized LPP2 build (excludes S-band support, extensive country code lookups, bootstrap complexity) fits comfortably on STM32WLE5:

| Resource | STM32WLE5 Available | LPP2 Required | Remaining |
|----------|-------------------|---------------|-----------|
| **Flash** | 256 KB | ~17 KB | 239 KB (for application) |
| **RAM** | 64 KB | ~18 KB (state struct) | 46 KB |
| **Execution Time** | N/A | <1 second per prediction | Negligible vs. GPS fix time |

**Integration Points:**

```c
// GPS subsystem provides position
typedef struct {
    double latitude;
    double longitude;
    uint32_t altitude;
    uint32_t timestamp;
} gps_fix_t;

// LPP2 state (global, persistent)
static lpp2_state lpp2;
static bool lpp2_initialized = false;

// Initialize during system startup
void satellite_subsystem_init(void) {
    // Set up callbacks for persistent storage (flash)
    lpp2_storage_callbacks storage_cb = {
        .read = flash_read,
        .write = flash_write,
        .erase = flash_erase
    };
    
    // Initialize LPP2
    lpp2_init(&lpp2, LPP2_DEFAULT_CONSTELLATION_MASK,
              &bitmap_cb, &storage_cb, &platform_cb);
    
    // Load pre-installed almanac from flash
    lpp2_offline_install(&lpp2, almanac_data, almanac_size);
    
    lpp2_initialized = true;
}

// Main prediction function
satellite_pass_t predict_next_pass(gps_fix_t *position) {
    lpp2_contact_query query;
    lpp2_contact contacts[1];
    
    lpp2_init_contact_query(&query);
    query.lat = deg_to_rad(position->latitude);
    query.lon = deg_to_rad(position->longitude);
    query.search_time = position->timestamp;
    query.service_mask = LPP2_QUERY_SERVICE_LRFHSS_UPLINK | 
                         LPP2_QUERY_SERVICE_LORA_UPLINK;
    
    int count = lpp2_find_contacts(&lpp2, &query, contacts, 1);
    
    if (count > 0) {
        return (satellite_pass_t){
            .valid = true,
            .satellite_id = contacts[0].satellite_id,
            .start_time = contacts[0].start_time,
            .duration = contacts[0].duration,
            .max_elevation = contacts[0].max_elevation
        };
    }
    
    return (satellite_pass_t){.valid = false};
}
```

**Power Management Integration:**

The predictive wake-up algorithm integrates with Stratosonde's existing power management:

```c
// State machine for satellite pass tracking
typedef enum {
    SAT_STATE_IDLE,
    SAT_STATE_PREDICTING,
    SAT_STATE_WAITING_MIDCOURSE,
    SAT_STATE_WAITING_PASS,
    SAT_STATE_COMMUNICATING
} sat_state_t;

static sat_state_t sat_state = SAT_STATE_IDLE;
static satellite_pass_t current_prediction;
static uint32_t midcourse_wakeup_time;

void satellite_task(void) {
    gps_fix_t position;
    
    switch (sat_state) {
        case SAT_STATE_IDLE:
        case SAT_STATE_PREDICTING:
            // Get GPS position
            gps_get_fix(&position);
            
            // Predict next pass
            current_prediction = predict_next_pass(&position);
            
            if (current_prediction.valid) {
                uint32_t time_to_pass = current_prediction.start_time - rtc_get_time();
                
                if (time_to_pass < 300) {  // <5 minutes
                    // Stay awake and prepare for pass
                    sat_state = SAT_STATE_WAITING_PASS;
                } else {
                    // Schedule mid-course wakeup
                    midcourse_wakeup_time = rtc_get_time() + (time_to_pass / 2);
                    rtc_set_alarm(midcourse_wakeup_time);
                    sat_state = SAT_STATE_WAITING_MIDCOURSE;
                    enter_deep_sleep();
                }
            } else {
                // No passes found, sleep longer
                rtc_set_alarm(rtc_get_time() + 3600);  // Try again in 1 hour
                enter_deep_sleep();
            }
            break;
            
        case SAT_STATE_WAITING_MIDCOURSE:
            // Mid-course checkpoint
            gps_get_fix(&position);
            satellite_pass_t new_prediction = predict_next_pass(&position);
            
            if (new_prediction.valid) {
                uint32_t new_time_to_pass = new_prediction.start_time - rtc_get_time();
                uint32_t old_time_to_pass = current_prediction.start_time - rtc_get_time();
                
                if (new_time_to_pass <= old_time_to_pass) {
                    // Getting closer or maintaining - sleep remainder
                    rtc_set_alarm(new_prediction.start_time);
                    current_prediction = new_prediction;
                    sat_state = SAT_STATE_WAITING_PASS;
                    enter_deep_sleep();
                } else {
                    // Getting further away - re-predict
                    sat_state = SAT_STATE_PREDICTING;
                }
            } else {
                // Pass disappeared - balloon drifted away
                sat_state = SAT_STATE_PREDICTING;
            }
            break;
            
        case SAT_STATE_WAITING_PASS:
            // Pass time arrived
            lorawan_satellite_transmit();  // Attempt communication
            sat_state = SAT_STATE_IDLE;
            break;
    }
}
```

**Testing Strategy:**

Before flight validation, ground testing can validate the algorithm:

1. **Desktop Simulation**: Run LPP2 on PC with simulated balloon trajectories
2. **Moving Vehicle Test**: Install Stratosonde in car/boat, validate predictions while moving
3. **Stationary Validation**: Compare predictions to actual satellite passes from fixed location
4. **Power Measurement**: Measure actual GPS and LPP2 power consumption on hardware

Current status: LPP2 library has been compiled and tested on desktop (x86) but not yet integrated into STM32WL firmware.

## Visualization: Understanding Orbital Geometry

The LPP2 library includes a visualization tool that helps understand the orbital mechanics of satellite pass prediction. The interactive 3D view shows satellite orbits, the Earth's rotation, and how the moving balloon platform intersects with satellite coverage windows.

**[View the Interactive Visualization →]({{ site.baseurl }}/assets/visualizations/lacuna-satellite-viz/visualize.html)**

<div class="cesium-container" style="width: 100%; height: 600px; margin: 20px 0;">
    <iframe 
        src="{{ site.baseurl }}/assets/visualizations/lacuna-satellite-viz/visualize.html" 
        style="width: 100%; height: 100%; border: none;"
        title="Lacuna Satellite Pass Visualization">
    </iframe>
</div>

The visualization makes the abstract orbital mechanics tangible—you can see the satellite orbits, understand why passes are time-limited, and visualize how balloon motion affects the pass prediction geometry.

## Next Steps: From Theory to Flight

This post presents the algorithmic strategy for satellite pass prediction on a moving platform. The next phases validate the approach through progressive testing:

**Phase 1: Desktop Validation (Current)**

✅ **LPP2 library compilation**: Building balloon-optimized version on x86 for testing  
✅ **Visualization tool**: Interactive 3D view of satellite orbits functioning  
✅ **Power budget analysis**: Theoretical calculation shows 18-28 mAh/day feasible  
🔄 **Simulated trajectories**: Running LPP2 with synthetic balloon paths to validate algorithm logic

**Phase 2: Embedded Integration (Next)**

- **STM32WL port**: Integrate LPP2 library into Stratosonde firmware
- **Flash storage**: Implement almanac persistence in on-board flash memory
- **State machine**: Code the predictive wake-up algorithm with mid-course correction
- **Power measurement**: Validate actual GPS and LPP2 power consumption on hardware
- **Unit tests**: Verify prediction accuracy, timing precision, edge case handling

**Phase 3: Ground Testing**

-  **Stationary validation**: Compare LPP2 predictions to actual satellite passes from fixed location
- **Accuracy measurement**: Quantify prediction vs. reality timing error
- **Moving vehicle test**: Install Stratosonde in car/boat to simulate balloon movement
- **Algorithm validation**: Confirm mid-course correction catches passes despite platform motion
- **Thermal testing**: Validate LPP2 operation at -60°C (stratospheric conditions)

**Phase 4: Flight Validation**

- **Test flight**: Launch on actual balloon with terrestrial LoRaWAN as backup
- **Data collection**: Log all predictions, mid-course corrections, and communication attempts
- **Success rate measurement**: Count successful satellite contacts vs. total predicted passes
- **Post-flight analysis**: Compare actual track to predictions, identify algorithm improvements
- **Parameter tuning**: Adjust mid-course timing, thresholds based on real-world performance

**Open Questions:**

❓ **Actual success rate**: Will 75-90% prediction accuracy hold in real flight conditions?  
❓ **Cold temperature effects**: Does LPP2 computation slow down at -60°C?  
❓ **Link budget**: What's the actual communication range to Lacuna satellites from 20 km altitude?  
❓ **Atmospheric effects**: Do ionospheric conditions impact LoRaWAN satellite links?  
❓ **Almanac aging**: How quickly do predictions degrade as almanac gets older?

Each of these questions requires empirical data—simulations can only go so far. Flight testing will provide the ground truth that validates (or invalidates) the algorithmic approach.

## Conclusion: Engineering for the Unknown

Satellite pass prediction for a moving platform sits at the intersection of orbital mechanics, power management, and real-time decision-making. The traditional approach—compute passes once, wake at scheduled times—fails when the observer is a balloon drifting across continents at the whims of stratospheric winds.

The predictive wake-up with mid-course correction algorithm addresses this challenge by treating pass prediction as a continuous process rather than a one-time calculation. By waking halfway to each predicted pass and checking "are we getting closer or further away?", the algorithm adapts to platform movement while minimizing power consumption. The hybrid approach—combining predictive scheduling with opportunistic checks—provides robustness against edge cases and prediction errors.

The power analysis shows this approach is viable: ~2.9 mAh per successful satellite contact, 18-28 mAh/day for the satellite subsystem, well within the capabilities of solar harvesting systems characterized in previous testing. The memory footprint (~17 KB flash, ~18 KB RAM) fits comfortably on the STM32WLE5 microcontroller.

But all of this remains theoretical until validated in flight. Desktop simulations and power calculations provide confidence that the approach will work, but stratospheric conditions—extreme cold, low pressure, unpredictable wind patterns, real satellite link budgets—will be the ultimate test. The first flight carrying LPP2 will generate data that either validates the design or reveals where theory diverges from practice.

Sometimes the most valuable engineering result isn't building something that works—it's building something that teaches you why it doesn't. The algorithms are ready. The hardware is capable. The power budget closes. Now comes the part where we find out what we got wrong.

That's what makes it interesting.

---

## Related Posts

This post is part of the Stratosonde communications architecture series:

- [LoRaWAN Energy Budget for Stratospheric Operations]({% post_url 2025-12-06-lorawan-energy-budget-stratospheric-operations %}) - Terrestrial LoRaWAN power analysis
- [BQ25570 Bench Characterization]({% post_url 2025-11-23-bq25570-bench-characterization %}) - Solar harvesting efficiency
- [H3lite STM32WL Hardware Validation]({% post_url 2025-12-27-h3lite-stm32wl-hardware-validation %}) - LoRaWAN regional coverage optimization

---

*LPP2 Library Documentation: [VISUALIZATION_README.md](https://github.com/stratosonde/firmware/tree/main/temp/lacuna)*

*Lacuna Space: [https://lacuna.space](https://lacuna.space)*

*Interactive Visualization: [Lacuna Satellite Pass Predictor](/assets/visualizations/lacuna-satellite-viz/visualize.html)*


