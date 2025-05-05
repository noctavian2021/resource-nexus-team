
// This is a browser shim for the object-assign module

function objectAssign(target) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }

  var to = Object(target);
  
  for (var i = 1; i < arguments.length; i++) {
    var nextSource = arguments[i];
    if (nextSource === undefined || nextSource === null) {
      continue;
    }

    nextSource = Object(nextSource);

    var keysArray = Object.keys(nextSource);
    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      var nextKey = keysArray[nextIndex];
      var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey];
      }
    }
  }
  
  return to;
}

// Export as both default and named exports
export default objectAssign;
export { objectAssign };
