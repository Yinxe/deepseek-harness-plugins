import { existsSync, unlinkSync, renameSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// src/host/index.ts

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
function checkWithinRange(data, meta, description, options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta;
  if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
  if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
  if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
  if (meta.pattern) {
    const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
    if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
  }
  checkWithinRange(data.length, meta, "string length", options);
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
Schema.extend("number", (data, { meta }, options) => {
  if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
  checkWithinRange(data, meta, "number", options);
  const { step } = meta;
  if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
  return [data];
});
Schema.extend("boolean", (data, _, options) => {
  if (typeof data === "boolean") return [data];
  throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
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
  if (value === meta.default) return [value];
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
Schema.extend("array", (data, { inner, meta }, options) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
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
var NS = settingsNamespace("dshp-vision-bridge");
var OLD_SETTINGS_KEY = "vision-bridge";
var PREV_SETTINGS_KEY = "dshp-inx-vision-bridge";
var LEGACY_SETTINGS_KEYS = [PREV_SETTINGS_KEY, OLD_SETTINGS_KEY];
var DEFAULT_CONFIG = {
  enabled: true,
  primary: null,
  fallback: null,
  detail: "auto",
  maxImages: 4,
  promptTemplate: ""
};
var VisionRouteSchema = Schema.object({
  provider: Schema.string().required(),
  model: Schema.string().required()
});
var ConfigSchema = Schema.object({
  enabled: Schema.boolean().default(true),
  primary: Schema.union([VisionRouteSchema, Schema.const(null)]).default(null),
  fallback: Schema.union([VisionRouteSchema, Schema.const(null)]).default(null),
  detail: Schema.union([Schema.const("auto"), Schema.const("low"), Schema.const("high")]).default("auto"),
  maxImages: Schema.number().step(1).min(1).max(8).default(4),
  promptTemplate: Schema.string().default("")
});
function dshHome() {
  try {
    const env = process.env["DSH_HOME"];
    if (typeof env === "string" && env.length > 0) return env;
  } catch {
  }
  try {
    return join(homedir(), ".dsh");
  } catch {
    return "/tmp/.dsh";
  }
}
function legacyConfigPaths() {
  return [join(dshHome(), "storages", "dshp-inx-vision-bridge.json")];
}
function settingsYamlPath() {
  return join(dshHome(), "settings.yaml");
}
function isRecord(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function isDetail(v) {
  return v === "auto" || v === "low" || v === "high";
}
function asRoute(v) {
  if (v === null) return null;
  if (!isRecord(v)) return null;
  if (typeof v["provider"] !== "string" || typeof v["model"] !== "string") return null;
  const provider = v["provider"].slice(0, 120);
  const model = v["model"].slice(0, 200);
  if (!provider || !model) return null;
  return { provider, model };
}
function sanitizePersisted(raw) {
  if (!isRecord(raw)) return null;
  const out = { ...DEFAULT_CONFIG };
  if (typeof raw["enabled"] === "boolean") out.enabled = raw["enabled"];
  if (raw["primary"] === null || isRecord(raw["primary"])) {
    const r = asRoute(raw["primary"]);
    if (raw["primary"] === null) out.primary = null;
    else if (r) out.primary = r;
  }
  if (raw["fallback"] === null || isRecord(raw["fallback"])) {
    if (raw["fallback"] === null) out.fallback = null;
    else {
      const r = asRoute(raw["fallback"]);
      if (r) out.fallback = r;
    }
  }
  if (isDetail(raw["detail"])) out.detail = raw["detail"];
  if (typeof raw["maxImages"] === "number" && Number.isFinite(raw["maxImages"])) {
    const n = Math.floor(raw["maxImages"]);
    if (n >= 1 && n <= 8) out.maxImages = n;
  }
  if (typeof raw["promptTemplate"] === "string") out.promptTemplate = raw["promptTemplate"].slice(0, 2e3);
  return out;
}
function loadPersisted() {
  for (const p of legacyConfigPaths()) {
    try {
      if (!existsSync(p)) continue;
      const text = readFileSync(p, "utf8");
      const cfg = sanitizePersisted(JSON.parse(text));
      if (cfg) return { config: cfg, source: p };
    } catch {
      continue;
    }
  }
  return null;
}
function sanitizePatchConfig(raw) {
  if (!isRecord(raw)) return null;
  const out = {};
  if (Object.hasOwn(raw, "enabled")) out.enabled = raw["enabled"] === true;
  if (Object.hasOwn(raw, "primary")) {
    const v = raw["primary"];
    if (v === null) out.primary = null;
    else {
      const r = asRoute(v);
      if (r) out.primary = r;
    }
  }
  if (Object.hasOwn(raw, "fallback")) {
    const v = raw["fallback"];
    if (v === null) out.fallback = null;
    else {
      const r = asRoute(v);
      if (r) out.fallback = r;
    }
  }
  if (Object.hasOwn(raw, "detail") && isDetail(raw["detail"])) out.detail = raw["detail"];
  if (Object.hasOwn(raw, "maxImages") && typeof raw["maxImages"] === "number" && Number.isFinite(raw["maxImages"])) {
    const n = Math.floor(raw["maxImages"]);
    if (n >= 1 && n <= 8) out.maxImages = n;
  }
  if (Object.hasOwn(raw, "promptTemplate") && typeof raw["promptTemplate"] === "string") {
    out.promptTemplate = raw["promptTemplate"].slice(0, 2e3);
  }
  return out;
}
function migrateYamlNamespaceKey() {
  try {
    const p = settingsYamlPath();
    if (!existsSync(p)) return;
    const text = readFileSync(p, "utf8");
    const lines = text.split("\n");
    const at = (key) => {
      const re = new RegExp(`^${key}:\\s*(#.*)?$`);
      for (let i = 0; i < lines.length; i++) {
        if (re.test(lines[i])) return i;
      }
      return -1;
    };
    const newIdx = at(NS);
    const hit = LEGACY_SETTINGS_KEYS.map((key) => ({ key, idx: at(key) })).find((h) => h.idx >= 0);
    if (!hit) return;
    if (newIdx >= 0) {
      try {
        console.info(
          `[dshp-vision-bridge] settings.yaml \u540C\u65F6\u5B58\u5728 ${hit.key} \u4E0E dshp-vision-bridge\uFF0C\u4EE5\u65B0 key \u4E3A\u51C6\uFF0C\u8BF7\u624B\u52A8\u5220\u9664\u65E7 ${hit.key} \u6BB5\u843D`
        );
      } catch {
      }
      return;
    }
    const m = lines[hit.idx].match(/(#.*)$/);
    lines[hit.idx] = "dshp-vision-bridge:" + (m?.[1] ? " " + m[1] : "");
    writeFileSync(p, lines.join("\n"), "utf8");
    try {
      console.info(`[dshp-vision-bridge] \u5DF2\u5C06 settings.yaml \u9876\u5C42 ${hit.key} \u91CD\u547D\u540D\u4E3A dshp-vision-bridge`);
    } catch {
    }
  } catch (e) {
    try {
      console.warn(
        "[dshp-vision-bridge] settings.yaml \u547D\u540D\u7A7A\u95F4\u91CD\u547D\u540D\u5931\u8D25\uFF1A" + String(e?.message ?? e)
      );
    } catch {
    }
  }
}

// src/host/cache.ts
var MAX_PER_SESSION = 20;
var MAX_SESSIONS = 50;
function isRecord2(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function copyAttachment(a) {
  if (!isRecord2(a)) return null;
  if (typeof a["attachmentId"] !== "string" || typeof a["mediaType"] !== "string") return null;
  if (typeof a["bytes"] !== "number") return null;
  const out = {
    attachmentId: a["attachmentId"],
    mediaType: a["mediaType"],
    bytes: a["bytes"]
  };
  if (typeof a["width"] === "number") out.width = a["width"];
  if (typeof a["height"] === "number") out.height = a["height"];
  if (typeof a["name"] === "string" && a["name"].length > 0) out.name = a["name"].slice(0, 120);
  return out;
}
function walkBlocks(blocks, out) {
  if (!Array.isArray(blocks)) return;
  for (const b of blocks) {
    if (!isRecord2(b)) continue;
    if (b["type"] === "image") {
      const c = copyAttachment(b["attachment"]);
      if (c) out.push(c);
    } else if (b["type"] === "tool-result" && Array.isArray(b["content"])) {
      walkBlocks(b["content"], out);
    }
  }
}
function sessionIdOf(agent) {
  try {
    if (isRecord2(agent)) {
      const s = agent["session"];
      if (isRecord2(s) && typeof s["id"] === "string") return s["id"];
      if (typeof agent["id"] === "string") return agent["id"];
    }
  } catch {
  }
  return void 0;
}
function createImageCache() {
  const imageCache = /* @__PURE__ */ new Map();
  function push2(sessionId, refs) {
    if (typeof sessionId !== "string" || sessionId.length === 0) return;
    if (!Array.isArray(refs) || refs.length === 0) return;
    let list = imageCache.get(sessionId);
    if (!list) {
      list = [];
      imageCache.set(sessionId, list);
    }
    for (const r of refs) list.push(r);
    while (list.length > MAX_PER_SESSION) list.shift();
    while (imageCache.size > MAX_SESSIONS) {
      const it = imageCache.keys().next();
      if (it.done) break;
      imageCache.delete(it.value);
    }
  }
  function get(sessionId) {
    return imageCache.get(sessionId) ?? [];
  }
  return { push: push2, get };
}

// src/host/vision.ts
function isRecord3(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function sameRoute(a, b) {
  if (!a || !b) return false;
  return a.provider === b.provider && a.model === b.model;
}
function candidatesFromSection(sec) {
  const out = [];
  if (!isRecord3(sec)) return out;
  const providers = sec["providers"];
  if (!isRecord3(providers)) return out;
  for (const prov of Object.keys(providers)) {
    const prof = providers[prov];
    if (!isRecord3(prof)) continue;
    const models = prof["models"];
    if (!Array.isArray(models)) continue;
    for (const m of models) {
      if (!isRecord3(m) || typeof m["id"] !== "string" || m["id"].length === 0) continue;
      const input = m["input"];
      if (!Array.isArray(input) || input.indexOf("image") < 0) continue;
      out.push({
        provider: prov,
        model: m["id"],
        name: typeof m["name"] === "string" && m["name"].length > 0 ? m["name"] : m["id"]
      });
    }
  }
  return out;
}
async function listVisionModels(ctx) {
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
  function add(provider, model, name2) {
    if (typeof provider !== "string" || typeof model !== "string") return;
    const key = provider + "/" + model;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push({ provider, model, name: typeof name2 === "string" && name2 ? name2 : model });
  }
  let settings = null;
  try {
    settings = ctx.get("settings");
  } catch {
    settings = null;
  }
  if (settings) {
    for (const ns of ["llm-pi-ai", "llm-deepseek"]) {
      try {
        const sec = settings.get(ns);
        for (const c of candidatesFromSection(sec)) add(c.provider, c.model, c.name);
      } catch {
      }
    }
  }
  let llm = null;
  try {
    llm = ctx.get("llm");
  } catch {
    llm = null;
  }
  if (llm && typeof llm.listProviders === "function") {
    let providers = [];
    try {
      providers = llm.listProviders() ?? [];
    } catch {
      providers = [];
    }
    if (Array.isArray(providers)) {
      for (const prov of providers) {
        const pid = isRecord3(prov) && typeof prov["id"] === "string" ? prov["id"] : void 0;
        if (!pid) continue;
        try {
          if (typeof llm.listModels !== "function") continue;
          const models = await llm.listModels(pid);
          if (!Array.isArray(models)) continue;
          for (const info of models) {
            if (!isRecord3(info)) continue;
            if (typeof info["id"] !== "string" || typeof info["provider"] !== "string") continue;
            const mods = info["inputModalities"];
            if (!Array.isArray(mods) || mods.indexOf("image") < 0) continue;
            add(
              info["provider"],
              info["id"],
              typeof info["name"] === "string" ? info["name"] : info["id"]
            );
          }
        } catch {
        }
      }
    }
  }
  merged.sort((a, b) => {
    if (a.provider < b.provider) return -1;
    if (a.provider > b.provider) return 1;
    if (a.model < b.model) return -1;
    if (a.model > b.model) return 1;
    return 0;
  });
  return merged;
}
async function runOneVision(llm, route, images, question, signal, sessionId, nextId) {
  const content = [];
  for (const img of images) content.push({ type: "image", attachment: img });
  content.push({ type: "text", text: question });
  const messages = [
    {
      id: nextId("vision-msg"),
      role: "user",
      content,
      source: { kind: "user" }
    }
  ];
  const opts = { provider: route.provider, model: route.model, messages };
  if (typeof sessionId === "string" && sessionId.length > 0) {
    try {
      opts["sessionId"] = sessionId;
    } catch {
    }
  }
  if (signal && typeof signal === "object" && signal.aborted !== true) {
    try {
      opts["signal"] = signal;
    } catch {
    }
  }
  let out = "";
  let sawDelta = false;
  const stream = llm.stream(opts);
  for await (const chunk of stream) {
    if (!chunk || typeof chunk !== "object") continue;
    if (chunk["type"] === "text-delta" && typeof chunk["text"] === "string") {
      sawDelta = true;
      out += chunk["text"];
    } else if (chunk["type"] === "block-end" && isRecord3(chunk["block"]) && chunk["block"]["type"] === "text") {
      if (!sawDelta && typeof chunk["block"]["text"] === "string") out += chunk["block"]["text"];
    } else if (chunk["type"] === "finish" && isRecord3(chunk["reason"])) {
      const kind = chunk["reason"]["kind"];
      if (kind === "error") {
        const failure = chunk["reason"]["failure"];
        const msg = (isRecord3(failure) && typeof failure["message"] === "string" ? failure["message"] : "\u89C6\u89C9\u6A21\u578B\u8C03\u7528\u5931\u8D25").slice(0, 500);
        throw new Error(String(msg));
      }
      if (kind === "aborted") throw new Error("\u89C6\u89C9\u6A21\u578B\u8C03\u7528\u88AB\u4E2D\u6B62");
    }
  }
  if (out.trim().length === 0) throw new Error("\u89C6\u89C9\u6A21\u578B\u8FD4\u56DE\u4E3A\u7A7A");
  return out;
}
async function describeWithFallback(ctx, cfg, images, question, signal, sessionId, nextId) {
  let llm = null;
  try {
    llm = ctx.get("llm");
  } catch {
    llm = null;
  }
  if (!llm || typeof llm.stream !== "function") throw new Error("\u5F53\u524D\u73AF\u5883\u6CA1\u6709\u53EF\u7528\u7684 llm \u670D\u52A1");
  const attempts = [];
  if (cfg.primary) attempts.push({ route: cfg.primary, fallback: false });
  if (cfg.fallback && !sameRoute(cfg.fallback, cfg.primary))
    attempts.push({ route: cfg.fallback, fallback: true });
  if (attempts.length === 0) {
    const models = await listVisionModels(ctx);
    if (models.length === 0)
      throw new Error(
        "\u6CA1\u6709\u53EF\u7528\u7684\u89C6\u89C9\u6A21\u578B\uFF1A\u8BF7\u5148\u5728\u8BBE\u7F6E \u2192 \u89C6\u89C9\u6A21\u578B \u4E2D\u9009\u62E9\uFF08\u9700\u8981\u5728 setting.yml \u91CC\u7ED9\u6A21\u578B\u52A0\u4E0A input: [text, image]\uFF09"
      );
    const first = models[0];
    attempts.push({ route: { provider: first.provider, model: first.model }, fallback: false });
  }
  let lastError = null;
  for (const a of attempts) {
    try {
      const text = await runOneVision(llm, a.route, images, question, signal, sessionId, nextId);
      return { text, route: a.route, fallbackUsed: a.fallback };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("\u89C6\u89C9\u6A21\u578B\u8C03\u7528\u5931\u8D25");
}
function buildQuestion(base, detail, promptTemplate) {
  let q = (typeof base === "string" ? base : "").trim();
  if (!q) q = "\u8BF7\u63CF\u8FF0\u8FD9\u5F20\u56FE\u7247\u7684\u5185\u5BB9\u3002";
  let suffix = "";
  if (detail === "high")
    suffix = "\n\n\u8BF7\u5C3D\u53EF\u80FD\u8BE6\u7EC6\uFF1A\u4E3B\u4F53\u3001\u6587\u5B57\u3001\u6570\u5B57\u3001\u989C\u8272\u3001\u4F4D\u7F6E\u5173\u7CFB\u90FD\u4E0D\u8981\u9057\u6F0F\u3002\u5982\u6709\u6587\u5B57\u8BF7\u9010\u5B57\u8F6C\u5F55\u3002";
  else if (detail === "low") suffix = "\n\n\u8BF7\u7528 2-3 \u53E5\u8BDD\u7B80\u8981\u6982\u62EC\u3002";
  const extra2 = typeof promptTemplate === "string" && promptTemplate.trim().length > 0 ? "\n\n\u8865\u5145\u8981\u6C42\uFF1A" + promptTemplate.trim().slice(0, 500) : "";
  return q + suffix + extra2;
}

// src/host/index.ts
var name = "@dshp/vision-bridge";
var inject = ["tools", "webServer", "llm"];
function apply(ctx, rawConfig) {
  try {
    migrateYamlNamespaceKey();
  } catch {
  }
  const entry = { ...DEFAULT_CONFIG };
  const patch = sanitizePatchConfig(rawConfig);
  if (patch) {
    if (Object.hasOwn(patch, "enabled") && patch.enabled !== void 0) entry.enabled = patch.enabled;
    if (Object.hasOwn(patch, "primary") && patch.primary !== void 0) entry.primary = patch.primary;
    if (Object.hasOwn(patch, "fallback") && patch.fallback !== void 0) entry.fallback = patch.fallback;
    if (Object.hasOwn(patch, "detail") && patch.detail !== void 0) entry.detail = patch.detail;
    if (Object.hasOwn(patch, "maxImages") && patch.maxImages !== void 0) entry.maxImages = patch.maxImages;
    if (Object.hasOwn(patch, "promptTemplate") && patch.promptTemplate !== void 0)
      entry.promptTemplate = patch.promptTemplate;
  }
  const persistedForMigration = loadPersisted();
  let current = () => entry;
  let hasMigrated = false;
  function tryMigrate() {
    if (hasMigrated) return;
    hasMigrated = true;
    if (!persistedForMigration) return;
    let settings = null;
    try {
      settings = ctx.get("settings");
    } catch {
      settings = null;
    }
    if (!settings) return;
    try {
      const list = settings.describe();
      const desc = list.find((d) => d.ns === NS);
      if (desc && desc.user !== void 0) {
        try {
          console.info(
            "[dshp-vision-bridge] settings.yaml \u5DF2\u5B58\u5728 dshp-vision-bridge \u7528\u6237\u914D\u7F6E\uFF0C\u8DF3\u8FC7\u65E7\u6587\u4EF6\u81EA\u52A8\u8FC1\u79FB\uFF08\u65E7\u6587\u4EF6\u4FDD\u7559\uFF0C\u53EF\u624B\u52A8\u5220\u9664 " + persistedForMigration.source + "\uFF09"
          );
        } catch {
        }
        return;
      }
    } catch {
    }
    const needPatch = {};
    let need = false;
    for (const k of Object.keys(persistedForMigration.config)) {
      const pv = persistedForMigration.config[k];
      const ev = entry[k];
      if (JSON.stringify(pv) !== JSON.stringify(ev)) {
        needPatch[k] = pv;
        need = true;
      }
    }
    if (!need) {
      try {
        const p = persistedForMigration.source;
        if (existsSync(p)) {
          try {
            unlinkSync(p);
            console.info("[dshp-vision-bridge] \u65E7\u5B58\u50A8\u6587\u4EF6\u4E0E\u9ED8\u8BA4\u503C\u4E00\u81F4\uFF0C\u5DF2\u81EA\u52A8\u6E05\u7406 " + p);
          } catch {
          }
        }
      } catch {
      }
      return;
    }
    Promise.resolve(settings.update(NS, needPatch)).then(() => {
      try {
        console.info(
          "[dshp-vision-bridge] \u5DF2\u81EA\u52A8\u5C06\u65E7\u7248 " + persistedForMigration.source + " \u8FC1\u79FB\u81F3 settings.yaml (dshp-vision-bridge)"
        );
      } catch {
      }
      try {
        const p = persistedForMigration.source;
        const bak = p + ".bak";
        if (existsSync(p)) {
          try {
            renameSync(p, bak);
            console.info("[dshp-vision-bridge] \u65E7\u6587\u4EF6\u5DF2\u5907\u4EFD\u4E3A " + bak);
          } catch {
            try {
              unlinkSync(p);
              console.info("[dshp-vision-bridge] \u65E7\u6587\u4EF6\u5DF2\u6E05\u7406 " + p);
            } catch {
            }
          }
        }
      } catch {
      }
    }).catch((e) => {
      try {
        console.warn("[dshp-vision-bridge] \u65E7\u6587\u4EF6\u8FC1\u79FB\u5931\u8D25\uFF1A" + String(e?.message ?? e));
      } catch {
      }
      hasMigrated = false;
    });
  }
  ctx.inject(["settings"], (sctx) => {
    sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
      setSource: (src) => {
        current = src;
        tryMigrate();
      },
      onChange: () => {
      }
    });
  });
  function getConfig() {
    try {
      const v = current();
      if (v && typeof v === "object") return v;
    } catch {
    }
    return entry;
  }
  async function updateConfig(patchObj) {
    const settings = ctx.get("settings");
    if (!settings)
      throw new Error(
        "settings \u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u65E0\u6CD5\u6301\u4E45\u5316\u5230 settings.yaml\uFF08\u8BF7\u91CD\u542F DSH \u6216\u68C0\u67E5 FileSettingsProvider \u662F\u5426\u6302\u8F7D\uFF09"
      );
    await settings.update(NS, patchObj);
  }
  function snapshotConfig() {
    const c = getConfig();
    return {
      enabled: c.enabled === true,
      primary: c.primary ? { provider: c.primary.provider, model: c.primary.model } : null,
      fallback: c.fallback ? { provider: c.fallback.provider, model: c.fallback.model } : null,
      detail: c.detail,
      maxImages: c.maxImages,
      promptTemplate: c.promptTemplate
    };
  }
  async function ensureDefaults(models) {
    if (!Array.isArray(models) || models.length === 0) return;
    const c = getConfig();
    const patchObj = {};
    let need = false;
    const first = models[0];
    if (!c.primary) {
      patchObj["primary"] = { provider: first.provider, model: first.model };
      need = true;
    }
    if (!c.fallback && models.length > 1) {
      const second = models[1];
      const primary = patchObj["primary"] ?? c.primary;
      if (primary && (second.provider !== primary.provider || second.model !== primary.model)) {
        patchObj["fallback"] = { provider: second.provider, model: second.model };
        need = true;
      }
    }
    if (need) {
      try {
        await updateConfig(patchObj);
      } catch (e) {
        try {
          console.warn(
            "[dshp-vision-bridge] ensureDefaults \u5199\u5165 settings.yaml \u5931\u8D25\uFF1A" + String(e?.message ?? e)
          );
        } catch {
        }
      }
    }
  }
  let seq = 0;
  function nextId(prefix) {
    seq += 1;
    return prefix + "-" + String(seq);
  }
  const images = createImageCache();
  try {
    ctx.effect(
      () => ctx.on("agent/inbox/inserted", (payload) => {
        try {
          if (!payload || typeof payload !== "object") return;
          const p = payload;
          const sid = sessionIdOf(p.agent);
          const msg = p.message;
          if (typeof sid !== "string" || !msg || typeof msg !== "object") return;
          const found = [];
          walkBlocks(msg.content, found);
          if (found.length > 0) images.push(sid, found);
        } catch {
        }
      }),
      "dshp-vision-bridge: cache inbox images"
    );
  } catch {
  }
  try {
    ctx.effect(
      () => ctx.on("llm/stream", (options, next) => {
        try {
          const sid = options?.sessionId;
          const msgs = options?.messages;
          if (typeof sid === "string" && Array.isArray(msgs)) {
            const found = [];
            for (const m of msgs) {
              if (m && typeof m === "object") walkBlocks(m.content, found);
            }
            if (found.length > 0) images.push(sid, found);
          }
        } catch {
        }
        return next();
      }),
      "dshp-vision-bridge: cache llm.stream images"
    );
  } catch {
  }
  function bridgeTakeoverArmed() {
    const c = getConfig();
    return c.enabled === true && c.primary !== null && typeof c.primary === "object";
  }
  function withBridgeImageCapability(info) {
    if (!info || typeof info !== "object") return info;
    const mods = info.inputModalities;
    if (!Array.isArray(mods) || mods.indexOf("image") >= 0) return info;
    return { ...info, inputModalities: [...mods, "image"] };
  }
  try {
    const llmSvc = ctx.get("llm");
    if (llmSvc && typeof llmSvc.resolveModelInfo === "function") {
      const origResolve = llmSvc.resolveModelInfo.bind(llmSvc);
      const patchedResolve = async (...args) => {
        const info = await origResolve(...args);
        try {
          if (bridgeTakeoverArmed()) return withBridgeImageCapability(info);
        } catch {
        }
        return info;
      };
      llmSvc.resolveModelInfo = patchedResolve;
      ctx.effect(
        () => () => {
          try {
            if (llmSvc.resolveModelInfo === patchedResolve) llmSvc.resolveModelInfo = origResolve;
          } catch {
          }
        },
        "dshp-vision-bridge: admission takeover"
      );
      try {
        console.info(
          "[dshp-vision-bridge] admission takeover armed (text-only models may send images while bridge is enabled with a primary vision model)"
        );
      } catch {
      }
    } else {
      try {
        console.warn(
          "[dshp-vision-bridge] llm service unavailable, admission takeover skipped (text-only models still cannot send images)"
        );
      } catch {
      }
    }
  } catch {
  }
  try {
    const sys = ctx.get("systemPrompt");
    if (sys && typeof sys.section === "function") {
      ctx.effect(
        () => sys.section({
          name: "dshp-vision-bridge",
          order: 80,
          text: "\u89C6\u89C9\u80FD\u529B\u8BF4\u660E\uFF1A\u4F60\u662F\u7EAF\u6587\u672C\u6A21\u578B\uFF0C\u65E0\u6CD5\u76F4\u63A5\u770B\u56FE\u3002\u5F53\u7528\u6237\u6D88\u606F\u4E2D\u51FA\u73B0\u201C[image omitted because this model accepts text only\u201D\u5360\u4F4D\u7B26\u65F6\uFF0C\u8BF4\u660E\u672C\u8F6E\u9644\u5E26\u4E86\u56FE\u7247\uFF0C\u4F60\u5FC5\u987B\u8C03\u7528 vision_describe \u5DE5\u5177\u6765\u8BC6\u522B\uFF08\u4E0D\u8981\u731C\u6D4B\u56FE\u7247\u5185\u5BB9\uFF0C\u4E0D\u8981\u8BA9\u7528\u6237\u6362\u6A21\u578B\uFF09\u3002\u53C2\u6570 question \u5199\u6E05\u4F60\u9700\u8981\u4ECE\u56FE\u7247\u4E2D\u83B7\u5F97\u4EC0\u4E48\u4FE1\u606F\uFF1B\u5982\u6709\u591A\u4E2A\u56FE\u7247\u53EF\u7528 image_hint \u6307\u5B9A\uFF08\u9644\u4EF6 sha \u524D\u7F00\u6216\u4ECE 1 \u5F00\u59CB\u7684\u5E8F\u53F7\uFF09\uFF0C\u4E0D\u786E\u5B9A\u5C31\u7559\u7A7A\u5206\u6790\u5168\u90E8\u56FE\u7247\u3002\u5DE5\u5177\u4F1A\u81EA\u52A8\u9009\u7528\u8BBE\u7F6E \u2192 \u89C6\u89C9\u6A21\u578B \u91CC\u914D\u7F6E\u7684\u4E3B\u6A21\u578B\uFF0C\u5931\u8D25\u65F6\u7528\u5907\u7528\u6A21\u578B\u91CD\u8BD5\u3002"
        }),
        "dshp-vision-bridge: prompt section"
      );
    }
  } catch {
  }
  try {
    ctx.tools.register({
      name: "vision_describe",
      description: "\u5F53\u4F60\u65E0\u6CD5\u76F4\u63A5\u770B\u5230\u56FE\u7247\u65F6\u8C03\u7528\uFF1A\u628A\u7528\u6237\u672C\u8F6E\u7684\u56FE\u7247\u4EA4\u7ED9\u89C6\u89C9\u6A21\u578B\u53BB\u8BC6\u522B\uFF0C\u8FD4\u56DE\u4E2D\u6587\u63CF\u8FF0\u3002\u770B\u5230 [image omitted because this model accepts text only] \u5360\u4F4D\u7B26\u65F6\u5FC5\u987B\u7528\u5B83\uFF0C\u4E0D\u8981\u731C\u56FE\u3002",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: {
            type: "string",
            description: "\u4F60\u60F3\u4ECE\u56FE\u7247\u4E2D\u77E5\u9053\u4EC0\u4E48\uFF0C\u4F8B\u5982\u201C\u63CF\u8FF0\u8FD9\u5F20\u622A\u56FE\u91CC\u7684\u62A5\u9519\u4FE1\u606F\u201D\u6216\u201C\u8F6C\u5F55\u56FE\u7247\u4E2D\u7684\u5168\u90E8\u6587\u5B57\u201D\u3002"
          },
          image_hint: {
            type: "string",
            description: "\u53EF\u9009\uFF1A\u53EA\u5206\u6790\u67D0\u4E00\u5F20\u56FE\u3002\u586B\u9644\u4EF6 sha \u524D\u7F00\uFF08\u5360\u4F4D\u7B26\u91CC\u7684\u90A3\u4E32\u5B57\u7B26\uFF09\u6216\u4ECE 1 \u5F00\u59CB\u7684\u5E8F\u53F7\uFF1B\u7559\u7A7A\u5219\u5206\u6790\u672C\u8F6E\u5168\u90E8\u56FE\u7247\u3002"
          },
          detail: {
            type: "string",
            enum: ["auto", "low", "high"],
            description: "\u53EF\u9009\uFF1Aauto \u5E38\u89C4\u63CF\u8FF0\uFF0Clow \u7B80\u8981\u6982\u62EC\uFF0Chigh \u9010\u5B57\u8F6C\u5F55\u7EA7\u8BE6\u7EC6\u3002\u4E0D\u586B\u7528\u8BBE\u7F6E\u9875\u7684\u9ED8\u8BA4\u503C\u3002"
          }
        },
        required: ["question"]
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            description: { type: "string" },
            model: { type: "string" },
            fallback_used: { type: "boolean" }
          },
          required: ["description", "model", "fallback_used"]
        },
        render: (_args, value) => [
          { type: "text", text: String(value.description) }
        ]
      },
      isConcurrencySafe: () => false,
      async execute(args, exec) {
        const cfg = getConfig();
        if (cfg.enabled !== true) throw new Error("\u89C6\u89C9\u6865\u63A5\u5DF2\u5728\u8BBE\u7F6E\u9875\u5173\u95ED\uFF0C\u8BF7\u5148\u542F\u7528\u540E\u518D\u8C03\u7528");
        const q = typeof args?.["question"] === "string" ? args["question"].trim() : "";
        if (!q) throw new Error("question \u4E0D\u80FD\u4E3A\u7A7A\uFF1A\u8BF7\u8BF4\u660E\u4F60\u60F3\u4ECE\u56FE\u7247\u4E2D\u83B7\u5F97\u4EC0\u4E48\u4FE1\u606F");
        const hint = typeof args?.["image_hint"] === "string" ? args["image_hint"].trim() : "";
        let detail;
        const argDetail = args?.["detail"];
        if (argDetail === "low" || argDetail === "high") detail = argDetail;
        else detail = cfg.detail === "low" || cfg.detail === "high" ? cfg.detail : "auto";
        let sid;
        try {
          if (exec?.agent) sid = sessionIdOf(exec.agent);
        } catch {
        }
        const cached = typeof sid === "string" && images.get(sid) || [];
        let list = cached.slice();
        if (hint) {
          const h = hint.toLowerCase();
          const bySha = list.filter((r) => r.attachmentId.toLowerCase().indexOf(h) >= 0);
          if (bySha.length > 0) {
            list = bySha;
          } else {
            const n = parseInt(h, 10);
            if (!Number.isNaN(n) && n >= 1 && n <= list.length) {
              const one = list[n - 1];
              list = [one];
            }
          }
        }
        const maxN = typeof cfg.maxImages === "number" && cfg.maxImages >= 1 ? Math.min(cfg.maxImages, 8) : 4;
        if (list.length > maxN) list = list.slice(list.length - maxN);
        if (list.length === 0) {
          throw new Error(
            "\u672C\u8F6E\u6CA1\u6709\u627E\u5230\u53EF\u7528\u7684\u56FE\u7247\uFF1A\u8BF7\u786E\u8BA4\u56FE\u7247\u5DF2\u4F5C\u4E3A\u9644\u4EF6\u53D1\u9001\uFF08\u91CD\u8BD5\u4E00\u6B21\uFF09\uFF0C\u6216\u628A\u5360\u4F4D\u7B26\u91CC\u7684 sha \u524D\u7F00\u586B\u8FDB image_hint"
          );
        }
        const question = buildQuestion(q, detail, cfg.promptTemplate);
        const signal = exec?.signal;
        const res = await describeWithFallback(imagesCtx(), cfg, list, question, signal, sid, nextId);
        return {
          description: res.text,
          model: res.route.provider + "/" + res.route.model,
          fallback_used: res.fallbackUsed === true
        };
        function imagesCtx() {
          return ctx;
        }
      }
    });
  } catch (e) {
    try {
      console.error("[dshp-vision-bridge] register tool failed: " + String(e?.message ?? e));
    } catch {
    }
  }
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/ext/dshp-vision-bridge/state",
      handler: async (_req, res) => {
        const req = _req;
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        try {
          const models = await listVisionModels(ctx);
          await ensureDefaults(models);
          return json(res, 200, {
            ok: true,
            models,
            config: snapshotConfig(),
            visionModelCount: models.length,
            admissionTakeover: bridgeTakeoverArmed()
          });
        } catch (e) {
          return json(res, 200, { ok: false, error: String(e?.message ?? e) });
        }
      }
    }),
    "dshp-vision-bridge: state route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/ext/dshp-vision-bridge/check",
      handler: async (_req, res) => {
        const req = _req;
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        let llm = null;
        try {
          llm = ctx.get("llm");
        } catch {
          llm = null;
        }
        if (!llm) {
          return json(res, 200, {
            ok: false,
            error: "llm \u670D\u52A1\u4E0D\u53EF\u7528",
            primary: { ok: false, message: "llm \u670D\u52A1\u4E0D\u53EF\u7528" },
            fallback: { ok: false, message: "llm \u670D\u52A1\u4E0D\u53EF\u7528" }
          });
        }
        async function probe(route) {
          if (!route) return { ok: false, message: "\u672A\u914D\u7F6E" };
          try {
            if (typeof llm.resolveModelInfo === "function") {
              await llm.resolveModelInfo(route.provider, route.model);
              return { ok: true, message: route.provider + "/" + route.model + " \u8DEF\u7531\u53EF\u89E3\u6790" };
            }
            const ps = llm.listProviders() ?? [];
            const has = Array.isArray(ps) && ps.some((p) => p?.id === route.provider);
            return has ? {
              ok: true,
              message: route.provider + "/" + route.model + "\uFF08\u63D0\u4F9B\u65B9\u5DF2\u6CE8\u518C\uFF0C\u672A\u505A\u6A21\u578B\u7EA7\u6821\u9A8C\uFF09"
            } : { ok: false, message: "\u63D0\u4F9B\u65B9 " + route.provider + " \u672A\u6CE8\u518C" };
          } catch (e) {
            return { ok: false, message: String(e?.message ?? e).slice(0, 300) };
          }
        }
        const cfg = getConfig();
        return json(res, 200, {
          ok: true,
          primary: await probe(cfg.primary),
          fallback: await probe(cfg.fallback)
        });
      }
    }),
    "dshp-vision-bridge: check route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/ext/dshp-vision-bridge/config",
      handler: async (_req, res) => {
        const req = _req;
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        if (req.method !== "POST") return json(res, 405, { ok: false, error: "method not allowed" });
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        const a = body && typeof body === "object" && !Array.isArray(body) ? body : {};
        function asRoute2(v) {
          if (!v || typeof v !== "object") return null;
          const r = v;
          if (typeof r["provider"] !== "string" || typeof r["model"] !== "string") return null;
          if (!r["provider"] || !r["model"]) return null;
          return {
            provider: r["provider"].slice(0, 120),
            model: r["model"].slice(0, 200)
          };
        }
        try {
          const patchObj = {};
          let hasPatch = false;
          if (Object.hasOwn(a, "primary")) {
            if (a["primary"] === null) {
              patchObj["primary"] = null;
              hasPatch = true;
            } else {
              const p = asRoute2(a["primary"]);
              if (!p) throw new Error("primary \u975E\u6CD5\uFF0C\u5E94\u4E3A {provider, model} \u6216 null");
              patchObj["primary"] = p;
              hasPatch = true;
            }
          }
          if (Object.hasOwn(a, "fallback")) {
            if (a["fallback"] === null) {
              patchObj["fallback"] = null;
              hasPatch = true;
            } else {
              const f = asRoute2(a["fallback"]);
              if (!f) throw new Error("fallback \u975E\u6CD5\uFF0C\u5E94\u4E3A {provider, model} \u6216 null");
              patchObj["fallback"] = f;
              hasPatch = true;
            }
          }
          if (Object.hasOwn(a, "enabled")) {
            patchObj["enabled"] = a["enabled"] === true;
            hasPatch = true;
          }
          if (Object.hasOwn(a, "detail")) {
            if (a["detail"] === "low" || a["detail"] === "high" || a["detail"] === "auto") {
              patchObj["detail"] = a["detail"];
              hasPatch = true;
            } else throw new Error("detail \u975E\u6CD5\uFF0C\u5E94\u4E3A auto/low/high");
          }
          if (Object.hasOwn(a, "maxImages")) {
            const n = a["maxImages"];
            if (typeof n !== "number" || !(n >= 1 && n <= 8))
              throw new Error("maxImages \u975E\u6CD5\uFF0C\u5E94\u4E3A 1-8 \u7684\u6570\u5B57");
            patchObj["maxImages"] = Math.floor(n);
            hasPatch = true;
          }
          if (Object.hasOwn(a, "promptTemplate")) {
            if (typeof a["promptTemplate"] !== "string") throw new Error("promptTemplate \u975E\u6CD5\uFF0C\u5E94\u4E3A\u5B57\u7B26\u4E32");
            patchObj["promptTemplate"] = a["promptTemplate"].slice(0, 2e3);
            hasPatch = true;
          }
          if (hasPatch) await updateConfig(patchObj);
          return json(res, 200, { ok: true, config: snapshotConfig() });
        } catch (e) {
          return json(res, 200, { ok: false, error: String(e?.message ?? e) });
        }
      }
    }),
    "dshp-vision-bridge: config route"
  );
}

export { ConfigSchema, NS, apply, inject, name };
