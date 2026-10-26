[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Repository,
    [string]$SkillPath,
    [string]$SkillName,
    [switch]$Force,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$workbenchRoot = $PSScriptRoot
$skillRoot = Join-Path $workbenchRoot 'skills'
$temporaryRoot = $null
$globalConfigPath = $null
$savedGlobalConfig = $env:GIT_CONFIG_GLOBAL
$savedNoSystemConfig = $env:GIT_CONFIG_NOSYSTEM
$savedTerminalPrompt = $env:GIT_TERMINAL_PROMPT
$savedLfsSmudge = $env:GIT_LFS_SKIP_SMUDGE
$repositoryUrl = $null
$sourceRoot = $null

function Restore-GitEnvironment {
    if ($null -eq $savedGlobalConfig) {
        Remove-Item Env:GIT_CONFIG_GLOBAL -ErrorAction SilentlyContinue
    }
    else {
        $env:GIT_CONFIG_GLOBAL = $savedGlobalConfig
    }

    if ($null -eq $savedNoSystemConfig) {
        Remove-Item Env:GIT_CONFIG_NOSYSTEM -ErrorAction SilentlyContinue
    }
    else {
        $env:GIT_CONFIG_NOSYSTEM = $savedNoSystemConfig
    }

    if ($null -eq $savedTerminalPrompt) {
        Remove-Item Env:GIT_TERMINAL_PROMPT -ErrorAction SilentlyContinue
    }
    else {
        $env:GIT_TERMINAL_PROMPT = $savedTerminalPrompt
    }

    if ($null -eq $savedLfsSmudge) {
        Remove-Item Env:GIT_LFS_SKIP_SMUDGE -ErrorAction SilentlyContinue
    }
    else {
        $env:GIT_LFS_SKIP_SMUDGE = $savedLfsSmudge
    }
}

try {
    if (-not (Test-Path -LiteralPath $skillRoot -PathType Container)) {
        throw "Canonical workbench skills directory does not exist: $skillRoot"
    }
    $skillRootItem = Get-Item -LiteralPath $skillRoot -Force
    if (($skillRootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Refusing to import through a symbolic link or junction: $skillRoot"
    }

    if (Test-Path -LiteralPath $Repository -PathType Container) {
        $sourceRoot = [System.IO.Path]::GetFullPath($Repository)
        $repositoryUrl = 'Local Git repository'
    }
    else {
        if ($Repository -notmatch '^https://github\.com/[^/?#]+/[^/?#]+(?:\.git)?/?$') {
            throw 'Use an HTTPS GitHub repository URL (without credentials, query, or fragment).'
        }

        $repositoryUrl = $Repository.TrimEnd('/')
        if ($WhatIf) {
            Write-Output "Would inspect GitHub skill repository: $repositoryUrl"
            Write-Output 'No remote files are downloaded in WhatIf mode.'
            return
        }

        $git = Get-Command 'git.exe' -ErrorAction SilentlyContinue
        if ($null -eq $git) {
            $git = Get-Command 'git' -ErrorAction SilentlyContinue
        }
        if ($null -eq $git) {
            throw 'Git was not found. Install Git for Windows, then retry.'
        }

        $temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('aiwb-skill-' + [guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $temporaryRoot -Force | Out-Null
        $globalConfigPath = Join-Path $temporaryRoot 'empty-gitconfig'
        [System.IO.File]::WriteAllText($globalConfigPath, '')

        $env:GIT_CONFIG_GLOBAL = $globalConfigPath
        $env:GIT_CONFIG_NOSYSTEM = '1'
        $env:GIT_TERMINAL_PROMPT = '0'
        $env:GIT_LFS_SKIP_SMUDGE = '1'

        $sourceRoot = Join-Path $temporaryRoot 'repository'
        Write-Output "Cloning skill source (without submodules or configured Git filters): $repositoryUrl"
        & $git.Source -c 'core.hooksPath=NUL' -c 'filter.lfs.smudge=' -c 'filter.lfs.required=false' clone --depth 1 --no-recurse-submodules $repositoryUrl $sourceRoot
        if ($LASTEXITCODE -ne 0) {
            throw "Git clone failed with exit code $LASTEXITCODE."
        }
    }

    if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) {
        throw "Skill repository was not found: $sourceRoot"
    }

    $trackedFiles = @(& git -C $sourceRoot ls-files)
    if ($LASTEXITCODE -ne 0) {
        throw 'The skill source must be a Git repository with tracked files.'
    }
    $skillFiles = @($trackedFiles | Where-Object { $_ -match '(^|[\\/])SKILL\.md$' })
    if ($skillFiles.Count -eq 0) {
        throw 'No tracked SKILL.md files were found in the repository.'
    }

    $selectedSkillFile = $null
    if ([string]::IsNullOrWhiteSpace($SkillPath)) {
        if ($skillFiles.Count -ne 1) {
            Write-Output 'Found multiple skills. Select one with -SkillPath:'
            foreach ($candidate in $skillFiles) {
                Write-Output "  $candidate"
            }
            throw 'A skill path is required when the repository contains multiple skills.'
        }
        $selectedSkillFile = $skillFiles[0]
    }
    else {
        $requestedPath = $SkillPath.Replace('/', '\').Trim('\')
        if ([string]::IsNullOrWhiteSpace($requestedPath) -or $requestedPath -match '(^|\\)\.\.(\\|$)' -or [System.IO.Path]::IsPathRooted($requestedPath)) {
            throw "SkillPath must be a repository-relative path: $SkillPath"
        }

        $matches = @($skillFiles | Where-Object {
            $candidateDirectory = Split-Path $_ -Parent
            $_.Replace('/', '\') -ieq $requestedPath -or $candidateDirectory -ieq $requestedPath
        })
        if ($matches.Count -ne 1) {
            throw "SkillPath must identify exactly one tracked SKILL.md file: $SkillPath"
        }
        $selectedSkillFile = $matches[0]
    }

    $relativeSkillFile = $selectedSkillFile.Replace('/', '\')
    $selectedFilePath = [System.IO.Path]::GetFullPath((Join-Path $sourceRoot $relativeSkillFile))
    $sourcePrefix = $sourceRoot.TrimEnd('\') + '\'
    if (-not $selectedFilePath.StartsWith($sourcePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw 'The selected skill file resolves outside the cloned repository.'
    }

    $skillDirectoryRelative = Split-Path $relativeSkillFile -Parent
    $selectedSkillDirectory = if ([string]::IsNullOrWhiteSpace($skillDirectoryRelative)) {
        $sourceRoot
    }
    else {
        [System.IO.Path]::GetFullPath((Join-Path $sourceRoot $skillDirectoryRelative))
    }

    $frontmatter = Get-Content -LiteralPath $selectedFilePath -Raw
    if ([string]::IsNullOrWhiteSpace($SkillName)) {
        $nameMatch = [regex]::Match($frontmatter, '(?m)^name:\s*["'']?([a-zA-Z0-9._-]+)')
        if ($nameMatch.Success) {
            $SkillName = $nameMatch.Groups[1].Value.ToLowerInvariant()
        }
        elseif (-not [string]::IsNullOrWhiteSpace($skillDirectoryRelative)) {
            $SkillName = (Split-Path $skillDirectoryRelative -Leaf).ToLowerInvariant()
        }
        else {
            throw 'Could not determine the skill name. Specify -SkillName.'
        }
    }
    if ($SkillName -notmatch '^[a-z0-9][a-z0-9._-]{0,63}$') {
        throw "Skill name must be 1-64 lowercase letters, digits, dots, underscores, or hyphens: $SkillName"
    }

    $licensePath = $null
    $skillDirectoryPrefix = if ([string]::IsNullOrWhiteSpace($skillDirectoryRelative)) {
        ''
    }
    else {
        $skillDirectoryRelative.Replace('\', '/') + '/'
    }
    $licenseCandidates = @($trackedFiles | Where-Object {
        $_ -match '(^|/)(LICENSE|LICENCE)(\.[^/]*)?$' -and
        ($skillDirectoryPrefix -eq '' -or $skillDirectoryPrefix.StartsWith($_.Substring(0, $_.LastIndexOf('/') + 1), [System.StringComparison]::OrdinalIgnoreCase) -or $_.StartsWith($skillDirectoryPrefix, [System.StringComparison]::OrdinalIgnoreCase))
    } | Sort-Object { $_.Length } -Descending)
    if ($licenseCandidates.Count -gt 0) {
        $licensePath = [System.IO.Path]::GetFullPath((Join-Path $sourceRoot $licenseCandidates[0].Replace('/', '\')))
        Write-Output "Upstream license: $($licenseCandidates[0])"
    }
    else {
        Write-Warning 'No tracked LICENSE file was found. Review the upstream licensing before using this skill.'
    }

    $selectedFiles = @($trackedFiles | Where-Object {
        if ([string]::IsNullOrWhiteSpace($skillDirectoryRelative)) {
            $_ -notmatch '(^|/)\.git/'
        }
        else {
            $_.StartsWith($skillDirectoryPrefix, [System.StringComparison]::OrdinalIgnoreCase)
        }
    })
    if ($selectedFiles.Count -eq 0) {
        throw 'The selected skill directory contains no tracked files.'
    }
    foreach ($relativeFile in $selectedFiles) {
        $sourceFile = [System.IO.Path]::GetFullPath((Join-Path $sourceRoot $relativeFile.Replace('/', '\')))
        if (-not $sourceFile.StartsWith($sourcePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "A tracked skill file resolves outside the repository: $relativeFile"
        }
        $item = Get-Item -LiteralPath $sourceFile -Force
        if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Symbolic links are not imported as part of a skill: $relativeFile"
        }
    }

    $destination = Join-Path $skillRoot $SkillName
    Write-Output "Selected skill: $selectedSkillFile"
    Write-Output "Canonical destination: $destination"
    if ($WhatIf) {
        Write-Output "Would install $($selectedFiles.Count) tracked skill file(s)."
        return
    }

    if (Test-Path -LiteralPath $destination -PathType Container) {
        if (-not $Force) {
            throw "Skill already exists; use -Force to replace it after backing it up: $destination"
        }

        $existingItems = @((Get-Item -LiteralPath $destination -Force)) + @(Get-ChildItem -LiteralPath $destination -Force -Recurse)
        if ($existingItems | Where-Object { ($_.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0 }) {
            throw "Refusing to replace a skill tree containing symbolic links or junctions: $destination"
        }

        $backupPath = Join-Path (Join-Path (Join-Path ([Environment]::GetFolderPath('UserProfile')) '.ai-workbench-backups\skills') (Get-Date -Format 'yyyyMMdd-HHmmss-fff')) $SkillName
        New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force | Out-Null
        Copy-Item -LiteralPath $destination -Destination $backupPath -Recurse -Force
        Remove-Item -LiteralPath $destination -Recurse -Force
        Write-Output "Backed up existing skill: $destination -> $backupPath"
    }
    elseif (Test-Path -LiteralPath $destination) {
        throw "A non-directory item conflicts with the skill destination: $destination"
    }

    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    foreach ($relativeFile in $selectedFiles) {
        $relativeToSkill = if ([string]::IsNullOrWhiteSpace($skillDirectoryRelative)) {
            $relativeFile
        }
        else {
            $relativeFile.Substring($skillDirectoryPrefix.Length)
        }
        $sourceFile = Join-Path $sourceRoot $relativeFile.Replace('/', '\')
        $targetFile = Join-Path $destination $relativeToSkill.Replace('/', '\')
        New-Item -ItemType Directory -Path (Split-Path -Parent $targetFile) -Force | Out-Null
        Copy-Item -LiteralPath $sourceFile -Destination $targetFile -Force
    }
    if ($null -ne $licensePath -and -not ($selectedFiles | Where-Object { $_ -ieq $licenseCandidates[0] })) {
        Copy-Item -LiteralPath $licensePath -Destination (Join-Path $destination 'UPSTREAM-LICENSE.txt') -Force
    }

    $syncScript = Join-Path $workbenchRoot 'Sync-Skills.ps1'
    if (-not (Test-Path -LiteralPath $syncScript -PathType Leaf)) {
        throw "Global skill sync script is missing: $syncScript"
    }
    & $syncScript -Force:$Force -SkillName $SkillName
    if (-not $?) {
        throw 'The skill was added to the canonical library, but syncing its global copies failed.'
    }

    Write-Output "Skill added to the canonical workbench: $SkillName"
    Write-Output "Use 'aiwb updateSkills' in an initialized project to add it there."
}
finally {
    Restore-GitEnvironment
    if ($null -ne $temporaryRoot -and (Test-Path -LiteralPath $temporaryRoot -PathType Container)) {
        Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
    }
}
