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
function checkWithinRange(data, meta8, description, options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta8;
  if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
  if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta: meta8 }, options) => {
  if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
  if (meta8.pattern) {
    const regexp = new RegExp(meta8.pattern.source, meta8.pattern.flags);
    if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
  }
  checkWithinRange(data.length, meta8, "string length", options);
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
Schema.extend("number", (data, { meta: meta8 }, options) => {
  if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
  checkWithinRange(data, meta8, "number", options);
  const { step } = meta8;
  if (step && !isMultipleOf(data, meta8.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
  return [data];
});
Schema.extend("boolean", (data, _, options) => {
  if (typeof data === "boolean") return [data];
  throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta: meta8 }, options) => {
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
  if (value === meta8.default) return [value];
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
Schema.extend("array", (data, { inner, meta: meta8 }, options) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  checkWithinRange(data.length, meta8, "array length", options, !isNullable(inner.meta.default));
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

// src/host/themes/claude.ts
var claude_exports = {};
__export(claude_exports, {
  light: () => light,
  meta: () => meta
});

// src/host/themes/shared.ts
var MONO = '"Berkeley Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
var SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';
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
  const monoStack = MONO;
  const ui = font;
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

// src/host/themes/claude.ts
var light = fillFontTokens(
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
var meta = {
  light: {
    id: "claude-parchment-light",
    label: "Claude \u7F8A\u76AE\u7EB8",
    desc: "\u7F8A\u76AE\u7EB8 #f5f4ed + \u8D64\u9676 #c96442",
    swatch: ["#f5f4ed", "#faf9f5", "#c96442", "#141413"]
  }
};

// src/host/themes/supabase.ts
var supabase_exports = {};
__export(supabase_exports, {
  dark: () => dark,
  meta: () => meta2
});
var dark = fillFontTokens(
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
var meta2 = {
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
  light: () => light2,
  meta: () => meta3
});
var light2 = fillFontTokens(
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
var meta3 = {
  light: {
    id: "sakura-light",
    label: "Sakura \u6A31\u7C89",
    desc: "\u6A31\u767D #fff9fa + \u6A31\u7C89 #e75480",
    swatch: ["#fff9fa", "#fbeef2", "#e75480", "#432635"]
  }
};

// src/host/themes/xiaohongshu.ts
var xiaohongshu_exports = {};
__export(xiaohongshu_exports, {
  light: () => light3,
  meta: () => meta4
});
var light3 = fillFontTokens(
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
var meta4 = {
  light: {
    id: "xiaohongshu-light",
    label: "\u5C0F\u7EA2\u4E66 \u79CD\u8349\u7EA2",
    desc: "\u7C73\u7070 #f5f5f5 + \u79CD\u8349\u7EA2 #ff2442",
    swatch: ["#f5f5f5", "#ffffff", "#ff2442", "rgba(0, 0, 0, 0.8)"]
  }
};

// src/host/themes/levels.ts
var levels_exports = {};
__export(levels_exports, {
  light: () => light4,
  meta: () => meta5
});
var light4 = fillFontTokens(
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
var meta5 = {
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
  light: () => light5,
  meta: () => meta6
});
var light5 = fillFontTokens(
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
var meta6 = {
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
  dark: () => dark2,
  meta: () => meta7
});
var dark2 = fillFontTokens(
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
var meta7 = {
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
    const meta8 = scheme === "dark" ? module.meta?.dark : module.meta?.light;
    if (!tokens || !meta8) continue;
    entries.push({ colorScheme: scheme, tokens, ...meta8 });
  }
  return entries;
}
var THEME_CATALOG = [
  ...expand(claude_exports),
  ...expand(levels_exports),
  ...expand(arc_exports),
  ...expand(luxury_exports),
  ...expand(xiaohongshu_exports),
  ...expand(supabase_exports),
  ...expand(sakura_exports)
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
