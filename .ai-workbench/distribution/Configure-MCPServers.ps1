[CmdletBinding()]
param(
    [string]$HomePath = [Environment]::GetFolderPath('UserProfile'),
    [string]$DockerCommand = 'docker',
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$HomePath = [System.IO.Path]::GetFullPath($HomePath)
$backupStamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$backupRoot = Join-Path $HomePath '.ai-workbench-backups\mcp'
$dockerProfile = 'aiwb'
$dockerCatalog = 'mcp/docker-mcp-catalog:latest'
$gitMcpVersion = '2026.10.19'
$gitServer = [ordered]@{
    command = 'uvx'
    args = @('--from', "mcp-server-git==$gitMcpVersion", 'mcp-server-git')
}
$dockerGateway = [ordered]@{
    command = 'docker'
    args = @('mcp', 'gateway', 'run', '--profile', $dockerProfile)
}
$clientEntries = @(
    [pscustomobject]@{
        Path = Join-Path $HomePath '.copilot\mcp-config.json'
        Section = 'mcpServers'
        Servers = [ordered]@{
            git = $gitServer
            MCP_DOCKER = [ordered]@{
                command = $dockerGateway.command
                args = $dockerGateway.args
                type = 'stdio'
            }
        }
        Label = 'Copilot Global'
    },
    [pscustomobject]@{
        Path = Join-Path $HomePath '.codex\config.toml'
        Section = $null
        Servers = [ordered]@{
            git = $gitServer
            MCP_DOCKER = $dockerGateway
        }
        Label = 'Codex user config'
    },
    [pscustomobject]@{
        Path = Join-Path $HomePath '.claude.json'
        Section = 'mcpServers'
        Servers = [ordered]@{
            git = $gitServer
            MCP_DOCKER = $dockerGateway
        }
        Label = 'Claude user config'
    }
)
$dockerServers = @(
    [pscustomobject]@{ Id = 'github-official'; Label = 'GitHub Official' },
    [pscustomobject]@{ Id = 'context7'; Label = 'Context7' },
    [pscustomobject]@{ Id = 'docker-docs'; Label = 'Docker Docs' },
    [pscustomobject]@{ Id = 'dockerhub'; Label = 'Docker Hub' }
)

function Write-AtomicText {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Content
    )

    $directory = Split-Path -Parent $Path
    New-Item -ItemType Directory -Path $directory -Force | Out-Null

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $relativePath = $Path.Substring($HomePath.Length).TrimStart('\')
        $backupPath = Join-Path (Join-Path $backupRoot $backupStamp) $relativePath
        New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force | Out-Null
        Copy-Item -LiteralPath $Path -Destination $backupPath
        Write-Output "Backed up MCP config: $Path -> $backupPath"
    }

    $temporaryPath = "$Path.aiwb-$([guid]::NewGuid().ToString('N')).tmp"
    try {
        [System.IO.File]::WriteAllText(
            $temporaryPath,
            $Content,
            [System.Text.UTF8Encoding]::new($false)
        )
        Move-Item -LiteralPath $temporaryPath -Destination $Path -Force
    }
    finally {
        if (Test-Path -LiteralPath $temporaryPath -PathType Leaf) {
            Remove-Item -LiteralPath $temporaryPath -Force
        }
    }
}

function Add-JsonServers {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Section,
        [Parameter(Mandatory)][System.Collections.IDictionary]$Servers
    )

    if (Test-Path -LiteralPath $Path -PathType Container) {
        throw "A directory conflicts with the MCP configuration file: $Path"
    }

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        try {
            $configuration = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
        }
        catch {
            throw "Could not parse existing JSON MCP configuration at '$Path': $($_.Exception.Message)"
        }
    }
    else {
        $configuration = [pscustomobject]@{}
    }

    if ($null -eq $configuration -or $configuration -isnot [pscustomobject]) {
        throw "The MCP configuration root must be a JSON object: $Path"
    }

    $serverSection = $configuration.PSObject.Properties[$Section]
    if ($null -eq $serverSection) {
        $currentServers = [pscustomobject]@{}
        $configuration | Add-Member -MemberType NoteProperty -Name $Section -Value $currentServers
    }
    elseif ($serverSection.Value -is [pscustomobject]) {
        $currentServers = $serverSection.Value
    }
    else {
        throw "The '$Section' value must be a JSON object in '$Path'."
    }

    $added = 0
    foreach ($name in $Servers.Keys) {
        if ($null -ne $currentServers.PSObject.Properties[$name]) {
            Write-Output "Preserved existing MCP server '$name' in $Path"
            continue
        }

        $entry = [pscustomobject]$Servers[$name]
        $currentServers | Add-Member -MemberType NoteProperty -Name $name -Value $entry
        Write-Output "Added MCP server '$name' to $Path"
        $added++
    }

    if ($added -gt 0) {
        $json = ConvertTo-Json -InputObject $configuration -Depth 100
        Write-AtomicText -Path $Path -Content ($json + [Environment]::NewLine)
    }
    elseif (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        $json = ConvertTo-Json -InputObject $configuration -Depth 100
        Write-AtomicText -Path $Path -Content ($json + [Environment]::NewLine)
    }
}

function Add-CodexServers {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][System.Collections.IDictionary]$Servers
    )

    if (Test-Path -LiteralPath $Path -PathType Container) {
        throw "A directory conflicts with the MCP configuration file: $Path"
    }

    $content = if (Test-Path -LiteralPath $Path -PathType Leaf) {
        Get-Content -LiteralPath $Path -Raw
    }
    else {
        ''
    }
    $newSections = [System.Collections.Generic.List[string]]::new()

    foreach ($name in $Servers.Keys) {
        $sectionPattern = '(?im)^\s*\[mcp_servers\.(?:"' + [regex]::Escape($name) + '"|' + [regex]::Escape($name) + ')\]\s*$'
        if ($content -match $sectionPattern) {
            Write-Output "Preserved existing MCP server '$name' in $Path"
            continue
        }

        $server = $Servers[$name]
        $tomlArgs = @($server.args | ForEach-Object { '"' + ([string]$_).Replace('\', '\\').Replace('"', '\"') + '"' })
        $section = "[mcp_servers.$name]`ncommand = `"$($server.command)`"`nargs = [$($tomlArgs -join ', ')]"
        $newSections.Add($section)
        Write-Output "Added MCP server '$name' to $Path"
    }

    if ($newSections.Count -gt 0 -or -not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        $appendText = $newSections -join "`n`n"
        $updatedContent = $content.TrimEnd()
        if ($updatedContent.Length -gt 0 -and $appendText.Length -gt 0) {
            $updatedContent += "`n`n"
        }
        $updatedContent += $appendText
        Write-AtomicText -Path $Path -Content ($updatedContent.TrimEnd() + [Environment]::NewLine)
    }
}

function Invoke-DockerMcp {
    param(
        [Parameter(Mandatory)][string[]]$Arguments
    )

    $commandTarget = if ($script:dockerExecutable.CommandType -eq 'Application') {
        $script:dockerExecutable.Source
    }
    else {
        $script:dockerExecutable.Name
    }
    $output = @(& $commandTarget @Arguments 2>&1)
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        $details = $output -join [Environment]::NewLine
        throw "Docker MCP command failed (exit $exitCode): docker $($Arguments -join ' ')`n$details"
    }

    return $output
}

if ($WhatIf) {
    Write-Output "Would ensure Docker MCP catalog: $dockerCatalog"
    Write-Output "Would ensure Docker MCP profile '$dockerProfile' with $($dockerServers.Label -join ', ')."
    foreach ($client in $clientEntries) {
        Write-Output "Would add Git and Docker MCP gateway entries to $($client.Label): $($client.Path)"
    }
    Write-Output "Git MCP package is pinned to mcp-server-git==$gitMcpVersion."
    Write-Output 'Preview only; no MCP profiles, configs, or packages were changed.'
    exit 0
}

$machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$env:Path = "$machinePath;$userPath;$env:Path"

$uvx = Get-Command 'uvx' -ErrorAction SilentlyContinue
if ($null -eq $uvx) {
    throw 'uvx is required for the local Git MCP server. Run "aiwb tools" to install uv, then open a new terminal.'
}

$script:dockerExecutable = Get-Command $DockerCommand -ErrorAction SilentlyContinue
if ($null -eq $script:dockerExecutable) {
    throw 'Docker Desktop with MCP Toolkit is required. Install or update Docker Desktop to 4.62 or later, then rerun "aiwb mcp".'
}

$catalogs = Invoke-DockerMcp -Arguments @('mcp', 'catalog', 'list')
if (($catalogs -join "`n") -notmatch [regex]::Escape($dockerCatalog)) {
    Write-Output "Importing Docker's official MCP catalog: $dockerCatalog"
    Invoke-DockerMcp -Arguments @('mcp', 'catalog', 'pull', $dockerCatalog) | Out-Null
}

$profiles = Invoke-DockerMcp -Arguments @('mcp', 'profile', 'list')
if (($profiles -join "`n") -notmatch '(?im)^\s*aiwb\s*(?:\||$|\s)') {
    Write-Output "Creating Docker MCP profile '$dockerProfile'."
    Invoke-DockerMcp -Arguments @('mcp', 'profile', 'create', '--name', $dockerProfile) | Out-Null
    $serversToAdd = $dockerServers
}
else {
    $profileServers = Invoke-DockerMcp -Arguments @(
        'mcp', 'profile', 'server', 'ls', '--filter', "profile=$dockerProfile"
    )
    $profileServerText = $profileServers -join "`n"
    $serversToAdd = @($dockerServers | Where-Object {
        $id = [regex]::Escape($_.Id)
        $profileServerText -notmatch "(?im)^\s*$id(?:\s|\||$)" -and
        $profileServerText -notmatch "(?im)^\s*[^|]+\|\s*[^|]+\|\s*$id\s*$" -and
        $profileServerText -notmatch "(?im)catalog://[^`r`n]*/$id(?:\s|\||$)"
    })
}

if ($serversToAdd.Count -gt 0) {
    $serverArguments = @('mcp', 'profile', 'server', 'add', $dockerProfile)
    foreach ($server in $serversToAdd) {
        $serverArguments += @('--server', "catalog://mcp/docker-mcp-catalog/$($server.Id)")
    }
    Write-Output "Adding Docker MCP servers: $($serversToAdd.Label -join ', ')."
    Invoke-DockerMcp -Arguments $serverArguments | Out-Null
}

foreach ($client in $clientEntries) {
    if ($client.Section) {
        Add-JsonServers -Path $client.Path -Section $client.Section -Servers $client.Servers
    }
    else {
        Add-CodexServers -Path $client.Path -Servers $client.Servers
    }
}

Write-Output 'User-level MCP setup is complete. Authenticate GitHub in Docker Desktop MCP Toolkit if prompted.'
Write-Output 'Git MCP can stage and commit changes or switch branches; review and approve each mutating action.'
