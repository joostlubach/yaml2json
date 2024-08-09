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
  yargs.option('--watch', {
    alias:    'w',
    type:     'boolean',
    describe: 'Watch for changes',
  })
}, args => {
  const promise = yaml2json(args.directory_in as string, args.directory_out as string, {
    watch: args.watch as boolean,
  })
  
  if (!args.watch) {
    promise.then(
      () => process.exit(0),
      (error) => {
        console.error(error)
        process.exit(1)
      }
    )
  }
}).parse()
