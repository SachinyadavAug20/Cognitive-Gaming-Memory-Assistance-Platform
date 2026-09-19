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

private data class Herb(val name: String, val emoji: String, val use: String, val color: Color)
private data class HerbQuestion(val condition: String, val answer: String, val options: List<String>)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AncestralHerbalistGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var currentQuestion by remember { mutableIntStateOf(0) }
    var questions by remember { mutableStateOf(listOf<HerbQuestion>()) }
    var showResult by remember { mutableStateOf(false) }
    var correctCount by remember { mutableIntStateOf(0) }
    var showFeedback by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }

    val herbs = listOf(
        Herb("Tulsi", "\uD83C\uDF3F", "Cold & cough", TeaGreen),
        Herb("Neem", "\uD83C\uDF33", "Skin problems", Color(0xFF4CAF50)),
        Herb("Turmeric", "\uD83C\uDF3C", "Wounds & cuts", TempleGold),
        Herb("Ginger", "\uD83E\uDD5C", "Digestion", MarketOrange),
        Herb("Ashwagandha", "\uD83C\uDF31", "Stress relief", Color(0xFF795548)),
        Herb("Amla", "\uD83C\uDF4F", "Immunity boost", SuccessGreen),
        Herb("Brahmi", "\uD83C\uDF3F", "Memory loss", ChurchBlue),
        Herb("Mulethi", "\uD83C\uDF3E", "Sore throat", BridgeBrown)
    )

    fun generateQuestions() {
        val count = (3 + level).coerceAtMost(5)
        val herbPairs = herbs.shuffled().take(count)
        questions = herbPairs.map { herb ->
            val otherUses = herbs.filter { it.name != herb.name }.shuffled().take(3).map { it.use }
            HerbQuestion(
                condition = "What herb to use for: ${herb.use}?",
                answer = herb.name,
                options = (otherUses + herb.name).shuffled()
            )
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
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("Healing Herbs", color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = TeaGreen)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).background(Color(0xFFFAF7F2)).padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TeaGreen)
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TeaGreen)
                Text("${correctCount}/${questions.size}", fontSize = 16.sp, color = Color.Gray)
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (currentQuestion < questions.size) {
                val q = questions[currentQuestion]
                val herb = herbs.find { it.name == q.answer }

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
                        Text("\uD83C\uDF3F", fontSize = 40.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(q.condition, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TeaGreen, textAlign = TextAlign.Center)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Herb grid
                for (row in 0..1) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        for (col in 0..1) {
                            val idx = row * 2 + col
                            if (idx < q.options.size) {
                                val optionName = q.options[idx]
                                val optionHerb = herbs.find { it.name == optionName }
                                Button(
                                    onClick = {
                                        if (!showFeedback) {
                                            isCorrect = optionName == q.answer
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
                                            optionName == q.answer -> SuccessGreen
                                            else -> ErrorRed.copy(alpha = 0.3f)
                                        }
                                    ),
                                    shape = RoundedCornerShape(16.dp),
                                    enabled = !showFeedback
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text(optionHerb?.emoji ?: "\uD83C\uDF3F", fontSize = 32.sp)
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            optionName, fontSize = 14.sp, fontWeight = FontWeight.Bold,
                                            color = if (!showFeedback) optionHerb?.color ?: TeaGreen else Color.White
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
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(12.dp),
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                if (isCorrect) "\u2705 ${herb?.name} is correct!" else "\u274C Answer: ${q.answer}",
                                fontSize = 14.sp, fontWeight = FontWeight.Bold,
                                color = if (isCorrect) SuccessGreen else ErrorRed,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = {
                            currentQuestion++
                            showFeedback = false
                            if (currentQuestion >= questions.size) showResult = true
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = TeaGreen)
                    ) {
                        Text("Next", fontSize = 16.sp, color = Color.White)
                    }
                }
            }
        }

        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = { Text("Herbal Expert!", fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center) },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83C\uDF3F", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Correct: $correctCount / ${questions.size}", fontSize = 20.sp)
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TeaGreen)
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
