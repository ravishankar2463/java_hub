$ErrorActionPreference = 'Stop'
$workbench = Split-Path -Parent $PSScriptRoot
$command = Join-Path $workbench 'bin\aiwb.ps1'
$launcher = Join-Path $workbench 'bin\aiwb.cmd'
$expectedSkillCount = 23
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("aiwb-test-" + [guid]::NewGuid().ToString('N'))

function Assert-True {
    param(
        [Parameter(Mandatory)][bool]$Condition,
        [Parameter(Mandatory)][string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

try {
    $newProject = Join-Path $tempRoot 'new project'
    $existingProject = Join-Path $tempRoot 'existing project'
    $previewProject = Join-Path $tempRoot 'preview project'
    $skillsOnlyProject = Join-Path $tempRoot 'skills only project'
    New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
    New-Item -ItemType Directory -Path $existingProject -Force | Out-Null

    $existingInstructions = Join-Path $existingProject 'AGENTS.md'
    Set-Content -LiteralPath $existingInstructions -Value 'pre-existing project instructions' -Encoding UTF8
    $previewStart = Get-Date
    $existingPreview = & $command init -ProjectPath $existingProject -WhatIf -Force
    Assert-True ((Get-Content -LiteralPath $existingInstructions -Raw).Trim() -eq 'pre-existing project instructions') 'WhatIf with Force overwrote existing project instructions.'
    Assert-True (-not (Get-ChildItem -LiteralPath (Join-Path ([Environment]::GetFolderPath('UserProfile')) '.ai-workbench-backups\projects') -Directory -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -ge $previewStart })) 'WhatIf with Force created a project backup.'
    Assert-True (($existingPreview -join "`n").Contains('Would back up:')) 'WhatIf with Force did not preview backups.'

    $preview = & $command init -ProjectPath $previewProject -WhatIf
    Assert-True (-not (Test-Path $previewProject)) 'WhatIf created the project directory.'
    Assert-True (($preview -join "`n").Contains('Would install:')) 'WhatIf did not preview project files.'

    $toolPreview = & $command tools -WhatIf
    Assert-True (($toolPreview -join "`n").Contains('BurntSushi.ripgrep.MSVC')) 'Tool preview omitted ripgrep.'
    Assert-True (($toolPreview -join "`n").Contains('graphifyy==')) 'Tool preview omitted Graphify.'

    $mcpPreview = & $command mcp -WhatIf
    $mcpPreviewText = $mcpPreview -join "`n"
    Assert-True ($mcpPreviewText.Contains('Would ensure Docker MCP profile')) 'MCP setup preview omitted the shared Docker gateway.'
    Assert-True ($mcpPreviewText.Contains('mcp-server-git==')) 'MCP setup preview omitted the pinned Git server.'

    $globalUpdatePreview = & $command update -WhatIf
    Assert-True (($globalUpdatePreview -join "`n").Contains('Would install:')) 'Global update did not preview refreshed user files.'
    Assert-True (($globalUpdatePreview -join "`n").Contains('Would install winget package:')) 'Global update did not preview missing developer tools.'
    Assert-True (($globalUpdatePreview -join "`n").Contains('graphifyy==')) 'Global update preview omitted Graphify.'
    Assert-True (($globalUpdatePreview -join "`n").Contains('Would ensure Docker MCP profile')) 'Global update preview omitted MCP configuration.'

    New-Item -ItemType Directory -Path $skillsOnlyProject -Force | Out-Null
    $existingSkill = Join-Path $skillsOnlyProject '.agents\skills\karpathy-guidelines\SKILL.md'
    New-Item -ItemType Directory -Path (Split-Path $existingSkill -Parent) -Force | Out-Null
    Set-Content -LiteralPath $existingSkill -Value 'locally customized skill' -Encoding UTF8
    $skillsOnlyOutput = & $launcher updateSkills $skillsOnlyProject
    Assert-True ((Get-Content -LiteralPath $existingSkill -Raw).Contains('locally customized skill')) 'updateSkills overwrote a project-customized skill.'
    Assert-True (Test-Path (Join-Path $skillsOnlyProject '.github\skills\domain-modeling\SKILL.md')) 'updateSkills did not add a missing skill.'
    Assert-True (-not (Test-Path (Join-Path $skillsOnlyProject 'AGENTS.md'))) 'updateSkills unexpectedly changed project instructions.'
    Assert-True (($skillsOnlyOutput -join "`n").Contains('file(s) added')) 'updateSkills did not report newly installed skill files.'
    $helpOutput = & $command help
    Assert-True (($helpOutput -join "`n").Contains('aiwb updateSkills')) 'Help omitted the project skill update command.'
    Assert-True (($helpOutput -join "`n").Contains('aiwb update')) 'Help omitted the global update command.'
    Assert-True (($helpOutput -join "`n").Contains('aiwb mcp')) 'Help omitted global MCP setup.'

    $upstreamRepository = Join-Path $tempRoot 'upstream skill repo'
    $testSkillName = 'aiwb-test-' + [guid]::NewGuid().ToString('N')
    $upstreamSkill = Join-Path $upstreamRepository 'skills\sample'
    New-Item -ItemType Directory -Path $upstreamSkill -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $upstreamSkill 'SKILL.md') -Value @"
---
name: sample
description: Temporary skill used by the AI Workbench test suite.
---

# Sample test skill
"@ -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $upstreamRepository 'LICENSE') -Value 'Temporary test license.' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $upstreamSkill 'install.ps1') -Value "Set-Content -LiteralPath '$tempRoot\unexpected-execution' -Value 'executed'" -Encoding UTF8
    $secondUpstreamSkill = Join-Path $upstreamRepository 'skills\other'
    New-Item -ItemType Directory -Path $secondUpstreamSkill -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $secondUpstreamSkill 'SKILL.md') -Value "---`nname: other`n---`n" -Encoding UTF8
    & git -C $upstreamRepository init --quiet
    & git -C $upstreamRepository config core.autocrlf false
    & git -C $upstreamRepository config user.name 'AIWB Test'
    & git -C $upstreamRepository config user.email 'aiwb-test@example.invalid'
    & git -C $upstreamRepository add .
    & git -C $upstreamRepository commit --quiet -m 'Add test skill'
    if ($LASTEXITCODE -ne 0) {
        throw "Could not prepare the local skill repository fixture: $LASTEXITCODE"
    }

    $ambiguousImportFailed = $false
    try {
        $ambiguousOutput = & $command add skill $upstreamRepository -WhatIf
    }
    catch {
        $ambiguousImportFailed = $_.Exception.Message.Contains('skill path is required')
    }
    Assert-True $ambiguousImportFailed 'add skill did not require a selected path when the repository contains multiple skills.'

    $canonicalSkill = Join-Path ([Environment]::GetFolderPath('UserProfile')) "ai-workbench\skills\$testSkillName"
    $globalSkillRoots = @('.copilot\skills', '.agents\skills', '.claude\skills')
    foreach ($globalSkillRoot in $globalSkillRoots) {
        Assert-True (-not (Test-Path (Join-Path ([Environment]::GetFolderPath('UserProfile')) "$globalSkillRoot\$testSkillName"))) 'Random test skill name unexpectedly exists in a global skills directory.'
    }

    try {
        $addOutput = & $command add skill $upstreamRepository -SkillPath 'skills\sample' -SkillName $testSkillName
        Assert-True (Test-Path (Join-Path $canonicalSkill 'SKILL.md')) 'add skill did not save the selected skill to the canonical workbench.'
        Assert-True (Test-Path (Join-Path $canonicalSkill 'UPSTREAM-LICENSE.txt')) 'add skill did not preserve the upstream license.'
        Assert-True (-not (Test-Path (Join-Path $tempRoot 'unexpected-execution'))) 'add skill executed an upstream script.'
        foreach ($globalSkillRoot in $globalSkillRoots) {
            Assert-True (Test-Path (Join-Path ([Environment]::GetFolderPath('UserProfile')) "$globalSkillRoot\$testSkillName\SKILL.md")) "add skill did not sync to $globalSkillRoot."
        }
        Assert-True (($addOutput -join "`n").Contains('Skill added to the canonical workbench')) 'add skill did not report completion.'
    }
    finally {
        foreach ($globalSkillRoot in $globalSkillRoots) {
            $globalSkillPath = Join-Path ([Environment]::GetFolderPath('UserProfile')) "$globalSkillRoot\$testSkillName"
            if (Test-Path -LiteralPath $globalSkillPath -PathType Container) {
                Remove-Item -LiteralPath $globalSkillPath -Recurse -Force
            }
        }
        if (Test-Path -LiteralPath $canonicalSkill -PathType Container) {
            Remove-Item -LiteralPath $canonicalSkill -Recurse -Force
        }
    }

    $remoteSkillPreview = & $command add skill 'https://github.com/example/skills' -WhatIf
    Assert-True (($remoteSkillPreview -join "`n").Contains('No remote files are downloaded')) 'Remote skill WhatIf unexpectedly attempted a download.'

    & $launcher init $newProject | Out-Null
    Assert-True (Test-Path (Join-Path $newProject 'AGENTS.md')) 'New project did not receive AGENTS.md.'
    Assert-True (Test-Path (Join-Path $newProject 'CLAUDE.md')) 'New project did not receive CLAUDE.md.'
    Assert-True (Test-Path (Join-Path $newProject '.github\copilot-instructions.md')) 'New project did not receive Copilot instructions.'

    foreach ($skillsRoot in @('.github\skills', '.agents\skills', '.claude\skills')) {
        $skillPath = Join-Path $newProject "$skillsRoot\ui-ux-pro-max\SKILL.md"
        Assert-True (Test-Path $skillPath) "New project is missing the UI skill under $skillsRoot."
        Assert-True (Test-Path (Join-Path (Split-Path $skillPath -Parent) 'scripts\search.py')) "UI skill support files were not copied under $skillsRoot."
    }

    foreach ($skillsRoot in @('.github\skills', '.agents\skills', '.claude\skills')) {
        $skillCount = (Get-ChildItem (Join-Path $newProject $skillsRoot) -Directory).Count
        Assert-True ($skillCount -eq $expectedSkillCount) "Expected $expectedSkillCount project skills in $skillsRoot, found $skillCount."
    }

    $copilotSkill = Join-Path $env:USERPROFILE '.copilot\skills\graphify-codebase\SKILL.md'
    Assert-True (Test-Path $copilotSkill) 'Copilot user skill was not synced to its native personal skills location.'

    Push-Location $existingProject
    try {
        & $launcher init | Out-Null
    }
    finally {
        Pop-Location
    }

    Assert-True ((Get-Content -LiteralPath $existingInstructions -Raw).Trim() -eq 'pre-existing project instructions') 'Existing AGENTS.md was overwritten without -Force.'
    Assert-True (Test-Path (Join-Path $existingProject '.github\copilot-instructions.md')) 'Existing project did not receive non-conflicting AI setup.'

    $customSkill = Join-Path $existingProject '.agents\skills\karpathy-guidelines\SKILL.md'
    Set-Content -LiteralPath $customSkill -Value 'custom skill content' -Encoding UTF8
    $backupRoot = Join-Path ([Environment]::GetFolderPath('UserProfile')) '.ai-workbench-backups\projects'
    $previousBackups = @()
    if (Test-Path -LiteralPath $backupRoot) {
        $previousBackups = @(Get-ChildItem -LiteralPath $backupRoot -Directory | ForEach-Object { $_.Name })
    }

    & $command init -ProjectPath $existingProject -Force | Out-Null
    Assert-True ((Get-Content -LiteralPath $customSkill -Raw).Contains('Karpathy Guidelines')) 'Force did not update the selected project skill.'

    $projectHashAlgorithm = [System.Security.Cryptography.SHA256]::Create()
    try {
        $projectHashBytes = $projectHashAlgorithm.ComputeHash(
            [System.Text.Encoding]::UTF8.GetBytes($existingProject.ToLowerInvariant())
        )
        $projectId = [BitConverter]::ToString($projectHashBytes).Replace('-', '').Substring(0, 12)
    }
    finally {
        $projectHashAlgorithm.Dispose()
    }

    $backupTimestamp = Get-ChildItem -LiteralPath $backupRoot -Directory |
        Where-Object { $_.Name -notin $previousBackups } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    Assert-True ($null -ne $backupTimestamp) 'Force did not create a project backup.'
    $projectBackup = Join-Path (Join-Path $backupTimestamp.FullName $projectId) '.agents\skills\karpathy-guidelines\SKILL.md'
    Assert-True (Test-Path $projectBackup) 'Force backup is missing the overwritten skill.'
    Assert-True ((Get-Content -LiteralPath $projectBackup -Raw).Contains('custom skill content')) 'Force backup did not preserve the original skill.'

    Remove-Item -LiteralPath $backupTimestamp.FullName -Recurse -Force
    Write-Output 'PASS: aiwb command launch, project initialization, native skill locations, tool preview, WhatIf, safe conflicts, and backed-up forced updates.'
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}
