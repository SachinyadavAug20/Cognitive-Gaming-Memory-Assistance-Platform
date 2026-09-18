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
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.HapticUtil
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)

data class RecipeStep(
    val stepNumber: Int,
    val text: String,
    val emoji: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HeritageKitchenGame(onBack: () -> Unit) {
    val context = LocalContext.current
    val recipeSteps = remember {
        listOf(
            RecipeStep(1, "Peel & dice raw papaya into bite-sized pieces", "🔪"),
            RecipeStep(2, "Heat pure mustard oil in an iron Kadhai", "🍳"),
            RecipeStep(3, "Add pinch of Panch Phoron & crushed garlic", "🧄"),
            RecipeStep(4, "Pour natural banana-peel Kolakhar extract", "🥣"),
            RecipeStep(5, "Simmer until tender & serve with steamed rice", "🍚")
        )
    }

    // Scrambled choices
    val shuffledSteps = remember { recipeSteps.shuffled() }
    val completedSteps = remember { mutableStateListOf<Int>() }
    var nextExpectedStep by remember { mutableIntStateOf(1) }
    var isDishDone by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🍲 " + LocalizationManager.t("games.kitchen.title"),
                        fontWeight = FontWeight.Black,
                        color = Ink
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = Ink)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Canvas)
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Recipe Header Banner
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(3.dp, RoundedCornerShape(16.dp))
                    .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFFFFFBEB))
                            .border(2.dp, Ink, RoundedCornerShape(14.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "🍲", fontSize = 30.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Traditional Assamese Khar",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink
                        )
                        Text(
                            text = "Tap each step in proper cooking order (Step $nextExpectedStep of 5)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Marigold
                        )
                    }
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = TeaGreen,
                        modifier = Modifier
                            .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                            .clickable {
                                LocalizationManager.speak("Tap the next cooking step in order.")
                            }
                    ) {
                        Icon(
                            imageVector = Icons.Filled.VolumeUp,
                            contentDescription = "Read",
                            tint = Color.White,
                            modifier = Modifier.padding(8.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Interactive Step Cards
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                itemsIndexed(shuffledSteps) { _, step ->
                    val isCompleted = completedSteps.contains(step.stepNumber)
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = if (isCompleted) Color(0xFFDCFCE7) else Color.White,
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(2.dp, RoundedCornerShape(14.dp))
                            .border(
                                width = 2.dp,
                                color = if (isCompleted) TeaGreen else Ink,
                                shape = RoundedCornerShape(14.dp)
                            )
                            .clickable(enabled = !isCompleted && !isDishDone) {
                                if (step.stepNumber == nextExpectedStep) {
                                    HapticUtil.vibrateSuccess(context)
                                    completedSteps.add(step.stepNumber)
                                    nextExpectedStep++
                                    if (nextExpectedStep > 5) {
                                        isDishDone = true
                                        LocalizationManager.speak("Delicious! Traditional Khar is ready to serve!")
                                    } else {
                                        LocalizationManager.speak("Step completed: ${step.text}")
                                    }
                                } else {
                                    HapticUtil.vibrateError(context)
                                    LocalizationManager.speak("Not quite yet! Look for Step $nextExpectedStep first.")
                                }
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = step.emoji, fontSize = 26.sp)
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = step.text,
                                fontSize = 14.sp,
                                fontWeight = if (isCompleted) FontWeight.Black else FontWeight.Bold,
                                color = if (isCompleted) TeaGreen else Ink,
                                modifier = Modifier.weight(1f)
                            )
                            if (isCompleted) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(TeaGreen),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Filled.Check, null, tint = Color.White, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Completion Banner
            if (isDishDone) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFFDCFCE7),
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(3.dp, RoundedCornerShape(16.dp))
                        .border(2.5.dp, TeaGreen, RoundedCornerShape(16.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "🎉 Recipe Completed!", fontSize = 18.sp, fontWeight = FontWeight.Black, color = TeaGreen)
                        Text(text = "You sequenced all 5 cooking steps accurately! +100 IADL Points", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Ink)
                    }
                }
            }
        }
    }
}
