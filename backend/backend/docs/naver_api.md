Naver Directions API Usage

Overview
- Walking: `GET https://naveropenapi.apigw.ntruss.com/map-direction/v1/walking`
- Transit: `GET https://naveropenapi.apigw.ntruss.com/map-transit/v1/directions`

Auth Headers (Naver Cloud Platform)
- `X-NCP-APIGW-API-KEY-ID`: NAVER_MAPS_API_KEY_ID
- `X-NCP-APIGW-API-KEY`: NAVER_MAPS_API_KEY

Query Parameters (minimum)
- `start`: `{x},{y}` in EPSG:4326 (lon,lat)
- `goal`: `{x},{y}` in EPSG:4326 (lon,lat)
- Optional: `lang=ko` (if supported; not required), `option` (driving only)

Response Parsing (simplified)
- We pick the first route in the returned collection and extract:
  - `summary.distance` (meters)
  - `summary.duration` (seconds)
  - `path`: line coordinates as `[[x,y], ...]`
- Backend converts nothing for walking/transit, and the frontend maps to `{lat:y, lng:x}`.

Backend Endpoints
- `POST /api/naver/walking` — Body: `{ origin:{x,y}, destination:{x,y}, waypoints:[{x,y}] }`
- `POST /api/naver/transit` — Same body as above
- On failure or parsing issues, backend falls back to straight-line estimates.

Notes
- For CAR we keep Kakao Mobility `waypoints/directions` to preserve existing behavior.
- If your tenant enables extra query params, add them in `app/api/routes.py::_naver_leg`.

