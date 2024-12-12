type TrainStats = {
  acc: number;
  topSpeed: number;
  dwell: number;
};

type LineStats = {
  numStops: number;
  stopDist: number;
  freq: number;
}

type Trip = {
  stops: number;
  dist: number;
  time: number;
  avgSpeed: number;
}

const timeBetweenStops = (train: TrainStats, dist: number): number => {
  // t = (mA/a)
  const timeToTopSpeed = train.topSpeed / train.acc;
  // d = ½at²
  const distToTopSpeed = 0.5 * train.acc * timeToTopSpeed ** 2
  const accDecDist = distToTopSpeed * 2;
  if ( dist <= accDecDist ) {
    // t = √(2d/a)
    return Math.sqrt((4 * dist) / train.acc);
  }
  const remainingDist = dist - accDecDist;
  return (timeToTopSpeed * 2) +
    (remainingDist / train.topSpeed);
};

const tripTime = (stops: number, tween: number, train: TrainStats, line: LineStats): number => {
  return (tween * stops) +
    (train.dwell * (stops - 1)) +
    (line.freq / 2);
};

export const tripTimeTable = (train: TrainStats, line: LineStats): Trip[] => {
  const tween = timeBetweenStops(train, line.stopDist);
  const res = Array(line.numStops);
  for (let i=1; i<line.numStops; i++) {
    const time = tripTime(i, tween, train, line);
    const dist = i * line.stopDist;
    res[i] = { stops: i, time, dist, avgSpeed: dist / time }
  }
  return res;
};

export const allTrips = (train: TrainStats, line: LineStats): Trip[] => {
  const table = tripTimeTable(train, line);
  const allTimes: Trip[] = [];
  for (const [index, trip] of table.entries()) {
    const numTrips = line.numStops - index - 1;
    allTimes.concat(Array(numTrips).fill(trip));
  }
  return allTimes;
};

export const avgTrip = (trips: Trip[]): { time: number, dist: number, speed: number } => {
  const len = trips.length;
  const [tTime, tDist] = trips.reduce(([t, d], { time, dist }) => [t + time, d + dist], [0, 0]);
  const avgTime = tTime / len;
  const avgDist = tDist / len;
  const avgSpd = avgDist / avgTime;
  return { time: avgTime, dist: avgDist, speed: avgSpd };
};
