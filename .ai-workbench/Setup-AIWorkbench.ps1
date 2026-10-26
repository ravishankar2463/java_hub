[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$SkipExtensions,
    [switch]$SkipTools,
    [switch]$SkipMCP,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$bundleRoot = Join-Path $PSScriptRoot 'distribution'
$skillSource = Join-Path $repositoryRoot '.github\skills'
$homePath = [Environment]::GetFolderPath('UserProfile')
$workbenchRoot = Join-Path $homePath 'ai-workbench'
$backupRoot = Join-Path $homePath '.ai-workbench-backups'
$backupStamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'

if (-not (Test-Path -LiteralPath (Join-Path $bundleRoot 'Install-AIWorkbench.ps1') -PathType Leaf)) {
    throw "The bundled AI Workbench is missing: $bundleRoot"
}
if (-not (Test-Path -LiteralPath $skillSource -PathType Container)) {
    throw "The portable skill collection is missing: $skillSource"
}

function Copy-SetupFile {
    param(
        [Parameter(Mandatory)][string]$Source,
        [Parameter(Mandatory)][string]$Destination
    )

    if (Test-Path -LiteralPath $Destination -PathType Container) {
        throw "A directory conflicts with the setup destination: $Destination"
    }

    if (Test-Path -LiteralPath $Destination -PathType Leaf) {
        if (-not $Force) {
            Write-Output "Preserved existing file: $Destination"
            return
        }

        $relativePath = $Destination.Substring($homePath.Length).TrimStart('\')
        $backupPath = Join-Path (Join-Path $backupRoot $backupStamp) $relativePath
        if ($WhatIf) {
            Write-Output "Would back up: $Destination"
        }
        else {
            New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force | Out-Null
            Copy-Item -LiteralPath $Destination -Destination $backupPath -Force
            Write-Output "Backed up: $Destination -> $backupPath"
        }
    }

    if ($WhatIf) {
        Write-Output "Would install: $Destination"
        return
    }

    New-Item -ItemType Directory -Path (Split-Path -Parent $Destination) -Force | Out-Null
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
    Write-Output "Installed: $Destination"
}

Write-Output "Setting up AI Workbench for the current Windows user: $homePath"
if ($Force) {
    Write-Output 'Force mode enabled; conflicting bundled files will be backed up before replacement.'
}

$bundleFiles = Get-ChildItem -LiteralPath $bundleRoot -File -Recurse
foreach ($file in $bundleFiles) {
    $relativePath = $file.FullName.Substring($bundleRoot.Length).TrimStart('\')
    Copy-SetupFile -Source $file.FullName -Destination (Join-Path $workbenchRoot $relativePath)
}

$skillFiles = Get-ChildItem -LiteralPath $skillSource -File -Recurse | Where-Object {
    $relativePath = $_.FullName.Substring($skillSource.Length).TrimStart('\')
    $segments = $relativePath -split '[\\/]'
    $_.Extension -ne '.pyc' -and
    $segments -notcontains '__pycache__' -and
    $segments -notcontains '.pytest_cache'
}
foreach ($file in $skillFiles) {
    $relativePath = $file.FullName.Substring($skillSource.Length).TrimStart('\')
    Copy-SetupFile -Source $file.FullName -Destination (Join-Path (Join-Path $workbenchRoot 'skills') $relativePath)
}

if ($WhatIf) {
    if (-not $SkipExtensions) {
        Write-Output 'Would install user-level VS Code AI extensions through the bundled workbench installer.'
    }
    if (-not $SkipTools) {
        & (Join-Path $bundleRoot 'Install-Tools.ps1') -WhatIf
        if (-not $?) {
            throw 'Tool installation preview failed.'
        }
    }
    if (-not $SkipMCP) {
        & (Join-Path $bundleRoot 'Configure-MCPServers.ps1') -WhatIf
        if (-not $?) {
            throw 'MCP setup preview failed.'
        }
    }
    Write-Output 'Already-available developer tools are skipped; missing tools in the workbench list are installed.'
    Write-Output 'Preview only; no files, PATH entries, extensions, packages, or MCP profiles were changed.'
    exit 0
}

$installer = Join-Path $workbenchRoot 'Install-AIWorkbench.ps1'
if (-not (Test-Path -LiteralPath $installer -PathType Leaf)) {
    throw "The user-level AI Workbench installer was not installed: $installer"
}

& $installer -InstallExtensions:(-not $SkipExtensions) -Force:$Force
if (-not $?) {
    throw 'User-level AI Workbench setup failed.'
}

if (-not $SkipTools) {
    $toolInstaller = Join-Path $workbenchRoot 'Install-Tools.ps1'
    if (-not (Test-Path -LiteralPath $toolInstaller -PathType Leaf)) {
        throw "Developer tool installer is missing: $toolInstaller"
    }
    & $toolInstaller
    if (-not $?) {
        throw 'Developer tool setup failed.'
    }
}

if (-not $SkipMCP) {
    $mcpInstaller = Join-Path $workbenchRoot 'Configure-MCPServers.ps1'
    if (-not (Test-Path -LiteralPath $mcpInstaller -PathType Leaf)) {
        throw "MCP setup script is missing: $mcpInstaller"
    }
    & $mcpInstaller
    if (-not $?) {
        throw 'MCP server setup failed.'
    }
}

Write-Output 'AI Workbench setup complete. Already-available developer tools were skipped.'
Write-Output 'Open a new terminal, then use aiwb init in a project or aiwb updateSkills in an initialized project.'
