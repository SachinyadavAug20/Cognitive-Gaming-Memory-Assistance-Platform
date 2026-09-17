package com.cognicare.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.Green40
import com.cognicare.ui.theme.DeepGreen
import com.cognicare.ui.theme.SoftGreen

@Composable
fun LoginScreen(
    onScanQR: () -> Unit,
    onDemoLogin: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Green40, DeepGreen)
                )
            )
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(modifier = Modifier.height(80.dp))

        // Logo
        Text(
            text = "\uD83E\uDDE0",
            fontSize = 80.sp
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "CogniCare",
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Welcome! How would you like to sign in?",
            fontSize = 18.sp,
            color = Color.White.copy(alpha = 0.85f),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.weight(1f))

        // QR Scanner Button — large elderly-friendly touch target
        LoginButton(
            icon = Icons.Default.QrCodeScanner,
            label = "Scan QR Code",
            subtitle = "Hold your QR card to the camera",
            onClick = onScanQR,
            isPrimary = true
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Demo Login Button
        LoginButton(
            icon = Icons.Default.Person,
            label = "Try Demo Patient",
            subtitle = "Explore with a sample profile",
            onClick = onDemoLogin,
            isPrimary = false
        )

        Spacer(modifier = Modifier.height(48.dp))

        Text(
            text = "CogniCare CDTx\nMinistry of DoNER • SIH 2026",
            fontSize = 12.sp,
            color = Color.White.copy(alpha = 0.5f),
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun LoginButton(
    icon: ImageVector,
    label: String,
    subtitle: String,
    onClick: () -> Unit,
    isPrimary: Boolean
) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(80.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (isPrimary) Color.White else Color.White.copy(alpha = 0.15f),
            contentColor = if (isPrimary) Green40 else Color.White
        ),
        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon,
                contentDescription = null,
                modifier = Modifier.size(36.dp)
            )
            Spacer(modifier = Modifier.width(20.dp))
            Column(
                modifier = Modifier.weight(1f),
                horizontalAlignment = Alignment.Start
            ) {
                Text(
                    text = label,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = subtitle,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Normal,
                    color = if (isPrimary) Green40.copy(alpha = 0.7f) else Color.White.copy(alpha = 0.7f)
                )
            }
        }
    }
}
