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
    const expected = [
      {
        name: 'test_histogram_name',
        help: 'test_histogram_help',
        type: 'HISTOGRAM',
        metrics: [
          {
            buckets: {
              '+Inf': '1',
              0.005: '0',
              0.01: '0',
              0.025: '0',
              0.05: '0',
              0.1: '0',
              0.25: '0',
              0.5: '0',
              1: '0',
              10: '1',
              2.5: '0',
              5: '0'
            },
            count: '1',
            sum: '10'
          }
        ]
      },
      {
        name: 'test_gauge_name',
        help: 'test_gauge_help',
        type: 'GAUGE',
        metrics: [
          {
            value: '123'
          }
        ]
      },
      {
        name: 'test_summary_name',
        help: 'test_summary_help',
        type: 'SUMMARY',
        metrics: [
          {
            quantiles: {
              0.01: '1234',
              0.05: '1234',
              0.5: '1234',
              0.9: '1234',
              0.95: '1234',
              0.99: '1234',
              0.999: '1234'
            },
            count: '1',
            sum: '1234'
          }
        ]
      },
      {
        name: 'test_counter_name',
        help: 'test_counter_help',
        type: 'COUNTER',
        metrics: [
          {
            value: '13'
          }
        ]
      }
    ]
    expect(result).toStrictEqual(expected)
  })
  it('handles example from prometheus webside', async () => {
    const input = `
    # HELP http_requests_total The total number of HTTP requests.
    # TYPE http_requests_total counter
    http_requests_total{method="post",code="200"} 1027 1395066363000
    http_requests_total{method="post",code="400"}    3 1395066363000
    
    # Escaping in label values:
    msdos_file_access_time_seconds{path="C:\\DIR\\FILE.TXT",error="Cannot find file:\n\"FILE.TXT\""} 1.458255915e9
    
    # Minimalistic line:
    metric_without_timestamp_and_labels 12.47
    
    # A weird metric from before the epoch:
    something_weird{problem="division by zero"} +Inf -3982045
    
    # A histogram, which has a pretty complex representation in the text format:
    # HELP http_request_duration_seconds A histogram of the request duration.
    # TYPE http_request_duration_seconds histogram
    http_request_duration_seconds_bucket{le="0.05"} 24054
    http_request_duration_seconds_bucket{le="0.1"} 33444
    http_request_duration_seconds_bucket{le="0.2"} 100392
    http_request_duration_seconds_bucket{le="0.5"} 129389
    http_request_duration_seconds_bucket{le="1"} 133988
    http_request_duration_seconds_bucket{le="+Inf"} 144320
    http_request_duration_seconds_sum 53423
    http_request_duration_seconds_count 144320
    
    # Finally a summary, which has a complex representation, too:
    # HELP rpc_duration_seconds A summary of the RPC duration in seconds.
    # TYPE rpc_duration_seconds summary
    rpc_duration_seconds{quantile="0.01"} 3102
    rpc_duration_seconds{quantile="0.05"} 3272
    rpc_duration_seconds{quantile="0.5"} 4773
    rpc_duration_seconds{quantile="0.9"} 9001
    rpc_duration_seconds{quantile="0.99"} 76656
    rpc_duration_seconds_sum 1.7560473e+07
    rpc_duration_seconds_count 2693
    `
    const result = await textToJSON({ metrics: input })
    const expected = [
      {
        name: 'msdos_file_access_time_seconds',
        help: '',
        type: 'UNTYPED',
        metrics: [
          {
            labels: {
              error: 'Cannot find file:\n"FILE.TXT"',
              path: 'C:\\DIR\\FILE.TXT'
            },
            value: '1.458255915e+09'
          }
        ]
      },
      {
        name: 'metric_without_timestamp_and_labels',
        help: '',
        type: 'UNTYPED',
        metrics: [
          {
            value: '12.47'
          }
        ]
      },
      {
        name: 'something_weird',
        help: '',
        type: 'UNTYPED',
        metrics: [
          {
            labels: {
              problem: 'division by zero'
            },
            timestamp_ms: '-3982045',
            value: '+Inf'
          }
        ]
      },
      {
        name: 'http_request_duration_seconds',
        help: 'A histogram of the request duration.',
        type: 'HISTOGRAM',
        metrics: [
          {
            buckets: {
              '+Inf': '144320',
              0.05: '24054',
              0.1: '33444',
              0.2: '100392',
              0.5: '129389',
              1: '133988'
            },
            count: '144320',
            sum: '53423'
          }
        ]
      },
      {
        name: 'rpc_duration_seconds',
        help: 'A summary of the RPC duration in seconds.',
        type: 'SUMMARY',
        metrics: [
          {
            quantiles: {
              0.01: '3102',
              0.05: '3272',
              0.5: '4773',
              0.9: '9001',
              0.99: '76656'
            },
            count: '2693',
            sum: '1.7560473e+07'
          }
        ]
      },
      {
        name: 'http_requests_total',
        help: 'The total number of HTTP requests.',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              code: '200',
              method: 'post'
            },
            timestamp_ms: '1395066363000',
            value: '1027'
          },
          {
            labels: {
              code: '400',
              method: 'post'
            },
            timestamp_ms: '1395066363000',
            value: '3'
          }
        ]
      }
    ]
    expect(result).toStrictEqual(expected)
  })
})
