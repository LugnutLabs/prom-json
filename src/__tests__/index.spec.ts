import { textToJSON } from '../index'

describe('textToJSON', () => {
  it('simple validating test', async () => {
    const input = `
    # HELP test_counter_name test_counter_help
    # TYPE test_counter_name counter
    test_counter_name 13
    
    # HELP test_histogram_name test_histogram_help
    # TYPE test_histogram_name histogram
    test_histogram_name_bucket{le="0.005"} 0
    test_histogram_name_bucket{le="0.01"} 0
    test_histogram_name_bucket{le="0.025"} 0
    test_histogram_name_bucket{le="0.05"} 0
    test_histogram_name_bucket{le="0.1"} 0
    test_histogram_name_bucket{le="0.25"} 0
    test_histogram_name_bucket{le="0.5"} 0
    test_histogram_name_bucket{le="1"} 0
    test_histogram_name_bucket{le="2.5"} 0
    test_histogram_name_bucket{le="5"} 0
    test_histogram_name_bucket{le="10"} 1
    test_histogram_name_bucket{le="+Inf"} 1
    test_histogram_name_sum 10
    test_histogram_name_count 1
    
    # HELP test_gauge_name test_gauge_help
    # TYPE test_gauge_name gauge
    test_gauge_name 123
    
    # HELP test_summary_name test_summary_help
    # TYPE test_summary_name summary
    test_summary_name{quantile="0.01"} 1234
    test_summary_name{quantile="0.05"} 1234
    test_summary_name{quantile="0.5"} 1234
    test_summary_name{quantile="0.9"} 1234
    test_summary_name{quantile="0.95"} 1234
    test_summary_name{quantile="0.99"} 1234
    test_summary_name{quantile="0.999"} 1234
    test_summary_name_sum 1234
    test_summary_name_count 1    
    `
    const result = await textToJSON({ metrics: input })
    const expected = [{
      help: 'test_counter_help',
      name: 'test_counter_name',
      type: 'counter',
      values: [{
        value: 13,
        labels: {}
      }],
      aggregator: 'sum'
    }, {
      name: 'test_histogram_name',
      help: 'test_histogram_help',
      type: 'histogram',
      values: [{
        labels: { le: 0.005 },
        value: 0,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: 0.01 },
        value: 0,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: 0.025 },
        value: 0,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: 0.05 },
        value: 0,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: 0.1 },
        value: 0,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: 0.25 },
        value: 0,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: 0.5 },
        value: 0,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: 1 },
        value: 0,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: 2.5 },
        value: 0,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: 5 },
        value: 0,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: 10 },
        value: 1,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { le: '+Inf' },
        value: 1,
        metricName: 'test_histogram_name_bucket'
      }, {
        labels: { },
        value: 10,
        metricName: 'test_histogram_name_sum'
      }, {
        labels: { },
        value: 1,
        metricName: 'test_histogram_name_count'
      }],
      aggregator: 'sum'
    }, {
      help: 'test_gauge_help',
      name: 'test_gauge_name',
      type: 'gauge',
      values: [{
        value: 123,
        labels: { }
      }],
      aggregator: 'sum'
    }, {
      name: 'test_summary_name',
      help: 'test_summary_help',
      type: 'summary',
      values: [{
        labels: { quantile: 0.01 },
        value: 1234
      }, {
        labels: { quantile: 0.05 },
        value: 1234
      }, {
        labels: { quantile: 0.5 },
        value: 1234
      }, {
        labels: { quantile: 0.9 },
        value: 1234
      }, {
        labels: { quantile: 0.95 },
        value: 1234
      }, {
        labels: { quantile: 0.99 },
        value: 1234
      }, {
        labels: { quantile: 0.999 },
        value: 1234
      }, {
        metricName: 'test_summary_name_sum',
        labels: { },
        value: 1234
      }, {
        metricName: 'test_summary_name_count',
        labels: { },
        value: 1
      }],
      aggregator: 'sum'
    }]
    expect(result).toStrictEqual(expected)
  })
})
