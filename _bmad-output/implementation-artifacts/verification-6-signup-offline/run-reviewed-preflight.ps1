$ErrorActionPreference = 'Stop'
$preflightRuntime = 'C:/Users/admin/.codex/visualizations/2026/10/08/01a11a09-fccd-7663-b16b-9f776da40dc8/psql-preflight-6'
$preflightSql = Join-Path $PSScriptRoot 'db-preflight-readonly.sql'
$preflightLog = Join-Path $PSScriptRoot 'db-preflight-20261013.log'
$preflightStatus = Join-Path $PSScriptRoot 'db-preflight-20261013-status.json'
# Clear inherited libpq overrides only in this terminal process. No credential values are inspected.
Get-ChildItem Env: | Where-Object { $_.Name -like 'PG*' } | ForEach-Object { Remove-Item -LiteralPath ('Env:' + $_.Name) }
$env:PGAPPNAME = 'selltime-6-catalog-readonly'
$env:PGCLIENTENCODING = 'UTF8'
$preflightConnection = "host=aws-0-ap-northeast-1.pooler.supabase.com port=5432 user=postgres.dauglhucpflemfdsygzr dbname=postgres sslmode=verify-full sslrootcert='C:/Users/admin/Downloads/prod-ca-2021.crt' sslcertmode=disable gssencmode=disable passfile='$preflightRuntime/no-passfile-approved-007' connect_timeout=15 options='-c default_transaction_read_only=on -c statement_timeout=20000 -c lock_timeout=2000'"
Write-Host 'SellTime catalog READ ONLY preflight: test project dauglhucpflemfdsygzr'
Write-Host 'Enter the TEST database password directly at the psql prompt. Characters are hidden. Do not send it in chat.'
try {
    & (Join-Path $preflightRuntime 'bin/psql.exe') -X -W --dbname=$preflightConnection -v ON_ERROR_STOP=1 -P pager=off -f $preflightSql -L $preflightLog
    $preflightExitCode = $LASTEXITCODE
    [pscustomobject]@{ProjectRef='dauglhucpflemfdsygzr';ExitCode=$preflightExitCode;SqlPath=$preflightSql;SqlSHA256=(Get-FileHash -LiteralPath $preflightSql -Algorithm SHA256).Hash;LogPath=$preflightLog;CompletedUtc=[DateTime]::UtcNow.ToString('o');Scope='CATALOG READ ONLY'} | ConvertTo-Json | Set-Content -LiteralPath $preflightStatus -Encoding UTF8
    Write-Host ('Preflight exit code: ' + $preflightExitCode)
    Write-Host 'STOP. No migration, fixture or database repair is authorized.'
} catch {
    [pscustomobject]@{ProjectRef='dauglhucpflemfdsygzr';ExitCode=1;ErrorType=$_.Exception.GetType().Name;CompletedUtc=[DateTime]::UtcNow.ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath $preflightStatus -Encoding UTF8
    Write-Host 'Preflight stopped due to execution error. No automatic retry.'
}
