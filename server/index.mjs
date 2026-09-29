// Starts the HalalMap API. Importing this module starts the server (deployment/serve-existing.mjs relies on that);
// the request handling itself lives in ./app.mjs so tests can build an isolated instance.
import { createApi } from "./app.mjs";

const port = Number(process.env.API_PORT || 8787);
createApi().listen(port, "127.0.0.1", () => {
  console.log(`HalalMap API http://127.0.0.1:${port}`);
});
