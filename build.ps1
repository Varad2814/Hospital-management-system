# Build & Run Script for MediCore Hospital Management System
# Run this from the project root: .\build.ps1

param(
    [switch]$SkipCpp,
    [switch]$CppOnly
)

$ProjectRoot = $PSScriptRoot
$CppDir      = Join-Path $ProjectRoot "cpp-core"
$BackendDir  = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$BuildDir    = Join-Path $CppDir "build"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    MediCore Hospital Management System       ║" -ForegroundColor Cyan
Write-Host "║    Build & Run Script                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Build C++ Engine ────────────────────────────────────────────────
if (-not $SkipCpp) {
    Write-Host "► Step 1: Building C++ Engine..." -ForegroundColor Yellow

    if (-not (Test-Path $BuildDir)) {
        New-Item -ItemType Directory -Path $BuildDir | Out-Null
    }

    Push-Location $BuildDir

    # Try MinGW first, fall back to default generator
    $cmakeGen = "MinGW Makefiles"
    $cmakeResult = cmake .. -G $cmakeGen -DCMAKE_BUILD_TYPE=Release 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  MinGW not found, trying default generator..." -ForegroundColor Gray
        cmake .. -DCMAKE_BUILD_TYPE=Release
    }

    cmake --build . --config Release
    Pop-Location

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ C++ Engine compiled successfully!" -ForegroundColor Green
        Write-Host "  → Output: backend\bin\hospital_engine.exe" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  C++ compilation failed. Backend will use mock data." -ForegroundColor Red
    }
    Write-Host ""
}

if ($CppOnly) { exit 0 }

# ── Step 2: Install Backend deps ────────────────────────────────────────────
Write-Host "► Step 2: Installing Node.js backend dependencies..." -ForegroundColor Yellow
Push-Location $BackendDir
npm install --silent
Write-Host "  ✅ Backend dependencies installed" -ForegroundColor Green
Pop-Location
Write-Host ""

# ── Step 3: Install Frontend deps ───────────────────────────────────────────
Write-Host "► Step 3: Installing React frontend dependencies..." -ForegroundColor Yellow
Push-Location $FrontendDir
npm install --silent
Write-Host "  ✅ Frontend dependencies installed" -ForegroundColor Green
Pop-Location
Write-Host ""

# ── Step 4: Start both servers ───────────────────────────────────────────────
Write-Host "► Step 4: Starting servers..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  🚀 Backend  → http://localhost:3001" -ForegroundColor Cyan
Write-Host "  🌐 Frontend → http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop all servers" -ForegroundColor Gray
Write-Host ""

# Start backend in background
$backend = Start-Process -FilePath "node" -ArgumentList "server.js" `
    -WorkingDirectory $BackendDir -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 2

# Start frontend (blocking)
Push-Location $FrontendDir
npm run dev
Pop-Location

# Cleanup
Stop-Process -Id $backend.Id -ErrorAction SilentlyContinue
