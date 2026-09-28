# RoadMitra — SIH 2026 Prototype

A frontend prototype based on the uploaded RoadMitra SIH solution.

## Solution represented
- Public buses as mobile road scanners using existing CCTV + GPS
- YOLOv8-style road-damage detection
- ByteTrack-style de-duplication / tracking
- VLM verification to reduce false alerts
- Geo-tagged evidence: image, GPS, time and confidence
- Live ward heat-map
- Verified detection inbox
- Bus fleet monitoring
- Municipal work-order flow
- Evidence/audit library

## Run
```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Important
This is a UI/interaction prototype. The AI detections, GPS, heat-map and verification results are simulated demo data. To turn it into the actual SIH implementation, connect the UI to the YOLOv8 + ByteTrack + VLM pipeline, a GPS/telemetry API, storage, and a backend for alerts/work orders.
