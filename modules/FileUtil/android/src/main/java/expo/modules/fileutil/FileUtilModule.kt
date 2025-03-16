package expo.modules.fileutil

import android.Manifest
import android.os.Build
import android.os.Environment
import android.content.pm.PackageManager
import android.provider.Settings
import android.net.Uri
import android.content.Intent
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.io.File
import android.util.Log
import java.net.URL

class FileUtilModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("FileUtil")

    AsyncFunction("RequestStoragePermission") { promise: Promise ->
      val activity = appContext.currentActivity ?: run {
        promise.reject("E_NO_ACTIVITY", "No current activity", null)
        return@AsyncFunction
      }

      when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.R -> {
          if (Environment.isExternalStorageManager()) {
            promise.resolve(true)
          } else {
            val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
              data = Uri.parse("package:${activity.packageName}")
            }
            activity.startActivityForResult(intent, 1)
            promise.resolve(false)
          }
        }
        ContextCompat.checkSelfPermission(activity, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED -> {
          promise.resolve(true)
        }
        else -> {
          activity.requestPermissions(arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE), 1)
          promise.resolve(false)
        }
      }
    }

    AsyncFunction("ScanFiles") { promise: Promise ->
      val storageDir = Environment.getExternalStorageDirectory()
      val epubFiles = mutableListOf<String>()

      fun scanDirectory(directory: File) {
        directory.listFiles()?.forEach { file ->
          if (file.isDirectory) {
            scanDirectory(file)
          } else if (file.extension.equals("epub", ignoreCase = true)) {
            epubFiles.add(file.absolutePath)
          }
        }
      }

      scanDirectory(storageDir)
      promise.resolve(epubFiles)
    }
  }
}
