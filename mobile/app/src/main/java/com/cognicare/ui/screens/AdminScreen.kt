package com.cognicare.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.data.remote.*
import com.cognicare.viewmodel.AdminViewModel

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val Brick = Color(0xFFC5221F)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminScreen(
    viewModel: AdminViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mission Control", fontWeight = FontWeight.Black, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = Color.White) }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF1E293B))
            )
        },
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
    ) { padding ->
        if (state.isLoading) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = TeaGreen, modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Loading system data...", fontSize = 14.sp, color = InkSecondary)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding).background(Canvas),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Connection status
                item {
                    if (state.error != null) {
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            color = Marigold.copy(alpha = 0.1f),
                            border = ButtonDefaults.outlinedButtonBorder
                        ) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.WifiOff, null, tint = Marigold, modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(text = state.error ?: "", fontSize = 14.sp, color = Ink)
                            }
                        }
                    }
                }

                // Overview stats
                item {
                    Text("\uD83D\uDCCA System Overview", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Ink)
                }

                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        AdminStatCard("Patients", "${state.overview?.totalPatients ?: 0}", Icons.Default.People, TeaGreen, Modifier.weight(1f))
                        AdminStatCard("Sessions", "${state.overview?.totalSessions ?: 0}", Icons.Default.Gamepad, Marigold, Modifier.weight(1f))
                        AdminStatCard("Cards", "${state.overview?.activeCards ?: 0}", Icons.Default.Badge, Color(0xFF1565C0), Modifier.weight(1f))
                    }
                }

                // AI Status
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier.size(48.dp).clip(RoundedCornerShape(12.dp))
                                    .background(Color(0xFF4C1D95).copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center
                            ) { Text("🤖", fontSize = 24.sp) }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Ollama AI Engine", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Ink)
                                Text(
                                    text = state.aiDiagnostics?.status ?: "Unknown",
                                    fontSize = 14.sp,
                                    color = if (state.aiDiagnostics?.status == "online") TeaGreen else InkSecondary
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (state.aiDiagnostics?.status == "online") TeaGreen.copy(alpha = 0.1f) else Color(0xFFF3F4F6)
                            ) {
                                Text(
                                    text = (state.aiDiagnostics?.status ?: "unknown").uppercase(),
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (state.aiDiagnostics?.status == "online") TeaGreen else InkSecondary
                                )
                            }
                        }
                    }
                }

                // NER District Health
                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("\uD83C\uDFD5\uFE0F NER District Health", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Ink)
                }

                items(state.districts, key = { "${it.state}-${it.district}" }) { district ->
                    DistrictHealthCard(district)
                }

                // Recent Sessions
                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("\uD83C\uDFAE Recent Sessions", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Ink)
                }

                items(state.sessions, key = { it.sessionId }) { session ->
                    SessionRow(session)
                }

                // Patients
                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("\uD83D\uDC64 Registered Patients", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Ink)
                }

                items(state.patients, key = { it.id }) { patient ->
                    PatientRow(patient)
                }

                // Alerts
                if (state.alerts.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("\u26A0\uFE0F Active Alerts", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Brick)
                    }
                    items(state.alerts, key = { it.id ?: "" }) { alert ->
                        AlertRow(alert, onResolve = { viewModel.resolveAlert(alert.id ?: "") })
                    }
                }

                item { Spacer(modifier = Modifier.height(24.dp)) }
            }
        }
    }
}

@Composable
fun AdminStatCard(title: String, value: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, null, tint = color, modifier = Modifier.size(28.dp))
            Spacer(modifier = Modifier.height(6.dp))
            Text(value, fontSize = 24.sp, fontWeight = FontWeight.Black, color = color)
            Text(title, fontSize = 12.sp, color = InkSecondary)
        }
    }
}

@Composable
fun DistrictHealthCard(district: AdminDistrictHealthDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text(text = "${district.district ?: "?"}, ${district.state ?: "?"}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Ink)
                    Text(text = "PHC: ${district.primaryPhc ?: "?"}", fontSize = 12.sp, color = InkSecondary)
                }
                Surface(shape = RoundedCornerShape(8.dp), color = TeaGreen.copy(alpha = 0.1f)) {
                    Text(
                        text = "${(district.cognitiveAdherenceRate * 100).toInt()}%",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TeaGreen
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                MiniStat("Enrolled", "${district.enrolledPatients}")
                MiniStat("MCI", "${district.mciStageCount}")
                MiniStat("Moderate", "${district.moderateStageCount}")
                MiniStat("ASHA", "${district.ashaWorkersActive}")
                MiniStat("Kiosks", "${district.activeKiosks}")
            }
        }
    }
}

@Composable
fun MiniStat(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Ink)
        Text(label, fontSize = 14.sp, color = InkSecondary)
    }
}

@Composable
fun SessionRow(session: AdminSessionRowDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(40.dp).clip(RoundedCornerShape(10.dp))
                    .background(TeaGreen.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) { Text("🎮", fontSize = 20.sp) }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = session.patientName ?: "Unknown", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Ink)
                Text(text = "${session.gameType ?: "?"} • ${session.durationSeconds ?: 0}s", fontSize = 12.sp, color = InkSecondary)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(text = "${session.accuracyPercentage?.toInt() ?: 0}%", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TeaGreen)
                Text(text = "accuracy", fontSize = 14.sp, color = InkSecondary)
            }
        }
    }
}

@Composable
fun PatientRow(patient: AdminPatientRowDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(40.dp).clip(RoundedCornerShape(20.dp))
                    .background(TeaGreen),
                contentAlignment = Alignment.Center
            ) {
                Text(text = (patient.name ?: "?").first().toString(), fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = patient.name ?: "Unknown", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Ink)
                Text(text = "${patient.gender ?: "?"} • ${patient.preferredLanguage ?: "?"}", fontSize = 12.sp, color = InkSecondary)
            }
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (patient.hasActiveCard) TeaGreen.copy(alpha = 0.1f) else Color(0xFFF3F4F6)
            ) {
                Text(
                    text = if (patient.hasActiveCard) "Active" else "Inactive",
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    fontSize = 14.sp, fontWeight = FontWeight.Bold,
                    color = if (patient.hasActiveCard) TeaGreen else InkSecondary
                )
            }
        }
    }
}

@Composable
fun AlertRow(alert: AdminClinicalAlertDto, onResolve: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Brick.copy(alpha = 0.05f)),
        border = ButtonDefaults.outlinedButtonBorder
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Warning, null, tint = Brick, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = alert.alertType ?: "Alert", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Ink)
                Text(text = alert.clinicalNote ?: "", fontSize = 12.sp, color = InkSecondary)
            }
            TextButton(onClick = onResolve) { Text("Resolve") }
        }
    }
}
