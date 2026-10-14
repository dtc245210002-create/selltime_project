"""Model evidence giả + subprocess synthetic; không mật khẩu hoặc private probe."""
import copy
import hashlib
import json
from pathlib import Path
import unittest

import private_collector_offline as collector
import signup_quarantine_design as design


class DesignTests(unittest.TestCase):
    def evidence(self):
        return dict(synthetic_only=True,candidate=design.CANDIDATE,canonical=design.CANDIDATE,
                    canonical_verified=True,roots_complete_verified=True,
                    active_canonical_roots=[r'C:\Users\admin\OneDrive\Desktop\selltime_project'],
                    ancestors_no_reparse_verified=True,acl_allowlist_verified=True,
                    sync_export_exclusion_verified=True,evidence_fresh_verified=True)

    def test_positive_is_synthetic_never_live(self):
        self.assertEqual(design.quarantine_gate(self.evidence()),'SYNTHETIC_DESIGN_PASS')

    def test_all_unknown_evidence_fails_closed(self):
        for field in ('canonical_verified','roots_complete_verified','ancestors_no_reparse_verified',
                      'acl_allowlist_verified','sync_export_exclusion_verified','evidence_fresh_verified'):
            with self.subTest(field=field):
                evidence=self.evidence(); evidence[field]=None
                self.assertNotEqual(design.quarantine_gate(evidence),'SYNTHETIC_DESIGN_PASS')

    def test_unknown_or_malformed_roots(self):
        for roots in (None,[],['relative'],[None],[r'C:\somewhere\..\Users']):
            evidence=self.evidence(); evidence['active_canonical_roots']=roots
            self.assertEqual(design.quarantine_gate(evidence),'ROOTS_UNKNOWN')

    def test_candidate_inside_read_root(self):
        for root in (r'C:\Users\admin',design.CANDIDATE):
            evidence=self.evidence(); evidence['active_canonical_roots']=[root]
            self.assertEqual(design.quarantine_gate(evidence),'WITHIN_CONNECTOR_ROOT')

    def test_prefix_sibling_is_not_ancestor(self):
        evidence=self.evidence(); evidence['active_canonical_roots']=[design.CANDIDATE+'Sibling']
        self.assertEqual(design.quarantine_gate(evidence),'SYNTHETIC_DESIGN_PASS')

    def test_alias_or_traversal_rejected(self):
        evidence=self.evidence(); evidence['canonical']=r'C:\OneDrive\alias'
        self.assertEqual(design.quarantine_gate(evidence),'CANONICAL_MISMATCH')
        evidence['candidate']=r'C:\Users\admin\..\admin\AppData\Local\SellTimeAuthEvidencePrivate'
        self.assertEqual(design.quarantine_gate(evidence),'CANDIDATE_MISMATCH')

    def test_real_evidence_not_accepted(self):
        evidence=self.evidence(); evidence['synthetic_only']=False
        self.assertEqual(design.quarantine_gate(evidence),'LIVE_EVIDENCE_NOT_SUPPORTED')

    def test_prompt_allowlist_separate_from_private_stderr(self):
        self.assertEqual(design.prompt_gate(console_verified=True,echo_disabled=True,
            fallback_detected=False,public_messages=[design.PROMPT]),'SYNTHETIC_PROMPT_PASS')
        self.assertEqual(design.prompt_gate(console_verified=True,echo_disabled=True,
            fallback_detected=False,public_messages=['SYNTHETIC_PRIVATE_ERROR']), 'PROMPT_CHANNEL_INVALID')

    def test_prompt_console_fallback_or_unknown_fails(self):
        for console,echo,fallback in ((None,True,False),(True,None,False),(True,True,None),(True,True,True)):
            self.assertEqual(design.prompt_gate(console_verified=console,echo_disabled=echo,
                fallback_detected=fallback,public_messages=[design.PROMPT]),'PROMPT_ISOLATION_UNKNOWN')

    def test_artifact_hash_and_hard_disabled(self):
        sql=(collector.BASE/'signup-quarantine-derivative-disabled.sql').read_bytes()
        core=Path(collector.__file__).read_bytes()
        sql_hash='2D9D359EBEBEF0C4A0D8CEFF55001CA0E171348E368D9078E5F2F14C67F9DC0C'
        core_hash='D24F039C94447F063197BC7A70F1DCB1690AE876CA7DE4CF447A7D3E98815697'
        self.assertEqual(design.artifact_gate(sql,sql_hash,core,core_hash),'SYNTHETIC_ARTIFACT_PASS')
        self.assertEqual(design.artifact_gate(sql,'wrong',core,core_hash),'SQL_HASH_MISMATCH')
        self.assertEqual(design.artifact_gate(sql,sql_hash,core,'wrong'),'COLLECTOR_HASH_MISMATCH')
        enabled=sql.replace(b'private_collection_authorized false',b'private_collection_authorized true')
        self.assertEqual(design.artifact_gate(enabled,hashlib.sha256(enabled).hexdigest().upper(),core,core_hash),
                         'DISABLED_GATE_MISSING')

    def test_truthy_synthetic_flag_rejected(self):
        for flag in ('false',1,[],None):
            evidence=self.evidence(); evidence['synthetic_only']=flag
            self.assertEqual(design.quarantine_gate(evidence),'LIVE_EVIDENCE_NOT_SUPPORTED')

    def test_malformed_windows_roots_rejected(self):
        for root in ('C:\\bad\x00name',r'C:\bad?name',r'C:\name.',r'C:\name ',r'C:\NUL',r'C:\COM1.txt'):
            evidence=self.evidence(); evidence['active_canonical_roots']=[root]
            self.assertEqual(design.quarantine_gate(evidence),'ROOTS_UNKNOWN')

    def test_nested_connector_root_rejected(self):
        evidence=self.evidence(); evidence['active_canonical_roots']=[design.CANDIDATE+r'\nested']
        self.assertEqual(design.quarantine_gate(evidence),'WITHIN_CONNECTOR_ROOT')

    def test_commented_disabled_assignment_cannot_pass(self):
        sql=b'-- \\set private_collection_authorized false\n\\set private_collection_authorized true\n'
        core=b'SYNTHETIC_COLLECTOR'
        self.assertEqual(design.artifact_gate(sql,hashlib.sha256(sql).hexdigest().upper(),core,
            hashlib.sha256(core).hexdigest().upper()),'DISABLED_GATE_MISSING')

    def test_malformed_input_containers_fail_closed(self):
        for evidence in (None,[],1,'fake'):
            self.assertEqual(design.quarantine_gate(evidence),'EVIDENCE_MALFORMED')
        self.assertEqual(design.artifact_gate(None,'hash',b'fake','hash'),'ARTIFACT_MALFORMED')
        self.assertEqual(design.artifact_gate(b'fake',None,b'fake','hash'),'ARTIFACT_MALFORMED')

    def test_pinned_expected_hash_detects_changed_bytes(self):
        sql=(collector.BASE/'signup-quarantine-derivative-disabled.sql').read_bytes()+b'-- synthetic drift'
        core=Path(collector.__file__).read_bytes()
        self.assertEqual(design.artifact_gate(sql,
            '2D9D359EBEBEF0C4A0D8CEFF55001CA0E171348E368D9078E5F2F14C67F9DC0C',core,
            'D24F039C94447F063197BC7A70F1DCB1690AE876CA7DE4CF447A7D3E98815697'),'SQL_HASH_MISMATCH')

    def test_fake_process_io_reuses_bounded_collector(self):
        collector.MOCK_ROOT.mkdir(exist_ok=True)
        expected=hashlib.sha256(Path(collector.__file__).read_bytes()).hexdigest()
        for case in ('stderr','exit2','partial3','overflow-out','overflow-err','timeout','dual-pressure'):
            with self.subTest(case=case):
                result=collector.collect(case,offline=True,approval=True,quarantine=True,
                    expected_hash=expected,limit=8192,timeout=0.5)
                self.assertFalse(result['released']); self.assertFalse(result['raw_acquired'])
                self.assertTrue(result['pump_threads_stopped'])
                self.assertLessEqual(sum(result['bytes'].values()),8192)
                folder=collector.MOCK_ROOT/result['run_id']
                self.assertEqual(int((folder/'native.exit.txt').read_text()),result['native_exit'])
                self.assertNotIn('SYNTHETIC_STD',json.dumps(result))


if __name__=='__main__':
    result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(DesignTests))
    (collector.BASE/'signup-quarantine-design-test-results.json').write_text(json.dumps({
        'synthetic_only':True,'tests_run':result.testsRun,'failures':len(result.failures),
        'errors':len(result.errors),'passed':result.wasSuccessful(),
        'real_quarantine_probed':False,'real_psql_run':False,'actual_console_verified':False},indent=2))
    raise SystemExit(0 if result.wasSuccessful() else 1)
