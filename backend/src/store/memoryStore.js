import { randomUUID } from "crypto";

const matchDoc = (doc, query) =>
  Object.entries(query).every(([key, value]) => {
    if (value instanceof RegExp) {
      return value.test(String(doc[key] ?? ""));
    }
    return doc[key] === value;
  });

const parseSort = (sort) => {
  if (!sort) return null;
  if (typeof sort === "object" && !Array.isArray(sort)) {
    const [field, dirVal] = Object.entries(sort)[0] || [];
    if (!field) return null;
    const dir = Number(dirVal) < 0 ? -1 : 1;
    return { field, dir };
  }
  const field = String(sort).replace(/^-/, "");
  const dir = String(sort).startsWith("-") ? -1 : 1;
  return { field, dir };
};

class MemoryQuery {
  constructor(collection, query) {
    this.collection = collection;
    this.query = query;
    this.sortSpec = null;
    this.skipN = 0;
    this.limitN = Infinity;
    this.selectFields = null;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  skip(n) {
    this.skipN = n;
    return this;
  }

  limit(n) {
    this.limitN = n;
    return this;
  }

  select(fields) {
    this.selectFields = fields.split(/\s+/).filter(Boolean);
    return this;
  }

  lean() {
    return this;
  }

  exec() {
    return this._run();
  }

  then(resolve, reject) {
    return this._run().then(resolve, reject);
  }

  async _run() {
    let rows = [...this.collection.docs.values()].filter((doc) =>
      matchDoc(doc, this.query)
    );

    const sort = parseSort(this.sortSpec);
    if (sort) {
      rows.sort((a, b) => {
        const av = a[sort.field];
        const bv = b[sort.field];
        if (av < bv) return -1 * sort.dir;
        if (av > bv) return 1 * sort.dir;
        return 0;
      });
    }

    if (this.skipN) rows = rows.slice(this.skipN);
    if (Number.isFinite(this.limitN)) rows = rows.slice(0, this.limitN);

    if (this.selectFields) {
      rows = rows.map((row) => {
        const picked = {};
        this.selectFields.forEach((key) => {
          if (row[key] !== undefined) picked[key] = row[key];
        });
        return picked;
      });
    }

    return rows.map((row) => ({ ...row }));
  }
}

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.docs = new Map();
  }

  _wrap(doc) {
    const collection = this;
    const wrapped = {
      ...doc,
      save: async function save() {
        doc.updatedAt = new Date().toISOString();
        collection.docs.set(doc._id, doc);
        return doc;
      },
    };
    return wrapped;
  }

  async findOne(query) {
    for (const doc of this.docs.values()) {
      if (matchDoc(doc, query)) return this._wrap(doc);
    }
    return null;
  }

  find(query = {}) {
    return new MemoryQuery(this, query);
  }

  async create(data) {
    const now = new Date().toISOString();
    const doc = {
      _id: randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.docs.set(doc._id, doc);
    return this._wrap(doc);
  }

  async countDocuments(query = {}) {
    return [...this.docs.values()].filter((doc) => matchDoc(doc, query)).length;
  }

  async findOneAndUpdate(query, update, options = {}) {
    let doc = null;
    for (const entry of this.docs.values()) {
      if (matchDoc(entry, query)) {
        doc = entry;
        break;
      }
    }

    if (!doc && options.upsert) {
      const created = await this.create({ ...query, ...update });
      return options.new !== false ? created : null;
    }

    if (!doc) return null;

    Object.assign(doc, update, { updatedAt: new Date().toISOString() });
    this.docs.set(doc._id, doc);
    return options.new !== false ? this._wrap(doc) : doc;
  }

  async deleteMany(query) {
    const toDelete = [...this.docs.entries()].filter(([, doc]) =>
      matchDoc(doc, query)
    );
    toDelete.forEach(([id]) => this.docs.delete(id));
    return { deletedCount: toDelete.length };
  }
}

const collections = {
  newsletter: new MemoryCollection("newsletter"),
  audit: new MemoryCollection("audit"),
};

export { MemoryCollection, collections };
