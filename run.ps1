# HealthTrack Pro — Full Startup Script
# Run this script from the project root to start the whole application

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "         HealthTrack Pro Launcher         " -ForegroundColor Cyan
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""

$MYSQL = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$MVN   = "C:\Program Files\Apache Software Foundation\apache-maven-3.9.11\bin\mvn.cmd"
$BACKEND_DIR  = "$PSScriptRoot\backend"
$FRONTEND_DIR = "$PSScriptRoot\frontend"

# -- Step 1: MySQL Setup --------------------------------------
Write-Host "Step 1/4: Setting up MySQL database..." -ForegroundColor Yellow
$rootPass = Read-Host "Enter MySQL root password" -AsSecureString
$plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPass)
)

$setupSQL = "CREATE DATABASE IF NOT EXISTS healthtrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; " +
            "CREATE USER IF NOT EXISTS 'healthtrack_user'@'localhost' IDENTIFIED BY 'healthtrack_pass123'; " +
            "GRANT ALL PRIVILEGES ON healthtrack_db.* TO 'healthtrack_user'@'localhost'; " +
            "FLUSH PRIVILEGES;"

$setupSQL | & $MYSQL -u root -p"$plainPass" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Database setup failed! Check your MySQL root password." -ForegroundColor Red
    exit 1
}
Write-Host "  [+] Database ready (healthtrack_db)" -ForegroundColor Green

# -- Step 2: Maven Build --------------------------------------
Write-Host ""
Write-Host "Step 2/4: Building Spring Boot backend..." -ForegroundColor Yellow
& $MVN -f "$BACKEND_DIR\pom.xml" clean package -DskipTests -q
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  [+] Backend built successfully" -ForegroundColor Green

# -- Step 3: Frontend install ---------------------------------
Write-Host ""
Write-Host "Step 3/4: Installing frontend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "$FRONTEND_DIR\node_modules")) {
    Push-Location $FRONTEND_DIR
    npm install --silent
    Pop-Location
}
Write-Host "  [+] Frontend dependencies ready" -ForegroundColor Green

# -- Step 4: Launch both servers ------------------------------
Write-Host ""
Write-Host "Step 4/4: Launching servers..." -ForegroundColor Yellow

$jar = Get-ChildItem "$BACKEND_DIR\target" -Filter "*.jar" | Where-Object { $_.Name -notlike "*sources*" } | Select-Object -First 1 -ExpandProperty FullName

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend starting...' -ForegroundColor Cyan; java -jar '$jar' --spring.jpa.hibernate.ddl-auto=update" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$FRONTEND_DIR'; Write-Host 'Frontend starting...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Green
Write-Host "     HealthTrack Pro is starting up!          " -ForegroundColor Green
Write-Host "                                              " -ForegroundColor Green
Write-Host "     Frontend: http://localhost:5173          " -ForegroundColor Green
Write-Host "     Backend:  http://localhost:8080          " -ForegroundColor Green
Write-Host "     Swagger:  http://localhost:8080/         " -ForegroundColor Green
Write-Host "               swagger-ui.html                " -ForegroundColor Green
Write-Host "                                              " -ForegroundColor Green
Write-Host "     Default Admin:                           " -ForegroundColor Green
Write-Host "     admin@healthtrackpro.com                 " -ForegroundColor Green
Write-Host "     Admin@123456                             " -ForegroundColor Green
Write-Host "  ============================================" -ForegroundColor Green
Write-Host ""

# Open browser after delay
Start-Sleep -Seconds 15
Start-Process "http://localhost:5173"
