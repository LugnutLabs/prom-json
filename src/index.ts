import { Registry, Counter, Gauge, Summary, Histogram } from 'prom-client'

import * as readline from 'readline'
import { Readable } from 'stream'


const typeToCtorMap = {
  counter: Counter,
  histogram: Histogram,
  gauge: Gauge,
  summary: Summary
}
/**
 * Convert default Prometheus text formatted metrics data into JSON
 *
 * @param {Object} options - object defining the required and supported options for this function
 * @param {[string] | string | ReadableStream} metrics - metrics data to be converted to JSON
 * @returns {Object} JSON array of the provided metrics
 */
export async function textToJSON ({ metrics }: { metrics: [string] | string | Readable }) {
  const registry = new Registry()
  if (typeof metrics === 'string' || Array.isArray(metrics)) {
    metrics = Readable.from(metrics)
  }
  /*
   * Parse the string data into metrics and add them to the registry
   */
  const rl = readline.createInterface({ input: metrics })
  let metric: any = {}
  const read = async () => {
    return new Promise((resolve, reject) => {
      rl.on('line', line => {
        if (line.length === 0) { return }
        console.log(`${line}`)
        readLine({ line, metric })
        if (metric.ctor) {
          const { ctor: Ctor, name, help } = metric
          // Do things!
          // eslint-disable-next-line no-new
          new Ctor({
            name,
            help,
            registers: [registry]
          })
          metric = {}
        }
      })
      rl.on('close', () => {
        resolve('')
      })
    })
  }
  await read()
  /*
   * Serialize the registries metrics into JSON
   */
  return registry.getMetricsAsJSON()
}

// function readHelpLine ({ help, registry }: { help: string, registry: Registry }) {
// }
// function readTypeLine () {
// }

function readCommentLine ({ commentLine, metric }: { commentLine: string, metric: any }): void {
  const tokenizedCommentLine = commentLine.split(' ')
  const [, keyword, metricName, ...rest] = tokenizedCommentLine
  switch (keyword) {
    case 'HELP': {
      const helpText = rest.join('')
      metric.name = metricName
      metric.help = helpText
      return
    }
    case 'TYPE': {
      const type = rest.join('')
      metric.ctor = typeToCtorMap[type]
      // eslint-disable-next-line no-useless-return
      return
    }
  }
}

function readMetricLine ({ metricLine, metric }: { metricLine: string, metric: any }) {

}

function readMetricName () {}
function readLabels () {}
function readLabelName () {}
function readLabelValue () {}

function readLine ({ line, metric }: { line: string, metric: any }) {
  /*
   * Find 1st non-blank character
   */
  const arr = line.split('')
  for (let i = 0; i < arr.length; i += 1) {
    const char = arr[i]
    if (char !== ' ' && char !== '\t') {
      if (char === '#') {
        readCommentLine({ commentLine: line.substring(i), metric })
      } else {
        readMetricLine({ metricLine: line.substring(i), metric })
      }
    }
  }
}

/*
 * <HACK>
 * Testing the metric APIs and produced JSON
 */
// const counter = new Counter({
//   name: 'test_counter_name',
//   help: 'test_counter_help',
//   registers: [registry]
// })
// counter.inc(13)
// const histogram = new Histogram({
//   name: 'test_histogram_name',
//   help: 'test_histogram_help',
//   registers: [registry]
// })
// histogram.observe(10)
// const gauge = new Gauge({
//   name: 'test_gauge_name',
//   help: 'test_gauge_help',
//   registers: [registry]
// })
// gauge.set(123)
// const summary = new Summary({
//   name: 'test_summary_name',
//   help: 'test_summary_help',
//   registers: [registry]
// })
// summary.observe(1234)
/*
  * </HACK>
  */
// console.log(await registry.metrics())
