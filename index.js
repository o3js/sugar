const _ = require('lodash');
const fp = require('lodash/fp');

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

const existy = (val) => val !== null && val !== undefined;

const truthy = (val) => !!val;

/**
 *
 * http://stackoverflow.com/questions/13410
 754/i-want-to-display-the-file-name-in-the-log-statement
 * examines the call stack and returns a string indicating
 * the file and line number of the n'th previous ancestor call.
 * this works in chrome, and should work in nodejs as well.
 *
 * @param n : int (default: n=1) - the number of calls to trace up the
 *   stack from the current call.  `n=0` gives you your current file/line.
 *  `n=1` gives the file/line that called you.
 */
const inspectCallStack = (n, maxPathLength) =>{
  maxPathLength = existy(maxPathLength) ? maxPathLength : 24;
  maxPathLength = maxPathLength === 0 ? Infinity : maxPathLength;
  if (isNaN(n) || n < 0) n = 1;
  n += 1;
  let s = (new Error()).stack;
  let a = s.indexOf('\n', 5);
  while (n--) {
    a = s.indexOf('\n', a + 1);
    if (a < 0) {
      a = s.lastIndexOf('\n', s.length);
      break;
    }
  }
  let b = s.indexOf('\n', a + 1);
  if (b < 0) b = s.length;
  a = s.lastIndexOf(' ', b);
  b = s.lastIndexOf(':', b);
  s = s.substring(a + 1, b);
  if (s.length > maxPathLength) s = '...' + s.slice(maxPathLength);
  return s.split(':');
};

const interleave = (array, item) => {
  return _.flatten(_.map(array, function(elem, idx) {
    if (idx === (array.length - 1)) return [elem];
    else return [elem, item];
  }));
}

const _printable = (ancestors, val) => {
  if (_.isFunction(val)) return val.name || '[anonymous function]';

  if (_.isPlainObject(val) || _.isArray(val)) {
    if (_.includes(ancestors, val)) return '[circular]';
    const printableObj = {};
    ancestors.push(val);
    if (_.keys(val).length > 1000) return ('too long');
    _.each(val, (next, key) => {
      printableObj[key] = _printable(ancestors, next);
    });
    ancestors.pop();
    return printableObj;
  }

  if (_.isObject(val)) return val.toString();

  return val;
};

function parseParams(fn) {
  if (!fn) {
    return [];
  }

  var functionExp = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
  var commentsExp = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var argExp = /^\s*(\S+?)\s*$/;

  var fnString = fn.toString().replace(commentsExp, '');
  var match = fnString.match(functionExp);
  var params = match && match[1];

  if (!match || !params) {
    return [];
  }

  return _.map(params.split(','), function (param) {
    return param.match(argExp)[1];
  });
}

// Recursively copy an object into a printable representation.
// * Replace circular references with a token
// * Replace functions with their name
// * Call toString() on objects that are not 'plainObjects'
const printable = (val) => _printable([], val);

function partials(...specs) {
  specs = fp.chunk(2, specs);
  return fp.transform(
    (result, [fn, deps]) => {
      result[fn.name] = fp.partial(fn, deps);
      return result;
    },
    {},
    specs);
}

function partialAll(object, args) {
  return fp.mapValues((fn) => fp.partial(fn, args), object);
}

function mapIndexed(fn, obj) {
  return _.map(_.values(obj), (item, idx) => fn(item, idx));
}

module.exports = {
  AssertionError,
  assert,
  inspectCallStack,
  existy,
  truthy,
  printable,
  interleave,
  parseParams,
  partials,
  partialAll,
  mapIndexed,
};
