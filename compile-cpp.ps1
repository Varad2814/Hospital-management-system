# Compile C++ engine using MinGW g++
# Run from project root: .\compile-cpp.ps1

$ProjectRoot = $PSScriptRoot
$CppDir      = Join-Path $ProjectRoot "cpp-core"
$OutDir      = Join-Path $ProjectRoot "backend\bin"
$DataDir     = Join-Path $CppDir "data"
$GppPath     = "C:\MinGW\bin\g++.exe"

# Ensure output directories exist
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

Write-Host "► Compiling C++ Hospital Engine..." -ForegroundColor Yellow

# Find g++
if (-not (Test-Path $GppPath)) {
    $GppPath = (where.exe g++ 2>$null | Select-Object -First 1)
}
if (-not $GppPath) {
    Write-Host "  ❌ g++ not found. Install MinGW-w64 and add to PATH." -ForegroundColor Red
    exit 1
}

Write-Host "  Using compiler: $GppPath" -ForegroundColor Gray

$Sources = @(
    "src\Person.cpp",
    "src\Patient.cpp",
    "src\Doctor.cpp",
    "src\QueueManager.cpp",
    "src\HospitalDirectory.cpp",
    "src\FileManager.cpp",
    "src\HospitalEngine.cpp",
    "src\main.cpp"
) | ForEach-Object { Join-Path $CppDir $_ }

$Output = Join-Path $OutDir "hospital_engine.exe"
$IncDir = Join-Path $CppDir "include"

$Args = @("-std=c++17", "-O2", "-Wall", "-I`"$IncDir`"") + $Sources + @("-o", "`"$Output`"")
$Cmd  = "`"$GppPath`" $($Args -join ' ')"

Invoke-Expression $Cmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Compiled successfully: backend\bin\hospital_engine.exe" -ForegroundColor Green
} else {
    Write-Host "  ❌ Compilation failed." -ForegroundColor Red
    exit 1
}
