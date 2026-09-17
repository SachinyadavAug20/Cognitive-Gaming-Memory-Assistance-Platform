package com.cognicare.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*

@Composable
fun LoginScreen(
    onScanQR: () -> Unit,
    onDemoLogin: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(WarmWhite)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(40.dp))

        // CogniCare logo + branding (matches website header)
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            // Brain icon in green circle
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Green40),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "\uD83E\uDDE0", fontSize = 24.sp, color = Color.White)
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = "CogniCare",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold,
                    color = DeepGreen
                )
                Text(
                    text = "North East Memory Care",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        // Welcome Back heading (matches website)
        Text(
            text = "Welcome Back! \uD83C\uDF1E",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1C1B1F),
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "We're happy to see you again.\nReady for your daily memory exercises?",
            fontSize = 16.sp,
            color = Color.Gray,
            textAlign = TextAlign.Center,
            lineHeight = 24.sp
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Kiosk Check-In card (matching website orange/brown card)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(4.dp, RoundedCornerShape(16.dp))
                .clip(RoundedCornerShape(16.dp))
                .background(Color.White)
                .border(2.dp, Color(0xFFD5C4A8), RoundedCornerShape(16.dp))
        ) {
            // Orange header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CardOrange)
                    .padding(20.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "\uD83D\uDD0D", fontSize = 36.sp)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Kiosk Check-In",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "QR Scanner Station",
                            fontSize = 14.sp,
                            color = Color.White.copy(alpha = 0.85f)
                        )
                    }
                }
            }

            // Steps section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Text(
                    text = "Scan a patient's QR health card to check them in and start their session.",
                    fontSize = 16.sp,
                    color = Color(0xFF444444),
                    lineHeight = 24.sp
                )
                Spacer(modifier = Modifier.height(16.dp))

                // Step 1
                StepRow(
                    number = 1,
                    text = "Show the QR health card"
                )
                Spacer(modifier = Modifier.height(8.dp))

                // Step 2
                StepRow(
                    number = 2,
                    text = "Scan at the kiosk"
                )
                Spacer(modifier = Modifier.height(8.dp))

                // Step 3
                StepRow(
                    number = 3,
                    text = "Check in & start session"
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Open Scanner button (matching website orange button)
                Button(
                    onClick = onScanQR,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(64.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = CardOrange,
                        contentColor = Color.White
                    )
                ) {
                    Icon(
                        Icons.Default.QrCodeScanner,
                        contentDescription = null,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "OPEN SCANNER",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Demo Login button (secondary style)
        OutlinedButton(
            onClick = onDemoLogin,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = Green40
            ),
            border = ButtonDefaults.outlinedButtonBorder.copy(
                brush = Brush.horizontalGradient(listOf(Green40, Green40))
            )
        ) {
            Icon(
                Icons.Default.Person,
                contentDescription = null,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = "Try Demo Patient",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        // Footer
        Text(
            text = "CogniCare CDTx\nMinistry of DoNER \u2022 SIH 2026",
            fontSize = 12.sp,
            color = Color.Gray.copy(alpha = 0.6f),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun StepRow(number: Int, text: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(WarmWhite)
            .border(1.dp, Color(0xFFE8E0D0), RoundedCornerShape(12.dp))
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            shape = CircleShape,
            color = CardOrange,
            modifier = Modifier.size(28.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text(
                    text = "$number",
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = text,
            fontSize = 16.sp,
            color = Color(0xFF1C1B1F)
        )
    }
}
