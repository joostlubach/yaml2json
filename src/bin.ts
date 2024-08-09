import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import yaml2json from './'

const args = yargs(hideBin(process.argv))

args.command('$0 <directory_in> <directory_out>', 'Convert YAML files to JSON', (yargs) => {
  yargs.positional('directory_in', {
    describe: 'Input directory',
  })
  yargs.positional('directory_out', {
    describe: 'Output directory',
  })
}, args => {
  yaml2json(args.directory_in as string, args.directory_out as string).then(
    () => process.exit(0),
    (error) => {
      console.error(error)
      process.exit(1)
    },
  )
}).parse()
