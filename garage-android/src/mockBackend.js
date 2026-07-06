// Garage — mock realtime backend.
// Stands in for the WebSocket / FCM broadcast channel and the atomic claim
// transaction. Swap these two functions for real network calls later; the UI
// contract (a Promise resolving to { ok, claimedBy }) stays identical.

// In-memory lock table: jobId -> mechanicId that won the claim.
const jobLocks = {};

// Probability that a competing mechanic has already grabbed a freshly broadcast
// job by the time this device tries to claim it — exercises the lost-race path.
const COMPETITOR_WIN_CHANCE = 0.3;

// Simulate the broadcast hitting this device. When a job goes out there is a
// chance a rival mechanic claims it first; we seed the lock so the atomic claim
// below can deterministically lose the race for that job.
export function broadcastJob(job) {
  if (Math.random() < COMPETITOR_WIN_CHANCE) {
    jobLocks[job.id] = "mech_rival_" + Math.floor(Math.random() * 90 + 10);
  }
}

// Atomic, transactional claim. Resolves { ok: true } if this mechanic locked the
// job, or { ok: false, claimedBy } if someone already holds the lock. The
// check-and-set runs in a single tick so two callers can't both win.
export function claimJob(jobId, mechanicId) {
  return new Promise((resolve) => {
    // Simulated network/db round-trip.
    setTimeout(() => {
      const holder = jobLocks[jobId];
      if (holder && holder !== mechanicId) {
        resolve({ ok: false, claimedBy: holder });
        return;
      }
      jobLocks[jobId] = mechanicId; // commit the lock
      resolve({ ok: true, claimedBy: mechanicId });
    }, 480);
  });
}

// Release a lock (e.g. mechanic cancels before navigating). Used for resets.
export function releaseJob(jobId, mechanicId) {
  if (jobLocks[jobId] === mechanicId) delete jobLocks[jobId];
}
