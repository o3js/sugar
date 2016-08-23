class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new AssertionError(message);
  }
}

module.exports = { AssertionError, assert };
