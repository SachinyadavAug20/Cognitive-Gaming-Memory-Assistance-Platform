package com.cognicare.util

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

object HapticUtil {
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
        Thread.sleep(60)
        vibrate(context, 40)
    }
}

/**
 * Triple-feedback system for elderly users: Audio + Visual + Haptic
 * Every interactive element should call one of these methods.
 */
object ElderlyFeedback {

    /**
     * Standard tap feedback — light haptic + soft click sound
     */
    fun onTap(context: Context) {
        HapticUtil.vibrateTap(context)
        playTone(context, ToneType.TAP)
    }

    /**
     * Success feedback — green flash + success chime + medium haptic
     */
    fun onSuccess(context: Context) {
        HapticUtil.vibrateSuccess(context)
        playTone(context, ToneType.SUCCESS)
    }

    /**
     * Error feedback — red flash + error buzz + heavy haptic
     */
    fun onError(context: Context) {
        HapticUtil.vibrateError(context)
        playTone(context, ToneType.ERROR)
    }

    /**
     * Navigation feedback — soft click + light haptic
     */
    fun onNavigate(context: Context) {
        HapticUtil.vibrateTap(context)
        playTone(context, ToneType.NAVIGATE)
    }

    /**
     * Achievement feedback — celebratory sound + double haptic
     */
    fun onAchievement(context: Context) {
        HapticUtil.vibrateDoubleTap(context)
        playTone(context, ToneType.ACHIEVEMENT)
    }

    private enum class ToneType {
        TAP, SUCCESS, ERROR, NAVIGATE, ACHIEVEMENT
    }

    private fun playTone(context: Context, type: ToneType) {
        try {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            if (audioManager.ringerMode == AudioManager.RINGER_MODE_SILENT) return

            val toneGenerator = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 80)
            when (type) {
                ToneType.TAP -> toneGenerator.startTone(ToneGenerator.TONE_PROP_BEEP, 60)
                ToneType.SUCCESS -> toneGenerator.startTone(ToneGenerator.TONE_PROP_ACK, 120)
                ToneType.ERROR -> toneGenerator.startTone(ToneGenerator.TONE_PROP_NACK, 200)
                ToneType.NAVIGATE -> toneGenerator.startTone(ToneGenerator.TONE_PROP_BEEP2, 80)
                ToneType.ACHIEVEMENT -> {
                    toneGenerator.startTone(ToneGenerator.TONE_PROP_APPLAUSE, 300)
                }
            }
            // Release after tone completes
            Thread {
                Thread.sleep(400)
                toneGenerator.release()
            }.start()
        } catch (_: Exception) { }
    }
}
