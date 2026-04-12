/**
 * REFERENCE FILE — Copy to apps/native/android/app/src/main/java/com/afrimine/miner/MinerService.kt
 * This is NOT executed by Lovable. For Android Studio / VS Code only.
 */

package com.afrimine.miner

import android.app.*
import android.content.*
import android.os.*
import androidx.core.app.NotificationCompat
import java.io.File
import java.io.FileOutputStream

class MinerService : Service() {

    private var process: Process? = null
    private var isRunning = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startForeground(1, createNotification("AfriMine running..."))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val wallet = intent?.getStringExtra("wallet") ?: return START_NOT_STICKY
        val pool = intent.getStringExtra("pool") ?: return START_NOT_STICKY
        startMining(wallet, pool)
        return START_STICKY
    }

    private fun startMining(wallet: String, pool: String) {
        if (isRunning) return

        val xmrigFile = File(filesDir, "xmrig")
        if (!xmrigFile.exists()) {
            assets.open("xmrig").use { input ->
                FileOutputStream(xmrigFile).use { output ->
                    input.copyTo(output)
                }
            }
            xmrigFile.setExecutable(true)
        }

        val threads = if (isCharging()) 6 else 3

        val command = arrayOf(
            xmrigFile.absolutePath,
            "-o", pool,
            "-u", wallet,
            "-k",
            "--threads=$threads"
        )

        process = Runtime.getRuntime().exec(command)
        isRunning = true
    }

    private fun isCharging(): Boolean {
        val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        val status = registerReceiver(null, filter)
        val chargeStatus = status?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        return chargeStatus == BatteryManager.BATTERY_STATUS_CHARGING ||
               chargeStatus == BatteryManager.BATTERY_STATUS_FULL
    }

    private fun createNotification(text: String): Notification {
        val channelId = "miner_channel"
        val manager = getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(channelId, "Mining Service", NotificationManager.IMPORTANCE_LOW)
        manager.createNotificationChannel(channel)

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("AfriMine Active")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .build()
    }

    override fun onDestroy() {
        process?.destroy()
        isRunning = false
        super.onDestroy()
    }
}
