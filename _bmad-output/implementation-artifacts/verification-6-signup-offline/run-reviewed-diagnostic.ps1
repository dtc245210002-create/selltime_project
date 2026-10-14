param([switch]$OfflineTest,[ValidateSet(0,2,3)][int]$MockExitCode=0,[switch]$SimulateReportFailure)
$ErrorActionPreference='Stop'
Import-Module Microsoft.PowerShell.Utility -ErrorAction Stop
Import-Module Microsoft.PowerShell.Management -ErrorAction Stop
$diagnosticSql=Join-Path $PSScriptRoot 'db-diagnostic-catalog.sql'
$diagnosticRuntime='C:/Users/admin/.codex/visualizations/2026/10/08/01a11a09-fccd-7663-b16b-9f776da40dc8/psql-preflight-6'
$diagnosticSuffix=if ($OfflineTest) { 'mock-' + $MockExitCode + '-' + [int]$SimulateReportFailure.IsPresent } else { 'live-' + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfff') }
$diagnosticBase=Join-Path $PSScriptRoot ('diagnostic-' + $diagnosticSuffix)
$diagnosticHasher=[Security.Cryptography.SHA256]::Create()
try {
    $diagnosticHash=[BitConverter]::ToString($diagnosticHasher.ComputeHash([IO.File]::ReadAllBytes($diagnosticSql))).Replace('-','')
} finally { $diagnosticHasher.Dispose() }
$diagnosticExitPath=$diagnosticBase+'.exit.txt'
$diagnosticLog=$diagnosticBase+'.log'
$diagnosticStatus=$diagnosticBase+'.json'
if ($OfflineTest) {
    & "$env:SystemRoot/System32/cmd.exe" /d /c "exit $MockExitCode"
    $diagnosticExit=$LASTEXITCODE
} else {
    Get-ChildItem Env: | Where-Object {$_.Name -like 'PG*'} | ForEach-Object {Remove-Item -LiteralPath ('Env:'+$_.Name)}
    $env:PGCLIENTENCODING='UTF8'
    $diagnosticPassfile=Join-Path $diagnosticRuntime 'no-passfile-approved-diagnostic'
    if (Test-Path -LiteralPath $diagnosticPassfile) {throw 'HALT: designated missing passfile exists'}
    $diagnosticConnection="host=aws-0-ap-northeast-1.pooler.supabase.com port=5432 user=postgres.dauglhucpflemfdsygzr dbname=postgres sslmode=verify-full sslrootcert='C:/Users/admin/Downloads/prod-ca-2021.crt' sslcertmode=disable gssencmode=disable passfile='$diagnosticPassfile' connect_timeout=15 application_name=selltime-6-diagnostic-readonly options='-c default_transaction_read_only=on -c statement_timeout=20000 -c lock_timeout=2000'"
    Write-Host 'TEST project dauglhucpflemfdsygzr: catalog READ ONLY. Enter password locally; hidden characters. Never send it in chat.'
    & (Join-Path $diagnosticRuntime 'bin/psql.exe') -X -W --dbname=$diagnosticConnection -v ON_ERROR_STOP=1 -P pager=off -f $diagnosticSql -L $diagnosticLog
    $diagnosticExit=$LASTEXITCODE
}
# Persist the native exit before optional report/hash formatting. Do not replace it with a reporting error.
[IO.File]::WriteAllText($diagnosticExitPath,[string]$diagnosticExit)
try {
    if ($SimulateReportFailure) {throw 'Simulated offline reporting failure'}
    $diagnosticJson=[pscustomobject]@{ProjectRef='dauglhucpflemfdsygzr';PsqlExitCode=$diagnosticExit;OfflineTest=[bool]$OfflineTest;SqlSHA256=$diagnosticHash;LogPath=$diagnosticLog;CompletedUtc=[DateTime]::UtcNow.ToString('o')} | ConvertTo-Json
    [IO.File]::WriteAllText($diagnosticStatus,$diagnosticJson)
} catch {
    [IO.File]::WriteAllText($diagnosticBase+'.report-error.txt',$_.Exception.GetType().Name)
    Write-Host 'Reporting failed; exact native exit remains in .exit.txt. STOP.'
}
Write-Host ('Exact native exit: '+$diagnosticExit)
Write-Host 'STOP. No migration, fixture or database repair.'
exit $diagnosticExit
