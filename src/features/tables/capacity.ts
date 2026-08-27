export function capacityProjection(occupiedSeats: number, incomingSeats: number, capacity: number) {
  const projected = occupiedSeats + incomingSeats;
  return { projected, capacity, exceeded: projected > capacity, remaining: Math.max(0, capacity - projected) };
}
