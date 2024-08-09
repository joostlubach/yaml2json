import * as FS from 'fs/promises'
import glob from 'glob-promise'
import * as YAML from 'js-yaml'
import * as Path from 'path'

export default async function yaml2json(directoryIn: string, directoryOut: string) {
  for (const file of await glob(directoryIn + '/**/*.{yml,yaml}')) {
    const relpath = file.slice(directoryIn.length + 1)
    const outpath = Path.join(directoryOut, relpath.replace(/$/, '.json'))

    const yaml = await FS.readFile(file, 'utf8')
    const content = YAML.load(yaml)

    const dirstat = await FS.stat(Path.dirname(outpath)).catch(() => null)
    if (!dirstat || !dirstat.isDirectory()) { continue }

    await FS.writeFile(outpath, JSON.stringify(content))

    process.stderr.write(`${relpath}\n`)
  }
}
