package com.cognicare.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val CanvasBg = Color(0xFFFAF7F2)
private val TealClinical = Color(0xFF0D9488)
private val DarkSlate = Color(0xFF0F172A)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DoctorDashboardScreen(
    onBack: () -> Unit,
    onNavigateToPatient: () -> Unit
) {
    val context = LocalContext.current
    var selectedPatientIndex by remember { mutableIntStateOf(0) }
    var rxPrescribed by remember { mutableStateOf(false) }

    val patients = remember {
        listOf(
            "Biren Borah (74 y/o • CDR 1.0 Mild Dementia • MoCA 18/30)",
            "Pratima Devi (78 y/o • CDR 0.5 Vascular MCI • MoCA 22/30)",
            "Hemanta Saikia (71 y/o • Post-Stroke Recovery • MoCA 19/30)"
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🩺 Physician Clinical Portal",
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Serif,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkSlate)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(CanvasBg)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Clinician Header
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color.White,
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(2.5.dp, Ink, RoundedCornerShape(20.dp))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Dr. Arindam Sharma, MD (Neurology)",
                            fontWeight = FontWeight.Black,
                            fontSize = 18.sp,
                            color = Ink
                        )
                        Text(
                            text = "MDoNER & GMCH Cognitive Neuro-Rehabilitation Clinic",
                            fontSize = 12.sp,
                            color = InkSecondary,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // Patient Roster Selector
            item {
                Text(
                    text = "Select Patient Roster:",
                    fontWeight = FontWeight.Black,
                    fontSize = 14.sp,
                    color = Ink
                )
                Spacer(modifier = Modifier.height(8.dp))
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    patients.forEachIndexed { index, pName ->
                        val isSelected = index == selectedPatientIndex
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = if (isSelected) Color(0xFFFEF3C7) else Color.White,
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(
                                    if (isSelected) 2.5.dp else 1.dp,
                                    if (isSelected) Ink else Color.Gray,
                                    RoundedCornerShape(14.dp)
                                )
                                .clickable {
                                    ElderlyFeedback.onTap(context)
                                    selectedPatientIndex = index
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Filled.Person,
                                    contentDescription = null,
                                    tint = if (isSelected) TealClinical else InkSecondary
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = pName,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Black else FontWeight.Medium,
                                    color = Ink
                                )
                            }
                        }
                    }
                }
            }

            // Clinical Telemetry & Sugar Link
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color.White,
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(2.5.dp, Ink, RoundedCornerShape(20.dp))
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "Glycemic vs Cognitive Delay Profile",
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            color = Ink
                        )
                        Text(
                            text = "Blood Glucose Avg: 142 mg/dL • Reaction Time: 330ms (Baseline) -> 490ms (Post-Spike +160ms lag).",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = InkSecondary
                        )
                        Text(
                            text = "Clinical note: Patient displays noticeable word-finding pauses when post-prandial glucose exceeds 175 mg/dL. Prescribe low-GI breakfasts & morning Card Mastery.",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = TealClinical
                        )
                    }
                }
            }

            // Prescription Action
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xFFCCFBF1),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(2.5.dp, Ink, RoundedCornerShape(20.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Digital CDTx Prescription",
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            color = DarkSlate
                        )
                        Text(
                            text = "Prescribe 54-Card Mastery (10 mins) + Majuli 3D Walk (5 mins) daily with errorless learning threshold set to Stage 2.",
                            fontSize = 12.sp,
                            color = DarkSlate
                        )

                        Button(
                            onClick = {
                                ElderlyFeedback.onSuccess(context)
                                rxPrescribed = true
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = DarkSlate),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = if (rxPrescribed) "✓ Rx Dispatched to Patient!" else "Dispatch Digital Rx",
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}
