"""Đánh giá evidence giả; không stat/ACL/connector probe hoặc process live."""
import hashlib
import ntpath
import re
from pathlib import PureWindowsPath

CANDIDATE = r'C:\Users\admin\AppData\Local\SellTimeAuthEvidencePrivate'
PROMPT = 'LOCAL_PASSWORD_PROMPT_REQUIRED'


def canonical_shape(path):
    if not isinstance(path, str):
        return None
    parsed = PureWindowsPath(path)
    if not parsed.is_absolute() or parsed.drive.startswith('\\') or '..' in parsed.parts:
        return None
    if not re.fullmatch(r'[A-Za-z]:', parsed.drive):
        return None
    for component in parsed.parts[1:]:
        if any(ord(char) < 32 or char in '<>:"|?*' for char in component):
            return None
        if component.endswith(('.', ' ')):
            return None
        if re.fullmatch(r'CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9]',component.split('.')[0],re.I):
            return None
    return ntpath.normcase(ntpath.normpath(path))


def quarantine_gate(evidence):
    # Chỉ model dữ liệu đã được xác minh ở checkpoint tương lai; không lấy dữ liệu hệ thống.
    if not isinstance(evidence, dict):
        return 'EVIDENCE_MALFORMED'
    candidate = canonical_shape(evidence.get('candidate'))
    if candidate != canonical_shape(CANDIDATE):
        return 'CANDIDATE_MISMATCH'
    if evidence.get('synthetic_only') is not True:
        return 'LIVE_EVIDENCE_NOT_SUPPORTED'
    if evidence.get('canonical_verified') is not True:
        return 'CANONICAL_UNKNOWN'
    if canonical_shape(evidence.get('canonical')) != candidate:
        return 'CANONICAL_MISMATCH'
    roots = evidence.get('active_canonical_roots')
    if evidence.get('roots_complete_verified') is not True or not isinstance(roots, list) or not roots:
        return 'ROOTS_UNKNOWN'
    for root in roots:
        canonical = canonical_shape(root)
        if canonical is None:
            return 'ROOTS_UNKNOWN'
        try:
            if ntpath.commonpath([candidate, canonical]) in (canonical, candidate):
                return 'WITHIN_CONNECTOR_ROOT'
        except ValueError:
            # Khác drive hợp lệ không có tổ tiên chung.
            pass
    for key, failure in (('ancestors_no_reparse_verified', 'REPARSE_UNKNOWN'),
                         ('acl_allowlist_verified', 'ACL_UNKNOWN'),
                         ('sync_export_exclusion_verified', 'SYNC_UNKNOWN'),
                         ('evidence_fresh_verified', 'STALE_EVIDENCE')):
        if evidence.get(key) is not True:
            return failure
    return 'SYNTHETIC_DESIGN_PASS'


def prompt_gate(*, console_verified, echo_disabled, fallback_detected, public_messages):
    # Chỉ allowlist token prompt mô hình; tuyệt đối không parse stderr raw để đưa lên terminal.
    if console_verified is not True or echo_disabled is not True or fallback_detected is not False:
        return 'PROMPT_ISOLATION_UNKNOWN'
    if public_messages != [PROMPT]:
        return 'PROMPT_CHANNEL_INVALID'
    return 'SYNTHETIC_PROMPT_PASS'


def artifact_gate(sql_bytes, expected_sql_hash, collector_bytes, expected_collector_hash):
    if (not isinstance(sql_bytes, bytes) or not isinstance(collector_bytes, bytes)
        or not isinstance(expected_sql_hash, str) or not isinstance(expected_collector_hash, str)):
        return 'ARTIFACT_MALFORMED'
    if hashlib.sha256(sql_bytes).hexdigest().upper() != expected_sql_hash:
        return 'SQL_HASH_MISMATCH'
    if hashlib.sha256(collector_bytes).hexdigest().upper() != expected_collector_hash:
        return 'COLLECTOR_HASH_MISMATCH'
    try:
        active = [line.strip() for line in sql_bytes.decode('utf-8').splitlines()
                  if line.strip() and not line.lstrip().startswith('--')]
    except UnicodeDecodeError:
        return 'ARTIFACT_MALFORMED'
    assignments = [line.split() for line in active if line.split()[:2] == ['\\set','private_collection_authorized']]
    if assignments != [['\\set','private_collection_authorized','false']]:
        return 'DISABLED_GATE_MISSING'
    return 'SYNTHETIC_ARTIFACT_PASS'
