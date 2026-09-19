package com.cognicare.util

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

object HapticUtil {
    private val doubleTapExecutor = Executors.newSingleThreadScheduledExecutor()

    private fun getVibrator(context: Context): Vibrator? {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                manager.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }
        } catch (_: Exception) { null }
    }

    fun vibrate(context: Context, durationMs: Long = 50) {
        val vibrator = getVibrator(context) ?: return
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(durationMs)
            }
        } catch (_: Exception) { }
    }

    fun vibrateTap(context: Context) = vibrate(context, 30)

    fun vibrateSuccess(context: Context) {
        vibrate(context, 80)
    }

    fun vibrateError(context: Context) {
        vibrate(context, 200)
    }

    fun vibrateDoubleTap(context: Context) {
        vibrate(context, 40)
        doubleTapExecutor.schedule({ vibrate(context, 40) }, 60, TimeUnit.MILLISECONDS)
    }
}

/**
 * Triple-feedback system for elderly users: Audio + Visual + Haptic
 * Every interactive element should call one of these methods.
 */
object ElderlyFeedback {

    private val toneExecutor = Executors.newSingleThreadExecutor()
    @Volatile private var sharedToneGenerator: ToneGenerator? = null

    private fun getToneGenerator(): ToneGenerator {
        sharedToneGenerator?.let { return it }
        synchronized(this) {
            sharedToneGenerator?.let { return it }
            val tg = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 80)
            sharedToneGenerator = tg
            return tg
        }
    }

    fun onTap(context: Context) {
        HapticUtil.vibrateTap(context)
        playTone(ToneType.TAP)
    }

    fun onSuccess(context: Context) {
        HapticUtil.vibrateSuccess(context)
        playTone(ToneType.SUCCESS)
    }

    fun onError(context: Context) {
        HapticUtil.vibrateError(context)
        playTone(ToneType.ERROR)
    }

    fun onNavigate(context: Context) {
        HapticUtil.vibrateTap(context)
        playTone(ToneType.NAVIGATE)
    }

    fun onAchievement(context: Context) {
        HapticUtil.vibrateDoubleTap(context)
        playTone(ToneType.ACHIEVEMENT)
    }

    private enum class ToneType {
        TAP, SUCCESS, ERROR, NAVIGATE, ACHIEVEMENT
    }

    private fun playTone(type: ToneType) {
        toneExecutor.submit {
            try {
                val tg = getToneGenerator()
                when (type) {
                    ToneType.TAP -> tg.startTone(ToneGenerator.TONE_PROP_BEEP, 60)
                    ToneType.SUCCESS -> tg.startTone(ToneGenerator.TONE_PROP_ACK, 120)
                    ToneType.ERROR -> tg.startTone(ToneGenerator.TONE_PROP_NACK, 200)
                    ToneType.NAVIGATE -> tg.startTone(ToneGenerator.TONE_PROP_BEEP2, 80)
                    ToneType.ACHIEVEMENT -> tg.startTone(ToneGenerator.TONE_PROP_ACK, 300)
                }
            } catch (_: Exception) { }
        }
    }

    fun release() {
        toneExecutor.submit {
            sharedToneGenerator?.release()
            sharedToneGenerator = null
        }
    }
}
