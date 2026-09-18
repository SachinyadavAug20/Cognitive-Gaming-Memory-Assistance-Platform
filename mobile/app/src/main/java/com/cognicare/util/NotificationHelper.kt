package com.cognicare.util

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.cognicare.MainActivity

object NotificationHelper {

    private const val CHANNEL_ID = "cognicare_patient_channel"
    private const val CHANNEL_NAME = "CogniCare Daily Routine & Health"
    private const val CHANNEL_DESC = "Reminders for medication, water, daily brain exercises, and family care."

    fun initChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESC
                enableVibration(true)
                enableLights(true)
            }
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun hasNotificationPermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    fun sendNotification(
        context: Context,
        id: Int,
        title: String,
        message: String,
        subText: String? = "CogniCare Patient Care"
    ) {
        initChannel(context)
        if (!hasNotificationPermission(context)) return

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setSubText(subText)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))

        try {
            NotificationManagerCompat.from(context).notify(id, builder.build())
        } catch (_: SecurityException) { }
    }

    fun sendMedicineReminder(context: Context, medicine: String = "Morning BP Medicine") {
        sendNotification(
            context = context,
            id = 101,
            title = "⏰ Time for Your Medicine",
            message = "Please take your $medicine with a fresh glass of water. Stay healthy and safe!"
        )
    }

    fun sendHydrationReminder(context: Context) {
        sendNotification(
            context = context,
            id = 102,
            title = "💧 Time for Fresh Water",
            message = "A glass of clean water helps your memory and energy stay strong today."
        )
    }

    fun sendDailyExercisePrompt(context: Context, patientName: String) {
        sendNotification(
            context = context,
            id = 103,
            title = "✨ Good Day, $patientName!",
            message = "Your daily brain exercises and family memories are ready for you. Tap to begin!"
        )
    }
}
