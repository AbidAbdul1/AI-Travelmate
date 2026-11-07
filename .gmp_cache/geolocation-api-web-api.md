---
name: geolocation-api-web-api
description: Use this skill when estimating the geographic location (latitude and longitude coordinates and accuracy radius) of a device without native GPS using the Google Maps Platform Geolocation API via HTTPS POST requests based on cell tower, WiFi access point, or IP address data.
license: Apache-2.0
metadata:
  version: 1.0.54
---

> [!IMPORTANT] **Core Dependency:** This skill requires active context from
> [google-maps-platform/SKILL.md](https://www.gstatic.com/googlemapsplatform-agent-skills/google-maps-platform/SKILL.md).

### Overview

The Google Maps Platform Geolocation API is a web service that returns a
location (latitude and longitude coordinates) and an accuracy radius based on
information about cell towers and WiFi nodes that a mobile client can detect, or
by falling back to IP address geolocation. Communication is performed over HTTPS
using POST requests. Use this skill to construct valid request payloads,
configure radio and network parameters, and handle location responses and error
codes.

## Primary Orchestration Integration Workflow

Follow this multi-phase sequential integration checklist to compose features
robustly. For each phase, read the referenced capability sub-workflow file and
satisfy its *Evidence Checkpoint* before advancing.

### Phase 1: Core Initialization & Base Setup (Primary)

-   [ ] **Step 1.1: Returns the latitude and longitude coordinates of a device
    along with an accuracy radius based on cell tower, WiFi access point, and IP
    address information provided in an HTTPS POST request.** Read
    [references/return-latitudelongitude-coordinates-device-that-made-and-https-request-based-cell-tower-and-wi-fi-a.md](https://www.gstatic.com/googlemapsplatform-agent-skills/geolocation-api-web-api/references/return-latitudelongitude-coordinates-device-that-made-and-https-request-based-cell-tower-and-wi-fi-a.md).
    *Trigger Condition*: Use when the user needs to determine a device's
    location coordinates using cell tower data, WiFi access points, or IP
    geolocation via the Geolocation API. *Evidence Checkpoint*: Confirm the
    HTTPS POST request to the geolocate endpoint includes a valid API key and
    returns an HTTP 200 OK JSON response containing `location` (`lat`, `lng`)
    and `accuracy` fields.
