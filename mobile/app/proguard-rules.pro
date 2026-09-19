# ProGuard rules for CogniCare Android App

# Keep Retrofit models
-keep class com.cognicare.data.remote.** { *; }
-keep class com.cognicare.data.local.** { *; }

# Keep Room entities
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *

# Keep Gson TypeToken
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.reflect.TypeToken { *; }
-keep class * extends com.google.gson.reflect.TypeToken

# Retrofit
-keepattributes Exceptions
-dontwarn okhttp3.**
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}

# OkHttp
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# ML Kit
-keep class com.google.mlkit.** { *; }
-dontwarn com.google.mlkit.**

# Coil
-keep class coil.** { *; }

# Compose
-dontwarn androidx.compose.**

# Kotlin Serialization
-keepattributes *Default*
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keepclassmembers class com.cognicare.** {
    *** Companion;
}
-keepclasseswithmembers class com.cognicare.** {
    kotlinx.serialization.KSerializer serializer(...);
}
