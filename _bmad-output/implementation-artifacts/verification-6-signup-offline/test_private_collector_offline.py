"""Kiểm thử tiến trình/pipe thật, nguồn dữ liệu hoàn toàn synthetic."""
import contextlib
import hashlib
import io
import json
from pathlib import Path
import unittest
from unittest import mock
import time

import private_collector_offline as collector


class CollectorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        collector.MOCK_ROOT.mkdir(exist_ok=True)
        cls.code_hash = hashlib.sha256(Path(collector.__file__).read_bytes()).hexdigest()

    def run_case(self, case='success', **kwargs):
        args = dict(offline=True, approval=True, quarantine=True, expected_hash=self.code_hash)
        args.update(kwargs)
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            result = collector.collect(case, **args)
        self.assertEqual(out.getvalue(), '')
        self.assertEqual(err.getvalue(), '')
        self.assertFalse(result['raw_acquired'])
        self.assertFalse(result['released'])
        self.assertFalse(result['actual_quarantine_verified'])
        if result.get('native_exit_saved'):
            folder = collector.MOCK_ROOT / result['run_id']
            self.assertEqual(int((folder / 'native.exit.txt').read_text()), result['native_exit'])
        return result

    def files(self, result):
        folder = collector.MOCK_ROOT / result['run_id']
        return (folder / 'stdout.synthetic.bin').read_bytes(), (folder / 'stderr.synthetic.bin').read_bytes()

    def test_stdout_stderr_isolated(self):
        result = self.run_case('stderr')
        self.assertEqual(result['gate'], 'PASS')
        self.assertEqual(result['native_exit'], 0)
        out, err = self.files(result)
        self.assertEqual(out, b'SYNTHETIC_STDOUT_ONLY\n')
        self.assertEqual(err, b'SYNTHETIC_STDERR_ONLY\n')
        public = json.dumps(result)
        self.assertNotIn('SYNTHETIC_STD', public)

    def test_native_auth_exit(self):
        result = self.run_case('exit2')
        self.assertEqual(result['native_exit'], 2)
        self.assertEqual(result['gate'], 'NATIVE_FAILURE')

    def test_partial_output_preserved(self):
        result = self.run_case('partial3')
        self.assertEqual(result['native_exit'], 3)
        self.assertEqual(result['gate'], 'NATIVE_FAILURE')
        out, err = self.files(result)
        self.assertTrue(out)
        self.assertTrue(err)

    def test_stdout_overflow_bounded(self):
        result = self.run_case('overflow-out', limit=8192)
        self.assertEqual(result['gate'], 'OUTPUT_OVERFLOW')
        out, err = self.files(result)
        self.assertEqual(len(out) + len(err), 8192)

    def test_stderr_overflow_bounded(self):
        result = self.run_case('overflow-err', limit=8192)
        self.assertEqual(result['gate'], 'OUTPUT_OVERFLOW')
        out, err = self.files(result)
        self.assertEqual(len(out) + len(err), 8192)

    def test_timeout_keeps_partial_output(self):
        result = self.run_case('timeout', timeout=0.5)
        self.assertEqual(result['gate'], 'TIMEOUT')
        self.assertTrue(self.files(result)[0])

    def test_report_failure_preserves_native(self):
        result = self.run_case('partial3', report_failure=True)
        self.assertEqual(result['native_exit'], 3)
        self.assertTrue(result['report_failed'])
        self.assertFalse((collector.MOCK_ROOT / result['run_id'] / 'status.json').exists())

    def test_create_new_never_overwrites(self):
        result = self.run_case(collision=True)
        self.assertEqual(result['gate'], 'CREATE_NEW_FAILED')
        self.assertIsNone(result['native_exit'])
        self.assertEqual((collector.MOCK_ROOT / result['run_id'] / 'stdout.synthetic.bin').read_bytes(),
                         b'SYNTHETIC_EXISTING_FILE')

    def test_missing_approval_no_launch(self):
        result = self.run_case(approval=False)
        self.assertEqual(result['gate'], 'APPROVAL_MISSING')
        self.assertNotIn('run_id', result)

    def test_missing_quarantine_no_launch(self):
        result = self.run_case(quarantine=False)
        self.assertEqual(result['gate'], 'QUARANTINE_INVALID')
        self.assertNotIn('run_id', result)

    def test_hash_mismatch_no_launch(self):
        result = self.run_case(expected_hash='wrong')
        self.assertEqual(result['gate'], 'HASH_MISMATCH')
        self.assertNotIn('run_id', result)

    def test_live_disabled(self):
        result = self.run_case(offline=False)
        self.assertEqual(result['gate'], 'APPROVAL_MISSING')
        self.assertNotIn('run_id', result)

    def test_wrong_root_rejected(self):
        result = self.run_case(root=collector.BASE)
        self.assertEqual(result['gate'], 'QUARANTINE_INVALID')
        self.assertNotIn('run_id', result)

    def test_invalid_limit_rejected(self):
        self.assertEqual(self.run_case(limit=65537)['gate'], 'INVALID_SCOPE')

    def test_dual_pressure_bounded_and_shutdown(self):
        start = time.monotonic()
        result = self.run_case('dual-pressure', limit=8192)
        self.assertEqual(result['gate'], 'OUTPUT_OVERFLOW')
        self.assertTrue(result['pump_threads_stopped'])
        self.assertLess(time.monotonic() - start, 5)
        self.assertEqual(sum(map(len, self.files(result))), 8192)

    def test_exact_combined_boundary(self):
        result = self.run_case('exact-boundary', limit=8192)
        self.assertEqual(result['gate'], 'PASS')
        self.assertEqual(sum(map(len, self.files(result))), 8192)

    def test_above_combined_boundary(self):
        result = self.run_case('above-boundary', limit=8192)
        self.assertEqual(result['gate'], 'OUTPUT_OVERFLOW')
        self.assertEqual(sum(map(len, self.files(result))), 8192)

    def output_fault(self, operation):
        original = Path.open
        class FaultWriter:
            def __init__(self, stream):
                self.stream = stream
            def write(self, value):
                if operation == 'write':
                    raise OSError('synthetic disk fault')
                return self.stream.write(value)
            def flush(self):
                if operation == 'flush':
                    raise OSError('synthetic flush fault')
                return self.stream.flush()
            def close(self):
                self.stream.close()
                if operation == 'close':
                    raise OSError('synthetic close fault')
        def opening(path, *args, **kwargs):
            stream = original(path, *args, **kwargs)
            if path.name == 'stdout.synthetic.bin' and args and args[0] == 'xb':
                return FaultWriter(stream)
            return stream
        with mock.patch.object(Path, 'open', opening):
            return self.run_case('dual-pressure' if operation == 'write' else 'success')

    def test_write_fault_does_not_strand_pumps(self):
        start = time.monotonic()
        result = self.output_fault('write')
        self.assertEqual(result['gate'], 'COLLECTION_IO_FAILED')
        self.assertTrue(result['pump_threads_stopped'])
        self.assertIsNotNone(result['native_exit'])
        self.assertLess(time.monotonic() - start, 5)

    def test_flush_fault_preserves_native(self):
        result = self.output_fault('flush')
        self.assertEqual(result['gate'], 'OUTPUT_FINALIZATION_FAILED')
        self.assertEqual(result['native_exit'], 0)
        self.assertTrue(result['pump_threads_stopped'])

    def test_close_fault_preserves_native(self):
        result = self.output_fault('close')
        self.assertEqual(result['gate'], 'OUTPUT_FINALIZATION_FAILED')
        self.assertEqual(result['native_exit'], 0)
        self.assertTrue(result['pump_threads_stopped'])

    def test_native_file_fault_returns_unsaved_native(self):
        original = Path.open
        def opening(path, *args, **kwargs):
            if path.name == 'native.exit.txt':
                raise OSError('synthetic persistence fault')
            return original(path, *args, **kwargs)
        with mock.patch.object(Path, 'open', opening):
            result = self.run_case('partial3')
        self.assertEqual(result['gate'], 'NATIVE_EXIT_SAVE_FAILED')
        self.assertEqual(result['native_exit'], 3)
        self.assertFalse(result['native_exit_saved'])

    def test_status_open_fault_preserves_native(self):
        original = Path.open
        def opening(path, *args, **kwargs):
            if path.name == 'status.json':
                raise OSError('synthetic report fault')
            return original(path, *args, **kwargs)
        with mock.patch.object(Path, 'open', opening):
            result = self.run_case('partial3')
        self.assertTrue(result['report_failed'])
        self.assertEqual(result['native_exit'], 3)

    def test_source_read_fault_no_launch(self):
        with mock.patch.object(Path, 'read_bytes', side_effect=OSError('synthetic source fault')):
            result = self.run_case()
        self.assertEqual(result['gate'], 'PREPARATION_FAILED')
        self.assertIsNone(result['native_exit'])

    def test_directory_fault_no_launch(self):
        with mock.patch.object(Path, 'mkdir', side_effect=OSError('synthetic directory fault')):
            result = self.run_case()
        self.assertEqual(result['gate'], 'PREPARATION_FAILED')
        self.assertIsNone(result['native_exit'])

    def test_launch_fault_structured(self):
        with mock.patch.object(collector.subprocess, 'Popen', side_effect=OSError('synthetic launch fault')):
            result = self.run_case()
        self.assertEqual(result['gate'], 'COLLECTION_IO_FAILED')
        self.assertIsNone(result['native_exit'])
        self.assertTrue(result['pump_threads_stopped'])

    def test_stream_read_fault_shutdown(self):
        original = collector.subprocess.Popen
        class FaultReader:
            def __init__(self, pipe):
                self.pipe = pipe
            def read1(self, _size):
                raise OSError('synthetic read fault')
            def close(self):
                self.pipe.close()
        def launch(*args, **kwargs):
            proc = original(*args, **kwargs)
            proc.stdout = FaultReader(proc.stdout)
            return proc
        with mock.patch.object(collector.subprocess, 'Popen', launch):
            result = self.run_case()
        self.assertEqual(result['gate'], 'STREAM_READ_FAILED')
        self.assertTrue(result['pump_threads_stopped'])


if __name__ == '__main__':
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(CollectorTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    evidence = {'synthetic_only': True, 'tests_run': result.testsRun,
                'failures': len(result.failures), 'errors': len(result.errors),
                'passed': result.wasSuccessful(), 'live_collector_ready': False,
                'actual_private_quarantine_verified': False}
    with (collector.BASE / 'private-collector-test-results.json').open('w', encoding='utf-8') as stream:
        json.dump(evidence, stream, indent=2)
    raise SystemExit(0 if result.wasSuccessful() else 1)
