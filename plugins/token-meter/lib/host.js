import { existsSync, unlinkSync, renameSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
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

// src/host/providers/base.ts
var ID_RE = /^[a-z0-9][a-z0-9-]{1,30}$/;
var WORKSPACE_RE = /^[A-Za-z0-9_]{4,64}$/;
function numStr(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function checkAdapterShape(a) {
  if (!a || typeof a !== "object") return "\u9002\u914D\u5668\u4E3A\u7A7A";
  const r = a;
  if (typeof r["type"] !== "string" || !ID_RE.test(r["type"]))
    return "\u9002\u914D\u5668 type \u975E\u6CD5(" + String(r["type"]) + ")";
  if (typeof r["label"] !== "string" || !r["label"]) return "\u9002\u914D\u5668 " + String(r["type"]) + " \u7F3A\u5C11 label";
  if (typeof r["title"] !== "string" || !r["title"]) return "\u9002\u914D\u5668 " + String(r["type"]) + " \u7F3A\u5C11 title";
  if (typeof r["secretField"] !== "string")
    return "\u9002\u914D\u5668 " + String(r["type"]) + " secretField \u987B\u4E3A\u5B57\u7B26\u4E32\uFF08\u65E0\u5BC6\u94A5\u586B\u7A7A\u4E32\uFF09";
  if (!Array.isArray(r["fields"])) return "\u9002\u914D\u5668 " + String(r["type"]) + " \u7F3A\u5C11 fields \u6570\u7EC4";
  if (typeof r["fetch"] !== "function") return "\u9002\u914D\u5668 " + String(r["type"]) + " \u7F3A\u5C11 fetch(vendor, deps)";
  return "";
}

// src/host/secrets.ts
var DOLLAR_REF_RE = /^\$([A-Za-z_][A-Za-z0-9_]*)$/;
var ENV_REF_RE = /^\{env:([A-Za-z_][A-Za-z0-9_]*)\}$/;
var CRED_REF_RE = /^\{cred:([A-Za-z_][A-Za-z0-9_]*)\}$/;
function normalizeSecretRef(raw) {
  if (typeof raw !== "string") return raw;
  const t = raw.trim();
  let m = t.match(ENV_REF_RE);
  if (m) return "$" + m[1];
  m = t.match(CRED_REF_RE);
  if (m) return "$" + m[1];
  return raw;
}
function secretKindOfRaw(raw) {
  if (raw === void 0 || raw === null || raw === "") return "empty";
  const s = String(raw);
  if (DOLLAR_REF_RE.test(s)) return "ref";
  if (ENV_REF_RE.test(s)) return "env";
  if (CRED_REF_RE.test(s)) return "cred";
  return "plain";
}
function pickAuthFragment(v) {
  const m = String(v).match(/auth=([^;\s]+)/);
  return m ? m[1].trim() : String(v).trim();
}
function createSecretResolver(ctx) {
  return async function resolveSecret(raw) {
    if (typeof raw !== "string" || !raw) return { value: "", kind: "empty" };
    const trimmed = raw.trim();
    let m = trimmed.match(DOLLAR_REF_RE);
    if (m) {
      const refName = m[1];
      try {
        let creds = null;
        try {
          creds = ctx.get("credentials");
        } catch {
          creds = null;
        }
        if (creds) {
          const r = await creds.resolve(refName);
          if (r && r.value) return { value: pickAuthFragment(r.value), kind: "ref" };
        }
      } catch {
      }
      const envVal = process.env[refName] || "";
      if (envVal) return { value: pickAuthFragment(envVal), kind: "ref" };
      throw new Error(
        "\u5BC6\u94A5\u5F15\u7528 $" + refName + " \u4E3A\u7A7A(\u5BC6\u94A5\u6587\u4EF6\u4E0E\u73AF\u5883\u53D8\u91CF\u4E2D\u5747\u672A\u627E\u5230\uFF0C\u5148\u5199\u5165\u51ED\u636E\u6216\u5BFC\u51FA\u73AF\u5883\u53D8\u91CF)"
      );
    }
    m = trimmed.match(ENV_REF_RE);
    if (m) {
      const v = process.env[m[1]] || "";
      if (!v) throw new Error("\u73AF\u5883\u53D8\u91CF " + m[1] + " \u4E3A\u7A7A\u6216\u672A\u5BFC\u51FA(\u5F53\u524D\u8FDB\u7A0B\u8BFB\u4E0D\u5230)");
      return { value: v, kind: "env" };
    }
    m = trimmed.match(CRED_REF_RE);
    if (m) {
      let creds = null;
      try {
        creds = ctx.get("credentials");
      } catch {
        creds = null;
      }
      if (!creds) throw new Error("\u51ED\u636E\u670D\u52A1\u4E0D\u53EF\u7528");
      const r = await creds.resolve(m[1]);
      if (!r || !r.value) throw new Error("\u51ED\u636E " + m[1] + " \u4E3A\u7A7A(\u5148\u7528\u300C\u5B58\u51ED\u636E\u300D\u5199\u5165)");
      return { value: r.value, kind: "cred" };
    }
    if (/^\{(env|cred):/.test(trimmed))
      throw new Error("\u5BC6\u94A5\u5F15\u7528\u8BED\u6CD5\u9519\u8BEF,\u5E94\u4E3A $NAME \u6216 {env:NAME} \u6216 {cred:NAME}");
    if (trimmed.startsWith("$"))
      throw new Error("\u5BC6\u94A5\u5F15\u7528\u8BED\u6CD5\u9519\u8BEF,\u5E94\u4E3A $NAME\uFF08\u5B57\u6BCD/\u6570\u5B57/\u4E0B\u5212\u7EBF\uFF0C\u5B57\u6BCD\u6216\u4E0B\u5212\u7EBF\u5F00\u5934\uFF09");
    return { value: pickAuthFragment(trimmed), kind: "plain" };
  };
}

// src/host/providers/opencode.ts
var LEGACY_AUTH_FIELD = "auth";
function effectiveCookie(params) {
  const p = params && typeof params === "object" ? params : {};
  const c = p["cookie"];
  if (typeof c === "string" && c.trim() !== "") return c;
  const a = p[LEGACY_AUTH_FIELD];
  if (typeof a === "string" && a.trim() !== "") return a;
  return "";
}
function toCookieHeader(secret) {
  const s = String(secret || "").trim();
  if (s === "") return "";
  if (s.indexOf("=") !== -1) return s;
  return "auth=" + s;
}
function sanitizeCookieParams(raw) {
  const src = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const out = {};
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (v !== void 0) out[k] = typeof v === "string" ? normalizeSecretRef(v) : v;
  }
  if (typeof out["cookie"] === "string") out["cookie"] = normalizeSecretRef(out["cookie"]);
  if (typeof out[LEGACY_AUTH_FIELD] === "string")
    out[LEGACY_AUTH_FIELD] = normalizeSecretRef(out[LEGACY_AUTH_FIELD]);
  if ((out["cookie"] === void 0 || out["cookie"] === "") && typeof out[LEGACY_AUTH_FIELD] === "string" && out[LEGACY_AUTH_FIELD] !== "") {
    out["cookie"] = out[LEGACY_AUTH_FIELD];
  }
  return out;
}
function maskCookieParams(params) {
  const out = { ...params };
  for (const k of ["cookie", LEGACY_AUTH_FIELD]) {
    if (typeof out[k] === "string" && out[k] !== "" && secretKindOfRaw(out[k]) === "plain") out[k] = "";
  }
  return out;
}
var GO_PATH = "/go";
var BILLING_PATH = "/billing";
var BILLING_UNIT = 1e8;
function inlineVal(html, key) {
  const re = new RegExp(key + '\\s*:\\s*("([^"]{0,80})"|null|true|false|(-?\\d+(?:\\.\\d+)?))');
  const m = re.exec(html);
  if (!m) return void 0;
  if (m[2] !== void 0) return m[2];
  if (m[3] !== void 0) return Number(m[3]);
  if (m[1] === "null") return null;
  if (m[1] === "true") return true;
  if (m[1] === "false") return false;
  return void 0;
}
var mmdd = (d) => d ? String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getDate()).padStart(2, "0") : "";
function fmtLeftCn(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  if (s >= 86400) return Math.floor(s / 86400) + " \u5929";
  if (s >= 3600) return Math.floor(s / 3600) + " \u5C0F\u65F6";
  if (s >= 60) return Math.floor(s / 60) + " \u5206\u949F";
  return s + " \u79D2";
}
function billingAmount(amount) {
  if (amount === void 0 || amount === null) return null;
  const n = Number(amount);
  if (!Number.isFinite(n)) return null;
  return Math.round(n / BILLING_UNIT * 100) / 100;
}
function parseSubscription(goHtml, billingHtml) {
  const src = (goHtml || "") + "\n" + (billingHtml || "");
  const plan = inlineVal(src, "subscriptionPlan");
  if (typeof plan === "string" && plan && plan !== "null") {
    const sub = inlineVal(src, "subscription");
    return { plan: String(plan), note: sub ? "\u8BA2\u9605\u751F\u6548\u4E2D" : "", expireAt: null };
  }
  const liteId = inlineVal(src, "liteSubscriptionID");
  if (typeof liteId === "string" && liteId && liteId !== "null") {
    const paid = latestLitePurchase(billingHtml || "");
    return { plan: "Lite", note: paid ? "\u8D2D\u4E70\u4E8E " + mmdd(paid) : "", expireAt: null };
  }
  return null;
}
function latestLitePurchase(billingHtml) {
  const html = billingHtml || "";
  let latest = null;
  const re = /timeCreated\s*:\s*(?:new Date\()?"(\d{4}-\d{2}-\d{2}T[0-9:.]+Z?)"[^}]{0,400}?type\s*:\s*"lite"/g;
  let m = null;
  while ((m = re.exec(html)) !== null) {
    const d = new Date(m[1]);
    if (!Number.isNaN(d.getTime()) && (latest === null || d > latest)) latest = d;
  }
  if (latest === null) {
    const re2 = /type\s*:\s*"lite"[^}]{0,400}?timeCreated\s*:\s*(?:new Date\()?"(\d{4}-\d{2}-\d{2}T[0-9:.]+Z?)"/g;
    while ((m = re2.exec(html)) !== null) {
      const d = new Date(m[1]);
      if (!Number.isNaN(d.getTime()) && (latest === null || d > latest)) latest = d;
    }
  }
  return latest;
}
function parseGoQuota(html) {
  const re = /\{status:"ok",resetInSec:(\d+),usagePercent:([\d.]+),usage:(\d+),limit:(\d+)\}/g;
  const wins = [];
  let m = null;
  while ((m = re.exec(html)) !== null) {
    wins.push({
      resetInSec: Number(m[1]),
      pct: Number(m[2]),
      used: Number(m[3]),
      limit: Number(m[4])
    });
  }
  if (wins.length < 3) return null;
  const meta = [
    ["5h", "5\u5C0F\u65F6"],
    ["weekly", "\u6BCF\u5468"],
    ["monthly", "\u6BCF\u6708"]
  ];
  let plan = null;
  const pm = /subscriptionPlan:([A-Za-z0-9_]+|null)/.exec(html);
  if (pm && pm[1] !== "null") plan = pm[1];
  return {
    windows: wins.slice(0, 3).map((w, i) => {
      const mt = meta[i];
      return { key: mt[0], label: mt[1], pct: w.pct, used: w.used, limit: w.limit, resetInSec: w.resetInSec };
    }),
    plan
  };
}
function parseOpencodePages(goHtml, billingHtml, opts) {
  const q = parseGoQuota(goHtml || "");
  const sub = parseSubscription(goHtml || "", billingHtml || "");
  const balance = billingAmount(inlineVal(billingHtml || "", "balance"));
  const optsEff = opts || {};
  if (q) {
    const billing = { balance, plan: sub && sub.plan || q.plan || "Opencode" };
    const extra2 = {};
    if (sub && (sub.note || sub.plan)) {
      const monthly = q.windows.filter((w) => w.key === "monthly")[0];
      const renewIn = monthly && monthly.resetInSec > 0 ? monthly.resetInSec : null;
      extra2.blocks = [
        {
          kind: "note",
          tone: "info",
          text: "\u8BA2\u9605 " + sub.plan + (sub.note ? " \xB7 " + sub.note : "") + (renewIn !== null ? " \xB7 \u7EA6 " + fmtLeftCn(renewIn) + "\u91CD\u7F6E/\u5230\u671F" : "")
        }
      ];
    }
    if (balance !== null && balance !== void 0) {
      extra2.stats = [{ label: "\u5145\u503C\u4F59\u989D", value: String(balance) }];
    }
    return {
      billingKind: "rolling",
      windows: q.windows,
      billing,
      extra: extra2.blocks || extra2.stats ? extra2 : null
    };
  }
  if (balance !== null && balance !== void 0) {
    const currency = optsEff.currency || "USD";
    return {
      billingKind: "payg",
      billing: {
        balance: numStr(balance),
        currency,
        granted: null,
        toppedUp: null,
        isAvailable: balance > 0 ? true : null,
        infos: [],
        lowWarn: optsEff.lowWarn !== void 0 && optsEff.lowWarn !== "" && optsEff.lowWarn !== null ? Number(optsEff.lowWarn) : null,
        plan: "Opencode Zen"
      },
      extra: sub ? {
        blocks: [
          { kind: "note", tone: "info", text: "\u8BA2\u9605 " + sub.plan + (sub.note ? " \xB7 " + sub.note : "") }
        ]
      } : null
    };
  }
  return null;
}
var opencode = {
  type: "opencode",
  label: "OC",
  title: "opencode\uFF08Go+Zen \u5408\u5E76\uFF09",
  secretField: "cookie",
  hint: "\u5B98\u65B9\u6E20\u9053\u5408\u5E76\u7248\uFF1A\u540C\u4E00 workspace+cookie \u540C\u65F6\u62C9 /go\uFF08\u4E09\u7A97\u53E3+\u8BA2\u9605\uFF09\u4E0E /billing\uFF08\u4F59\u989D\uFF09\u3002\u65E7 opencode-go / opencode-zen \u914D\u7F6E\u81EA\u52A8\u8FC1\u79FB\u3002",
  fields: [
    {
      key: "workspaceId",
      label: "workspaceId *",
      kind: "text",
      mono: true,
      required: true,
      placeholder: "\u5982\uFF1Awrk_xxx",
      hint: "\u5DE5\u4F5C\u533A ID\uFF1A\u6D4F\u89C8\u5668\u6253\u5F00 opencode.ai \u5E76\u8FDB\u5165\u4F60\u7684\u5DE5\u4F5C\u533A\uFF0C\u5730\u5740\u680F workspace/ \u540E\u9762\u7684 wrk_ \u5F00\u5934\u5B57\u7B26\u4E32\uFF08Go \u4E0E Zen \u9875\u9762\u901A\u7528\uFF09\u3002"
    },
    {
      key: "cookie",
      label: "cookie *",
      kind: "secret",
      mono: true,
      required: true,
      placeholder: "\u586B $NAME \u5F15\u7528\uFF08\u63A8\u8350\uFF09\u6216\u7C98\u8D34 Cookie",
      hint: "\u767B\u5F55\u6001\uFF1A\u6D4F\u89C8\u5668\u5F00\u53D1\u8005\u5DE5\u5177 \u2192 Application \u2192 Cookies \u2192 \u590D\u5236 auth \u7684\u503C\uFF1B\u6574\u6BB5 Cookie\uFF08\u542B oc_locale \u7B49\uFF09\u539F\u6837\u7C98\u8D34\u4EA6\u53EF\u3002\u5EFA\u8BAE\u5148\u5B58\u5165\u7CFB\u7EDF\u51ED\u636E\u518D\u586B $NAME\u3002"
    },
    {
      key: "lowWarn",
      label: "\u4F4E\u4F59\u989D\u9884\u8B66\u7EBF",
      kind: "number",
      placeholder: "\u5982\uFF1A10",
      hint: "\u4F59\u989D\u4F4E\u4E8E\u6B64\u503C\u65F6\u4FA7\u8FB9\u680F\u9EC4\u8272\u63D0\u9192\uFF08USD\uFF0C\u6309\u91CF\u6A21\u5F0F\u624D\u751F\u6548\uFF09\u3002"
    },
    {
      key: "currency",
      label: "\u4F18\u5148\u5E01\u79CD",
      kind: "text",
      mono: true,
      placeholder: "\u9ED8\u8BA4 USD",
      hint: "\u6309\u91CF\u4F59\u989D\u5C55\u793A\u5E01\u79CD\uFF08\u9875\u9762\u672A\u58F0\u660E\u5E01\u79CD\uFF0C\u9ED8\u8BA4\u6309 USD\uFF09\u3002"
    }
  ],
  sanitizeParams: sanitizeCookieParams,
  readSecret: (params) => effectiveCookie(params),
  maskParams: maskCookieParams,
  validateParams(params) {
    const wid = params && params["workspaceId"] !== void 0 && params["workspaceId"] !== null ? String(params["workspaceId"]) : "";
    if (!WORKSPACE_RE.test(wid)) return "workspaceId \u975E\u6CD5";
    return "";
  },
  async fetch(vendor, deps) {
    const params = vendor && vendor.params || {};
    const wid = params["workspaceId"] || "";
    if (!WORKSPACE_RE.test(String(wid)))
      throw new Error("workspaceId \u975E\u6CD5\uFF084~64 \u4F4D\u5B57\u6BCD/\u6570\u5B57/\u4E0B\u5212\u7EBF\uFF0C\u5982 wrk_xxx\uFF0C\u89C1\u5B57\u6BB5\u8BF4\u660E\uFF09");
    const r = await deps.resolveSecret(effectiveCookie(params));
    if (!r.value)
      throw new Error(
        "cookie \u672A\u914D\u7F6E:\u5F53\u524D\u4E3A" + r.kind + ",\u8BF7\u5728\u8BBE\u7F6E\u9875\u586B\u5199 Cookie \u6216\u68C0\u67E5 $NAME \u5F15\u7528\uFF08\u83B7\u53D6\u65B9\u5F0F\u89C1\u5B57\u6BB5\u8BF4\u660E\uFF09"
      );
    const fetchImpl = deps && deps.fetchImpl || fetch;
    const base = "https://opencode.ai/workspace/" + wid;
    const header = { Cookie: toCookieHeader(r.value), Accept: "text/html" };
    const [goRes, billingRes] = await Promise.all([
      fetchImpl(base + GO_PATH, { headers: header, cache: "no-store" }).catch(() => null),
      fetchImpl(base + BILLING_PATH, { headers: header, cache: "no-store" }).catch(() => null)
    ]);
    let goHtml = "";
    let billingHtml = "";
    if (goRes) goHtml = await goRes.text().catch(() => "");
    if (billingRes) billingHtml = await billingRes.text().catch(() => "");
    if (goHtml.indexOf("usagePercent") === -1 && billingHtml.indexOf("balance") === -1) {
      throw new Error(
        "\u767B\u5F55\u5931\u6548\u6216\u88AB\u98CE\u63A7\uFF08/go " + goHtml.length + "B \xB7 /billing " + billingHtml.length + "B \u5747\u65E0\u6570\u636E\uFF09\uFF0C\u8BF7\u66F4\u65B0 cookie"
      );
    }
    let data;
    try {
      data = parseOpencodePages(goHtml, billingHtml, {
        lowWarn: params["lowWarn"],
        currency: params["currency"]
      });
    } catch (e) {
      throw new Error(e?.message || "\u9875\u9762\u89E3\u6790\u5931\u8D25", { cause: e });
    }
    if (!data) throw new Error("\u9875\u9762\u7ED3\u6784\u53D8\u5316\uFF0C\u89E3\u6790\u5931\u8D25\uFF08\u65E0\u7A97\u53E3\u4E14\u65E0\u4F59\u989D\u5B57\u6BB5\uFF09\uFF0C\u8BF7\u628A\u4E24\u9875\u9876\u5C42\u952E\u540D\u53D1\u7ED9\u7EF4\u62A4\u8005");
    return { ...data, secretKind: r.kind, via: "\u5B98\u65B9\u6E20\u9053" };
  }
};
var opencode_default = opencode;

// src/host/providers/deepseek-api.ts
function isRecord(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function pickBalanceInfo(infos, prefer) {
  if (!Array.isArray(infos) || !infos.length) return null;
  if (prefer) {
    const hit = infos.filter((x) => isRecord(x) && x["currency"] === prefer)[0];
    if (hit) return hit;
  }
  const cny = infos.filter((x) => isRecord(x) && x["currency"] === "CNY")[0];
  if (cny) return cny;
  return infos[0];
}
function curSym(cur) {
  if (cur === "CNY") return "\xA5";
  if (cur === "USD") return "$";
  return "";
}
async function fetchOfficialBalance(params, secret, fetchImpl) {
  const url = "https://api.deepseek.com/user/balance";
  const res = await fetchImpl(url, { headers: { Authorization: "Bearer " + secret }, cache: "no-store" });
  const code = res.status;
  const body = await res.text();
  if (code === 401) throw new Error("DeepSeek \u5BC6\u94A5\u65E0\u6548(401),\u8BF7\u68C0\u67E5 apiKey");
  if (code === 402) throw new Error("DeepSeek \u4F59\u989D\u4E0D\u8DB3(402),\u8BF7\u524D\u5F80\u5E73\u53F0\u5145\u503C");
  if (code === 429) throw new Error("DeepSeek \u9650\u6D41(429),\u7A0D\u540E\u91CD\u8BD5");
  if (code !== 200) throw new Error("DeepSeek \u63A5\u53E3 HTTP " + code + ":" + body.slice(0, 100));
  let j = null;
  try {
    j = JSON.parse(body);
  } catch {
    throw new Error("\u4F59\u989D\u63A5\u53E3\u8FD4\u56DE\u975E JSON(" + body.length + "B):" + body.slice(0, 80));
  }
  const jr = j ?? {};
  if (jr && jr["error"]) {
    const em = isRecord(jr["error"]) ? String(jr["error"]["message"] ?? "") : "";
    throw new Error("\u4F59\u989D\u63A5\u53E3\u62A5\u9519:" + (em || body.slice(0, 80)));
  }
  let infos = jr && Array.isArray(jr["balance_infos"]) ? jr["balance_infos"] : null;
  const isAvail = jr && jr["is_available"] !== void 0 ? !!jr["is_available"] : null;
  if (!infos && jr && jr["total_balance"] !== void 0) {
    infos = [
      {
        currency: jr["currency"] || "CNY",
        total_balance: jr["total_balance"],
        granted_balance: jr["granted_balance"],
        topped_up_balance: jr["topped_up_balance"]
      }
    ];
  }
  if (!infos) throw new Error("\u4F59\u989D\u63A5\u53E3\u5B57\u6BB5\u7F3A\u5931(\u65E0 balance_infos):" + String(body).slice(0, 100));
  const prefer = params && params["currency"] || "";
  const primary = pickBalanceInfo(infos, prefer);
  if (!primary) throw new Error("\u4F59\u989D\u4E3A\u7A7A");
  const normInfos = infos.map((x) => {
    const xr = x ?? {};
    return {
      currency: String(xr["currency"] || ""),
      total: numStr(xr["total_balance"]),
      granted: xr["granted_balance"] !== void 0 && xr["granted_balance"] !== null && xr["granted_balance"] !== "" ? numStr(xr["granted_balance"]) : null,
      toppedUp: xr["topped_up_balance"] !== void 0 && xr["topped_up_balance"] !== null && xr["topped_up_balance"] !== "" ? numStr(xr["topped_up_balance"]) : null
    };
  });
  const g = primary["granted_balance"] !== void 0 && primary["granted_balance"] !== null && primary["granted_balance"] !== "" ? numStr(primary["granted_balance"]) : null;
  const t = primary["topped_up_balance"] !== void 0 && primary["topped_up_balance"] !== null && primary["topped_up_balance"] !== "" ? numStr(primary["topped_up_balance"]) : null;
  const currency = String(primary["currency"] || "CNY");
  const balance = numStr(primary["total_balance"]);
  let extra2 = null;
  const totalQuota = (g !== null ? g : 0) + (t !== null ? t : 0);
  if (totalQuota > 0) {
    const used = Math.max(0, totalQuota - balance);
    const r2 = (n) => Math.round(Number(n) * 100) / 100;
    extra2 = {
      blocks: [
        {
          kind: "progress",
          label: "\u603B\u989D\u5EA6\u6D88\u8017",
          used: r2(used),
          total: r2(totalQuota),
          left: "\u5269\u4F59 " + curSym(currency) + balance.toFixed(2)
        }
      ]
    };
  }
  return {
    billingKind: "payg",
    billing: {
      balance,
      currency,
      granted: g,
      toppedUp: t,
      isAvailable: isAvail,
      infos: normInfos,
      lowWarn: params["lowWarn"] !== void 0 && params["lowWarn"] !== "" ? Number(params["lowWarn"]) : null,
      plan: "DeepSeek API"
    },
    extra: extra2
  };
}
var deepseekApi = {
  type: "deepseek-api",
  label: "DS-API",
  title: "deepseek-api\uFF08\u5B98\u65B9\u5BC6\u94A5\uFF09",
  secretField: "apiKey",
  hint: "\u5B98\u65B9\u4F59\u989D\u63A5\u53E3\uFF1A\u957F\u671F\u6709\u6548\u7684 apiKey\uFF08sk- \u5F00\u5934\uFF09\uFF0C\u4F59\u989D + \u603B\u989D\u5EA6\u5757\uFF0C\u65E0\u5386\u53F2\u8D8B\u52BF\u3002",
  fields: [
    {
      key: "apiKey",
      label: "apiKey *",
      kind: "secret",
      mono: true,
      required: true,
      placeholder: "\u586B $NAME \u5F15\u7528\uFF08\u63A8\u8350\uFF09\u6216\u7C98\u8D34\u660E\u6587",
      hint: "\u5BC6\u94A5\u83B7\u53D6\uFF1ADeepSeek \u5F00\u653E\u5E73\u53F0 \u2192 API keys\uFF08platform.deepseek.com/api_keys\uFF09\u521B\u5EFA\uFF0Csk- \u5F00\u5934\uFF0C\u957F\u671F\u6709\u6548\u3002\u5EFA\u8BAE\u5148\u5B58\u5165\u7CFB\u7EDF\u51ED\u636E\u518D\u586B $NAME\u3002"
    },
    {
      key: "lowWarn",
      label: "\u4F4E\u4F59\u989D\u9884\u8B66\u7EBF",
      kind: "number",
      placeholder: "\u5982\uFF1A20",
      hint: "\u4F59\u989D\u4F4E\u4E8E\u6B64\u503C\u65F6\u4FA7\u8FB9\u680F\u9EC4\u8272\u63D0\u9192\uFF08\u4E0E\u6240\u9009\u5E01\u79CD\u540C\u5355\u4F4D\uFF09\u3002"
    },
    {
      key: "currency",
      label: "\u4F18\u5148\u5E01\u79CD",
      kind: "text",
      mono: true,
      placeholder: "\u9ED8\u8BA4 CNY\uFF0C\u53EF\u586B USD",
      hint: "\u591A\u5E01\u79CD\u8D26\u6237\u65F6\u4F18\u5148\u5C55\u793A\u7684\u5E01\u79CD\uFF1B\u4E0D\u586B\u5219\u81EA\u52A8\u5F52\u4E00\uFF08CNY \u4F18\u5148\uFF09\u3002"
    }
  ],
  sanitizeParams(raw) {
    const src = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const out = {};
    for (const k of Object.keys(src)) {
      const v = src[k];
      if (v !== void 0) out[k] = typeof v === "string" ? normalizeSecretRef(v) : v;
    }
    if (typeof out["apiKey"] === "string") out["apiKey"] = normalizeSecretRef(out["apiKey"]);
    return out;
  },
  validateParams() {
    return "";
  },
  async fetch(vendor, deps) {
    const params = vendor && vendor.params || {};
    const r = await deps.resolveSecret(
      typeof params["apiKey"] === "string" ? params["apiKey"] : ""
    );
    if (!r.value)
      throw new Error("apiKey \u672A\u914D\u7F6E:\u8BF7\u5728\u8BBE\u7F6E\u9875\u586B\u5199\u6216\u68C0\u67E5 $NAME \u5F15\u7528\uFF08\u5F00\u653E\u5E73\u53F0 \u2192 API keys \u521B\u5EFA\uFF09");
    const data = await fetchOfficialBalance(params, r.value, deps && deps.fetchImpl || fetch);
    return { ...data, secretKind: r.kind, via: "\u5B98\u65B9\u63A5\u53E3" };
  }
};
var deepseek_api_default = deepseekApi;

// src/host/providers/deepseek-web.ts
var SUMMARY_URL = "https://platform.deepseek.com/api/v0/users/get_user_summary";
var BALANCE_KEYS = [
  "total_balance",
  "total",
  "balance",
  "available_balance",
  "balance_amount",
  "amount",
  "remaining",
  "remaining_balance",
  "current_balance"
];
var GRANTED_KEYS = ["granted_balance", "granted", "gift_balance", "free_balance"];
var TOPPED_KEYS = ["topped_up_balance", "topped_up", "recharged", "recharge_balance", "paid_balance"];
var CURRENCY_KEYS = ["currency", "currency_unit", "money_unit"];
var DATE_KEYS = ["date", "day", "time", "created_at", "timestamp", "stat_date", "biz_date"];
var VALUE_KEYS = [
  "total_tokens",
  "tokens",
  "token",
  "tokens_used",
  "usage_tokens",
  "cost",
  "amount",
  "expense",
  "requests",
  "calls",
  "count",
  "api_calls"
];
function isObj2(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function toNum(v) {
  if (v === void 0 || v === null || v === "") return null;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}
function unwrapEnvelope(j) {
  const ENVELOPES = ["data", "biz_data"];
  let cur = j;
  let guard = 0;
  while (isObj2(cur) && guard++ < 4) {
    let next = null;
    for (const k of ENVELOPES) {
      const cand = cur[k];
      if (cand !== void 0 && cand !== null && (isObj2(cand) || Array.isArray(cand))) {
        next = cand;
        break;
      }
    }
    if (next === null) break;
    cur = next;
  }
  return cur;
}
function envelopeError(node) {
  if (!isObj2(node)) return null;
  const raw = node["code"] ?? node["biz_code"] ?? node["err_code"] ?? node["error_code"];
  if (raw === void 0 || raw === null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n === 0) return null;
  const msg = node["msg"] ?? node["message"] ?? node["biz_msg"] ?? node["err_msg"] ?? "";
  return "\u6C47\u603B\u63A5\u53E3\u62A5\u9519(" + String(raw) + ")" + (msg ? ":" + String(msg).slice(0, 120) : "") + "\uFF08\u5982\u521A\u767B\u5F55\u8FC7\u4ECD\u62A5\u9519\uFF0C\u8BF7\u91CD\u65B0\u7C98\u8D34 cookie \u4E0E token\uFF09";
}
function pickNum(obj, keys) {
  if (!isObj2(obj)) return { value: null, key: null };
  for (const k of keys) {
    if (Object.hasOwn(obj, k)) {
      const n = toNum(obj[k]);
      if (n !== null) return { value: n, key: k };
    }
  }
  return { value: null, key: null };
}
function pickStr(obj, keys) {
  if (!isObj2(obj)) return null;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v !== "") return v;
  }
  return null;
}
function toLabel(v) {
  if (v === void 0 || v === null) return null;
  if (typeof v === "number" && Number.isFinite(v)) {
    const ms = v < 1e12 ? v * 1e3 : v;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getDate()).padStart(2, "0");
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return m[2].padStart(2, "0") + "/" + m[3].padStart(2, "0");
  m = s.match(/^(\d{1,2})\/(\d{1,2})/);
  if (m) return m[1].padStart(2, "0") + "/" + m[2].padStart(2, "0");
  return null;
}
function findHistory(root) {
  if (!isObj2(root) && !Array.isArray(root)) return null;
  const cands = [];
  if (Array.isArray(root)) cands.push(root);
  else {
    const ro = root;
    for (const k of Object.keys(ro)) {
      if (Array.isArray(ro[k])) cands.push(ro[k]);
      else if (isObj2(ro[k])) {
        const inner = ro[k];
        for (const k2 of Object.keys(inner)) {
          if (Array.isArray(inner[k2])) cands.push(inner[k2]);
        }
      }
    }
  }
  for (const arr of cands) {
    if (arr.length < 1) continue;
    const sample = arr.filter(isObj2).slice(0, 5);
    if (!sample.length) continue;
    let dateKey = null;
    for (const dk of DATE_KEYS) {
      const hits = sample.filter((it) => toLabel(it[dk]) !== null).length;
      if (hits >= Math.max(1, Math.floor(sample.length / 2))) {
        dateKey = dk;
        break;
      }
    }
    if (!dateKey) continue;
    let valueKey = null;
    for (const vk of VALUE_KEYS) {
      if (sample.some((it) => toNum(it[vk]) !== null)) {
        valueKey = vk;
        break;
      }
    }
    if (!valueKey) {
      const first = sample[0];
      const keys = Object.keys(first).filter((k) => k !== dateKey);
      for (const k of keys) {
        if (sample.some(
          (it) => typeof it[k] === "number" || typeof it[k] === "string" && it[k] !== "" && toNum(it[k]) !== null
        )) {
          valueKey = k;
          break;
        }
      }
    }
    if (!valueKey) continue;
    return { items: arr.filter(isObj2), dateKey, valueKey };
  }
  return null;
}
function fmtInt(n) {
  n = Math.round(Number(n) || 0);
  if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, "") + "\u4EBF";
  if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, "") + "\u4E07";
  return String(n);
}
function firstWallet(scope, keys) {
  if (!isObj2(scope)) return null;
  for (const k of keys) {
    const arr = scope[k];
    if (Array.isArray(arr) && arr.length && isObj2(arr[0])) return arr[0];
  }
  return null;
}
function parseUserSummary(body, opts) {
  const errTop = envelopeError(body);
  if (errTop) throw new Error(errTop);
  const root = unwrapEnvelope(body);
  if (!isObj2(root) && !Array.isArray(root)) {
    throw new Error("\u6C47\u603B\u63A5\u53E3\u8FD4\u56DE\u7ED3\u6784\u5F02\u5E38(\u9876\u5C42\u975E\u5BF9\u8C61)\uFF0C\u8BF7\u628A\u9876\u5C42\u7C7B\u578B\u53D1\u7ED9\u7EF4\u62A4\u8005");
  }
  const scope = isObj2(root) ? root : {};
  const errIn = envelopeError(scope);
  if (errIn) throw new Error(errIn);
  const lowWarn = opts && opts.lowWarn !== void 0 && opts.lowWarn !== "" && opts.lowWarn !== null ? Number(opts.lowWarn) : null;
  const normal = firstWallet(scope, ["normal_wallets"]);
  const cost = firstWallet(scope, ["total_costs"]);
  if (normal) {
    const balance = toNum(normal["balance"]);
    if (balance === null) throw new Error("\u94B1\u5305 balance \u975E\u6570\u5B57\uFF0C\u8BF7\u628A\u8BE5\u5B57\u6BB5\u6837\u4F8B\u53D1\u7ED9\u7EF4\u62A4\u8005");
    const currency2 = typeof normal["currency"] === "string" && normal["currency"] || "CNY";
    const costs = cost ? toNum(cost["amount"]) : null;
    const billing2 = {
      balance,
      currency: currency2,
      granted: null,
      toppedUp: null,
      isAvailable: balance > 0 ? true : null,
      infos: [],
      lowWarn,
      plan: "DeepSeek \u7F51\u9875\u7248"
    };
    const stats = [];
    if (costs !== null) stats.push({ label: "\u7D2F\u8BA1\u6D88\u8D39", value: costs.toFixed(2) });
    return { billing: billing2, extra: stats.length ? { stats } : null };
  }
  let bal = pickNum(scope, BALANCE_KEYS);
  if (bal.value === null && isObj2(scope)) {
    for (const k of Object.keys(scope)) {
      const sub = scope[k];
      if (isObj2(sub)) {
        const r = pickNum(sub, BALANCE_KEYS);
        if (r.value !== null) {
          bal = r;
          break;
        }
      }
    }
  }
  if (bal.value === null) {
    const keys = isObj2(root) ? Object.keys(root).slice(0, 12).join(",") : "array";
    throw new Error(
      "\u6C47\u603B\u63A5\u53E3\u672A\u547D\u4E2D\u4F59\u989D\u5B57\u6BB5(\u9876\u5C42\u952E:" + keys + ")\uFF1A\u63A5\u53E3\u53EF\u80FD\u6539\u7248\uFF0C\u628A\u8131\u654F\u540E\u7684\u9876\u5C42\u952E\u540D\u53D1\u7ED9\u7EF4\u62A4\u8005\u5373\u53EF\u8FED\u4EE3"
    );
  }
  const granted = pickNum(scope, GRANTED_KEYS).value;
  const topped = pickNum(scope, TOPPED_KEYS).value;
  const currency = pickStr(scope, CURRENCY_KEYS) || "CNY";
  const billing = {
    balance: bal.value,
    currency,
    granted,
    toppedUp: topped,
    isAvailable: bal.value > 0 ? true : null,
    infos: [],
    lowWarn,
    plan: "DeepSeek \u7F51\u9875\u7248"
  };
  let extra2 = null;
  try {
    const hist = findHistory(root);
    if (hist && hist.items.length) {
      const pts = hist.items.map((it) => ({ label: toLabel(it[hist.dateKey]), value: toNum(it[hist.valueKey]) || 0 })).filter((p) => p.label !== null).slice(-60);
      if (pts.length) {
        const total = pts.reduce((s, p) => s + p.value, 0);
        const last = pts[pts.length - 1];
        extra2 = {
          stats: [
            { label: "\u6700\u65B0" + last.label, value: fmtInt(last.value) },
            { label: "\u7D2F\u8BA1(" + pts.length + "\u5929)", value: fmtInt(total) }
          ],
          chart: { title: "\u4F7F\u7528\u8D8B\u52BF", labels: pts.map((p) => p.label), values: pts.map((p) => p.value) }
        };
      }
    }
  } catch {
  }
  return { billing, extra: extra2 };
}
async function fetchWebSummary(params, cookie, token, fetchImpl) {
  const headers = {};
  if (cookie) headers["Cookie"] = String(cookie).trim();
  if (token) {
    const t = String(token).trim();
    headers["Authorization"] = /^bearer\s/i.test(t) ? t.replace(/^bearer\s/i, "Bearer ") : "Bearer " + t;
  }
  const res = await fetchImpl(SUMMARY_URL, { headers, cache: "no-store" });
  const code = res.status;
  const text = await res.text();
  if (code === 401 || code === 403)
    throw new Error("DeepSeek \u7F51\u9875\u4F1A\u8BDD\u5931\u6548(" + code + ")\uFF1A\u91CD\u65B0\u767B\u5F55\u540E\u66F4\u65B0 cookie \u4E0E token");
  if (code === 429) throw new Error("DeepSeek \u9650\u6D41(429),\u7A0D\u540E\u91CD\u8BD5");
  if (code !== 200) throw new Error("DeepSeek \u6C47\u603B\u63A5\u53E3 HTTP " + code + ":" + text.slice(0, 100));
  let j = null;
  try {
    j = JSON.parse(text);
  } catch {
    throw new Error("\u6C47\u603B\u63A5\u53E3\u8FD4\u56DE\u975E JSON(" + text.length + "B):" + text.slice(0, 80));
  }
  const jr = j ?? {};
  if (jr && jr["error"]) {
    const em = isRecord2(jr["error"]) ? String(jr["error"]["message"] ?? "") : "";
    throw new Error("\u6C47\u603B\u63A5\u53E3\u62A5\u9519:" + (em || text.slice(0, 80)));
  }
  let parsed;
  try {
    parsed = parseUserSummary(j, { lowWarn: params["lowWarn"] });
  } catch (e) {
    throw new Error(e?.message || "\u6C47\u603B\u89E3\u6790\u5931\u8D25", { cause: e });
  }
  if (params["currency"]) parsed.billing["currency"] = String(params["currency"]);
  return { billingKind: "payg", billing: parsed.billing, extra: parsed.extra };
}
var deepseekWeb = {
  type: "deepseek-web",
  label: "DS\u7F51",
  title: "deepseek-web\uFF08\u7F51\u9875\u8D26\u5355\uFF09",
  secretField: "token",
  secretFields: ["token", "cookie"],
  hint: "\u7F51\u9875\u8D26\u5355\u6293\u5305\u63A5\u53E3\uFF1A\u4F59\u989D + \u5386\u53F2\u4F7F\u7528\u8D8B\u52BF\u3002\u53EA\u8981 token\uFF08\u5DF2\u9A8C\u8BC1\u5355 Bearer \u53EF\u7528\uFF09\u3002\u4F1A\u8BDD\u8FC7\u671F\u540E\u9700\u91CD\u7C98\u3002",
  fields: [
    {
      key: "token",
      label: "token *",
      kind: "secret",
      mono: true,
      required: true,
      placeholder: "\u7C98\u8D34 Bearer \u4F1A\u8BDD\u7968\u636E",
      hint: "\u4F1A\u8BDD\u7968\u636E\uFF1Aplatform.deepseek.com \u767B\u5F55\u540E\uFF0C\u5F00\u53D1\u8005\u5DE5\u5177 \u2192 Network \u627E\u5230 get_user_summary \u8BF7\u6C42 \u2192 authorization \u5934\u91CC Bearer \u540E\u9762\u7684\u90A3\u4E32\uFF08ciYi \u5F00\u5934\uFF09\u3002\u4F1A\u8BDD\u8FC7\u671F\u540E\u9700\u91CD\u65B0\u7C98\u8D34\u3002\u5EFA\u8BAE\u5148\u5B58\u5165\u7CFB\u7EDF\u51ED\u636E\u518D\u586B $NAME\u3002"
    },
    {
      key: "lowWarn",
      label: "\u4F4E\u4F59\u989D\u9884\u8B66\u7EBF",
      kind: "number",
      placeholder: "\u5982\uFF1A20",
      hint: "\u4F59\u989D\u4F4E\u4E8E\u6B64\u503C\u65F6\u4FA7\u8FB9\u680F\u9EC4\u8272\u63D0\u9192\uFF08\u4E0E\u8D26\u5355\u5E01\u79CD\u540C\u5355\u4F4D\uFF09\u3002"
    }
  ],
  sanitizeParams(raw) {
    const src = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const out = {};
    for (const k of Object.keys(src)) {
      const v = src[k];
      if (v !== void 0) out[k] = typeof v === "string" ? normalizeSecretRef(v) : v;
    }
    if (typeof out["cookie"] === "string") out["cookie"] = normalizeSecretRef(out["cookie"]);
    if (typeof out["token"] === "string") out["token"] = normalizeSecretRef(out["token"]);
    return out;
  },
  maskParams(params) {
    const out = { ...params };
    for (const k of ["token", "cookie"]) {
      if (typeof out[k] === "string" && out[k] !== "" && secretKindOfRaw(out[k]) === "plain") out[k] = "";
    }
    return out;
  },
  validateParams() {
    return "";
  },
  async fetch(vendor, deps) {
    const params = vendor && vendor.params || {};
    const strOf = (v) => typeof v === "string" ? v : "";
    const rc = await deps.resolveSecret(strOf(params["cookie"]));
    const rt = await deps.resolveSecret(strOf(params["token"]));
    if (!rt.value) {
      throw new Error("token \u672A\u914D\u7F6E:\u8BF7\u7C98\u8D34 Bearer \u4F1A\u8BDD\u7968\u636E\uFF08\u83B7\u53D6\u65B9\u5F0F\u89C1\u5B57\u6BB5\u8BF4\u660E\uFF09");
    }
    const data = await fetchWebSummary(params, rc.value, rt.value, deps && deps.fetchImpl || fetch);
    return { ...data, secretKind: rt.value ? rt.kind : rc.kind, via: "\u7F51\u9875\u63A5\u53E3" };
  }
};
function isRecord2(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
var deepseek_web_default = deepseekWeb;

// src/host/providers/deepseek.ts
function stripBearer(v) {
  const t = String(v || "").trim();
  const m = t.match(/^bearer\s+(.+)$/i);
  return m ? m[1].trim() : t;
}
function looksOfficial(v) {
  return /^sk-[A-Za-z0-9_-]{8,}$/.test(stripBearer(v));
}
var isWebAuthErr = (msg) => /会话失效\(40[13]\)/.test(msg || "");
var isApiAuthErr = (msg) => /密钥无效\(401\)/.test(msg || "");
var deepseek = {
  type: "deepseek",
  label: "DS",
  title: "deepseek\uFF08\u5B98\u65B9\xB7\u81EA\u52A8\uFF09",
  secretField: "token",
  secretFields: ["token", "apiKey", "cookie"],
  hint: "\u81EA\u52A8\u9009\u8DEF\uFF1Ask- \u5F00\u5934\u8D70\u5B98\u65B9\u4F59\u989D\u63A5\u53E3\uFF0C\u5176\u4F59\u8D70\u7F51\u9875\u8D26\u5355\uFF08\u542B\u5386\u53F2\u8D8B\u52BF\uFF09\uFF1B\u540C\u65F6\u914D\u7F6E\u4F18\u5148\u7528 token \u8D70\u7F51\u9875\uFF0C\u4E00\u8DEF\u5931\u6548\u81EA\u52A8\u6362\u8DEF\u3002\u5206\u5F00\u914D\u8BF7\u7528 deepseek-api / deepseek-web\u3002",
  fields: [
    {
      key: "apiKey",
      label: "apiKey",
      kind: "secret",
      mono: true,
      placeholder: "\u586B $NAME \u5F15\u7528\uFF08\u63A8\u8350\uFF09\u6216\u7C98\u8D34\u660E\u6587",
      hint: "\u5B98\u65B9\u4F59\u989D\u63A5\u53E3\u7528\uFF1A\u5F00\u653E\u5E73\u53F0 \u2192 API keys \u521B\u5EFA\uFF08sk- \u5F00\u5934\uFF0C\u957F\u671F\u6709\u6548\uFF09\u3002\u53EA\u586B\u5B83\u4E5F\u80FD\u67E5\u4F59\u989D\uFF08\u65E0\u5386\u53F2\u8D8B\u52BF\uFF09\uFF1Bsk- \u683C\u5F0F\u4F1A\u88AB\u81EA\u52A8\u9001\u5F80\u5B98\u65B9\u63A5\u53E3\u3002"
    },
    {
      key: "token",
      label: "token",
      kind: "secret",
      mono: true,
      placeholder: "\u7C98\u8D34 Bearer \u4F1A\u8BDD\u7968\u636E\uFF08\u7F51\u9875\u63A5\u53E3\u7528\uFF09",
      hint: "\u7F51\u9875\u63A5\u53E3\u7528\uFF1Aplatform.deepseek.com \u767B\u5F55\u540E\uFF0CNetwork \u91CC get_user_summary \u8BF7\u6C42\u7684 authorization \u5934 Bearer \u540E\u9762\u7684\u4E32\uFF08ciYi \u5F00\u5934\uFF09\u3002\u975E sk- \u683C\u5F0F\u4F1A\u88AB\u81EA\u52A8\u9001\u5F80\u7F51\u9875\u63A5\u53E3\uFF1B\u4E0E apiKey \u540C\u65F6\u586B\u65F6\u4F18\u5148\u7528\u5B83\u3002\u4F1A\u8BDD\u8FC7\u671F\u540E\u9700\u91CD\u7C98\u3002"
    },
    {
      key: "lowWarn",
      label: "\u4F4E\u4F59\u989D\u9884\u8B66\u7EBF",
      kind: "number",
      placeholder: "\u5982\uFF1A20",
      hint: "\u4F59\u989D\u4F4E\u4E8E\u6B64\u503C\u65F6\u4FA7\u8FB9\u680F\u9EC4\u8272\u63D0\u9192\uFF08\u4E0E\u6240\u9009\u5E01\u79CD\u540C\u5355\u4F4D\uFF09\u3002"
    },
    {
      key: "currency",
      label: "\u4F18\u5148\u5E01\u79CD",
      kind: "text",
      mono: true,
      placeholder: "\u9ED8\u8BA4 CNY\uFF0C\u53EF\u586B USD",
      hint: "\u591A\u5E01\u79CD\u8D26\u6237\u65F6\u4F18\u5148\u5C55\u793A\u7684\u5E01\u79CD\uFF1B\u4E0D\u586B\u5219\u81EA\u52A8\u5F52\u4E00\uFF08CNY \u4F18\u5148\uFF09\u3002\u4EC5\u5B98\u65B9\u63A5\u53E3\u591A\u5E01\u79CD\u65F6\u6709\u6548\u3002"
    }
  ],
  sanitizeParams(raw) {
    const src = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const out = {};
    for (const k of Object.keys(src)) {
      const v = src[k];
      if (v !== void 0) out[k] = typeof v === "string" ? normalizeSecretRef(v) : v;
    }
    for (const k of ["apiKey", "token", "cookie"]) {
      if (typeof out[k] === "string") out[k] = normalizeSecretRef(out[k]);
    }
    return out;
  },
  maskParams(params) {
    const out = { ...params };
    for (const k of ["apiKey", "token", "cookie"]) {
      if (typeof out[k] === "string" && out[k] !== "" && secretKindOfRaw(out[k]) === "plain") out[k] = "";
    }
    return out;
  },
  validateParams() {
    return "";
  },
  async fetch(vendor, deps) {
    const params = vendor && vendor.params || {};
    const strOf = (v) => typeof v === "string" ? v : "";
    const rCookie = await deps.resolveSecret(strOf(params["cookie"]));
    const rToken = await deps.resolveSecret(strOf(params["token"]));
    const rKey = await deps.resolveSecret(strOf(params["apiKey"]));
    const fetchImpl = deps && deps.fetchImpl || fetch;
    const bearers = [];
    if (rToken.value) bearers.push({ ...rToken, via: "web" });
    if (rKey.value) bearers.push({ ...rKey, via: looksOfficial(rKey.value) ? "api" : "web" });
    for (const b of bearers) {
      if (b.via === "web" && looksOfficial(b.value)) b.via = "api";
    }
    if (!bearers.length && !rCookie.value) {
      throw new Error(
        "\u51ED\u636E\u672A\u914D\u7F6E:apiKey \u4E0E token \u81F3\u5C11\u586B\u4E00\u4E2A\uFF08sk- \u5F00\u5934\u8D70\u5B98\u65B9\uFF0C\u5176\u4F59\u8D70\u7F51\u9875\uFF0C\u83B7\u53D6\u65B9\u5F0F\u89C1\u5B57\u6BB5\u8BF4\u660E\uFF09"
      );
    }
    const order = [];
    const firstVia = bearers.length ? bearers[0].via : "web";
    order.push(firstVia);
    if (bearers.some((b) => b.via !== firstVia)) order.push(firstVia === "web" ? "api" : "web");
    let lastErr = null;
    for (const which of order) {
      if (which === "web") {
        const wb = bearers.filter((b) => b.via === "web")[0];
        if (!wb && !rCookie.value) continue;
        try {
          const data = await fetchWebSummary(params, rCookie.value, wb ? wb.value : "", fetchImpl);
          return { ...data, secretKind: wb ? wb.kind : rCookie.kind, via: "\u7F51\u9875\u63A5\u53E3" };
        } catch (e) {
          lastErr = e;
          if (!isWebAuthErr(e?.message || "")) throw e;
        }
      } else {
        const kb = bearers.filter((b) => b.via === "api")[0];
        if (!kb) continue;
        try {
          const data = await fetchOfficialBalance(params, kb.value, fetchImpl);
          return { ...data, secretKind: kb.kind, via: "\u5B98\u65B9\u63A5\u53E3" };
        } catch (e) {
          lastErr = e;
          if (!isApiAuthErr(e?.message || "")) throw e;
        }
      }
    }
    throw lastErr || new Error("\u62C9\u53D6\u5931\u8D25");
  }
};
var deepseek_default = deepseek;

// src/host/providers/manual.ts
var manual = {
  type: "manual",
  label: "\u624B\u52A8",
  title: "manual\uFF08\u624B\u52A8\uFF09",
  secretField: "",
  hint: "\u672C\u5730\u8D26\u672C\uFF0C\u65E0\u9700\u62C9\u53D6\uFF1Arolling \u586B total/used\uFF1Bpayg \u586B balance/granted/lowWarn\u3002",
  fields: [
    {
      key: "billing",
      label: "\u8BA1\u8D39\u5F62\u6001",
      kind: "select",
      options: [
        { value: "rolling", label: "\u6EDA\u52A8\u5237\u65B0" },
        { value: "payg", label: "\u6309\u91CF\u4ED8\u8D39" }
      ],
      hint: "rolling=\u5468\u671F\u6EDA\u52A8\u7684\u8BA2\u9605\u989D\u5EA6\uFF08\u586B\u603B\u989D/\u5DF2\u7528\uFF09\uFF1Bpayg=\u7528\u591A\u5C11\u6263\u591A\u5C11\u7684\u4F59\u989D\uFF08\u586B\u4F59\u989D/\u9884\u8B66\u7EBF\uFF09\u3002"
    },
    {
      key: "total",
      label: "\u603B\u989D\u5EA6",
      kind: "number",
      placeholder: "\u5982\uFF1A1000",
      showWhen: { key: "billing", eq: "rolling" },
      hint: "\u5468\u671F\u5185\u53EF\u7528\u603B\u989D\u5EA6\uFF08\u5982\u5305\u6708 1000 \u6B21\uFF09\u3002"
    },
    {
      key: "used",
      label: "\u5DF2\u7528",
      kind: "number",
      placeholder: "\u5982\uFF1A100",
      showWhen: { key: "billing", eq: "rolling" },
      hint: "\u672C\u5468\u671F\u5DF2\u6D88\u8017\u91CF\uFF0C\u624B\u52A8\u66F4\u65B0\u3002"
    },
    {
      key: "balance",
      label: "\u4F59\u989D",
      kind: "number",
      placeholder: "\u5982\uFF1A50",
      showWhen: { key: "billing", eq: "payg" },
      hint: "\u5F53\u524D\u5269\u4F59\u53EF\u6263\u91D1\u989D\uFF0C\u624B\u52A8\u66F4\u65B0\u3002"
    },
    {
      key: "granted",
      label: "\u603B\u989D\u5EA6",
      kind: "number",
      placeholder: "\u5982\uFF1A100",
      showWhen: { key: "billing", eq: "payg" },
      hint: "\u7D2F\u8BA1\u5145\u503C/\u83B7\u8D60\u603B\u989D\uFF08\u4EC5\u5C55\u793A\u7528\uFF0C\u53EF\u4E0D\u586B\uFF09\u3002"
    },
    {
      key: "lowWarn",
      label: "\u9884\u8B66\u7EBF",
      kind: "number",
      placeholder: "\u5982\uFF1A10",
      showWhen: { key: "billing", eq: "payg" },
      hint: "\u4F59\u989D\u4F4E\u4E8E\u6B64\u503C\u65F6\u4FA7\u8FB9\u680F\u9EC4\u8272\u63D0\u9192\u3002"
    }
  ],
  sanitizeParams(raw) {
    const src = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const out = {};
    for (const k of Object.keys(src)) {
      if (src[k] !== void 0) out[k] = src[k];
    }
    return out;
  },
  validateParams() {
    return "";
  },
  async fetch(vendor) {
    const p = vendor && vendor.params || {};
    if ((p["billing"] || "rolling") === "payg") {
      return {
        billingKind: "payg",
        billing: {
          balance: Number(p["balance"]) || 0,
          currency: "CNY",
          granted: p["granted"] !== void 0 && p["granted"] !== "" && p["granted"] !== null ? Number(p["granted"]) : null,
          toppedUp: null,
          isAvailable: null,
          infos: [],
          lowWarn: p["lowWarn"] !== void 0 && p["lowWarn"] !== "" && p["lowWarn"] !== null ? Number(p["lowWarn"]) : null,
          plan: vendor.name
        }
      };
    }
    const total = Number(p["total"]) || 0;
    const used = Number(p["used"]) || 0;
    const pct = total > 0 ? Math.min(100, used / total * 100) : 0;
    return {
      billingKind: "rolling",
      windows: [{ key: "w", label: "\u989D\u5EA6", pct, used, limit: total, resetInSec: 0 }],
      billing: {}
    };
  }
};
var manual_default = manual;

// src/host/providers/index.ts
var registry = /* @__PURE__ */ new Map();
var ALIASES = /* @__PURE__ */ new Map();
function registerProvider(adapter) {
  const err = checkAdapterShape(adapter);
  if (err) throw new Error("[token-meter] \u975E\u6CD5 provider \u9002\u914D\u5668: " + err);
  if (registry.has(adapter.type)) {
    throw new Error("[token-meter] provider \u7C7B\u578B\u91CD\u590D\u6CE8\u518C: " + adapter.type);
  }
  registry.set(adapter.type, adapter);
}
function registerAlias(from2, to) {
  if (typeof from2 !== "string" || typeof to !== "string" || !from2 || !to) {
    throw new Error("[token-meter] \u522B\u540D\u5FC5\u987B\u4E3A\u975E\u7A7A\u5B57\u7B26\u4E32");
  }
  if (!registry.has(to)) {
    throw new Error("[token-meter] \u522B\u540D\u76EE\u6807\u672A\u6CE8\u518C: " + to);
  }
  if (registry.has(from2)) {
    throw new Error("[token-meter] \u522B\u540D\u4E0E\u73B0\u5F79\u7C7B\u578B\u51B2\u7A81: " + from2);
  }
  let cur = to;
  const seen = /* @__PURE__ */ new Set([from2]);
  while (ALIASES.has(cur)) {
    cur = ALIASES.get(cur);
    if (seen.has(cur)) throw new Error("[token-meter] \u522B\u540D\u5FAA\u73AF: " + from2);
    seen.add(cur);
  }
  ALIASES.set(from2, to);
}
function canonicalType(type) {
  let cur = type;
  const seen = /* @__PURE__ */ new Set();
  while (typeof cur === "string" && ALIASES.has(cur)) {
    cur = ALIASES.get(cur);
    if (seen.has(cur)) break;
    seen.add(cur);
  }
  return cur;
}
function getSecretField(type) {
  const p = registry.get(canonicalType(type));
  return p ? p.secretField : "";
}
function getProvider(type) {
  return registry.get(canonicalType(type));
}
function hasProvider(type) {
  if (registry.has(type)) return true;
  return ALIASES.has(type);
}
function listProviders() {
  return [...registry.values()];
}
function providerTypes() {
  return [...registry.keys(), ...ALIASES.keys()];
}
function secretKeysOf(p) {
  const list = [];
  if (p && typeof p.secretField === "string" && p.secretField) list.push(p.secretField);
  if (p && Array.isArray(p.secretFields)) {
    for (const k of p.secretFields) {
      if (typeof k === "string" && k && list.indexOf(k) === -1) list.push(k);
    }
  }
  return list;
}
function secretPresent(v) {
  return typeof v === "string" ? v.trim() !== "" : v !== void 0 && v !== null && v !== "";
}
function readSecretValue(vendor) {
  const t = canonicalType(vendor && vendor.type);
  const p = typeof t === "string" ? registry.get(t) : void 0;
  const params = vendor && vendor.params && typeof vendor.params === "object" ? vendor.params : {};
  if (!p) return "";
  if (typeof p.readSecret === "function") {
    try {
      const v = p.readSecret(params);
      return v === void 0 || v === null ? "" : String(v);
    } catch {
      return "";
    }
  }
  for (const k of secretKeysOf(p)) {
    const v = params[k];
    if (secretPresent(v)) return String(v);
  }
  return "";
}
function locateSecretKey(vendor) {
  const t = canonicalType(vendor && vendor.type);
  const p = typeof t === "string" ? registry.get(t) : void 0;
  const params = vendor && vendor.params && typeof vendor.params === "object" ? vendor.params : {};
  if (!p) return "";
  for (const k of secretKeysOf(p)) {
    if (secretPresent(params[k])) return k;
  }
  return p.secretField || "";
}
function secretKindOf(vendor) {
  const t = canonicalType(vendor && vendor.type);
  const p = typeof t === "string" ? registry.get(t) : void 0;
  if (!p || !p.secretField) return "none";
  const val = readSecretValue(vendor);
  if (val === void 0 || val === null || val === "") return "empty";
  return secretKindOfRaw(String(val));
}
function maskParamsForType(type, raw) {
  const p = registry.get(canonicalType(type));
  const src = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  if (p && typeof p.maskParams === "function") {
    try {
      return p.maskParams({ ...src });
    } catch {
      return { ...src };
    }
  }
  const out = { ...src };
  for (const f of secretKeysOf(p)) {
    if (typeof out[f] === "string" && out[f] !== "" && secretKindOfRaw(out[f]) === "plain") out[f] = "";
  }
  return out;
}
function sanitizeParamsForType(type, raw) {
  const p = registry.get(canonicalType(type));
  if (p && typeof p.sanitizeParams === "function") return p.sanitizeParams(raw);
  const src = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  return { ...src };
}
function describeProviders() {
  return listProviders().map((p) => ({
    type: p.type,
    label: p.label,
    title: p.title,
    secretField: p.secretField,
    hint: p.hint || "",
    fields: (p.fields || []).map((f) => {
      const out = {
        key: f.key,
        label: f.label,
        kind: f.kind
      };
      if (f.mono !== void 0) out.mono = !!f.mono;
      if (f.placeholder !== void 0) out.placeholder = f.placeholder || "";
      if (f.required !== void 0) out.required = !!f.required;
      if (Array.isArray(f.options)) out.options = f.options.map((o) => ({ value: o.value, label: o.label }));
      if (f.showWhen) out.showWhen = { key: f.showWhen.key, eq: f.showWhen.eq };
      if (f.hint !== void 0) out.hint = f.hint || "";
      return out;
    })
  }));
}
registerProvider(opencode_default);
registerProvider(deepseek_default);
registerProvider(deepseek_api_default);
registerProvider(deepseek_web_default);
registerProvider(manual_default);
registerAlias("opencode-go", "opencode");
registerAlias("opencode-zen", "opencode");

// src/host/config.ts
var NS = settingsNamespace("dshp-token-meter");
var PREV_QUOTA_KEY = "dshp-inx-token-quota";
var PREV_STATS_KEY = "dshp-inx-token-stats";
var LEGACY_SETTINGS_KEYS = [PREV_QUOTA_KEY, PREV_STATS_KEY];
var DEFAULT_CONFIG = {
  version: 1,
  activeVendor: "",
  refreshSec: 60,
  enabled: true,
  vendors: [],
  showToday: false,
  defaultRange: "30"
};
var VendorSchema = Schema.object({
  id: Schema.string().required(),
  name: Schema.string().required(),
  type: Schema.string().default("manual"),
  params: Schema.dict(Schema.any()).default({})
});
var ConfigSchema = Schema.object({
  version: Schema.number().step(1).default(1),
  activeVendor: Schema.string().default(""),
  refreshSec: Schema.number().step(1).min(0).max(3600).default(60),
  enabled: Schema.boolean().default(true),
  vendors: Schema.array(VendorSchema).default([]),
  showToday: Schema.boolean().default(false),
  defaultRange: Schema.union([Schema.const("7"), Schema.const("30"), Schema.const("90"), Schema.const("all")]).default("30")
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
function legacyQuotaConfigPath() {
  return join(dshHome(), "storages", "token-quota.json");
}
function settingsYamlPath() {
  return join(dshHome(), "settings.yaml");
}
function isRecord3(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function isDefaultRange(v) {
  return v === "7" || v === "30" || v === "90" || v === "all";
}
function normSec(v) {
  if (v === 0 || v === "0") return 0;
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return 60;
  return Math.min(3600, Math.max(10, n));
}
function sanitizeVendor(raw) {
  if (!isRecord3(raw)) return null;
  const id = raw["id"] !== void 0 && raw["id"] !== null ? String(raw["id"]).trim() : "";
  const nm = raw["name"] !== void 0 && raw["name"] !== null ? String(raw["name"]).trim() : "";
  const typeRaw = raw["type"] !== void 0 && raw["type"] !== null ? String(raw["type"]) : "manual";
  const type = canonicalType(typeRaw);
  if (!ID_RE.test(id)) return null;
  if (!nm) return null;
  if (!hasProvider(type)) return null;
  const params = sanitizeParamsForType(type, raw["params"]);
  for (const k of Object.keys(params)) {
    const pv = params[k];
    if (typeof pv === "string") params[k] = normalizeSecretRef(pv);
  }
  return { id, name: nm, type, params };
}
function sanitizePatchConfig(raw) {
  if (!isRecord3(raw)) return null;
  const out = {};
  if (Object.hasOwn(raw, "activeVendor") && typeof raw["activeVendor"] === "string")
    out.activeVendor = raw["activeVendor"];
  if (Object.hasOwn(raw, "refreshSec") && raw["refreshSec"] !== void 0 && raw["refreshSec"] !== null && raw["refreshSec"] !== "") {
    out.refreshSec = normSec(raw["refreshSec"]);
  }
  if (Object.hasOwn(raw, "enabled")) out.enabled = raw["enabled"] === true;
  if (Object.hasOwn(raw, "vendors") && Array.isArray(raw["vendors"])) {
    out.vendors = raw["vendors"].map(sanitizeVendor).filter((v) => v !== null);
  }
  if (Object.hasOwn(raw, "showToday")) out.showToday = raw["showToday"] === true;
  if (Object.hasOwn(raw, "defaultRange") && isDefaultRange(raw["defaultRange"]))
    out.defaultRange = raw["defaultRange"];
  return out;
}
function sanitizePersisted(raw) {
  if (!isRecord3(raw)) return null;
  const out = { ...DEFAULT_CONFIG, vendors: [] };
  if (typeof raw["activeVendor"] === "string") out.activeVendor = raw["activeVendor"];
  if (raw["refreshSec"] !== void 0 && raw["refreshSec"] !== null && raw["refreshSec"] !== "")
    out.refreshSec = normSec(raw["refreshSec"]);
  if (Object.hasOwn(raw, "enabled")) out.enabled = raw["enabled"] === true;
  if (Array.isArray(raw["vendors"]))
    out.vendors = raw["vendors"].map(sanitizeVendor).filter((v) => v !== null);
  if (Object.hasOwn(raw, "showToday")) out.showToday = raw["showToday"] === true;
  if (isDefaultRange(raw["defaultRange"])) out.defaultRange = raw["defaultRange"];
  return out;
}
function loadPersistedQuota() {
  try {
    const p = legacyQuotaConfigPath();
    if (!existsSync(p)) return null;
    const text = readFileSync(p, "utf8");
    const cfg = sanitizePersisted(JSON.parse(text));
    if (cfg) return { config: cfg, source: p };
  } catch {
  }
  return null;
}
function topLevelIndex(lines, key) {
  const re = new RegExp(`^${key}:\\s*(#.*)?$`);
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) return i;
  }
  return -1;
}
function blockBody(lines, start) {
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || /^\s/.test(line) || line.trimStart().startsWith("#")) {
      if (/^[A-Za-z0-9_-]+:\s*(#.*)?$/.test(line)) break;
      out.push(line);
    } else break;
  }
  while (out.length > 0 && out[out.length - 1].trim() === "") out.pop();
  return out;
}
function migrateYamlNamespaces() {
  try {
    const p = settingsYamlPath();
    if (!existsSync(p)) return;
    const text = readFileSync(p, "utf8");
    const lines = text.split("\n");
    const newIdx = topLevelIndex(lines, NS);
    const hits = LEGACY_SETTINGS_KEYS.map((key) => ({ key, idx: topLevelIndex(lines, key) })).filter(
      (h) => h.idx >= 0
    );
    if (hits.length === 0) return;
    if (newIdx >= 0) {
      try {
        console.info(
          `[dshp-token-meter] settings.yaml \u540C\u65F6\u5B58\u5728 ${hits.map((h) => h.key).join(" \u4E0E ")} \u4E0E dshp-token-meter\uFF0C\u4EE5\u65B0 key \u4E3A\u51C6\uFF0C\u8BF7\u624B\u52A8\u5220\u9664\u65E7\u6BB5\u843D`
        );
      } catch {
      }
      return;
    }
    const body = [];
    for (const h of hits) body.push(...blockBody(lines, h.idx));
    if (body.length === 0) return;
    const addition = ["", "dshp-token-meter:", ...body].join("\n");
    const next = text.endsWith("\n") ? text + addition.slice(1) + "\n" : text + addition + "\n";
    writeFileSync(p, next, "utf8");
    try {
      console.info(
        `[dshp-token-meter] \u5DF2\u5C06 settings.yaml \u9876\u5C42 ${hits.map((h) => h.key).join(" + ")} \u5408\u5E76\u4E3A dshp-token-meter\uFF08\u65E7\u6BB5\u843D\u4FDD\u7559\uFF0C\u8BF7\u786E\u8BA4\u540E\u624B\u52A8\u5220\u9664\uFF09`
      );
    } catch {
    }
  } catch (e) {
    try {
      console.warn(
        "[dshp-token-meter] settings.yaml \u547D\u540D\u7A7A\u95F4\u5408\u5E76\u5931\u8D25\uFF1A" + String(e?.message ?? e)
      );
    } catch {
    }
  }
}

// src/host/quota.ts
function isRecord4(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function sanitizeCfg(cfg) {
  const vs = Array.isArray(cfg.vendors) ? cfg.vendors : [];
  const av = cfg.activeVendor !== void 0 && cfg.activeVendor !== null ? String(cfg.activeVendor) : vs[0] && vs[0].id || "";
  return {
    version: 1,
    activeVendor: av,
    refreshSec: cfg.refreshSec,
    enabled: cfg.enabled !== false,
    vendors: vs.filter((v) => v && v.id && v.name && v.type).map((v) => {
      const vv = v;
      const rawParams = vv.params && typeof vv.params === "object" ? vv.params : {};
      const kind = secretKindOf({ type: vv.type, params: rawParams });
      const params = maskParamsForType(vv.type, rawParams);
      const out = {
        id: String(vv.id),
        name: String(vv.name),
        type: String(vv.type),
        params,
        secretKind: kind
      };
      return out;
    })
  };
}
async function refreshOne(st, resolveSecret, v) {
  const snap = {
    vendorId: v.id,
    vendorName: v.name,
    ok: false,
    at: (/* @__PURE__ */ new Date()).toISOString(),
    fetchedAtMs: Date.now()
  };
  try {
    const adapter = getProvider(v.type);
    if (!adapter) throw new Error("\u672A\u77E5\u4F9B\u5E94\u5546\u7C7B\u578B:" + v.type);
    const data = await adapter.fetch(v, { resolveSecret, fetchImpl: fetch });
    if (!data) throw new Error("\u672A\u77E5\u4F9B\u5E94\u5546\u7C7B\u578B:" + v.type);
    snap.ok = true;
    snap.billingKind = data.billingKind;
    if (data.windows) snap.windows = data.windows;
    if (data.billing) snap.billing = data.billing;
    if (data.secretKind) snap.secretKind = data.secretKind;
    if (data.extra !== void 0 && data.extra !== null) {
      try {
        snap.extra = JSON.parse(JSON.stringify(data.extra));
      } catch {
      }
    }
    if (typeof data.via === "string" && data.via) snap.via = data.via.slice(0, 24);
  } catch (e) {
    snap.ok = false;
    snap.error = e?.message || "\u62C9\u53D6\u5931\u8D25";
  }
  st.snaps[v.id] = snap;
  st.lastPullMs = Date.now();
  return snap;
}
function checkVendor(v) {
  if (!v || typeof v !== "object") return "\u4F9B\u5E94\u5546\u4E3A\u7A7A";
  const r = v;
  if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(r["id"] || ""))
    return "ID \u975E\u6CD5(\u5C0F\u5199\u5B57\u6BCD/\u6570\u5B57/\u6A2A\u7EBF,2-31\u4F4D)";
  if (!r["name"]) return "\u663E\u793A\u540D\u5B57\u5FC5\u586B";
  if (!hasProvider(String(r["type"]))) return "\u672A\u77E5\u7C7B\u578B";
  r["params"] = r["params"] && typeof r["params"] === "object" ? r["params"] : {};
  return "";
}
function mergeVendorSecret(stored, incoming) {
  const f = getSecretField(incoming.type);
  if (!f) return incoming;
  const key = stored && locateSecretKey(stored) || f;
  const nextVal = incoming.params ? incoming.params[key] : "";
  const prevVal = stored ? readSecretValue(stored) : "";
  const prevKind = stored ? secretKindOf(stored) : "empty";
  const incomingHasSecret = readSecretValue(incoming) !== "";
  if (!incomingHasSecret && (nextVal === void 0 || nextVal === null || nextVal === "") && prevKind === "plain" && prevVal) {
    return { ...incoming, params: { ...incoming.params, [key]: prevVal } };
  }
  return incoming;
}
function settingsDocPath(ctx) {
  try {
    const settings = ctx.get("settings");
    if (settings && typeof settings.documentPath === "string") {
      const p = settings.documentPath;
      const idx = p.lastIndexOf("/");
      const name2 = idx === -1 ? p : p.slice(idx + 1);
      return name2 === "settings.yaml" ? "$DSH_HOME/settings.yaml" : name2;
    }
  } catch {
  }
  return "";
}
var BASE = "/ext/dshp-token-meter";
function registerQuotaRoutes(ctx, deps) {
  const { getConfig, updateConfig, resolveSecret, st } = deps;
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: `${BASE}/state`,
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        try {
          const cfg = getConfig();
          return json(res, 200, {
            ok: true,
            namespace: NS,
            docPath: settingsDocPath(ctx),
            config: {
              ...sanitizeCfg(cfg),
              showToday: cfg.showToday === true,
              defaultRange: cfg.defaultRange
            },
            snaps: st.snaps,
            providers: describeProviders(),
            providerTypes: providerTypes()
          });
        } catch (e) {
          return json(res, 200, { ok: false, error: e?.message || "\u52A0\u8F7D\u5931\u8D25" });
        }
      }
    }),
    "dshp-token-meter: state route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: `${BASE}/refresh`,
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        try {
          const cfg = getConfig();
          const a = body ?? {};
          const list = a["id"] ? cfg.vendors.filter((v) => v.id === a["id"]) : cfg.vendors;
          if (a["id"] && !list.length)
            return json(res, 200, { ok: false, error: "\u672A\u77E5\u4F9B\u5E94\u5546:" + String(a["id"]) });
          for (const v of list) await refreshOne(st, resolveSecret, v);
          return json(res, 200, { ok: true, snaps: st.snaps });
        } catch (e) {
          return json(res, 200, { ok: false, error: e?.message || "\u5237\u65B0\u5931\u8D25" });
        }
      }
    }),
    "dshp-token-meter: refresh route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: `${BASE}/set-active`,
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        try {
          const cfg = getConfig();
          const b = body ?? {};
          const id = b["id"] !== void 0 && b["id"] !== null ? String(b["id"]) : "";
          if (id !== "" && !cfg.vendors.some((v) => v.id === id))
            return json(res, 200, { ok: false, error: "\u672A\u77E5\u4F9B\u5E94\u5546" });
          await updateConfig({ activeVendor: id });
          return json(res, 200, { ok: true });
        } catch (e) {
          return json(res, 200, { ok: false, error: e?.message || "\u5207\u6362\u5931\u8D25" });
        }
      }
    }),
    "dshp-token-meter: set-active route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: `${BASE}/set-refresh`,
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        try {
          const b = body ?? {};
          const raw = b ? b["sec"] : void 0;
          if (raw === void 0 || raw === null || raw === "")
            return json(res, 200, { ok: false, error: "\u79D2\u6570\u5FC5\u586B(0=\u5173\u95ED\u81EA\u52A8\u5237\u65B0)" });
          if (!Number.isFinite(Number(raw))) return json(res, 200, { ok: false, error: "\u79D2\u6570\u975E\u6CD5" });
          const n = (function(v) {
            if (v === 0 || v === "0") return 0;
            const nn = Math.floor(Number(v));
            if (!Number.isFinite(nn)) return 60;
            return Math.min(3600, Math.max(10, nn));
          })(raw);
          await updateConfig({ refreshSec: n });
          return json(res, 200, { ok: true, sec: n });
        } catch (e) {
          return json(res, 200, { ok: false, error: e?.message || "\u4FDD\u5B58\u5931\u8D25" });
        }
      }
    }),
    "dshp-token-meter: set-refresh route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: `${BASE}/set-enabled`,
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        try {
          const b = body ?? {};
          if (!b || !Object.hasOwn(b, "enabled"))
            return json(res, 200, { ok: false, error: "enabled \u5FC5\u586B\uFF08\u5E03\u5C14\u503C\uFF09" });
          const on = b["enabled"] === true;
          await updateConfig({ enabled: on });
          return json(res, 200, { ok: true, enabled: on });
        } catch (e) {
          return json(res, 200, { ok: false, error: e?.message || "\u4FDD\u5B58\u5931\u8D25" });
        }
      }
    }),
    "dshp-token-meter: set-enabled route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: `${BASE}/add-vendor`,
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        try {
          const cfg = getConfig();
          const b = body ?? {};
          const v = b && b["vendor"] || null;
          const err = checkVendor(v);
          if (err) return json(res, 200, { ok: false, error: err });
          const vv = v;
          if (cfg.vendors.some((x) => x.id === vv.id))
            return json(res, 200, { ok: false, error: "ID \u5DF2\u5B58\u5728" });
          await updateConfig({
            vendors: [...cfg.vendors, { id: vv.id, name: vv.name, type: vv.type, params: vv.params }]
          });
          return json(res, 200, { ok: true });
        } catch (e) {
          return json(res, 200, { ok: false, error: e?.message || "\u4FDD\u5B58\u5931\u8D25" });
        }
      }
    }),
    "dshp-token-meter: add-vendor route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: `${BASE}/update-vendor`,
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        try {
          const cfg = getConfig();
          const b = body ?? {};
          const v = b && b["vendor"] || null;
          const err = checkVendor(v);
          if (err) return json(res, 200, { ok: false, error: err });
          const vv = v;
          const i = cfg.vendors.findIndex((x) => x.id === vv.id);
          if (i === -1) return json(res, 200, { ok: false, error: "\u672A\u77E5\u4F9B\u5E94\u5546" });
          const next = cfg.vendors.slice();
          const stored = cfg.vendors[i];
          next[i] = mergeVendorSecret(stored, {
            id: vv.id,
            name: vv.name,
            type: canonicalType(String(vv.type)),
            params: vv.params ?? {}
          });
          await updateConfig({ vendors: next });
          return json(res, 200, { ok: true });
        } catch (e) {
          return json(res, 200, { ok: false, error: e?.message || "\u4FDD\u5B58\u5931\u8D25" });
        }
      }
    }),
    "dshp-token-meter: update-vendor route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: `${BASE}/delete-vendor`,
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        try {
          const cfg = getConfig();
          const b = body ?? {};
          const id = b && b["id"] || "";
          const next = cfg.vendors.filter((v) => v.id !== id);
          const nextActive = cfg.activeVendor === id ? next[0] && next[0].id || "" : cfg.activeVendor;
          if (nextActive !== cfg.activeVendor)
            await updateConfig({ vendors: next, activeVendor: nextActive });
          else await updateConfig({ vendors: next });
          delete st.snaps[id];
          return json(res, 200, { ok: true });
        } catch (e) {
          return json(res, 200, { ok: false, error: e?.message || "\u5220\u9664\u5931\u8D25" });
        }
      }
    }),
    "dshp-token-meter: delete-vendor route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: `${BASE}/secret-to-cred`,
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        try {
          let creds = null;
          try {
            creds = ctx.get("credentials");
          } catch {
            creds = null;
          }
          if (!creds) return json(res, 200, { ok: false, error: "\u51ED\u636E\u670D\u52A1\u4E0D\u53EF\u7528" });
          const cfg = getConfig();
          const b = body ?? {};
          const id = b && b["id"] || "";
          const v = cfg.vendors.filter((x) => x.id === id)[0];
          if (!v) return json(res, 200, { ok: false, error: "\u672A\u77E5\u4F9B\u5E94\u5546" });
          const f = getSecretField(v.type);
          if (!f) return json(res, 200, { ok: false, error: "\u8BE5\u7C7B\u578B\u65E0\u5BC6\u94A5\u5B57\u6BB5" });
          const raw = readSecretValue(v) || "";
          const writeKey = locateSecretKey(v) || f;
          if (typeof raw === "string" && (DOLLAR_REF_RE.test(raw) || ENV_REF_RE.test(raw) || CRED_REF_RE.test(raw))) {
            return json(res, 200, { ok: false, error: "\u5DF2\u7ECF\u662F\u5F15\u7528,\u65E0\u9700\u8F6C\u5B58" });
          }
          const r = await resolveSecret(raw);
          if (!r.value) return json(res, 200, { ok: false, error: "\u5BC6\u94A5\u4E3A\u7A7A" });
          const credName = ("TMETER_" + id.replace(/[^A-Za-z0-9_]/g, "_")).toUpperCase();
          await creds.set(credName, r.value);
          const next = cfg.vendors.map(
            (x) => x.id === id ? { ...x, params: { ...x.params, [writeKey]: "$" + credName } } : x
          );
          await updateConfig({ vendors: next });
          return json(res, 200, { ok: true, cred: credName });
        } catch (e) {
          return json(res, 200, { ok: false, error: e?.message || "\u8F6C\u5B58\u5931\u8D25" });
        }
      }
    }),
    "dshp-token-meter: secret-to-cred route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: `${BASE}/config`,
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        if (req.method !== "POST")
          return json(res, 405, { ok: false, error: "method not allowed" });
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        const a = isRecord4(body) ? body : {};
        try {
          const patchObj = {};
          let hasPatch = false;
          if (Object.hasOwn(a, "enabled")) {
            patchObj["enabled"] = a["enabled"] === true;
            hasPatch = true;
          }
          if (Object.hasOwn(a, "showToday")) {
            patchObj["showToday"] = a["showToday"] === true;
            hasPatch = true;
          }
          if (Object.hasOwn(a, "defaultRange")) {
            const dr = a["defaultRange"];
            if (dr !== "7" && dr !== "30" && dr !== "90" && dr !== "all")
              throw new Error("defaultRange \u975E\u6CD5\uFF0C\u5E94\u4E3A '7' / '30' / '90' / 'all'");
            patchObj["defaultRange"] = dr;
            hasPatch = true;
          }
          if (Object.hasOwn(a, "refreshSec")) {
            const raw = a["refreshSec"];
            if (raw === void 0 || raw === null || raw === "")
              throw new Error("refreshSec \u975E\u6CD5\uFF0C\u5E94\u4E3A\u6570\u5B57\uFF080=\u5173\u95ED\uFF09");
            const n = Number(raw);
            if (!Number.isFinite(n)) throw new Error("refreshSec \u975E\u6CD5\uFF0C\u5E94\u4E3A\u6570\u5B57\uFF080=\u5173\u95ED\uFF09");
            patchObj["refreshSec"] = raw === 0 || raw === "0" ? 0 : Math.min(3600, Math.max(10, Math.floor(n)));
            hasPatch = true;
          }
          if (Object.hasOwn(a, "activeVendor")) {
            if (typeof a["activeVendor"] !== "string") throw new Error("activeVendor \u975E\u6CD5\uFF0C\u5E94\u4E3A\u5B57\u7B26\u4E32");
            const id = a["activeVendor"];
            const cfg = getConfig();
            if (id !== "" && !cfg.vendors.some((v) => v.id === id)) throw new Error("\u672A\u77E5\u4F9B\u5E94\u5546");
            patchObj["activeVendor"] = id;
            hasPatch = true;
          }
          if (hasPatch) await updateConfig(patchObj);
          return json(res, 200, { ok: true, config: getConfig() });
        } catch (e) {
          return json(res, 200, { ok: false, error: String(e?.message ?? e) });
        }
      }
    }),
    "dshp-token-meter: config route"
  );
}

// src/host/stats/fold.ts
function modelKey(provider, model) {
  return String(provider || "unknown") + "/" + String(model || "unknown");
}
function dayKey(t) {
  const d = new Date(t);
  const M = String(d.getMonth() + 1);
  const D = String(d.getDate());
  return d.getFullYear() + "-" + (M.length < 2 ? "0" + M : M) + "-" + (D.length < 2 ? "0" + D : D);
}
var BUCKETS = ["i", "o", "cr", "cw"];
function emptyResult() {
  return { records: /* @__PURE__ */ new Map(), peak: null, first: null, last: null, used: false };
}
function numOf(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function foldSession(events, skipCount) {
  const state = emptyResult();
  let routeProvider = "unknown";
  let routeModel = "unknown";
  const route = () => routeProvider + "/" + routeModel;
  const setRoute = (p, m) => {
    if (p !== void 0 && p !== null && p !== "") routeProvider = String(p);
    if (m !== void 0 && m !== null && m !== "") routeModel = String(m);
  };
  let pending = null;
  const commit = (usage, time, model) => {
    const vals = {
      i: numOf(usage["inputTokens"]),
      o: numOf(usage["outputTokens"]),
      cr: numOf(usage["cacheReadTokens"]),
      cw: numOf(usage["cacheWriteTokens"])
    };
    const tokens = vals.i + vals.o + vals.cr + vals.cw;
    if (tokens <= 0) return;
    state.used = true;
    const d = dayKey(time);
    const h = new Date(time).getHours();
    const k = d + "|" + h + "|" + model;
    let r = state.records.get(k);
    if (r === void 0) {
      r = { d, h, m: model, i: 0, o: 0, cr: 0, cw: 0, n: 0 };
      state.records.set(k, r);
    }
    for (const b of BUCKETS) r[b] += vals[b];
    r.n += 1;
    if (state.peak === null || tokens > state.peak.tokens) state.peak = { tokens, d, model };
    if (state.first === null || d < state.first) state.first = d;
    if (state.last === null || d > state.last) state.last = d;
  };
  const flush = () => {
    if (pending === null) return;
    commit(pending.usage, pending.time, pending.model);
    pending = null;
  };
  const limit = skipCount > 0 ? skipCount : 0;
  for (let idx = 0; idx < events.length; idx++) {
    if (idx < limit) continue;
    const ev = events[idx];
    const data = ev && ev.data;
    if (data === null || typeof data !== "object") continue;
    switch (ev.type) {
      case "request/header": {
        const header = data["header"];
        const cfg = header && header["config"];
        if (cfg) setRoute(cfg["provider"], cfg["model"]);
        break;
      }
      case "request/context": {
        setRoute(data["provider"], data["model"]);
        break;
      }
      case "assistant/chunk": {
        const chunk = data["chunk"];
        if (chunk !== null && typeof chunk === "object" && chunk["type"] === "usage" && chunk["usage"]) {
          const key = String(data["turn"]) + ":" + String(data["step"]);
          if (pending !== null && pending.key !== key) flush();
          pending = {
            key,
            usage: chunk["usage"],
            time: Number(ev.time) || 0,
            model: route()
          };
        }
        break;
      }
      case "assistant/message": {
        const key = String(data["turn"]) + ":" + String(data["step"]);
        const msg = data["message"];
        const src = msg && msg["source"];
        const srcModel = src && src["kind"] === "model" ? modelKey(src["provider"], src["model"]) : null;
        if (data["usage"]) {
          if (pending !== null && pending.key !== key) flush();
          pending = {
            key,
            usage: data["usage"],
            time: Number(ev.time) || 0,
            model: srcModel || route()
          };
        } else if (pending !== null && pending.key === key && srcModel !== null) {
          pending.model = srcModel;
        }
        break;
      }
    }
  }
  flush();
  return state;
}
var compactAgg = (agg) => ({
  r: Array.from(agg.records.entries()),
  p: agg.peak,
  f: agg.first,
  l: agg.last,
  u: agg.used
});
var reviveAgg = (c) => ({
  records: new Map(c.r),
  peak: c.p,
  first: c.f,
  last: c.l,
  used: c.u
});
function buildFileIndex(sessionsDir) {
  const idx = /* @__PURE__ */ new Map();
  try {
    for (const entry of readdirSync(sessionsDir)) {
      const full = join(sessionsDir, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (!st.isDirectory()) continue;
      for (const sess of readdirSync(full)) {
        if (!sess.startsWith("session-")) continue;
        const file = join(full, sess, "session.jsonl.zstd");
        try {
          const s = statSync(file);
          if (s.isFile()) idx.set(sess, { file, size: s.size, mtimeMs: s.mtimeMs });
        } catch {
        }
      }
    }
  } catch {
  }
  return idx;
}
function fileFingerprint(index, id) {
  const e = index.get(id);
  if (e === void 0) return null;
  return e.size + ":" + Math.floor(e.mtimeMs);
}

// src/host/stats/async.ts
function withTimeout(promise, ms, label) {
  let timer = 0;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("timeout after " + ms + "ms" + (label ? " (" + label + ")" : "")));
    }, ms);
    if (timer !== null && typeof timer === "object" && typeof timer.unref === "function")
      timer.unref();
  });
  return Promise.race([
    Promise.resolve(promise).finally(() => {
      clearTimeout(timer);
    }),
    timeout
  ]);
}

// src/host/stats/engine.ts
var BATCH_SIZE = 8;
var MAX_ATTEMPTS = 3;
var READ_TIMEOUT_MS = 2e4;
var UNIT_NAME_RE = /^[a-z][a-z0-9_]*$/;
function domainTable(schema) {
  return { valueSchema: schema };
}
function defineDomain(spec) {
  if (!UNIT_NAME_RE.test(spec.name))
    throw new Error(`domain name '${spec.name}' must match ${String(UNIT_NAME_RE)}`);
  if (!Number.isInteger(spec.version) || spec.version < 0)
    throw new Error(`domain '${spec.name}' version must be a non-negative integer, got ${spec.version}`);
  for (const table of Object.keys(spec.tables))
    if (!UNIT_NAME_RE.test(table))
      throw new Error(`domain '${spec.name}' table name '${table}' must match ${String(UNIT_NAME_RE)}`);
  return spec;
}
function isNonNegInt(v) {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER;
}
function parseBucket(raw) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) throw new Error("invalid bucket");
  const r = raw;
  if (typeof r["d"] !== "string" || r["d"].length < 1) throw new Error("invalid bucket.d");
  if (typeof r["m"] !== "string" || r["m"].length < 1) throw new Error("invalid bucket.m");
  if (!isNonNegInt(r["h"])) throw new Error("invalid bucket.h");
  for (const k of ["i", "o", "cr", "cw", "n"]) {
    if (!isNonNegInt(r[k])) throw new Error("invalid bucket." + k);
  }
  return {
    d: r["d"],
    h: r["h"],
    m: r["m"],
    i: r["i"],
    o: r["o"],
    cr: r["cr"],
    cw: r["cw"],
    n: r["n"]
  };
}
var cachedSessionSchema = {
  parse(raw) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw))
      throw new Error("invalid-record: not object");
    const r = raw;
    if (typeof r["fp"] !== "string" || r["fp"].length < 1) throw new Error("invalid-record: fp");
    if (!isNonNegInt(r["skip"])) throw new Error("invalid-record: skip");
    if (r["v"] !== void 0 && !(typeof r["v"] === "number" && Number.isInteger(r["v"])))
      throw new Error("invalid-record: v");
    if (!Array.isArray(r["r"])) throw new Error("invalid-record: r");
    const buckets = [];
    for (const entry of r["r"]) {
      if (!Array.isArray(entry) || entry.length !== 2) throw new Error("invalid-record: r entry");
      const k = entry[0];
      if (typeof k !== "string" || k.length < 1) throw new Error("invalid-record: r key");
      buckets.push([k, parseBucket(entry[1])]);
    }
    let p = null;
    if (r["p"] !== null && r["p"] !== void 0) {
      const pr = r["p"];
      if (typeof pr !== "object" || Array.isArray(pr)) throw new Error("invalid-record: p");
      if (!isNonNegInt(pr["tokens"])) throw new Error("invalid-record: p.tokens");
      if (typeof pr["d"] !== "string" || pr["d"].length < 1)
        throw new Error("invalid-record: p.d");
      if (typeof pr["model"] !== "string" || pr["model"].length < 1)
        throw new Error("invalid-record: p.model");
      p = { tokens: pr["tokens"], d: pr["d"], model: pr["model"] };
    }
    const f = r["f"];
    const l = r["l"];
    if (f !== null && typeof f !== "string") throw new Error("invalid-record: f");
    if (l !== null && typeof l !== "string") throw new Error("invalid-record: l");
    if (typeof r["u"] !== "boolean") throw new Error("invalid-record: u");
    return {
      fp: r["fp"],
      skip: r["skip"],
      ...r["v"] !== void 0 ? { v: r["v"] } : {},
      r: buckets,
      p,
      f: f ?? null,
      l: l ?? null,
      u: r["u"]
    };
  }
};
var tokenStatsDomainSpec = defineDomain({
  name: "token_stats",
  version: 0,
  tables: { sessions: domainTable(cachedSessionSchema) }
});
function clampSkip(inheritedEventCount, events) {
  const n = typeof inheritedEventCount === "number" ? Math.floor(inheritedEventCount) : NaN;
  if (!Number.isSafeInteger(n) || n < 0) return 0;
  const len = Array.isArray(events) ? events.length : 0;
  return n > len ? len : n;
}
function createEngine(sessionQuery, dshHome2, storageDomain) {
  const sessionsDir = join(dshHome2, "sessions");
  const aggMemo = /* @__PURE__ */ new Map();
  const fpMemo = /* @__PURE__ */ new Map();
  const dirty = /* @__PURE__ */ new Set();
  const attempts = /* @__PURE__ */ new Map();
  const errored = /* @__PURE__ */ new Set();
  let queue = [];
  let pumping = false;
  let listedIds = /* @__PURE__ */ new Set();
  let currentIndex = buildFileIndex(sessionsDir);
  let storageOk = true;
  let storageWarned = false;
  const noteStorageError = (label, error) => {
    storageOk = false;
    const msg = label + ": " + String(error?.message ?? error);
    if (!storageWarned) {
      storageWarned = true;
      try {
        console.warn(
          "[dshp-token-meter] storage domain " + msg + " \u2014 \u7F13\u5B58\u6301\u4E45\u5316\u4E0D\u53EF\u7528\uFF0C\u7EDF\u8BA1\u4ECD\u6B63\u5E38\u8FD0\u884C\uFF08\u4EC5\u91CD\u542F\u540E\u91CD\u626B\uFF09"
        );
      } catch {
      }
    }
  };
  const nullTable = {
    get: (_k) => void 0,
    put: async (_k, _v) => {
    }
  };
  let openAttempt = 0;
  const openDomain = () => {
    if (!storageDomain || typeof storageDomain.open !== "function") {
      noteStorageError("open failed", new Error("storageDomain \u670D\u52A1\u4E0D\u53EF\u7528"));
      return Promise.resolve({ table: nullTable, close: async () => {
      }, degraded: true });
    }
    return storageDomain.open(tokenStatsDomainSpec).then((domain) => {
      storageOk = true;
      storageWarned = false;
      return { table: domain.table("sessions"), close: () => domain.close() };
    }).catch((error) => {
      noteStorageError("open failed", error);
      return { table: nullTable, close: async () => {
      }, degraded: true };
    });
  };
  let tableReady = openDomain();
  function invalidate(sessionId) {
    if (typeof sessionId === "string") {
      dirty.add(sessionId);
      errored.delete(sessionId);
      attempts.delete(sessionId);
    }
  }
  async function pump() {
    if (pumping) return;
    pumping = true;
    try {
      while (queue.length > 0) {
        const batch = queue.splice(0, BATCH_SIZE);
        const tbl = await tableReady;
        await Promise.all(
          batch.map(async (job) => {
            try {
              const snap = await withTimeout(
                sessionQuery.readSession(job.id),
                READ_TIMEOUT_MS,
                "readSession " + job.id
              );
              const skip = clampSkip(
                snap?.inheritedEventCount,
                snap?.events
              );
              const agg = foldSession(snap?.events || [], skip);
              aggMemo.set(job.id, agg);
              attempts.delete(job.id);
              errored.delete(job.id);
              dirty.delete(job.id);
              const fp = fileFingerprint(currentIndex, job.id);
              if (fp !== null) {
                fpMemo.set(job.id, fp);
                try {
                  await tbl.table.put(job.id, { fp, skip, v: 1, ...compactAgg(agg) });
                } catch (error) {
                  noteStorageError("put failed", error);
                }
              }
            } catch {
              const n = (attempts.get(job.id) || 0) + 1;
              attempts.set(job.id, n);
              if (n >= MAX_ATTEMPTS) {
                aggMemo.set(job.id, { records: /* @__PURE__ */ new Map(), peak: null, first: null, last: null, used: false });
                errored.add(job.id);
              }
            }
          })
        );
        if (queue.length > 0) await new Promise((resolve2) => setImmediate(resolve2));
      }
    } finally {
      pumping = false;
    }
  }
  async function snapshot() {
    await maybeReopenStorage();
    const list = await sessionQuery.listSessions();
    listedIds = /* @__PURE__ */ new Set();
    const jobs = [];
    let scanned = 0;
    currentIndex = buildFileIndex(sessionsDir);
    for (const rec of list) {
      const header = rec && rec.header;
      if (header === null || typeof header !== "object") continue;
      const id = header["id"];
      if (typeof id !== "string") continue;
      listedIds.add(id);
      const live = rec.live === true;
      const isDirty = dirty.has(id);
      let need = false;
      const entry = currentIndex.get(id);
      const mtime = entry === void 0 ? 0 : entry.mtimeMs;
      if (live) {
        need = isDirty || !aggMemo.has(id);
      } else {
        const fp = fileFingerprint(currentIndex, id);
        if (isDirty || !aggMemo.has(id)) {
          let hit;
          try {
            hit = (await tableReady).table.get(id);
          } catch {
            hit = void 0;
          }
          if (!isDirty && hit !== void 0 && hit.fp === fp && hit.v === 1) {
            aggMemo.set(id, reviveAgg(hit));
            if (fp !== null) fpMemo.set(id, fp);
            dirty.delete(id);
          } else {
            need = true;
          }
        } else if (fp !== null && fpMemo.get(id) !== fp) {
          need = true;
        }
      }
      if (need && !errored.has(id)) {
        const job = { id, mtime };
        if (isDirty) job.mtime = Infinity;
        jobs.push(job);
      }
      if (aggMemo.has(id)) scanned++;
    }
    jobs.sort((a, b) => b.mtime - a.mtime);
    if (jobs.length > 0) {
      const queued = new Set(queue.map((j) => j.id));
      for (const j of jobs) {
        if (!queued.has(j.id)) {
          queued.add(j.id);
          queue.push(j);
        }
      }
      queue.sort((a, b) => b.mtime - a.mtime);
      void pump();
    }
    const merged = /* @__PURE__ */ new Map();
    const models = {};
    const daySessions = {};
    let peak = null;
    let first = null;
    let last = null;
    let active = 0;
    for (const id of listedIds) {
      const agg = aggMemo.get(id);
      if (agg === void 0) continue;
      if (agg.used) {
        active++;
        const days = /* @__PURE__ */ new Set();
        for (const r of agg.records.values()) days.add(r.d);
        for (const d of days) daySessions[d] = (daySessions[d] || 0) + 1;
      }
      for (const r of agg.records.values()) {
        const k = r.d + "|" + r.h + "|" + r.m;
        let m = merged.get(k);
        if (m === void 0) {
          m = { d: r.d, h: r.h, m: r.m, i: 0, o: 0, cr: 0, cw: 0, n: 0 };
          merged.set(k, m);
        }
        m.i += r.i;
        m.o += r.o;
        m.cr += r.cr;
        m.cw += r.cw;
        m.n += r.n;
        if (models[r.m] === void 0) {
          const slash = r.m.indexOf("/");
          models[r.m] = slash > 0 ? { provider: r.m.slice(0, slash), model: r.m.slice(slash + 1) } : { provider: "unknown", model: r.m };
        }
      }
      if (agg.peak !== null && (peak === null || agg.peak.tokens > peak.tokens)) peak = agg.peak;
      if (agg.first !== null && (first === null || agg.first < first)) first = agg.first;
      if (agg.last !== null && (last === null || agg.last > last)) last = agg.last;
    }
    for (const id of aggMemo.keys()) {
      if (listedIds.has(id)) continue;
      aggMemo.delete(id);
      fpMemo.delete(id);
      attempts.delete(id);
      errored.delete(id);
      dirty.delete(id);
      try {
        const t = await tableReady;
        if (t.table !== nullTable && typeof t.table.delete === "function") await t.table.delete(id);
      } catch {
      }
    }
    const records = Array.from(merged.values());
    records.sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : a.h - b.h);
    const total = listedIds.size;
    return {
      ready: true,
      records,
      models,
      daySessions,
      peakStep: peak,
      range: first === null ? null : { first, last },
      sessions: total,
      active,
      partial: total - scanned > 0,
      scanned,
      total,
      errors: errored.size,
      storage: storageOk ? "ok" : "disabled",
      generatedAt: Date.now()
    };
  }
  function start() {
    const t = setTimeout(() => {
      void snapshot().catch(() => {
      });
    }, 100);
    if (typeof t.unref === "function")
      t.unref();
  }
  async function drain() {
    for (; ; ) {
      if (!pumping && queue.length === 0) break;
      await new Promise((resolve2) => setImmediate(resolve2));
    }
    await tableReady;
    await new Promise((resolve2) => setImmediate(resolve2));
  }
  async function dispose() {
    try {
      const t = await tableReady;
      await t.close();
    } catch {
    }
  }
  async function maybeReopenStorage() {
    if (storageOk) return;
    openAttempt++;
    if (openAttempt % 5 !== 0) return;
    const prev = await tableReady;
    if (prev.degraded === true) tableReady = openDomain();
  }
  return { invalidate, snapshot, start, drain, dispose };
}

// src/host/stats/routes.ts
var BASE2 = "/ext/dshp-token-meter";
function registerStatsRoutes(ctx, engine) {
  const handler = async (_req, res) => {
    const req = _req;
    if (!sameOrigin(req)) return json(res, 403, { ready: false, error: "forbidden" });
    try {
      if (!engine)
        return json(res, 200, {
          ready: false,
          error: "sessionQuery \u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u7EDF\u8BA1\u6682\u4E0D\u53EF\u7528\uFF08\u989D\u5EA6\u529F\u80FD\u4E0D\u53D7\u5F71\u54CD\uFF09"
        });
      const data = await engine.snapshot();
      return json(res, 200, data);
    } catch (error) {
      return json(res, 200, { ready: false, error: String(error?.message ?? error) });
    }
  };
  ctx.effect(
    () => ctx.webServer.register({ kind: "exact", path: `${BASE2}/stats`, handler }),
    "dshp-token-meter: stats route"
  );
  ctx.effect(
    () => ctx.webServer.register({ kind: "exact", path: `${BASE2}/data`, handler }),
    "dshp-token-meter: stats alias route"
  );
}

// src/host/index.ts
var name = "@dshp/token-meter";
var inject = ["webServer"];
function apply(ctx, rawConfig) {
  try {
    migrateYamlNamespaces();
  } catch {
  }
  const entry = {
    ...DEFAULT_CONFIG,
    vendors: []
  };
  const patch = sanitizePatchConfig(rawConfig);
  if (patch) {
    if (Object.hasOwn(patch, "activeVendor") && patch.activeVendor !== void 0)
      entry.activeVendor = patch.activeVendor;
    if (Object.hasOwn(patch, "refreshSec") && patch.refreshSec !== void 0)
      entry.refreshSec = patch.refreshSec;
    if (Object.hasOwn(patch, "enabled") && patch.enabled !== void 0) entry.enabled = patch.enabled;
    if (Object.hasOwn(patch, "vendors") && patch.vendors !== void 0) entry.vendors = patch.vendors;
    if (Object.hasOwn(patch, "showToday") && patch.showToday !== void 0) entry.showToday = patch.showToday;
    if (Object.hasOwn(patch, "defaultRange") && patch.defaultRange !== void 0)
      entry.defaultRange = patch.defaultRange;
  }
  const persistedForMigration = loadPersistedQuota();
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
            "[dshp-token-meter] settings.yaml \u5DF2\u5B58\u5728 dshp-token-meter \u7528\u6237\u914D\u7F6E\uFF0C\u8DF3\u8FC7\u65E7\u6587\u4EF6\u81EA\u52A8\u8FC1\u79FB\uFF08\u65E7\u6587\u4EF6\u4FDD\u7559\uFF0C\u53EF\u624B\u52A8\u5220\u9664 " + persistedForMigration.source + "\uFF09"
          );
        } catch {
        }
        return;
      }
    } catch {
    }
    const needPatch = {};
    let need = false;
    for (const k of ["activeVendor", "refreshSec", "enabled", "vendors"]) {
      const pv = persistedForMigration.config[k];
      const ev = entry[k];
      if (JSON.stringify(pv) !== JSON.stringify(ev)) {
        needPatch[k] = pv;
        need = true;
      }
    }
    if (!need) {
      try {
        const p = legacyQuotaConfigPath();
        if (existsSync(p)) {
          try {
            unlinkSync(p);
            console.info("[dshp-token-meter] \u65E7\u5B58\u50A8\u6587\u4EF6\u4E0E\u9ED8\u8BA4\u503C\u4E00\u81F4\uFF0C\u5DF2\u81EA\u52A8\u6E05\u7406 " + p);
          } catch {
          }
        }
      } catch {
      }
      return;
    }
    Promise.resolve(settings.update(NS, JSON.parse(JSON.stringify(needPatch)))).then(() => {
      try {
        console.info(
          "[dshp-token-meter] \u5DF2\u81EA\u52A8\u5C06\u65E7\u7248 " + persistedForMigration.source + " \u8FC1\u79FB\u81F3 settings.yaml (dshp-token-meter)"
        );
      } catch {
      }
      try {
        const p = persistedForMigration.source;
        const bak = p + ".bak";
        if (existsSync(p)) {
          try {
            renameSync(p, bak);
            console.info("[dshp-token-meter] \u65E7\u6587\u4EF6\u5DF2\u5907\u4EFD\u4E3A " + bak);
          } catch {
            try {
              unlinkSync(p);
              console.info("[dshp-token-meter] \u65E7\u6587\u4EF6\u5DF2\u6E05\u7406 " + p);
            } catch {
            }
          }
        }
      } catch {
      }
    }).catch((e) => {
      try {
        console.warn("[dshp-token-meter] \u65E7\u6587\u4EF6\u8FC1\u79FB\u5931\u8D25\uFF1A" + String(e?.message ?? e));
      } catch {
      }
      hasMigrated = false;
    });
  }
  let hasRenamedAuth = false;
  function tryRenameAuth() {
    if (hasRenamedAuth) return;
    let settings = null;
    try {
      settings = ctx.get("settings");
    } catch {
      settings = null;
    }
    if (!settings) return;
    let cfg = null;
    try {
      cfg = getConfig();
    } catch {
      return;
    }
    if (!cfg || !Array.isArray(cfg.vendors)) {
      hasRenamedAuth = true;
      return;
    }
    let changed = false;
    const next = cfg.vendors.map((v) => {
      if (v && v.type === "opencode-go" && v.params && typeof v.params["auth"] === "string" && v.params["auth"] !== "" && (v.params["cookie"] === void 0 || v.params["cookie"] === "")) {
        changed = true;
        const np = {
          ...v.params,
          cookie: v.params["auth"]
        };
        delete np["auth"];
        return { ...v, params: np };
      }
      return v;
    });
    if (!changed) {
      hasRenamedAuth = true;
      return;
    }
    hasRenamedAuth = true;
    Promise.resolve(updateConfig({ vendors: next })).then(() => {
      try {
        console.info(
          "[dshp-token-meter] \u5DF2\u5C06 opencode-go \u4F9B\u5E94\u5546\u7684\u65E7 params.auth \u8FC1\u79FB\u4E3A params.cookie\uFF08\u503C\u4E0D\u53D8\uFF09"
        );
      } catch {
      }
    }).catch((e) => {
      try {
        console.warn("[dshp-token-meter] auth\u2192cookie \u8FC1\u79FB\u5931\u8D25\uFF1A" + String(e?.message ?? e));
      } catch {
      }
      hasRenamedAuth = false;
    });
  }
  let hasMigratedTypes = false;
  function tryMigrateTypes() {
    if (hasMigratedTypes) return;
    let settings = null;
    try {
      settings = ctx.get("settings");
    } catch {
      settings = null;
    }
    if (!settings) return;
    let cfg = null;
    try {
      cfg = getConfig();
    } catch {
      return;
    }
    let raw = null;
    try {
      raw = current();
    } catch {
    }
    if (!raw || !Array.isArray(raw.vendors)) {
      hasMigratedTypes = true;
      return;
    }
    const legacyTypes = /* @__PURE__ */ new Set(["opencode-go", "opencode-zen"]);
    if (!raw.vendors.some((v) => v && legacyTypes.has(String(v.type)))) {
      hasMigratedTypes = true;
      return;
    }
    hasMigratedTypes = true;
    const next = (Array.isArray(cfg.vendors) ? cfg.vendors : []).map((v) => ({ ...v }));
    Promise.resolve(updateConfig({ vendors: next })).then(() => {
      try {
        console.info(
          "[dshp-token-meter] \u5DF2\u5C06\u65E7 type\uFF08opencode-go/opencode-zen\uFF09\u8FC1\u79FB\u4E3A opencode\uFF08\u5176\u4F59\u4E0D\u53D8\uFF09"
        );
      } catch {
      }
    }).catch((e) => {
      try {
        console.warn("[dshp-token-meter] type \u8FC1\u79FB\u5931\u8D25\uFF1A" + String(e?.message ?? e));
      } catch {
      }
      hasMigratedTypes = false;
    });
  }
  try {
    ctx.inject(["settings"], (sctx) => {
      sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
        setSource: (src) => {
          current = src;
          tryMigrate();
          tryRenameAuth();
          tryMigrateTypes();
        },
        onChange: () => {
        }
      });
    });
  } catch {
  }
  function getConfig() {
    try {
      const v = current();
      if (v && typeof v === "object") {
        const r = v;
        return {
          version: 1,
          activeVendor: typeof r["activeVendor"] === "string" ? r["activeVendor"] : entry.activeVendor,
          refreshSec: typeof r["refreshSec"] === "number" ? r["refreshSec"] : entry.refreshSec,
          enabled: typeof r["enabled"] === "boolean" ? r["enabled"] : entry.enabled,
          vendors: Array.isArray(r["vendors"]) ? r["vendors"].map((item) => {
            const it = item ?? {};
            return {
              id: String(it["id"] !== void 0 ? it["id"] : ""),
              name: String(it["name"] !== void 0 ? it["name"] : ""),
              type: canonicalType(String(it["type"] !== void 0 ? it["type"] : "manual")),
              params: it["params"] && typeof it["params"] === "object" && !Array.isArray(it["params"]) ? it["params"] : {}
            };
          }) : [],
          showToday: r["showToday"] === true,
          defaultRange: r["defaultRange"] === "7" || r["defaultRange"] === "30" || r["defaultRange"] === "90" || r["defaultRange"] === "all" ? r["defaultRange"] : entry.defaultRange
        };
      }
    } catch {
    }
    return JSON.parse(JSON.stringify(entry));
  }
  async function updateConfig(patchObj) {
    const settings = ctx.get("settings");
    if (!settings)
      throw new Error(
        "settings \u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u65E0\u6CD5\u6301\u4E45\u5316\u5230 settings.yaml\uFF08\u8BF7\u91CD\u542F DSH \u6216\u68C0\u67E5 FileSettingsProvider \u662F\u5426\u6302\u8F7D\uFF09"
      );
    await settings.update(NS, JSON.parse(JSON.stringify(patchObj)));
  }
  const st = { snaps: {} };
  const resolveSecret = createSecretResolver(ctx);
  let sessionQuery = null;
  try {
    sessionQuery = ctx.get("sessionQuery");
  } catch {
    sessionQuery = null;
  }
  let storageDomain = null;
  try {
    storageDomain = ctx.get("storageDomain");
  } catch {
    storageDomain = null;
  }
  let dshHome2 = "";
  try {
    dshHome2 = process.env["DSH_HOME"] || "";
  } catch {
  }
  if (!dshHome2) {
    try {
      dshHome2 = join(homedir(), ".dsh");
    } catch {
      dshHome2 = "/tmp/.dsh";
    }
  }
  const engine = sessionQuery && typeof sessionQuery.listSessions === "function" && typeof sessionQuery.readSession === "function" ? createEngine(sessionQuery, dshHome2, storageDomain) : null;
  if (engine) {
    try {
      ctx.effect(
        () => ctx.on("session/event", (session) => {
          const id = session && session.id;
          if (typeof id === "string") engine.invalidate(id);
        }),
        "dshp-token-meter: invalidate on session event"
      );
    } catch {
    }
    try {
      ctx.effect(
        () => () => {
          void engine.dispose();
        },
        "dshp-token-meter: close domain on dispose"
      );
    } catch {
    }
  } else {
    try {
      console.warn("[dshp-token-meter] sessionQuery \u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u7EDF\u8BA1\u6682\u4E0D\u53EF\u7528\uFF08\u989D\u5EA6\u529F\u80FD\u4E0D\u53D7\u5F71\u54CD\uFF09");
    } catch {
    }
  }
  try {
    registerQuotaRoutes(ctx, { getConfig, updateConfig, resolveSecret, st });
  } catch (e) {
    try {
      console.error("[dshp-token-meter] register quota routes failed: " + String(e?.message ?? e));
    } catch {
    }
  }
  try {
    const clampSec = (raw) => {
      const n = Number(raw);
      if (!isFinite(n) || n <= 0) return 0;
      return Math.min(3600, Math.max(10, n));
    };
    let stopped = false;
    let timer = null;
    const schedule = (ms) => {
      if (stopped) return;
      timer = setTimeout(() => {
        void tick();
      }, Math.max(1e3, ms));
    };
    const tick = async () => {
      if (stopped) return;
      let sec = 60;
      try {
        const cfg = getConfig();
        sec = clampSec(cfg.refreshSec);
        if (sec > 0) {
          const since = st.lastPullMs ? Date.now() - st.lastPullMs : Infinity;
          const budget = sec * 1e3;
          if (since < budget * 0.6) {
            schedule(budget - since);
            return;
          }
          const list = Array.isArray(cfg.vendors) ? cfg.vendors : [];
          for (const v of list) {
            if (stopped) return;
            try {
              await refreshOne(st, resolveSecret, v);
            } catch {
            }
          }
        }
      } catch {
      }
      schedule((sec > 0 ? sec : 60) * 1e3);
    };
    schedule(4e3);
    try {
      ctx.effect(
        () => () => {
          stopped = true;
          if (timer) clearTimeout(timer);
        },
        "dshp-token-meter: quota auto refresh"
      );
    } catch {
    }
  } catch (e) {
    try {
      console.warn("[dshp-token-meter] quota auto refresh \u542F\u52A8\u5931\u8D25\uFF1A" + String(e?.message ?? e));
    } catch {
    }
  }
  try {
    registerStatsRoutes(ctx, engine);
  } catch (e) {
    try {
      console.error("[dshp-token-meter] register stats routes failed: " + String(e?.message ?? e));
    } catch {
    }
  }
  if (engine) {
    try {
      engine.start();
    } catch {
    }
  }
  try {
    console.log("[dshp-token-meter] settings(dshp-token-meter) quota + stats ready");
  } catch {
  }
}

export { ConfigSchema, NS, apply, inject, name };
