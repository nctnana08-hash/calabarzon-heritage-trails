# Sulyap Android releases

Sulyap's production Android application is the Java WebView wrapper in `android/app` with application ID
`ph.gov.sulyap.heritage`. The separate `mobile/` React Native project is retained for experimentation, but it is
not used by the automated production release workflow.

## One-time GitHub setup

Add these Actions secrets in the GitHub repository settings:

- `ANDROID_KEYSTORE_BASE64` — base64 content of the existing Sulyap release keystore
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Use the existing ignored `android/sulyap-release.keystore` if installed copies of Sulyap were signed with it.
Changing the signing identity prevents Android from updating those installations in place. Do not commit the
keystore or any password.

The `Validate and build Sulyap Android` workflow performs web lint/tests/build and an Android debug APK/AAB build
for pushes and pull requests. A push to `main`, a `v*` tag, or a manual run also builds signed release files,
publishes a GitHub Release, and generates `latest.json` with version, release notes, URLs, date, and APK SHA-256.

`versionCode` is the monotonically increasing GitHub Actions run number. Main-branch releases use
`1.0.<run number>`; a tag such as `v1.2.0` uses `1.2.0` as `versionName`.

## Updating behavior

The native wrapper checks the stable latest-release manifest when it opens. It compares Android version codes,
suppresses a dismissed version until a newer release exists, downloads the APK through Android's download service,
verifies SHA-256, and opens Android's package installer. Android still requires the user's confirmation and may ask
them to allow installs from Sulyap. The app never performs silent installation.

The AAB is for Google Play and is not directly installable. If Sulyap moves to Play-managed distribution, replace
direct APK updating with Google Play In-App Updates while preserving the same application ID and signing lineage.

## Local signed build

Install JDK 17, Android SDK 35, and Gradle 8.9. Set `ANDROID_KEYSTORE_PATH`,
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`, then run:

```powershell
npm run build:android -- -VersionCode 2 -VersionName 1.0.1
```

Outputs are written to `build-android/sulyap-release.apk` and `build-android/sulyap-release.aab`.

## Database setup for administrators and panorama tours

Apply `drizzle/migrations/0003_sulyap_panorama_tours.sql` through the connected Supabase/Lovable database.
Then bootstrap the first administrator from a trusted SQL or service-role session:

```sql
insert into public.sulyap_admins (user_id)
values ('AUTH_USER_UUID');
```

After that, administrator status is database-controlled. It is not inferred from email addresses or signup
metadata. The migration also changes destination and image writes from anonymous prototype access to authorized
administrator access. Verify this migration in a staging Supabase project before production deployment.
