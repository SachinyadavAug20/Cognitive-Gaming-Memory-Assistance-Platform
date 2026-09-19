package com.cognicare.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import androidx.compose.runtime.Immutable
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import com.cognicare.util.PatientMediaManager

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val CanvasBg = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val WarmSurface = Color(0xFFFFFDF9)

@Immutable
data class DemoPatientOption(
    val id: Long,
    val name: String,
    val age: Int,
    val state: String,
    val language: String,
    val role: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onScanQR: () -> Unit,
    onDemoLogin: () -> Unit,
    onSelectDemoPatient: (Long) -> Unit = { onDemoLogin() }
) {
    val context = LocalContext.current
    var showAllPatients by remember { mutableStateOf(false) }

    val demoPatients = remember {
        listOf(
            DemoPatientOption(1L, "Biren Borah", 72, "Assam", "as", "Primary Trial Patient"),
            DemoPatientOption(2L, "Mary Nongrum", 68, "Meghalaya", "kha", "Khasi Choir Singer"),
            DemoPatientOption(3L, "Ibochouba Singh", 74, "Manipur", "mni", "Manipuri Weaver"),
            DemoPatientOption(4L, "Lalhmingmawii Sailo", 70, "Mizoram", "lus", "Mizo Folk Storyteller"),
            DemoPatientOption(5L, "Kevichusa Angami", 76, "Nagaland", "en", "Kohima Elder")
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(CanvasBg)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Top MDoNER Badge
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = Color(0xFFDCFCE7),
            modifier = Modifier.border(1.5.dp, TeaGreen, RoundedCornerShape(12.dp))
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "🏛️", fontSize = 14.sp)
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "MDoNER • North East Memory Care Platform",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Black,
                    color = TeaGreen
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Logo & Title
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .shadow(3.dp, CircleShape)
                    .clip(CircleShape)
                    .background(TeaGreen)
                    .border(2.5.dp, Ink, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "🧠", fontSize = 28.sp)
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
                Text(
                    text = "CogniCare",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Serif,
                    color = Ink,
                    lineHeight = 34.sp
                )
                Text(
                    text = "Clinical Memory Therapy",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = InkSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Large Elder-Friendly Welcome Text
        Text(
            text = "Welcome Back! ☀️",
            fontSize = 30.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Serif,
            color = Ink,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = "Ready for your daily brain games and family memories?",
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            color = InkSecondary,
            textAlign = TextAlign.Center,
            lineHeight = 22.sp
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Voice Assistance Pill — BIGGER for elderly, 48dp touch target
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier
                .height(48.dp)
                .shadow(3.dp, RoundedCornerShape(16.dp))
                .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
                .semantics { contentDescription = "Tap to hear voice guide instructions" }
                .clickable {
                    ElderlyFeedback.onTap(context)
                    LocalizationManager.speak("Welcome to CogniCare. Tap the green card to enter your daily session as Biren Borah, or tap the orange button below to scan your QR health card.")
                }
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 18.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Filled.VolumeUp, contentDescription = "Voice Guide", tint = TeaGreen, modifier = Modifier.size(26.dp))
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "Tap to listen: Voice Guide",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Ink
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // 1. PRIMARY ONE-TOUCH DEMO PATIENT CARD (Biren Borah)
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(4.dp, RoundedCornerShape(22.dp))
                .border(3.dp, Ink, RoundedCornerShape(22.dp)),
            shape = RoundedCornerShape(22.dp),
            color = WarmSurface
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                // Header badge
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFFDCFCE7),
                        modifier = Modifier.border(1.5.dp, TeaGreen, RoundedCornerShape(8.dp))
                    ) {
                        Text(
                            text = "⚡ Instant Patient Entry",
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black,
                            color = TeaGreen
                        )
                    }
                    Text(
                        text = "1-Touch Demo",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = InkSecondary
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Patient Profile Snippet
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val profilePhoto = PatientMediaManager.getProfilePhoto(1L)
                    Image(
                        painter = rememberAsyncImagePainter(
                            ImageRequest.Builder(context)
                                .data("file:///android_asset/$profilePhoto")
                                .crossfade(true)
                                .build()
                        ),
                        contentDescription = "Biren Borah",
                        modifier = Modifier
                            .size(76.dp)
                            .shadow(3.dp, RoundedCornerShape(20.dp))
                            .clip(RoundedCornerShape(20.dp))
                            .border(2.5.dp, Ink, RoundedCornerShape(20.dp))
                            .background(Color.White),
                        contentScale = ContentScale.Crop
                    )

                    Spacer(modifier = Modifier.width(16.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Biren Borah",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Serif,
                            color = Ink
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Age 72 • Guwahati, Assam",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkSecondary
                        )
                        Text(
                            text = "Language: Assamese (অসমীয়া)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = TeaGreen
                        )
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Big 1-Tap Entry Button — 68dp height, huge text, semantic label
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(68.dp)
                        .shadow(4.dp, RoundedCornerShape(18.dp))
                        .border(3.dp, Ink, RoundedCornerShape(18.dp))
                        .semantics { contentDescription = "Start session as Biren Borah" }
                        .clickable {
                            ElderlyFeedback.onTap(context)
                            onSelectDemoPatient(1L)
                        },
                    shape = RoundedCornerShape(18.dp),
                    color = TeaGreen
                ) {
                    Row(
                        modifier = Modifier.fillMaxSize(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Filled.Person, contentDescription = null, tint = Color.White, modifier = Modifier.size(28.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "START BIREN'S SESSION →",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                // Switch Patient Accordion
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showAllPatients = !showAllPatients }
                        .padding(vertical = 10.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (showAllPatients) "▲ Hide other regional patients" else "▼ Switch to other North-East patient demo",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = InkSecondary
                    )
                }

                if (showAllPatients) {
                    Spacer(modifier = Modifier.height(10.dp))
                    demoPatients.filter { it.id != 1L }.forEach { patient ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .shadow(1.dp, RoundedCornerShape(12.dp))
                                .border(1.5.dp, Ink, RoundedCornerShape(12.dp))
                                .clickable {
                                    ElderlyFeedback.onTap(context)
                                    onSelectDemoPatient(patient.id)
                                },
                            shape = RoundedCornerShape(12.dp),
                            color = Color.White
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Image(
                                    painter = rememberAsyncImagePainter("file:///android_asset/${PatientMediaManager.getProfilePhoto(patient.id)}"),
                                    contentDescription = patient.name,
                                    modifier = Modifier
                                        .size(44.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .border(1.5.dp, Ink, RoundedCornerShape(10.dp)),
                                    contentScale = ContentScale.Crop
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(text = patient.name, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Ink)
                                    Text(text = "${patient.state} • ${patient.role}", fontSize = 12.sp, color = InkSecondary)
                                }
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = TeaGreen
                                ) {
                                    Text(
                                        text = "Select",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 2. KIOSK QR HEALTH CARD SCANNER CARD
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(4.dp, RoundedCornerShape(22.dp))
                .border(3.dp, Ink, RoundedCornerShape(22.dp)),
            shape = RoundedCornerShape(22.dp),
            color = Color.White
        ) {
            Column {
                // Orange header matching web kiosk
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Marigold)
                        .border(width = 0.dp, color = Color.Transparent)
                        .padding(16.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "📷", fontSize = 28.sp)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Kiosk QR Health Card",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                            Text(
                                text = "Ayushman Bharat (ABDM) Compatible",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White.copy(alpha = 0.85f)
                            )
                        }
                    }
                }

                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Hold up the patient's laminated QR health card or clinic appointment slip in front of the camera.",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = InkSecondary,
                        lineHeight = 20.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(58.dp)
                            .shadow(3.dp, RoundedCornerShape(14.dp))
                            .border(2.5.dp, Ink, RoundedCornerShape(14.dp))
                            .semantics { contentDescription = "Open camera to scan QR health card" }
                            .clickable {
                                ElderlyFeedback.onTap(context)
                                onScanQR()
                            },
                        shape = RoundedCornerShape(14.dp),
                        color = Marigold
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Filled.QrCodeScanner, contentDescription = null, tint = Color.White, modifier = Modifier.size(24.dp))
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "OPEN CAMERA SCANNER",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Clinical Footer
        Text(
            text = "CogniCare CDTx • Ministry of Development of North Eastern Region (MDoNER)\nSmart India Hackathon 2026 // Clinical Trial Prototype",
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = InkSecondary,
            textAlign = TextAlign.Center,
            lineHeight = 20.sp
        )

        Spacer(modifier = Modifier.height(16.dp))
    }
}
