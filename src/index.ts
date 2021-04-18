import * as readline from 'readline'
import { Readable } from 'stream'

// const typeToCtorMap = {
//   counter: Counter,
//   histogram: Histogram,
//   gauge: Gauge,
//   summary: Summary
// }
/**
 * Convert default Prometheus text formatted metrics data into JSON
 *
 * @param {Object} options - object defining the required and supported options for this function
 * @param {[string] | string | ReadableStream} metrics - metrics data to be converted to JSON
 * @returns {Object} JSON array of the provided metrics
 */
export async function textToJSON ({ metrics }: { metrics: [string] | string | Readable }) {
  // const registry = new Registry()
  const exportedMetrics = []
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
        readLine({ line, metric })
        if (metric.ready) {
          delete metric.ready
          exportedMetrics.push(metric)
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
  return exportedMetrics
}

function readCommentLine ({ commentLine, metric }: { commentLine: string, metric: any }): void {
  const tokenizedCommentLine = commentLine.split(' ')
  const [, keyword, metricName, ...rest] = tokenizedCommentLine
  switch (keyword) {
    case 'HELP': {
      metric.name = metricName
      metric.help = rest.join(' ')
      return
    }
    case 'TYPE': {
      metric.type = rest.join('').toUpperCase()
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

function readBucket ({ metricName, metric, value }: { metricName: string, metric: any, value: string }) {
  const { metrics = [] } = metric
  const { buckets = {} } = metrics[0] || {}
  const [, bucket] = metricName.match(/"(.*?)"/)
  metrics[0] = {
    buckets: {
      ...buckets,
      [bucket]: value
    }
  }
  Object.assign(metric, { metrics })
}

function readQuantile ({ metricName, metric, value }: { metricName: string, metric: any, value: string }) {
  const { metrics = [] } = metric
  const { quantiles = {} } = metrics[0] || {}
  const [, quantile] = metricName.match(/"(.*?)"/)

  Object.assign(quantiles, { [quantile]: value })
  metrics[0] = { quantiles }
  Object.assign(metric, { metrics })
}

function readMetricLine ({ metricLine, metric }: { metricLine: string, metric: any }) {
  const tokenizedMetricLine = metricLine.split(' ')
  const [metricName, value] = tokenizedMetricLine
  switch (metric.type) {
    case 'HISTOGRAM': {
      if (isBucket({ metricName })) {
        return readBucket({ metricName, metric, value })
      }
      if (isSum({ metricName })) {
        metric.metrics[0].sum = value
        break
      }
      if (isCount({ metricName })) {
        metric.metrics[0].count = value
        metric.ready = true
        break
      }
      break
    }
    case 'SUMMARY': {
      if (isQuantile({ metricName })) {
        return readQuantile({ metricName, metric, value })
      }
      if (isSum({ metricName })) {
        metric.metrics[0].sum = value
        break
      }
      if (isCount({ metricName })) {
        metric.metrics[0].count = value
        metric.ready = true
        break
      }
      break
    }
    case 'GAUGE': {
      metric.metrics = [{ value }]
      metric.ready = true
      break
    }
    case 'COUNTER': {
      metric.metrics = [{ value }]
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