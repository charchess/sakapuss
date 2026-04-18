'use strict';

/**
 * CJS shim for until-async (ESM-only package)
 * Gracefully handles a callback that returns a promise.
 */
async function until(callback) {
  try {
    return [null, await callback().catch((error) => { throw error; })];
  } catch (error) {
    return [error, null];
  }
}

module.exports = { until };
