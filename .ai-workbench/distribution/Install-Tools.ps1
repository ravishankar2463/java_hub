[CmdletBinding()]
param(
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

$wingetPackages = @(
    @{ Id = 'BurntSushi.ripgrep.MSVC'; Command = 'rg.exe' },
    @{ Id = 'ast-grep.ast-grep'; Command = 'sg.exe' },
    @{ Id = 'sharkdp.fd'; Command = 'fd.exe' },
    @{ Id = 'junegunn.fzf'; Command = 'fzf.exe' },
    @{ Id = 'jqlang.jq'; Command = 'jq.exe' },
    @{ Id = 'sharkdp.bat'; Command = 'bat.exe' },
    @{ Id = 'XAMPPRocky.Tokei'; Command = 'tokei.exe' },
    @{ Id = 'UniversalCtags.Ctags'; Command = 'ctags.exe' },
    @{ Id = 'astral-sh.uv'; Command = 'uv.exe' }
)
$graphifyVersion = '0.9.95'
$noInstalledPackageExitCode = -1978335212

if ($WhatIf) {
    foreach ($package in $wingetPackages) {
        Write-Output "Would install winget package: $($package.Id)"
    }
    Write-Output "Would install Graphify CLI with uv: graphifyy==$graphifyVersion"
    exit 0
}

$winget = Get-Command 'winget.exe' -ErrorAction SilentlyContinue
if ($null -eq $winget) {
    throw 'winget.exe was not found. Install or update App Installer, then retry.'
}

$machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$env:Path = "$machinePath;$userPath;$env:Path"

foreach ($package in $wingetPackages) {
    $packageId = $package.Id
    if (Get-Command $package.Command -ErrorAction SilentlyContinue) {
        Write-Output "Already available: $packageId ($($package.Command))"
        continue
    }

    $installedOutput = & $winget.Source list --id $packageId --exact --disable-interactivity 2>&1
    $listExitCode = $LASTEXITCODE
    if ($listExitCode -eq 0 -and ($installedOutput -join "`n").Contains($packageId)) {
        Write-Output "Already installed: $packageId"
        continue
    }
    if ($listExitCode -ne 0 -and $listExitCode -ne $noInstalledPackageExitCode) {
        throw "winget failed to check $packageId with exit code $LASTEXITCODE."
    }

    Write-Output "Installing $packageId..."
    & $winget.Source install --id $packageId --exact --accept-source-agreements --accept-package-agreements --disable-interactivity
    if ($LASTEXITCODE -ne 0) {
        throw "winget failed to install $packageId with exit code $LASTEXITCODE."
    }
}

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$env:Path = "$machinePath;$userPath;$env:Path"

$graphify = Get-Command 'graphify.exe' -ErrorAction SilentlyContinue
if ($null -eq $graphify) {
    $graphify = Get-Command 'graphify' -ErrorAction SilentlyContinue
}
if ($null -ne $graphify) {
    Write-Output "Already available: Graphify CLI ($($graphify.Source))"
}
else {
    $uv = Get-Command 'uv.exe' -ErrorAction SilentlyContinue
    if ($null -eq $uv) {
        $uv = Get-Command 'uv' -ErrorAction SilentlyContinue
    }
    if ($null -eq $uv) {
        throw 'uv was installed but is not available in this terminal. Open a new terminal and rerun aiwb tools.'
    }

    Write-Output "Installing Graphify CLI graphifyy==$graphifyVersion..."
    & $uv.Source tool install "graphifyy==$graphifyVersion" --python 3.13
    if ($LASTEXITCODE -ne 0) {
        throw "uv failed to install Graphify with exit code $LASTEXITCODE."
    }

    $uvBin = (& $uv.Source tool dir --bin | Select-Object -Last 1).Trim()
    if ([string]::IsNullOrWhiteSpace($uvBin)) {
        throw 'uv did not report its tool executable directory.'
    }

    $pathEntries = @($userPath -split ';' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if (-not ($pathEntries | Where-Object { $_.TrimEnd('\') -ieq $uvBin.TrimEnd('\') })) {
        $newUserPath = (($pathEntries + $uvBin) -join ';')
        [Environment]::SetEnvironmentVariable('Path', $newUserPath, 'User')
        $env:Path = "$env:Path;$uvBin"
        Write-Output "Added uv tool directory to the user PATH: $uvBin"
    }
}

Write-Output 'Missing tool installation finished. Existing tool versions were left unchanged.'
