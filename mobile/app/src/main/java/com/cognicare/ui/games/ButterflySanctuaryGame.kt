package com.cognicare.ui.games

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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
import com.cognicare.util.ElderlyFeedback

data class Butterfly(val emoji: String, val name: String, val color: Color)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ButterflySanctuaryGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var targetButterfly by remember { mutableStateOf<Butterfly?>(null) }
    var grid by remember { mutableStateOf(listOf<Butterfly>()) }
    var caught by remember { mutableIntStateOf(0) }
    var showResult by remember { mutableStateOf(false) }

    val butterflies = listOf(
        Butterfly("\uD83E\uDD8B", "Monarch", Color(0xFFFF6D00)),
        Butterfly("\uD83E\uDD8B", "Blue Morpho", Color(0xFF1565C0)),
        Butterfly("\uD83E\uDD8B", "Swallowtail", Color(0xFFC62828)),
        Butterfly("\uD83E\uDD8B", "Painted Lady", Color(0xFF6A1B9A)),
        Butterfly("\uD83E\uDD8B", "Glasswing", Color(0xFF00897B)),
    )

    fun setup() {
        val count = (3 + level).coerceAtMost(8)
        targetButterfly = butterflies.random()
        grid = List(count) { butterflies.random() }
        caught = 0
        showResult = false
    }

    LaunchedEffect(level) { setup() }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("Butterfly Sanctuary", color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF7B1FA2))
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).background(Color(0xFFF3E5F5)).padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF7B1FA2)))
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF7B1FA2)))
            }
            Spacer(modifier = Modifier.height(16.dp))
            Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                Column(modifier = Modifier.fillMaxWidth().padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Catch the:", fontSize = 18.sp, color = Color.Gray)
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = targetButterfly?.emoji ?: "", fontSize = 48.sp)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(text = targetButterfly?.name ?: "", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = targetButterfly?.color ?: Color(0xFF7B1FA2))
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            val columns = 4
            val rows = (grid.size + columns - 1) / columns
            for (row in 0 until rows) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    for (col in 0 until columns) {
                        val index = row * columns + col
                        if (index < grid.size) {
                            val item = grid[index]
                            val isTarget = item.name == targetButterfly?.name
                            Box(
                                modifier = Modifier.size(72.dp).clip(RoundedCornerShape(12.dp))
                                    .background(item.color.copy(alpha = 0.1f))
                                    .border(2.dp, item.color.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                    .clickable {
                                        if (!showResult) {
                                            if (isTarget) { ElderlyFeedback.onSuccess(context); score += 10 * level; caught++ }
                                            else { ElderlyFeedback.onError(context); score = (score - 5).coerceAtLeast(0) }
                                        }
                                    },
                                contentAlignment = Alignment.Center
                            ) { Text(text = item.emoji, fontSize = 36.sp) }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
            Spacer(modifier = Modifier.weight(1f))
            if (caught >= 2) {
                Button(onClick = { level++; setup() }, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7B1FA2))) {
                    Text("Next Level", fontSize = 18.sp)
                }
            }
        }
    }
}
