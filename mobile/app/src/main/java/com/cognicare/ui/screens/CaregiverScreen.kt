package com.cognicare.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.cognicare.data.local.Patient
import com.cognicare.ui.components.CogniCareDrawerContent
import com.cognicare.ui.components.CogniCareTopBar
import com.cognicare.ui.theme.*
import kotlinx.coroutines.launch

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val Brick = Color(0xFFC5221F)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CaregiverScreen(
    patient: Patient,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)

    val scope = rememberCoroutineScope()
    var fontSize by remember { mutableFloatStateOf(18f) }
    var language by remember { mutableStateOf(patient.language.ifEmpty { "en" }) }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            CogniCareDrawerContent(
                currentFontSize = fontSize,
                onFontSizeChange = { fontSize = it },
                currentLanguage = language,
                onLanguageChange = { language = it },
                isReadAloudEnabled = false,
                onReadAloudToggle = { },
                isNightModeEnabled = false,
                onNightModeToggle = { },
                patientName = patient.name,
                patientState = patient.state.ifEmpty { "Assam" },
                onCaregiverClick = { },
                onSosClick = {
                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108"))
                    context.startActivity(intent)
                },
                onLogout = { }
            )
        }
    ) {
        Scaffold(
            topBar = {
                CogniCareTopBar(
                    onBackClick = onBack,
                    onMenuClick = { scope.launch { drawerState.open() } }
                )
            },
            contentWindowInsets = WindowInsets(0, 0, 0, 0)
        ) { padding ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(Canvas),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Patient summary card
                item {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(4.dp, RoundedCornerShape(24.dp))
                            .border(3.dp, Ink, RoundedCornerShape(24.dp)),
                        shape = RoundedCornerShape(24.dp),
                        color = TeaGreen
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            val photoPath = getPatientPhotoPath(patient)
                            if (photoPath != null) {
                                val painter = rememberAsyncImagePainter(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data("file:///android_asset/$photoPath")
                                        .crossfade(true)
                                        .build()
                                )
                                Image(
                                    painter = painter,
                                    contentDescription = patient.name,
                                    modifier = Modifier
                                        .size(64.dp)
                                        .shadow(3.dp, CircleShape)
                                        .clip(CircleShape)
                                        .border(3.dp, Color.White.copy(alpha = 0.3f), CircleShape),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                Box(
                                    modifier = Modifier
                                        .size(64.dp)
                                        .shadow(3.dp, CircleShape)
                                        .clip(CircleShape)
                                        .border(3.dp, Color.White.copy(alpha = 0.3f), CircleShape)
                                        .background(Marigold),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = patient.name.first().toString(),
                                        fontSize = 28.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text(
                                    text = patient.name,
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White
                                )
                                Text(
                                    text = "${patient.age} years \u2022 ${patient.state}",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color.White.copy(alpha = 0.75f)
                                )
                            }
                        }
                    }
                }

                // Activity Summary
                item {
                    Text(
                        text = "Activity Summary",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        color = Ink,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        StatCard(title = "Games Today", value = "3", icon = Icons.Default.Gamepad, color = TeaGreen, modifier = Modifier.weight(1f))
                        StatCard(title = "Time", value = "25 min", icon = Icons.Default.Timer, color = Marigold, modifier = Modifier.weight(1f))
                    }
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        StatCard(title = "Score", value = "150", icon = Icons.Default.Star, color = Color(0xFFD97706), modifier = Modifier.weight(1f))
                        StatCard(title = "Streak", value = "3 days", icon = Icons.Default.LocalFireDepartment, color = Brick, modifier = Modifier.weight(1f))
                    }
                }

                // Recent Sessions
                item {
                    Text(
                        text = "Recent Sessions",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        color = Ink,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }

                item { SessionCard(game = "Memory Road", score = 50, time = "8 min", emoji = "\uD83D\uDEE3\uFE0F") }
                item { SessionCard(game = "Tea Garden", score = 35, time = "6 min", emoji = "\uD83C\uDF3F") }
                item { SessionCard(game = "Temple Prayer", score = 40, time = "5 min", emoji = "\uD83D\uDD14") }

                // Alerts
                item {
                    Text(
                        text = "Alerts",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        color = Ink,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }

                item {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(3.dp, RoundedCornerShape(16.dp))
                            .border(2.dp, Ink, RoundedCornerShape(16.dp)),
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFFE7F4EC)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .shadow(2.dp, CircleShape)
                                    .clip(CircleShape)
                                    .border(2.dp, Ink, CircleShape)
                                    .background(TeaGreen),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.CheckCircle, null, tint = Color.White, modifier = Modifier.size(20.dp))
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text("No alerts", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink)
                                Text("Patient is doing well", fontSize = 14.sp, color = InkSecondary)
                            }
                        }
                    }
                }

                item { Spacer(modifier = Modifier.height(16.dp)) }
            }
        }
    }
}

private fun getPatientPhotoPath(patient: Patient): String? {
    return when (patient.id) {
        1L -> "sample-images/patient_1_biren_borah/patient_profile_photo_biren_borah.jpg"
        2L -> "sample-images/patient_2_mary_nongrum/patient_profile_photo_mary_nongrum.jpg"
        3L -> "sample-images/patient_3_ibochouba_singh/patient_profile_photo_ibochouba_singh.jpg"
        4L -> "sample-images/patient_4_lalhmingmawii_sailo/patient_profile_photo_lalhmingmawii_sailo.jpg"
        5L -> "sample-images/patient_5_kevichusa_angami/patient_profile_photo_kevichusa_angami.jpg"
        else -> null
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .shadow(4.dp, RoundedCornerShape(16.dp))
            .border(3.dp, Ink, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        color = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .shadow(2.dp, RoundedCornerShape(12.dp))
                    .clip(RoundedCornerShape(12.dp))
                    .border(2.dp, Ink, RoundedCornerShape(12.dp))
                    .background(color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = color, modifier = Modifier.size(22.dp))
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(text = value, fontSize = 26.sp, fontWeight = FontWeight.Black, color = color)
            Text(text = title, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = InkSecondary)
        }
    }
}

@Composable
fun SessionCard(
    game: String,
    score: Int,
    time: String,
    emoji: String
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(3.dp, RoundedCornerShape(16.dp))
            .border(2.dp, Ink, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        color = Color.White
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .shadow(2.dp, RoundedCornerShape(14.dp))
                    .clip(RoundedCornerShape(14.dp))
                    .border(2.dp, Ink, RoundedCornerShape(14.dp))
                    .background(WarmWhite),
                contentAlignment = Alignment.Center
            ) {
                Text(text = emoji, fontSize = 28.sp)
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = game, fontSize = 17.sp, fontWeight = FontWeight.Black, color = Ink)
                Text(text = time, fontSize = 13.sp, color = InkSecondary)
            }
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = TeaGreen,
                modifier = Modifier
                    .shadow(2.dp, RoundedCornerShape(12.dp))
                    .border(2.dp, Ink, RoundedCornerShape(12.dp))
            ) {
                Text(
                    text = "$score pts",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )
            }
        }
    }
}
