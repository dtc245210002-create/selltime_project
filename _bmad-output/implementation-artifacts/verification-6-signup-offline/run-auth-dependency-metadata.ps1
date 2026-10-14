param([switch]$OfflineTest,[switch]$ApprovedExecution,[ValidateSet(0,2,3)][int]$MockExitCode=0,
 [switch]$SimulateReportFailure,[switch]$SimulateHashMismatch,[switch]$SimulateNativeStderr)
$ErrorActionPreference='Stop'
if (-not $OfflineTest -and -not $ApprovedExecution) { Write-Host 'HALT: execution approval gate required'; exit 40 }
if ($ApprovedExecution -and ($OfflineTest -or $SimulateReportFailure -or $SimulateHashMismatch -or $SimulateNativeStderr)) { exit 40 }
$evidenceSql=Join-Path $PSScriptRoot 'auth-evidence-dependency-metadata-draft.sql'
$evidenceExpected='0DD81E7152E82797ED27738D19B525542313A9888A6DBFAF7661AB0FF668701B'
$evidenceSha=[Security.Cryptography.SHA256]::Create()
try {$evidenceHash=[BitConverter]::ToString($evidenceSha.ComputeHash([IO.File]::ReadAllBytes($evidenceSql))).Replace('-','')} finally {$evidenceSha.Dispose()}
if ($OfflineTest -and $SimulateHashMismatch) {$evidenceHash='SIMULATED_MISMATCH'}
if ($evidenceHash -ne $evidenceExpected) { Write-Host 'HALT: SQL hash mismatch; native process not launched'; exit 41 }
Import-Module Microsoft.PowerShell.Utility -ErrorAction Stop
Import-Module Microsoft.PowerShell.Management -ErrorAction Stop
$evidenceRun=[DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfff')+'-'+[Guid]::NewGuid().ToString('N')
$evidenceMode=if ($OfflineTest) {'offline'} else {'executed'}
$evidenceFolder=Join-Path $PSScriptRoot ('dependency-'+$evidenceMode+'-'+$evidenceRun)
[IO.Directory]::CreateDirectory($evidenceFolder) | Out-Null
$evidenceLog=Join-Path $evidenceFolder 'catalog.log'
$evidenceExitFile=Join-Path $evidenceFolder 'native.exit.txt'
$evidenceStatus=Join-Path $evidenceFolder 'status.json'
$evidenceExit=$null
$LASTEXITCODE=$null
try {
 $ErrorActionPreference='Continue' # native stderr must not turn into a lost process exit
 if ($OfflineTest) {
  if ($SimulateNativeStderr) { & "$env:SystemRoot/System32/cmd.exe" /d /c "echo simulated-native-error 1>&2 & exit $MockExitCode" }
  else { & "$env:SystemRoot/System32/cmd.exe" /d /c "exit $MockExitCode" }
  $evidenceExit=$LASTEXITCODE
 } else {
  $evidenceRuntime='C:/Users/admin/.codex/visualizations/2026/10/08/01a11a09-fccd-7663-b16b-9f776da40dc8/psql-preflight-6'
  $evidencePassfile=Join-Path $evidenceRuntime 'no-passfile-approved-dependency'
  $ErrorActionPreference='Stop'
  if (Test-Path -LiteralPath $evidencePassfile) {throw 'HALT: designated missing passfile exists'}
  Get-ChildItem Env: | Where-Object {$_.Name -like 'PG*'} | ForEach-Object {Remove-Item -LiteralPath ('Env:'+$_.Name)}
  $env:PGCLIENTENCODING='UTF8'
  $evidenceConnection="host=aws-0-ap-northeast-1.pooler.supabase.com port=5432 user=postgres.dauglhucpflemfdsygzr dbname=postgres sslmode=verify-full sslrootcert='C:/Users/admin/Downloads/prod-ca-2021.crt' sslcertmode=disable gssencmode=disable passfile='$evidencePassfile' connect_timeout=15 application_name=selltime-6-dependency-readonly options='-c default_transaction_read_only=on -c statement_timeout=20000 -c lock_timeout=2000'"
  Write-Host 'Dependency metadata ONLY: separate human approval required: enter TEST password locally. Do not send it in chat.'
  $ErrorActionPreference='Continue'
  & (Join-Path $evidenceRuntime 'bin/psql.exe') -X -W --dbname=$evidenceConnection -v ON_ERROR_STOP=1 -P pager=off -f $evidenceSql -L $evidenceLog
  $evidenceExit=$LASTEXITCODE
 }
} finally {$ErrorActionPreference='Stop'}
if ($null -eq $evidenceExit) { Write-Host 'HALT: no native exit captured'; exit 42 }
# CreateNew: never overwrite an earlier run, even if a path collides.
$evidenceStream=[IO.File]::Open($evidenceExitFile,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write)
try {$evidenceBytes=[Text.Encoding]::UTF8.GetBytes([string]$evidenceExit);$evidenceStream.Write($evidenceBytes,0,$evidenceBytes.Length)} finally {$evidenceStream.Dispose()}
try {
 if ($SimulateReportFailure) {throw 'Offline report failure'}
 $evidenceJson=[pscustomobject]@{ProjectRef='dauglhucpflemfdsygzr';NativeExit=$evidenceExit;OfflineTest=[bool]$OfflineTest;SqlSHA256=$evidenceHash;OutputFolder=$evidenceFolder;LogPath=$evidenceLog;CompletedUtc=[DateTime]::UtcNow.ToString('o')} | ConvertTo-Json
 [IO.File]::WriteAllText($evidenceStatus,$evidenceJson)
} catch {[IO.File]::WriteAllText((Join-Path $evidenceFolder 'report-error.txt'),$_.Exception.GetType().Name)}
Write-Host ('OUTPUT_FOLDER='+$evidenceFolder)
Write-Host ('EXACT_NATIVE_EXIT='+$evidenceExit)
Write-Host 'STOP. No retry, additional SQL, definitions or mutation.'
exit $evidenceExit
