import { Redis } from "@upstash/redis";

// Team storage. On Vercel this is Upstash Redis (added from the Vercel
// Marketplace, which sets the KV_REST_API_* variables). Locally, with no
// Redis configured, teams live in memory until the dev server restarts.

const PREFIX = "ath:";
const TEAM_SET = `${PREFIX}teams`;
const teamKey = (id) => `${PREFIX}team:${id}`;

function redisFromEnv() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

function redisStore(redis) {
  return {
    async getTeam(id) {
      return (await redis.get(teamKey(id))) || null;
    },
    async saveTeam(team) {
      await redis.set(teamKey(team.id), team);
      await redis.sadd(TEAM_SET, team.id);
    },
    async listTeams() {
      const ids = await redis.smembers(TEAM_SET);
      if (ids.length === 0) return [];
      const teams = await redis.mget(...ids.map(teamKey));
      return teams.filter(Boolean);
    },
    async clear() {
      const ids = await redis.smembers(TEAM_SET);
      if (ids.length > 0) await redis.del(...ids.map(teamKey));
      await redis.del(TEAM_SET);
    },
  };
}

function memoryStore() {
  const teams = new Map();
  const copy = (team) => (team ? structuredClone(team) : null);
  return {
    async getTeam(id) {
      return copy(teams.get(id));
    },
    async saveTeam(team) {
      teams.set(team.id, copy(team));
    },
    async listTeams() {
      return [...teams.values()].map(copy);
    },
    async clear() {
      teams.clear();
    },
  };
}

let store = null;

export function getStore() {
  if (store) return store;
  const redis = redisFromEnv();
  if (redis) {
    store = redisStore(redis);
  } else if (process.env.VERCEL) {
    // Memory is not shared between serverless instances, so it would
    // silently lose teams. Fail loudly instead.
    return null;
  } else {
    store = memoryStore();
  }
  return store;
}
