/* eslint-disable no-useless-escape */
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
        name: 'test_counter_name',
        help: 'test_counter_help',
        type: 'COUNTER',
        metrics: [
          {
            value: '13'
          }
        ]
      },
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
      }
    ]
    expect(result).toStrictEqual(expected)
  })
  it('handles example from prometheus website', async () => {
    const input = `
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

    # HELP http_requests_total The total number of HTTP requests.
    # TYPE http_requests_total counter
    http_requests_total{method="post",code="200"} 1027 1395066363000
    http_requests_total{method="post",code="400"}    3 1395066363000
    `
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
    const result = await textToJSON({ metrics: input })
    expect(result).toStrictEqual(expected)
  })
  it('handles a windows exporter output', async () => {
    const input = `
      # HELP go_gc_duration_seconds A summary of the GC invocation durations.
      # TYPE go_gc_duration_seconds summary
      go_gc_duration_seconds{quantile="0"} 0
      go_gc_duration_seconds{quantile="0.25"} 0
      go_gc_duration_seconds{quantile="0.5"} 0
      go_gc_duration_seconds{quantile="0.75"} 0
      go_gc_duration_seconds{quantile="1"} 0.0010009
      go_gc_duration_seconds_sum 0.0030012
      go_gc_duration_seconds_count 16
      # HELP go_goroutines Number of goroutines that currently exist.
      # TYPE go_goroutines gauge
      go_goroutines 8
      # HELP go_info Information about the Go environment.
      # TYPE go_info gauge
      go_info{version="go1.15.3"} 1
      # HELP go_memstats_alloc_bytes Number of bytes allocated and still in use.
      # TYPE go_memstats_alloc_bytes gauge
      go_memstats_alloc_bytes 2.588176e+06
      # HELP go_memstats_alloc_bytes_total Total number of bytes allocated, even if freed.
      # TYPE go_memstats_alloc_bytes_total counter
      go_memstats_alloc_bytes_total 4.6940464e+07
      # HELP go_memstats_buck_hash_sys_bytes Number of bytes used by the profiling bucket hash table.
      # TYPE go_memstats_buck_hash_sys_bytes gauge
      go_memstats_buck_hash_sys_bytes 1.455427e+06
      # HELP go_memstats_frees_total Total number of frees.
      # TYPE go_memstats_frees_total counter
      go_memstats_frees_total 82812
      # HELP go_memstats_gc_cpu_fraction The fraction of this program's available CPU time used by the GC since the program started.
      # TYPE go_memstats_gc_cpu_fraction gauge
      go_memstats_gc_cpu_fraction 3.6461446330501884e-05
      # HELP go_memstats_gc_sys_bytes Number of bytes used for garbage collection system metadata.
      # TYPE go_memstats_gc_sys_bytes gauge
      go_memstats_gc_sys_bytes 3.424824e+06
      # HELP go_memstats_heap_alloc_bytes Number of heap bytes allocated and still in use.
      # TYPE go_memstats_heap_alloc_bytes gauge
      go_memstats_heap_alloc_bytes 2.588176e+06
      # HELP go_memstats_heap_idle_bytes Number of heap bytes waiting to be used.
      # TYPE go_memstats_heap_idle_bytes gauge
      go_memstats_heap_idle_bytes 7.970816e+06
      # HELP go_memstats_heap_inuse_bytes Number of heap bytes that are in use.
      # TYPE go_memstats_heap_inuse_bytes gauge
      go_memstats_heap_inuse_bytes 4.38272e+06
      # HELP go_memstats_heap_objects Number of allocated objects.
      # TYPE go_memstats_heap_objects gauge
      go_memstats_heap_objects 16322
      # HELP go_memstats_heap_released_bytes Number of heap bytes released to OS.
      # TYPE go_memstats_heap_released_bytes gauge
      go_memstats_heap_released_bytes 7.954432e+06
      # HELP go_memstats_heap_sys_bytes Number of heap bytes obtained from system.
      # TYPE go_memstats_heap_sys_bytes gauge
      go_memstats_heap_sys_bytes 1.2353536e+07
      # HELP go_memstats_last_gc_time_seconds Number of seconds since 1970 of last garbage collection.
      # TYPE go_memstats_last_gc_time_seconds gauge
      go_memstats_last_gc_time_seconds 1.6129005986723568e+09
      # HELP go_memstats_lookups_total Total number of pointer lookups.
      # TYPE go_memstats_lookups_total counter
      go_memstats_lookups_total 0
      # HELP go_memstats_mallocs_total Total number of mallocs.
      # TYPE go_memstats_mallocs_total counter
      go_memstats_mallocs_total 99134
      # HELP go_memstats_mcache_inuse_bytes Number of bytes in use by mcache structures.
      # TYPE go_memstats_mcache_inuse_bytes gauge
      go_memstats_mcache_inuse_bytes 1704
      # HELP go_memstats_mcache_sys_bytes Number of bytes used for mcache structures obtained from system.
      # TYPE go_memstats_mcache_sys_bytes gauge
      go_memstats_mcache_sys_bytes 16384
      # HELP go_memstats_mspan_inuse_bytes Number of bytes in use by mspan structures.
      # TYPE go_memstats_mspan_inuse_bytes gauge
      go_memstats_mspan_inuse_bytes 65008
      # HELP go_memstats_mspan_sys_bytes Number of bytes used for mspan structures obtained from system.
      # TYPE go_memstats_mspan_sys_bytes gauge
      go_memstats_mspan_sys_bytes 81920
      # HELP go_memstats_next_gc_bytes Number of heap bytes when next garbage collection will take place.
      # TYPE go_memstats_next_gc_bytes gauge
      go_memstats_next_gc_bytes 4.999024e+06
      # HELP go_memstats_other_sys_bytes Number of bytes used for other system allocations.
      # TYPE go_memstats_other_sys_bytes gauge
      go_memstats_other_sys_bytes 422613
      # HELP go_memstats_stack_inuse_bytes Number of bytes in use by the stack allocator.
      # TYPE go_memstats_stack_inuse_bytes gauge
      go_memstats_stack_inuse_bytes 229376
      # HELP go_memstats_stack_sys_bytes Number of bytes obtained from system for stack allocator.
      # TYPE go_memstats_stack_sys_bytes gauge
      go_memstats_stack_sys_bytes 229376
      # HELP go_memstats_sys_bytes Number of bytes obtained from system.
      # TYPE go_memstats_sys_bytes gauge
      go_memstats_sys_bytes 1.798408e+07
      # HELP go_threads Number of OS threads created.
      # TYPE go_threads gauge
      go_threads 6
      # HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
      # TYPE process_start_time_seconds counter
      process_start_time_seconds 1.612900104e+09
      # HELP windows_cpu_clock_interrupts_total Total number of received and serviced clock tick interrupts
      # TYPE windows_cpu_clock_interrupts_total counter
      windows_cpu_clock_interrupts_total{core="0,0"} 2.967186e+06
      # HELP windows_cpu_core_frequency_mhz Core frequency in megahertz
      # TYPE windows_cpu_core_frequency_mhz gauge
      windows_cpu_core_frequency_mhz{core="0,0"} 2095
      # HELP windows_cpu_cstate_seconds_total Time spent in low-power idle state
      # TYPE windows_cpu_cstate_seconds_total counter
      windows_cpu_cstate_seconds_total{core="0,0",state="c1"} 154.3664883
      windows_cpu_cstate_seconds_total{core="0,0",state="c2"} 4510.479896899999
      windows_cpu_cstate_seconds_total{core="0,0",state="c3"} 0
      # HELP windows_cpu_dpcs_total Total number of received and serviced deferred procedure calls (DPCs)
      # TYPE windows_cpu_dpcs_total counter
      windows_cpu_dpcs_total{core="0,0"} 858236
      # HELP windows_cpu_idle_break_events_total Total number of time processor was woken from idle
      # TYPE windows_cpu_idle_break_events_total counter
      windows_cpu_idle_break_events_total{core="0,0"} 1.930007e+06
      # HELP windows_cpu_interrupts_total Total number of received and serviced hardware interrupts
      # TYPE windows_cpu_interrupts_total counter
      windows_cpu_interrupts_total{core="0,0"} 4.391475e+06
      # HELP windows_cpu_parking_status Parking Status represents whether a processor is parked or not
      # TYPE windows_cpu_parking_status gauge
      windows_cpu_parking_status{core="0,0"} 0
      # HELP windows_cpu_processor_performance Processor Performance is the average performance of the processor while it is executing instructions, as a percentage of the nominal performance of the processor. On some processors, Processor Performance may exceed 100%
      # TYPE windows_cpu_processor_performance gauge
      windows_cpu_processor_performance{core="0,0"} 1.01746147825e+11
      # HELP windows_cpu_time_total Time that processor spent in different modes (idle, user, system, ...)
      # TYPE windows_cpu_time_total counter
      windows_cpu_time_total{core="0,0",mode="dpc"} 11.734375
      windows_cpu_time_total{core="0,0",mode="idle"} 4833.953125
      windows_cpu_time_total{core="0,0",mode="interrupt"} 7.53125
      windows_cpu_time_total{core="0,0",mode="privileged"} 681.125
      windows_cpu_time_total{core="0,0",mode="user"} 778.546875
      # HELP windows_cs_hostname Labeled system hostname information as provided by ComputerSystem.DNSHostName and ComputerSystem.Domain
      # TYPE windows_cs_hostname gauge
      windows_cs_hostname{domain="WORKGROUP",fqdn="kvn-test-bsp",hostname="kvn-test-bsp"} 1
      # HELP windows_cs_logical_processors ComputerSystem.NumberOfLogicalProcessors
      # TYPE windows_cs_logical_processors gauge
      windows_cs_logical_processors 1
      # HELP windows_cs_physical_memory_bytes ComputerSystem.TotalPhysicalMemory
      # TYPE windows_cs_physical_memory_bytes gauge
      windows_cs_physical_memory_bytes 2.147012608e+09
      # HELP windows_exporter_build_info A metric with a constant '1' value labeled by version, revision, branch, and goversion from which windows_exporter was built.
      # TYPE windows_exporter_build_info gauge
      windows_exporter_build_info{branch="master",goversion="go1.15.3",revision="cdbb27d0b4ea9810dc35035fad281fe6468b7dd1",version="0.15.0"} 1
      # HELP windows_exporter_collector_duration_seconds windows_exporter: Duration of a collection.
      # TYPE windows_exporter_collector_duration_seconds gauge
      windows_exporter_collector_duration_seconds{collector="cpu"} 0
      windows_exporter_collector_duration_seconds{collector="cs"} 0.0329993
      windows_exporter_collector_duration_seconds{collector="net"} 0
      # HELP windows_exporter_collector_success windows_exporter: Whether the collector was successful.
      # TYPE windows_exporter_collector_success gauge
      windows_exporter_collector_success{collector="cpu"} 1
      windows_exporter_collector_success{collector="cs"} 1
      windows_exporter_collector_success{collector="net"} 1
      windows_exporter_collector_success{collector="service"} 1
      # HELP windows_exporter_collector_timeout windows_exporter: Whether the collector timed out.
      # TYPE windows_exporter_collector_timeout gauge
      windows_exporter_collector_timeout{collector="cpu"} 0
      windows_exporter_collector_timeout{collector="cs"} 0
      windows_exporter_collector_timeout{collector="net"} 0
      windows_exporter_collector_timeout{collector="service"} 0
      # HELP windows_exporter_perflib_snapshot_duration_seconds Duration of perflib snapshot capture
      # TYPE windows_exporter_perflib_snapshot_duration_seconds gauge
      windows_exporter_perflib_snapshot_duration_seconds 0.0020111
      # HELP windows_net_bytes_received_total (Network.BytesReceivedPerSec)
      # TYPE windows_net_bytes_received_total counter
      windows_net_bytes_received_total{nic="Microsoft_Hyper_V_Network_Adapter"} 1.05848279e+08
      # HELP windows_net_bytes_sent_total (Network.BytesSentPerSec)
      # TYPE windows_net_bytes_sent_total counter
      windows_net_bytes_sent_total{nic="Microsoft_Hyper_V_Network_Adapter"} 1.41699537e+08
      # HELP windows_net_bytes_total (Network.BytesTotalPerSec)
      # TYPE windows_net_bytes_total counter
      windows_net_bytes_total{nic="Microsoft_Hyper_V_Network_Adapter"} 2.47547816e+08
      # HELP windows_net_current_bandwidth (Network.CurrentBandwidth)
      # TYPE windows_net_current_bandwidth gauge
      windows_net_current_bandwidth{nic="Microsoft_Hyper_V_Network_Adapter"} 5e+10
      # HELP windows_net_packets_outbound_discarded (Network.PacketsOutboundDiscarded)
      # TYPE windows_net_packets_outbound_discarded counter
      windows_net_packets_outbound_discarded{nic="Microsoft_Hyper_V_Network_Adapter"} 0
      # HELP windows_net_packets_outbound_errors (Network.PacketsOutboundErrors)
      # TYPE windows_net_packets_outbound_errors counter
      windows_net_packets_outbound_errors{nic="Microsoft_Hyper_V_Network_Adapter"} 0
      # HELP windows_net_packets_received_discarded (Network.PacketsReceivedDiscarded)
      # TYPE windows_net_packets_received_discarded counter
      windows_net_packets_received_discarded{nic="Microsoft_Hyper_V_Network_Adapter"} 0
      # HELP windows_net_packets_received_errors (Network.PacketsReceivedErrors)
      # TYPE windows_net_packets_received_errors counter
      windows_net_packets_received_errors{nic="Microsoft_Hyper_V_Network_Adapter"} 0
      # HELP windows_net_packets_received_total (Network.PacketsReceivedPerSec)
      # TYPE windows_net_packets_received_total counter
      windows_net_packets_received_total{nic="Microsoft_Hyper_V_Network_Adapter"} 200810
      # HELP windows_net_packets_received_unknown (Network.PacketsReceivedUnknown)
      # TYPE windows_net_packets_received_unknown counter
      windows_net_packets_received_unknown{nic="Microsoft_Hyper_V_Network_Adapter"} 0
      # HELP windows_net_packets_sent_total (Network.PacketsSentPerSec)
      # TYPE windows_net_packets_sent_total counter
      windows_net_packets_sent_total{nic="Microsoft_Hyper_V_Network_Adapter"} 109826
      # HELP windows_net_packets_total (Network.PacketsPerSec)
      # TYPE windows_net_packets_total counter
      windows_net_packets_total{nic="Microsoft_Hyper_V_Network_Adapter"} 310636
    `
    const expected = [
      {
        name: 'go_memstats_heap_sys_bytes',
        help: 'Number of heap bytes obtained from system.',
        type: 'GAUGE',
        metrics: [
          {
            value: '1.2353536e+07'
          }
        ]
      },
      {
        name: 'windows_cs_hostname',
        help: 'Labeled system hostname information as provided by ComputerSystem.DNSHostName and ComputerSystem.Domain',
        type: 'GAUGE',
        metrics: [
          {
            labels: {
              domain: 'WORKGROUP',
              fqdn: 'kvn-test-bsp',
              hostname: 'kvn-test-bsp'
            },
            value: '1'
          }
        ]
      },
      {
        name: 'go_memstats_alloc_bytes_total',
        help: 'Total number of bytes allocated, even if freed.',
        type: 'COUNTER',
        metrics: [
          {
            value: '4.6940464e+07'
          }
        ]
      },
      {
        name: 'go_memstats_mspan_inuse_bytes',
        help: 'Number of bytes in use by mspan structures.',
        type: 'GAUGE',
        metrics: [
          {
            value: '65008'
          }
        ]
      },
      {
        name: 'go_memstats_next_gc_bytes',
        help: 'Number of heap bytes when next garbage collection will take place.',
        type: 'GAUGE',
        metrics: [
          {
            value: '4.999024e+06'
          }
        ]
      },
      {
        name: 'process_start_time_seconds',
        help: 'Start time of the process since unix epoch in seconds.',
        type: 'COUNTER',
        metrics: [
          {
            value: '1.612900104e+09'
          }
        ]
      },
      {
        name: 'windows_cpu_interrupts_total',
        help: 'Total number of received and serviced hardware interrupts',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              core: '0,0'
            },
            value: '4.391475e+06'
          }
        ]
      },
      {
        name: 'windows_net_current_bandwidth',
        help: '(Network.CurrentBandwidth)',
        type: 'GAUGE',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '5e+10'
          }
        ]
      },
      {
        name: 'windows_cpu_idle_break_events_total',
        help: 'Total number of time processor was woken from idle',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              core: '0,0'
            },
            value: '1.930007e+06'
          }
        ]
      },
      {
        name: 'windows_cpu_parking_status',
        help: 'Parking Status represents whether a processor is parked or not',
        type: 'GAUGE',
        metrics: [
          {
            labels: {
              core: '0,0'
            },
            value: '0'
          }
        ]
      },
      {
        name: 'go_memstats_heap_alloc_bytes',
        help: 'Number of heap bytes allocated and still in use.',
        type: 'GAUGE',
        metrics: [
          {
            value: '2.588176e+06'
          }
        ]
      },
      {
        name: 'go_memstats_last_gc_time_seconds',
        help: 'Number of seconds since 1970 of last garbage collection.',
        type: 'GAUGE',
        metrics: [
          {
            value: '1.6129005986723568e+09'
          }
        ]
      },
      {
        name: 'go_memstats_mcache_sys_bytes',
        help: 'Number of bytes used for mcache structures obtained from system.',
        type: 'GAUGE',
        metrics: [
          {
            value: '16384'
          }
        ]
      },
      {
        name: 'go_memstats_mspan_sys_bytes',
        help: 'Number of bytes used for mspan structures obtained from system.',
        type: 'GAUGE',
        metrics: [
          {
            value: '81920'
          }
        ]
      },
      {
        name: 'go_memstats_stack_inuse_bytes',
        help: 'Number of bytes in use by the stack allocator.',
        type: 'GAUGE',
        metrics: [
          {
            value: '229376'
          }
        ]
      },
      {
        name: 'windows_cpu_clock_interrupts_total',
        help: 'Total number of received and serviced clock tick interrupts',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              core: '0,0'
            },
            value: '2.967186e+06'
          }
        ]
      },
      {
        name: 'windows_net_packets_received_unknown',
        help: '(Network.PacketsReceivedUnknown)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '0'
          }
        ]
      },
      {
        name: 'windows_net_packets_total',
        help: '(Network.PacketsPerSec)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '310636'
          }
        ]
      },
      {
        name: 'go_memstats_gc_cpu_fraction',
        help: "The fraction of this program's available CPU time used by the GC since the program started.",
        type: 'GAUGE',
        metrics: [
          {
            value: '3.6461446330501884e-05'
          }
        ]
      },
      {
        name: 'go_memstats_lookups_total',
        help: 'Total number of pointer lookups.',
        type: 'COUNTER',
        metrics: [
          {
            value: '0'
          }
        ]
      },
      {
        name: 'windows_exporter_collector_success',
        help: 'windows_exporter: Whether the collector was successful.',
        type: 'GAUGE',
        metrics: [
          {
            labels: {
              collector: 'cpu'
            },
            value: '1'
          },
          {
            labels: {
              collector: 'cs'
            },
            value: '1'
          },
          {
            labels: {
              collector: 'net'
            },
            value: '1'
          },
          {
            labels: {
              collector: 'service'
            },
            value: '1'
          }
        ]
      },
      {
        name: 'windows_net_bytes_total',
        help: '(Network.BytesTotalPerSec)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '2.47547816e+08'
          }
        ]
      },
      {
        name: 'windows_net_packets_sent_total',
        help: '(Network.PacketsSentPerSec)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '109826'
          }
        ]
      },
      {
        name: 'go_gc_duration_seconds',
        help: 'A summary of the GC invocation durations.',
        type: 'SUMMARY',
        metrics: [
          {
            quantiles: {
              0: '0',
              0.25: '0',
              0.5: '0',
              0.75: '0',
              1: '0.0010009'
            },
            count: '16',
            sum: '0.0030012'
          }
        ]
      },
      {
        name: 'go_memstats_frees_total',
        help: 'Total number of frees.',
        type: 'COUNTER',
        metrics: [
          {
            value: '82812'
          }
        ]
      },
      {
        name: 'go_memstats_sys_bytes',
        help: 'Number of bytes obtained from system.',
        type: 'GAUGE',
        metrics: [
          {
            value: '1.798408e+07'
          }
        ]
      },
      {
        name: 'windows_cpu_time_total',
        help: 'Time that processor spent in different modes (idle, user, system, ...)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              core: '0,0',
              mode: 'dpc'
            },
            value: '11.734375'
          },
          {
            labels: {
              core: '0,0',
              mode: 'idle'
            },
            value: '4833.953125'
          },
          {
            labels: {
              core: '0,0',
              mode: 'interrupt'
            },
            value: '7.53125'
          },
          {
            labels: {
              core: '0,0',
              mode: 'privileged'
            },
            value: '681.125'
          },
          {
            labels: {
              core: '0,0',
              mode: 'user'
            },
            value: '778.546875'
          }
        ]
      },
      {
        name: 'windows_exporter_collector_duration_seconds',
        help: 'windows_exporter: Duration of a collection.',
        type: 'GAUGE',
        metrics: [
          {
            labels: {
              collector: 'cpu'
            },
            value: '0'
          },
          {
            labels: {
              collector: 'cs'
            },
            value: '0.0329993'
          },
          {
            labels: {
              collector: 'net'
            },
            value: '0'
          }
        ]
      },
      {
        name: 'windows_exporter_collector_timeout',
        help: 'windows_exporter: Whether the collector timed out.',
        type: 'GAUGE',
        metrics: [
          {
            labels: {
              collector: 'cpu'
            },
            value: '0'
          },
          {
            labels: {
              collector: 'cs'
            },
            value: '0'
          },
          {
            labels: {
              collector: 'net'
            },
            value: '0'
          },
          {
            labels: {
              collector: 'service'
            },
            value: '0'
          }
        ]
      },
      {
        name: 'windows_net_packets_outbound_discarded',
        help: '(Network.PacketsOutboundDiscarded)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '0'
          }
        ]
      },
      {
        name: 'windows_net_packets_received_errors',
        help: '(Network.PacketsReceivedErrors)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '0'
          }
        ]
      },
      {
        name: 'windows_cpu_dpcs_total',
        help: 'Total number of received and serviced deferred procedure calls (DPCs)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              core: '0,0'
            },
            value: '858236'
          }
        ]
      },
      {
        name: 'windows_cs_logical_processors',
        help: 'ComputerSystem.NumberOfLogicalProcessors',
        type: 'GAUGE',
        metrics: [
          {
            value: '1'
          }
        ]
      },
      {
        name: 'windows_exporter_perflib_snapshot_duration_seconds',
        help: 'Duration of perflib snapshot capture',
        type: 'GAUGE',
        metrics: [
          {
            value: '0.0020111'
          }
        ]
      },
      {
        name: 'windows_cs_physical_memory_bytes',
        help: 'ComputerSystem.TotalPhysicalMemory',
        type: 'GAUGE',
        metrics: [
          {
            value: '2.147012608e+09'
          }
        ]
      },
      {
        name: 'windows_exporter_build_info',
        help: "A metric with a constant '1' value labeled by version, revision, branch, and goversion from which windows_exporter was built.",
        type: 'GAUGE',
        metrics: [
          {
            labels: {
              branch: 'master',
              goversion: 'go1.15.3',
              revision: 'cdbb27d0b4ea9810dc35035fad281fe6468b7dd1',
              version: '0.15.0'
            },
            value: '1'
          }
        ]
      },
      {
        name: 'go_memstats_mallocs_total',
        help: 'Total number of mallocs.',
        type: 'COUNTER',
        metrics: [
          {
            value: '99134'
          }
        ]
      },
      {
        name: 'go_memstats_mcache_inuse_bytes',
        help: 'Number of bytes in use by mcache structures.',
        type: 'GAUGE',
        metrics: [
          {
            value: '1704'
          }
        ]
      },
      {
        name: 'go_threads',
        help: 'Number of OS threads created.',
        type: 'GAUGE',
        metrics: [
          {
            value: '6'
          }
        ]
      },
      {
        name: 'windows_net_packets_received_total',
        help: '(Network.PacketsReceivedPerSec)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '200810'
          }
        ]
      },
      {
        name: 'go_info',
        help: 'Information about the Go environment.',
        type: 'GAUGE',
        metrics: [
          {
            labels: {
              version: 'go1.15.3'
            },
            value: '1'
          }
        ]
      },
      {
        name: 'go_memstats_heap_inuse_bytes',
        help: 'Number of heap bytes that are in use.',
        type: 'GAUGE',
        metrics: [
          {
            value: '4.38272e+06'
          }
        ]
      },
      {
        name: 'windows_cpu_processor_performance',
        help: 'Processor Performance is the average performance of the processor while it is executing instructions, as a percentage of the nominal performance of the processor. On some processors, Processor Performance may exceed 100%',
        type: 'GAUGE',
        metrics: [
          {
            labels: {
              core: '0,0'
            },
            value: '1.01746147825e+11'
          }
        ]
      },
      {
        name: 'windows_net_bytes_sent_total',
        help: '(Network.BytesSentPerSec)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '1.41699537e+08'
          }
        ]
      },
      {
        name: 'go_memstats_alloc_bytes',
        help: 'Number of bytes allocated and still in use.',
        type: 'GAUGE',
        metrics: [
          {
            value: '2.588176e+06'
          }
        ]
      },
      {
        name: 'go_memstats_buck_hash_sys_bytes',
        help: 'Number of bytes used by the profiling bucket hash table.',
        type: 'GAUGE',
        metrics: [
          {
            value: '1.455427e+06'
          }
        ]
      },
      {
        name: 'go_memstats_stack_sys_bytes',
        help: 'Number of bytes obtained from system for stack allocator.',
        type: 'GAUGE',
        metrics: [
          {
            value: '229376'
          }
        ]
      },
      {
        name: 'go_memstats_gc_sys_bytes',
        help: 'Number of bytes used for garbage collection system metadata.',
        type: 'GAUGE',
        metrics: [
          {
            value: '3.424824e+06'
          }
        ]
      },
      {
        name: 'go_memstats_heap_released_bytes',
        help: 'Number of heap bytes released to OS.',
        type: 'GAUGE',
        metrics: [
          {
            value: '7.954432e+06'
          }
        ]
      },
      {
        name: 'windows_cpu_core_frequency_mhz',
        help: 'Core frequency in megahertz',
        type: 'GAUGE',
        metrics: [
          {
            labels: {
              core: '0,0'
            },
            value: '2095'
          }
        ]
      },
      {
        name: 'windows_cpu_cstate_seconds_total',
        help: 'Time spent in low-power idle state',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              core: '0,0',
              state: 'c1'
            },
            value: '154.3664883'
          },
          {
            labels: {
              core: '0,0',
              state: 'c2'
            },
            value: '4510.479896899999'
          },
          {
            labels: {
              core: '0,0',
              state: 'c3'
            },
            value: '0'
          }
        ]
      },
      {
        name: 'windows_net_packets_outbound_errors',
        help: '(Network.PacketsOutboundErrors)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '0'
          }
        ]
      },
      {
        name: 'windows_net_packets_received_discarded',
        help: '(Network.PacketsReceivedDiscarded)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '0'
          }
        ]
      },
      {
        name: 'go_goroutines',
        help: 'Number of goroutines that currently exist.',
        type: 'GAUGE',
        metrics: [
          {
            value: '8'
          }
        ]
      },
      {
        name: 'go_memstats_heap_idle_bytes',
        help: 'Number of heap bytes waiting to be used.',
        type: 'GAUGE',
        metrics: [
          {
            value: '7.970816e+06'
          }
        ]
      },
      {
        name: 'go_memstats_heap_objects',
        help: 'Number of allocated objects.',
        type: 'GAUGE',
        metrics: [
          {
            value: '16322'
          }
        ]
      },
      {
        name: 'go_memstats_other_sys_bytes',
        help: 'Number of bytes used for other system allocations.',
        type: 'GAUGE',
        metrics: [
          {
            value: '422613'
          }
        ]
      },
      {
        name: 'windows_net_bytes_received_total',
        help: '(Network.BytesReceivedPerSec)',
        type: 'COUNTER',
        metrics: [
          {
            labels: {
              nic: 'Microsoft_Hyper_V_Network_Adapter'
            },
            value: '1.05848279e+08'
          }
        ]
      }
    ]
    const result = await textToJSON({ metrics: input })
    expect(result).toStrictEqual(expected)
  })
})
