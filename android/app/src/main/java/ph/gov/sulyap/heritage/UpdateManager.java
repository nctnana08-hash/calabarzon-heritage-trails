package ph.gov.sulyap.heritage;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

final class UpdateManager {
    private static final String MANIFEST_URL =
        "https://github.com/nctnana08-hash/calabarzon-heritage-trails/releases/latest/download/latest.json";
    private static final String RELEASES_URL =
        "https://github.com/nctnana08-hash/calabarzon-heritage-trails/releases/latest";
    private static final String PREFERENCES = "sulyap_updates";
    private static final String DISMISSED_VERSION = "dismissed_version_code";

    private final Activity activity;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final SharedPreferences preferences;
    private final DownloadManager downloadManager;
    private BroadcastReceiver downloadReceiver;
    private AlertDialog progressDialog;
    private ProgressBar progressBar;
    private TextView progressText;
    private long downloadId = -1;
    private String expectedSha256;
    private File pendingApk;

    UpdateManager(Activity activity) {
        this.activity = activity;
        this.preferences = activity.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
        this.downloadManager = (DownloadManager) activity.getSystemService(Context.DOWNLOAD_SERVICE);
    }

    void checkForUpdates(boolean requestedByUser) {
        executor.execute(() -> {
            try {
                HttpURLConnection connection = (HttpURLConnection) new URL(MANIFEST_URL).openConnection();
                connection.setConnectTimeout(15000);
                connection.setReadTimeout(15000);
                connection.setRequestProperty("Accept", "application/json");
                connection.setRequestProperty("User-Agent", "SulyapHeritageAndroid");
                if (connection.getResponseCode() < 200 || connection.getResponseCode() >= 300) {
                    throw new IllegalStateException("Update service returned " + connection.getResponseCode());
                }

                StringBuilder response = new StringBuilder();
                try (InputStream input = new BufferedInputStream(connection.getInputStream())) {
                    byte[] buffer = new byte[8192];
                    int count;
                    while ((count = input.read(buffer)) != -1) {
                        response.append(new String(buffer, 0, count, java.nio.charset.StandardCharsets.UTF_8));
                    }
                } finally {
                    connection.disconnect();
                }

                JSONObject manifest = new JSONObject(response.toString());
                long availableCode = manifest.getLong("versionCode");
                long installedCode = getInstalledVersionCode();
                long minimumCode = manifest.optLong("minimumSupportedVersion", 0);
                boolean mandatory = manifest.optBoolean("mandatoryUpdate", false) || installedCode < minimumCode;
                long dismissedCode = preferences.getLong(DISMISSED_VERSION, -1);

                if (availableCode <= installedCode) {
                    if (requestedByUser) showToast("Sulyap is already up to date.");
                    return;
                }
                if (!requestedByUser && !mandatory && dismissedCode == availableCode) return;

                activity.runOnUiThread(() -> showUpdateDialog(manifest, mandatory));
            } catch (Exception error) {
                if (requestedByUser) {
                    activity.runOnUiThread(() -> showError(
                        "Could not check for updates. Check your internet connection and try again."
                    ));
                }
            }
        });
    }

    private long getInstalledVersionCode() throws PackageManager.NameNotFoundException {
        PackageInfo info = activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0);
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.P ? info.getLongVersionCode() : info.versionCode;
    }

    private void showUpdateDialog(JSONObject manifest, boolean mandatory) {
        final long versionCode = manifest.optLong("versionCode", -1);
        final String versionName = manifest.optString("versionName", "New version");
        final String apkUrl = manifest.optString("apkDownloadUrl", "");
        final String checksum = manifest.optString("sha256", "");
        final String notes = formatReleaseNotes(manifest.opt("releaseNotes"));

        AlertDialog.Builder builder = new AlertDialog.Builder(activity)
            .setTitle("A New Sulyap Update Is Available!")
            .setMessage("Version " + versionName + "\n\nWhat's New:\n" + notes)
            .setPositiveButton("Update Now", (dialog, which) -> {
                if (apkUrl.isEmpty() || checksum.isEmpty()) {
                    showError("This release is missing its download link or security checksum.");
                    return;
                }
                startDownload(apkUrl, checksum, versionName);
            })
            .setNeutralButton("Release Details", (dialog, which) -> {
                String detailsUrl = manifest.optString("releaseDetailsUrl", RELEASES_URL);
                activity.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(detailsUrl)));
            });

        if (!mandatory) {
            builder.setNegativeButton("Remind Me Later", (dialog, which) ->
                preferences.edit().putLong(DISMISSED_VERSION, versionCode).apply()
            );
        }

        AlertDialog dialog = builder.create();
        dialog.setCancelable(!mandatory);
        dialog.setCanceledOnTouchOutside(!mandatory);
        dialog.show();
    }

    private String formatReleaseNotes(Object value) {
        if (value instanceof JSONArray) {
            JSONArray notes = (JSONArray) value;
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < notes.length(); i++) {
                if (i > 0) result.append('\n');
                result.append("• ").append(notes.optString(i));
            }
            return result.toString();
        }
        String text = String.valueOf(value == null ? "Performance and reliability improvements." : value);
        return text.trim().isEmpty() ? "Performance and reliability improvements." : text;
    }

    private void startDownload(String apkUrl, String checksum, String versionName) {
        if (downloadManager == null) {
            showError("Android's download service is unavailable.");
            return;
        }

        File downloadDirectory = activity.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (downloadDirectory == null) {
            showError("No update storage location is available.");
            return;
        }
        File destination = new File(downloadDirectory, "sulyap-" + versionName + ".apk");
        if (destination.exists() && !destination.delete()) {
            showError("An older update file could not be replaced.");
            return;
        }

        expectedSha256 = checksum.toLowerCase(Locale.US).replace("sha256:", "").trim();
        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(apkUrl))
            .setTitle("Sulyap " + versionName)
            .setDescription("Downloading verified app update")
            .setMimeType("application/vnd.android.package-archive")
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setAllowedOverMetered(true)
            .setAllowedOverRoaming(false)
            .setDestinationInExternalFilesDir(activity, Environment.DIRECTORY_DOWNLOADS, destination.getName());

        downloadId = downloadManager.enqueue(request);
        registerDownloadReceiver();
        showProgressDialog();
        handler.post(progressPoller);
    }

    private void registerDownloadReceiver() {
        if (downloadReceiver != null) return;
        downloadReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                long completedId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (completedId == downloadId) handleCompletedDownload();
            }
        };
        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            activity.registerReceiver(downloadReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            activity.registerReceiver(downloadReceiver, filter);
        }
    }

    private final Runnable progressPoller = new Runnable() {
        @Override
        public void run() {
            if (downloadId < 0 || downloadManager == null) return;
            try (android.database.Cursor cursor = downloadManager.query(
                new DownloadManager.Query().setFilterById(downloadId)
            )) {
                if (cursor != null && cursor.moveToFirst()) {
                    long downloaded = cursor.getLong(cursor.getColumnIndexOrThrow(
                        DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR
                    ));
                    long total = cursor.getLong(cursor.getColumnIndexOrThrow(
                        DownloadManager.COLUMN_TOTAL_SIZE_BYTES
                    ));
                    if (total > 0 && progressBar != null && progressText != null) {
                        int percent = (int) Math.min(100, downloaded * 100 / total);
                        progressBar.setProgress(percent);
                        progressText.setText("Downloading update… " + percent + "%");
                    }
                }
            } catch (Exception ignored) {
                // The completion receiver remains the source of truth.
            }
            handler.postDelayed(this, 500);
        }
    };

    private void showProgressDialog() {
        LinearLayout layout = new LinearLayout(activity);
        layout.setOrientation(LinearLayout.VERTICAL);
        int padding = (int) (24 * activity.getResources().getDisplayMetrics().density);
        layout.setPadding(padding, padding, padding, padding / 2);

        progressText = new TextView(activity);
        progressText.setText("Preparing secure download…");
        progressText.setTextColor(Color.DKGRAY);
        layout.addView(progressText, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        progressBar = new ProgressBar(activity, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        LinearLayout.LayoutParams progressParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        progressParams.topMargin = padding / 2;
        layout.addView(progressBar, progressParams);

        progressDialog = new AlertDialog.Builder(activity)
            .setTitle("Downloading Sulyap Update")
            .setView(layout)
            .setNegativeButton("Continue in Background", null)
            .create();
        progressDialog.show();
    }

    private void handleCompletedDownload() {
        handler.removeCallbacks(progressPoller);
        if (progressDialog != null) progressDialog.dismiss();

        try (android.database.Cursor cursor = downloadManager.query(
            new DownloadManager.Query().setFilterById(downloadId)
        )) {
            if (cursor == null || !cursor.moveToFirst()) throw new IllegalStateException("Download not found");
            int status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
            if (status != DownloadManager.STATUS_SUCCESSFUL) throw new IllegalStateException("Download failed");
            String localUri = cursor.getString(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_LOCAL_URI));
            File apk = new File(Uri.parse(localUri).getPath());
            verifyAndInstall(apk);
        } catch (Exception error) {
            showError("The update download failed. Please try again.");
        } finally {
            downloadId = -1;
        }
    }

    private void verifyAndInstall(File apk) {
        executor.execute(() -> {
            try {
                String actual = sha256(apk);
                if (!actual.equalsIgnoreCase(expectedSha256)) {
                    if (!apk.delete()) apk.deleteOnExit();
                    throw new SecurityException("Checksum mismatch");
                }
                pendingApk = apk;
                activity.runOnUiThread(this::installPendingUpdate);
            } catch (Exception error) {
                activity.runOnUiThread(() -> showError(
                    "The downloaded update failed its security check and was removed."
                ));
            }
        });
    }

    private String sha256(File file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream input = new FileInputStream(file)) {
            byte[] buffer = new byte[8192];
            int count;
            while ((count = input.read(buffer)) != -1) digest.update(buffer, 0, count);
        }
        StringBuilder result = new StringBuilder();
        for (byte value : digest.digest()) result.append(String.format(Locale.US, "%02x", value));
        return result.toString();
    }

    void installPendingUpdate() {
        if (pendingApk == null || !pendingApk.exists()) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !activity.getPackageManager().canRequestPackageInstalls()) {
            Toast.makeText(
                activity,
                "Allow Sulyap to install this verified update, then return to the app.",
                Toast.LENGTH_LONG
            ).show();
            Intent permission = new Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + activity.getPackageName())
            );
            activity.startActivity(permission);
            return;
        }

        Uri contentUri = FileProvider.getUriForFile(
            activity,
            activity.getPackageName() + ".fileprovider",
            pendingApk
        );
        Intent install = new Intent(Intent.ACTION_VIEW)
            .setDataAndType(contentUri, "application/vnd.android.package-archive")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        activity.startActivity(install);
        pendingApk = null;
    }

    private void showError(String message) {
        new AlertDialog.Builder(activity)
            .setTitle("Update Unavailable")
            .setMessage(message)
            .setPositiveButton("OK", null)
            .show();
    }

    private void showToast(String message) {
        activity.runOnUiThread(() -> Toast.makeText(activity, message, Toast.LENGTH_LONG).show());
    }

    void destroy() {
        handler.removeCallbacks(progressPoller);
        executor.shutdownNow();
        if (downloadReceiver != null) {
            try {
                activity.unregisterReceiver(downloadReceiver);
            } catch (IllegalArgumentException ignored) {
                // Receiver had already been unregistered by Android.
            }
            downloadReceiver = null;
        }
    }
}
