$ErrorActionPreference = 'Stop'
$workbench = Split-Path -Parent $PSScriptRoot
$configureScript = Join-Path $workbench 'Configure-MCPServers.ps1'
$testHome = Join-Path ([System.IO.Path]::GetTempPath()) ("aiwb-mcp-test-" + [guid]::NewGuid().ToString('N'))
$global:aiwbTestMcpProfileExists = $false
$global:aiwbTestMcpServers = [System.Collections.Generic.List[string]]::new()

function Assert-True {
    param(
        [Parameter(Mandatory)][bool]$Condition,
        [Parameter(Mandatory)][string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Test-AiwbDockerCommand {
    $argumentsText = $args -join ' '
    $global:LASTEXITCODE = 0

    switch -Regex ($argumentsText) {
        '^mcp catalog list$' {
            'Reference | Digest | Title'
            'mcp/docker-mcp-catalog:latest | test | Docker MCP Catalog'
            return
        }
        '^mcp profile list$' {
            if ($global:aiwbTestMcpProfileExists) {
                'aiwb | AI Workbench'
            }
            else {
                'No profiles found.'
            }
            return
        }
        '^mcp profile create --name aiwb$' {
            $global:aiwbTestMcpProfileExists = $true
            return
        }
        '^mcp profile server ls --filter profile=aiwb$' {
            foreach ($server in $global:aiwbTestMcpServers) {
                "aiwb | remote | $server"
            }
            return
        }
        '^mcp profile server add aiwb ' {
            for ($index = 0; $index -lt $args.Count; $index++) {
                if ($args[$index] -eq '--server') {
                    $global:aiwbTestMcpServers.Add(($args[$index + 1] -split '/')[-1])
                }
            }
            return
        }
        default {
            throw "Unexpected Docker MCP test command: $argumentsText"
        }
    }
}

function uvx {}

try {
    New-Item -ItemType Directory -Path $testHome -Force | Out-Null
    $preview = & $configureScript -HomePath $testHome -WhatIf
    $previewText = $preview -join "`n"

    Assert-True ($previewText.Contains('Git')) 'MCP setup preview omitted the local Git server.'
    Assert-True ($previewText.Contains('GitHub Official')) 'MCP setup preview omitted GitHub.'
    Assert-True ($previewText.Contains('Context7')) 'MCP setup preview omitted Context7.'
    Assert-True ($previewText.Contains('Docker Docs')) 'MCP setup preview omitted Docker Docs.'
    Assert-True ($previewText.Contains('Docker Hub')) 'MCP setup preview omitted Docker Hub.'
    Assert-True ($previewText.Contains('.copilot\mcp-config.json')) 'MCP setup preview omitted Copilot Global.'
    Assert-True ($previewText.Contains('.codex\config.toml')) 'MCP setup preview omitted Codex user configuration.'
    Assert-True ($previewText.Contains('.claude.json')) 'MCP setup preview omitted Claude user configuration.'
    Assert-True (-not (Get-ChildItem -LiteralPath $testHome -Force)) 'MCP setup WhatIf created files.'

    New-Item -ItemType Directory -Path (Join-Path $testHome '.copilot') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $testHome '.copilot\mcp-config.json') -Value @'
{
  "mcpServers": {
    "custom": {
      "type": "http",
      "url": "https://example.invalid/mcp"
    },
    "git": {
      "command": "custom-git"
    }
  }
}
'@ -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $testHome '.claude.json') -Value '{"userID":"test-user","mcpServers":{"custom":{"command":"custom-server"}}}' -Encoding UTF8
    New-Item -ItemType Directory -Path (Join-Path $testHome '.codex') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $testHome '.codex\config.toml') -Value "[model]`nmodel = `"test-model`"`n`n[mcp_servers.custom]`ncommand = `"custom-server`"" -Encoding UTF8

    & $configureScript -HomePath $testHome -DockerCommand 'Test-AiwbDockerCommand'

    $copilot = Get-Content -LiteralPath (Join-Path $testHome '.copilot\mcp-config.json') -Raw | ConvertFrom-Json
    Assert-True ($copilot.mcpServers.custom.url -eq 'https://example.invalid/mcp') 'Copilot MCP setup changed an unrelated server.'
    Assert-True ($copilot.mcpServers.git.command -eq 'custom-git') 'Copilot MCP setup overwrote an existing server with the same name.'
    Assert-True ($copilot.mcpServers.MCP_DOCKER.args -contains 'aiwb') 'Copilot MCP setup did not add the Docker profile gateway.'
    Assert-True ($null -eq $copilot.PSObject.Properties['servers']) 'Copilot MCP setup wrote an unsupported servers root.'

    $claude = Get-Content -LiteralPath (Join-Path $testHome '.claude.json') -Raw | ConvertFrom-Json
    Assert-True ($claude.userID -eq 'test-user') 'Claude MCP setup changed unrelated user data.'
    Assert-True ($claude.mcpServers.custom.command -eq 'custom-server') 'Claude MCP setup changed an unrelated server.'
    Assert-True ($claude.mcpServers.git.args -contains "mcp-server-git") 'Claude MCP setup omitted the Git server.'

    $codex = Get-Content -LiteralPath (Join-Path $testHome '.codex\config.toml') -Raw
    Assert-True ($codex.Contains('model = "test-model"')) 'Codex MCP setup changed unrelated configuration.'
    Assert-True ($codex.Contains('[mcp_servers.custom]')) 'Codex MCP setup removed an existing server.'
    Assert-True ($codex.Contains('[mcp_servers.git]')) 'Codex MCP setup omitted the Git server.'
    Assert-True ($codex.Contains('[mcp_servers.MCP_DOCKER]')) 'Codex MCP setup omitted the Docker gateway.'
    Assert-True ($codex.Contains('mcp-server-git==2026.10.19')) 'Codex MCP setup did not pin the Git server version.'
    Assert-True (($codex -split '\[mcp_servers\.git\]').Count -eq 2) 'Codex MCP setup duplicated the Git server.'
    Assert-True (($codex -split '\[mcp_servers\.MCP_DOCKER\]').Count -eq 2) 'Codex MCP setup duplicated the Docker gateway.'
    Assert-True (Test-Path -LiteralPath (Join-Path $testHome '.ai-workbench-backups\mcp')) 'MCP setup did not back up existing JSON configs.'

    & $configureScript -HomePath $testHome -DockerCommand 'Test-AiwbDockerCommand' | Out-Null
    $codexAfterRerun = Get-Content -LiteralPath (Join-Path $testHome '.codex\config.toml') -Raw
    Assert-True (($codexAfterRerun -split '\[mcp_servers\.git\]').Count -eq 2) 'Repeated MCP setup duplicated the Git server.'
    Assert-True (($codexAfterRerun -split '\[mcp_servers\.MCP_DOCKER\]').Count -eq 2) 'Repeated MCP setup duplicated the Docker gateway.'
    Assert-True ($global:aiwbTestMcpServers.Count -eq 4) 'Repeated MCP setup duplicated Docker profile servers.'

    Write-Output 'PASS: MCP setup preview, user-level client configs, conflict preservation, backups, Docker profile setup, and idempotency.'
}
finally {
    Remove-Item function:uvx -ErrorAction SilentlyContinue
    Remove-Item function:Test-AiwbDockerCommand -ErrorAction SilentlyContinue
    Remove-Item variable:global:aiwbTestMcpProfileExists -ErrorAction SilentlyContinue
    Remove-Item variable:global:aiwbTestMcpServers -ErrorAction SilentlyContinue
    if (Test-Path -LiteralPath $testHome -PathType Container) {
        Remove-Item -LiteralPath $testHome -Recurse -Force
    }
}
