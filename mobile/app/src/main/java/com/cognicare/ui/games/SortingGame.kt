package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val CanvasBg = Color(0xFFFAF7F2)
private val SortBrown = Color(0xFF5D4037)
private val WarmSurface = Color(0xFFFFFDF9)

private data class SortItem(val emoji: String, val name: String, val category: String)

private val levels = listOf(
    "Kitchen vs Bathroom" to listOf(
        SortItem("\uD83E\uDDF4", "Plate", "Kitchen"), SortItem("\uD83C\uDF73", "Pan", "Kitchen"),
        SortItem("\uD83D\uDCBF", "Toothbrush", "Bathroom"), SortItem("\uD83D\uDEBF", "Bucket", "Bathroom"),
        SortItem("\u2615", "Mug", "Kitchen"), SortItem("\uD83D\uFCBC", "Soap", "Bathroom")
    ),
    "Living vs Bedroom" to listOf(
        SortItem("\uD83D\uDCBA", "Table", "Living"), SortItem("\uD83C\uDFD8\uFE0F", "Sofa", "Living"),
        SortItem("\uD83D\uDECF\uFE0F", "Bed", "Bedroom"), SortItem("\uD83D\uDECE\uFE0F", "Wardrobe", "Bedroom"),
        SortItem("\uD83C\uDF9E", "Fan", "Living"), SortItem("\uD83C\uDF1F", "Night Lamp", "Bedroom")
    ),
    "Garden vs Kitchen" to listOf(
        SortItem("\uD83C\uDF31", "Plant", "Garden"), SortItem("\u2600\uFE0F", "Sun", "Garden"),
        SortItem("\uD83C\uDF72", "Pot", "Kitchen"), SortItem("\uD83D\uDD2C", "Knife", "Kitchen"),
        SortItem("\uD83E\uDD8C", "Cat", "Garden"), SortItem("\uD83D\uDCBF", "Cup", "Kitchen")
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SortingGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(0) }
    var sorted by remember { mutableStateOf(mapOf<String, List<SortItem>>()) }
    var showResult by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }

    val (levelName, allItems) = levels[level % levels.size]
    val categories = allItems.map { it.category }.distinct()
    val unsortedItems = allItems.filter { item -> sorted.values.flatten().none { it.name == item.name } }

    fun checkSort() {
        isCorrect = categories.all { cat -> (sorted[cat] ?: emptyList()).all { it.category == cat } && (sorted[cat]?.size ?: 0) == allItems.count { it.category == cat } }
        showResult = true
        if (isCorrect) { score += categories.size * 15; ElderlyFeedback.onSuccess(context); LocalizationManager.speak("All items sorted correctly!") }
        else { ElderlyFeedback.onError(context); LocalizationManager.speak("Some items are in the wrong category.") }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("\uD83E\uDDF4 Sorting ($levelName)", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SortBrown)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(12.dp)) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text(levelName, fontSize = 12.sp, color = SortBrown, fontWeight = FontWeight.Bold) }
                    Text("${unsortedItems.size} left", fontSize = 14.sp, fontWeight = FontWeight.Black, color = SortBrown)
                }
            }
            Spacer(Modifier.height(8.dp))

            if (showResult) {
                Surface(Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(if (isCorrect) "\uD83C\uDFAF" else "\u274C", fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(if (isCorrect) "Sorting Master!" else "Try Again!", fontSize = 22.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink)
                        Spacer(Modifier.height(16.dp))
                        Surface(shape = RoundedCornerShape(12.dp), color = if (isCorrect) Color(0xFFEFEBE9) else Color(0xFFFCE4EC), modifier = Modifier.border(1.5.dp, SortBrown, RoundedCornerShape(12.dp))) {
                            Text(if (isCorrect) "+${categories.size * 15} Executive XP!" else "Each item belongs in its correct room.", fontSize = 13.sp, fontWeight = FontWeight.Black, color = SortBrown, modifier = Modifier.padding(12.dp))
                        }
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { ElderlyFeedback.onTap(context); level = (level + 1) % levels.size; sorted = mapOf(); showResult = false }, RoundedCornerShape(12.dp), Color.White) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Next \u27A1", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink) }
                            }
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { onBack() }, RoundedCornerShape(12.dp), SortBrown) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White) }
                            }
                        }
                    }
                }
            } else {
                // Category bins
                Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    categories.forEach { cat ->
                        Surface(Modifier.weight(1f).shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), Color.White) {
                            Column(Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(cat, fontSize = 13.sp, fontWeight = FontWeight.Black, color = SortBrown)
                                Spacer(Modifier.height(6.dp))
                                val catItems = sorted[cat] ?: emptyList()
                                catItems.forEach { item ->
                                    Surface(shape = RoundedCornerShape(8.dp), color = Color(0xFFEFEBE9), modifier = Modifier.padding(vertical = 2.dp).fillMaxWidth().clickable {
                                        ElderlyFeedback.onTap(context)
                                        sorted = sorted.toMutableMap().also { m -> m[cat] = (m[cat] ?: emptyList()) - item }
                                    }) {
                                        Row(Modifier.padding(6.dp), verticalAlignment = Alignment.CenterVertically) { Text(item.emoji, fontSize = 16.sp); Spacer(Modifier.width(4.dp)); Text(item.name, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Ink) }
                                    }
                                }
                                if (catItems.isEmpty()) {
                                    Text("Tap item below", fontSize = 10.sp, color = Color.Gray, modifier = Modifier.padding(4.dp))
                                }
                            }
                        }
                    }
                }

                Spacer(Modifier.height(8.dp))

                if (unsortedItems.isEmpty()) {
                    Surface(Modifier.fillMaxWidth().height(52.dp).shadow(3.dp, RoundedCornerShape(14.dp)).border(2.dp, Ink, RoundedCornerShape(14.dp)).clickable { ElderlyFeedback.onTap(context); checkSort() }, RoundedCornerShape(14.dp), SortBrown) {
                        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("CHECK SORTING \u2714", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color.White) }
                    }
                } else {
                    Text("Tap an item to sort it:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = SortBrown, modifier = Modifier.fillMaxWidth(), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                    Spacer(Modifier.height(6.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        unsortedItems.take(4).forEach { item ->
                            Surface(shape = RoundedCornerShape(12.dp), color = Color.White, modifier = Modifier.weight(1f).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable {
                                ElderlyFeedback.onTap(context)
                                sorted = sorted.toMutableMap().also { m -> m[item.category] = (m[item.category] ?: emptyList()) + item }
                                LocalizationManager.speak("Placing ${item.name} in ${item.category}")
                                if (unsortedItems.size == 1) { checkSort() }
                            }) {
                                Column(Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(item.emoji, fontSize = 22.sp)
                                    Spacer(Modifier.height(2.dp))
                                    Text(item.name, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Ink, maxLines = 1)
                                    Text("\u2191 ${item.category}", fontSize = 8.sp, color = SortBrown)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
