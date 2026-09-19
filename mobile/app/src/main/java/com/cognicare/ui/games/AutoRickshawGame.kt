package com.cognicare.ui.games

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*
import com.cognicare.util.ElderlyFeedback
private val TextSecondary = Color(0xFF6B7280)

data class RouteStop(val emoji: String, val name: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AutoRickshawGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var route by remember { mutableStateOf(listOf<RouteStop>()) }
    var userRoute by remember { mutableStateOf(listOf<RouteStop>()) }
    var availableStops by remember { mutableStateOf(listOf<RouteStop>()) }
    var showResult by remember { mutableStateOf(false) }

    val allStops = listOf(
        RouteStop("\uD83C\uDFE5", "Hospital"),
        RouteStop("\uD83C\uDFEB", "Temple"),
        RouteStop("\uD83C\uDFEA", "Market"),
        RouteStop("\uD83C\uDFEB", "School"),
        RouteStop("\u26EA", "Church"),
        RouteStop("\uD83C\uDFE8", "Home"),
        RouteStop("\uD83C\uDFE2", "Office"),
        RouteStop("\uD83C\uDFD6\uFE0F", "Lake"),
    )

    fun setupLevel() {
        val length = (2 + level).coerceAtMost(5)
        route = allStops.shuffled().take(length)
        userRoute = listOf()
        availableStops = allStops.shuffled()
        showResult = false
    }

    LaunchedEffect(level) { setupLevel() }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("Auto Ride", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AutoYellow)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(SoftGreen.copy(alpha = 0.3f))
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = "Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = AutoYellow)
                Text(text = "Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = AutoYellow)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Instruction
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Follow the route!",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Tap the stops in the correct order",
                        fontSize = 16.sp,
                        color = TextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Target route
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = AutoYellow.copy(alpha = 0.1f))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Route to follow:", fontSize = 16.sp, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        route.forEachIndexed { index, stop ->
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(text = stop.emoji, fontSize = 36.sp)
                                Text(text = stop.name, fontSize = 12.sp, color = TextSecondary)
                            }
                            if (index < route.lastIndex) {
                                Text(text = " → ", fontSize = 20.sp, color = TextSecondary)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Your route
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Your route:", fontSize = 16.sp, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.height(8.dp))
                    if (userRoute.isEmpty()) {
                        Text(
                            text = "Tap stops below to build your route",
                            fontSize = 14.sp,
                            color = TextSecondary
                        )
                    } else {
                        Row(
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            userRoute.forEachIndexed { index, stop ->
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(text = stop.emoji, fontSize = 36.sp)
                                    Text(text = stop.name, fontSize = 12.sp, color = TextSecondary)
                                }
                                if (index < userRoute.lastIndex) {
                                    Text(text = " → ", fontSize = 20.sp, color = TextSecondary)
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Available stops
            Text("Available stops:", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))

            val columns = 4
            val rows = (availableStops.size + columns - 1) / columns

            for (row in 0 until rows) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    for (col in 0 until columns) {
                        val index = row * columns + col
                        if (index < availableStops.size) {
                            val stop = availableStops[index]
                            val isUsed = stop in userRoute

                            Box(
                                modifier = Modifier
                                    .size(72.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(
                                        if (isUsed) SuccessGreen.copy(alpha = 0.2f)
                                        else Color.White
                                    )
                                    .border(
                                        2.dp,
                                        if (isUsed) SuccessGreen else Color.LightGray,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .clickable {
                                        ElderlyFeedback.onTap(context)
                                        if (!isUsed && !showResult) {
                                            ElderlyFeedback.onSuccess(context)
                                            val newUserRoute = userRoute + stop
                                            userRoute = newUserRoute

                                            // Check if route matches
                                            if (newUserRoute.size == route.size) {
                                                val correct = newUserRoute.zip(route).all { (a, b) ->
                                                    a.name == b.name
                                                }
                                                if (correct) {
                                                    score += 10 * level
                                                    showResult = true
                                                } else {
                                                    score = (score - 5).coerceAtLeast(0)
                                                    showResult = true
                                                }
                                            }
                                        }
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(text = stop.emoji, fontSize = 28.sp)
                                    Text(text = stop.name, fontSize = 14.sp, color = TextSecondary)
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            Spacer(modifier = Modifier.weight(1f))

            // Reset button
            if (userRoute.isNotEmpty() && !showResult) {
                OutlinedButton(
                    onClick = { userRoute = listOf() },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Reset Route", fontSize = 16.sp)
                }
            }
        }

        if (showResult) {
            val correct = userRoute.zip(route).all { (a, b) -> a.name == b.name }
            AlertDialog(
                onDismissRequest = { },
                title = {
                    Text(
                        text = if (correct) "Perfect Route!" else "Wrong Route!",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = if (correct) "\uD83D\uDEFA" else "\uD83D\uDE14", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = "Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = AutoYellow)
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            ElderlyFeedback.onTap(context)
                            if (correct) level++
                            setupLevel()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = AutoYellow)
                    ) {
                        Text(if (correct) "Next Level" else "Try Again", fontSize = 18.sp)
                    }
                }
            )
        }
    }
}
