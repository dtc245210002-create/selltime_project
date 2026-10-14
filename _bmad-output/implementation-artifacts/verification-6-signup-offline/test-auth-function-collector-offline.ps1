param([switch]$OfflineTest,[ValidateSet('signup','ownership','role','protection')][string]$FunctionKey='signup',
 [switch]$MockApproval,[switch]$MockQuarantine,[switch]$MockDrift,
 [ValidateSet(0,2,3)][int]$MockNativeExit=0,[switch]$MockReportFailure)
$ErrorActionPreference='Stop'
# This simulator has NO psql, network, password, raw acquisition, ACL or release path.
if (-not $OfflineTest) { Write-Host 'HALT: live collector not implemented/approved'; exit 40 }
if (-not $MockApproval) { Write-Host 'HALT: missing per-function approval'; exit 40 }
if (-not $MockQuarantine) { Write-Host 'HALT: quarantine not verified'; exit 43 }
if ($MockDrift) { Write-Host 'HALT: fingerprint/binding drift'; exit 41 }
$functionHashes=[IO.File]::ReadAllText((Join-Path $PSScriptRoot 'auth-function-draft-hashes.json')) | ConvertFrom-Json
$functionFile='auth-function-'+$FunctionKey+'-private-draft.sql'
$functionExpected=@($functionHashes | Where-Object {$_.File -eq $functionFile})
if($functionExpected.Count -ne 1) {exit 41}
$functionSha=[Security.Cryptography.SHA256]::Create()
try {$functionActual=[BitConverter]::ToString($functionSha.ComputeHash([IO.File]::ReadAllBytes((Join-Path $PSScriptRoot $functionFile)))).Replace('-','')}
finally {$functionSha.Dispose()}
if($functionActual -ne $functionExpected[0].SHA256) {exit 41}
$functionRun=Join-Path $PSScriptRoot ('function-mock-'+[Guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($functionRun) | Out-Null
Write-Host ('MOCK_FOLDER='+$functionRun)
# Native-process mock uses the OS command processor; no database binary invocation.
$LASTEXITCODE=$null
& "$env:SystemRoot/System32/cmd.exe" /d /c "exit $MockNativeExit"
$functionExit=$LASTEXITCODE
if($null -eq $functionExit) {exit 42}
[IO.File]::WriteAllText((Join-Path $functionRun 'native.exit.txt'),[string]$functionExit)
if($functionExit -eq 0) {[IO.File]::WriteAllText((Join-Path $functionRun 'synthetic-only.txt'),'SYNTHETIC MOCK PLACEHOLDER; NO DATABASE DEFINITION')}
try {
 if($MockReportFailure) {throw 'synthetic reporting failure'}
 [IO.File]::WriteAllText((Join-Path $functionRun 'status.json'),([pscustomobject]@{OfflineTest=$true;FunctionKey=$FunctionKey;NativeExit=$functionExit;RawAcquired=$false;Released=$false;ActualQuarantineVerified=$false} | ConvertTo-Json))
} catch {[IO.File]::WriteAllText((Join-Path $functionRun 'report-error.txt'),'Synthetic report failure; native exit preserved')}
Write-Host ('EXACT_MOCK_NATIVE_EXIT='+$functionExit)
Write-Host 'RAW_ACQUIRED=false; RELEASED=false; ACTUAL_QUARANTINE_VERIFIED=false'
exit $functionExit
