import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// Runs the Vercel functions in /api inside the Vite dev server, so
// `npm run dev` works end to end without the Vercel CLI. Teams are kept
// in memory unless KV_REST_API_URL / KV_REST_API_TOKEN are set.
function localApi() {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use("/api", async (req, res, next) => {
        const url = new URL(req.originalUrl, "http://localhost");
        const name = url.pathname.replace(/^\/api\//, "");
        if (!/^[a-z]+$/.test(name)) return next();

        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`);
          const handler = mod[req.method];
          if (!handler) {
            res.statusCode = 405;
            return res.end();
          }

          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const hasBody = !["GET", "HEAD"].includes(req.method);
          // Over HTTPS Vite serves HTTP/2, whose headers object also holds
          // pseudo-headers (":method") and a symbol key; Request rejects both.
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (key.startsWith(":") || value === undefined) continue;
            headers.set(key, Array.isArray(value) ? value.join(", ") : value);
          }
          const request = new Request(url, {
            method: req.method,
            headers,
            body: hasBody ? Buffer.concat(chunks) : undefined,
          });

          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Let the local API read .env (Redis keys, ADMIN_KEY) the way Vercel does.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react(), basicSsl(), localApi()],
    server: {
      host: true, // reachable from phones on the same Wi-Fi
    },
  };
});
