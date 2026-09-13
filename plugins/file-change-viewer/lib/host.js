import { resolve, sep, dirname } from 'path';
import { realpath } from 'fs/promises';
import { tmpdir } from 'os';

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

// src/host/config.ts
var NS = "dshp-file-change-viewer";
var DEFAULT_CONFIG = {
  view: "highlight",
  sectionsOpen: false
};
var ConfigSchema = Schema.object({
  view: Schema.union([Schema.const("highlight"), Schema.const("diff")]).default("highlight"),
  sectionsOpen: Schema.boolean().default(false)
});
function sanitizePatchConfig(raw) {
  const patch = {};
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return patch;
  const record = raw;
  if (Object.hasOwn(record, "view") && (record["view"] === "highlight" || record["view"] === "diff")) {
    patch.view = record["view"];
  }
  if (Object.hasOwn(record, "sectionsOpen") && typeof record["sectionsOpen"] === "boolean") {
    patch.sectionsOpen = record["sectionsOpen"];
  }
  return patch;
}
function applyPatch(entry, patch) {
  if (patch.view !== void 0) entry.view = patch.view;
  if (patch.sectionsOpen !== void 0) entry.sectionsOpen = patch.sectionsOpen;
}
var ESCALATION_TARGETS = ["workspace-write", "danger-full-access"];
var WIDER_MODES = {
  "read-only": ["workspace-write", "danger-full-access"],
  "workspace-write": ["danger-full-access"]
};
function sandboxDenialMarker(mode) {
  return `[sandbox: file access denied under ${mode} mode]`;
}
function escalationHintMarker(subject) {
  return `[sandbox: escalation available \u2014 retry this exact ${subject} once with sandbox_permissions (the narrowest wider mode that suffices) + justification; the approval prompt asks the user]`;
}
function escalationSchemaFields(modes) {
  return {
    sandbox_permissions: {
      type: "string",
      enum: [...modes],
      description: "The wider sandbox mode this file operation needs. Only valid as a one-shot retry of an operation the sandbox just denied; requires justification and user approval."
    },
    justification: {
      type: "string",
      description: "Required with sandbox_permissions: one sentence for the user explaining why this exact file operation needs the wider access."
    }
  };
}
function validateEscalationArgs(sandboxPermissions, justification) {
  if (sandboxPermissions !== void 0 && justification === void 0) {
    throw new Error("invalid escalation: sandbox_permissions requires a justification");
  }
  if (justification !== void 0 && sandboxPermissions === void 0) {
    throw new Error("invalid escalation: justification is only valid together with sandbox_permissions");
  }
  if (typeof justification === "string" && justification.trim().length === 0) {
    throw new Error("invalid justification: expected a non-empty sentence");
  }
}
async function approveEscalation(request, approval) {
  const { requestedMode: mode, effectiveMode, justification, subject } = request;
  if (!(WIDER_MODES[effectiveMode] ?? []).includes(mode)) {
    throw new Error(
      `sandbox escalation to "${mode}" is not strictly wider than this call's current "${effectiveMode}" mode`
    );
  }
  if (approval.approver === void 0) {
    throw new Error(`sandbox escalation to "${mode}" requires approval, but no approval service is composed`);
  }
  if (approval.agent === void 0) {
    throw new Error(
      `sandbox escalation to "${mode}" requires approval, but the call has no agent to route it through`
    );
  }
  const outcome = await approval.approver.request({
    agent: approval.agent,
    toolName: approval.toolName,
    callId: approval.callId,
    reason: `escalate sandbox to ${mode}: ${justification}`,
    ...approval.signal === void 0 ? {} : { signal: approval.signal }
  });
  switch (outcome) {
    case "allowed-once":
      return mode;
    case "rejected":
      throw new Error(`the user rejected escalating this ${subject} to "${mode}"`);
    case "cancelled":
      throw new Error(`approval for escalating to "${mode}" was cancelled`);
    default:
      throw new Error(`approval for escalating to "${mode}" was not answered (${String(outcome)})`);
  }
}
function createEscalation(ctx) {
  const confiningAtRegistration = ctx.fs?.sandboxMode !== void 0;
  const modes = confiningAtRegistration ? ESCALATION_TARGETS : [];
  const policyNow = () => ctx.get("sandboxPolicy");
  const confiningNow = () => ctx.fs?.sandboxMode !== void 0;
  return {
    modes,
    async resolvePolicy(toolName, args, exec) {
      validateEscalationArgs(args?.sandbox_permissions, args?.justification);
      const confining = confiningNow();
      const policyService = policyNow();
      if (confining && (policyService === void 0 || policyService === null)) {
        throw new Error(
          "patch: the mounted filesystem confines but ctx.sandboxPolicy is missing \u2014 cannot resolve the sandbox policy for this call (refusing to write without a resolved policy)"
        );
      }
      const session = exec?.agent?.session;
      const standing = policyService?.resolve(session === void 0 ? {} : { session });
      if (args?.sandbox_permissions === void 0 || args?.justification === void 0) return standing;
      if (!confining) {
        throw new Error(
          "sandbox_permissions is not available in this composition (no sandboxing filesystem to escalate)"
        );
      }
      const approvedMode = await approveEscalation(
        {
          requestedMode: args.sandbox_permissions,
          justification: String(args.justification),
          effectiveMode: String(standing?.mode),
          subject: "operation"
        },
        {
          approver: ctx.get("approval"),
          agent: exec?.agent,
          callId: exec?.callId,
          toolName,
          signal: exec?.signal
        }
      );
      return { ...standing, mode: approvedMode };
    },
    /**
     * 把围栏抛出的 `FS_SANDBOX_DENIED` 换成官方那两行标记，**并把原来那个错误对象原样抛出去**。
     *
     * 为什么不新造一个 `Error`：`ToolRuntime` 只对运行时的 `HarnessError` 实例（`instanceof` 判定）
     * 往会话日志里填 `result.error = { name, code }`。新造的 `Error` 即使在字段上写了 `code` 也过不了
     * 那道 `instanceof`，结果就是 `patch` 的拒绝在日志/重试逻辑里「没有错误码」——与 `edit` 不一致。
     * 而 `ctx.fs` 抛出来的本来就是真正的 `FsError`（`HarnessError` 子类），所以改它的 `message`
     * 再原样 throw，类、code、文本三者都与官方文件工具一致；`cause` 链的差别是外层的，观察不到。
     */
    mapError(error, policy) {
      if (error?.code !== "FS_SANDBOX_DENIED") return error;
      const mode = policy?.mode ?? "unknown";
      const text = `${sandboxDenialMarker(mode)}
${escalationHintMarker("operation")}`;
      const original = error;
      try {
        original.message = text;
        return error;
      } catch {
        const fallback = new Error(text);
        fallback.code = "FS_SANDBOX_DENIED";
        fallback.cause = error;
        return fallback;
      }
    }
  };
}
function writableRootsUnder(policy) {
  if (policy.mode !== "workspace-write") return [];
  return Array.from(new Set([policy.workspaceRoot, "/tmp", tmpdir()].map((root) => resolve(root))));
}
async function isUnder(target, root) {
  const prefix = root.endsWith(sep) ? root : root + sep;
  if (target === root || target.startsWith(prefix)) return true;
  const same = (real) => real === root || real.startsWith(prefix);
  try {
    if (same(await realpath(target))) return true;
  } catch {
  }
  let ancestor = dirname(target);
  for (; ; ) {
    try {
      if (same(await realpath(ancestor))) return true;
    } catch {
    }
    const parent = dirname(ancestor);
    if (parent === ancestor) return false;
    ancestor = parent;
  }
}
async function assertWritable(policy, displayPath) {
  if (policy === void 0) return;
  if (policy.mode === "danger-full-access") return;
  if (!displayPath.startsWith("/")) return;
  const target = resolve(displayPath);
  if (policy.mode === "read-only") {
    throw sandboxDenied(policy, target);
  }
  const roots = writableRootsUnder(policy);
  for (const root of roots) {
    if (await isUnder(target, root)) return;
  }
  throw sandboxDenied(policy, target);
}
function sandboxDenied(policy, target) {
  const error = new Error(`${sandboxDenialMarker(policy.mode)}
${escalationHintMarker("operation")}`);
  error.code = "FS_SANDBOX_DENIED";
  error.displayPath = target;
  return error;
}

// src/shared/patch.ts
var MAX_OFFSET = 3;
var HUNK_HEADER = /^@@+ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@+(.*)$/;
function cleanPath(raw) {
  let text = raw.trim();
  const tab = text.indexOf("	");
  if (tab >= 0) text = text.slice(0, tab);
  if (text === "/dev/null") return "";
  if (text.startsWith("a/") || text.startsWith("b/")) text = text.slice(2);
  return text;
}
function isHeaderNoise(line) {
  return line.startsWith("diff --git ") || line.startsWith("index ") || line.startsWith("old mode ") || line.startsWith("new mode ") || line.startsWith("similarity index ") || line.startsWith("new file mode ") || line.startsWith("deleted file mode ");
}
function parseUnifiedPatch(text, options = {}) {
  const tolerant = options.tolerant === true;
  const raw = text.replace(/\r\n/g, "\n").split("\n");
  const files = [];
  let current = null;
  let hunk = null;
  let pendingOldPath = null;
  let sawOldNull = false;
  let sawNewNull = false;
  let createFlag = false;
  let deleteFlag = false;
  let lastSide = null;
  const closeHunk = () => {
    if (current !== null && hunk !== null) current.hunks.push(hunk);
    hunk = null;
  };
  const closeFile = () => {
    closeHunk();
    if (current !== null) {
      if (current.newPath === null) {
        current.delete = true;
      }
      current.create = current.oldPath === null;
      finalizeFile(current);
      if (current.oldPath === null && !current.delete && !createFlag && !sawOldNull && !tolerant) {
        current.oldPath = current.newPath;
        current.create = false;
      }
      files.push(current);
    }
    current = null;
  };
  for (let index = 0; index < raw.length; index += 1) {
    const line = raw[index];
    if (isHeaderNoise(line)) {
      if (line.startsWith("new file mode ")) createFlag = true;
      if (line.startsWith("deleted file mode ")) deleteFlag = true;
      continue;
    }
    if (line.startsWith("--- ")) {
      closeFile();
      pendingOldPath = cleanPath(line.slice(4));
      sawOldNull = pendingOldPath === "";
      continue;
    }
    if (line.startsWith("+++ ")) {
      const newPath = cleanPath(line.slice(4));
      sawNewNull = newPath === "";
      current = {
        path: newPath !== "" ? newPath : pendingOldPath ?? "",
        oldPath: sawOldNull ? null : pendingOldPath,
        newPath: sawNewNull ? null : newPath,
        create: sawOldNull || createFlag,
        delete: sawNewNull || deleteFlag,
        hunks: [],
        oldText: null,
        newText: "",
        added: 0,
        removed: 0
      };
      lastSide = null;
      continue;
    }
    const header = HUNK_HEADER.exec(line);
    if (header !== null) {
      closeHunk();
      if (current === null) {
        if (tolerant) continue;
        throw new Error(`patch \u7B2C ${index + 1} \u884C\uFF1A\u51FA\u73B0\u4E86 @@ \u5C0F\u8282\uFF0C\u4F46\u5B83\u524D\u9762\u6CA1\u6709 --- / +++ \u6587\u4EF6\u5934`);
      }
      hunk = {
        oldStart: Number(header[1]),
        oldCount: header[2] === void 0 ? 1 : Number(header[2]),
        newStart: Number(header[3]),
        newCount: header[4] === void 0 ? 1 : Number(header[4]),
        heading: (header[5] ?? "").trim(),
        lines: [],
        oldNoNewline: false,
        newNoNewline: false
      };
      continue;
    }
    if (hunk !== null) {
      const marker = line.charAt(0);
      if (line.startsWith("\\")) {
        if (lastSide === "old") hunk.oldNoNewline = true;
        else if (lastSide === "new") hunk.newNoNewline = true;
        continue;
      }
      if (line === "") {
        if (index === raw.length - 1) continue;
        hunk.lines.push({ kind: "ctx", text: "" });
        lastSide = null;
        continue;
      }
      if (marker === " ") {
        hunk.lines.push({ kind: "ctx", text: line.slice(1) });
        lastSide = null;
        continue;
      }
      if (marker === "-") {
        hunk.lines.push({ kind: "del", text: line.slice(1) });
        lastSide = "old";
        continue;
      }
      if (marker === "+") {
        hunk.lines.push({ kind: "add", text: line.slice(1) });
        lastSide = "new";
        continue;
      }
      if (tolerant) {
        continue;
      }
      throw new Error(
        `patch \u7B2C ${index + 1} \u884C\uFF1Ahunk \u91CC\u7684\u884C\u5FC5\u987B\u4EE5\u7A7A\u683C\u3001- \u6216 + \u5F00\u5934\uFF0C\u5B9E\u9645\u662F ${JSON.stringify(line.slice(0, 20))}`
      );
    }
  }
  closeFile();
  return files.filter((file) => file.delete || file.hunks.length > 0);
}
function finalizeFile(file) {
  const oldSide = [];
  const newSide = [];
  let added = 0;
  let removed = 0;
  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      if (line.kind === "del") {
        oldSide.push(line.text);
        removed += 1;
      } else if (line.kind === "add") {
        newSide.push(line.text);
        added += 1;
      } else {
        oldSide.push(line.text);
        newSide.push(line.text);
      }
    }
  }
  file.oldText = oldSide.length === 0 ? null : oldSide.join("\n");
  file.newText = newSide.join("\n");
  file.added = added;
  file.removed = removed;
}
function toLines(text) {
  if (text === "") return { lines: [], endNewline: true };
  const endNewline = text.endsWith("\n");
  const body = endNewline ? text.slice(0, -1) : text;
  return { lines: body.split("\n"), endNewline };
}
function fromLines(lines, endNewline) {
  if (lines.length === 0) return "";
  return lines.join("\n") + (endNewline ? "\n" : "");
}
function oldSideLines(hunk) {
  return hunk.lines.filter((line) => line.kind !== "add").map((line) => line.text);
}
function newSideLines(hunk) {
  return hunk.lines.filter((line) => line.kind !== "del").map((line) => line.text);
}
function findBlock(lines, needle, expected) {
  const clamp = (at) => Math.min(Math.max(at, 0), lines.length);
  if (needle.length === 0) return clamp(expected);
  const matches = (at) => {
    if (at < 0 || at + needle.length > lines.length) return false;
    for (let k = 0; k < needle.length; k += 1) if (lines[at + k] !== needle[k]) return false;
    return true;
  };
  if (matches(expected)) return expected;
  for (let delta = 1; delta <= MAX_OFFSET; delta += 1) {
    if (matches(expected - delta)) return expected - delta;
    if (matches(expected + delta)) return expected + delta;
  }
  let best = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let at = 0; at + needle.length <= lines.length; at += 1) {
    if (!matches(at)) continue;
    const distance = Math.abs(at - expected);
    if (distance < bestDistance) {
      best = at;
      bestDistance = distance;
    }
  }
  return best;
}
function mismatchError(path, file, hunkIndex, expected, actual) {
  const hunk = file.hunks[hunkIndex];
  const where = hunk.heading === "" ? "" : `\uFF08${hunk.heading}\uFF09`;
  return new Error(
    `patch \u65E0\u6CD5\u5E94\u7528\uFF1A${path} \u7684\u7B2C ${hunkIndex + 1} \u4E2A hunk${where} \u627E\u4E0D\u5230\u5339\u914D\u7684\u4E0A\u4E0B\u6587\u3002\u671F\u671B ${JSON.stringify(expected.slice(0, 80))}\uFF0C\u5B9E\u9645 ${JSON.stringify(actual.slice(0, 80))}\u3002\u6587\u4EF6\u6CA1\u6709\u88AB\u4FEE\u6539\u2014\u2014\u5148 read \u786E\u8BA4\u5F53\u524D\u5185\u5BB9\uFF0C\u518D\u91CD\u505A patch\u3002`
  );
}
function applyFilePatch(current, file, options = {}) {
  const where = options.displayPath !== void 0 && options.displayPath !== file.path ? `${file.path}\uFF08\u89E3\u6790\u4E3A ${options.displayPath}\uFF09` : file.path;
  if (file.delete) {
    throw new Error(
      `patch \u6682\u4E0D\u652F\u6301\u5220\u9664\u6587\u4EF6\uFF08${file.oldPath ?? file.path} \u7684 +++ \u662F /dev/null\uFF09\uFF1A\u8BF7\u6539\u7528 bash \u5220\u9664\uFF0C\u6216\u4E0D\u8981\u5220\u8FD9\u4E2A\u6587\u4EF6\u3002`
    );
  }
  if (current === null) {
    if (!file.create) {
      throw new Error(
        `patch \u65E0\u6CD5\u5E94\u7528\uFF1A${where} \u4E0D\u5B58\u5728\uFF0C\u800C\u8FD9\u4EFD patch \u628A\u5B83\u5F53\u6210\u300C\u6539\u5DF2\u6709\u6587\u4EF6\u300D\u3002
\u8981\u65B0\u5EFA\u5B83\u8BF7\u7528\u65B0\u5EFA\u6587\u4EF6\u7684\u5F62\u5F0F\uFF1A\u6587\u4EF6\u5934\u5199 --- /dev/null\uFF0Chunk \u5934\u5199 @@ -0,0 +1,N @@\uFF0C\u5185\u5BB9\u5168\u662F + \u884C\uFF08\u7236\u76EE\u5F55\u4F1A\u81EA\u52A8\u521B\u5EFA\uFF09\u3002
\u5982\u679C\u5B83\u672C\u8BE5\u5B58\u5728\uFF0C\u68C0\u67E5\u4F1A\u8BDD\u5DE5\u4F5C\u76EE\u5F55\u662F\u4E0D\u662F\u4F60\u4EE5\u4E3A\u7684\u90A3\u4E2A\uFF0C\u6216\u5148 read / write \u8FD9\u4E2A\u8DEF\u5F84\u3002`
      );
    }
    const lines2 = [];
    let endNewline2 = true;
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.kind === "del") {
          throw new Error(
            `patch \u65E0\u6CD5\u5E94\u7528\uFF1A${where} \u4E0D\u5B58\u5728\uFF0C\u4F46 patch \u91CC\u6709\u5220\u9664\u884C ${JSON.stringify(line.text.slice(0, 80))}\u3002`
          );
        }
        if (line.kind === "add") lines2.push(line.text);
      }
      if (hunk.newNoNewline && lines2.length > 0) endNewline2 = false;
    }
    return fromLines(lines2, endNewline2);
  }
  if (file.create && file.hunks.every((hunk) => hunk.oldCount === 0)) {
    throw new Error(
      `patch \u65E0\u6CD5\u5E94\u7528\uFF1A${where} \u5DF2\u7ECF\u5B58\u5728\uFF0C\u800C patch \u628A\u5B83\u5F53\u6210\u65B0\u5EFA\uFF08--- /dev/null\uFF09\u3002\u6539\u6210\u666E\u901A\u6539\u52A8\u5F62\u5F0F\uFF08--- a/\u8DEF\u5F84\uFF0Chunk \u5934\u5199\u771F\u5B9E\u884C\u53F7\uFF09\u5373\u53EF\u3002`
    );
  }
  const { lines, endNewline } = toLines(current);
  let next = lines.slice();
  let offset = 0;
  let finalEndNewline = endNewline;
  for (let index = 0; index < file.hunks.length; index += 1) {
    const hunk = file.hunks[index];
    const expectedLines = oldSideLines(hunk);
    const expected = Math.max(0, hunk.oldStart - 1 + offset);
    const at = findBlock(next, expectedLines, expected);
    if (at < 0) {
      const actualLine = expectedLines[0] ?? "";
      const actual = next[Math.min(expected, Math.max(0, next.length - 1))] ?? "";
      throw mismatchError(where, file, index, actualLine, actual);
    }
    const replacement = newSideLines(hunk);
    next = next.slice(0, at).concat(replacement, next.slice(at + expectedLines.length));
    offset += replacement.length - expectedLines.length;
    if (hunk.newNoNewline && index === file.hunks.length - 1) finalEndNewline = false;
    else if (hunk.oldNoNewline && index === file.hunks.length - 1 && !hunk.newNoNewline)
      finalEndNewline = false;
  }
  return fromLines(next, finalEndNewline);
}
function patchTotals(files) {
  let added = 0;
  let removed = 0;
  for (const file of files) {
    added += file.added;
    removed += file.removed;
  }
  return { added, removed };
}
function sideText(hunk, side) {
  const skip = side === "old" ? "add" : "del";
  return hunk.lines.filter((line) => line.kind !== skip).map((line) => line.text);
}
function hunkDiffsOf(files) {
  const out = [];
  for (const file of files) {
    for (const hunk of file.hunks) {
      const oldLines = sideText(hunk, "old");
      out.push({
        path: file.path,
        oldText: oldLines.length === 0 ? null : oldLines.join("\n"),
        newText: sideText(hunk, "new").join("\n"),
        startLine: hunk.newStart > 0 ? hunk.newStart : 1
      });
    }
  }
  return out;
}

// src/host/patch-tool.ts
function sessionCwdOf(exec) {
  const cwd = exec?.agent?.session?.header?.cwd;
  return typeof cwd === "string" && cwd !== "" ? cwd : void 0;
}
async function readForPatch(ctx, file, exec) {
  const cwd = sessionCwdOf(exec);
  const target = await ctx.fs.resolve(file.path, {
    ...cwd === void 0 ? {} : { cwd },
    ...exec?.signal === void 0 ? {} : { signal: exec.signal }
  });
  const info = await ctx.fs.stat(target, exec?.signal);
  if (info === void 0) {
    ctx.emit("fs/observed", target, { kind: "absent" }, exec);
    return { target, current: null };
  }
  if (info.type !== "file") {
    throw new Error(`patch \u65E0\u6CD5\u5E94\u7528\uFF1A${target.displayPath} \u4E0D\u662F\u666E\u901A\u6587\u4EF6\u3002`);
  }
  const current = await ctx.fs.readText(target, exec?.signal);
  ctx.emit("fs/observed", target, { kind: "present", version: info.version }, exec);
  return { target, current };
}
function remediate(error, displayPath, detail) {
  const code = error?.code;
  const message = String(error?.message ?? error);
  const text = code === "FS_NOT_OBSERVED" ? `cannot modify "${displayPath}": file has not been read \u2014 read the file, then retry` : code === "FS_STALE_VERSION" ? `${message} \u2014 re-read the file, then retry` : message;
  const finalText = text + detail;
  if (finalText === message) return error;
  try {
    error.message = finalText;
    return error;
  } catch {
    return new Error(finalText);
  }
}
function formatPatchOutput(value) {
  const lines = [];
  for (const file of value.files) {
    lines.push(
      `${file.operation === "create" ? "Created" : "Updated"} ${file.path} (+${file.added} -${file.removed})`
    );
  }
  lines.push(`
${value.files.length} file(s) changed, +${value.added} -${value.removed}.`);
  return lines.join("\n");
}
function diffsOf(files) {
  return hunkDiffsOf(files);
}
function registerPatchTool(ctx) {
  const escalation = createEscalation(ctx);
  ctx.tools.register({
    name: "patch",
    description: 'Apply a unified diff (git patch) to one or more files in a single call \u2014 the right tool for several scattered edits or a multi-file change, instead of many edit calls or a shell script. Format: --- / +++ file headers plus @@ -oldStart,oldCount +newStart,newCount @@ hunks, exactly like `git diff` output.\nTwo forms, and picking the right one matters:\n1) EDIT an existing file: "--- a/src/a.ts" + "+++ b/src/a.ts" (+ @@ hunks). The file must already exist.\n2) CREATE a new file: "--- /dev/null" + "+++ b/new.ts" + "@@ -0,0 +1,N @@" with only + lines; parent directories are created automatically.\nA missing file patched with form 1 is refused (a typo must not silently create a file). Deleting files is not supported. Every file is read, matched and sandbox-checked before the first write: if any hunk does not match, or any target is outside the writable roots of the current policy, nothing is written at all. The write goes through the session file policy (sandbox): a denial reports the mode in a [sandbox: ...] marker, and when this composition advertises it, the sanctioned retry carries sandbox_permissions + justification for a one-shot user-approved escalation. Use edit for one small replacement and write to create or completely replace a single file.',
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        patch: {
          type: "string",
          description: 'Unified diff text. EDIT: "--- a/src/a.ts\\n+++ b/src/a.ts\\n@@ -12,3 +12,3 @@\\n ctx\\n-old\\n+new\\n ctx".\nCREATE: "--- /dev/null\\n+++ b/notes/t.md\\n@@ -0,0 +1,3 @@\\n+| a | b |\\n+| --- | --- |\\n+| hi | x |".\nMultiple files and multiple @@ hunks per file are allowed; the a/ b/ prefixes are optional; line numbers go in the @@ header (a few lines of drift is tolerated \u2014 the applier searches the file for the context).'
        },
        // 与官方 write / edit 一样：只在真的会围栏的组合里广告这两个字段。
        ...escalation.modes.length > 0 ? escalationSchemaFields(escalation.modes) : {}
      },
      required: ["patch"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          files: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                path: { type: "string" },
                operation: { type: "string", enum: ["create", "update"] },
                added: { type: "integer" },
                removed: { type: "integer" },
                oldText: { oneOf: [{ type: "string" }, { type: "null" }] },
                newText: { type: "string" }
              },
              required: ["path", "operation", "added", "removed", "oldText", "newText"]
            }
          },
          added: { type: "integer" },
          removed: { type: "integer" }
        },
        required: ["files", "added", "removed"]
      },
      render: (_args, value) => [{ type: "text", text: formatPatchOutput(value) }],
      /**
       * 差异卡片就读这里：按 hunk 给出「两侧原文 + 新文件起始行号」。
       *
       * 行号从 `@@` 头里拿（`args.patch` 再解析一次即可，patch 文本很小），这样卡片上的编号
       * 就是文件里的真实行号；统计仍是语义口径（卡片自己跑 LCS），两者不冲突。
       */
      presentationMeta: (args, _value) => ({
        diffs: diffsOf(safeParse(args?.patch))
      })
    },
    /** 预览（流式 / 结算前）：宽容解析 args 里的 patch 文本，等真正应用后再由 meta.diffs 接管。 */
    presentCall(args) {
      const files = safeParse(args?.patch);
      return {
        card: "diff",
        title: `Patch ${files.length} file(s)`,
        diffs: diffsOf(files),
        locations: files.map((file) => ({ path: file.path }))
      };
    },
    isConcurrencySafe: () => false,
    async execute(args, exec) {
      const text = typeof args?.patch === "string" ? args.patch : "";
      if (text.trim() === "") throw new Error("patch \u5FC5\u987B\u662F\u975E\u7A7A\u7684 unified diff \u6587\u672C\u3002");
      const files = parseUnifiedPatch(text);
      if (files.length === 0) {
        throw new Error(
          "patch \u91CC\u6CA1\u6709\u89E3\u6790\u5230\u4EFB\u4F55 hunk\uFF1A\u9700\u8981 --- / +++ \u6587\u4EF6\u5934\u4E0E @@ \u5C0F\u8282\uFF08\u683C\u5F0F\u540C git diff \u8F93\u51FA\uFF09\u3002"
        );
      }
      const sandboxPolicy = await escalation.resolvePolicy("patch", args, exec);
      const plans = [];
      for (const file of files) {
        const { target, current } = await readForPatch(ctx, file, exec);
        const next = applyFilePatch(current, file, { displayPath: target.displayPath });
        if (next === current) continue;
        plans.push({ target, next, file, operation: current === null ? "create" : "update" });
      }
      if (plans.length === 0) throw new Error("patch \u89E3\u6790\u6210\u529F\uFF0C\u4F46\u5B83\u6CA1\u6709\u5E26\u6765\u4EFB\u4F55\u5B9E\u9645\u6539\u52A8\u3002");
      for (const plan of plans) {
        await assertWritable(sandboxPolicy, plan.target.displayPath);
      }
      const done = [];
      for (const plan of plans) {
        try {
          const intent = await ctx.waterfall("fs/write-intent", plan.target, exec, () => void 0);
          const outcome = await ctx.fs.writeText(
            plan.target,
            plan.next,
            intent,
            exec?.signal,
            sandboxPolicy
          );
          ctx.emit("fs/observed", plan.target, { kind: "present", version: outcome.version }, exec);
          done.push({
            path: plan.target.displayPath,
            operation: plan.operation,
            added: plan.file.added,
            removed: plan.file.removed,
            oldText: plan.file.oldText,
            newText: plan.file.newText
          });
        } catch (error) {
          if (error?.code === "FS_SANDBOX_DENIED") {
            console.warn(
              "[dshp-file-change-viewer] patch \u88AB\u6587\u4EF6\u7B56\u7565\u62D2\u7EDD\uFF1Apath=" + plan.target.displayPath + " mode=" + String(sandboxPolicy?.mode ?? "(\u9ED8\u8BA4)") + " workspaceRoot=" + String(sandboxPolicy?.workspaceRoot ?? "(\u9ED8\u8BA4)") + "\uFF08workspace-write \u7684\u53EF\u5199\u6839 = \u4F1A\u8BDD\u5DE5\u4F5C\u533A + /tmp + \u5E73\u53F0\u4E34\u65F6\u76EE\u5F55\uFF1B\u521B\u5EFA\u4E0E\u4FEE\u6539\u540C\u4E00\u628A\u5C3A\u5B50\uFF09"
            );
          }
          const already = done.map((file) => file.path).join(", ");
          const detail = already === "" ? "" : ` \u5DF2\u7ECF\u6210\u529F\u5199\u5165\u7684\u662F\uFF1A${already}\uFF08\u5B83\u4EEC\u4E0D\u4F1A\u56DE\u6EDA\uFF1B\u8BF7 read \u8FD9\u4E9B\u6587\u4EF6\u540E\u7EE7\u7EED\u5904\u7406\u5269\u4E0B\u7684\uFF09\u3002`;
          throw remediate(escalation.mapError(error, sandboxPolicy), plan.target.displayPath, detail);
        }
      }
      let added = 0;
      let removed = 0;
      for (const file of done) {
        added += file.added;
        removed += file.removed;
      }
      return { files: done, added, removed };
    }
  });
}
function safeParse(text) {
  if (typeof text !== "string" || text === "") return [];
  try {
    return parseUnifiedPatch(text, { tolerant: true });
  } catch {
    return [];
  }
}

// src/host/http.ts
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

// src/host/routes.ts
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function snapshotOf(config) {
  return { view: config.view, sectionsOpen: config.sectionsOpen };
}
var VIEWS = ["highlight", "diff"];
function registerRoutes(ctx, getConfig, updateConfig) {
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/ext/dshp-file-change-viewer/state",
      handler: (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        return json(res, 200, { ok: true, config: snapshotOf(getConfig()) });
      }
    }),
    "dshp-file-change-viewer: state route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/ext/dshp-file-change-viewer/config",
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        if (req.method !== "POST") {
          return json(res, 405, { ok: false, error: "method not allowed" });
        }
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        const raw = isRecord(body) ? body : {};
        try {
          const patch = {};
          let hasPatch = false;
          if (Object.hasOwn(raw, "view")) {
            const view = raw["view"];
            if (typeof view !== "string" || !VIEWS.includes(view)) {
              throw new Error("view \u975E\u6CD5\uFF0C\u5E94\u4E3A highlight \u6216 diff");
            }
            patch["view"] = view;
            hasPatch = true;
          }
          if (Object.hasOwn(raw, "sectionsOpen")) {
            const sectionsOpen = raw["sectionsOpen"];
            if (typeof sectionsOpen !== "boolean") throw new Error("sectionsOpen \u975E\u6CD5\uFF0C\u5E94\u4E3A\u5E03\u5C14\u503C");
            patch["sectionsOpen"] = sectionsOpen;
            hasPatch = true;
          }
          if (hasPatch) await updateConfig(patch);
          return json(res, 200, { ok: true, config: snapshotOf(getConfig()) });
        } catch (error) {
          return json(res, 200, { ok: false, error: String(error?.message ?? error) });
        }
      }
    }),
    "dshp-file-change-viewer: config route"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/ext/dshp-file-change-viewer/locate",
      handler: async (req, res) => {
        if (!sameOrigin(req)) return json(res, 403, { ok: false, error: "forbidden" });
        if (req.method !== "POST") {
          return json(res, 405, { ok: false, error: "method not allowed" });
        }
        let body = {};
        try {
          body = JSON.parse(await readBody(req) || "{}");
        } catch {
          return json(res, 200, { ok: false, error: "\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON" });
        }
        const raw = isRecord(body) ? body : {};
        const cwd = typeof raw["cwd"] === "string" && raw["cwd"] !== "" ? raw["cwd"] : void 0;
        const items = Array.isArray(raw["items"]) ? raw["items"].slice(0, MAX_LOCATE_ITEMS) : [];
        const lines = [];
        for (const item of items) {
          lines.push(await locateLine(ctx, item, cwd));
        }
        return json(res, 200, { ok: true, lines });
      }
    }),
    "dshp-file-change-viewer: locate route"
  );
}
var MAX_LOCATE_ITEMS = 20;
var MAX_LOCATE_BYTES = 4 * 1024 * 1024;
async function locateLine(ctx, item, cwd) {
  if (!isRecord(item)) return null;
  const path = item["path"];
  const newText = item["newText"];
  if (typeof path !== "string" || path === "" || typeof newText !== "string" || newText === "") return null;
  const fs = typeof ctx.get === "function" ? ctx.get("fs") : void 0;
  if (fs === void 0 || fs === null) return null;
  try {
    const target = await fs.resolve(path, cwd === void 0 ? {} : { cwd });
    const info = await fs.stat(target);
    if (info === void 0 || info.type !== "file") return null;
    if (typeof info.size === "number" && info.size > MAX_LOCATE_BYTES) return null;
    const content = await fs.readText(target);
    const haystack = content.replace(/\r\n/g, "\n").split("\n");
    const needle = newText.replace(/\r\n/g, "\n").split("\n");
    for (let at = 0; at + needle.length <= haystack.length; at += 1) {
      let hit = true;
      for (let k = 0; k < needle.length; k += 1) {
        if (haystack[at + k] !== needle[k]) {
          hit = false;
          break;
        }
      }
      if (hit) return at + 1;
    }
    return null;
  } catch {
    return null;
  }
}

// src/host/index.ts
var name = "@dshp/file-change-viewer";
var inject = ["webServer"];
function apply(ctx, rawConfig) {
  const entry = { ...DEFAULT_CONFIG };
  try {
    applyPatch(entry, sanitizePatchConfig(rawConfig));
  } catch (error) {
    console.error("[dshp-file-change-viewer] composition config \u6D88\u6BD2\u5931\u8D25\uFF0C\u6539\u7528\u9ED8\u8BA4\u503C\uFF1A", error);
  }
  let current = () => entry;
  try {
    ctx.inject(["settings"], (sctx) => {
      sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
        setSource: (src) => {
          current = src;
        },
        onChange: () => {
        }
      });
    });
  } catch (error) {
    console.error("[dshp-file-change-viewer] \u6CE8\u518C settings \u547D\u540D\u7A7A\u95F4\u5931\u8D25\uFF0C\u504F\u597D\u5C06\u56DE\u9ED8\u8BA4\u503C\uFF1A", error);
  }
  function getConfig() {
    try {
      const value = current();
      if (value !== null && typeof value === "object")
        return { ...entry, ...value };
    } catch {
    }
    return { ...entry };
  }
  async function updateConfig(patch) {
    const settings = ctx.get("settings");
    if (!settings) {
      throw new Error(
        "settings \u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u65E0\u6CD5\u6301\u4E45\u5316\u5230 settings.yaml\uFF08\u8BF7\u91CD\u542F DSH \u6216\u68C0\u67E5 FileSettingsProvider \u662F\u5426\u6302\u8F7D\uFF09"
      );
    }
    await settings.update(NS, patch);
  }
  try {
    registerRoutes(ctx, getConfig, updateConfig);
  } catch (error) {
    console.error("[dshp-file-change-viewer] \u6CE8\u518C\u8BBE\u7F6E\u8DEF\u7531\u5931\u8D25\uFF0C\u8BBE\u7F6E\u8282\u5C06\u53EA\u80FD\u8BFB\u9ED8\u8BA4\u503C\uFF1A", error);
  }
  try {
    ctx.inject(["tools", "fs"], (sctx) => {
      try {
        registerPatchTool(sctx);
      } catch (error) {
        console.error("[dshp-file-change-viewer] \u6CE8\u518C patch \u5DE5\u5177\u5931\u8D25\uFF1A", error);
      }
    });
  } catch (error) {
    console.error("[dshp-file-change-viewer] \u6CE8\u5165 tools / fs \u5931\u8D25\uFF0Cpatch \u5DE5\u5177\u4E0D\u53EF\u7528\uFF1A", error);
  }
  const config = getConfig();
  console.info(
    "[dshp-file-change-viewer] Host \u534A\u5DF2\u5C31\u7EEA\uFF1A\u6E32\u67D3\u903B\u8F91\u5728 Client \u534A\uFF0C\u53E6\u6CE8\u518C patch \u5DE5\u5177\uFF1B\u663E\u793A\u504F\u597D\u547D\u540D\u7A7A\u95F4 " + NS + "\uFF08view=" + config.view + ", sectionsOpen=" + String(config.sectionsOpen) + "\uFF09\u3002"
  );
}

export { ConfigSchema, NS, apply, applyFilePatch, assertWritable, hunkDiffsOf, inject, name, parseUnifiedPatch, patchTotals, writableRootsUnder };
