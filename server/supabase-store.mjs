// Shared durable state backed by Supabase.
export function createSupabaseStore({
  url = process.env.SUPABASE_URL,
  secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
  bucket = process.env.SUPABASE_STORAGE_BUCKET || 'portfolio'
} = {}) {
  if (!url?.startsWith('https://') || !secret) {
    throw new Error('Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const baseStorage = `${url.replace(/\/+$/, '')}/storage/v1`;
  const headers = {
    apikey: secret,
    Authorization: `Bearer ${secret}`
  };

  const objectUrl = (name, auth = true) =>
    `${baseStorage}/object/${auth ? 'authenticated' : 'public'}/${bucket}/${name}`;

  const limits = new Map();
  const sessionCache = new Map();

  async function ensureBucket() {
    try {
      const res = await fetch(`${baseStorage}/bucket/${bucket}`, { headers });
      if (res.status === 404) {
        await fetch(`${baseStorage}/bucket`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: bucket, name: bucket, public: true })
        });
      }
    } catch {
      // Ignored if bucket exists or check fails non-critically
    }
  }

  return {
    async read(name) {
      const res = await fetch(objectUrl(name, true), {
        headers,
        signal: AbortSignal.timeout(10000)
      });
      if (res.status === 404) {
        throw Object.assign(new Error(`Not found: ${name}`), { code: 'ENOENT' });
      }
      if (!res.ok) {
        throw new Error(`Failed to read ${name} from storage (${res.status})`);
      }
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    },

    async exists(name) {
      try {
        const res = await fetch(objectUrl(name, true), {
          method: 'HEAD',
          headers,
          signal: AbortSignal.timeout(5000)
        });
        return res.status >= 200 && res.status < 300;
      } catch {
        return false;
      }
    },

    async write(name, value) {
      await ensureBucket();
      const body = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      const res = await fetch(`${baseStorage}/object/${bucket}/${name}`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'x-upsert': 'true'
        },
        body,
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Failed to write ${name} to storage (${res.status}): ${errText}`);
      }
    },

    async init(name, value) {
      const alreadyExists = await this.exists(name);
      if (!alreadyExists) {
        await this.write(name, value);
      }
    },

    async compare(name, oldVal, nextVal, backup = false) {
      let current;
      try {
        current = await this.read(name);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      if (oldVal?.revision !== undefined && current?.revision !== undefined) {
        if (current.revision !== oldVal.revision) {
          return false;
        }
      }
      if (backup && oldVal) {
        const backupName = name.replace(/\.json$/, '.backup.json');
        await this.write(backupName, oldVal);
      }
      await this.write(name, nextVal);
      return true;
    },

    async append(message) {
      let messages = [];
      try {
        messages = await this.read('messages.json');
        if (!Array.isArray(messages)) messages = [];
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      if (messages.length >= 5000) return false;
      messages.unshift(message);
      await this.write('messages.json', messages);
      return true;
    },

    async limit(name, windowMs) {
      const now = Date.now();
      let entry = limits.get(name);
      if (!entry || entry.until < now) {
        entry = { count: 0, until: now + windowMs };
        limits.set(name, entry);
      }
      return ++entry.count;
    },

    sessions: {
      async get(id) {
        const cached = sessionCache.get(id);
        const now = Date.now();
        if (cached) {
          if (cached.expires < now || cached.idle < now) {
            sessionCache.delete(id);
            return undefined;
          }
          return cached;
        }
        try {
          const res = await fetch(objectUrl(`sessions/${id}.json`, true), {
            headers,
            signal: AbortSignal.timeout(8000)
          });
          if (res.status === 404) return undefined;
          if (!res.ok) return undefined;
          const session = await res.json();
          if (session.expires < now || session.idle < now) {
            await this.delete(id);
            return undefined;
          }
          sessionCache.set(id, session);
          return session;
        } catch {
          return undefined;
        }
      },

      async set(id, value) {
        sessionCache.set(id, value);
        try {
          await fetch(`${baseStorage}/object/${bucket}/sessions/${id}.json`, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
              'x-upsert': 'true'
            },
            body: JSON.stringify(value),
            signal: AbortSignal.timeout(10000)
          });
        } catch (err) {
          console.error('Failed to persist session to Supabase:', err);
        }
      },

      async touch(id, value) {
        await this.set(id, value);
        return true;
      },

      async delete(id) {
        sessionCache.delete(id);
        try {
          await fetch(`${baseStorage}/object/${bucket}`, {
            method: 'DELETE',
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prefixes: [`sessions/${id}.json`] }),
            signal: AbortSignal.timeout(8000)
          });
        } catch {
          // Non-critical cleanup
        }
      },

      clear() {
        sessionCache.clear();
      }
    }
  };
}
