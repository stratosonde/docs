---
layout: post
title: "Interactive 3D Visualization of LoRaWAN Regions and H3 Hexagons with CesiumJS"
date: 2025-10-29
categories: visualization tools
author: Stratosonde Team
---

## Visualizing Global LoRaWAN Coverage with CesiumJS

Building on our [H3Lite region detection system]({% post_url 2025-10-29-h3lite-lorawan-region-detection %}), we've created an interactive 3D globe visualization that displays LoRaWAN regional boundaries and their corresponding H3 hexagonal cells. This tool helps developers, researchers, and operators understand how the Stratosonde automatically determines its transmission region based on GPS coordinates.

## Live Demo

**[Launch the Cesium LoRaWAN Viewer](https://stratosonde.github.io/.github/profile/cesium-lorawan-viewer.html)**

## Features

### 1. Interactive Globe Visualization

The visualization uses [CesiumJS](https://cesium.com/), a powerful open-source JavaScript library for 3D globes and maps. Unlike flat 2D maps, Cesium accurately represents the Earth's curvature, making it ideal for visualizing:

- **Stratospheric balloon flight paths** that span continents
- **Region boundaries** that cross polar regions
- **H3 hexagonal grids** at various resolutions

### 2. LoRaWAN Region Boundaries

Load GeoJSON files from the [DEWI Alliance hplans repository](https://github.com/dewi-alliance/hplans) to visualize regulatory boundaries for all major LoRaWAN regions:

- **US915** - United States and territories
- **EU868** - European Union
- **AU915** - Australia
- **AS923-1/2/3/4** - Asia Pacific variants
- **KR920** - South Korea
- **IN865** - India
- **CN470** - China
- **RU864** - Russia
- **EU433** - Europe 433 MHz band

Each region is rendered with a distinct color and semi-transparent fill, making it easy to see overlapping coverage areas.

### 3. H3 Hexagonal Grid Overlay

The visualization integrates [h3-js](https://github.com/uber/h3-js), the JavaScript implementation of Uber's H3 geospatial indexing system. This allows you to:

- **Generate H3 cells** at resolutions 0-6 for any loaded region
- **Compare resolutions** to understand size/accuracy tradeoffs
- **Visualize firmware behavior** using the default resolution 3 (~100km hexagons)
- **See exact cell boundaries** that the Stratosonde uses for region detection

### 4. Multi-Region Comparison

Select multiple regions simultaneously to:
- **Identify transition zones** where the Stratosonde might switch between regions
- **Visualize coverage gaps** over oceans and remote areas
- **Understand regional complexity** (e.g., AS923 variants in Southeast Asia)

## Technical Implementation

### CesiumJS Integration

The visualization leverages Cesium's powerful data source system:

```javascript
// Load GeoJSON with custom styling
const dataSource = await Cesium.GeoJsonDataSource.load(
    `../hplans/${regionName}.geojson`,
    {
        stroke: regionColors[regionName],
        fill: regionColors[regionName].withAlpha(0.15),
        strokeWidth: 2,
        clampToGround: true
    }
);
```

### H3 Cell Generation

Converting region polygons to H3 cells uses the h3-js library:

```javascript
function polygonToH3Cells(coordinates, resolution) {
    const h3Cells = new Set();
    
    // Convert GeoJSON coordinates to H3 format [lat, lng]
    const h3Polygon = exterior.map(coord => [coord[1], coord[0]]);
    
    // Generate H3 cells covering the polygon
    const cells = h3.polygonToCells(h3Polygon, resolution);
    cells.forEach(cell => h3Cells.add(cell));
    
    return Array.from(h3Cells);
}
```

### Dynamic Hexagon Rendering

Each H3 cell is rendered as a polygon entity in Cesium:

```javascript
h3Cells.forEach(cellId => {
    const boundary = h3.cellToBoundary(cellId);
    const positions = boundary.map(coord => 
        Cesium.Cartesian3.fromDegrees(coord[1], coord[0])
    );
    
    h3DataSource.entities.add({
        name: `${regionName} - ${cellId}`,
        polygon: {
            hierarchy: new Cesium.PolygonHierarchy(positions),
            material: regionColors[regionName].withAlpha(0.3),
            outline: true,
            outlineColor: regionColors[regionName],
            description: `Region: ${regionName}<br>H3 Cell: ${cellId}`
        }
    });
});
```

## Understanding H3 Resolutions

The visualization lets you experiment with different H3 resolutions to understand the firmware's design choices:

| Resolution | Avg Hexagon Area | Edge Length | Use Case |
|------------|------------------|-------------|----------|
| 0 | 4,250,546 km² | 1,107 km | Continental scale |
| 1 | 607,220 km² | 418 km | Country/state scale |
| 2 | 86,745 km² | 158 km | Regional boundaries |
| 3 | 12,392 km² | 60 km | **Firmware default** |
| 4 | 1,770 km² | 23 km | High precision |
| 5 | 253 km² | 8.5 km | Urban areas |
| 6 | 36 km² | 3.2 km | Neighborhood scale |

**Why Resolution 3?**
- Provides ~100km hexagons that balance accuracy with table size
- Captures regional boundaries with ±50-100km precision
- Requires only ~44KB of lookup table for global coverage
- Appropriate for stratospheric balloon drift speeds (10-30 m/s)

## Use Cases

### 1. Flight Path Planning

Use the visualization to:
- **Predict region transitions** for planned balloon launches
- **Identify over-ocean segments** where nearest-region detection activates
- **Understand restricted areas** (e.g., North Korea) where transmissions are disabled

### 2. Gateway Network Coverage

Operators can:
- **Visualize LoRaWAN gateway coverage** alongside regional boundaries
- **Plan gateway deployments** near region boundaries
- **Identify coverage gaps** in remote areas

### 3. Educational Tool

For students and researchers:
- **Learn about geospatial indexing** through interactive exploration
- **Understand LoRaWAN frequency regulations** across different countries
- **Visualize embedded systems constraints** (why resolution 3 vs. resolution 6?)

### 4. Firmware Development

For developers working on the Stratosonde:
- **Verify H3 cell generation** matches the firmware lookup table
- **Debug region detection** by comparing GPS coordinates to H3 cells
- **Test edge cases** near region boundaries and over oceans

## Comparison with Other Visualizations

### Traditional 2D Maps
- ❌ Distorts polar regions
- ❌ Doesn't show Earth's curvature
- ✅ Faster rendering
- ✅ Simpler implementation

### CesiumJS 3D Globe
- ✅ Accurate global representation
- ✅ Natural visualization for stratospheric flights
- ✅ Built-in camera controls and navigation
- ❌ Requires WebGL support
- ❌ Larger initial download

## Browser Compatibility

The visualization requires:
- **WebGL 2.0** support (modern browsers)
- **JavaScript ES6+** features
- **Good GPU** for smooth interaction with many hexagons

Tested on:
- Chrome 90+ ✅
- Firefox 88+ ✅
- Edge 90+ ✅
- Safari 14+ ✅

## Performance Considerations

### Loading Times
- **GeoJSON files**: Complex regions (CN470, AS923-3) may take 5-10 seconds to load
- **H3 generation**: Resolution 3 generates cells in 1-3 seconds per region
- **Higher resolutions**: Resolution 5+ may take 30+ seconds and generate thousands of hexagons

### Optimization Tips
1. **Load only needed regions** rather than all regions at once
2. **Use resolution 2-3** for interactive exploration
3. **Use resolution 4-6** only for specific areas of interest
4. **Close unused data sources** to free memory

## Getting Started

### 1. Access the Visualization

Simply open [cesium-lorawan-viewer.html](https://stratosonde.github.io/.github/profile/cesium-lorawan-viewer.html) in a modern web browser. No installation required!

### 2. Load Regions

1. Select one or more regions from the dropdown menu
2. Hold Ctrl (Windows/Linux) or Cmd (Mac) to select multiple regions
3. Click "Load Selected Regions"
4. Wait for the regions to load and render

### 3. Generate H3 Cells

1. Check "Show H3 Hexagons"
2. Adjust the resolution slider (0-6)
3. Click "Generate H3 Cells"
4. Explore the hexagonal grid overlay

### 4. Navigate the Globe

- **Left-click + drag**: Rotate the globe
- **Right-click + drag**: Pan the view
- **Mouse wheel**: Zoom in/out
- **Middle-click + drag**: Rotate camera around current point

## Source Code

The complete source code is available in the [Stratosonde repository](https://github.com/your-repo). Key files:

- `.github/profile/cesium-lorawan-viewer.html` - Main visualization
- `h3lite/generate_lookup_table.py` - Python script to generate firmware tables
- `hplans/*.geojson` - Region boundary definitions

## Future Enhancements

We're considering several improvements:

1. **Flight Path Simulation**
   - Upload GPS track logs
   - Visualize region transitions in real-time
   - Show transmission attempts and success rates

2. **Gateway Network Layer**
   - Display actual LoRaWAN gateway locations
   - Calculate coverage ranges
   - Show connectivity probability

3. **Weather Data Integration**
   - Overlay wind patterns
   - Show stratospheric jet streams
   - Predict balloon trajectories

4. **Multi-Resolution Optimization**
   - Visualize the firmware's multi-resolution strategy
   - Show resolution 1/2/3 cells together
   - Highlight boundary refinement areas

5. **Telemetry Replay**
   - Load actual Stratosonde telemetry
   - Replay flights with region detection
   - Analyze transmission success patterns

## Conclusion

The CesiumJS LoRaWAN Regions & H3 Visualization provides an intuitive way to understand how the Stratosonde's autonomous region detection works. By combining 3D globe visualization with H3 hexagonal grids, it bridges the gap between abstract geospatial concepts and practical embedded systems implementation.

Whether you're planning a balloon launch, developing firmware, or simply curious about how radios automatically adapt to different continents, this tool offers valuable insights into the intersection of geospatial indexing, regulatory compliance, and embedded systems design.

**Try it yourself: [Launch the Viewer](https://stratosonde.github.io/.github/profile/cesium-lorawan-viewer.html)**

---

## Related Articles

- [H3Lite: Enabling Autonomous LoRaWAN Region Detection]({% post_url 2025-10-29-h3lite-lorawan-region-detection %})
- [Balloon Float Calculator]({% post_url 2025-10-26-balloon-float-calculator %})
- [Stratosonde Power Calculator]({% post_url 2025-10-27-stratosonde-power-calculator %})

## Resources

- [CesiumJS Documentation](https://cesium.com/learn/cesiumjs-learn/)
- [H3 Geospatial Indexing](https://h3geo.org/)
- [DEWI Alliance hplans Repository](https://github.com/dewi-alliance/hplans)
- [LoRaWAN Regional Parameters](https://lora-alliance.org/resource_hub/rp2-1-0-3-lorawan-regional-parameters/)
