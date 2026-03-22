const Module = require("module");

const originalLoad = Module._load;

Module._load = function patchedLoad(request, parent, isMain) {
  if (request === "@lancedb/lancedb") {
    return {
      connect() {
        throw new Error("connect failed");
      }
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};
