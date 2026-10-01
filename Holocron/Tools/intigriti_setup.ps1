# Intigriti Bug Bounty - Auto CLAUDE.md Generator
# Usage: .\intigriti_setup.ps1 -ProgramId "dpg-media-algemeen-dagblad"
# Or:    .\intigriti_setup.ps1 (interactive mode)

param(
    [string]$ProgramId = "",
    [string]$OutputDir = "."
)

$PAT = [System.Environment]::GetEnvironmentVariable("INTIGRITI_PAT", "User")
if (-not $PAT -or $PAT -like "JOUW*") {
    Write-Host "ERROR: INTIGRITI_PAT environment variable niet ingesteld!" -ForegroundColor Red
    Write-Host "Voer uit: [System.Environment]::SetEnvironmentVariable('INTIGRITI_PAT', 'jouw_token', 'User')"
    exit 1
}

$Headers = @{
    "Authorization" = "Bearer $PAT"
    "Content-Type"  = "application/json"
}
$BaseUrl = "https://api.intigriti.com/external/researcher/v1"

function Invoke-IntigritiAPI {
    param([string]$Endpoint)
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl$Endpoint" -Headers $Headers -Method GET
        return $response
    } catch {
        Write-Host "API Error ($Endpoint): $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Get researcher info
Write-Host "Fetching researcher info..." -ForegroundColor Cyan
$me = Invoke-IntigritiAPI "/me"
if ($me) {
    Write-Host "Logged in as: $($me.userName)" -ForegroundColor Green
}

# Get all programs or specific one
if (-not $ProgramId) {
    Write-Host "`nFetching programs..." -ForegroundColor Cyan
    $programs = Invoke-IntigritiAPI "/programs"
    if ($programs) {
        Write-Host "`nAvailable programs:" -ForegroundColor Yellow
        $programs | ForEach-Object { Write-Host "  - $($_.handle): $($_.name)" }
        $ProgramId = Read-Host "`nEnter program handle"
    }
}

# Get program details
Write-Host "`nFetching program: $ProgramId..." -ForegroundColor Cyan
$program = Invoke-IntigritiAPI "/programs/$ProgramId"

if (-not $program) {
    Write-Host "Program niet gevonden: $ProgramId" -ForegroundColor Red
    exit 1
}

Write-Host "Program found: $($program.name)" -ForegroundColor Green

# Get my IP
$myIP = (Invoke-RestMethod -Uri "https://api.ipify.org?format=json").ip

# Build CLAUDE.md content
$claudeContent = @"
# Bug Bounty - $($program.name)

## Researcher Info
- **Intigriti username:** $($me.userName)
- **Testing IP:** $myIP
- **Intigriti PAT:** Opgeslagen als Windows env var ``INTIGRITI_PAT``
- **Program URL:** https://app.intigriti.com/programs/$ProgramId

---

## VERPLICHTE REGELS - NOOIT OVERSLAAN

### Required Headers op elke request:
"@

# Add required headers from rules
if ($program.rulesOfEngagement.requestHeaders) {
    $program.rulesOfEngagement.requestHeaders | ForEach-Object {
        $claudeContent += "`n``````"
        $claudeContent += "`n$($_.name): $($_.value -replace '\{Username\}', $me.userName)"
        $claudeContent += "`n``````"
    }
}

$claudeContent += @"


### Rate Limiting:
- Max **$($program.rulesOfEngagement.automatedTooling.maxRequestsPerSecond) requests/sec**
- Geen automated scanners

---

## Scope - In Scope
"@

# Add in-scope assets
if ($program.domains) {
    $program.domains | Where-Object { $_.inScope -eq $true } | ForEach-Object {
        $tier = if ($_.tier) { " (Tier $($_.tier))" } else { "" }
        $claudeContent += "`n- ``$($_.endpoint)``$tier"
    }
}

$claudeContent += @"


## Scope - OUT of Scope
"@

# Add out-of-scope
if ($program.domains) {
    $program.domains | Where-Object { $_.inScope -eq $false } | ForEach-Object {
        $claudeContent += "`n- ``$($_.endpoint)``"
    }
}

$claudeContent += @"


---

## Bounties
| Severity | Bounty |
|----------|--------|
"@

if ($program.bounties) {
    $program.bounties | ForEach-Object {
        $claudeContent += "`n| $($_.severity) | $($_.currency) $($_.min) - $($_.max) |"
    }
}

$claudeContent += @"


---

## Submission Checklist
- [ ] Alle requests bevatten verplichte headers
- [ ] Max $($program.rulesOfEngagement.automatedTooling.maxRequestsPerSecond) req/sec gerespecteerd
- [ ] Alleen handmatige, gerichte requests
- [ ] Duidelijke reproductie stappen
- [ ] Concreet aanvalsscenario beschreven
- [ ] CVSS score berekend
- [ ] IP adres vermeld: $myIP
- [ ] Severity realistisch ingeschat (impact-based)

*Gegenereerd op: $(Get-Date -Format "yyyy-MM-dd HH:mm") via intigriti_setup.ps1*
"@

# Write CLAUDE.md
$outputPath = Join-Path $OutputDir "CLAUDE.md"
$claudeContent | Out-File -FilePath $outputPath -Encoding utf8
Write-Host "`nCLAUDE.md gegenereerd: $outputPath" -ForegroundColor Green
Write-Host "Klaar! Je kan nu beginnen met testen." -ForegroundColor Green
