package com.cognicare.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val CanvasBg = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val AmberGold = Color(0xFFF59E0B)

data class MealPresetItem(
    val id: String,
    val name: String,
    val emoji: String,
    val score: Int,
    val badge: String,
    val advice: String
)

private val SAMPLE_MEALS = listOf(
    MealPresetItem(
        id = "dal_rice",
        name = "Rice, Dal & Leafy Greens",
        emoji = "🍛",
        score = 94,
        badge = "🌟 Gold Brain Food",
        advice = "Superb plate! Green spinach and lentils nourish memory cells and keep blood sugar steady. Drink 1 glass of water after eating."
    ),
    MealPresetItem(
        id = "roti_sabji",
        name = "Roti & Mixed Vegetables",
        emoji = "🫓",
        score = 88,
        badge = "🌿 Steady Energy",
        advice = "Whole grains and seasonal vegetables support good blood flow to the brain. Take gentle bites and enjoy every flavor."
    ),
    MealPresetItem(
        id = "khichdi",
        name = "Warm Khichdi & Curd",
        emoji = "🍲",
        score = 91,
        badge = "🌸 Gentle & Calming",
        advice = "Gentle on your stomach! Curd provides healthy probiotics that help reduce anxiety and calm the mind."
    ),
    MealPresetItem(
        id = "fruits",
        name = "Fresh Fruits & Warm Milk",
        emoji = "🍌",
        score = 92,
        badge = "✨ Antioxidant Glow",
        advice = "Antioxidants from fresh fruits protect memory connections. Warm milk relaxes muscles and brings deep, peaceful rest."
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DietDashboardScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var selectedMeal by remember { mutableStateOf(SAMPLE_MEALS[0]) }
    var photoSnapped by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "📸 Meal Snap & Score",
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Serif,
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(CanvasBg)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Hero Camera Snap CTA
            item {
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = Color(0xFFFEF3C7),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(3.dp, Ink, RoundedCornerShape(24.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(text = "📸", fontSize = 32.sp)
                            Column {
                                Text(
                                    text = "Snap Your Plate",
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Serif,
                                    fontSize = 20.sp,
                                    color = Ink
                                )
                                Text(
                                    text = "Take a photo or tap what you eat for a simple score!",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = InkSecondary
                                )
                            }
                        }

                        Button(
                            onClick = {
                                ElderlyFeedback.onTap(context)
                                ElderlyFeedback.onSuccess(context)
                                photoSnapped = true
                            },
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = TeaGreen),
                            modifier = Modifier.fillMaxWidth().height(52.dp)
                        ) {
                            Text(
                                text = "Take Plate Photo 📷",
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp,
                                color = Color.White
                            )
                        }
                    }
                }
            }

            // Quick Meal Presets
            item {
                Text(
                    text = "Or tap what you are eating:",
                    fontWeight = FontWeight.Black,
                    fontSize = 14.sp,
                    color = Ink
                )
            }

            items(SAMPLE_MEALS) { meal ->
                val isSelected = (!photoSnapped && selectedMeal.id == meal.id)
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = if (isSelected) Color(0xFFFDE68A) else Color.White,
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(
                            width = if (isSelected) 3.dp else 1.5.dp,
                            color = if (isSelected) Ink else Color.LightGray,
                            shape = RoundedCornerShape(18.dp)
                        )
                        .clickable {
                            ElderlyFeedback.onTap(context)
                            photoSnapped = false
                            selectedMeal = meal
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text(text = meal.emoji, fontSize = 26.sp)
                            Column {
                                Text(text = meal.name, fontWeight = FontWeight.Black, fontSize = 14.sp, color = Ink)
                                Text(text = meal.badge, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = TeaGreen)
                            }
                        }
                        Text(
                            text = "${meal.score}/100",
                            fontWeight = FontWeight.Black,
                            fontSize = 14.sp,
                            color = Ink
                        )
                    }
                }
            }

            // Simple Score & Advice Spotlight Card
            item {
                Surface(
                    shape = RoundedCornerShape(22.dp),
                    color = Color.White,
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(3.dp, Ink, RoundedCornerShape(22.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = TeaGreen
                            ) {
                                Text(
                                    text = "🌟 Score: ${if (photoSnapped) 92 else selectedMeal.score} / 100",
                                    color = Color.White,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 14.sp,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                )
                            }
                            Text(
                                text = if (photoSnapped) "Your Fresh Plate 📸" else selectedMeal.badge,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = AmberGold
                            )
                        }

                        Text(
                            text = if (photoSnapped) "Your Meal Photo" else selectedMeal.name,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Serif,
                            fontSize = 18.sp,
                            color = Ink
                        )

                        Text(
                            text = "\"${if (photoSnapped) "Wholesome and nourishing! This meal provides steady glucose and sharp memory focus. Drink 1 glass of water after eating." else selectedMeal.advice}\"",
                            fontWeight = FontWeight.Medium,
                            fontSize = 13.sp,
                            lineHeight = 20.sp,
                            color = InkSecondary
                        )

                        Button(
                            onClick = {
                                ElderlyFeedback.onTap(context)
                                ElderlyFeedback.onSuccess(context)
                            },
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = AmberGold),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "🔊 Listen to Advice",
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp,
                                color = Color.Black
                            )
                        }
                    }
                }
            }
        }
    }
}
