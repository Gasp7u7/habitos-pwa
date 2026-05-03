export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000; // Earth radius in meters
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isValidGpsPoint(
  newPoint: GeolocationCoordinates, 
  lastPoint: { latitude: number, longitude: number, timestamp: number } | null,
  activityType: 'walk' | 'run' | 'bike' | 'cycling' | 'gym' | 'sport' | 'other' = 'run'
): boolean {
  // Accuracy check (reject anything over 50 meters of uncertainty)
  if (newPoint.accuracy > 50) return false;

  // Validate speed if last point exists
  if (lastPoint) {
    const timeDeltaMs = Date.now() - lastPoint.timestamp;
    if (timeDeltaMs <= 0) return false; // Duplicate timestamp
    
    const distanceMeters = haversineDistanceMeters(
      lastPoint.latitude,
      lastPoint.longitude,
      newPoint.latitude,
      newPoint.longitude
    );
    
    // Ignore small jitters if they are too small
    if (distanceMeters < 3) return false;

    // Calculate empirical speed in meters/second
    const speedMps = distanceMeters / (timeDeltaMs / 1000);
    const speedKmh = speedMps * 3.6;

    // Speed filtering based on activity type
    let maxKmh = 70;
    if (activityType === 'walk') maxKmh = 8;
    else if (activityType === 'run') maxKmh = 25;
    else if (activityType === 'bike' || activityType === 'cycling') maxKmh = 70;

    if (speedKmh > maxKmh) return false;
  }

  return true;
}
