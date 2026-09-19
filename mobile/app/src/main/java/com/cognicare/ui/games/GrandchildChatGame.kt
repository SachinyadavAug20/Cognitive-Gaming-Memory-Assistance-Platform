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

private data class ChatQuestion(val question: String, val options: List<String>, val correct: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GrandchildChatGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var currentQuestion by remember { mutableIntStateOf(0) }
    var questions by remember { mutableStateOf(listOf<ChatQuestion>()) }
    var showResult by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }
    var correctCount by remember { mutableIntStateOf(0) }
    var showFeedback by remember { mutableStateOf(false) }

    val allQuestions = listOf(
        ChatQuestion("How many children does Grandma have?", listOf("3", "5", "7", "2"), "5"),
        ChatQuestion("What is Grandpa's favorite tea?", listOf("Green tea", "Masala chai", "Herbal tea", "Black tea"), "Masala chai"),
        ChatQuestion("Where did Grandma grow up?", listOf("Delhi", "Kolkata", "Village near river", "Mumbai"), "Village near river"),
        ChatQuestion("What does Grandpa do every morning?", listOf("Yoga", "Walk", "Read newspaper", "All of these"), "All of these"),
        ChatQuestion("Who is the eldest in the family?", listOf("Aunt Rekha", "Uncle Babu", "Grandpa", "Aunt Sunita"), "Uncle Babu"),
        ChatQuestion("What is Grandma's signature dish?", listOf("Samosa", "Ladoos", "Khichdi", "Dal fry"), "Ladoos"),
        ChatQuestion("Which festival does the family celebrate together most?", listOf("Diwali", "Christmas", "Eid", "Holi"), "Holi"),
        ChatQuestion("What is Grandpa's favorite song?", listOf("Raghupati Raghav", "Vaishnav Jan To", "Ae Mere Watan", "Vande Mataram"), "Vaishnav Jan To"),
        ChatQuestion("How many grandchildren are there?", listOf("4", "6", "8", "10"), "8"),
        ChatQuestion("What does Grandma knits for everyone?", listOf("Shawls", "Sweaters", "Socks", "Mittens"), "Sweaters")
    )

    fun setupLevel() {
        val count = (3 + level).coerceAtMost(5)
        questions = allQuestions.shuffled().take(count)
        currentQuestion = 0
        correctCount = 0
        showResult = false
        showFeedback = false
    }

    LaunchedEffect(level) { setupLevel() }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("Morning Tea Chat", color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFFE07A3A))
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).background(Color(0xFFFAF7F2)).padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MarketOrange)
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MarketOrange)
                Text("$correctCount/${questions.size}", fontSize = 16.sp, color = Color.Gray)
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (currentQuestion < questions.size) {
                val q = questions[currentQuestion]

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
                        Text("\uD83D\uDCAC", fontSize = 40.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = q.question,
                            fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MarketOrange,
                            textAlign = TextAlign.Center
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                q.options.forEachIndexed { idx, option ->
                    Button(
                        onClick = {
                            if (!showFeedback) {
                                isCorrect = option == q.correct
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
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = when {
                                !showFeedback -> Color.White
                                option == q.correct -> SuccessGreen
                                else -> ErrorRed.copy(alpha = 0.3f)
                            }
                        ),
                        shape = RoundedCornerShape(12.dp),
                        enabled = !showFeedback
                    ) {
                        Text(
                            option, fontSize = 16.sp, fontWeight = FontWeight.Medium,
                            color = if (!showFeedback) MarketOrange else Color.White,
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                        )
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
                                if (isCorrect) "\u2705 Correct!" else "\u274C Wrong! Answer: ${q.correct}",
                                fontSize = 16.sp, fontWeight = FontWeight.Bold,
                                color = if (isCorrect) SuccessGreen else ErrorRed
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
                        colors = ButtonDefaults.buttonColors(containerColor = MarketOrange)
                    ) {
                        Text("Next", fontSize = 16.sp, color = Color.White)
                    }
                }
            }
        }

        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = { Text("Chat Complete!", fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center) },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83C\uDF75", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Correct: $correctCount / ${questions.size}", fontSize = 20.sp)
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = MarketOrange)
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
