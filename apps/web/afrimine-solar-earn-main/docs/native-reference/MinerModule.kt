/**
 * REFERENCE FILE — Copy to apps/native/android/app/src/main/java/com/afrimine/miner/MinerModule.kt
 * This is NOT executed by Lovable. For Android Studio / VS Code only.
 */

package com.afrimine.miner

import android.content.Intent
import com.facebook.react.bridge.*

class MinerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "MinerModule"

    @ReactMethod
    fun startMining(wallet: String, pool: String, promise: Promise) {
        val intent = Intent(reactApplicationContext, MinerService::class.java)
        intent.putExtra("wallet", wallet)
        intent.putExtra("pool", pool)
        reactApplicationContext.startForegroundService(intent)
        promise.resolve(true)
    }

    @ReactMethod
    fun stopMining(promise: Promise) {
        val intent = Intent(reactApplicationContext, MinerService::class.java)
        reactApplicationContext.stopService(intent)
        promise.resolve(true)
    }
}
