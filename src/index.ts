import chokidar from 'chokidar'
import * as FS from 'fs/promises'
import { glob } from 'glob'
import * as YAML from 'js-yaml'
import * as Path from 'path'

export default async function yaml2json(directoryIn: string, directoryOut: string, options: YAML2JSONOptions = {}) {
  if (options.watch) {
    const watcher = chokidar.watch(directoryIn, {
      persistent: true,
    })

    watcher.on('add', async (filePath) => {
      await convertFile(filePath, directoryIn, directoryOut)
    })

    watcher.on('change', async (filePath) => {
      await convertFile(filePath, directoryIn, directoryOut)
    })

    watcher.on('unlink', async (filePath) => {
      const relpath = filePath.slice(directoryIn.length + 1)
      const outpath = Path.join(directoryOut, relpath.replace(/$/, '.json'))
      await FS.unlink(outpath)
    })

    watcher.on('ready', () => {
      process.stderr.write(`Watching ${directoryIn} for changes...\n`)
    })
  } else {
    await convert(directoryIn, directoryOut)
  }
}

async function convert(directoryIn: string, directoryOut: string) {
  for (const file of await glob(directoryIn + '/**/*.{yml,yaml}')) {
    await convertFile(file, directoryIn, directoryOut)
  }
}

async function convertFile(path: string, directoryIn: string, directoryOut: string) {
  const ext = Path.extname(path)
  if (!['.yml', '.yaml'].includes(ext)) { return }

  try {
    const relpath = path.slice(directoryIn.length + 1)
    const outpath = Path.join(directoryOut, relpath.replace(/$/, '.json'))

    const yaml = await FS.readFile(path, 'utf8')
    const content = YAML.load(yaml)

    const dirstat = await FS.stat(Path.dirname(outpath)).catch(() => null)
    if (!dirstat || !dirstat.isDirectory()) { return }

    await FS.writeFile(outpath, JSON.stringify(content))

    process.stderr.write(`${relpath}\n`)
  } catch (error) {
    process.stderr.write(`${path}: ${error}\n`)
  }
}

export interface YAML2JSONOptions {
  watch?: boolean
}