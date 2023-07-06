const chokidar = require("chokidar");
const spawn = require("child_process").spawn;
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

let processes = [];

if (!argv.chapter) {
  console.log('\nPlease specify a chapter with --chapter=1\n');
  process.exit(1);
}

const chapter = Number(argv.chapter);
const dir = __dirname + `/book/chapter-${chapter < 10 ? '0' + chapter : chapter}`;

function compileJS(callback = () => {}) {
  const inputJS = `${dir}/code/src/app.tsx`;
  const outputJS = `${dir}/code/public/app.js`;
  command(
    `${__dirname}/node_modules/.bin/esbuild ${inputJS} --bundle --minify --outfile=${outputJS} --sourcemap`,
    dir,
    callback
  );
}
function runServer() {
  command(`${__dirname}/node_modules/.bin/serve -l 3001`);
}
function command(cmd, cwd, onExit = () => {}) {
  const proc = spawn(cmd, {
    shell: true,
    cwd,
    stdio: "inherit",
  });

  proc.on("exit", (code) => onExit(code));
  proc.on("error", (error) => {
    console.error(
      `"${cmd}" errored with error = ${error.toString()}`
    );
  });
  processes.push(proc);
  return proc;
};
function exitHandler(err) {
  if (err) {
    console.log(err);
  }
  processes.forEach(p => p.close ? p.close() : p.kill());
}

// do something when app is closing
process.on("exit", exitHandler);
// catches ctrl+c event
process.on("SIGINT", exitHandler);
// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler);
process.on("SIGUSR2", exitHandler);
// catches uncaught exceptions
process.on("uncaughtException", exitHandler);

chokidar.watch(`${dir}/code/src/**/*.*`, { ignoreInitial: true }).on("all", () => {
  compileJS();
});
compileJS();
runServer();