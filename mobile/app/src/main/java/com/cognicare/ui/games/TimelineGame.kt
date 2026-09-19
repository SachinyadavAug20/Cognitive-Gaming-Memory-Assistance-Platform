package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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

private data class LifeEvent(val text: String, val emoji: String, val year: Int)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TimelineGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var events by remember { mutableStateOf(listOf<LifeEvent>()) }
    var placedEvents by remember { mutableStateOf(listOf<LifeEvent>()) }
    var showResult by remember { mutableStateOf(false) }
    var mistakes by remember { mutableIntStateOf(0) }

    val allEvents = listOf(
        LifeEvent("Born in village", "\uD83D\uDC76", 1945),
        LifeEvent("First day of school", "\uD83C\uDFEB", 1951),
        LifeEvent("Won school award", "\uD83C\uDFC6", 1956),
        LifeEvent("Met best friend", "\uD83E\uDD1D", 1958),
        LifeEvent("Started college", "\uD83D\uDCDA", 1963),
        LifeEvent("First job", "\uD83D\uDCBC", 1967),
        LifeEvent("Got married", "\uD83D\uDC92", 1970),
        LifeEvent("First child born", "\uD83D\uDC76", 1972),
        LifeEvent("Bought first house", "\uD83C\uDFE0", 1978),
        LifeEvent("Retired happily", "\u2615", 2005)
    )

    fun setupLevel() {
        val count = (3 + level).coerceAtMost(6)
        events = allEvents.shuffled().take(count).sortedBy { it.year }
        placedEvents = emptyList()
        mistakes = 0
        showResult = false
    }

    LaunchedEffect(level) { setupLevel() }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("My Life Story", color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF6D597A))
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).background(Color(0xFFFAF7F2)).padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SchoolPurple)
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SchoolPurple)
                Text("Placed ${placedEvents.size}/${events.size}", fontSize = 16.sp, color = Color.Gray)
            }

            Spacer(modifier = Modifier.height(12.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Arrange events in chronological order", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = SchoolPurple)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Tap events in the correct order (earliest first)", fontSize = 12.sp, color = Color.Gray)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Timeline so far
            if (placedEvents.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SuccessGreen.copy(alpha = 0.1f)),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth().padding(12.dp)) {
                        Text("Your timeline:", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                        Spacer(modifier = Modifier.height(4.dp))
                        placedEvents.forEachIndexed { idx, event ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("${idx + 1}.", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SchoolPurple, modifier = Modifier.width(24.dp))
                                Text(event.emoji, fontSize = 18.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(event.text, fontSize = 14.sp, color = Color.DarkGray)
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Remaining events (not yet placed)
            Text("Tap the next event:", fontSize = 16.sp, fontWeight = FontWeight.Medium, color = SchoolPurple)
            Spacer(modifier = Modifier.height(8.dp))

            val remaining = events.filter { it !in placedEvents }
            remaining.forEach { event ->
                Button(
                    onClick = {
                        if (!showResult) {
                            val expectedIdx = placedEvents.size
                            if (event == events[expectedIdx]) {
                                ElderlyFeedback.onSuccess(context)
                                placedEvents = placedEvents + event
                                score += 20 * level
                                if (placedEvents.size >= events.size) {
                                    ElderlyFeedback.onSuccess(context)
                                    showResult = true
                                }
                            } else {
                                ElderlyFeedback.onError(context)
                                mistakes++
                                score = (score - 5).coerceAtLeast(0)
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(event.emoji, fontSize = 24.sp)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(event.text, fontSize = 16.sp, fontWeight = FontWeight.Medium, color = SchoolPurple)
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Text("Mistakes: $mistakes", fontSize = 14.sp, color = if (mistakes > 0) ErrorRed else Color.Gray)
        }

        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = { Text("Story Told!", fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center) },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83D\uDCD6", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Mistakes: $mistakes", fontSize = 18.sp)
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = SchoolPurple)
                    }
                },
                confirmButton = {
                    Button(onClick = { level++; showResult = false }, modifier = Modifier.fillMaxWidth()) {
                        Text("Next Level", fontSize = 18.sp)
                    }
                }
            )
        }
    }
}
