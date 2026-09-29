// Tiny path router: "/api/admin/products/:id" -> handler({ request, response, url, params, body }).

const compile = (path) => {
  const names = [];
  const pattern = path.replace(/:([A-Za-z]+)/g, (_, name) => {
    names.push(name);
    return "([^/]+)";
  });
  return { regex: new RegExp(`^${pattern}$`), names };
};

export const createRouter = () => {
  const routes = [];
  const add = (method, path, handler) => routes.push({ method, ...compile(path), handler });
  return {
    get: (path, handler) => add("GET", path, handler),
    post: (path, handler) => add("POST", path, handler),
    patch: (path, handler) => add("PATCH", path, handler),
    delete: (path, handler) => add("DELETE", path, handler),
    /** @returns {Promise<boolean>} true when a route handled the request */
    async handle(request, response, url) {
      for (const route of routes) {
        if (route.method !== request.method) continue;
        const match = route.regex.exec(url.pathname);
        if (!match) continue;
        const params = Object.fromEntries(route.names.map((name, i) => [name, decodeURIComponent(match[i + 1])]));
        await route.handler({ request, response, url, params });
        return true;
      }
      return false;
    },
  };
};
