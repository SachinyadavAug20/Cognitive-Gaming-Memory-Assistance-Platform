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
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*
import com.cognicare.util.ElderlyFeedback
import kotlinx.coroutines.delay
private val TextSecondary = Color(0xFF6B7280)

private data class FamilyMember(val name: String, val emoji: String, val color: Color)
private data class MemoryQuestion(val question: String, val answer: String, val options: List<String>)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MemoryDetectiveGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var showFamily by remember { mutableStateOf(true) }
    var currentQuestion by remember { mutableIntStateOf(0) }
    var questions by remember { mutableStateOf(listOf<MemoryQuestion>()) }
    var showResult by remember { mutableStateOf(false) }
    var correctCount by remember { mutableIntStateOf(0) }
    var showFeedback by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }

    val family = listOf(
        FamilyMember("Grandpa", "\uD83D\uDC74", Color(0xFF795548)),
        FamilyMember("Grandma", "\uD83D\uDC75", Color(0xFFE91E63)),
        FamilyMember("Uncle Babu", "\uD83E\uDDD3", ChurchBlue),
        FamilyMember("Aunt Rekha", "\uD83D\uDC69", Color(0xFF9C27B0)),
        FamilyMember("Cousin Raj", "\uD83D\uDC66", TeaGreen),
        FamilyMember("Little Meena", "\uD83D\uDC67", TempleGold)
    )

    fun generateQuestions() {
        val count = (3 + level).coerceAtMost(5)
        val member = family.random()
        val allQs = listOf(
            MemoryQuestion(
                "Who was wearing glasses?",
                "Grandpa",
                family.map { it.name }.shuffled().take(4)
            ),
            MemoryQuestion(
                "Who sat near the window?",
                member.name,
                family.map { it.name }.shuffled().take(4)
            ),
            MemoryQuestion(
                "Who brought the flowers?",
                "Aunt Rekha",
                family.map { it.name }.shuffled().take(4)
            ),
            MemoryQuestion(
                "Who was cooking in the kitchen?",
                "Grandma",
                family.map { it.name }.shuffled().take(4)
            ),
            MemoryQuestion(
                "Who gave the gift first?",
                "Cousin Raj",
                family.map { it.name }.shuffled().take(4)
            ),
            MemoryQuestion(
                "Who was reading a book?",
                "Little Meena",
                family.map { it.name }.shuffled().take(4)
            ),
            MemoryQuestion(
                "Who wore a red dress?",
                "Aunt Rekha",
                family.map { it.name }.shuffled().take(4)
            ),
            MemoryQuestion(
                "Who was playing outside?",
                "Cousin Raj",
                family.map { it.name }.shuffled().take(4)
            )
        )
        questions = allQs.shuffled().take(count)
    }

    fun setupLevel() {
        showFamily = true
        currentQuestion = 0
        correctCount = 0
        showResult = false
        showFeedback = false
        generateQuestions()
    }

    LaunchedEffect(level) { setupLevel() }

    // Show family scene briefly
    LaunchedEffect(showFamily, level) {
        if (showFamily) {
            delay(3000L + level * 500)
            showFamily = false
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("Memory Detective", color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SchoolPurple)
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
                Text("Q${currentQuestion + 1}/${questions.size}", fontSize = 16.sp, color = TextSecondary)
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (showFamily) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Study this family scene:", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SchoolPurple)
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            family.forEach { member ->
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(member.emoji, fontSize = 40.sp)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(member.name, fontSize = 12.sp, color = member.color, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Remember who is who!", fontSize = 14.sp, color = TextSecondary)
                    }
                }
            } else if (currentQuestion < questions.size) {
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
                        Text("\uD83D\uDD0D", fontSize = 40.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(q.question, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SchoolPurple, textAlign = TextAlign.Center)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                q.options.forEach { option ->
                    val member = family.find { it.name == option }
                    Button(
                        onClick = {
                            ElderlyFeedback.onTap(context)
                            if (!showFeedback) {
                                isCorrect = option == q.answer
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
                                option == q.answer -> SuccessGreen
                                else -> ErrorRed.copy(alpha = 0.3f)
                            }
                        ),
                        shape = RoundedCornerShape(12.dp),
                        enabled = !showFeedback
                    ) {
                        Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).semantics { contentDescription = option },
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(member?.emoji ?: "", fontSize = 24.sp)
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(option, fontSize = 16.sp, fontWeight = FontWeight.Medium, color = if (!showFeedback) SchoolPurple else Color.White)
                        }
                    }
                }

                if (showFeedback) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {
                            ElderlyFeedback.onTap(context)
                            currentQuestion++
                            showFeedback = false
                            if (currentQuestion >= questions.size) showResult = true
                        },
                        modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Next question" },
                        colors = ButtonDefaults.buttonColors(containerColor = SchoolPurple)
                    ) {
                        Text("Next", fontSize = 16.sp, color = Color.White)
                    }
                }
            }
        }

        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = { Text("Memory Master!", fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center) },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83E\uDDE0", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Correct: $correctCount / ${questions.size}", fontSize = 20.sp)
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = SchoolPurple)
                    }
                },
                confirmButton = {
                    Button(onClick = { ElderlyFeedback.onTap(context); level++; showResult = false }, modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Next Level" }) {
                        Text("Next Level", fontSize = 18.sp)
                    }
                }
            )
        }
    }
}
