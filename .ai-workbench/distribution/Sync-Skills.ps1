[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$WhatIf,
    [string]$SkillName
)

$ErrorActionPreference = 'Stop'
$homePath = [Environment]::GetFolderPath('UserProfile')
$sourceRoot = Join-Path $PSScriptRoot 'skills'
$backupRoot = Join-Path $homePath '.ai-workbench-backups'
$backupStamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$destinations = @(
    (Join-Path $homePath '.copilot\skills'),
    (Join-Path $homePath '.agents\skills'),
    (Join-Path $homePath '.claude\skills')
)

if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) {
    throw "Source skills directory does not exist: $sourceRoot"
}
if (-not [string]::IsNullOrWhiteSpace($SkillName) -and $SkillName -notmatch '^[a-z0-9][a-z0-9._-]{0,63}$') {
    throw "Invalid skill name: $SkillName"
}

$sourceFiles = Get-ChildItem -LiteralPath $sourceRoot -File -Recurse | Where-Object {
    $relativePath = $_.FullName.Substring($sourceRoot.Length).TrimStart('\')
    $segments = $relativePath -split '[\\/]'
    $_.Extension -ne '.pyc' -and
    $segments -notcontains '__pycache__' -and
    $segments -notcontains '.pytest_cache' -and
    ([string]::IsNullOrWhiteSpace($SkillName) -or $segments[0] -eq $SkillName)
}

foreach ($destinationRoot in $destinations) {
    if (-not $WhatIf) {
        New-Item -ItemType Directory -Path $destinationRoot -Force | Out-Null
    }

    foreach ($sourceFile in $sourceFiles) {
        $relativePath = $sourceFile.FullName.Substring($sourceRoot.Length).TrimStart('\')
        $destination = Join-Path $destinationRoot $relativePath

        if (Test-Path -LiteralPath $destination -PathType Container) {
            throw "A directory conflicts with the destination file: $destination"
        }

        if (Test-Path -LiteralPath $destination -PathType Leaf) {
            if (-not $Force) {
                Write-Warning "Conflict; left existing file unchanged: $destination"
                continue
            }

            if ($WhatIf) {
                Write-Output "Would back up: $destination"
            }
            else {
                $backupPath = Join-Path (Join-Path $backupRoot $backupStamp) ($destination.Substring($homePath.Length).TrimStart('\'))
                New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force | Out-Null
                Copy-Item -LiteralPath $destination -Destination $backupPath -Force
                Write-Host "Backed up: $destination -> $backupPath"
            }
        }

        if ($WhatIf) {
            Write-Output "Would sync: $destination"
        }
        else {
            New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
            Copy-Item -LiteralPath $sourceFile.FullName -Destination $destination -Force
            Write-Host "Synced: $destination"
        }
    }
}

Write-Host 'Skill sync complete.'
if ($WhatIf) {
    Write-Output 'Preview only; no user skills were changed.'
}
