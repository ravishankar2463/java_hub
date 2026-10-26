$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$workbenchRoot = Join-Path $repositoryRoot '.ai-workbench'
$setupScript = Join-Path $workbenchRoot 'Setup-AIWorkbench.ps1'
$batchLauncher = Join-Path $workbenchRoot 'Setup-AIWorkbench.bat'

function Assert-True {
    param(
        [Parameter(Mandatory)][bool]$Condition,
        [Parameter(Mandatory)][string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

Assert-True (Test-Path -LiteralPath $setupScript -PathType Leaf) 'PowerShell setup script is missing.'
Assert-True (Test-Path -LiteralPath $batchLauncher -PathType Leaf) 'CMD setup launcher is missing.'
Assert-True (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot 'Setup-AIWorkbench.ps1'))) 'PowerShell setup script must stay inside the AI Workbench folder.'
Assert-True (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot 'Setup-AIWorkbench.bat'))) 'CMD setup launcher must stay inside the AI Workbench folder.'
Assert-True (Test-Path -LiteralPath (Join-Path $repositoryRoot '.ai-workbench\distribution\bin\aiwb.cmd') -PathType Leaf) 'Portable aiwb launcher is missing from the bundle.'
Assert-True (Test-Path -LiteralPath (Join-Path $repositoryRoot '.ai-workbench\distribution\Add-Skill.ps1') -PathType Leaf) 'Skill importer is missing from the bundle.'
Assert-True (Test-Path -LiteralPath (Join-Path $repositoryRoot '.ai-workbench\distribution\agents\copilot\aiwb-add-skill.agent.md') -PathType Leaf) 'Skill-import custom agent is missing from the bundle.'
Assert-True (Test-Path -LiteralPath (Join-Path $repositoryRoot '.ai-workbench\distribution\Configure-MCPServers.ps1') -PathType Leaf) 'MCP setup script is missing from the bundle.'
Assert-True (Test-Path -LiteralPath (Join-Path $repositoryRoot '.github\skills') -PathType Container) 'Portable skill source is missing from the repository.'

$preview = & $setupScript -WhatIf -Force
$previewText = $preview -join "`n"
Assert-True ($previewText.Contains('Would install:')) 'Setup preview omitted bundled file installation.'
Assert-True ($previewText.Contains('VS Code AI extensions')) 'Setup preview omitted VS Code setup.'
Assert-True ($previewText.Contains('Already-available developer tools are skipped')) 'Setup preview did not describe missing-tool behavior.'
Assert-True ($previewText.Contains('Would install winget package')) 'Setup preview omitted missing developer tools.'
Assert-True ($previewText.Contains('Would ensure Docker MCP profile')) 'Setup preview omitted global MCP setup.'

$skipExtensionsPreview = & $setupScript -WhatIf -Force -SkipExtensions
$skipExtensionsText = $skipExtensionsPreview -join "`n"
Assert-True (-not $skipExtensionsText.Contains('Would install user-level VS Code AI extensions')) 'SkipExtensions did not suppress extension setup.'

$skipToolsPreview = & $setupScript -WhatIf -Force -SkipTools
$skipToolsText = $skipToolsPreview -join "`n"
Assert-True (-not $skipToolsText.Contains('Would install winget package')) 'SkipTools did not suppress tool setup.'

$skipMcpPreview = & $setupScript -WhatIf -Force -SkipMCP
$skipMcpText = $skipMcpPreview -join "`n"
Assert-True (-not $skipMcpText.Contains('Would ensure Docker MCP profile')) 'SkipMCP did not suppress MCP setup.'

Write-Output 'PASS: portable setup bundle, CMD launcher, VS Code setup, missing-tool setup, MCP setup, skip switches, and WhatIf behavior.'
