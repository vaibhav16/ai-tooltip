// // src/utils/throttle.js
// export function throttle(func, limit) {
//   let inThrottle;
//   return function (...args) {
//     if (!inThrottle) {
//       func.apply(this, args);
//       inThrottle = true;
//       setTimeout(() => (inThrottle = false), limit);
//     }
//   };
// }


export function throttle(fn, wait) {
  let lastCalled = 0;
  let timeout;

  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - lastCalled);

    if (remaining <= 0) {
      lastCalled = now;
      fn(...args);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastCalled = Date.now();
        fn(...args);
      }, remaining);
    }
  };
}