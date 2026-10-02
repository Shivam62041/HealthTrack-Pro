# HealthTrack Pro — Database Setup Script
# Run this in PowerShell as Administrator, or in any terminal with MySQL access
# Usage: .\setup-db.ps1 -RootPassword "yourpassword"

param(
    [Parameter(Mandatory=$true)]
    [string]$RootPassword
)

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

$sql = @"
CREATE DATABASE IF NOT EXISTS healthtrack_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'healthtrack_user'@'localhost'
    IDENTIFIED BY 'healthtrack_pass123';

GRANT ALL PRIVILEGES ON healthtrack_db.* TO 'healthtrack_user'@'localhost';
FLUSH PRIVILEGES;

SELECT 'Database setup complete!' AS Status;
SHOW DATABASES LIKE 'healthtrack_db';
"@

Write-Host "Setting up HealthTrack Pro database..." -ForegroundColor Cyan
$sql | & $mysql -u root -p"$RootPassword"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created successfully!" -ForegroundColor Green
    Write-Host "   DB:   healthtrack_db" -ForegroundColor Gray
    Write-Host "   User: healthtrack_user" -ForegroundColor Gray
    Write-Host "   Pass: healthtrack_pass123" -ForegroundColor Gray
} else {
    Write-Host "❌ Database setup failed. Check your root password." -ForegroundColor Red
}
