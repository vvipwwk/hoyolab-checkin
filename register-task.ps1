# HoyoLab Check-in — Windows Task Scheduler Setup
# Run this script as Administrator to register the daily task

$TaskName = "HoyoLab-AutoCheckin"
$NodePath = (Get-Command node -ErrorAction Stop).Source
$ScriptPath = "$PSScriptRoot\src\checkin.js"
$WorkDir = $PSScriptRoot

# Create the action
$Action = New-ScheduledTaskAction `
    -Execute $NodePath `
    -Argument "`"$ScriptPath`"" `
    -WorkingDirectory $WorkDir

# Trigger at 00:00 every day
$Trigger = New-ScheduledTaskTrigger -Daily -At "00:00"

# Settings: run even when not logged in, restart on failure
$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

Write-Host "Registering Task Scheduler task: $TaskName" -ForegroundColor Cyan

try {
    # Remove old task if exists
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -RunLevel Highest `
        -Description "HoyoLab daily check-in for Hoyoverse games" `
        -Force | Out-Null

    Write-Host "Task '$TaskName' registered successfully!" -ForegroundColor Green
    Write-Host "It will run every day at 00:00." -ForegroundColor Green
    Write-Host ""
    Write-Host "To run it NOW for testing:"
    Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
    Write-Host ""
    Write-Host "To view logs: check the .\logs\ folder"
} catch {
    Write-Host "Error registering task: $_" -ForegroundColor Red
    Write-Host "Make sure you are running this as Administrator." -ForegroundColor Yellow
}
