param(
    [int]$VersionCode = 1,
    [string]$VersionName = "1.0.0"
)

$ErrorActionPreference = "Stop"
$projectRoot = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $projectRoot

$requiredVariables = @(
    "ANDROID_KEYSTORE_PATH",
    "ANDROID_KEYSTORE_PASSWORD",
    "ANDROID_KEY_ALIAS",
    "ANDROID_KEY_PASSWORD"
)

foreach ($variableName in $requiredVariables) {
    $value = [Environment]::GetEnvironmentVariable($variableName)
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "Missing $variableName. Release builds require the existing Sulyap signing identity."
    }
}

$keystorePath = [Environment]::GetEnvironmentVariable("ANDROID_KEYSTORE_PATH")
if (-not (Test-Path -LiteralPath $keystorePath -PathType Leaf)) {
    throw "ANDROID_KEYSTORE_PATH does not point to a readable keystore file."
}

$gradleCommand = Get-Command gradle -ErrorAction SilentlyContinue
if (-not $gradleCommand) {
    throw "Gradle is not installed. Install Gradle 8.9 or use the GitHub Actions workflow."
}

Write-Host "Building signed Sulyap APK and AAB (version $VersionName, code $VersionCode)..." -ForegroundColor Cyan
& $gradleCommand.Source :app:clean :app:assembleRelease :app:bundleRelease `
    "-PsulyapVersionCode=$VersionCode" `
    "-PsulyapVersionName=$VersionName"
if ($LASTEXITCODE -ne 0) { throw "Android release build failed." }

$apkSource = Join-Path $projectRoot "android\app\build\outputs\apk\release\app-release.apk"
$aabSource = Join-Path $projectRoot "android\app\build\outputs\bundle\release\app-release.aab"
$outputDirectory = Join-Path $projectRoot "build-android"
$publicDirectory = Join-Path $projectRoot "public\downloads"

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
New-Item -ItemType Directory -Path $publicDirectory -Force | Out-Null
Copy-Item -LiteralPath $apkSource -Destination (Join-Path $outputDirectory "sulyap-release.apk") -Force
Copy-Item -LiteralPath $aabSource -Destination (Join-Path $outputDirectory "sulyap-release.aab") -Force
Copy-Item -LiteralPath $apkSource -Destination (Join-Path $publicDirectory "sulyap-release.apk") -Force

Write-Host "Signed release outputs:" -ForegroundColor Green
Write-Host "  build-android\sulyap-release.apk"
Write-Host "  build-android\sulyap-release.aab"
