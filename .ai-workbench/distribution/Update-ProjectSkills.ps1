[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$ProjectPath,
    [switch]$Force,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$workbench = $PSScriptRoot
$homePath = [Environment]::GetFolderPath('UserProfile')
$projectRoot = [System.IO.Path]::GetFullPath($ProjectPath)
$skillSource = Join-Path $workbench 'skills'

if (-not (Test-Path -LiteralPath $projectRoot -PathType Container) -and -not $WhatIf) {
    throw "Project directory does not exist: $projectRoot"
}
if (-not (Test-Path -LiteralPath $skillSource -PathType Container)) {
    throw "Workbench skills directory does not exist: $skillSource"
}

$projectSkillRoots = @('.github\skills', '.agents\skills', '.claude\skills')
$backupRoot = Join-Path $homePath '.ai-workbench-backups'
$backupStamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$sha256 = [System.Security.Cryptography.SHA256]::Create()
try {
    $projectHash = $sha256.ComputeHash(
        [System.Text.Encoding]::UTF8.GetBytes($projectRoot.ToLowerInvariant())
    )
    $projectId = [BitConverter]::ToString($projectHash).Replace('-', '').Substring(0, 12)
}
finally {
    $sha256.Dispose()
}
$backupProjectRoot = Join-Path (Join-Path (Join-Path $backupRoot 'projects') $backupStamp) $projectId
$addedCount = 0
$preservedCount = 0
$updatedCount = 0

$skillFiles = Get-ChildItem -LiteralPath $skillSource -File -Recurse | Where-Object {
    $relativePath = $_.FullName.Substring($skillSource.Length).TrimStart('\')
    $segments = $relativePath -split '[\\/]'
    $_.Extension -ne '.pyc' -and
    $segments -notcontains '__pycache__' -and
    $segments -notcontains '.pytest_cache'
}

Write-Output "Updating project skills: $projectRoot"
if ($WhatIf -and -not (Test-Path -LiteralPath $projectRoot -PathType Container)) {
    Write-Output "Would create project directory: $projectRoot"
}
if ($Force) {
    Write-Output 'Force mode enabled; conflicting skill files will be backed up before replacement.'
}

foreach ($projectSkillRoot in $projectSkillRoots) {
    foreach ($skillFile in $skillFiles) {
        $relativePath = $skillFile.FullName.Substring($skillSource.Length).TrimStart('\')
        $destination = Join-Path (Join-Path $projectRoot $projectSkillRoot) $relativePath

        if (Test-Path -LiteralPath $destination -PathType Container) {
            throw "A directory conflicts with the project skill destination: $destination"
        }

        if (Test-Path -LiteralPath $destination -PathType Leaf) {
            if (-not $Force) {
                $preservedCount++
                continue
            }

            if (-not $WhatIf) {
                $relativeDestination = $destination.Substring($projectRoot.Length).TrimStart('\')
                $backupPath = Join-Path $backupProjectRoot $relativeDestination
                New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force | Out-Null
                Copy-Item -LiteralPath $destination -Destination $backupPath -Force
                Write-Output "Backed up: $destination -> $backupPath"
            }
            else {
                Write-Output "Would back up: $destination"
            }

            $updatedCount++
        }
        else {
            $addedCount++
        }

        if ($WhatIf) {
            Write-Output "Would install: $destination"
            continue
        }

        New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
        Copy-Item -LiteralPath $skillFile.FullName -Destination $destination -Force
        Write-Output "Installed: $destination"
    }
}

Write-Output "Project skills updated: $addedCount file(s) added, $updatedCount file(s) updated, $preservedCount existing file(s) preserved."
if ($WhatIf) {
    Write-Output 'Preview only; no project files were changed.'
}
else {
    Write-Output "Open this project in VS Code and run 'Chat: Configure Skills' if new skills are not discovered."
}
