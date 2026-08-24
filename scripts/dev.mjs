import { spawn, spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const nodeCommand = process.execPath;
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const processes = [
  spawn(nodeCommand, ["--env-file-if-exists=.env", resolve(projectRoot, "server/index.mjs")], { stdio: "inherit", cwd: projectRoot }),
  spawn(nodeCommand, [resolve(projectRoot, "node_modules/vite/bin/vite.js"), "--host", "0.0.0.0"], { stdio: "inherit", cwd: projectRoot }),
];

const stop = () => {
  for (const child of processes) {
    if (!child.pid) continue;
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
    } else {
      child.kill("SIGTERM");
    }
  }
};

for (const child of processes) {
  child.on("exit", (code) => {
    stop();
    process.exit(code ?? 0);
  });
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
