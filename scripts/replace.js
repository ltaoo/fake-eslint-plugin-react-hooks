const fs = require("fs");
const path = require("path");

function resolveNodeModules(...paths) {
  return path.resolve(__dirname, "../node_modules/", ...paths);
}
const originalReactHooksPluginPath = resolveNodeModules(
  "./eslint-plugin-react-hooks/cjs/eslint-plugin-react-hooks.development.js"
);
function resolveOutput(...paths) {
  return path.resolve(__dirname, "../dist", ...paths);
}

async function checkNodeModules() {
  try {
    await fs.statSync(resolveNodeModules());
  } catch (err) {
    throw new Error("请先 yarn 安装依赖");
  }
}
async function checkOutput() {
  try {
    await fs.statSync(resolveOutput());
  } catch (err) {
    throw new Error("请先 yarn build 打包");
  }
}

(async () => {
  try {
    await checkNodeModules();
    await checkOutput();

    fs.copyFileSync(resolveOutput("./index.js"), originalReactHooksPluginPath);
  } catch (err) {
    //
    console.log(err);
    process.exit(1);
  }
})();
