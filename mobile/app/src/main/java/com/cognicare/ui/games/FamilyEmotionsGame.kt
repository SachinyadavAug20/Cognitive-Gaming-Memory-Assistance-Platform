package com.cognicare.ui.games

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
import com.cognicare.util.ElderlyFeedback
private val TextSecondary = Color(0xFF6B7280)

private data class EmotionScene(val emoji: String, val person: String, val emotion: String, val color: Color)
private data class EmotionQuestion(val scene: EmotionScene, val options: List<String>)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FamilyEmotionsGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var currentQuestion by remember { mutableIntStateOf(0) }
    var questions by remember { mutableStateOf(listOf<EmotionQuestion>()) }
    var showResult by remember { mutableStateOf(false) }
    var correctCount by remember { mutableIntStateOf(0) }
    var showFeedback by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }

    val emotions = listOf(
        "\uD83D\uDE0A" to "Happy",
        "\uD83D\uDE22" to "Sad",
        "\uD83D\uDE31" to "Worried",
        "\uD83D\uDE21" to "Angry",
        "\uD83E\uDD29" to "Proud",
        "\uD83D\uDE0D" to "Loved",
        "\uD83E\uDD14" to "Curious",
        "\uD83D\uDE0C" to "Relieved"
    )

    val allScenes = listOf(
        EmotionScene("\uD83C\uDF82", "Grandpa at birthday", "Happy", TempleGold),
        EmotionScene("\uD83D\uDC94", "Grandma missing family", "Sad", ChurchBlue),
        EmotionScene("\uD83D\uDEA8", "Uncle hearing bad news", "Worried", ErrorRed),
        EmotionScene("\uD83C\uDFC6", "Cousin winning award", "Proud", SuccessGreen),
        EmotionScene("\uD83E\uDD1D", "Sister meeting old friend", "Loved", Color(0xFFE91E63)),
        EmotionScene("\uD83D\uDD2C", "Aunt discovering new recipe", "Curious", MarketOrange),
        EmotionScene("\uD83C\uDF19", "Grandpa after long walk", "Relieved", ChurchBlue),
        EmotionScene("\u26A0\uFE0F", "Mom hearing storm warning", "Worried", ErrorRed),
        EmotionScene("\uD83C\uDF89", "Family reunion", "Happy", TempleGold),
        EmotionScene("\uD83D\uDC95", "Grandma holding baby", "Loved", Color(0xFFE91E63))
    )

    fun generateQuestions() {
        val count = (3 + level).coerceAtMost(5)
        val selected = allScenes.shuffled().take(count)
        questions = selected.map { scene ->
            val otherEmotions = emotions.filter { it.second != scene.emotion }.shuffled().take(3).map { it.second }
            EmotionQuestion(scene, (otherEmotions + scene.emotion).shuffled())
        }
    }

    fun setupLevel() {
        currentQuestion = 0
        correctCount = 0
        showResult = false
        showFeedback = false
        generateQuestions()
    }

    LaunchedEffect(level) { setupLevel() }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("Social Warmth", color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFFE91E63))
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).background(Color(0xFFFAF7F2)).padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE91E63))
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE91E63))
                Text("${correctCount}/${questions.size}", fontSize = 16.sp, color = TextSecondary)
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (currentQuestion < questions.size) {
                val q = questions[currentQuestion]
                val emotionEmoji = emotions.find { it.second == q.scene.emotion }?.first ?: "\uD83D\uDE0A"

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(q.scene.emoji, fontSize = 64.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(q.scene.person, fontSize = 16.sp, color = TextSecondary)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("What emotion?", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = q.scene.color)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Emotion options as grid
                for (row in 0..1) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        for (col in 0..1) {
                            val idx = row * 2 + col
                            if (idx < q.options.size) {
                                val option = q.options[idx]
                                val optionEmoji = emotions.find { it.second == option }?.first ?: "\u2753"
                                Button(
                                    onClick = {
                                        ElderlyFeedback.onTap(context)
                                        if (!showFeedback) {
                                            isCorrect = option == q.scene.emotion
                                            showFeedback = true
                                            if (isCorrect) {
                                                ElderlyFeedback.onSuccess(context)
                                                score += 20 * level
                                                correctCount++
                                            } else {
                                                ElderlyFeedback.onError(context)
                                                score = (score - 5).coerceAtLeast(0)
                                            }
                                        }
                                    },
                                    modifier = Modifier
                                        .size(140.dp)
                                        .padding(4.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = when {
                                            !showFeedback -> Color.White
                                            option == q.scene.emotion -> SuccessGreen
                                            else -> ErrorRed.copy(alpha = 0.3f)
                                        }
                                    ),
                                    shape = RoundedCornerShape(16.dp),
                                    enabled = !showFeedback
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text(optionEmoji, fontSize = 36.sp)
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            option, fontSize = 14.sp, fontWeight = FontWeight.Bold,
                                            color = if (!showFeedback) q.scene.color else Color.White
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                if (showFeedback) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = if (isCorrect) SuccessGreen.copy(alpha = 0.1f) else ErrorRed.copy(alpha = 0.1f)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            if (isCorrect) "\u2705 Yes! ${q.scene.person} is feeling ${q.scene.emotion}!" else "\u274C Answer: ${q.scene.emotion}",
                            fontSize = 14.sp, fontWeight = FontWeight.Bold,
                            color = if (isCorrect) SuccessGreen else ErrorRed,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth().padding(12.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = {
                            ElderlyFeedback.onTap(context)
                            currentQuestion++
                            showFeedback = false
                            if (currentQuestion >= questions.size) showResult = true
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE91E63))
                    ) {
                        Text("Next", fontSize = 16.sp, color = Color.White)
                    }
                }
            }
        }

        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = { Text("Emotion Expert!", fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center) },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83D\uDDE3\uFE0F", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Correct: $correctCount / ${questions.size}", fontSize = 20.sp)
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE91E63))
                    }
                },
                confirmButton = {
                    Button(onClick = { ElderlyFeedback.onTap(context); level++; showResult = false }, modifier = Modifier.fillMaxWidth()) {
                        Text("Next Level", fontSize = 18.sp)
                    }
                }
            )
        }
    }
}
