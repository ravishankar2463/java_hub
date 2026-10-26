[CmdletBinding()]
param(
    [switch]$InstallExtensions,
    [switch]$CloneReferences,
    [switch]$Force,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$workbench = $PSScriptRoot
$homePath = [Environment]::GetFolderPath('UserProfile')
$backupRoot = Join-Path $homePath '.ai-workbench-backups'
$backupStamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$failures = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()
$commandDirectory = Join-Path $workbench 'bin'
$commandPath = [Environment]::GetEnvironmentVariable('Path', 'User')

if (-not (Test-Path -LiteralPath (Join-Path $commandDirectory 'aiwb.cmd') -PathType Leaf)) {
    throw "The aiwb command launcher is missing: $(Join-Path $commandDirectory 'aiwb.cmd')"
}

if (($commandPath -split ';') -notcontains $commandDirectory) {
    if ($WhatIf) {
        Write-Output "Would add user PATH entry: $commandDirectory"
    }
    else {
        $commandPath = (@($commandPath, $commandDirectory) | Where-Object { $_ }) -join ';'
        [Environment]::SetEnvironmentVariable('Path', $commandPath, 'User')
    }
}

if (($env:Path -split ';') -notcontains $commandDirectory) {
    if (-not $WhatIf) {
        $env:Path = "$commandDirectory;$env:Path"
    }
}

function Save-Conflict {
    param(
        [Parameter(Mandatory)][string]$Destination,
        [Parameter(Mandatory)][string]$SourceRoot
    )

    $relativePath = $Destination.Substring($SourceRoot.Length).TrimStart('\')
    $backupPath = Join-Path (Join-Path $backupRoot $backupStamp) $relativePath
    $backupDirectory = Split-Path -Parent $backupPath
    New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
    Copy-Item -LiteralPath $Destination -Destination $backupPath -Force
    Write-Host "Backed up: $Destination -> $backupPath"
}

function Copy-WorkbenchFile {
    param(
        [Parameter(Mandatory)][string]$Source,
        [Parameter(Mandatory)][string]$Destination,
        [Parameter(Mandatory)][string]$SourceRoot
    )

    if (Test-Path -LiteralPath $Destination -PathType Container) {
        throw "A directory conflicts with the destination file: $Destination"
    }

    if (Test-Path -LiteralPath $Destination -PathType Leaf) {
        if (-not $Force) {
            Write-Warning "Conflict; left existing file unchanged: $Destination"
            return
        }

        if ($WhatIf) {
            Write-Output "Would back up: $Destination"
        }
        else {
            Save-Conflict -Destination $Destination -SourceRoot $SourceRoot
        }
    }

    if ($WhatIf) {
        Write-Output "Would install: $Destination"
        return
    }

    $destinationDirectory = Split-Path -Parent $Destination
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
    Write-Host "Installed: $Destination"
}

$instructions = Join-Path $workbench 'instructions\global-engineering.md'
$instructionTargets = @(
    (Join-Path $homePath '.copilot\copilot-instructions.md'),
    (Join-Path $homePath '.codex\AGENTS.md'),
    (Join-Path $homePath '.claude\CLAUDE.md')
)

foreach ($target in $instructionTargets) {
    Copy-WorkbenchFile -Source $instructions -Destination $target -SourceRoot $homePath
}

$syncScript = Join-Path $workbench 'Sync-Skills.ps1'
& $syncScript -Force:$Force -WhatIf:$WhatIf

$agentSource = Join-Path $workbench 'agents\copilot'
$agentDestination = Join-Path $homePath '.copilot\agents'
Get-ChildItem -LiteralPath $agentSource -File -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring($agentSource.Length).TrimStart('\')
    $target = Join-Path $agentDestination $relativePath
    Copy-WorkbenchFile -Source $_.FullName -Destination $target -SourceRoot $homePath
}

if ($InstallExtensions) {
    if ($WhatIf) {
        Write-Output 'Would install VS Code extensions: GitHub.copilot-chat, GitHub.copilot, OpenAI.chatgpt, anthropic.claude-code'
    }
    else {
        $codeCommand = Get-Command code -ErrorAction SilentlyContinue
        if (-not $codeCommand) {
            throw 'The VS Code command-line tool "code" is not on PATH. Install extensions from VS Code instead.'
        }

        $extensionIds = @(
            'GitHub.copilot-chat',
            'GitHub.copilot',
            'OpenAI.chatgpt',
            'anthropic.claude-code'
        )
        $copilotChatAvailable = $false

        foreach ($extensionId in $extensionIds) {
            Write-Host "Installing VS Code extension: $extensionId"
            $extensionOutput = @(& $codeCommand.Source --install-extension $extensionId 2>&1)
            $exitCode = $LASTEXITCODE
            if ($extensionOutput.Count -gt 0) {
                Write-Host ($extensionOutput -join [Environment]::NewLine)
            }

            if ($extensionId -eq 'GitHub.copilot-chat' -and $exitCode -eq 0) {
                $copilotChatAvailable = $true
            }

            $outputText = $extensionOutput -join [Environment]::NewLine
            if (
                $extensionId -eq 'GitHub.copilot' -and
                $copilotChatAvailable -and
                $exitCode -ne 0 -and
                $outputText -match '(?is)github\.copilot-chat.*cannot be downgraded'
            ) {
                $warnings.Add('GitHub Copilot Chat is available in VS Code, but the separate GitHub Copilot extension could not be installed because its package requires downgrading the bundled Chat component.')
                continue
            }

            if ($exitCode -ne 0) {
                $failures.Add("VS Code extension install failed: $extensionId (exit $exitCode)")
            }
        }
    }
}

if ($CloneReferences) {
    $references = [ordered]@{
        'awesome-copilot' = 'https://github.com/github/awesome-copilot.git'
        'superpowers' = 'https://github.com/obra/superpowers.git'
        'skills' = 'https://github.com/anthropics/skills.git'
    }
    $upstreams = Join-Path $workbench 'upstreams'
    if (-not $WhatIf) {
        New-Item -ItemType Directory -Path $upstreams -Force | Out-Null
    }

    foreach ($name in $references.Keys) {
        $destination = Join-Path $upstreams $name
        if (Test-Path -LiteralPath $destination) {
            Write-Warning "Reference already exists; left unchanged: $destination"
            continue
        }

        if ($WhatIf) {
            Write-Output "Would clone reference library: $name -> $destination"
            continue
        }

        Write-Host "Cloning reference library: $name"
        & git clone --depth 1 $references[$name] $destination
        if ($LASTEXITCODE -ne 0) {
            $failures.Add("Reference clone failed: $name (exit $LASTEXITCODE)")
        }
    }
}

if ($failures.Count -gt 0) {
    throw ($failures -join [Environment]::NewLine)
}

foreach ($warning in $warnings) {
    Write-Warning $warning
}

Write-Host 'AI Workbench setup complete. Restart VS Code and sign in to the providers you choose.'
Write-Host "Systemwide command ready: aiwb (installed in $commandDirectory)"
if ($WhatIf) {
    Write-Output 'Preview only; no user files, PATH entries, extensions, or references were changed.'
}
