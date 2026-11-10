# SulyapPH Android APK Build Script
$ErrorActionPreference = "Stop"

$root = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $root

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SulyapPH Android Native APK Builder    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Resolve JDK and Android SDK
$jdkBin = "C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot\bin"
if (-not (Test-Path "$jdkBin\javac.exe")) {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\javac.exe")) {
        $jdkBin = "$env:JAVA_HOME\bin"
    }
}

$androidSdk = "$env:LOCALAPPDATA\Android\Sdk"
$buildTools = "$androidSdk\build-tools\36.0.0"
if (-not (Test-Path $buildTools)) {
    $buildTools = "$androidSdk\build-tools\35.0.0"
}
$androidJar = "$androidSdk\platforms\android-36\android.jar"
if (-not (Test-Path $androidJar)) {
    $androidJar = "$androidSdk\platforms\android-35\android.jar"
}

Write-Host "[1/7] Toolchain resolved:" -ForegroundColor Green
Write-Host "  JDK: $jdkBin"
Write-Host "  Android SDK: $buildTools"
Write-Host "  Target Platform: $androidJar"

# 2. Setup Build Workspace
$buildDir = "$root\build-android"
if (Test-Path $buildDir) { Remove-Item -Recurse -Force $buildDir }
New-Item -ItemType Directory -Path "$buildDir\res-compiled" -Force | Out-Null
New-Item -ItemType Directory -Path "$buildDir\gen" -Force | Out-Null
New-Item -ItemType Directory -Path "$buildDir\classes" -Force | Out-Null
New-Item -ItemType Directory -Path "$buildDir\dex" -Force | Out-Null
New-Item -ItemType Directory -Path "$root\public\downloads" -Force | Out-Null

# 3. Compile Android Resources (aapt2 compile)
Write-Host "[2/7] Compiling Android resources with AAPT2..." -ForegroundColor Green
& "$buildTools\aapt2.exe" compile --dir "$root\android\app\src\main\res" -o "$buildDir\resources.zip"
if ($LASTEXITCODE -ne 0) { throw "AAPT2 compile failed" }

# 4. Link Resources and Manifest (aapt2 link)
Write-Host "[3/7] Linking package resources and generating R.java..." -ForegroundColor Green
& "$buildTools\aapt2.exe" link -I "$androidJar" `
    --manifest "$root\android\app\src\main\AndroidManifest.xml" `
    -o "$buildDir\unaligned.apk" `
    -A "$root\android\app\src\main\assets" `
    --java "$buildDir\gen" `
    --auto-add-overlay `
    "$buildDir\resources.zip"
if ($LASTEXITCODE -ne 0) { throw "AAPT2 link failed" }

# 5. Compile Java Sources
Write-Host "[4/7] Compiling Java source files with javac..." -ForegroundColor Green
$javaFiles = Get-ChildItem -Path "$root\android\app\src\main\java", "$buildDir\gen" -Recurse -Filter *.java | ForEach-Object { $_.FullName }
& "$jdkBin\javac.exe" -d "$buildDir\classes" -cp "$androidJar;$buildDir\gen" $javaFiles
if ($LASTEXITCODE -ne 0) { throw "javac compilation failed" }

# 6. Convert Classes to Dalvik Executable (d8)
Write-Host "[5/7] Converting bytecode to classes.dex with D8..." -ForegroundColor Green
$classFiles = Get-ChildItem -Path "$buildDir\classes" -Recurse -Filter *.class | ForEach-Object { $_.FullName }
& "$buildTools\d8.bat" --lib "$androidJar" --output "$buildDir\dex" $classFiles
if ($LASTEXITCODE -ne 0) { throw "D8 dex compilation failed" }

# Add classes.dex into unaligned.apk
& "$jdkBin\jar.exe" uf "$buildDir\unaligned.apk" -C "$buildDir\dex" classes.dex
if ($LASTEXITCODE -ne 0) { throw "Adding classes.dex into APK failed" }

# 7. Zip-Align APK
Write-Host "[6/7] Aligning APK with zipalign..." -ForegroundColor Green
& "$buildTools\zipalign.exe" -f -p 4 "$buildDir\unaligned.apk" "$buildDir\aligned.apk"
if ($LASTEXITCODE -ne 0) { throw "zipalign failed" }

# 8. Create Release Keystore & Sign APK
Write-Host "[7/7] Signing release APK with apksigner..." -ForegroundColor Green
$keystore = "$root\android\sulyap-release.keystore"
if (-not (Test-Path $keystore)) {
    Write-Host "  Generating release signing keystore..." -ForegroundColor Yellow
    & "$jdkBin\keytool.exe" -genkeypair -v `
        -keystore "$keystore" `
        -storepass "sulyap123" `
        -keypass "sulyap123" `
        -alias "sulyap" `
        -keyalg "RSA" `
        -keysize 2048 `
        -validity 10000 `
        -dname "CN=Sulyap Heritage, OU=CALABARZON, O=GovPH, L=Manila, ST=NCR, C=PH"
}

$finalApk = "$root\public\downloads\sulyap-calabarzon.apk"
& "$buildTools\apksigner.bat" sign `
    --ks "$keystore" `
    --ks-pass "pass:sulyap123" `
    --ks-key-alias "sulyap" `
    --key-pass "pass:sulyap123" `
    --out "$finalApk" `
    "$buildDir\aligned.apk"
if ($LASTEXITCODE -ne 0) { throw "apksigner failed" }

# Verify Signature
Write-Host "Verifying signed APK integrity..." -ForegroundColor Cyan
& "$buildTools\apksigner.bat" verify --verbose "$finalApk"

# Clean build directory
Remove-Item -Recurse -Force $buildDir -ErrorAction SilentlyContinue

$apkInfo = Get-Item $finalApk
$apkSizeMB = [math]::Round($apkInfo.Length / 1MB, 2)

Write-Host "==========================================" -ForegroundColor Green
Write-Host " SUCCESS: Android APK Built & Ready!" -ForegroundColor Green
Write-Host " Output: $finalApk ($apkSizeMB MB)" -ForegroundColor Green
Write-Host " Direct Web URL: /downloads/sulyap-calabarzon.apk" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
