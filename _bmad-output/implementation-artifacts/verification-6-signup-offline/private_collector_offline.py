"""Collector chỉ dành cho dữ liệu synthetic; không có đường kết nối database."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import queue
import stat
import subprocess
import sys
import threading
import time
import uuid

BASE = Path(__file__).absolute().parent
MOCK_ROOT = BASE / 'collector-synthetic-runs'
CASES = ('success', 'stderr', 'exit2', 'partial3', 'overflow-out', 'overflow-err', 'timeout',
         'dual-pressure', 'exact-boundary', 'above-boundary')


def synthetic_child(case):
    # Producer cố định, không nhận command/SQL/path/credential từ caller.
    out = b'SYNTHETIC_STDOUT_ONLY\n'
    err = b'SYNTHETIC_STDERR_ONLY\n'
    if case == 'dual-pressure':
        writers = [threading.Thread(target=lambda: sys.stdout.buffer.write(out * 20000)),
                   threading.Thread(target=lambda: sys.stderr.buffer.write(err * 20000))]
        for writer in writers:
            writer.start()
        for writer in writers:
            writer.join()
    elif case in ('exact-boundary', 'above-boundary'):
        sys.stdout.buffer.write(b'O' * 4096)
        sys.stderr.buffer.write(b'E' * (4096 if case == 'exact-boundary' else 4097))
    elif case == 'overflow-out':
        sys.stdout.buffer.write(out * 20000)
    elif case == 'overflow-err':
        sys.stderr.buffer.write(err * 20000)
    else:
        sys.stdout.buffer.write(out)
        if case in ('stderr', 'partial3', 'exit2'):
            sys.stderr.buffer.write(err)
    sys.stdout.buffer.flush()
    sys.stderr.buffer.flush()
    if case == 'timeout':
        time.sleep(10)
    return 2 if case == 'exit2' else 3 if case == 'partial3' else 0


def path_gate(root):
    """Chỉ metadata của đường dẫn mock được chỉ định; không quét thư mục."""
    if Path(root).absolute() != MOCK_ROOT:
        return False
    for path in (MOCK_ROOT, *MOCK_ROOT.parents):
        try:
            info = path.lstat()
        except OSError:
            return False
        if stat.S_ISLNK(info.st_mode) or getattr(info, 'st_file_attributes', 0) & 1024:
            return False
    return True


def collect(case, *, offline=False, approval=False, quarantine=False, expected_hash=None,
            limit=65536, timeout=2.0, report_failure=False, collision=False, root=MOCK_ROOT):
    result = {'offline': True, 'case': case, 'gate': 'BLOCKED', 'native_exit': None,
              'raw_acquired': False, 'released': False, 'actual_quarantine_verified': False}
    if not offline or not approval:
        result['gate'] = 'APPROVAL_MISSING'
        return result
    if case not in CASES or not 1 <= limit <= 65536 or not 0.05 <= timeout <= 5:
        result['gate'] = 'INVALID_SCOPE'
        return result
    if not quarantine or not path_gate(root):
        result['gate'] = 'QUARANTINE_INVALID'
        return result
    try:
        actual_hash = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    except OSError:
        result['gate'] = 'PREPARATION_FAILED'
        return result
    if expected_hash != actual_hash:
        result['gate'] = 'HASH_MISMATCH'
        return result
    folder = MOCK_ROOT / uuid.uuid4().hex
    try:
        folder.mkdir()
        result['run_id'] = folder.name
        if collision:
            with (folder / 'stdout.synthetic.bin').open('xb') as stream:
                stream.write(b'SYNTHETIC_EXISTING_FILE')
    except OSError:
        result['gate'] = 'PREPARATION_FAILED'
        return result
    streams = {}
    try:
        streams['stdout'] = (folder / 'stdout.synthetic.bin').open('xb')
        streams['stderr'] = (folder / 'stderr.synthetic.bin').open('xb')
    except OSError:
        for stream in streams.values():
            try:
                stream.close()
            except OSError:
                pass
        result['gate'] = 'CREATE_NEW_FAILED'
        return result
    events = queue.Queue(maxsize=8)
    cancelled = threading.Event()
    proc = None
    threads = []
    sizes = {'stdout': 0, 'stderr': 0}
    failure = None
    try:
        proc = subprocess.Popen([sys.executable, str(Path(__file__).absolute()),
                                 '--synthetic-child', case],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.DEVNULL)
        def enqueue(event):
            while not cancelled.is_set():
                try:
                    events.put(event, timeout=0.05)
                    return
                except queue.Full:
                    pass
        def pump(name, pipe):
            try:
                while True:
                    chunk = pipe.read1(4096)
                    if not chunk:
                        break
                    enqueue((name, chunk))
                    if cancelled.is_set():
                        break
            except (OSError, ValueError):
                enqueue((name, None))
            finally:
                enqueue((name, b''))
        for name in streams:
            thread = threading.Thread(target=pump, args=(name, getattr(proc, name)), daemon=True)
            thread.start()
            threads.append(thread)
        finished = set()
        start = time.monotonic()
        while len(finished) < 2:
            if time.monotonic() - start > timeout + 2:
                failure = failure or 'STREAM_SHUTDOWN_FAILED'
                if proc.poll() is None:
                    proc.kill()
                break
            if not failure and time.monotonic() - start > timeout:
                failure = 'TIMEOUT'
                if proc.poll() is None:
                    proc.kill()
            try:
                name, chunk = events.get(timeout=0.05)
            except queue.Empty:
                continue
            if chunk == b'':
                finished.add(name)
            elif chunk is None:
                failure = failure or 'STREAM_READ_FAILED'
                if proc.poll() is None:
                    proc.kill()
            elif not failure:
                remaining = limit - sum(sizes.values())
                accepted = chunk[:max(0, remaining)]
                streams[name].write(accepted)
                sizes[name] += len(accepted)
                if len(chunk) > remaining:
                    failure = 'OUTPUT_OVERFLOW'
                    if proc.poll() is None:
                        proc.kill()
        result['native_exit'] = proc.wait()
        result['gate'] = failure or ('PASS' if result['native_exit'] == 0 else 'NATIVE_FAILURE')
    except (OSError, subprocess.SubprocessError):
        result['gate'] = 'COLLECTION_IO_FAILED'
        if proc is not None:
            if proc.poll() is None:
                proc.kill()
            result['native_exit'] = proc.wait()
    finally:
        cancelled.set()
        for stream in streams.values():
            try:
                stream.flush()
            except OSError:
                result['gate'] = 'OUTPUT_FINALIZATION_FAILED'
            finally:
                try:
                    stream.close()
                except OSError:
                    result['gate'] = 'OUTPUT_FINALIZATION_FAILED'
        for thread in threads:
            thread.join(timeout=1)
        if proc is not None:
            for name in ('stdout', 'stderr'):
                try:
                    getattr(proc, name).close()
                except OSError:
                    result['gate'] = 'PIPE_CLOSE_FAILED'
        result['pump_threads_stopped'] = all(not thread.is_alive() for thread in threads)
        if not result['pump_threads_stopped']:
            result['gate'] = 'STREAM_SHUTDOWN_FAILED'
    result['bytes'] = sizes
    # Native exit được lưu trước báo cáo; không in exception hoặc output.
    if result['native_exit'] is not None:
        try:
            with (folder / 'native.exit.txt').open('x') as stream:
                stream.write(str(result['native_exit']))
            result['native_exit_saved'] = True
        except OSError:
            result['native_exit_saved'] = False
            result['gate'] = 'NATIVE_EXIT_SAVE_FAILED'
    try:
        if report_failure:
            raise OSError('synthetic')
        with (folder / 'status.json').open('x', encoding='utf-8') as stream:
            json.dump(result, stream, indent=2)
    except OSError:
        result['report_failed'] = True
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--synthetic-child', choices=CASES)
    args = parser.parse_args()
    # Chỉ CLI producer synthetic; không tồn tại CLI live collection.
    sys.exit(synthetic_child(args.synthetic_child) if args.synthetic_child else 40)
