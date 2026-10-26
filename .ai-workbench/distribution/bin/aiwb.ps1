[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Action = 'help',

    [Parameter(Position = 1)]
    [string]$ProjectPath,

    [Parameter(Position = 2)]
    [string]$SkillRepository,

    [string]$SkillPath,
    [string]$SkillName,
    [switch]$Force,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$workbench = Split-Path -Parent $PSScriptRoot
$homePath = [Environment]::GetFolderPath('UserProfile')

function Show-Help {
    Write-Output @'
AI Workbench command

Usage:
  aiwb init [path] [-Force] [-WhatIf]
  aiwb updateSkills [path] [-Force] [-WhatIf]
  aiwb update [-WhatIf]
  aiwb sync [-Force]
  aiwb tools [-WhatIf]
  aiwb mcp [-WhatIf]
  aiwb add skill <github-repo-url> [-SkillPath <path>] [-SkillName <name>] [-Force] [-WhatIf]
  aiwb help

Commands:
  init     Add the curated skills and project AI instructions to a project root.
           With no path, initializes the current directory.
  updateSkills
           Add newly available skills to an initialized project without changing instructions.
           Existing skill files are preserved unless -Force is specified.
  update   Install missing AIWB tools and refresh managed user-level instructions,
           agents, skills, and selected MCP configurations. Existing workbench files
           are backed up before replacement. Already-available tools are skipped;
           newly added tools are installed.
  sync     Sync the workbench skills to your user-level agent directories.
  tools    Install the curated user-level code navigation and Graphify tools.
  mcp      Configure Git and Docker Toolkit MCP servers for Copilot, Codex, and Claude.
  add      Inspect and add one portable skill from a GitHub repository to the workbench.
  help     Show this help.

Options:
  -Force   Back up and replace conflicting files.
  -WhatIf  Preview project initialization, skill updates, and global updates.
           With 'tools', preview installs without changing the machine.

Examples:
  aiwb init
  aiwb init "D:\dev\my-project"
  aiwb init . -Force
  aiwb init -WhatIf
  aiwb updateSkills
  aiwb updateSkills "D:\dev\my-project"
  aiwb update
  aiwb mcp -WhatIf
  aiwb add skill https://github.com/owner/repo -SkillPath skills/example
  aiwb tools -WhatIf
'@
}

if ($Action -in @('help', '--help', '-h', '/?')) {
    Show-Help
    exit 0
}

if ($Action -eq 'sync') {
    $syncScript = Join-Path $workbench 'Sync-Skills.ps1'
    & $syncScript -Force:$Force
    if (-not $?) {
        exit 1
    }

    exit 0
}

if ($Action -eq 'tools') {
    $toolScript = Join-Path $workbench 'Install-Tools.ps1'
    if (-not (Test-Path -LiteralPath $toolScript -PathType Leaf)) {
        throw "Tool installer is missing: $toolScript"
    }

    & $toolScript -WhatIf:$WhatIf
    if (-not $?) {
        exit 1
    }

    exit 0
}

if ($Action -eq 'mcp') {
    $mcpScript = Join-Path $workbench 'Configure-MCPServers.ps1'
    if (-not (Test-Path -LiteralPath $mcpScript -PathType Leaf)) {
        throw "MCP setup script is missing: $mcpScript"
    }

    & $mcpScript -WhatIf:$WhatIf
    if (-not $?) {
        exit 1
    }

    exit 0
}

if ($Action -in @('add', 'add-skill')) {
    if ($Action -eq 'add' -and $ProjectPath -ne 'skill') {
        throw "Use 'aiwb add skill <github-repo-url>'."
    }

    if ($Action -eq 'add-skill' -and [string]::IsNullOrWhiteSpace($SkillRepository)) {
        $SkillRepository = $ProjectPath
    }
    if ([string]::IsNullOrWhiteSpace($SkillRepository)) {
        throw 'Provide a GitHub repository URL, for example: aiwb add skill https://github.com/owner/repo'
    }

    $skillInstaller = Join-Path $workbench 'Add-Skill.ps1'
    if (-not (Test-Path -LiteralPath $skillInstaller -PathType Leaf)) {
        throw "Skill importer is missing: $skillInstaller"
    }

    & $skillInstaller -Repository $SkillRepository -SkillPath $SkillPath -SkillName $SkillName -Force:$Force -WhatIf:$WhatIf
    if (-not $?) {
        exit 1
    }

    exit 0
}

if ($Action -eq 'update') {
    $installer = Join-Path $workbench 'Install-AIWorkbench.ps1'
    if (-not (Test-Path -LiteralPath $installer -PathType Leaf)) {
        throw "Workbench installer is missing: $installer"
    }

    $toolScript = Join-Path $workbench 'Install-Tools.ps1'
    if (-not (Test-Path -LiteralPath $toolScript -PathType Leaf)) {
        throw "Tool installer is missing: $toolScript"
    }

    & $toolScript -WhatIf:$WhatIf
    if (-not $?) {
        exit 1
    }

    & $installer -Force:$true -WhatIf:$WhatIf
    if (-not $?) {
        exit 1
    }

    $mcpScript = Join-Path $workbench 'Configure-MCPServers.ps1'
    if (-not (Test-Path -LiteralPath $mcpScript -PathType Leaf)) {
        throw "MCP setup script is missing: $mcpScript"
    }

    & $mcpScript -WhatIf:$WhatIf
    if (-not $?) {
        exit 1
    }

    exit 0
}

if ($Action -in @('updateSkills', 'update-skills')) {
    if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
        $ProjectPath = (Get-Location).ProviderPath
    }

    $skillUpdater = Join-Path $workbench 'Update-ProjectSkills.ps1'
    if (-not (Test-Path -LiteralPath $skillUpdater -PathType Leaf)) {
        throw "Project skill updater is missing: $skillUpdater"
    }

    & $skillUpdater -ProjectPath $ProjectPath -Force:$Force -WhatIf:$WhatIf
    if (-not $?) {
        exit 1
    }

    exit 0
}

if ($Action -notin @('init', 'setup', 'project')) {
    Write-Error "Unknown command '$Action'. Run 'aiwb help' for usage."
    exit 2
}

if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
    $ProjectPath = (Get-Location).ProviderPath
}

$projectRoot = [System.IO.Path]::GetFullPath($ProjectPath)
if (Test-Path -LiteralPath $projectRoot -PathType Leaf) {
    throw "The project path must be a directory: $projectRoot"
}

if (-not (Test-Path -LiteralPath $projectRoot -PathType Container)) {
    if ($WhatIf) {
        Write-Output "Would create project directory: $projectRoot"
    }
    else {
        New-Item -ItemType Directory -Path $projectRoot -Force | Out-Null
    }
}

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
$copiedCount = 0
$preservedCount = 0

function Copy-ProjectFile {
    param(
        [Parameter(Mandatory)][string]$Source,
        [Parameter(Mandatory)][string]$Destination
    )

    if (Test-Path -LiteralPath $Destination -PathType Container) {
        throw "A directory conflicts with the project file destination: $Destination"
    }

    if (Test-Path -LiteralPath $Destination -PathType Leaf) {
        if (-not $Force) {
            Write-Warning "Conflict; left existing project file unchanged: $Destination"
            $script:preservedCount++
            return
        }

        if ($WhatIf) {
            Write-Output "Would back up: $Destination"
        }
        else {
            $relativePath = $Destination.Substring($projectRoot.Length).TrimStart('\')
            $backupPath = Join-Path $backupProjectRoot $relativePath
            New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force | Out-Null
            Copy-Item -LiteralPath $Destination -Destination $backupPath -Force
            Write-Output "Backed up: $Destination -> $backupPath"
        }
    }

    if ($WhatIf) {
        Write-Output "Would install: $Destination"
        $script:copiedCount++
        return
    }

    New-Item -ItemType Directory -Path (Split-Path -Parent $Destination) -Force | Out-Null
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
    Write-Output "Installed: $Destination"
    $script:copiedCount++
}

Write-Output "AI Workbench project setup: $projectRoot"
if ($Force) {
    Write-Output 'Force mode enabled; conflicting files will be backed up before replacement.'
}

$projectTemplates = Join-Path $workbench 'templates\project'
$templateFiles = [ordered]@{
    'AGENTS.md' = 'AGENTS.md'
    'CLAUDE.md' = 'CLAUDE.md'
    '.github\copilot-instructions.md' = 'copilot-instructions.md'
    '.ai-workbench\README.md' = 'README.md'
}

foreach ($relativePath in $templateFiles.Keys) {
    $source = Join-Path $projectTemplates $templateFiles[$relativePath]
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw "Project setup template is missing: $source"
    }

    Copy-ProjectFile -Source $source -Destination (Join-Path $projectRoot $relativePath)
}

$skillUpdater = Join-Path $workbench 'Update-ProjectSkills.ps1'
if (-not (Test-Path -LiteralPath $skillUpdater -PathType Leaf)) {
    throw "Project skill updater is missing: $skillUpdater"
}
& $skillUpdater -ProjectPath $projectRoot -Force:$Force -WhatIf:$WhatIf
if (-not $?) {
    exit 1
}

Write-Output "Project instructions finished: $copiedCount file(s) installed or previewed; $preservedCount existing file(s) preserved."
if (-not $WhatIf) {
    Write-Output "Open this project in VS Code and run 'Chat: Configure Skills' if the skills are not discovered."
    Write-Output 'Project instructions and skills are ready for Copilot, Codex, Claude, and other Agent Skills-compatible tools.'
}
