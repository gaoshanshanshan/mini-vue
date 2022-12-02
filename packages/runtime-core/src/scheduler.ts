const activePreFlushCbs: any[] = [];
const queue: any[] = [];
const p = Promise.resolve();
let isFlushPending = false;

export function nextTick(fn?) {
  return fn ? p.then(fn) : p;
}

export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
}

export function queuePreFlushCb(job) {
  activePreFlushCbs.push(job);
  queueFlush();
}

function queueFlush() {
  // 上锁，多次queue job，只会打开一个flushJobs
  if (isFlushPending) return;
  isFlushPending = true;
  nextTick(flushJobs);
}

function flushJobs() {
  let job;
  isFlushPending = false;
  flushPreFlushCbs();
  while ((job = queue.shift())) {
    job && job();
  }
}

function flushPreFlushCbs() {
  for (let i = 0; i < activePreFlushCbs.length; i++) {
    activePreFlushCbs[i]();
  }
}
