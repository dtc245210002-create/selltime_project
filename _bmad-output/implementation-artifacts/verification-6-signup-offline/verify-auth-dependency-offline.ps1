param([switch]$OfflineCheck)
$ErrorActionPreference='Stop'
# No database process, connection, or password prompt is present in this verifier.
if (-not $OfflineCheck) { Write-Host 'HALT: database execution not approved or implemented'; exit 40 }
$dependencySql=Join-Path $PSScriptRoot 'auth-evidence-dependency-metadata-draft.sql'
$dependencyExpected='0DD81E7152E82797ED27738D19B525542313A9888A6DBFAF7661AB0FF668701B'
$dependencySha=[Security.Cryptography.SHA256]::Create()
try { $dependencyHash=[BitConverter]::ToString($dependencySha.ComputeHash([IO.File]::ReadAllBytes($dependencySql))).Replace('-','') }
finally { $dependencySha.Dispose() }
if ($dependencyHash -ne $dependencyExpected) { Write-Host 'HALT: SQL hash mismatch'; exit 41 }
$dependencyText=[IO.File]::ReadAllText($dependencySql)
if (-not $dependencyText.Contains('BEGIN READ ONLY;') -or -not $dependencyText.Contains('COMMIT;')) { exit 42 }
Write-Host ('SQL_SHA256='+$dependencyHash)
Write-Host 'OFFLINE_CHECK=PASS; DATABASE_EXECUTION=NOT_IMPLEMENTED; NO_SQL_EXECUTED'
exit 0
