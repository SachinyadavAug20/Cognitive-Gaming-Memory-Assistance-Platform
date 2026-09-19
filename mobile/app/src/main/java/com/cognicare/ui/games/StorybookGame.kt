package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val CanvasBg = Color(0xFFFAF7F2)
private val StoryOrange = Color(0xFFE65100)
private val WarmSurface = Color(0xFFFFFDF9)

private data class StoryLevel(val title: String, val template: String, val blanks: List<Pair<Int, List<String>>>, val answers: List<String>)

private val stories = listOf(
    StoryLevel("The Clever Fox", "A clever fox found a {} hanging from a tree. It jumped up and grabbed the {}. The fox shared it with its {} and they all felt happy.",
        listOf(2 to listOf("mango", "stone", "leaf"), 2 to listOf("mango", "stick", "flower"), 2 to listOf("fox", "bird", "friend")), listOf("mango", "mango", "friend")),
    StoryLevel("River Friend", "Ravi went to the {} near his village. He saw a big {} in the water. His {} said it was safe to swim there.",
        listOf(2 to listOf("river", "mountain", "forest"), 2 to listOf("fish", "rock", "tree"), 2 to listOf("grandmother", "brother", "teacher")), listOf("river", "fish", "grandmother")),
    StoryLevel("Morning Tea", "Every morning, {} makes tea for the family. She puts {} leaves and warm milk in the pot. The whole house smells of {}.",
        listOf(2 to listOf("grandmother", "mother", "aunt"), 2 to listOf("tea", "coffee", "spice"), 2 to listOf("tea", "flowers", "incense")), listOf("grandmother", "tea", "tea"))
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StorybookGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(0) }
    var currentBlank by remember { mutableIntStateOf(0) }
    var answers by remember { mutableStateOf(mutableListOf<String>()) }
    var showResult by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }

    val story = stories[level % stories.size]

    fun checkAnswer() {
        val correct = answers.size == story.answers.size && answers.zip(story.answers).all { (a, b) -> a == b }
        isCorrect = correct; showResult = true
        if (correct) { score += 30 * (level + 1); ElderlyFeedback.onSuccess(context); LocalizationManager.speak("Beautiful story!") }
        else { ElderlyFeedback.onError(context); LocalizationManager.speak("Not quite. The story goes differently.") }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("\uD83D\uDCD6 Grandmother's Tales", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = StoryOrange)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(12.dp).verticalScroll(rememberScrollState())) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text("Story ${level + 1}/${stories.size}", fontSize = 12.sp, color = StoryOrange, fontWeight = FontWeight.Bold) }
                }
            }
            Spacer(Modifier.height(12.dp))

            if (showResult) {
                Surface(Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(if (isCorrect) "\uD83D\uDCD5" else "\uD83D\uDCD4", fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(if (isCorrect) "Story Complete!" else "Different Ending", fontSize = 22.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink)
                        Spacer(Modifier.height(12.dp))
                        Surface(shape = RoundedCornerShape(12.dp), color = if (isCorrect) Color(0xFFFFF3E0) else Color(0xFFFCE4EC), modifier = Modifier.border(1.5.dp, StoryOrange, RoundedCornerShape(12.dp))) {
                            Column(Modifier.padding(12.dp)) {
                                Text(if (isCorrect) "+${30 * (level + 1)} Reminiscence XP!" else "The correct words were: ${story.answers.joinToString(", ")}", fontSize = 13.sp, fontWeight = FontWeight.Black, color = StoryOrange)
                            }
                        }
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { ElderlyFeedback.onTap(context); level = (level + 1) % stories.size; currentBlank = 0; answers = mutableListOf(); showResult = false }, RoundedCornerShape(12.dp), Color.White) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Next Story \u27A1", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink) }
                            }
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { onBack() }, RoundedCornerShape(12.dp), StoryOrange) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White) }
                            }
                        }
                    }
                }
            } else {
                // Story card
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(20.dp)) {
                        Text(story.title, fontSize = 20.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = StoryOrange)
                        Spacer(Modifier.height(12.dp))
                        val displayText = buildString {
                            append(story.template)
                            answers.forEachIndexed { idx, ans -> replaceFirst("{}", "\uD83D\uDD35$ans\uD83D\uDD35") }
                        }
                        Text(displayText, fontSize = 16.sp, fontWeight = FontWeight.Medium, color = Ink, lineHeight = 26.sp)
                    }
                }

                Spacer(Modifier.height(16.dp))

                if (currentBlank < story.blanks.size) {
                    val blankInfo = story.blanks[currentBlank]
                    Text("Choose word ${currentBlank + 1}:", fontSize = 14.sp, fontWeight = FontWeight.Black, color = StoryOrange, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
                    Spacer(Modifier.height(8.dp))
                    Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            blankInfo.second.forEach { option ->
                                Surface(shape = RoundedCornerShape(12.dp), color = Color.White, modifier = Modifier.fillMaxWidth().shadow(1.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable {
                                    ElderlyFeedback.onTap(context)
                                    answers.add(option); currentBlank++
                                    if (currentBlank >= story.blanks.size) checkAnswer()
                                    LocalizationManager.speak(option)
                                }) {
                                    Text(option, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Ink, modifier = Modifier.padding(14.dp), textAlign = TextAlign.Center)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
