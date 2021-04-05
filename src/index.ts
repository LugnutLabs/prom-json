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
        // console.log(`${line}`)
        readLine({ line, metric })
        if (metric.ctor && metric.ready) {
          const { ctor: Ctor, name, help } = metric
          // Do things!
          // eslint-disable-next-line no-new
          const parsedMetric = new Ctor({
            name,
            help,
            registers: [registry]
          })
          metric.setData(parsedMetric)
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
      metric.type = type
      // eslint-disable-next-line no-useless-return
      return
    }
  }
}

function isSum ({ metricName }: { metricName: string }): boolean {
  return !!metricName.match(/_sum$/)
}

function isCount ({ metricName }: { metricName: string }): boolean {
  return !!metricName.match(/_count$/)
}

function isBucket ({ metricName }: { metricName: string }): boolean {
  return metricName.includes('_bucket{le')
}

function isQuantile ({ metricName }: { metricName: string }): boolean {
  return metricName.includes('{quantile="')
}

function readBucket ({ metricName, metric }: { metricName: string, metric: any }) {
  const { buckets = [] } = metric
  const bucket = metricName.match(/["]*?"/)
  buckets.push(bucket)
  metric.buckets = buckets
}

function readQuantile ({ metricName, metric }: { metricName: string, metric: any }) {
  const { percentiles = [] } = metric
  const quantile = metricName.match(/["]*?"/)
  percentiles.push(quantile)
  metric.percentiles = percentiles
}

function readMetricLine ({ metricLine, metric }: { metricLine: string, metric: any }) {
  const tokenizedMetricLine = metricLine.split(' ')
  const [metricName, value] = tokenizedMetricLine
  switch (metric.type) {
    case 'histogram': {
      if (isBucket({ metricName })) {
        return readBucket({ metricName, metric })
      }
      if (isSum({ metricName })) {
        metric.sum = parseFloat(value)
        break
      }
      if (isCount({ metricName })) {
        metric.count = parseInt(value)
        metric.setData = (metricInstance) => {
          metricInstance.observe(metric.sum)
        }
        metric.ready = true
        break
      }
      break
    }
    case 'summary': {
      if (isQuantile({ metricName })) {
        return readQuantile({ metricName, metric })
      }
      if (isSum({ metricName })) {
        metric.sum = parseFloat(value)
        break
      }
      if (isCount({ metricName })) {
        metric.count = parseInt(value)
        metric.setData = (metricInstance) => {
          metricInstance.observe(metric.sum)
        }
        metric.ready = true
        break
      }
      break
    }
    case 'gauge': {
      metric.value = parseFloat(value)
      metric.setData = (metricInstance) => {
        metricInstance.set(metric.value)
      }
      metric.ready = true
      break
    }
    case 'counter': {
      metric.value = parseInt(value)
      metric.setData = (metricInstance) => {
        metricInstance.inc(metric.value)
      }
      metric.ready = true
      break
    }
    default: {
      console.warn(`Unsupported metric type detected: ${metric.type}`)
    }
  }
}

function readLabels () {}
function readLabelName () {}
function readLabelValue () {}

function readLine ({ line, metric }: { line: string, metric: any }): void {
  /*
   * Find 1st non-blank character
   */
  const arr = line.split('')
  for (let i = 0; i < arr.length; i += 1) {
    const char = arr[i]
    if (char !== ' ' && char !== '\t') {
      if (char === '#') {
        return readCommentLine({ commentLine: line.substring(i), metric })
      } else {
        return readMetricLine({ metricLine: line.substring(i), metric })
      }
    }
  }
}