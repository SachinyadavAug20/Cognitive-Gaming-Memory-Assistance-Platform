package com.cognicare.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onNavigateToLogin: () -> Unit) {
    val alpha = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        alpha.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 800, easing = FastOutSlowInEasing)
        )
        delay(1200)
        onNavigateToLogin()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(WarmWhite),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.alpha(alpha.value)
        ) {
            // Brain icon in green circle
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
                    .background(Green40),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "\uD83E\uDDE0", fontSize = 52.sp)
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "CogniCare",
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
                color = DeepGreen
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "North East Memory Care",
                fontSize = 14.sp,
                color = Color.Gray,
                letterSpacing = 2.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "CDTx",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = CardOrange,
                letterSpacing = 4.sp
            )
        }

        // Footer
        Text(
            text = "Ministry of DoNER \u2022 SIH 2026",
            fontSize = 12.sp,
            color = Color.Gray.copy(alpha = 0.5f),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 48.dp)
        )
    }
}
