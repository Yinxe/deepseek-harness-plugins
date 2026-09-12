var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};

// ../../node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.3/node_modules/@deepseek-ai/cosmokit/lib/index.js
function isNullable(value) {
  return value === null || value === void 0;
}
function isPlainObject(data) {
  return data && typeof data === "object" && !Array.isArray(data);
}
function filterKeys(object, filter) {
  return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
function mapValues(object, transform) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
function pick(source, keys, forced) {
  if (!keys) return { ...source };
  const result = {};
  for (const key of keys) if (source[key] !== void 0) result[key] = source[key];
  return result;
}
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
var Binary;
(function(Binary2) {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    else return source;
  }
  Binary2.fromSource = fromSource;
  function toBase64(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  function toHex(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
})(Binary || (Binary = {}));
Binary.fromBase64;
Binary.toBase64;
Binary.fromHex;
Binary.toHex;
function clone(source, refs = /* @__PURE__ */ new Map()) {
  if (!source || typeof source !== "object") return source;
  if (is("Date", source)) return new Date(source.valueOf());
  if (is("RegExp", source)) return new RegExp(source.source, source.flags);
  if (isArrayBufferLike(source)) return source.slice(0);
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const cached = refs.get(source);
  if (cached) return cached;
  if (Array.isArray(source)) {
    const result2 = [];
    refs.set(source, result2);
    source.forEach((value, index) => {
      result2[index] = Reflect.apply(clone, null, [value, refs]);
    });
    return result2;
  }
  const result = Object.create(Object.getPrototypeOf(source));
  refs.set(source, result);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
    if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
    Reflect.defineProperty(result, key, descriptor);
  }
  return result;
}
function deepEqual(a, b, strict) {
  if (a === b) return true;
  if (!strict && isNullable(a) && isNullable(b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (!a || !b) return false;
  function check(test, then) {
    return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
  }
  return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
    if (a2.byteLength !== b2.byteLength) return false;
    const viewA = new Uint8Array(a2);
    const viewB = new Uint8Array(b2);
    for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
    return true;
  }) ?? Object.keys({
    ...a,
    ...b
  }).every((key) => deepEqual(a[key], b[key], strict));
}
var Time;
(function(Time2) {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  function getDateNumber(date2 = /* @__PURE__ */ new Date(), offset) {
    if (typeof date2 === "number") date2 = new Date(date2);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date2.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  function fromDateNumber(value, offset) {
    const date2 = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date2 + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  function parseDate(date2) {
    const parsed = parseTime(date2);
    if (parsed) date2 = Date.now() + parsed;
    else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date2}`;
    else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date2}`;
    return date2 ? new Date(date2) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) return Math.round(ms / Time2.day) + "d";
    else if (abs >= Time2.hour - Time2.minute / 2) return Math.round(ms / Time2.hour) + "h";
    else if (abs >= Time2.minute - Time2.second / 2) return Math.round(ms / Time2.minute) + "m";
    else if (abs >= Time2.second) return Math.round(ms / Time2.second) + "s";
    return ms + "ms";
  }
  Time2.format = format;
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
})(Time || (Time = {}));

// ../../node_modules/.pnpm/@deepseek-ai+schemastery@3.18.2/node_modules/@deepseek-ai/schemastery/lib/index.mjs
var kSchema = /* @__PURE__ */ Symbol.for("schemastery");
var kValidationError = /* @__PURE__ */ Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
  options;
  name = "ValidationError";
  constructor(message, options) {
    let prefix = "$";
    for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
    else if (typeof segment === "number") prefix += "[" + segment + "]";
    else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
    if (prefix.startsWith(".")) prefix = prefix.slice(1);
    super((prefix === "$" ? "" : `${prefix} `) + message);
    this.options = options;
  }
  static is(error) {
    return !!error?.[kValidationError];
  }
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
var Schema = function(options) {
  const schema = function(data, options2 = {}) {
    return Schema.resolve(data, schema, options2)[0];
  };
  if (options.refs) {
    const refs = mapValues(options.refs, (options2) => new Schema(options2));
    const getRef = (uid) => refs[uid];
    for (const key in refs) {
      const options2 = refs[key];
      options2.sKey = getRef(options2.sKey);
      options2.inner = getRef(options2.inner);
      options2.list = options2.list && options2.list.map(getRef);
      options2.dict = options2.dict && mapValues(options2.dict, getRef);
    }
    return refs[options.uid];
  }
  Object.assign(schema, options);
  if (typeof schema.callback === "string") try {
    schema.callback = new Function("return " + schema.callback)();
  } catch {
  }
  Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
  Object.setPrototypeOf(schema, Schema.prototype);
  schema.meta ||= {};
  schema.toString = schema.toString.bind(schema);
  return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
  return {
    version: 1,
    vendor: "schemastery",
    validate: (value) => {
      try {
        return { value: Schema.resolve(value, this, {})[0] };
      } catch (error) {
        if (ValidationError.is(error)) return { issues: [{
          message: error.message,
          path: error.options.path
        }] };
        throw error;
      }
    }
  };
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
  if (globalThis.__schemastery_refs__) {
    globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
    return this.uid;
  }
  globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
  globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
  const result = {
    uid: this.uid,
    refs: globalThis.__schemastery_refs__
  };
  globalThis.__schemastery_refs__ = void 0;
  return result;
};
Schema.prototype.set = function set(key, value) {
  this.dict[key] = value;
  return this;
};
Schema.prototype.push = function push(value) {
  this.list.push(value);
  return this;
};
function mergeDesc(original, messages) {
  const result = typeof original === "string" ? { "": original } : { ...original };
  for (const locale in messages) {
    const value = messages[locale];
    if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
    else if (typeof value === "string") result[locale] = value;
  }
  return result;
}
function getInner(value) {
  return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
  return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
  const schema = Schema(this);
  const desc = mergeDesc(schema.meta.description, messages);
  if (Object.keys(desc).length) schema.meta.description = desc;
  if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
    return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
  });
  if (schema.list) schema.list = schema.list.map((inner, index) => {
    return inner.i18n(mapValues(messages, (data = {}) => {
      if (Array.isArray(getInner(data))) return getInner(data)[index];
      if (Array.isArray(data)) return data[index];
      return extractKeys(data);
    }));
  });
  if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
    if (getInner(data)) return getInner(data);
    return extractKeys(data);
  }));
  if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
  return schema;
};
Schema.prototype.extra = function extra(key, value) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
};
for (const key of [
  "required",
  "disabled",
  "collapse",
  "hidden",
  "loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
Schema.prototype.deprecated = function deprecated() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "deprecated",
    type: "danger"
  });
  return schema;
};
Schema.prototype.experimental = function experimental() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "experimental",
    type: "warning"
  });
  return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
  const schema = Schema(this);
  const pattern2 = pick(regexp, ["source", "flags"]);
  schema.meta = {
    ...schema.meta,
    pattern: pattern2
  };
  return schema;
};
Schema.prototype.simplify = function simplify(value) {
  if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
  if (isNullable(value)) return value;
  if (this.type === "object" || this.type === "dict") {
    const result = {};
    for (const key in value) {
      const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
      if (this.type === "dict" || !isNullable(item)) result[key] = item;
    }
    if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
    return result;
  } else if (this.type === "array" || this.type === "tuple") {
    const result = [];
    value.forEach((value2, index) => {
      const schema = this.type === "array" ? this.inner : this.list[index];
      const item = schema ? schema.simplify(value2) : value2;
      result.push(item);
    });
    return result;
  } else if (this.type === "intersect") {
    const result = {};
    for (const item of this.list) Object.assign(result, item.simplify(value));
    return result;
  } else if (this.type === "union") for (const schema of this.list) try {
    Schema.resolve(value, schema, {});
    return schema.simplify(value);
  } catch {
  }
  return value;
};
Schema.prototype.toString = function toString(inline) {
  return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra2) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    role,
    extra: extra2
  };
  return schema;
};
for (const key of [
  "default",
  "link",
  "comment",
  "description",
  "max",
  "min",
  "step"
]) Object.assign(Schema.prototype, { [key](value) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
var resolvers = {};
Schema.extend = function extend(type, resolve2) {
  resolvers[type] = resolve2;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
  if (!schema) return [data];
  if (options.ignore?.(data, schema)) return [data];
  if (isNullable(data) && schema.type !== "lazy") {
    if (schema.meta.required) throw new ValidationError(`missing required value`, options);
    let current = schema;
    let fallback = schema.meta.default;
    while (current?.type === "intersect" && isNullable(fallback)) {
      current = current.list[0];
      fallback = current?.meta.default;
    }
    if (isNullable(fallback)) return [data];
    data = clone(fallback);
  }
  const callback = resolvers[schema.type];
  if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
  try {
    return callback(data, schema, options, strict);
  } catch (error) {
    if (!schema.meta.loose) throw error;
    return [schema.meta.default];
  }
};
Schema.from = function from(source) {
  if (isNullable(source)) return Schema.any();
  else if ([
    "string",
    "number",
    "boolean"
  ].includes(typeof source)) return Schema.const(source).required();
  else if (source[kSchema]) return source;
  else if (typeof source === "function") switch (source) {
    case String:
      return Schema.string().required();
    case Number:
      return Schema.number().required();
    case Boolean:
      return Schema.boolean().required();
    case Function:
      return Schema.function().required();
    default:
      return Schema.is(source).required();
  }
  else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
  const toJSON2 = () => {
    if (!schema.inner[kSchema]) {
      schema.inner = schema.builder();
      schema.inner.meta = {
        ...schema.meta,
        ...schema.inner.meta
      };
    }
    return schema.inner.toJSON();
  };
  const schema = new Schema({
    type: "lazy",
    builder,
    inner: { toJSON: toJSON2 }
  });
  return schema;
};
Schema.natural = function natural() {
  return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
  return Schema.number().step(0.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
  return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
    const date2 = new Date(value);
    if (isNaN(+date2)) throw new ValidationError(`invalid date "${value}"`, options);
    return date2;
  }, true)]);
};
Schema.regExp = function regExp(flag = "") {
  return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
    try {
      return new RegExp(value, flag);
    } catch (e) {
      throw new ValidationError(e.message, options);
    }
  }, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
  return Schema.union([
    Schema.is(ArrayBuffer),
    Schema.is(SharedArrayBuffer),
    Schema.transform(Schema.any(), (value, options) => {
      if (Binary.isSource(value)) return Binary.fromSource(value);
      throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
    }, true),
    ...encoding ? [Schema.transform(Schema.string(), (value, options) => {
      try {
        return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
      } catch (e) {
        throw new ValidationError(e.message, options);
      }
    }, true)] : []
  ]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
  if (!schema.inner[kSchema]) {
    schema.inner = schema.builder();
    schema.inner.meta = {
      ...schema.meta,
      ...schema.inner.meta
    };
  }
  return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
  return [data];
});
Schema.extend("never", (data, _, options) => {
  throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
  if (deepEqual(data, value)) return [value];
  throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta22, description, options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta22;
  if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
  if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta: meta22 }, options) => {
  if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
  if (meta22.pattern) {
    const regexp = new RegExp(meta22.pattern.source, meta22.pattern.flags);
    if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
  }
  checkWithinRange(data.length, meta22, "string length", options);
  return [data];
});
function decimalShift(data, digits) {
  const str = data.toString();
  if (str.includes("e")) return data * Math.pow(10, digits);
  const index = str.indexOf(".");
  if (index === -1) return data * Math.pow(10, digits);
  const frac = str.slice(index + 1);
  const integer = str.slice(0, index);
  if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
  return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
  step = Math.abs(step);
  if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
  const index = step.toString().indexOf(".");
  const digits = step.toString().slice(index + 1).length;
  return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta: meta22 }, options) => {
  if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
  checkWithinRange(data, meta22, "number", options);
  const { step } = meta22;
  if (step && !isMultipleOf(data, meta22.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
  return [data];
});
Schema.extend("boolean", (data, _, options) => {
  if (typeof data === "boolean") return [data];
  throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta: meta22 }, options) => {
  let value = 0, keys = [];
  if (typeof data === "number") {
    value = data;
    for (const key in bits) if (data & bits[key]) keys.push(key);
  } else if (Array.isArray(data)) {
    keys = data;
    for (const key of keys) {
      if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
      if (key in bits) value |= bits[key];
    }
  } else throw new ValidationError(`expected number or array but got ${data}`, options);
  if (value === meta22.default) return [value];
  return [value, keys];
});
Schema.extend("function", (data, _, options) => {
  if (typeof data === "function") return [data];
  throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
  if (typeof constructor === "function") {
    if (data instanceof constructor) return [data];
    throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
  } else {
    if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
    let prototype = Object.getPrototypeOf(data);
    while (prototype) {
      if (prototype.constructor?.name === constructor) return [data];
      prototype = Object.getPrototypeOf(prototype);
    }
    throw new ValidationError(`expected ${constructor} but got ${data}`, options);
  }
});
function property(data, key, schema, options) {
  try {
    const [value, adapted] = Schema.resolve(data[key], schema, {
      ...options,
      path: [...options.path || [], key]
    });
    if (adapted !== void 0) data[key] = adapted;
    return value;
  } catch (e) {
    if (!options?.autofix) throw e;
    delete data[key];
    return schema.meta.default;
  }
}
Schema.extend("array", (data, { inner, meta: meta22 }, options) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  checkWithinRange(data.length, meta22, "array length", options, !isNullable(inner.meta.default));
  return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in data) {
    let rKey;
    try {
      rKey = Schema.resolve(key, sKey, options)[0];
    } catch (error) {
      if (strict) continue;
      throw error;
    }
    result[rKey] = property(data, key, inner, options);
    data[rKey] = data[key];
    if (key !== rKey) delete data[key];
  }
  return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  const result = list.map((inner, index) => property(data, index, inner, options));
  if (strict) return [result];
  result.push(...data.slice(list.length));
  return [result];
});
function merge(result, data) {
  for (const key in data) {
    if (key in result) continue;
    result[key] = data[key];
  }
}
Schema.extend("object", (data, { dict }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in dict) {
    const value = property(data, key, dict[key], options);
    if (!isNullable(value) || key in data) result[key] = value;
  }
  if (!strict) merge(result, data);
  return [result];
});
Schema.extend("union", (data, { list, toString: toString2 }, options, strict) => {
  for (const inner of list) try {
    return Schema.resolve(data, inner, options, strict);
  } catch (error) {
  }
  throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString: toString2 }, options, strict) => {
  if (!list.length) return [data];
  let result;
  for (const inner of list) {
    const value = Schema.resolve(data, inner, options, true)[0];
    if (isNullable(value)) continue;
    if (isNullable(result)) result = value;
    else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
    else if (typeof value === "object") merge(result ??= {}, value);
    else if (result !== value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
  }
  if (!strict && isPlainObject(data)) merge(result, data);
  return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
  const [result, adapted = data] = Schema.resolve(data, inner, options, true);
  if (preserve) return [callback(result)];
  else return [callback(result), callback(adapted)];
});
var formatters = {};
function defineMethod(name2, keys, format) {
  formatters[name2] = format;
  Object.assign(Schema, { [name2](...args) {
    const schema = new Schema({ type: name2 });
    keys.forEach((key, index) => {
      switch (key) {
        case "sKey":
          schema.sKey = args[index] ?? Schema.string();
          break;
        case "inner":
          schema.inner = Schema.from(args[index]);
          break;
        case "list":
          schema.list = args[index].map(Schema.from);
          break;
        case "dict":
          schema.dict = mapValues(args[index], Schema.from);
          break;
        case "bits":
          schema.bits = {};
          for (const key2 in args[index]) {
            if (typeof args[index][key2] !== "number") continue;
            schema.bits[key2] = args[index][key2];
          }
          break;
        case "callback": {
          const callback = schema.callback = args[index];
          callback["toJSON"] ||= () => callback.toString();
          break;
        }
        case "constructor": {
          const constructor = schema.constructor = args[index];
          if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
          break;
        }
        default:
          schema[key] = args[index];
      }
    });
    if (name2 === "object" || name2 === "dict") schema.meta.default = {};
    else if (name2 === "array" || name2 === "tuple") schema.meta.default = [];
    else if (name2 === "bitset") schema.meta.default = 0;
    return schema;
  } });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
  if (typeof constructor === "function") return constructor.name;
  else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
  if (Object.keys(dict).length === 0) return "{}";
  return `{ ${Object.entries(dict).map(([key, inner]) => {
    return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
  }).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
  const result = list.map(({ toString: format }) => format()).join(" | ");
  return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
  return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
  "inner",
  "callback",
  "preserve"
], ({ inner }, isInner) => inner.toString(isInner));

// src/host/themes/opencode.ts
var opencode_exports = {};
__export(opencode_exports, {
  dark: () => dark,
  light: () => light,
  meta: () => meta
});

// src/host/themes/shared.ts
var MONO = '"Berkeley Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
var SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';
var INTER = '"Inter Variable", "Inter", "SF Pro Display", -apple-system, system-ui, "Segoe UI", Roboto, sans-serif';
var NOTION = '"NotionInter", "Inter", -apple-system, system-ui, Helvetica, Arial, sans-serif';
var CLAUDE_SANS = '"Anthropic Sans", "Arial", system-ui, -apple-system, sans-serif';
var TEXT_STYLE_KEYS = [
  "base-16",
  "base-strong-16",
  "l-20",
  "m-18",
  "s-14",
  "s-strong-14",
  "xl-24",
  "xs-13",
  "xs-strong-13",
  "xxs-12",
  "xxs-strong-12",
  "xxxs-11",
  "xxxs-strong-11"
];
var MD_STYLE_KEYS = [
  "base",
  "base-italic",
  "base-strong",
  "base-strong-italic",
  "small",
  "small-italic",
  "small-strong",
  "small-strong-italic",
  "code",
  "code-block",
  "code-block-small",
  "h1",
  "h2",
  "h3",
  "h4",
  "table",
  "table-head"
];
function fillFontTokens(tokens, font, mono) {
  const monoStack = typeof mono === "string" ? mono : MONO;
  const ui = mono === true ? MONO : font;
  for (const s of TEXT_STYLE_KEYS) tokens[`--dsw-font-${s}-font-family`] = ui;
  for (const m of MD_STYLE_KEYS) {
    const isCode = m === "code" || m === "code-block" || m === "code-block-small";
    tokens[`--dsw-font-markdown-${m}-font-family`] = isCode ? monoStack : ui;
  }
  return tokens;
}
var FLAT_SHADOWS = {
  "--dsw-shadow-lv1": "none",
  "--dsw-shadow-lv2": "none",
  "--dsw-shadow-lv3": "none",
  "--dsw-shadow-lv1-blur": "0px"
};

// src/host/themes/opencode.ts
var dark = fillFontTokens(
  {
    /* ── 背景：暖黑 → 暖灰三级抬升 ── */
    "--dsw-alias-bg-base": "#201d1d",
    "--dsw-alias-bg-layer-1": "#302c2c",
    "--dsw-alias-bg-layer-2": "#3a3535",
    "--dsw-alias-bg-layer-3": "#423d3d",
    "--dsw-alias-bg-overlay": "#302c2c",
    "--dsw-alias-bg-multi-select": "#302c2c",
    "--dsw-alias-bg-module-platform": "#302c2c",
    "--dsw-alias-bg-skeleton": "#302c2c",
    /* ── 边框：暖灰边框（#464343 可见 / #646262 强调）── */
    "--dsw-alias-border-l1": "#464343",
    "--dsw-alias-border-l2": "#646262",
    "--dsw-alias-border-l2-darkmode-thin": "#464343",
    "--dsw-alias-border-l3": "#6e6e73",
    "--dsw-alias-border-l4": "#9a9898",
    "--dsw-alias-border-inverted": "#fdfcfc",
    "--dsw-alias-border-inverted2": "#c8c6c4",
    "--dsw-alias-separator-primary": "#464343",
    "--dsw-alias-fill-l2": "#3a3535",
    "--dsw-alias-fill-tsp-secondary": "rgba(253, 252, 252, 0.06)",
    /* ── 品牌：Apple 系统蓝三段式（#007aff → #0056b3 hover）── */
    "--dsw-alias-brand-primary": "#007aff",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#007aff",
    "--dsw-alias-link": "#007aff",
    /* ── 按钮：主按钮蓝填充，其余暖灰层次 ── */
    "--dsw-alias-button-primary-fill": "#007aff",
    "--dsw-alias-button-primary-hover": "#0056b3",
    "--dsw-alias-button-primary-dimmed": "#0056b3",
    "--dsw-alias-button-contrast-fill": "#fdfcfc",
    "--dsw-alias-button-elevated-fill": "#302c2c",
    "--dsw-alias-button-floating-fill": "#302c2c",
    "--dsw-alias-button-floating-hover": "#3a3535",
    "--dsw-alias-button-ghost-active-border": "#646262",
    "--dsw-alias-button-ghost-active-fill": "#3a3535",
    "--dsw-alias-button-ghost-active-hover": "#423d3d",
    "--dsw-alias-button-info-fill": "#007aff",
    "--dsw-alias-button-info-hover": "#0056b3",
    "--dsw-alias-button-tool-bar-fill": "#302c2c",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#3a3535",
    /* ── 交互态：暖灰悬停/按压 + 语义色半透明 ── */
    "--dsw-alias-interactive-bg-hover": "#2a2626",
    "--dsw-alias-interactive-bg-active": "#3a3535",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(0, 122, 255, 0.12)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(255, 59, 48, 0.12)",
    "--dsw-alias-interactive-bg-hover-solid": "#3a3535",
    /* ── 文字：暖白主文字 → 暖灰四级衰减 ── */
    "--dsw-alias-label-primary": "#fdfcfc",
    "--dsw-alias-label-secondary": "#c8c6c4",
    "--dsw-alias-label-tertiary": "#9a9898",
    "--dsw-alias-label-quaternary": "#6e6e73",
    "--dsw-alias-label-caption": "#9a9898",
    "--dsw-alias-label-dimmed": "#6e6e73",
    "--dsw-alias-label-error": "#ff3b30",
    "--dsw-alias-label-primary-foreground": "#fdfcfc",
    "--dsw-alias-label-primary-inverted": "#201d1d",
    "--dsw-alias-label-primary-bluish": "#007aff",
    "--dsw-alias-state-business-primary": "#007aff",
    "--dsw-alias-state-business-tertiary": "rgba(0, 122, 255, 0.12)",
    /* ── 语义：Apple HIG 四色 + 半透明次级 ── */
    "--dsw-alias-state-error-primary": "#ff3b30",
    "--dsw-alias-state-error-secondary": "rgba(255, 59, 48, 0.12)",
    "--dsw-alias-state-success-primary": "#30d158",
    "--dsw-alias-state-success-secondary": "rgba(48, 209, 88, 0.12)",
    "--dsw-alias-state-warn-primary": "#ff9f0a",
    "--dsw-alias-state-warn-secondary": "rgba(255, 159, 10, 0.12)",
    "--dsw-alias-state-warn-label": "#ff9f0a",
    /* ── Markdown：代码块暖灰底 + 行内代码淡绿底（opencode 标志）── */
    "--dsw-alias-markdown-citation": "#007aff",
    "--dsw-alias-markdown-code-block": "#302c2c",
    "--dsw-alias-markdown-code-block-banner": "#3a3535",
    "--dsw-alias-markdown-inline-code": "rgba(48, 209, 88, 0.08)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(0, 122, 255, 0.15)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#6e6e73",
    /* ── 滚动条 ── */
    "--dsw-alias-scrollbar-bg-l1": "#464343",
    "--dsw-alias-scrollbar-bg-l2": "#3a3535",
    "--dsw-alias-scrollbar-hover-l1": "#646262",
    "--dsw-alias-scrollbar-hover-l2": "#423d3d",
    /* ── 浮层与特定区域 ── */
    "--dsw-alias-toast-bg": "#302c2c",
    "--dsw-alias-tooltip-bg": "#302c2c",
    "--dsw-hovercard-bg": "#302c2c",
    "--dsw-specific-sidebar-fill": "#201d1d",
    "--dsw-specific-sidebar-nav-item-active": "rgba(0, 122, 255, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#007aff",
    "--dsw-specific-sidebar-nav-item-hover": "#2a2626",
    "--dsw-specific-bubble": "#302c2c",
    "--dsw-specific-bubble-highlight": "#3a3535",
    "--dsw-specific-input-major": "#302c2c",
    "--dsw-specific-login-input": "#302c2c",
    "--dsw-specific-menu": "#302c2c",
    "--dsw-specific-selector": "#302c2c",
    "--dsw-specific-tip": "#302c2c",
    /* ── 字体 + 扁平阴影 ── */
    "--dsw-font-family": MONO,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  MONO,
  true
);
var light = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#fdfcfc",
    "--dsw-alias-bg-layer-1": "#f1eeee",
    "--dsw-alias-bg-layer-2": "#e9e2e2",
    "--dsw-alias-bg-layer-3": "#e2dcdc",
    "--dsw-alias-bg-overlay": "#ffffff",
    "--dsw-alias-bg-multi-select": "#f1eeee",
    "--dsw-alias-bg-module-platform": "#f1eeee",
    "--dsw-alias-bg-skeleton": "#f1eeee",
    "--dsw-alias-border-l1": "#e2dcdc",
    "--dsw-alias-border-l2": "#9a9898",
    "--dsw-alias-border-l2-darkmode-thin": "#e2dcdc",
    "--dsw-alias-border-l3": "#b5aeae",
    "--dsw-alias-border-l4": "#9a9898",
    "--dsw-alias-border-inverted": "#201d1d",
    "--dsw-alias-border-inverted2": "#424245",
    "--dsw-alias-separator-primary": "#d6cfcf",
    "--dsw-alias-fill-l2": "#e9e2e2",
    "--dsw-alias-fill-tsp-secondary": "rgba(32, 29, 29, 0.05)",
    "--dsw-alias-brand-primary": "#007aff",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#007aff",
    "--dsw-alias-link": "#007aff",
    /* 浅色主按钮还原 opencode 原版"暗底白字"（#201d1d 填充） */
    "--dsw-alias-button-primary-fill": "#201d1d",
    "--dsw-alias-button-primary-hover": "#3d3a3a",
    "--dsw-alias-button-primary-dimmed": "#424245",
    "--dsw-alias-button-contrast-fill": "#201d1d",
    "--dsw-alias-button-elevated-fill": "#ffffff",
    "--dsw-alias-button-floating-fill": "#ffffff",
    "--dsw-alias-button-floating-hover": "#f1eeee",
    "--dsw-alias-button-ghost-active-border": "#9a9898",
    "--dsw-alias-button-ghost-active-fill": "#e9e2e2",
    "--dsw-alias-button-ghost-active-hover": "#d6cfcf",
    "--dsw-alias-button-info-fill": "#007aff",
    "--dsw-alias-button-info-hover": "#0056b3",
    "--dsw-alias-button-tool-bar-fill": "#f1eeee",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#e9e2e2",
    "--dsw-alias-interactive-bg-hover": "#f1eeee",
    "--dsw-alias-interactive-bg-active": "#e9e2e2",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(0, 122, 255, 0.10)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(255, 59, 48, 0.10)",
    "--dsw-alias-interactive-bg-hover-solid": "#e2dcdc",
    "--dsw-alias-label-primary": "#201d1d",
    "--dsw-alias-label-secondary": "#424245",
    "--dsw-alias-label-tertiary": "#6e6e73",
    "--dsw-alias-label-quaternary": "#9a9898",
    "--dsw-alias-label-caption": "#6e6e73",
    "--dsw-alias-label-dimmed": "#9a9898",
    "--dsw-alias-label-error": "#d70015",
    "--dsw-alias-label-primary-foreground": "#fdfcfc",
    "--dsw-alias-label-primary-inverted": "#fdfcfc",
    "--dsw-alias-label-primary-bluish": "#007aff",
    "--dsw-alias-state-business-primary": "#007aff",
    "--dsw-alias-state-business-tertiary": "rgba(0, 122, 255, 0.10)",
    /* 浅色下语义色降饱和（Apple HIG 的浅色变体） */
    "--dsw-alias-state-error-primary": "#d70015",
    "--dsw-alias-state-error-secondary": "rgba(255, 59, 48, 0.10)",
    "--dsw-alias-state-success-primary": "#178a33",
    "--dsw-alias-state-success-secondary": "rgba(48, 209, 88, 0.10)",
    "--dsw-alias-state-warn-primary": "#b26a00",
    "--dsw-alias-state-warn-secondary": "rgba(255, 159, 10, 0.10)",
    "--dsw-alias-state-warn-label": "#b26a00",
    "--dsw-alias-markdown-citation": "#007aff",
    "--dsw-alias-markdown-code-block": "#f6f3f3",
    "--dsw-alias-markdown-code-block-banner": "#eae4e4",
    "--dsw-alias-markdown-inline-code": "rgba(48, 209, 88, 0.10)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(0, 122, 255, 0.12)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#9a9898",
    "--dsw-alias-scrollbar-bg-l1": "#d6cfcf",
    "--dsw-alias-scrollbar-bg-l2": "#e2dcdc",
    "--dsw-alias-scrollbar-hover-l1": "#9a9898",
    "--dsw-alias-scrollbar-hover-l2": "#d6cfcf",
    "--dsw-alias-toast-bg": "#ffffff",
    "--dsw-alias-tooltip-bg": "#ffffff",
    "--dsw-hovercard-bg": "#ffffff",
    "--dsw-specific-sidebar-fill": "#f1eeee",
    "--dsw-specific-sidebar-nav-item-active": "rgba(0, 122, 255, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#007aff",
    "--dsw-specific-sidebar-nav-item-hover": "#e9e2e2",
    "--dsw-specific-bubble": "#f1eeee",
    "--dsw-specific-bubble-highlight": "#e9e2e2",
    "--dsw-specific-input-major": "#f8f7f7",
    "--dsw-specific-login-input": "#f8f7f7",
    "--dsw-specific-menu": "#ffffff",
    "--dsw-specific-selector": "#ffffff",
    "--dsw-specific-tip": "#f1eeee",
    "--dsw-font-family": MONO,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  MONO,
  true
);
var meta = {
  dark: {
    id: "opencode-terminal-dark",
    label: "OpenCode \u66B1\u591C\u7EC8\u7AEF",
    desc: "\u6696\u9ED1 #201d1d + Apple \u84DD\uFF0C\u5168\u7AD9 mono",
    swatch: ["#201d1d", "#302c2c", "#007aff", "#30d158"]
  },
  light: {
    id: "opencode-terminal-light",
    label: "OpenCode \u7EB8\u611F\u7EC8\u7AEF",
    desc: "\u6696\u767D #fdfcfc + \u6696\u7070\u5C42\u6B21",
    swatch: ["#fdfcfc", "#f1eeee", "#201d1d", "#007aff"]
  }
};

// src/host/themes/linear.ts
var linear_exports = {};
__export(linear_exports, {
  dark: () => dark2,
  meta: () => meta2
});
var dark2 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#08090a",
    "--dsw-alias-bg-layer-1": "#191a1b",
    "--dsw-alias-bg-layer-2": "#1f2022",
    "--dsw-alias-bg-layer-3": "#252629",
    "--dsw-alias-bg-overlay": "#191a1b",
    "--dsw-alias-bg-multi-select": "#191a1b",
    "--dsw-alias-bg-module-platform": "#191a1b",
    "--dsw-alias-bg-skeleton": "#191a1b",
    /* 半透明白边框 —— Linear 的深度全靠这层 */
    "--dsw-alias-border-l1": "rgba(255, 255, 255, 0.08)",
    "--dsw-alias-border-l2": "rgba(255, 255, 255, 0.14)",
    "--dsw-alias-border-l2-darkmode-thin": "rgba(255, 255, 255, 0.08)",
    "--dsw-alias-border-l3": "rgba(255, 255, 255, 0.22)",
    "--dsw-alias-border-l4": "rgba(255, 255, 255, 0.35)",
    "--dsw-alias-border-inverted": "#f7f8f8",
    "--dsw-alias-border-inverted2": "#d0d6e0",
    "--dsw-alias-separator-primary": "rgba(255, 255, 255, 0.08)",
    "--dsw-alias-fill-l2": "#1f2022",
    "--dsw-alias-fill-tsp-secondary": "rgba(247, 248, 248, 0.05)",
    /* Indigo：#5e6ad2 → hover #828fff（更亮的饱和悬停） */
    "--dsw-alias-brand-primary": "#5e6ad2",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#828fff",
    "--dsw-alias-link": "#828fff",
    "--dsw-alias-button-primary-fill": "#5e6ad2",
    "--dsw-alias-button-primary-hover": "#828fff",
    "--dsw-alias-button-primary-dimmed": "#4752c4",
    "--dsw-alias-button-contrast-fill": "#f7f8f8",
    "--dsw-alias-button-elevated-fill": "#191a1b",
    "--dsw-alias-button-floating-fill": "#191a1b",
    "--dsw-alias-button-floating-hover": "#1f2022",
    "--dsw-alias-button-ghost-active-border": "rgba(255, 255, 255, 0.14)",
    "--dsw-alias-button-ghost-active-fill": "#1f2022",
    "--dsw-alias-button-ghost-active-hover": "#252629",
    "--dsw-alias-button-info-fill": "#5e6ad2",
    "--dsw-alias-button-info-hover": "#828fff",
    "--dsw-alias-button-tool-bar-fill": "#191a1b",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#1f2022",
    /* 交互态全走半透明白，不引入新色相 */
    "--dsw-alias-interactive-bg-hover": "rgba(255, 255, 255, 0.06)",
    "--dsw-alias-interactive-bg-active": "rgba(255, 255, 255, 0.10)",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(94, 106, 210, 0.25)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(220, 38, 38, 0.20)",
    "--dsw-alias-interactive-bg-hover-solid": "#1f2022",
    "--dsw-alias-label-primary": "#f7f8f8",
    "--dsw-alias-label-secondary": "#d0d6e0",
    "--dsw-alias-label-tertiary": "#8f959f",
    "--dsw-alias-label-quaternary": "#6a707a",
    "--dsw-alias-label-caption": "#8f959f",
    "--dsw-alias-label-dimmed": "#6a707a",
    "--dsw-alias-label-error": "#dc2626",
    "--dsw-alias-label-primary-foreground": "#f7f8f8",
    "--dsw-alias-label-primary-inverted": "#08090a",
    "--dsw-alias-label-primary-bluish": "#828fff",
    "--dsw-alias-state-business-primary": "#828fff",
    "--dsw-alias-state-business-tertiary": "rgba(94, 106, 210, 0.25)",
    "--dsw-alias-state-error-primary": "#dc2626",
    "--dsw-alias-state-error-secondary": "rgba(220, 38, 38, 0.15)",
    "--dsw-alias-state-success-primary": "#27a644",
    "--dsw-alias-state-success-secondary": "rgba(39, 166, 68, 0.15)",
    "--dsw-alias-state-warn-primary": "#eab308",
    "--dsw-alias-state-warn-secondary": "rgba(234, 179, 8, 0.15)",
    "--dsw-alias-state-warn-label": "#eab308",
    "--dsw-alias-markdown-citation": "#828fff",
    "--dsw-alias-markdown-code-block": "#191a1b",
    "--dsw-alias-markdown-code-block-banner": "#1f2022",
    "--dsw-alias-markdown-inline-code": "rgba(130, 143, 255, 0.12)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(94, 106, 210, 0.25)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#6a707a",
    "--dsw-alias-scrollbar-bg-l1": "rgba(255, 255, 255, 0.10)",
    "--dsw-alias-scrollbar-bg-l2": "rgba(255, 255, 255, 0.06)",
    "--dsw-alias-scrollbar-hover-l1": "rgba(255, 255, 255, 0.20)",
    "--dsw-alias-scrollbar-hover-l2": "rgba(255, 255, 255, 0.12)",
    "--dsw-alias-toast-bg": "#191a1b",
    "--dsw-alias-tooltip-bg": "#252629",
    "--dsw-hovercard-bg": "#1f2022",
    "--dsw-specific-sidebar-fill": "#08090a",
    "--dsw-specific-sidebar-nav-item-active": "rgba(94, 106, 210, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#5e6ad2",
    "--dsw-specific-sidebar-nav-item-hover": "rgba(255, 255, 255, 0.06)",
    "--dsw-specific-bubble": "#191a1b",
    "--dsw-specific-bubble-highlight": "#1f2022",
    "--dsw-specific-input-major": "#191a1b",
    "--dsw-specific-login-input": "#191a1b",
    "--dsw-specific-menu": "#1f2022",
    "--dsw-specific-selector": "#1f2022",
    "--dsw-specific-tip": "#252629",
    "--dsw-font-family": INTER,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  INTER
);
var meta2 = {
  dark: {
    id: "linear-dark",
    label: "Linear \u6697\u591C\u65E0\u5F69",
    desc: "\u8FD1\u9ED1 #08090a + Indigo #5e6ad2",
    swatch: ["#08090a", "#191a1b", "#5e6ad2", "#f7f8f8"]
  }
};

// src/host/themes/notion.ts
var notion_exports = {};
__export(notion_exports, {
  light: () => light2,
  meta: () => meta3
});
var light2 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#ffffff",
    "--dsw-alias-bg-layer-1": "#f6f5f4",
    "--dsw-alias-bg-layer-2": "#efefee",
    "--dsw-alias-bg-layer-3": "#e8e7e5",
    "--dsw-alias-bg-overlay": "#ffffff",
    "--dsw-alias-bg-multi-select": "#f6f5f4",
    "--dsw-alias-bg-module-platform": "#f6f5f4",
    "--dsw-alias-bg-skeleton": "#f6f5f4",
    /* whisper 边框：半透明黑 */
    "--dsw-alias-border-l1": "rgba(0, 0, 0, 0.1)",
    "--dsw-alias-border-l2": "rgba(0, 0, 0, 0.16)",
    "--dsw-alias-border-l2-darkmode-thin": "rgba(0, 0, 0, 0.1)",
    "--dsw-alias-border-l3": "rgba(0, 0, 0, 0.24)",
    "--dsw-alias-border-l4": "rgba(0, 0, 0, 0.32)",
    "--dsw-alias-border-inverted": "#31302e",
    "--dsw-alias-border-inverted2": "#615d59",
    "--dsw-alias-separator-primary": "rgba(0, 0, 0, 0.06)",
    "--dsw-alias-fill-l2": "#efefee",
    "--dsw-alias-fill-tsp-secondary": "rgba(0, 0, 0, 0.04)",
    "--dsw-alias-brand-primary": "#0075de",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#0075de",
    "--dsw-alias-link": "#0075de",
    "--dsw-alias-button-primary-fill": "#0075de",
    "--dsw-alias-button-primary-hover": "#005bab",
    "--dsw-alias-button-primary-dimmed": "#005bab",
    "--dsw-alias-button-contrast-fill": "#31302e",
    "--dsw-alias-button-elevated-fill": "#ffffff",
    "--dsw-alias-button-floating-fill": "#ffffff",
    "--dsw-alias-button-floating-hover": "#f6f5f4",
    "--dsw-alias-button-ghost-active-border": "rgba(0, 0, 0, 0.16)",
    "--dsw-alias-button-ghost-active-fill": "#efefee",
    "--dsw-alias-button-ghost-active-hover": "#e8e7e5",
    "--dsw-alias-button-info-fill": "#0075de",
    "--dsw-alias-button-info-hover": "#005bab",
    "--dsw-alias-button-tool-bar-fill": "#f6f5f4",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#efefee",
    "--dsw-alias-interactive-bg-hover": "#f6f5f4",
    "--dsw-alias-interactive-bg-active": "#efefee",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(0, 117, 222, 0.10)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(220, 38, 38, 0.08)",
    "--dsw-alias-interactive-bg-hover-solid": "#efefee",
    "--dsw-alias-label-primary": "rgba(0, 0, 0, 0.95)",
    "--dsw-alias-label-secondary": "#31302e",
    "--dsw-alias-label-tertiary": "#615d59",
    "--dsw-alias-label-quaternary": "#a39e98",
    "--dsw-alias-label-caption": "#615d59",
    "--dsw-alias-label-dimmed": "#a39e98",
    "--dsw-alias-label-error": "#dc2626",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#ffffff",
    "--dsw-alias-label-primary-bluish": "#0075de",
    "--dsw-alias-state-business-primary": "#0075de",
    "--dsw-alias-state-business-tertiary": "rgba(0, 117, 222, 0.10)",
    "--dsw-alias-state-error-primary": "#dc2626",
    "--dsw-alias-state-error-secondary": "rgba(220, 38, 38, 0.08)",
    "--dsw-alias-state-success-primary": "#1aae39",
    "--dsw-alias-state-success-secondary": "rgba(26, 174, 57, 0.10)",
    "--dsw-alias-state-warn-primary": "#dd5b00",
    "--dsw-alias-state-warn-secondary": "rgba(221, 91, 0, 0.10)",
    "--dsw-alias-state-warn-label": "#dd5b00",
    "--dsw-alias-markdown-citation": "#0075de",
    "--dsw-alias-markdown-code-block": "#f6f5f4",
    "--dsw-alias-markdown-code-block-banner": "#efefee",
    "--dsw-alias-markdown-inline-code": "rgba(0, 0, 0, 0.06)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(0, 117, 222, 0.12)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#a39e98",
    "--dsw-alias-scrollbar-bg-l1": "rgba(0, 0, 0, 0.14)",
    "--dsw-alias-scrollbar-bg-l2": "rgba(0, 0, 0, 0.08)",
    "--dsw-alias-scrollbar-hover-l1": "rgba(0, 0, 0, 0.26)",
    "--dsw-alias-scrollbar-hover-l2": "rgba(0, 0, 0, 0.16)",
    "--dsw-alias-toast-bg": "#ffffff",
    "--dsw-alias-tooltip-bg": "#31302e",
    "--dsw-hovercard-bg": "#ffffff",
    "--dsw-specific-sidebar-fill": "#f6f5f4",
    "--dsw-specific-sidebar-nav-item-active": "rgba(0, 117, 222, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#0075de",
    "--dsw-specific-sidebar-nav-item-hover": "#efefee",
    "--dsw-specific-bubble": "#f6f5f4",
    "--dsw-specific-bubble-highlight": "#efefee",
    "--dsw-specific-input-major": "#f6f5f4",
    "--dsw-specific-login-input": "#f6f5f4",
    "--dsw-specific-menu": "#ffffff",
    "--dsw-specific-selector": "#ffffff",
    "--dsw-specific-tip": "#31302e",
    /* 多层微阴影 —— Notion "felt-not-seen" 深度 */
    "--dsw-shadow-lv1": "0 1px 2px rgba(0, 0, 0, 0.04)",
    "--dsw-shadow-lv2": "0 2px 6px rgba(0, 0, 0, 0.04)",
    "--dsw-shadow-lv3": "0 4px 12px rgba(0, 0, 0, 0.05)",
    "--dsw-shadow-lv1-blur": "2px",
    "--dsw-font-family": NOTION,
    "--dsw-font-mono": MONO
  },
  NOTION
);
var meta3 = {
  light: {
    id: "notion-light",
    label: "Notion \u6696\u767D\u6781\u7B80",
    desc: "\u7EAF\u767D + \u6696\u7070 + Notion \u84DD",
    swatch: ["#ffffff", "#f6f5f4", "#31302e", "#0075de"]
  }
};

// src/host/themes/claude.ts
var claude_exports = {};
__export(claude_exports, {
  light: () => light3,
  meta: () => meta4
});
var light3 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#f5f4ed",
    "--dsw-alias-bg-layer-1": "#faf9f5",
    "--dsw-alias-bg-layer-2": "#f0eee6",
    "--dsw-alias-bg-layer-3": "#e8e6dc",
    "--dsw-alias-bg-overlay": "#faf9f5",
    "--dsw-alias-bg-multi-select": "#faf9f5",
    "--dsw-alias-bg-module-platform": "#faf9f5",
    "--dsw-alias-bg-skeleton": "#f0eee6",
    /* 奶油色调边框 —— 最温柔的围合 */
    "--dsw-alias-border-l1": "#f0eee6",
    "--dsw-alias-border-l2": "#e8e6dc",
    "--dsw-alias-border-l2-darkmode-thin": "#f0eee6",
    "--dsw-alias-border-l3": "#dcd9ce",
    "--dsw-alias-border-l4": "#c9c5b8",
    "--dsw-alias-border-inverted": "#141413",
    "--dsw-alias-border-inverted2": "#3d3d3a",
    "--dsw-alias-separator-primary": "#f0eee6",
    "--dsw-alias-fill-l2": "#f0eee6",
    "--dsw-alias-fill-tsp-secondary": "rgba(20, 20, 19, 0.04)",
    /* 赤陶品牌色 */
    "--dsw-alias-brand-primary": "#c96442",
    "--dsw-alias-brand-primary-invert": "#faf9f5",
    "--dsw-alias-brand-text": "#c96442",
    "--dsw-alias-link": "#c96442",
    "--dsw-alias-button-primary-fill": "#c96442",
    "--dsw-alias-button-primary-hover": "#b5573a",
    "--dsw-alias-button-primary-dimmed": "#b5573a",
    "--dsw-alias-button-contrast-fill": "#141413",
    "--dsw-alias-button-elevated-fill": "#faf9f5",
    "--dsw-alias-button-floating-fill": "#faf9f5",
    "--dsw-alias-button-floating-hover": "#f0eee6",
    "--dsw-alias-button-ghost-active-border": "#dcd9ce",
    "--dsw-alias-button-ghost-active-fill": "#e8e6dc",
    "--dsw-alias-button-ghost-active-hover": "#dcd9ce",
    "--dsw-alias-button-info-fill": "#c96442",
    "--dsw-alias-button-info-hover": "#b5573a",
    "--dsw-alias-button-tool-bar-fill": "#faf9f5",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#f0eee6",
    "--dsw-alias-interactive-bg-hover": "#f0eee6",
    "--dsw-alias-interactive-bg-active": "#e8e6dc",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(201, 100, 66, 0.10)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(181, 51, 51, 0.08)",
    "--dsw-alias-interactive-bg-hover-solid": "#e8e6dc",
    /* 每一档灰都带黄褐底 —— Claude 的"最暖科技灰" */
    "--dsw-alias-label-primary": "#141413",
    "--dsw-alias-label-secondary": "#3d3d3a",
    "--dsw-alias-label-tertiary": "#5e5d59",
    "--dsw-alias-label-quaternary": "#87867f",
    "--dsw-alias-label-caption": "#5e5d59",
    "--dsw-alias-label-dimmed": "#87867f",
    "--dsw-alias-label-error": "#b53333",
    "--dsw-alias-label-primary-foreground": "#faf9f5",
    "--dsw-alias-label-primary-inverted": "#faf9f5",
    "--dsw-alias-label-primary-bluish": "#c96442",
    "--dsw-alias-state-business-primary": "#c96442",
    "--dsw-alias-state-business-tertiary": "rgba(201, 100, 66, 0.10)",
    "--dsw-alias-state-error-primary": "#b53333",
    "--dsw-alias-state-error-secondary": "rgba(181, 51, 51, 0.08)",
    "--dsw-alias-state-success-primary": "#17a34a",
    "--dsw-alias-state-success-secondary": "rgba(23, 163, 74, 0.10)",
    "--dsw-alias-state-warn-primary": "#eab308",
    "--dsw-alias-state-warn-secondary": "rgba(234, 179, 8, 0.10)",
    "--dsw-alias-state-warn-label": "#b8860b",
    "--dsw-alias-markdown-citation": "#c96442",
    "--dsw-alias-markdown-code-block": "#f0eee6",
    "--dsw-alias-markdown-code-block-banner": "#e8e6dc",
    "--dsw-alias-markdown-inline-code": "rgba(201, 100, 66, 0.08)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(201, 100, 66, 0.12)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#87867f",
    "--dsw-alias-scrollbar-bg-l1": "#dcd9ce",
    "--dsw-alias-scrollbar-bg-l2": "#e8e6dc",
    "--dsw-alias-scrollbar-hover-l1": "#c9c5b8",
    "--dsw-alias-scrollbar-hover-l2": "#dcd9ce",
    "--dsw-alias-toast-bg": "#faf9f5",
    "--dsw-alias-tooltip-bg": "#31302e",
    "--dsw-hovercard-bg": "#faf9f5",
    "--dsw-specific-sidebar-fill": "#f0eee6",
    "--dsw-specific-sidebar-nav-item-active": "rgba(201, 100, 66, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#c96442",
    "--dsw-specific-sidebar-nav-item-hover": "#f0eee6",
    "--dsw-specific-bubble": "#faf9f5",
    "--dsw-specific-bubble-highlight": "#f0eee6",
    "--dsw-specific-input-major": "#faf9f5",
    "--dsw-specific-login-input": "#faf9f5",
    "--dsw-specific-menu": "#faf9f5",
    "--dsw-specific-selector": "#faf9f5",
    "--dsw-specific-tip": "#31302e",
    /* ring 型深度 —— 0 0 0 1px 的围合而非投影 */
    "--dsw-shadow-lv1": "0 0 0 1px #e8e6dc",
    "--dsw-shadow-lv2": "0 0 0 1px #dcd9ce",
    "--dsw-shadow-lv3": "0 0 0 1px #c9c5b8",
    "--dsw-shadow-lv1-blur": "0px",
    "--dsw-font-family": CLAUDE_SANS,
    "--dsw-font-mono": MONO
  },
  CLAUDE_SANS
);
var meta4 = {
  light: {
    id: "claude-parchment-light",
    label: "Claude \u7F8A\u76AE\u7EB8",
    desc: "\u7F8A\u76AE\u7EB8 #f5f4ed + \u8D64\u9676 #c96442",
    swatch: ["#f5f4ed", "#faf9f5", "#c96442", "#141413"]
  }
};

// src/host/themes/nvidia.ts
var nvidia_exports = {};
__export(nvidia_exports, {
  dark: () => dark3,
  meta: () => meta5
});
var dark3 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#000000",
    "--dsw-alias-bg-layer-1": "#1a1a1a",
    "--dsw-alias-bg-layer-2": "#222222",
    "--dsw-alias-bg-layer-3": "#2a2a2a",
    "--dsw-alias-bg-overlay": "#1a1a1a",
    "--dsw-alias-bg-multi-select": "#1a1a1a",
    "--dsw-alias-bg-module-platform": "#1a1a1a",
    "--dsw-alias-bg-skeleton": "#1a1a1a",
    "--dsw-alias-border-l1": "#2a2a2a",
    "--dsw-alias-border-l2": "#5e5e5e",
    "--dsw-alias-border-l2-darkmode-thin": "#2a2a2a",
    "--dsw-alias-border-l3": "#7a7a7a",
    "--dsw-alias-border-l4": "#9a9a9a",
    "--dsw-alias-border-inverted": "#ffffff",
    "--dsw-alias-border-inverted2": "#a7a7a7",
    "--dsw-alias-separator-primary": "#2a2a2a",
    "--dsw-alias-fill-l2": "#222222",
    "--dsw-alias-fill-tsp-secondary": "rgba(255, 255, 255, 0.05)",
    /* NVIDIA 绿：品牌指纹 */
    "--dsw-alias-brand-primary": "#76b900",
    "--dsw-alias-brand-primary-invert": "#000000",
    "--dsw-alias-brand-text": "#76b900",
    "--dsw-alias-link": "#76b900",
    /* 主按钮绿填充；悬停走"绿→青"的品牌惊喜 */
    "--dsw-alias-button-primary-fill": "#76b900",
    "--dsw-alias-button-primary-hover": "#1eaedb",
    "--dsw-alias-button-primary-dimmed": "#3f8500",
    "--dsw-alias-button-contrast-fill": "#ffffff",
    "--dsw-alias-button-elevated-fill": "#1a1a1a",
    "--dsw-alias-button-floating-fill": "#1a1a1a",
    "--dsw-alias-button-floating-hover": "#222222",
    "--dsw-alias-button-ghost-active-border": "#76b900",
    "--dsw-alias-button-ghost-active-fill": "#222222",
    "--dsw-alias-button-ghost-active-hover": "#2a2a2a",
    "--dsw-alias-button-info-fill": "#1eaedb",
    "--dsw-alias-button-info-hover": "#007fff",
    "--dsw-alias-button-tool-bar-fill": "#1a1a1a",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#222222",
    "--dsw-alias-interactive-bg-hover": "#161616",
    "--dsw-alias-interactive-bg-active": "#222222",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(118, 185, 0, 0.15)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(229, 32, 32, 0.15)",
    "--dsw-alias-interactive-bg-hover-solid": "#222222",
    "--dsw-alias-label-primary": "#ffffff",
    "--dsw-alias-label-secondary": "#a7a7a7",
    "--dsw-alias-label-tertiary": "#898989",
    "--dsw-alias-label-quaternary": "#757575",
    "--dsw-alias-label-caption": "#898989",
    "--dsw-alias-label-dimmed": "#757575",
    "--dsw-alias-label-error": "#e52020",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#000000",
    "--dsw-alias-label-primary-bluish": "#1eaedb",
    "--dsw-alias-state-business-primary": "#76b900",
    "--dsw-alias-state-business-tertiary": "rgba(118, 185, 0, 0.15)",
    /* 成功绿用更深的 #3f8500 与品牌绿区分 */
    "--dsw-alias-state-error-primary": "#e52020",
    "--dsw-alias-state-error-secondary": "rgba(229, 32, 32, 0.15)",
    "--dsw-alias-state-success-primary": "#76b900",
    "--dsw-alias-state-success-secondary": "rgba(118, 185, 0, 0.15)",
    "--dsw-alias-state-warn-primary": "#ef9100",
    "--dsw-alias-state-warn-secondary": "rgba(239, 145, 0, 0.15)",
    "--dsw-alias-state-warn-label": "#ef9100",
    "--dsw-alias-markdown-citation": "#76b900",
    "--dsw-alias-markdown-code-block": "#1a1a1a",
    "--dsw-alias-markdown-code-block-banner": "#222222",
    "--dsw-alias-markdown-inline-code": "rgba(118, 185, 0, 0.10)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(118, 185, 0, 0.18)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#757575",
    "--dsw-alias-scrollbar-bg-l1": "#2a2a2a",
    "--dsw-alias-scrollbar-bg-l2": "#222222",
    "--dsw-alias-scrollbar-hover-l1": "#5e5e5e",
    "--dsw-alias-scrollbar-hover-l2": "#2a2a2a",
    "--dsw-alias-toast-bg": "#1a1a1a",
    "--dsw-alias-tooltip-bg": "#2a2a2a",
    "--dsw-hovercard-bg": "#222222",
    "--dsw-specific-sidebar-fill": "#000000",
    "--dsw-specific-sidebar-nav-item-active": "rgba(118, 185, 0, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#76b900",
    "--dsw-specific-sidebar-nav-item-hover": "#161616",
    "--dsw-specific-bubble": "#1a1a1a",
    "--dsw-specific-bubble-highlight": "#222222",
    "--dsw-specific-input-major": "#1a1a1a",
    "--dsw-specific-login-input": "#1a1a1a",
    "--dsw-specific-menu": "#222222",
    "--dsw-specific-selector": "#222222",
    "--dsw-specific-tip": "#2a2a2a",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta5 = {
  dark: {
    id: "nvidia-dark",
    label: "NVIDIA \u786C\u6838\u7EFF",
    desc: "\u7EAF\u9ED1 #000 + \u4FE1\u53F7\u7EFF #76b900",
    swatch: ["#000000", "#1a1a1a", "#76b900", "#ffffff"]
  }
};

// src/host/themes/github.ts
var github_exports = {};
__export(github_exports, {
  dark: () => dark4,
  light: () => light4,
  meta: () => meta6
});
var dark4 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#0d1117",
    "--dsw-alias-bg-layer-1": "#161b22",
    "--dsw-alias-bg-layer-2": "#21262d",
    "--dsw-alias-bg-layer-3": "#282e35",
    "--dsw-alias-bg-overlay": "#161b22",
    "--dsw-alias-bg-multi-select": "#161b22",
    "--dsw-alias-bg-module-platform": "#161b22",
    "--dsw-alias-bg-skeleton": "#161b22",
    "--dsw-alias-border-l1": "#30363d",
    "--dsw-alias-border-l2": "#3d444d",
    "--dsw-alias-border-l2-darkmode-thin": "#30363d",
    "--dsw-alias-border-l3": "#545d68",
    "--dsw-alias-border-l4": "#6e7681",
    "--dsw-alias-border-inverted": "#f0f6fc",
    "--dsw-alias-border-inverted2": "#c9d1d9",
    "--dsw-alias-separator-primary": "#21262d",
    "--dsw-alias-fill-l2": "#21262d",
    "--dsw-alias-fill-tsp-secondary": "rgba(240, 246, 252, 0.05)",
    "--dsw-alias-brand-primary": "#2f81f7",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#2f81f7",
    "--dsw-alias-link": "#2f81f7",
    /* 主按钮 GitHub 绿 #238636（暗色官方值） */
    "--dsw-alias-button-primary-fill": "#238636",
    "--dsw-alias-button-primary-hover": "#2ea043",
    "--dsw-alias-button-primary-dimmed": "#1f6e30",
    "--dsw-alias-button-contrast-fill": "#f0f6fc",
    "--dsw-alias-button-elevated-fill": "#161b22",
    "--dsw-alias-button-floating-fill": "#161b22",
    "--dsw-alias-button-floating-hover": "#21262d",
    "--dsw-alias-button-ghost-active-border": "#3d444d",
    "--dsw-alias-button-ghost-active-fill": "#21262d",
    "--dsw-alias-button-ghost-active-hover": "#282e35",
    "--dsw-alias-button-info-fill": "#2f81f7",
    "--dsw-alias-button-info-hover": "#1f6feb",
    "--dsw-alias-button-tool-bar-fill": "#161b22",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#21262d",
    "--dsw-alias-interactive-bg-hover": "#161b22",
    "--dsw-alias-interactive-bg-active": "#21262d",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(47, 129, 247, 0.15)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(248, 81, 73, 0.15)",
    "--dsw-alias-interactive-bg-hover-solid": "#21262d",
    "--dsw-alias-label-primary": "#f0f6fc",
    "--dsw-alias-label-secondary": "#c9d1d9",
    "--dsw-alias-label-tertiary": "#8b949e",
    "--dsw-alias-label-quaternary": "#6e7681",
    "--dsw-alias-label-caption": "#8b949e",
    "--dsw-alias-label-dimmed": "#6e7681",
    "--dsw-alias-label-error": "#f85149",
    "--dsw-alias-label-primary-foreground": "#f0f6fc",
    "--dsw-alias-label-primary-inverted": "#0d1117",
    "--dsw-alias-label-primary-bluish": "#2f81f7",
    "--dsw-alias-state-business-primary": "#2f81f7",
    "--dsw-alias-state-business-tertiary": "rgba(47, 129, 247, 0.15)",
    "--dsw-alias-state-error-primary": "#f85149",
    "--dsw-alias-state-error-secondary": "rgba(248, 81, 73, 0.15)",
    "--dsw-alias-state-success-primary": "#3fb950",
    "--dsw-alias-state-success-secondary": "rgba(63, 185, 80, 0.15)",
    "--dsw-alias-state-warn-primary": "#d29922",
    "--dsw-alias-state-warn-secondary": "rgba(210, 153, 34, 0.15)",
    "--dsw-alias-state-warn-label": "#d29922",
    "--dsw-alias-markdown-citation": "#2f81f7",
    "--dsw-alias-markdown-code-block": "#161b22",
    "--dsw-alias-markdown-code-block-banner": "#21262d",
    "--dsw-alias-markdown-inline-code": "rgba(56, 139, 253, 0.15)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(47, 129, 247, 0.25)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#6e7681",
    "--dsw-alias-scrollbar-bg-l1": "#30363d",
    "--dsw-alias-scrollbar-bg-l2": "#21262d",
    "--dsw-alias-scrollbar-hover-l1": "#545d68",
    "--dsw-alias-scrollbar-hover-l2": "#30363d",
    "--dsw-alias-toast-bg": "#161b22",
    "--dsw-alias-tooltip-bg": "#282e35",
    "--dsw-hovercard-bg": "#21262d",
    "--dsw-specific-sidebar-fill": "#0d1117",
    "--dsw-specific-sidebar-nav-item-active": "rgba(47, 129, 247, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#2f81f7",
    "--dsw-specific-sidebar-nav-item-hover": "#161b22",
    "--dsw-specific-bubble": "#161b22",
    "--dsw-specific-bubble-highlight": "#21262d",
    "--dsw-specific-input-major": "#0d1117",
    "--dsw-specific-login-input": "#0d1117",
    "--dsw-specific-menu": "#21262d",
    "--dsw-specific-selector": "#21262d",
    "--dsw-specific-tip": "#282e35",
    "--dsw-shadow-lv1": "none",
    "--dsw-shadow-lv2": "none",
    "--dsw-shadow-lv3": "none",
    "--dsw-shadow-lv1-blur": "0px",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO
  },
  SANS
);
var light4 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#ffffff",
    "--dsw-alias-bg-layer-1": "#f6f8fa",
    "--dsw-alias-bg-layer-2": "#eff2f5",
    "--dsw-alias-bg-layer-3": "#eaeef2",
    "--dsw-alias-bg-overlay": "#ffffff",
    "--dsw-alias-bg-multi-select": "#f6f8fa",
    "--dsw-alias-bg-module-platform": "#f6f8fa",
    "--dsw-alias-bg-skeleton": "#f6f8fa",
    /* 发丝线 #d0d7de —— 结构骨架 */
    "--dsw-alias-border-l1": "#d0d7de",
    "--dsw-alias-border-l2": "#afb8c1",
    "--dsw-alias-border-l2-darkmode-thin": "#d0d7de",
    "--dsw-alias-border-l3": "#8c959f",
    "--dsw-alias-border-l4": "#57606a",
    "--dsw-alias-border-inverted": "#1f2328",
    "--dsw-alias-border-inverted2": "#656d76",
    "--dsw-alias-separator-primary": "#d8dee4",
    "--dsw-alias-fill-l2": "#eff2f5",
    "--dsw-alias-fill-tsp-secondary": "rgba(31, 35, 40, 0.04)",
    "--dsw-alias-brand-primary": "#0969da",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#0969da",
    "--dsw-alias-link": "#0969da",
    /* 主按钮 GitHub 绿 #1f883d（亮色官方值） */
    "--dsw-alias-button-primary-fill": "#1f883d",
    "--dsw-alias-button-primary-hover": "#1a7f37",
    "--dsw-alias-button-primary-dimmed": "#16795c",
    "--dsw-alias-button-contrast-fill": "#1f2328",
    "--dsw-alias-button-elevated-fill": "#ffffff",
    "--dsw-alias-button-floating-fill": "#ffffff",
    "--dsw-alias-button-floating-hover": "#f6f8fa",
    "--dsw-alias-button-ghost-active-border": "#afb8c1",
    "--dsw-alias-button-ghost-active-fill": "#eff2f5",
    "--dsw-alias-button-ghost-active-hover": "#eaeef2",
    "--dsw-alias-button-info-fill": "#0969da",
    "--dsw-alias-button-info-hover": "#0550ae",
    "--dsw-alias-button-tool-bar-fill": "#f6f8fa",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#eff2f5",
    "--dsw-alias-interactive-bg-hover": "#f6f8fa",
    "--dsw-alias-interactive-bg-active": "#eff2f5",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(9, 105, 218, 0.10)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(207, 34, 46, 0.08)",
    "--dsw-alias-interactive-bg-hover-solid": "#eff2f5",
    "--dsw-alias-label-primary": "#1f2328",
    "--dsw-alias-label-secondary": "#1f2328",
    "--dsw-alias-label-tertiary": "#656d76",
    "--dsw-alias-label-quaternary": "#8c959f",
    "--dsw-alias-label-caption": "#656d76",
    "--dsw-alias-label-dimmed": "#8c959f",
    "--dsw-alias-label-error": "#cf222e",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#ffffff",
    "--dsw-alias-label-primary-bluish": "#0969da",
    "--dsw-alias-state-business-primary": "#0969da",
    "--dsw-alias-state-business-tertiary": "rgba(9, 105, 218, 0.10)",
    "--dsw-alias-state-error-primary": "#cf222e",
    "--dsw-alias-state-error-secondary": "rgba(207, 34, 46, 0.08)",
    "--dsw-alias-state-success-primary": "#1a7f37",
    "--dsw-alias-state-success-secondary": "rgba(26, 127, 55, 0.10)",
    "--dsw-alias-state-warn-primary": "#9a6700",
    "--dsw-alias-state-warn-secondary": "rgba(154, 103, 0, 0.10)",
    "--dsw-alias-state-warn-label": "#9a6700",
    "--dsw-alias-markdown-citation": "#0969da",
    "--dsw-alias-markdown-code-block": "#f6f8fa",
    "--dsw-alias-markdown-code-block-banner": "#eff2f5",
    "--dsw-alias-markdown-inline-code": "rgba(9, 105, 218, 0.08)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(9, 105, 218, 0.12)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#8c959f",
    "--dsw-alias-scrollbar-bg-l1": "#d0d7de",
    "--dsw-alias-scrollbar-bg-l2": "#eff2f5",
    "--dsw-alias-scrollbar-hover-l1": "#afb8c1",
    "--dsw-alias-scrollbar-hover-l2": "#d0d7de",
    "--dsw-alias-toast-bg": "#ffffff",
    "--dsw-alias-tooltip-bg": "#1f2328",
    "--dsw-hovercard-bg": "#ffffff",
    "--dsw-specific-sidebar-fill": "#f6f8fa",
    "--dsw-specific-sidebar-nav-item-active": "rgba(9, 105, 218, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#0969da",
    "--dsw-specific-sidebar-nav-item-hover": "#eff2f5",
    "--dsw-specific-bubble": "#f6f8fa",
    "--dsw-specific-bubble-highlight": "#eff2f5",
    "--dsw-specific-input-major": "#f6f8fa",
    "--dsw-specific-login-input": "#f6f8fa",
    "--dsw-specific-menu": "#ffffff",
    "--dsw-specific-selector": "#ffffff",
    "--dsw-specific-tip": "#1f2328",
    "--dsw-shadow-lv1": "0 1px 0 rgba(31, 35, 40, 0.04)",
    "--dsw-shadow-lv2": "0 1px 3px rgba(31, 35, 40, 0.06)",
    "--dsw-shadow-lv3": "0 1px 5px rgba(31, 35, 40, 0.08)",
    "--dsw-shadow-lv1-blur": "1px",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO
  },
  SANS
);
var meta6 = {
  dark: {
    id: "github-dark",
    label: "GitHub \u6697\u8272 Primer",
    desc: "#0d1117 + Primer \u84DD #2f81f7",
    swatch: ["#0d1117", "#161b22", "#2f81f7", "#3fb950"]
  },
  light: {
    id: "github-light",
    label: "GitHub \u4EAE\u8272 Primer",
    desc: "\u7EAF\u767D + #0969da + \u7EFF\u8272\u6309\u94AE",
    swatch: ["#ffffff", "#f6f8fa", "#0969da", "#1f883d"]
  }
};

// src/host/themes/replicate.ts
var replicate_exports = {};
__export(replicate_exports, {
  light: () => light5,
  meta: () => meta7
});
var light5 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#ffffff",
    "--dsw-alias-bg-layer-1": "#f8f8f8",
    "--dsw-alias-bg-layer-2": "#efefef",
    "--dsw-alias-bg-layer-3": "#e5e5e5",
    "--dsw-alias-bg-overlay": "#ffffff",
    "--dsw-alias-bg-multi-select": "#f8f8f8",
    "--dsw-alias-bg-module-platform": "#f8f8f8",
    "--dsw-alias-bg-skeleton": "#f8f8f8",
    "--dsw-alias-border-l1": "#e5e5e5",
    "--dsw-alias-border-l2": "#bbbbbb",
    "--dsw-alias-border-l2-darkmode-thin": "#e5e5e5",
    "--dsw-alias-border-l3": "#8d8d8d",
    "--dsw-alias-border-l4": "#4e4e4e",
    "--dsw-alias-border-inverted": "#202020",
    "--dsw-alias-border-inverted2": "#4e4e4e",
    "--dsw-alias-separator-primary": "#e5e5e5",
    "--dsw-alias-fill-l2": "#efefef",
    "--dsw-alias-fill-tsp-secondary": "rgba(32, 32, 32, 0.04)",
    /* 品牌红：主操作与高光 */
    "--dsw-alias-brand-primary": "#ea2804",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#ea2804",
    "--dsw-alias-link": "#ea2804",
    "--dsw-alias-button-primary-fill": "#ea2804",
    "--dsw-alias-button-primary-hover": "#d42403",
    "--dsw-alias-button-primary-dimmed": "#b01e02",
    "--dsw-alias-button-contrast-fill": "#202020",
    "--dsw-alias-button-elevated-fill": "#ffffff",
    "--dsw-alias-button-floating-fill": "#ffffff",
    "--dsw-alias-button-floating-hover": "#f8f8f8",
    "--dsw-alias-button-ghost-active-border": "#bbbbbb",
    "--dsw-alias-button-ghost-active-fill": "#efefef",
    "--dsw-alias-button-ghost-active-hover": "#e5e5e5",
    "--dsw-alias-button-info-fill": "#ea2804",
    "--dsw-alias-button-info-hover": "#d42403",
    "--dsw-alias-button-tool-bar-fill": "#f8f8f8",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#efefef",
    "--dsw-alias-interactive-bg-hover": "#f8f8f8",
    "--dsw-alias-interactive-bg-active": "#efefef",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(234, 40, 4, 0.10)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(220, 38, 38, 0.08)",
    "--dsw-alias-interactive-bg-hover-solid": "#efefef",
    "--dsw-alias-label-primary": "#202020",
    "--dsw-alias-label-secondary": "#4e4e4e",
    "--dsw-alias-label-tertiary": "#646464",
    "--dsw-alias-label-quaternary": "#8d8d8d",
    "--dsw-alias-label-caption": "#646464",
    "--dsw-alias-label-dimmed": "#8d8d8d",
    "--dsw-alias-label-error": "#dc2626",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#ffffff",
    "--dsw-alias-label-primary-bluish": "#ea2804",
    "--dsw-alias-state-business-primary": "#ea2804",
    "--dsw-alias-state-business-tertiary": "rgba(234, 40, 4, 0.10)",
    "--dsw-alias-state-error-primary": "#dc2626",
    "--dsw-alias-state-error-secondary": "rgba(220, 38, 38, 0.08)",
    "--dsw-alias-state-success-primary": "#2b9a66",
    "--dsw-alias-state-success-secondary": "rgba(43, 154, 102, 0.10)",
    "--dsw-alias-state-warn-primary": "#9a6700",
    "--dsw-alias-state-warn-secondary": "rgba(234, 179, 8, 0.10)",
    "--dsw-alias-state-warn-label": "#9a6700",
    "--dsw-alias-markdown-citation": "#ea2804",
    "--dsw-alias-markdown-code-block": "#f8f8f8",
    "--dsw-alias-markdown-code-block-banner": "#efefef",
    "--dsw-alias-markdown-inline-code": "rgba(234, 40, 4, 0.08)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(234, 40, 4, 0.12)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#8d8d8d",
    "--dsw-alias-scrollbar-bg-l1": "#e5e5e5",
    "--dsw-alias-scrollbar-bg-l2": "#efefef",
    "--dsw-alias-scrollbar-hover-l1": "#bbbbbb",
    "--dsw-alias-scrollbar-hover-l2": "#e5e5e5",
    "--dsw-alias-toast-bg": "#ffffff",
    "--dsw-alias-tooltip-bg": "#202020",
    "--dsw-hovercard-bg": "#ffffff",
    "--dsw-specific-sidebar-fill": "#f8f8f8",
    "--dsw-specific-sidebar-nav-item-active": "rgba(234, 40, 4, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#ea2804",
    "--dsw-specific-sidebar-nav-item-hover": "#efefef",
    "--dsw-specific-bubble": "#f8f8f8",
    "--dsw-specific-bubble-highlight": "#efefef",
    "--dsw-specific-input-major": "#f8f8f8",
    "--dsw-specific-login-input": "#f8f8f8",
    "--dsw-specific-menu": "#ffffff",
    "--dsw-specific-selector": "#ffffff",
    "--dsw-specific-tip": "#202020",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta7 = {
  light: {
    id: "replicate-light",
    label: "Replicate \u5F00\u53D1\u8005\u7EA2",
    desc: "\u7EAF\u767D #ffffff + \u54C1\u724C\u7EA2 #ea2804",
    swatch: ["#ffffff", "#f8f8f8", "#ea2804", "#202020"]
  }
};

// src/host/themes/cisco.ts
var cisco_exports = {};
__export(cisco_exports, {
  dark: () => dark5,
  meta: () => meta8
});
var dark5 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#0f1720",
    "--dsw-alias-bg-layer-1": "#1b2530",
    "--dsw-alias-bg-layer-2": "#243447",
    "--dsw-alias-bg-layer-3": "#2e4257",
    "--dsw-alias-bg-overlay": "#1b2530",
    "--dsw-alias-bg-multi-select": "#1b2530",
    "--dsw-alias-bg-module-platform": "#1b2530",
    "--dsw-alias-bg-skeleton": "#1b2530",
    "--dsw-alias-border-l1": "#243447",
    "--dsw-alias-border-l2": "#58585b",
    "--dsw-alias-border-l2-darkmode-thin": "rgba(232, 235, 241, 0.14)",
    "--dsw-alias-border-l3": "#9e9ea2",
    "--dsw-alias-border-l4": "#e8ebf1",
    "--dsw-alias-border-inverted": "#ffffff",
    "--dsw-alias-border-inverted2": "#e8ebf1",
    "--dsw-alias-separator-primary": "#243447",
    "--dsw-alias-fill-l2": "#243447",
    "--dsw-alias-fill-tsp-secondary": "rgba(255, 255, 255, 0.05)",
    /* Cisco 蓝：品牌信号 */
    "--dsw-alias-brand-primary": "#049fd9",
    "--dsw-alias-brand-primary-invert": "#001923",
    "--dsw-alias-brand-text": "#049fd9",
    "--dsw-alias-link": "#049fd9",
    "--dsw-alias-button-primary-fill": "#049fd9",
    "--dsw-alias-button-primary-hover": "#048fc3",
    "--dsw-alias-button-primary-dimmed": "#03709a",
    "--dsw-alias-button-contrast-fill": "#ffffff",
    "--dsw-alias-button-elevated-fill": "#1b2530",
    "--dsw-alias-button-floating-fill": "#1b2530",
    "--dsw-alias-button-floating-hover": "#243447",
    "--dsw-alias-button-ghost-active-border": "#58585b",
    "--dsw-alias-button-ghost-active-fill": "#243447",
    "--dsw-alias-button-ghost-active-hover": "#2e4257",
    "--dsw-alias-button-info-fill": "#049fd9",
    "--dsw-alias-button-info-hover": "#048fc3",
    "--dsw-alias-button-tool-bar-fill": "#1b2530",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#243447",
    "--dsw-alias-interactive-bg-hover": "#16202c",
    "--dsw-alias-interactive-bg-active": "#243447",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(4, 159, 217, 0.18)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(207, 32, 48, 0.15)",
    "--dsw-alias-interactive-bg-hover-solid": "#243447",
    "--dsw-alias-label-primary": "#ffffff",
    "--dsw-alias-label-secondary": "#e8ebf1",
    "--dsw-alias-label-tertiary": "#9e9ea2",
    "--dsw-alias-label-quaternary": "#58585b",
    "--dsw-alias-label-caption": "#9e9ea2",
    "--dsw-alias-label-dimmed": "#58585b",
    "--dsw-alias-label-error": "#cf2030",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#0f1720",
    "--dsw-alias-label-primary-bluish": "#64bbe3",
    "--dsw-alias-state-business-primary": "#049fd9",
    "--dsw-alias-state-business-tertiary": "rgba(4, 159, 217, 0.18)",
    "--dsw-alias-state-error-primary": "#cf2030",
    "--dsw-alias-state-error-secondary": "rgba(207, 32, 48, 0.15)",
    "--dsw-alias-state-success-primary": "#6cc04a",
    "--dsw-alias-state-success-secondary": "rgba(108, 192, 74, 0.15)",
    "--dsw-alias-state-warn-primary": "#ffcc00",
    "--dsw-alias-state-warn-secondary": "rgba(255, 204, 0, 0.15)",
    "--dsw-alias-state-warn-label": "#ffcc00",
    "--dsw-alias-markdown-citation": "#64bbe3",
    "--dsw-alias-markdown-code-block": "#1b2530",
    "--dsw-alias-markdown-code-block-banner": "#243447",
    "--dsw-alias-markdown-inline-code": "rgba(4, 159, 217, 0.12)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(4, 159, 217, 0.22)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#58585b",
    "--dsw-alias-scrollbar-bg-l1": "#58585b",
    "--dsw-alias-scrollbar-bg-l2": "#243447",
    "--dsw-alias-scrollbar-hover-l1": "#9e9ea2",
    "--dsw-alias-scrollbar-hover-l2": "#58585b",
    "--dsw-alias-toast-bg": "#1b2530",
    "--dsw-alias-tooltip-bg": "#243447",
    "--dsw-hovercard-bg": "#243447",
    "--dsw-specific-sidebar-fill": "#0f1720",
    "--dsw-specific-sidebar-nav-item-active": "rgba(4, 159, 217, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#049fd9",
    "--dsw-specific-sidebar-nav-item-hover": "#16202c",
    "--dsw-specific-bubble": "#1b2530",
    "--dsw-specific-bubble-highlight": "#243447",
    "--dsw-specific-input-major": "#1b2530",
    "--dsw-specific-login-input": "#1b2530",
    "--dsw-specific-menu": "#243447",
    "--dsw-specific-selector": "#243447",
    "--dsw-specific-tip": "#2e4257",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta8 = {
  dark: {
    id: "cisco-dark",
    label: "Cisco \u4FE1\u4EFB\u84DD",
    desc: "\u85CF\u9752 #0f1720 + \u4FE1\u53F7\u84DD #049fd9",
    swatch: ["#0f1720", "#1b2530", "#049fd9", "#ffffff"]
  }
};

// src/host/themes/tide.ts
var tide_exports = {};
__export(tide_exports, {
  dark: () => dark6,
  meta: () => meta9
});
var dark6 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#062a2c",
    "--dsw-alias-bg-layer-1": "#0b3538",
    "--dsw-alias-bg-layer-2": "#104144",
    "--dsw-alias-bg-layer-3": "#174f52",
    "--dsw-alias-bg-overlay": "#0b3538",
    "--dsw-alias-bg-multi-select": "#0b3538",
    "--dsw-alias-bg-module-platform": "#0b3538",
    "--dsw-alias-bg-skeleton": "#0b3538",
    "--dsw-alias-border-l1": "#174f52",
    "--dsw-alias-border-l2": "#3d7a7d",
    "--dsw-alias-border-l2-darkmode-thin": "#174f52",
    "--dsw-alias-border-l3": "#5b9a9d",
    "--dsw-alias-border-l4": "#7fbabd",
    "--dsw-alias-border-inverted": "#eafaf8",
    "--dsw-alias-border-inverted2": "#b5deda",
    "--dsw-alias-separator-primary": "#174f52",
    "--dsw-alias-fill-l2": "#104144",
    "--dsw-alias-fill-tsp-secondary": "rgba(234, 250, 248, 0.05)",
    /* 潮汐青：品牌信号 */
    "--dsw-alias-brand-primary": "#2dd4bf",
    "--dsw-alias-brand-primary-invert": "#062a2c",
    "--dsw-alias-brand-text": "#5eead4",
    "--dsw-alias-link": "#5eead4",
    "--dsw-alias-button-primary-fill": "#2dd4bf",
    "--dsw-alias-button-primary-hover": "#5eead4",
    "--dsw-alias-button-primary-dimmed": "#0d9488",
    "--dsw-alias-button-contrast-fill": "#eafaf8",
    "--dsw-alias-button-elevated-fill": "#0b3538",
    "--dsw-alias-button-floating-fill": "#0b3538",
    "--dsw-alias-button-floating-hover": "#104144",
    "--dsw-alias-button-ghost-active-border": "#3d7a7d",
    "--dsw-alias-button-ghost-active-fill": "#104144",
    "--dsw-alias-button-ghost-active-hover": "#174f52",
    "--dsw-alias-button-info-fill": "#38bdf8",
    "--dsw-alias-button-info-hover": "#7dd3fc",
    "--dsw-alias-button-tool-bar-fill": "#0b3538",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#104144",
    "--dsw-alias-interactive-bg-hover": "#0d3a3d",
    "--dsw-alias-interactive-bg-active": "#104144",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(45, 212, 191, 0.15)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(248, 113, 113, 0.15)",
    "--dsw-alias-interactive-bg-hover-solid": "#104144",
    "--dsw-alias-label-primary": "#eafaf8",
    "--dsw-alias-label-secondary": "#b5deda",
    "--dsw-alias-label-tertiary": "#7fa8a5",
    "--dsw-alias-label-quaternary": "#527a78",
    "--dsw-alias-label-caption": "#7fa8a5",
    "--dsw-alias-label-dimmed": "#527a78",
    "--dsw-alias-label-error": "#f87171",
    "--dsw-alias-label-primary-foreground": "#eafaf8",
    "--dsw-alias-label-primary-inverted": "#062a2c",
    "--dsw-alias-label-primary-bluish": "#38bdf8",
    "--dsw-alias-state-business-primary": "#5eead4",
    "--dsw-alias-state-business-tertiary": "rgba(45, 212, 191, 0.15)",
    "--dsw-alias-state-error-primary": "#f87171",
    "--dsw-alias-state-error-secondary": "rgba(248, 113, 113, 0.15)",
    "--dsw-alias-state-success-primary": "#34d399",
    "--dsw-alias-state-success-secondary": "rgba(52, 211, 153, 0.15)",
    "--dsw-alias-state-warn-primary": "#fbbf24",
    "--dsw-alias-state-warn-secondary": "rgba(251, 191, 36, 0.15)",
    "--dsw-alias-state-warn-label": "#fbbf24",
    "--dsw-alias-markdown-citation": "#5eead4",
    "--dsw-alias-markdown-code-block": "#0b3538",
    "--dsw-alias-markdown-code-block-banner": "#104144",
    "--dsw-alias-markdown-inline-code": "rgba(45, 212, 191, 0.10)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(45, 212, 191, 0.20)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#527a78",
    "--dsw-alias-scrollbar-bg-l1": "#3d7a7d",
    "--dsw-alias-scrollbar-bg-l2": "#104144",
    "--dsw-alias-scrollbar-hover-l1": "#7fa8a5",
    "--dsw-alias-scrollbar-hover-l2": "#3d7a7d",
    "--dsw-alias-toast-bg": "#0b3538",
    "--dsw-alias-tooltip-bg": "#174f52",
    "--dsw-hovercard-bg": "#104144",
    "--dsw-specific-sidebar-fill": "#062a2c",
    "--dsw-specific-sidebar-nav-item-active": "rgba(45, 212, 191, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#2dd4bf",
    "--dsw-specific-sidebar-nav-item-hover": "#0d3a3d",
    "--dsw-specific-bubble": "#0b3538",
    "--dsw-specific-bubble-highlight": "#104144",
    "--dsw-specific-input-major": "#0b3538",
    "--dsw-specific-login-input": "#0b3538",
    "--dsw-specific-menu": "#104144",
    "--dsw-specific-selector": "#104144",
    "--dsw-specific-tip": "#174f52",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta9 = {
  dark: {
    id: "tide-dark",
    label: "Tide \u6F6E\u6C50\u9752",
    desc: "\u6DF1\u9752 #062a2c + \u6F6E\u6C50 #2dd4bf",
    swatch: ["#062a2c", "#0b3538", "#2dd4bf", "#eafaf8"]
  }
};

// src/host/themes/nebula.ts
var nebula_exports = {};
__export(nebula_exports, {
  dark: () => dark7,
  meta: () => meta10
});
var dark7 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#0d0a1a",
    "--dsw-alias-bg-layer-1": "#161230",
    "--dsw-alias-bg-layer-2": "#1e1840",
    "--dsw-alias-bg-layer-3": "#282058",
    "--dsw-alias-bg-overlay": "#161230",
    "--dsw-alias-bg-multi-select": "#161230",
    "--dsw-alias-bg-module-platform": "#161230",
    "--dsw-alias-bg-skeleton": "#161230",
    "--dsw-alias-border-l1": "#2a2350",
    "--dsw-alias-border-l2": "#554a8a",
    "--dsw-alias-border-l2-darkmode-thin": "#2a2350",
    "--dsw-alias-border-l3": "#6d63a8",
    "--dsw-alias-border-l4": "#8b7fc7",
    "--dsw-alias-border-inverted": "#f1edfd",
    "--dsw-alias-border-inverted2": "#c9bff0",
    "--dsw-alias-separator-primary": "#2a2350",
    "--dsw-alias-fill-l2": "#1e1840",
    "--dsw-alias-fill-tsp-secondary": "rgba(241, 237, 253, 0.05)",
    /* 霓紫：品牌信号 */
    "--dsw-alias-brand-primary": "#8b5cf6",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#a78bfa",
    "--dsw-alias-link": "#a78bfa",
    "--dsw-alias-button-primary-fill": "#8b5cf6",
    "--dsw-alias-button-primary-hover": "#a78bfa",
    "--dsw-alias-button-primary-dimmed": "#6d28d9",
    "--dsw-alias-button-contrast-fill": "#f1edfd",
    "--dsw-alias-button-elevated-fill": "#161230",
    "--dsw-alias-button-floating-fill": "#161230",
    "--dsw-alias-button-floating-hover": "#1e1840",
    "--dsw-alias-button-ghost-active-border": "#554a8a",
    "--dsw-alias-button-ghost-active-fill": "#1e1840",
    "--dsw-alias-button-ghost-active-hover": "#282058",
    "--dsw-alias-button-info-fill": "#d946ef",
    "--dsw-alias-button-info-hover": "#e879f9",
    "--dsw-alias-button-tool-bar-fill": "#161230",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#1e1840",
    "--dsw-alias-interactive-bg-hover": "#1a1438",
    "--dsw-alias-interactive-bg-active": "#1e1840",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(139, 92, 246, 0.20)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(244, 63, 94, 0.15)",
    "--dsw-alias-interactive-bg-hover-solid": "#1e1840",
    "--dsw-alias-label-primary": "#f1edfd",
    "--dsw-alias-label-secondary": "#c9bff0",
    "--dsw-alias-label-tertiary": "#8f86b8",
    "--dsw-alias-label-quaternary": "#655c94",
    "--dsw-alias-label-caption": "#8f86b8",
    "--dsw-alias-label-dimmed": "#655c94",
    "--dsw-alias-label-error": "#fb7185",
    "--dsw-alias-label-primary-foreground": "#f1edfd",
    "--dsw-alias-label-primary-inverted": "#0d0a1a",
    "--dsw-alias-label-primary-bluish": "#a78bfa",
    "--dsw-alias-state-business-primary": "#a78bfa",
    "--dsw-alias-state-business-tertiary": "rgba(139, 92, 246, 0.20)",
    "--dsw-alias-state-error-primary": "#fb7185",
    "--dsw-alias-state-error-secondary": "rgba(251, 113, 133, 0.15)",
    "--dsw-alias-state-success-primary": "#34d399",
    "--dsw-alias-state-success-secondary": "rgba(52, 211, 153, 0.15)",
    "--dsw-alias-state-warn-primary": "#fbbf24",
    "--dsw-alias-state-warn-secondary": "rgba(251, 191, 36, 0.15)",
    "--dsw-alias-state-warn-label": "#fbbf24",
    "--dsw-alias-markdown-citation": "#a78bfa",
    "--dsw-alias-markdown-code-block": "#161230",
    "--dsw-alias-markdown-code-block-banner": "#1e1840",
    "--dsw-alias-markdown-inline-code": "rgba(167, 139, 250, 0.12)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(139, 92, 246, 0.25)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#655c94",
    "--dsw-alias-scrollbar-bg-l1": "#554a8a",
    "--dsw-alias-scrollbar-bg-l2": "#1e1840",
    "--dsw-alias-scrollbar-hover-l1": "#8f86b8",
    "--dsw-alias-scrollbar-hover-l2": "#554a8a",
    "--dsw-alias-toast-bg": "#161230",
    "--dsw-alias-tooltip-bg": "#282058",
    "--dsw-hovercard-bg": "#1e1840",
    "--dsw-specific-sidebar-fill": "#0d0a1a",
    "--dsw-specific-sidebar-nav-item-active": "rgba(139, 92, 246, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#8b5cf6",
    "--dsw-specific-sidebar-nav-item-hover": "#1a1438",
    "--dsw-specific-bubble": "#161230",
    "--dsw-specific-bubble-highlight": "#1e1840",
    "--dsw-specific-input-major": "#161230",
    "--dsw-specific-login-input": "#161230",
    "--dsw-specific-menu": "#1e1840",
    "--dsw-specific-selector": "#1e1840",
    "--dsw-specific-tip": "#282058",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta10 = {
  dark: {
    id: "nebula-dark",
    label: "Nebula \u661F\u4E91\u7D2B",
    desc: "\u7D2B\u9ED1 #0d0a1a + \u9713\u7D2B #8b5cf6",
    swatch: ["#0d0a1a", "#161230", "#8b5cf6", "#f1edfd"]
  }
};

// src/host/themes/discord.ts
var discord_exports = {};
__export(discord_exports, {
  dark: () => dark8,
  meta: () => meta11
});
var dark8 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#313338",
    "--dsw-alias-bg-layer-1": "#2b2d31",
    "--dsw-alias-bg-layer-2": "#242529",
    "--dsw-alias-bg-layer-3": "#1e1f22",
    "--dsw-alias-bg-overlay": "#2b2d31",
    "--dsw-alias-bg-multi-select": "#2b2d31",
    "--dsw-alias-bg-module-platform": "#2b2d31",
    "--dsw-alias-bg-skeleton": "#242529",
    "--dsw-alias-border-l1": "rgba(255, 255, 255, 0.06)",
    "--dsw-alias-border-l2": "#3f4147",
    "--dsw-alias-border-l2-darkmode-thin": "rgba(255, 255, 255, 0.06)",
    "--dsw-alias-border-l3": "#5c5e66",
    "--dsw-alias-border-l4": "#80848e",
    "--dsw-alias-border-inverted": "#f2f3f5",
    "--dsw-alias-border-inverted2": "#dbdee1",
    "--dsw-alias-separator-primary": "rgba(255, 255, 255, 0.06)",
    "--dsw-alias-fill-l2": "#242529",
    "--dsw-alias-fill-tsp-secondary": "rgba(219, 222, 225, 0.06)",
    /* Blurple：品牌指纹 */
    "--dsw-alias-brand-primary": "#5865f2",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#5865f2",
    "--dsw-alias-link": "#5865f2",
    "--dsw-alias-button-primary-fill": "#5865f2",
    "--dsw-alias-button-primary-hover": "#4752c4",
    "--dsw-alias-button-primary-dimmed": "#3c45a5",
    "--dsw-alias-button-contrast-fill": "#f2f3f5",
    "--dsw-alias-button-elevated-fill": "#2b2d31",
    "--dsw-alias-button-floating-fill": "#2b2d31",
    "--dsw-alias-button-floating-hover": "#313338",
    "--dsw-alias-button-ghost-active-border": "#3f4147",
    "--dsw-alias-button-ghost-active-fill": "#242529",
    "--dsw-alias-button-ghost-active-hover": "#1e1f22",
    "--dsw-alias-button-info-fill": "#5865f2",
    "--dsw-alias-button-info-hover": "#4752c4",
    "--dsw-alias-button-tool-bar-fill": "#2b2d31",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#313338",
    "--dsw-alias-interactive-bg-hover": "#2e3035",
    "--dsw-alias-interactive-bg-active": "#34363c",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(88, 101, 242, 0.18)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(242, 63, 67, 0.15)",
    "--dsw-alias-interactive-bg-hover-solid": "#34363c",
    "--dsw-alias-label-primary": "#dbdee1",
    "--dsw-alias-label-secondary": "#b5bac1",
    "--dsw-alias-label-tertiary": "#949ba4",
    "--dsw-alias-label-quaternary": "#80848e",
    "--dsw-alias-label-caption": "#949ba4",
    "--dsw-alias-label-dimmed": "#6d6f78",
    "--dsw-alias-label-error": "#f23f43",
    "--dsw-alias-label-primary-foreground": "#dbdee1",
    "--dsw-alias-label-primary-inverted": "#313338",
    "--dsw-alias-label-primary-bluish": "#7289da",
    "--dsw-alias-state-business-primary": "#5865f2",
    "--dsw-alias-state-business-tertiary": "rgba(88, 101, 242, 0.18)",
    /* 状态点三色：在线绿 / 闲置黄 / 勿扰红 */
    "--dsw-alias-state-error-primary": "#f23f43",
    "--dsw-alias-state-error-secondary": "rgba(242, 63, 67, 0.15)",
    "--dsw-alias-state-success-primary": "#23a55a",
    "--dsw-alias-state-success-secondary": "rgba(35, 165, 90, 0.15)",
    "--dsw-alias-state-warn-primary": "#f0b232",
    "--dsw-alias-state-warn-secondary": "rgba(240, 178, 50, 0.15)",
    "--dsw-alias-state-warn-label": "#f0b232",
    "--dsw-alias-markdown-citation": "#7289da",
    "--dsw-alias-markdown-code-block": "#2b2d31",
    "--dsw-alias-markdown-code-block-banner": "#1e1f22",
    "--dsw-alias-markdown-inline-code": "rgba(88, 101, 242, 0.16)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(88, 101, 242, 0.25)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#6d6f78",
    "--dsw-alias-scrollbar-bg-l1": "#3f4147",
    "--dsw-alias-scrollbar-bg-l2": "#242529",
    "--dsw-alias-scrollbar-hover-l1": "#80848e",
    "--dsw-alias-scrollbar-hover-l2": "#3f4147",
    "--dsw-alias-toast-bg": "#2b2d31",
    "--dsw-alias-tooltip-bg": "#1e1f22",
    "--dsw-hovercard-bg": "#242529",
    "--dsw-specific-sidebar-fill": "#2b2d31",
    "--dsw-specific-sidebar-nav-item-active": "rgba(88, 101, 242, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#5865f2",
    "--dsw-specific-sidebar-nav-item-hover": "#2e3035",
    "--dsw-specific-bubble": "#2b2d31",
    "--dsw-specific-bubble-highlight": "#313338",
    "--dsw-specific-input-major": "#1e1f22",
    "--dsw-specific-login-input": "#2b2d31",
    "--dsw-specific-menu": "#2b2d31",
    "--dsw-specific-selector": "#2b2d31",
    "--dsw-specific-tip": "#1e1f22",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta11 = {
  dark: {
    id: "discord-dark",
    label: "Discord Blurple\u591C",
    desc: "\u6DF1\u7070 #313338 + Blurple #5865f2",
    swatch: ["#313338", "#2b2d31", "#5865f2", "#dbdee1"]
  }
};

// src/host/themes/supabase.ts
var supabase_exports = {};
__export(supabase_exports, {
  dark: () => dark9,
  meta: () => meta12
});
var dark9 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#171717",
    "--dsw-alias-bg-layer-1": "#1c1c1c",
    "--dsw-alias-bg-layer-2": "#242424",
    "--dsw-alias-bg-layer-3": "#2e2e2e",
    "--dsw-alias-bg-overlay": "#1c1c1c",
    "--dsw-alias-bg-multi-select": "#1c1c1c",
    "--dsw-alias-bg-module-platform": "#1c1c1c",
    "--dsw-alias-bg-skeleton": "#242424",
    "--dsw-alias-border-l1": "#242424",
    "--dsw-alias-border-l2": "#2e2e2e",
    "--dsw-alias-border-l2-darkmode-thin": "#242424",
    "--dsw-alias-border-l3": "#363636",
    "--dsw-alias-border-l4": "#4d4d4d",
    "--dsw-alias-border-inverted": "#fafafa",
    "--dsw-alias-border-inverted2": "#b4b4b4",
    "--dsw-alias-separator-primary": "#242424",
    "--dsw-alias-fill-l2": "#242424",
    "--dsw-alias-fill-tsp-secondary": "rgba(250, 250, 250, 0.05)",
    /* 翡翠绿：品牌信号（亮绿配深字，对比才够） */
    "--dsw-alias-brand-primary": "#3ecf8e",
    "--dsw-alias-brand-primary-invert": "#0f0f0f",
    "--dsw-alias-brand-text": "#3ecf8e",
    "--dsw-alias-link": "#3ecf8e",
    "--dsw-alias-button-primary-fill": "#3ecf8e",
    "--dsw-alias-button-primary-hover": "#00c573",
    "--dsw-alias-button-primary-dimmed": "#2aa872",
    "--dsw-alias-button-contrast-fill": "#fafafa",
    "--dsw-alias-button-elevated-fill": "#1c1c1c",
    "--dsw-alias-button-floating-fill": "#1c1c1c",
    "--dsw-alias-button-floating-hover": "#242424",
    "--dsw-alias-button-ghost-active-border": "rgba(62, 207, 142, 0.3)",
    "--dsw-alias-button-ghost-active-fill": "#242424",
    "--dsw-alias-button-ghost-active-hover": "#2e2e2e",
    "--dsw-alias-button-info-fill": "#3ecf8e",
    "--dsw-alias-button-info-hover": "#00c573",
    "--dsw-alias-button-tool-bar-fill": "#1c1c1c",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#242424",
    "--dsw-alias-interactive-bg-hover": "#202020",
    "--dsw-alias-interactive-bg-active": "#2e2e2e",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(62, 207, 142, 0.15)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(220, 38, 38, 0.15)",
    "--dsw-alias-interactive-bg-hover-solid": "#2e2e2e",
    "--dsw-alias-label-primary": "#fafafa",
    "--dsw-alias-label-secondary": "#b4b4b4",
    "--dsw-alias-label-tertiary": "#898989",
    "--dsw-alias-label-quaternary": "#4d4d4d",
    "--dsw-alias-label-caption": "#898989",
    "--dsw-alias-label-dimmed": "#4d4d4d",
    "--dsw-alias-label-error": "#dc2626",
    "--dsw-alias-label-primary-foreground": "#fafafa",
    "--dsw-alias-label-primary-inverted": "#171717",
    "--dsw-alias-label-primary-bluish": "#3ecf8e",
    "--dsw-alias-state-business-primary": "#3ecf8e",
    "--dsw-alias-state-business-tertiary": "rgba(62, 207, 142, 0.15)",
    "--dsw-alias-state-error-primary": "#dc2626",
    "--dsw-alias-state-error-secondary": "rgba(220, 38, 38, 0.15)",
    "--dsw-alias-state-success-primary": "#16a34a",
    "--dsw-alias-state-success-secondary": "rgba(22, 163, 74, 0.15)",
    "--dsw-alias-state-warn-primary": "#eab308",
    "--dsw-alias-state-warn-secondary": "rgba(234, 179, 8, 0.15)",
    "--dsw-alias-state-warn-label": "#eab308",
    "--dsw-alias-markdown-citation": "#3ecf8e",
    "--dsw-alias-markdown-code-block": "#1c1c1c",
    "--dsw-alias-markdown-code-block-banner": "#242424",
    "--dsw-alias-markdown-inline-code": "rgba(62, 207, 142, 0.12)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(62, 207, 142, 0.20)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#4d4d4d",
    "--dsw-alias-scrollbar-bg-l1": "#2e2e2e",
    "--dsw-alias-scrollbar-bg-l2": "#242424",
    "--dsw-alias-scrollbar-hover-l1": "#4d4d4d",
    "--dsw-alias-scrollbar-hover-l2": "#2e2e2e",
    "--dsw-alias-toast-bg": "#1c1c1c",
    "--dsw-alias-tooltip-bg": "#2e2e2e",
    "--dsw-hovercard-bg": "#242424",
    "--dsw-specific-sidebar-fill": "#171717",
    "--dsw-specific-sidebar-nav-item-active": "rgba(62, 207, 142, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#3ecf8e",
    "--dsw-specific-sidebar-nav-item-hover": "#202020",
    "--dsw-specific-bubble": "#1c1c1c",
    "--dsw-specific-bubble-highlight": "#242424",
    "--dsw-specific-input-major": "#1c1c1c",
    "--dsw-specific-login-input": "#1c1c1c",
    "--dsw-specific-menu": "#242424",
    "--dsw-specific-selector": "#242424",
    "--dsw-specific-tip": "#2e2e2e",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta12 = {
  dark: {
    id: "supabase-dark",
    label: "Supabase \u7FE1\u7FE0\u591C",
    desc: "\u58A8\u9ED1 #171717 + \u7FE1\u7FE0\u7EFF #3ecf8e",
    swatch: ["#171717", "#1c1c1c", "#3ecf8e", "#fafafa"]
  }
};

// src/host/themes/sakura.ts
var sakura_exports = {};
__export(sakura_exports, {
  light: () => light6,
  meta: () => meta13
});
var light6 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#fff9fa",
    "--dsw-alias-bg-layer-1": "#fbeef2",
    "--dsw-alias-bg-layer-2": "#f6dee6",
    "--dsw-alias-bg-layer-3": "#efc9d6",
    "--dsw-alias-bg-overlay": "#ffffff",
    "--dsw-alias-bg-multi-select": "#fbeef2",
    "--dsw-alias-bg-module-platform": "#fbeef2",
    "--dsw-alias-bg-skeleton": "#fbeef2",
    "--dsw-alias-border-l1": "#f3dfe6",
    "--dsw-alias-border-l2": "#d9a3b5",
    "--dsw-alias-border-l2-darkmode-thin": "#f3dfe6",
    "--dsw-alias-border-l3": "#b97f92",
    "--dsw-alias-border-l4": "#8f5a6d",
    "--dsw-alias-border-inverted": "#432635",
    "--dsw-alias-border-inverted2": "#6b4256",
    "--dsw-alias-separator-primary": "#f3dfe6",
    "--dsw-alias-fill-l2": "#f6dee6",
    "--dsw-alias-fill-tsp-secondary": "rgba(67, 38, 53, 0.04)",
    /* 樱粉：品牌信号 */
    "--dsw-alias-brand-primary": "#e75480",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#e75480",
    "--dsw-alias-link": "#e75480",
    "--dsw-alias-button-primary-fill": "#e75480",
    "--dsw-alias-button-primary-hover": "#d13d6c",
    "--dsw-alias-button-primary-dimmed": "#b02a57",
    "--dsw-alias-button-contrast-fill": "#432635",
    "--dsw-alias-button-elevated-fill": "#ffffff",
    "--dsw-alias-button-floating-fill": "#ffffff",
    "--dsw-alias-button-floating-hover": "#fbeef2",
    "--dsw-alias-button-ghost-active-border": "#d9a3b5",
    "--dsw-alias-button-ghost-active-fill": "#f6dee6",
    "--dsw-alias-button-ghost-active-hover": "#efc9d6",
    "--dsw-alias-button-info-fill": "#e75480",
    "--dsw-alias-button-info-hover": "#d13d6c",
    "--dsw-alias-button-tool-bar-fill": "#fbeef2",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#f6dee6",
    "--dsw-alias-interactive-bg-hover": "#fbeef2",
    "--dsw-alias-interactive-bg-active": "#f6dee6",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(231, 84, 128, 0.10)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(207, 34, 46, 0.08)",
    "--dsw-alias-interactive-bg-hover-solid": "#f6dee6",
    "--dsw-alias-label-primary": "#432635",
    "--dsw-alias-label-secondary": "#6b4256",
    "--dsw-alias-label-tertiary": "#96707f",
    "--dsw-alias-label-quaternary": "#b99aa6",
    "--dsw-alias-label-caption": "#96707f",
    "--dsw-alias-label-dimmed": "#b99aa6",
    "--dsw-alias-label-error": "#cf222e",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#ffffff",
    "--dsw-alias-label-primary-bluish": "#e75480",
    "--dsw-alias-state-business-primary": "#e75480",
    "--dsw-alias-state-business-tertiary": "rgba(231, 84, 128, 0.10)",
    "--dsw-alias-state-error-primary": "#cf222e",
    "--dsw-alias-state-error-secondary": "rgba(207, 34, 46, 0.08)",
    "--dsw-alias-state-success-primary": "#1a7f37",
    "--dsw-alias-state-success-secondary": "rgba(26, 127, 55, 0.10)",
    "--dsw-alias-state-warn-primary": "#9a6700",
    "--dsw-alias-state-warn-secondary": "rgba(154, 103, 0, 0.10)",
    "--dsw-alias-state-warn-label": "#9a6700",
    "--dsw-alias-markdown-citation": "#e75480",
    "--dsw-alias-markdown-code-block": "#fbeef2",
    "--dsw-alias-markdown-code-block-banner": "#f6dee6",
    "--dsw-alias-markdown-inline-code": "rgba(231, 84, 128, 0.08)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(231, 84, 128, 0.12)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#b99aa6",
    "--dsw-alias-scrollbar-bg-l1": "#efc9d6",
    "--dsw-alias-scrollbar-bg-l2": "#f6dee6",
    "--dsw-alias-scrollbar-hover-l1": "#d9a3b5",
    "--dsw-alias-scrollbar-hover-l2": "#efc9d6",
    "--dsw-alias-toast-bg": "#ffffff",
    "--dsw-alias-tooltip-bg": "#432635",
    "--dsw-hovercard-bg": "#ffffff",
    "--dsw-specific-sidebar-fill": "#fbeef2",
    "--dsw-specific-sidebar-nav-item-active": "rgba(231, 84, 128, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#e75480",
    "--dsw-specific-sidebar-nav-item-hover": "#f6dee6",
    "--dsw-specific-bubble": "#fbeef2",
    "--dsw-specific-bubble-highlight": "#f6dee6",
    "--dsw-specific-input-major": "#fbeef2",
    "--dsw-specific-login-input": "#fbeef2",
    "--dsw-specific-menu": "#ffffff",
    "--dsw-specific-selector": "#ffffff",
    "--dsw-specific-tip": "#432635",
    /* 柔粉阴影（拟 notional 的 whisper 深度，带一点樱色） */
    "--dsw-shadow-lv1": "0 1px 2px rgba(231, 84, 128, 0.06)",
    "--dsw-shadow-lv2": "0 2px 6px rgba(231, 84, 128, 0.06)",
    "--dsw-shadow-lv3": "0 4px 12px rgba(231, 84, 128, 0.08)",
    "--dsw-shadow-lv1-blur": "2px",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO
  },
  SANS
);
var meta13 = {
  light: {
    id: "sakura-light",
    label: "Sakura \u6A31\u7C89",
    desc: "\u6A31\u767D #fff9fa + \u6A31\u7C89 #e75480",
    swatch: ["#fff9fa", "#fbeef2", "#e75480", "#432635"]
  }
};

// src/host/themes/skeumorphism.ts
var skeumorphism_exports = {};
__export(skeumorphism_exports, {
  light: () => light7,
  meta: () => meta14
});
var light7 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#f7eee6",
    "--dsw-alias-bg-layer-1": "#fff8f1",
    "--dsw-alias-bg-layer-2": "#f2e3d3",
    "--dsw-alias-bg-layer-3": "#ead6c7",
    "--dsw-alias-bg-overlay": "#fff8f1",
    "--dsw-alias-bg-multi-select": "#f2e3d3",
    "--dsw-alias-bg-module-platform": "#fff8f1",
    "--dsw-alias-bg-skeleton": "#f2e3d3",
    "--dsw-alias-border-l1": "#eaded4",
    "--dsw-alias-border-l2": "#dac8b9",
    "--dsw-alias-border-l2-darkmode-thin": "#eaded4",
    "--dsw-alias-border-l3": "#c9b3a1",
    "--dsw-alias-border-l4": "#8a7a70",
    "--dsw-alias-border-inverted": "#2b211c",
    "--dsw-alias-border-inverted2": "#5a4b43",
    "--dsw-alias-separator-primary": "#eaded4",
    "--dsw-alias-fill-l2": "#f2e3d3",
    "--dsw-alias-fill-tsp-secondary": "rgba(43, 33, 28, 0.05)",
    /* 陶釉：品牌指纹 */
    "--dsw-alias-brand-primary": "#b46a46",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#b46a46",
    "--dsw-alias-link": "#b46a46",
    "--dsw-alias-button-primary-fill": "#b46a46",
    "--dsw-alias-button-primary-hover": "#a66240",
    "--dsw-alias-button-primary-dimmed": "#9b5b3c",
    "--dsw-alias-button-contrast-fill": "#2b211c",
    "--dsw-alias-button-elevated-fill": "#fff8f1",
    "--dsw-alias-button-floating-fill": "#fff8f1",
    "--dsw-alias-button-floating-hover": "#f2e3d3",
    "--dsw-alias-button-ghost-active-border": "#dac8b9",
    "--dsw-alias-button-ghost-active-fill": "#f2e3d3",
    "--dsw-alias-button-ghost-active-hover": "#ead6c7",
    "--dsw-alias-button-info-fill": "#b46a46",
    "--dsw-alias-button-info-hover": "#a66240",
    "--dsw-alias-button-tool-bar-fill": "#fff8f1",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#f2e3d3",
    "--dsw-alias-interactive-bg-hover": "#f2e3d3",
    "--dsw-alias-interactive-bg-active": "#ead6c7",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(180, 106, 70, 0.12)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(184, 76, 76, 0.12)",
    "--dsw-alias-interactive-bg-hover-solid": "#ead6c7",
    "--dsw-alias-label-primary": "#2b211c",
    "--dsw-alias-label-secondary": "#5a4b43",
    "--dsw-alias-label-tertiary": "#8a7a70",
    "--dsw-alias-label-quaternary": "#b39d8d",
    "--dsw-alias-label-caption": "#8a7a70",
    "--dsw-alias-label-dimmed": "#b39d8d",
    "--dsw-alias-label-error": "#b84c4c",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#fff8f1",
    "--dsw-alias-label-primary-bluish": "#b46a46",
    "--dsw-alias-state-business-primary": "#b46a46",
    "--dsw-alias-state-business-tertiary": "rgba(180, 106, 70, 0.12)",
    "--dsw-alias-state-error-primary": "#b84c4c",
    "--dsw-alias-state-error-secondary": "rgba(184, 76, 76, 0.10)",
    "--dsw-alias-state-success-primary": "#4d8f5a",
    "--dsw-alias-state-success-secondary": "rgba(77, 143, 90, 0.12)",
    "--dsw-alias-state-warn-primary": "#c88735",
    "--dsw-alias-state-warn-secondary": "rgba(200, 135, 53, 0.12)",
    "--dsw-alias-state-warn-label": "#c88735",
    "--dsw-alias-markdown-citation": "#b46a46",
    "--dsw-alias-markdown-code-block": "#fff8f1",
    "--dsw-alias-markdown-code-block-banner": "#f2e3d3",
    "--dsw-alias-markdown-inline-code": "rgba(180, 106, 70, 0.10)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(180, 106, 70, 0.14)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#b39d8d",
    "--dsw-alias-scrollbar-bg-l1": "#dac8b9",
    "--dsw-alias-scrollbar-bg-l2": "#ead6c7",
    "--dsw-alias-scrollbar-hover-l1": "#b46a46",
    "--dsw-alias-scrollbar-hover-l2": "#dac8b9",
    "--dsw-alias-toast-bg": "#fff8f1",
    "--dsw-alias-tooltip-bg": "#2b211c",
    "--dsw-hovercard-bg": "#fff8f1",
    "--dsw-specific-sidebar-fill": "#f7eee6",
    "--dsw-specific-sidebar-nav-item-active": "rgba(180, 106, 70, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#b46a46",
    "--dsw-specific-sidebar-nav-item-hover": "#f2e3d3",
    "--dsw-specific-bubble": "#fff8f1",
    "--dsw-specific-bubble-highlight": "#f2e3d3",
    "--dsw-specific-input-major": "#fff8f1",
    "--dsw-specific-login-input": "#fff8f1",
    "--dsw-specific-menu": "#fff8f1",
    "--dsw-specific-selector": "#fff8f1",
    "--dsw-specific-tip": "#ead6c7",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    /* 拟物柔和阴影（本主题唯一例外：不用 FLAT_SHADOWS） */
    "--dsw-shadow-lv1": "0 2px 6px rgba(43, 33, 28, 0.12)",
    "--dsw-shadow-lv2": "0 4px 12px rgba(43, 33, 28, 0.12)",
    "--dsw-shadow-lv3": "0 8px 20px rgba(43, 33, 28, 0.12)",
    "--dsw-shadow-lv1-blur": "6px"
  },
  SANS
);
var meta14 = {
  light: {
    id: "skeumorphism-light",
    label: "Skeumorphism \u62DF\u7269\u9676\u571F",
    desc: "\u9676\u571F #f7eee6 + \u9676\u91C9 #b46a46",
    swatch: ["#f7eee6", "#fff8f1", "#b46a46", "#2b211c"]
  }
};

// src/host/themes/wechat.ts
var wechat_exports = {};
__export(wechat_exports, {
  light: () => light8,
  meta: () => meta15
});
var light8 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#ededed",
    "--dsw-alias-bg-layer-1": "#f7f7f7",
    "--dsw-alias-bg-layer-2": "#efefef",
    "--dsw-alias-bg-layer-3": "#e4e4e4",
    "--dsw-alias-bg-overlay": "#ffffff",
    "--dsw-alias-bg-multi-select": "#f7f7f7",
    "--dsw-alias-bg-module-platform": "#f7f7f7",
    "--dsw-alias-bg-skeleton": "#f1f1f1",
    "--dsw-alias-border-l1": "#e0e0e0",
    "--dsw-alias-border-l2": "#c8c8c8",
    "--dsw-alias-border-l2-darkmode-thin": "#e0e0e0",
    "--dsw-alias-border-l3": "#a8a8a8",
    "--dsw-alias-border-l4": "#888888",
    "--dsw-alias-border-inverted": "#1a1a1a",
    "--dsw-alias-border-inverted2": "#1a1a1a",
    "--dsw-alias-separator-primary": "#e0e0e0",
    "--dsw-alias-fill-l2": "#efefef",
    "--dsw-alias-fill-tsp-secondary": "rgba(26, 26, 26, 0.04)",
    /* 微信绿：唯一信号色 */
    "--dsw-alias-brand-primary": "#07c160",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#07c160",
    "--dsw-alias-link": "#07c160",
    "--dsw-alias-button-primary-fill": "#07c160",
    "--dsw-alias-button-primary-hover": "#10b160",
    "--dsw-alias-button-primary-dimmed": "#059050",
    "--dsw-alias-button-contrast-fill": "#1a1a1a",
    "--dsw-alias-button-elevated-fill": "#ffffff",
    "--dsw-alias-button-floating-fill": "#ffffff",
    "--dsw-alias-button-floating-hover": "#f7f7f7",
    "--dsw-alias-button-ghost-active-border": "#c8c8c8",
    "--dsw-alias-button-ghost-active-fill": "#efefef",
    "--dsw-alias-button-ghost-active-hover": "#e4e4e4",
    "--dsw-alias-button-info-fill": "#07c160",
    "--dsw-alias-button-info-hover": "#10b160",
    "--dsw-alias-button-tool-bar-fill": "#f7f7f7",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#efefef",
    "--dsw-alias-interactive-bg-hover": "#f1f1f1",
    "--dsw-alias-interactive-bg-active": "#e4e4e4",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(7, 193, 96, 0.12)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(250, 81, 81, 0.10)",
    "--dsw-alias-interactive-bg-hover-solid": "#e4e4e4",
    "--dsw-alias-label-primary": "#1a1a1a",
    "--dsw-alias-label-secondary": "#1a1a1a",
    "--dsw-alias-label-tertiary": "#888888",
    "--dsw-alias-label-quaternary": "#b2b2b2",
    "--dsw-alias-label-caption": "#888888",
    "--dsw-alias-label-dimmed": "#b2b2b2",
    "--dsw-alias-label-error": "#fa5151",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#ffffff",
    "--dsw-alias-label-primary-bluish": "#07c160",
    "--dsw-alias-state-business-primary": "#07c160",
    "--dsw-alias-state-business-tertiary": "rgba(7, 193, 96, 0.12)",
    /* 微信绿即成功态（green is "done"） */
    "--dsw-alias-state-error-primary": "#fa5151",
    "--dsw-alias-state-error-secondary": "rgba(250, 81, 81, 0.10)",
    "--dsw-alias-state-success-primary": "#07c160",
    "--dsw-alias-state-success-secondary": "rgba(7, 193, 96, 0.12)",
    "--dsw-alias-state-warn-primary": "#fab702",
    "--dsw-alias-state-warn-secondary": "rgba(250, 183, 2, 0.12)",
    "--dsw-alias-state-warn-label": "#9a6700",
    "--dsw-alias-markdown-citation": "#07c160",
    "--dsw-alias-markdown-code-block": "#f7f7f7",
    "--dsw-alias-markdown-code-block-banner": "#efefef",
    "--dsw-alias-markdown-inline-code": "rgba(7, 193, 96, 0.10)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(7, 193, 96, 0.14)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#b2b2b2",
    "--dsw-alias-scrollbar-bg-l1": "#e0e0e0",
    "--dsw-alias-scrollbar-bg-l2": "#efefef",
    "--dsw-alias-scrollbar-hover-l1": "#888888",
    "--dsw-alias-scrollbar-hover-l2": "#e0e0e0",
    "--dsw-alias-toast-bg": "#ffffff",
    "--dsw-alias-tooltip-bg": "#1a1a1a",
    "--dsw-hovercard-bg": "#ffffff",
    "--dsw-specific-sidebar-fill": "#ededed",
    "--dsw-specific-sidebar-nav-item-active": "rgba(7, 193, 96, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#07c160",
    "--dsw-specific-sidebar-nav-item-hover": "#efefef",
    "--dsw-specific-bubble": "#ffffff",
    "--dsw-specific-bubble-highlight": "#f7f7f7",
    "--dsw-specific-input-major": "#f7f7f7",
    "--dsw-specific-login-input": "#f7f7f7",
    "--dsw-specific-menu": "#ffffff",
    "--dsw-specific-selector": "#ffffff",
    "--dsw-specific-tip": "#f7f7f7",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta15 = {
  light: {
    id: "wechat-light",
    label: "WeChat \u5FAE\u4FE1\u7EFF",
    desc: "\u6D45\u7070 #ededed + \u5FAE\u4FE1\u7EFF #07c160",
    swatch: ["#ededed", "#f7f7f7", "#07c160", "#1a1a1a"]
  }
};

// src/host/themes/xiaohongshu.ts
var xiaohongshu_exports = {};
__export(xiaohongshu_exports, {
  light: () => light9,
  meta: () => meta16
});
var light9 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#f5f5f5",
    "--dsw-alias-bg-layer-1": "#ffffff",
    "--dsw-alias-bg-layer-2": "#fafafa",
    "--dsw-alias-bg-layer-3": "#efefef",
    "--dsw-alias-bg-overlay": "#ffffff",
    "--dsw-alias-bg-multi-select": "#fafafa",
    "--dsw-alias-bg-module-platform": "#ffffff",
    "--dsw-alias-bg-skeleton": "#fafafa",
    "--dsw-alias-border-l1": "rgba(0, 0, 0, 0.05)",
    "--dsw-alias-border-l2": "rgba(0, 0, 0, 0.08)",
    "--dsw-alias-border-l2-darkmode-thin": "rgba(0, 0, 0, 0.05)",
    "--dsw-alias-border-l3": "rgba(0, 0, 0, 0.20)",
    "--dsw-alias-border-l4": "rgba(0, 0, 0, 0.27)",
    "--dsw-alias-border-inverted": "rgba(0, 0, 0, 0.8)",
    "--dsw-alias-border-inverted2": "rgba(0, 0, 0, 0.62)",
    "--dsw-alias-separator-primary": "rgba(0, 0, 0, 0.05)",
    "--dsw-alias-fill-l2": "rgba(0, 0, 0, 0.05)",
    "--dsw-alias-fill-tsp-secondary": "rgba(0, 0, 0, 0.04)",
    /* 种草红：唯一饱和色 */
    "--dsw-alias-brand-primary": "#ff2442",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#ff2442",
    "--dsw-alias-link": "#ff2442",
    "--dsw-alias-button-primary-fill": "#ff2442",
    "--dsw-alias-button-primary-hover": "#ff2e4d",
    "--dsw-alias-button-primary-dimmed": "#e6203a",
    "--dsw-alias-button-contrast-fill": "rgba(0, 0, 0, 0.8)",
    "--dsw-alias-button-elevated-fill": "#ffffff",
    "--dsw-alias-button-floating-fill": "#ffffff",
    "--dsw-alias-button-floating-hover": "#fafafa",
    "--dsw-alias-button-ghost-active-border": "rgba(0, 0, 0, 0.08)",
    "--dsw-alias-button-ghost-active-fill": "#fafafa",
    "--dsw-alias-button-ghost-active-hover": "#efefef",
    "--dsw-alias-button-info-fill": "#ff2442",
    "--dsw-alias-button-info-hover": "#ff2e4d",
    "--dsw-alias-button-tool-bar-fill": "#ffffff",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#fafafa",
    "--dsw-alias-interactive-bg-hover": "#fafafa",
    "--dsw-alias-interactive-bg-active": "#f0f0f0",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(255, 36, 66, 0.10)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(255, 36, 66, 0.10)",
    "--dsw-alias-interactive-bg-hover-solid": "#f0f0f0",
    "--dsw-alias-label-primary": "rgba(0, 0, 0, 0.8)",
    "--dsw-alias-label-secondary": "rgba(0, 0, 0, 0.62)",
    "--dsw-alias-label-tertiary": "rgba(0, 0, 0, 0.45)",
    "--dsw-alias-label-quaternary": "rgba(0, 0, 0, 0.27)",
    "--dsw-alias-label-caption": "rgba(0, 0, 0, 0.45)",
    "--dsw-alias-label-dimmed": "rgba(0, 0, 0, 0.27)",
    "--dsw-alias-label-error": "#ff2442",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#ffffff",
    "--dsw-alias-label-primary-bluish": "#ff2442",
    "--dsw-alias-state-business-primary": "#ff2442",
    "--dsw-alias-state-business-tertiary": "rgba(255, 36, 66, 0.10)",
    /* 危险态复用品牌红（官方明确决策） */
    "--dsw-alias-state-error-primary": "#ff2442",
    "--dsw-alias-state-error-secondary": "rgba(255, 36, 66, 0.10)",
    "--dsw-alias-state-success-primary": "#02b940",
    "--dsw-alias-state-success-secondary": "rgba(2, 185, 64, 0.10)",
    "--dsw-alias-state-warn-primary": "#ff7d03",
    "--dsw-alias-state-warn-secondary": "rgba(255, 125, 3, 0.10)",
    "--dsw-alias-state-warn-label": "#9a6700",
    "--dsw-alias-markdown-citation": "#ff2442",
    "--dsw-alias-markdown-code-block": "#ffffff",
    "--dsw-alias-markdown-code-block-banner": "#fafafa",
    "--dsw-alias-markdown-inline-code": "rgba(255, 36, 66, 0.08)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(255, 36, 66, 0.12)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "rgba(0, 0, 0, 0.27)",
    "--dsw-alias-scrollbar-bg-l1": "rgba(0, 0, 0, 0.08)",
    "--dsw-alias-scrollbar-bg-l2": "#f0f0f0",
    "--dsw-alias-scrollbar-hover-l1": "rgba(0, 0, 0, 0.27)",
    "--dsw-alias-scrollbar-hover-l2": "rgba(0, 0, 0, 0.08)",
    "--dsw-alias-toast-bg": "#ffffff",
    "--dsw-alias-tooltip-bg": "rgba(0, 0, 0, 0.8)",
    "--dsw-hovercard-bg": "#ffffff",
    "--dsw-specific-sidebar-fill": "#f5f5f5",
    "--dsw-specific-sidebar-nav-item-active": "rgba(255, 36, 66, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#ff2442",
    "--dsw-specific-sidebar-nav-item-hover": "#fafafa",
    "--dsw-specific-bubble": "#ffffff",
    "--dsw-specific-bubble-highlight": "#fafafa",
    "--dsw-specific-input-major": "#ffffff",
    "--dsw-specific-login-input": "#ffffff",
    "--dsw-specific-menu": "#ffffff",
    "--dsw-specific-selector": "#ffffff",
    "--dsw-specific-tip": "#fafafa",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta16 = {
  light: {
    id: "xiaohongshu-light",
    label: "\u5C0F\u7EA2\u4E66 \u79CD\u8349\u7EA2",
    desc: "\u7C73\u7070 #f5f5f5 + \u79CD\u8349\u7EA2 #ff2442",
    swatch: ["#f5f5f5", "#ffffff", "#ff2442", "rgba(0, 0, 0, 0.8)"]
  }
};

// src/host/themes/neobrutalism.ts
var neobrutalism_exports = {};
__export(neobrutalism_exports, {
  light: () => light10,
  meta: () => meta17
});
var light10 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#fff4cf",
    "--dsw-alias-bg-layer-1": "#fffaf0",
    "--dsw-alias-bg-layer-2": "#ffe8c2",
    "--dsw-alias-bg-layer-3": "#ffdca8",
    "--dsw-alias-bg-overlay": "#fffaf0",
    "--dsw-alias-bg-multi-select": "#fffaf0",
    "--dsw-alias-bg-module-platform": "#fffaf0",
    "--dsw-alias-bg-skeleton": "#fffaf0",
    "--dsw-alias-border-l1": "#efd0ab",
    "--dsw-alias-border-l2": "#d9aa7a",
    "--dsw-alias-border-l2-darkmode-thin": "#efd0ab",
    "--dsw-alias-border-l3": "#bd8f60",
    "--dsw-alias-border-l4": "#8a6652",
    "--dsw-alias-border-inverted": "#2a1810",
    "--dsw-alias-border-inverted2": "#593625",
    "--dsw-alias-separator-primary": "#efd0ab",
    "--dsw-alias-fill-l2": "#ffe8c2",
    "--dsw-alias-fill-tsp-secondary": "rgba(42, 24, 16, 0.04)",
    /* 橘红：CTA 与激活信号 */
    "--dsw-alias-brand-primary": "#d24b1f",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#d24b1f",
    "--dsw-alias-link": "#d24b1f",
    "--dsw-alias-button-primary-fill": "#d24b1f",
    "--dsw-alias-button-primary-hover": "#c1451d",
    "--dsw-alias-button-primary-dimmed": "#b5411b",
    "--dsw-alias-button-contrast-fill": "#2a1810",
    "--dsw-alias-button-elevated-fill": "#fffaf0",
    "--dsw-alias-button-floating-fill": "#fffaf0",
    "--dsw-alias-button-floating-hover": "#ffe8c2",
    "--dsw-alias-button-ghost-active-border": "#d9aa7a",
    "--dsw-alias-button-ghost-active-fill": "#ffe8c2",
    "--dsw-alias-button-ghost-active-hover": "#ffdca8",
    "--dsw-alias-button-info-fill": "#d24b1f",
    "--dsw-alias-button-info-hover": "#c1451d",
    "--dsw-alias-button-tool-bar-fill": "#fffaf0",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#ffe8c2",
    "--dsw-alias-interactive-bg-hover": "#ffe8c2",
    "--dsw-alias-interactive-bg-active": "#ffdca8",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(210, 75, 31, 0.10)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(184, 58, 47, 0.08)",
    "--dsw-alias-interactive-bg-hover-solid": "#ffdca8",
    "--dsw-alias-label-primary": "#2a1810",
    "--dsw-alias-label-secondary": "#593625",
    "--dsw-alias-label-tertiary": "#8a6652",
    "--dsw-alias-label-quaternary": "#bd8f60",
    "--dsw-alias-label-caption": "#8a6652",
    "--dsw-alias-label-dimmed": "#bd8f60",
    "--dsw-alias-label-error": "#b83a2f",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#fffaf0",
    "--dsw-alias-label-primary-bluish": "#d24b1f",
    "--dsw-alias-state-business-primary": "#d24b1f",
    "--dsw-alias-state-business-tertiary": "rgba(210, 75, 31, 0.10)",
    /* 警示琥珀在奶油底上压暗，保证文字可读 */
    "--dsw-alias-state-error-primary": "#b83a2f",
    "--dsw-alias-state-error-secondary": "rgba(184, 58, 47, 0.08)",
    "--dsw-alias-state-success-primary": "#3d8f4f",
    "--dsw-alias-state-success-secondary": "rgba(61, 143, 79, 0.10)",
    "--dsw-alias-state-warn-primary": "#9a6700",
    "--dsw-alias-state-warn-secondary": "rgba(242, 169, 59, 0.10)",
    "--dsw-alias-state-warn-label": "#9a6700",
    "--dsw-alias-markdown-citation": "#d24b1f",
    "--dsw-alias-markdown-code-block": "#fffaf0",
    "--dsw-alias-markdown-code-block-banner": "#ffe8c2",
    "--dsw-alias-markdown-inline-code": "rgba(210, 75, 31, 0.08)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(210, 75, 31, 0.12)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#bd8f60",
    "--dsw-alias-scrollbar-bg-l1": "#d9aa7a",
    "--dsw-alias-scrollbar-bg-l2": "#ffe8c2",
    "--dsw-alias-scrollbar-hover-l1": "#bd8f60",
    "--dsw-alias-scrollbar-hover-l2": "#d9aa7a",
    "--dsw-alias-toast-bg": "#fffaf0",
    "--dsw-alias-tooltip-bg": "#2a1810",
    "--dsw-hovercard-bg": "#fffaf0",
    "--dsw-specific-sidebar-fill": "#fff4cf",
    "--dsw-specific-sidebar-nav-item-active": "rgba(210, 75, 31, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#d24b1f",
    "--dsw-specific-sidebar-nav-item-hover": "#ffe8c2",
    "--dsw-specific-bubble": "#fffaf0",
    "--dsw-specific-bubble-highlight": "#ffe8c2",
    "--dsw-specific-input-major": "#fffaf0",
    "--dsw-specific-login-input": "#fffaf0",
    "--dsw-specific-menu": "#fffaf0",
    "--dsw-specific-selector": "#fffaf0",
    "--dsw-specific-tip": "#2a1810",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    /* 唯一的阴影例外：硬偏移实色投影，三档由浅入深 */
    "--dsw-shadow-lv1": "3px 3px 0 #2a1810",
    "--dsw-shadow-lv2": "5px 5px 0 #2a1810",
    "--dsw-shadow-lv3": "8px 8px 0 #2a1810",
    "--dsw-shadow-lv1-blur": "0px"
  },
  SANS
);
var meta17 = {
  light: {
    id: "neobrutalism-light",
    label: "Neobrutalism \u7C97\u91CE\u62FC\u8D34",
    desc: "\u5976\u6CB9 #fff4cf + \u6A58\u7EA2 #d24b1f",
    swatch: ["#fff4cf", "#fffaf0", "#d24b1f", "#2a1810"]
  }
};

// src/host/themes/missioncontrol.ts
var missioncontrol_exports = {};
__export(missioncontrol_exports, {
  dark: () => dark10,
  meta: () => meta18
});
var dark10 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#090b12",
    "--dsw-alias-bg-layer-1": "#121722",
    "--dsw-alias-bg-layer-2": "#1b2233",
    "--dsw-alias-bg-layer-3": "#232e42",
    "--dsw-alias-bg-overlay": "#121722",
    "--dsw-alias-bg-multi-select": "#121722",
    "--dsw-alias-bg-module-platform": "#121722",
    "--dsw-alias-bg-skeleton": "#121722",
    "--dsw-alias-border-l1": "#1d2636",
    "--dsw-alias-border-l2": "#2a3447",
    "--dsw-alias-border-l2-darkmode-thin": "#1d2636",
    "--dsw-alias-border-l3": "#3b4a63",
    "--dsw-alias-border-l4": "#5b6b84",
    "--dsw-alias-border-inverted": "#f8fafc",
    "--dsw-alias-border-inverted2": "#cbd5e1",
    "--dsw-alias-separator-primary": "#1d2636",
    "--dsw-alias-fill-l2": "#1b2233",
    "--dsw-alias-fill-tsp-secondary": "rgba(248, 250, 252, 0.05)",
    /* 指挥蓝：主信号 */
    "--dsw-alias-brand-primary": "#60a5fa",
    "--dsw-alias-brand-primary-invert": "#06101d",
    "--dsw-alias-brand-text": "#60a5fa",
    "--dsw-alias-link": "#60a5fa",
    "--dsw-alias-button-primary-fill": "#60a5fa",
    "--dsw-alias-button-primary-hover": "#5898e6",
    "--dsw-alias-button-primary-dimmed": "#538ed7",
    "--dsw-alias-button-contrast-fill": "#f8fafc",
    "--dsw-alias-button-elevated-fill": "#121722",
    "--dsw-alias-button-floating-fill": "#121722",
    "--dsw-alias-button-floating-hover": "#1b2233",
    "--dsw-alias-button-ghost-active-border": "#60a5fa",
    "--dsw-alias-button-ghost-active-fill": "#1b2233",
    "--dsw-alias-button-ghost-active-hover": "#232e42",
    "--dsw-alias-button-info-fill": "#00d4ff",
    "--dsw-alias-button-info-hover": "#1adcff",
    "--dsw-alias-button-tool-bar-fill": "#121722",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#1b2233",
    "--dsw-alias-interactive-bg-hover": "#0e1420",
    "--dsw-alias-interactive-bg-active": "#1b2233",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(96, 165, 250, 0.15)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(251, 113, 133, 0.15)",
    "--dsw-alias-interactive-bg-hover-solid": "#1b2233",
    "--dsw-alias-label-primary": "#f8fafc",
    "--dsw-alias-label-secondary": "#cbd5e1",
    "--dsw-alias-label-tertiary": "#94a3b8",
    "--dsw-alias-label-quaternary": "#64748f",
    "--dsw-alias-label-caption": "#94a3b8",
    "--dsw-alias-label-dimmed": "#64748f",
    "--dsw-alias-label-error": "#fb7185",
    "--dsw-alias-label-primary-foreground": "#f8fafc",
    "--dsw-alias-label-primary-inverted": "#090b12",
    "--dsw-alias-label-primary-bluish": "#60a5fa",
    "--dsw-alias-state-business-primary": "#60a5fa",
    "--dsw-alias-state-business-tertiary": "rgba(96, 165, 250, 0.15)",
    "--dsw-alias-state-error-primary": "#fb7185",
    "--dsw-alias-state-error-secondary": "rgba(251, 113, 133, 0.15)",
    "--dsw-alias-state-success-primary": "#22c55e",
    "--dsw-alias-state-success-secondary": "rgba(34, 197, 94, 0.15)",
    "--dsw-alias-state-warn-primary": "#fbbf24",
    "--dsw-alias-state-warn-secondary": "rgba(251, 191, 36, 0.15)",
    "--dsw-alias-state-warn-label": "#fbbf24",
    "--dsw-alias-markdown-citation": "#60a5fa",
    "--dsw-alias-markdown-code-block": "#121722",
    "--dsw-alias-markdown-code-block-banner": "#1b2233",
    "--dsw-alias-markdown-inline-code": "rgba(96, 165, 250, 0.10)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(96, 165, 250, 0.18)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#64748f",
    "--dsw-alias-scrollbar-bg-l1": "#2a3447",
    "--dsw-alias-scrollbar-bg-l2": "#1b2233",
    "--dsw-alias-scrollbar-hover-l1": "#3b4a63",
    "--dsw-alias-scrollbar-hover-l2": "#2a3447",
    "--dsw-alias-toast-bg": "#121722",
    "--dsw-alias-tooltip-bg": "#232e42",
    "--dsw-hovercard-bg": "#1b2233",
    "--dsw-specific-sidebar-fill": "#090b12",
    "--dsw-specific-sidebar-nav-item-active": "rgba(96, 165, 250, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#60a5fa",
    "--dsw-specific-sidebar-nav-item-hover": "#0e1420",
    "--dsw-specific-bubble": "#121722",
    "--dsw-specific-bubble-highlight": "#1b2233",
    "--dsw-specific-input-major": "#121722",
    "--dsw-specific-login-input": "#121722",
    "--dsw-specific-menu": "#1b2233",
    "--dsw-specific-selector": "#1b2233",
    "--dsw-specific-tip": "#232e42",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta18 = {
  dark: {
    id: "mission-control-dark",
    label: "Mission Control \u6DF1\u7A7A",
    desc: "\u6DF1\u7A7A #090b12 + \u6307\u6325\u84DD #60a5fa",
    swatch: ["#090b12", "#121722", "#60a5fa", "#f8fafc"]
  }
};

// src/host/themes/levels.ts
var levels_exports = {};
__export(levels_exports, {
  light: () => light11,
  meta: () => meta19
});
var light11 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#fbf7ef",
    "--dsw-alias-bg-layer-1": "#ffffff",
    "--dsw-alias-bg-layer-2": "#eef7ed",
    "--dsw-alias-bg-layer-3": "#e2ecdf",
    "--dsw-alias-bg-overlay": "#ffffff",
    "--dsw-alias-bg-multi-select": "#ffffff",
    "--dsw-alias-bg-module-platform": "#ffffff",
    "--dsw-alias-bg-skeleton": "#ffffff",
    "--dsw-alias-border-l1": "#edf1ea",
    "--dsw-alias-border-l2": "#dbe3d7",
    "--dsw-alias-border-l2-darkmode-thin": "#edf1ea",
    "--dsw-alias-border-l3": "#a3b89d",
    "--dsw-alias-border-l4": "#788276",
    "--dsw-alias-border-inverted": "#1f2a24",
    "--dsw-alias-border-inverted2": "#435147",
    "--dsw-alias-separator-primary": "#edf1ea",
    "--dsw-alias-fill-l2": "#eef7ed",
    "--dsw-alias-fill-tsp-secondary": "rgba(31, 42, 36, 0.04)",
    /* 代谢绿：CTA 与健康信号 */
    "--dsw-alias-brand-primary": "#2f8f46",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#2f8f46",
    "--dsw-alias-link": "#2f8f46",
    "--dsw-alias-button-primary-fill": "#2f8f46",
    "--dsw-alias-button-primary-hover": "#2b8440",
    "--dsw-alias-button-primary-dimmed": "#287b3c",
    "--dsw-alias-button-contrast-fill": "#1f2a24",
    "--dsw-alias-button-elevated-fill": "#ffffff",
    "--dsw-alias-button-floating-fill": "#ffffff",
    "--dsw-alias-button-floating-hover": "#eef7ed",
    "--dsw-alias-button-ghost-active-border": "#dbe3d7",
    "--dsw-alias-button-ghost-active-fill": "#eef7ed",
    "--dsw-alias-button-ghost-active-hover": "#e2ecdf",
    "--dsw-alias-button-info-fill": "#2f8f46",
    "--dsw-alias-button-info-hover": "#2b8440",
    "--dsw-alias-button-tool-bar-fill": "#ffffff",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#eef7ed",
    "--dsw-alias-interactive-bg-hover": "#eef7ed",
    "--dsw-alias-interactive-bg-active": "#e2ecdf",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(47, 143, 70, 0.10)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(220, 38, 38, 0.08)",
    "--dsw-alias-interactive-bg-hover-solid": "#e2ecdf",
    "--dsw-alias-label-primary": "#1f2a24",
    "--dsw-alias-label-secondary": "#435147",
    "--dsw-alias-label-tertiary": "#788276",
    "--dsw-alias-label-quaternary": "#a3b89d",
    "--dsw-alias-label-caption": "#788276",
    "--dsw-alias-label-dimmed": "#a3b89d",
    "--dsw-alias-label-error": "#dc2626",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#ffffff",
    "--dsw-alias-label-primary-bluish": "#2f8f46",
    "--dsw-alias-state-business-primary": "#2f8f46",
    "--dsw-alias-state-business-tertiary": "rgba(47, 143, 70, 0.10)",
    "--dsw-alias-state-error-primary": "#dc2626",
    "--dsw-alias-state-error-secondary": "rgba(220, 38, 38, 0.08)",
    "--dsw-alias-state-success-primary": "#16a34a",
    "--dsw-alias-state-success-secondary": "rgba(22, 163, 74, 0.10)",
    "--dsw-alias-state-warn-primary": "#d97706",
    "--dsw-alias-state-warn-secondary": "rgba(217, 119, 6, 0.10)",
    "--dsw-alias-state-warn-label": "#d97706",
    "--dsw-alias-markdown-citation": "#2f8f46",
    "--dsw-alias-markdown-code-block": "#ffffff",
    "--dsw-alias-markdown-code-block-banner": "#eef7ed",
    "--dsw-alias-markdown-inline-code": "rgba(47, 143, 70, 0.08)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(47, 143, 70, 0.12)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#a3b89d",
    "--dsw-alias-scrollbar-bg-l1": "#dbe3d7",
    "--dsw-alias-scrollbar-bg-l2": "#e2ecdf",
    "--dsw-alias-scrollbar-hover-l1": "#a3b89d",
    "--dsw-alias-scrollbar-hover-l2": "#dbe3d7",
    "--dsw-alias-toast-bg": "#ffffff",
    "--dsw-alias-tooltip-bg": "#1f2a24",
    "--dsw-hovercard-bg": "#ffffff",
    "--dsw-specific-sidebar-fill": "#fbf7ef",
    "--dsw-specific-sidebar-nav-item-active": "rgba(47, 143, 70, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#2f8f46",
    "--dsw-specific-sidebar-nav-item-hover": "#eef7ed",
    "--dsw-specific-bubble": "#ffffff",
    "--dsw-specific-bubble-highlight": "#eef7ed",
    "--dsw-specific-input-major": "#ffffff",
    "--dsw-specific-login-input": "#ffffff",
    "--dsw-specific-menu": "#ffffff",
    "--dsw-specific-selector": "#ffffff",
    "--dsw-specific-tip": "#1f2a24",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta19 = {
  light: {
    id: "levels-light",
    label: "Levels \u7EB8\u611F\u8BC4\u5BA1",
    desc: "\u7C73\u7EB8 #fbf7ef + \u4EE3\u8C22\u7EFF #2f8f46",
    swatch: ["#fbf7ef", "#ffffff", "#2f8f46", "#1f2a24"]
  }
};

// src/host/themes/arc.ts
var arc_exports = {};
__export(arc_exports, {
  light: () => light12,
  meta: () => meta20
});
var light12 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#fdf3ec",
    "--dsw-alias-bg-layer-1": "#ffffff",
    "--dsw-alias-bg-layer-2": "#fff4ea",
    "--dsw-alias-bg-layer-3": "#fbe7d8",
    "--dsw-alias-bg-overlay": "#ffffff",
    "--dsw-alias-bg-multi-select": "#ffffff",
    "--dsw-alias-bg-module-platform": "#ffffff",
    "--dsw-alias-bg-skeleton": "#ffffff",
    "--dsw-alias-border-l1": "#f6f0e8",
    "--dsw-alias-border-l2": "#ece5db",
    "--dsw-alias-border-l2-darkmode-thin": "#f6f0e8",
    "--dsw-alias-border-l3": "#d3c2ae",
    "--dsw-alias-border-l4": "#8c8c93",
    "--dsw-alias-border-inverted": "#1a1a1f",
    "--dsw-alias-border-inverted2": "#54545a",
    "--dsw-alias-separator-primary": "#f6f0e8",
    "--dsw-alias-fill-l2": "#fff4ea",
    "--dsw-alias-fill-tsp-secondary": "rgba(26, 26, 31, 0.04)",
    /* 珊瑚：营销主色，CTA 与高光 */
    "--dsw-alias-brand-primary": "#ff5f5f",
    "--dsw-alias-brand-primary-invert": "#ffffff",
    "--dsw-alias-brand-text": "#ff5f5f",
    "--dsw-alias-link": "#ff5f5f",
    "--dsw-alias-button-primary-fill": "#ff5f5f",
    "--dsw-alias-button-primary-hover": "#eb5757",
    "--dsw-alias-button-primary-dimmed": "#db5252",
    "--dsw-alias-button-contrast-fill": "#1a1a1f",
    "--dsw-alias-button-elevated-fill": "#ffffff",
    "--dsw-alias-button-floating-fill": "#ffffff",
    "--dsw-alias-button-floating-hover": "#fff4ea",
    "--dsw-alias-button-ghost-active-border": "#ece5db",
    "--dsw-alias-button-ghost-active-fill": "#fff4ea",
    "--dsw-alias-button-ghost-active-hover": "#fbe7d8",
    "--dsw-alias-button-info-fill": "#ff5f5f",
    "--dsw-alias-button-info-hover": "#eb5757",
    "--dsw-alias-button-tool-bar-fill": "#ffffff",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#fff4ea",
    "--dsw-alias-interactive-bg-hover": "#fff4ea",
    "--dsw-alias-interactive-bg-active": "#fbe7d8",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(255, 95, 95, 0.10)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(245, 101, 101, 0.08)",
    "--dsw-alias-interactive-bg-hover-solid": "#fbe7d8",
    "--dsw-alias-label-primary": "#1a1a1f",
    "--dsw-alias-label-secondary": "#54545a",
    "--dsw-alias-label-tertiary": "#8c8c93",
    "--dsw-alias-label-quaternary": "#d3c2ae",
    "--dsw-alias-label-caption": "#8c8c93",
    "--dsw-alias-label-dimmed": "#d3c2ae",
    "--dsw-alias-label-error": "#d94f4f",
    "--dsw-alias-label-primary-foreground": "#ffffff",
    "--dsw-alias-label-primary-inverted": "#ffffff",
    "--dsw-alias-label-primary-bluish": "#ff5f5f",
    "--dsw-alias-state-business-primary": "#ff5f5f",
    "--dsw-alias-state-business-tertiary": "rgba(255, 95, 95, 0.10)",
    /* 高 saturation 的珊瑚/蜜橙在浅底压暗，保证文字可读 */
    "--dsw-alias-state-error-primary": "#d94f4f",
    "--dsw-alias-state-error-secondary": "rgba(245, 101, 101, 0.08)",
    "--dsw-alias-state-success-primary": "#2f9e63",
    "--dsw-alias-state-success-secondary": "rgba(72, 187, 120, 0.10)",
    "--dsw-alias-state-warn-primary": "#9a6700",
    "--dsw-alias-state-warn-secondary": "rgba(246, 173, 85, 0.10)",
    "--dsw-alias-state-warn-label": "#9a6700",
    "--dsw-alias-markdown-citation": "#ff5f5f",
    "--dsw-alias-markdown-code-block": "#ffffff",
    "--dsw-alias-markdown-code-block-banner": "#fff4ea",
    "--dsw-alias-markdown-inline-code": "rgba(255, 95, 95, 0.08)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(255, 95, 95, 0.12)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#d3c2ae",
    "--dsw-alias-scrollbar-bg-l1": "#ece5db",
    "--dsw-alias-scrollbar-bg-l2": "#fbe7d8",
    "--dsw-alias-scrollbar-hover-l1": "#d3c2ae",
    "--dsw-alias-scrollbar-hover-l2": "#ece5db",
    "--dsw-alias-toast-bg": "#ffffff",
    "--dsw-alias-tooltip-bg": "#1a1a1f",
    "--dsw-hovercard-bg": "#ffffff",
    "--dsw-specific-sidebar-fill": "#fdf3ec",
    "--dsw-specific-sidebar-nav-item-active": "rgba(255, 95, 95, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#ff5f5f",
    "--dsw-specific-sidebar-nav-item-hover": "#fff4ea",
    "--dsw-specific-bubble": "#ffffff",
    "--dsw-specific-bubble-highlight": "#fff4ea",
    "--dsw-specific-input-major": "#ffffff",
    "--dsw-specific-login-input": "#ffffff",
    "--dsw-specific-menu": "#ffffff",
    "--dsw-specific-selector": "#ffffff",
    "--dsw-specific-tip": "#1a1a1f",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta20 = {
  light: {
    id: "arc-light",
    label: "Arc \u871C\u6843\u73CA\u745A",
    desc: "\u871C\u6843 #fdf3ec + \u73CA\u745A #ff5f5f",
    swatch: ["#fdf3ec", "#ffffff", "#ff5f5f", "#1a1a1f"]
  }
};

// src/host/themes/luxury.ts
var luxury_exports = {};
__export(luxury_exports, {
  dark: () => dark11,
  meta: () => meta21
});
var dark11 = fillFontTokens(
  {
    "--dsw-alias-bg-base": "#080706",
    "--dsw-alias-bg-layer-1": "#151310",
    "--dsw-alias-bg-layer-2": "#241e14",
    "--dsw-alias-bg-layer-3": "#322917",
    "--dsw-alias-bg-overlay": "#151310",
    "--dsw-alias-bg-multi-select": "#151310",
    "--dsw-alias-bg-module-platform": "#151310",
    "--dsw-alias-bg-skeleton": "#151310",
    "--dsw-alias-border-l1": "#282217",
    "--dsw-alias-border-l2": "#3a3020",
    "--dsw-alias-border-l2-darkmode-thin": "#282217",
    "--dsw-alias-border-l3": "#54432c",
    "--dsw-alias-border-l4": "#77663f",
    "--dsw-alias-border-inverted": "#fff8ea",
    "--dsw-alias-border-inverted2": "#d8cdb7",
    "--dsw-alias-separator-primary": "#282217",
    "--dsw-alias-fill-l2": "#241e14",
    "--dsw-alias-fill-tsp-secondary": "rgba(255, 248, 234, 0.05)",
    /* 鎏金：尊贵信号 */
    "--dsw-alias-brand-primary": "#c6a15b",
    "--dsw-alias-brand-primary-invert": "#080706",
    "--dsw-alias-brand-text": "#c6a15b",
    "--dsw-alias-link": "#c6a15b",
    "--dsw-alias-button-primary-fill": "#c6a15b",
    "--dsw-alias-button-primary-hover": "#b69454",
    "--dsw-alias-button-primary-dimmed": "#aa8a4e",
    "--dsw-alias-button-contrast-fill": "#fff8ea",
    "--dsw-alias-button-elevated-fill": "#151310",
    "--dsw-alias-button-floating-fill": "#151310",
    "--dsw-alias-button-floating-hover": "#241e14",
    "--dsw-alias-button-ghost-active-border": "#c6a15b",
    "--dsw-alias-button-ghost-active-fill": "#241e14",
    "--dsw-alias-button-ghost-active-hover": "#322917",
    "--dsw-alias-button-info-fill": "#c6a15b",
    "--dsw-alias-button-info-hover": "#b69454",
    "--dsw-alias-button-tool-bar-fill": "#151310",
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": "#241e14",
    "--dsw-alias-interactive-bg-hover": "#100e0a",
    "--dsw-alias-interactive-bg-active": "#241e14",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(198, 161, 91, 0.15)",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(216, 90, 82, 0.15)",
    "--dsw-alias-interactive-bg-hover-solid": "#241e14",
    "--dsw-alias-label-primary": "#fff8ea",
    "--dsw-alias-label-secondary": "#d8cdb7",
    "--dsw-alias-label-tertiary": "#9f927c",
    "--dsw-alias-label-quaternary": "#6f6350",
    "--dsw-alias-label-caption": "#9f927c",
    "--dsw-alias-label-dimmed": "#6f6350",
    "--dsw-alias-label-error": "#d85a52",
    "--dsw-alias-label-primary-foreground": "#fff8ea",
    "--dsw-alias-label-primary-inverted": "#080706",
    "--dsw-alias-label-primary-bluish": "#c6a15b",
    "--dsw-alias-state-business-primary": "#c6a15b",
    "--dsw-alias-state-business-tertiary": "rgba(198, 161, 91, 0.15)",
    "--dsw-alias-state-error-primary": "#d85a52",
    "--dsw-alias-state-error-secondary": "rgba(216, 90, 82, 0.15)",
    "--dsw-alias-state-success-primary": "#5fa36a",
    "--dsw-alias-state-success-secondary": "rgba(95, 163, 106, 0.15)",
    "--dsw-alias-state-warn-primary": "#d8a94f",
    "--dsw-alias-state-warn-secondary": "rgba(216, 169, 79, 0.15)",
    "--dsw-alias-state-warn-label": "#d8a94f",
    "--dsw-alias-markdown-citation": "#c6a15b",
    "--dsw-alias-markdown-code-block": "#151310",
    "--dsw-alias-markdown-code-block-banner": "#241e14",
    "--dsw-alias-markdown-inline-code": "rgba(198, 161, 91, 0.10)",
    "--dsw-alias-markdown-code-segment-selected": "rgba(198, 161, 91, 0.18)",
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": "#6f6350",
    "--dsw-alias-scrollbar-bg-l1": "#3a3020",
    "--dsw-alias-scrollbar-bg-l2": "#241e14",
    "--dsw-alias-scrollbar-hover-l1": "#54432c",
    "--dsw-alias-scrollbar-hover-l2": "#3a3020",
    "--dsw-alias-toast-bg": "#151310",
    "--dsw-alias-tooltip-bg": "#322917",
    "--dsw-hovercard-bg": "#241e14",
    "--dsw-specific-sidebar-fill": "#080706",
    "--dsw-specific-sidebar-nav-item-active": "rgba(198, 161, 91, 0.22)",
    "--dsw-specific-sidebar-nav-item-active-accent": "#c6a15b",
    "--dsw-specific-sidebar-nav-item-hover": "#100e0a",
    "--dsw-specific-bubble": "#151310",
    "--dsw-specific-bubble-highlight": "#241e14",
    "--dsw-specific-input-major": "#151310",
    "--dsw-specific-login-input": "#151310",
    "--dsw-specific-menu": "#241e14",
    "--dsw-specific-selector": "#241e14",
    "--dsw-specific-tip": "#322917",
    "--dsw-font-family": SANS,
    "--dsw-font-mono": MONO,
    ...FLAT_SHADOWS
  },
  SANS
);
var meta21 = {
  dark: {
    id: "luxury-dark",
    label: "Luxury \u938F\u91D1\u9ED1",
    desc: "\u66DC\u77F3 #080706 + \u938F\u91D1 #c6a15b",
    swatch: ["#080706", "#151310", "#c6a15b", "#fff8ea"]
  }
};

// src/host/themes/index.ts
function expand(module) {
  const entries = [];
  for (const scheme of ["dark", "light"]) {
    const tokens = scheme === "dark" ? module.dark : module.light;
    const meta22 = scheme === "dark" ? module.meta?.dark : module.meta?.light;
    if (!tokens || !meta22) continue;
    entries.push({ colorScheme: scheme, tokens, ...meta22 });
  }
  return entries;
}
var THEME_CATALOG = [
  ...expand(opencode_exports),
  ...expand(github_exports),
  ...expand(linear_exports),
  ...expand(notion_exports),
  ...expand(claude_exports),
  ...expand(nvidia_exports),
  ...expand(replicate_exports),
  ...expand(cisco_exports),
  ...expand(neobrutalism_exports),
  ...expand(missioncontrol_exports),
  ...expand(levels_exports),
  ...expand(arc_exports),
  ...expand(luxury_exports),
  ...expand(skeumorphism_exports),
  ...expand(wechat_exports),
  ...expand(xiaohongshu_exports),
  ...expand(discord_exports),
  ...expand(supabase_exports),
  ...expand(nebula_exports),
  ...expand(sakura_exports),
  ...expand(tide_exports)
];
var THEME_IDS = THEME_CATALOG.map((t) => t.id);

// src/host/http.ts
var NAMESPACE_PATTERN = /^[a-z][a-z0-9-]*$/;
function settingsNamespace(value) {
  if (!NAMESPACE_PATTERN.test(value)) {
    throw new TypeError(`settings namespace "${value}" must match ${String(NAMESPACE_PATTERN)}`);
  }
  return value;
}
function json(res, status, value) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(value));
}
function sameOrigin(req) {
  const rawOrigin = req.headers["origin"];
  const origin = typeof rawOrigin === "string" ? rawOrigin : void 0;
  if (origin === void 0) return true;
  const rawHost = req.headers["host"];
  const host = typeof rawHost === "string" ? rawHost : "";
  return origin === `http://${host}` || origin === `https://${host}`;
}
function readBody(req, limit = 1024 * 1024) {
  return new Promise((resolve2, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("payload-too-large"));
        try {
          req.destroy();
        } catch {
        }
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve2(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

// src/host/config.ts
var NS = settingsNamespace("dshp-web-style");
var PHOTO_THEME_ID = "photo:custom";
var KNOWN_THEME_IDS = /* @__PURE__ */ new Set([...THEME_IDS, PHOTO_THEME_ID]);
var DEFAULT_CONFIG = {
  themeId: "",
  photoPalette: null,
  radius: { global: -1 },
  // 背景壁纸（wallpaper.*）与毛玻璃（glass.*）是已退役的旧特性：
  // 当前 client 不再读写它们，这里仅做不透明透传，避免 settings 更新时
  // 丢掉用户 settings.yaml 里的数据。受支持的取色路径是 photoPalette
  //（上传图片 → MD3 动态配色）。
  wallpaper: {},
  glass: {}
};
var ConfigSchema = Schema.object({
  themeId: Schema.string().default(""),
  photoPalette: Schema.union([
    Schema.object({
      accent: Schema.string().pattern(/^#[0-9a-fA-F]{6}$/),
      companionA: Schema.string().pattern(/^#[0-9a-fA-F]{6}$/),
      companionB: Schema.string().pattern(/^#[0-9a-fA-F]{6}$/)
    }),
    Schema.const(null)
  ]).default(null),
  radius: Schema.object({
    global: Schema.number().step(1).min(-1).max(24).default(-1)
  }).default({ global: -1 }),
  wallpaper: Schema.dict(Schema.any()).default({}),
  glass: Schema.dict(Schema.any()).default({})
});
var HEX6 = /^#[0-9a-fA-F]{6}$/;
function isRecord(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function sanitizeThemeId(value) {
  if (typeof value !== "string") return "";
  const v = value.trim();
  return KNOWN_THEME_IDS.has(v) ? v : "";
}
function sanitizePhotoPalette(value) {
  if (value === null) return null;
  if (!isRecord(value)) return null;
  const { accent, companionA, companionB } = value;
  if (typeof accent !== "string" || !HEX6.test(accent)) return null;
  if (typeof companionA !== "string" || !HEX6.test(companionA)) return null;
  if (typeof companionB !== "string" || !HEX6.test(companionB)) return null;
  return { accent, companionA, companionB };
}
function sanitizeRadius(value) {
  if (!isRecord(value)) return null;
  const out = {};
  if (Object.hasOwn(value, "global")) {
    const n = Number(value["global"]);
    if (Number.isFinite(n)) out.global = Math.min(24, Math.max(-1, Math.round(n)));
  }
  return Object.keys(out).length > 0 ? out : null;
}
function sanitizeOpaque(value) {
  if (isRecord(value)) return value;
  return {};
}
function sanitizePatchConfig(raw) {
  if (!isRecord(raw)) return null;
  const out = {};
  let touched = false;
  if (typeof raw["themeId"] === "string") {
    out.themeId = sanitizeThemeId(raw["themeId"]);
    touched = true;
  }
  if (Object.hasOwn(raw, "photoPalette")) {
    const pal = sanitizePhotoPalette(raw["photoPalette"]);
    if (pal !== null || raw["photoPalette"] === null) {
      out.photoPalette = pal;
      touched = true;
    }
  }
  const rd = sanitizeRadius(raw["radius"]);
  if (rd && typeof rd.global === "number") {
    out.radius = rd;
    touched = true;
  }
  return touched ? out : null;
}

// src/host/index.ts
var name = "@dshp/web-style";
var inject = ["webServer"];
function apply(ctx, rawConfig) {
  const entry = {
    ...DEFAULT_CONFIG,
    radius: { ...DEFAULT_CONFIG.radius },
    wallpaper: {},
    glass: {}
  };
  const patch = sanitizePatchConfig(rawConfig);
  if (patch) {
    if (patch.themeId !== void 0) entry.themeId = patch.themeId;
    if (patch.photoPalette !== void 0) entry.photoPalette = patch.photoPalette;
    if (patch.radius?.global !== void 0) entry.radius = { ...entry.radius, global: patch.radius.global };
  }
  let current = () => entry;
  ctx.inject(["settings"], (sctx) => {
    sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
      setSource: (src) => {
        current = src;
      },
      onChange: () => {
      }
    });
  });
  function readConfig() {
    try {
      const v = current();
      if (v && typeof v === "object") {
        const rec = v;
        return {
          themeId: typeof rec["themeId"] === "string" ? sanitizeThemeId(rec["themeId"]) : "",
          photoPalette: sanitizePhotoPalette(rec["photoPalette"]),
          radius: rec["radius"] && typeof rec["radius"] === "object" ? rec["radius"] : entry.radius,
          wallpaper: sanitizeOpaque(rec["wallpaper"]),
          glass: sanitizeOpaque(rec["glass"])
        };
      }
    } catch {
    }
    return { ...entry, radius: { ...entry.radius } };
  }
  function snapshot() {
    const cfg = readConfig();
    return {
      themeId: cfg.themeId,
      photoPalette: cfg.photoPalette,
      radius: cfg.radius,
      wallpaper: cfg.wallpaper,
      glass: cfg.glass
    };
  }
  async function writeConfig(patchObj) {
    let settings = null;
    try {
      settings = ctx.get("settings");
    } catch {
      settings = null;
    }
    if (!settings) throw new Error("settings \u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u65E0\u6CD5\u6301\u4E45\u5316\u5B9A\u5236 UI \u914D\u7F6E");
    await settings.update(NS, patchObj);
  }
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/ext/dshp-web-style/state",
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        if (req.method !== "GET") return json(res, 405, { ok: false, error: "method not allowed" });
        return json(res, 200, { ok: true, ...snapshot() });
      }
    }),
    "dshp-web-style: state route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/ext/dshp-web-style/themes",
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        if (req.method !== "GET") return json(res, 405, { ok: false, error: "method not allowed" });
        return json(res, 200, { ok: true, count: THEME_CATALOG.length, themes: THEME_CATALOG });
      }
    }),
    "dshp-web-style: themes route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/ext/dshp-web-style/theme",
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        if (req.method !== "POST") return json(res, 405, { ok: false, error: "method not allowed" });
        let body = {};
        try {
          const parsed = JSON.parse(await readBody(req) || "{}");
          body = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
        } catch (e) {
          const msg = String(e?.message ?? e);
          return json(res, 200, {
            ok: false,
            error: msg === "payload-too-large" ? "\u8BF7\u6C42\u4F53\u8FC7\u5927" : "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON"
          });
        }
        const raw = body["themeId"];
        const themeId = sanitizeThemeId(raw);
        if (typeof raw !== "string" || raw.trim().length > 0 && themeId === "") {
          return json(res, 200, { ok: false, error: "\u672A\u77E5\u4E3B\u9898 id\uFF0C\u8BF7\u66F4\u65B0\u63D2\u4EF6\u540E\u91CD\u8BD5" });
        }
        try {
          await writeConfig({ themeId });
          return json(res, 200, { ok: true, ...snapshot() });
        } catch (e) {
          return json(res, 200, { ok: false, error: String(e?.message ?? e) });
        }
      }
    }),
    "dshp-web-style: theme route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/ext/dshp-web-style/config",
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        if (req.method !== "POST") return json(res, 405, { ok: false, error: "method not allowed" });
        let a = {};
        try {
          const parsed = JSON.parse(await readBody(req) || "{}");
          a = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
        } catch (e) {
          const msg = String(e?.message ?? e);
          return json(res, 200, {
            ok: false,
            error: msg === "payload-too-large" ? "\u8BF7\u6C42\u4F53\u8FC7\u5927" : "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON"
          });
        }
        const out = {};
        const rd = sanitizeRadius(a["radius"]);
        if (rd) out.radius = rd;
        if (Object.hasOwn(a, "photoPalette")) {
          const pal = sanitizePhotoPalette(a["photoPalette"]);
          if (pal === null && a["photoPalette"] !== null) {
            return json(res, 200, { ok: false, error: "photoPalette \u975E\u6CD5\uFF08\u9700\u4E09\u4E2A #rrggbb \u8272\u503C\uFF09" });
          }
          out.photoPalette = pal;
        }
        try {
          if (Object.keys(out).length > 0) await writeConfig(out);
          return json(res, 200, { ok: true, ...snapshot() });
        } catch (e) {
          return json(res, 200, { ok: false, error: String(e?.message ?? e) });
        }
      }
    }),
    "dshp-web-style: config route"
  );
}

export { ConfigSchema, NS, THEME_CATALOG, THEME_IDS, apply, inject, name };
