package com.cognicare.ui.games

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
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
import com.cognicare.util.HapticUtil

data class WordPair(val english: String, val local: String, val emoji: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SchoolDaysGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var words by remember { mutableStateOf(listOf<WordPair>()) }
    var targetWord by remember { mutableStateOf<WordPair?>(null) }
    var options by remember { mutableStateOf(listOf<String>()) }
    var selected by remember { mutableStateOf<String?>(null) }
    var showResult by remember { mutableStateOf(false) }

    val allWords = listOf(
        WordPair("Water", "Pani", "\uD83D\uDCA7"),
        WordPair("Sun", "Suraj", "\u2600\uFE0F"),
        WordPair("Moon", "Chand", "\uD83C\uDF19"),
        WordPair("Star", "Tara", "\u2B50"),
        WordPair("River", "Nadi", "\uD83C\uDF0A"),
        WordPair("Mountain", "Pahar", "\uD83C\uDFD4\uFE0F"),
        WordPair("Tree", "Rukh", "\uD83C\uDF33"),
        WordPair("Flower", "Phool", "\uD83C\uDF3C"),
        WordPair("Bird", "Chiriya", "\uD83D\uDC26"),
        WordPair("Fish", "Machhli", "\uD83D\uDC1F"),
        WordPair("Elephant", "Hathi", "\uD83D\uDC18"),
        WordPair("Cow", "Gaay", "\uD83D\uDC04"),
    )

    fun setupLevel() {
        val count = (2 + level).coerceAtMost(6)
        val selectedWords = allWords.shuffled().take(count)
        words = selectedWords
        targetWord = selectedWords.random()
        options = selectedWords.shuffled().map { it.local }
        selected = null
        showResult = false
    }

    LaunchedEffect(level) { setupLevel() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("School Days", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SchoolPurple)
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
                Text(text = "Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SchoolPurple)
                Text(text = "Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SchoolPurple)
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
                        text = "Match the word!",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Tap the local language word for",
                        fontSize = 16.sp,
                        color = Color.Gray
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Target word
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SchoolPurple.copy(alpha = 0.1f))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = targetWord?.emoji ?: "", fontSize = 64.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = targetWord?.english ?: "",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold,
                        color = SchoolPurple
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Options
            Text(
                text = "Which word means \"${targetWord?.english}\"?",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(12.dp))

            options.forEach { option ->
                val isSelected = selected == option
                val isCorrect = option == targetWord?.local

                Button(
                    onClick = {
                        if (!showResult) {
                            HapticUtil.vibrate(context, 60)
                            selected = option
                            if (isCorrect) {
                                score += 10 * level
                            } else {
                                score = (score - 5).coerceAtLeast(0)
                            }
                            showResult = true
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .height(60.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = when {
                            isSelected && isCorrect -> SuccessGreen.copy(alpha = 0.2f)
                            isSelected && !isCorrect -> ErrorRed.copy(alpha = 0.2f)
                            else -> Color.White
                        }
                    )
                ) {
                    Text(
                        text = option,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Medium,
                        color = when {
                            isSelected && isCorrect -> SuccessGreen
                            isSelected && !isCorrect -> ErrorRed
                            else -> Color.Black
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))
        }

        if (showResult) {
            val isCorrect = selected == targetWord?.local
            AlertDialog(
                onDismissRequest = { },
                title = {
                    Text(
                        text = if (isCorrect) "Correct!" else "Oops!",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = targetWord?.emoji ?: "",
                            fontSize = 60.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "\"${targetWord?.english}\" = \"${targetWord?.local}\"",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = SchoolPurple
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Score: $score",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = SchoolPurple
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            if (isCorrect) level++
                            setupLevel()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = SchoolPurple)
                    ) {
                        Text(if (isCorrect) "Next Level" else "Try Again", fontSize = 18.sp)
                    }
                }
            )
        }
    }
}
