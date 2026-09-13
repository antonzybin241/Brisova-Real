import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { fileURLToPath } from "url";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data");
const dataFile = path.join(dataDir, "store.json");

const TABLES = [
  "user",
  "property",
  "investment",
  "transaction",
  "kycRecord",
  "favorite",
  "platformSettings",
  "auditLog",
];

const emptyState = () => Object.fromEntries(TABLES.map((name) => [name, []]));

const id = () => `c${randomBytes(12).toString("hex")}`;

const clone = (value) => {
  if (typeof value === "bigint") return value;
  if (value instanceof Date) return new Date(value);
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clone(v)]));
  }
  return value;
};

const dehydrate = (value) => {
  if (typeof value === "bigint") return { __t: "bigint", v: value.toString() };
  if (value instanceof Date) return { __t: "date", v: value.toISOString() };
  if (Array.isArray(value)) return value.map(dehydrate);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, dehydrate(v)]));
  }
  return value;
};

const hydrate = (value) => {
  if (Array.isArray(value)) return value.map(hydrate);
  if (value && typeof value === "object") {
    if (value.__t === "bigint") return BigInt(value.v);
    if (value.__t === "date") return new Date(value.v);
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, hydrate(v)]));
  }
  return value;
};

let state = emptyState();
let loaded = false;

const persist = () => {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(dehydrate(state), null, 2));
};

const load = () => {
  if (loaded) return;
  loaded = true;
  if (!fs.existsSync(dataFile)) {
    state = emptyState();
    return;
  }
  try {
    state = { ...emptyState(), ...hydrate(JSON.parse(fs.readFileSync(dataFile, "utf8"))) };
  } catch {
    state = emptyState();
  }
};

const matches = (doc, where = {}) =>
  Object.entries(where).every(([key, value]) => {
    if (value == null) return doc[key] == null;
    if (key.includes("_") && typeof value === "object" && !Array.isArray(value) && value !== null && !("contains" in value) && !("gte" in value) && !("lte" in value) && !("in" in value) && !("not" in value)) {
      return Object.entries(value).every(([field, expected]) => doc[field] === expected);
    }
    if (typeof value !== "object" || value instanceof Date) {
      return doc[key] === value;
    }
    if (value.contains != null) {
      return String(doc[key] ?? "").toLowerCase().includes(String(value.contains).toLowerCase());
    }
    if (value.in) return value.in.includes(doc[key]);
    if (value.not != null && typeof value.not !== "object") return doc[key] !== value.not;
    if (value.gte != null && Number(doc[key]) < Number(value.gte)) return false;
    if (value.lte != null && Number(doc[key]) > Number(value.lte)) return false;
    if (value.gt != null && Number(doc[key]) <= Number(value.gt)) return false;
    if (value.lt != null && Number(doc[key]) >= Number(value.lt)) return false;
    return true;
  });

const pick = (doc, select) => {
  if (!select) return clone(doc);
  return Object.fromEntries(Object.keys(select).filter((key) => select[key]).map((key) => [key, clone(doc[key])]));
};

const applyInclude = (doc, include, db) => {
  if (!include) return clone(doc);
  const next = clone(doc);
  for (const [name, spec] of Object.entries(include)) {
    if (!spec) continue;
    if (name === "owner" || (name === "user" && doc.userId)) {
      const related = db[name === "owner" ? "user" : "user"]._rows().find((row) => row.id === (name === "owner" ? doc.ownerId : doc.userId));
      next[name] = related ? pick(related, spec.select) : null;
      continue;
    }
    if (name === "property") {
      const related = db.property._rows().find((row) => row.id === doc.propertyId);
      next.property = related ? pick(related, spec.select) : null;
      continue;
    }
    if (name === "investments") {
      let rows = db.investment._rows().filter((row) => row.propertyId === doc.id);
      if (spec.orderBy) {
        const [[field, dir]] = Object.entries(spec.orderBy);
        rows.sort((a, b) => (a[field] > b[field] ? 1 : -1) * (dir === "desc" ? -1 : 1));
      }
      if (spec.take) rows = rows.slice(0, spec.take);
      next.investments = rows.map((row) => applyInclude(row, spec.include, db));
    }
  }
  return next;
};

const DEFAULTS = {
  user: { role: "INVESTOR", kycStatus: "NOT_STARTED", isActive: true },
  property: {
    status: "DRAFT",
    expectedRoi: 0,
    rentalYield: 0,
    isTokenized: false,
    fractionalAvailable: false,
    images: [],
    documents: [],
    totalSupply: 0n,
    availableTokens: 0n,
    chainId: 1,
  },
  investment: { status: "ACTIVE", chainId: 1, rentalEarnedUsd: 0 },
  kycRecord: { status: "PENDING" },
};

const flattenWhere = (where = {}) => {
  const flattened = {};
  for (const [key, value] of Object.entries(where)) {
    if (
      key.includes("_") &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !("contains" in value) &&
      !("in" in value)
    ) {
      Object.assign(flattened, value);
    } else {
      flattened[key] = value;
    }
  }
  return flattened;
};

const createTable = (name, db) => ({
  _rows: () => state[name],
  async findUnique({ where, include } = {}) {
    load();
    const doc = state[name].find((row) => matches(row, where));
    return doc ? applyInclude(doc, include, db) : null;
  },
  async findFirst({ where, include, orderBy } = {}) {
    const [doc] = await this.findMany({ where, include, orderBy, take: 1 });
    return doc ?? null;
  },
  async findMany({ where, skip = 0, take, orderBy, include } = {}) {
    load();
    let rows = state[name].filter((row) => matches(row, where));
    if (orderBy) {
      const [[field, dir]] = Object.entries(orderBy);
      rows.sort((a, b) => {
        const av = a[field];
        const bv = b[field];
        if (av < bv) return dir === "desc" ? 1 : -1;
        if (av > bv) return dir === "desc" ? -1 : 1;
        return 0;
      });
    }
    if (skip) rows = rows.slice(skip);
    if (take != null) rows = rows.slice(0, take);
    return rows.map((row) => applyInclude(row, include, db));
  },
  async count({ where } = {}) {
    load();
    return state[name].filter((row) => matches(row, where)).length;
  },
  async create({ data, include } = {}) {
    load();
    const now = new Date();
    const doc = {
      ...(DEFAULTS[name] ? clone(DEFAULTS[name]) : {}),
      id: data.id || id(),
      ...clone(data),
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    state[name].push(doc);
    persist();
    return applyInclude(doc, include, db);
  },
  async update({ where, data, include } = {}) {
    load();
    const index = state[name].findIndex((row) => matches(row, where));
    if (index < 0) throw new Error(`${name} not found`);
    state[name][index] = {
      ...state[name][index],
      ...clone(data),
      updatedAt: new Date(),
    };
    persist();
    return applyInclude(state[name][index], include, db);
  },
  async deleteMany({ where } = {}) {
    load();
    const before = state[name].length;
    state[name] = where ? state[name].filter((row) => !matches(row, where)) : [];
    persist();
    return { count: before - state[name].length };
  },
  async upsert({ where, create, update, include } = {}) {
    load();
    const existing = state[name].find((row) => matches(row, where));
    if (existing) {
      return this.update({ where: { id: existing.id }, data: update, include });
    }
    return this.create({ data: { ...flattenWhere(where), ...create }, include });
  },
  async aggregate({ _sum } = {}) {
    load();
    const sums = {};
    for (const field of Object.keys(_sum || {})) {
      sums[field] = state[name].reduce((total, row) => total + Number(row[field] || 0), 0);
    }
    return { _sum: sums };
  },
});

const db = {
  $connect: async () => load(),
  $disconnect: async () => persist(),
  $transaction: async (ops) => Promise.all(ops),
};

TABLES.forEach((name) => {
  db[name] = createTable(name, db);
});

export const seedIfEmpty = async (seeder) => {
  load();
  if (state.property.length === 0 && typeof seeder === "function") {
    await seeder();
  }
};

export default db;
