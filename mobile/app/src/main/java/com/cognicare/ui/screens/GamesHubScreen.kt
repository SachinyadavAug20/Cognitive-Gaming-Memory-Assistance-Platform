package com.cognicare.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.components.DomainFilterChip
import com.cognicare.ui.components.FloatingCallCaregiverButton
import com.cognicare.ui.games.*
import com.cognicare.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GamesHubScreen(
    onGameClick: (String) -> Unit,
    onBack: () -> Unit
) {
    var selectedDomain by remember { mutableStateOf<CognitiveDomain?>(null) }
    val allGames = remember { GameRegistry.getAllGames() }

    val filteredGames = remember(selectedDomain) {
        if (selectedDomain == null) allGames
        else allGames.filter { it.domain == selectedDomain }
    }

    // Domain filter chips matching website
    val domainFilters = listOf(
        Triple(null, "All Activities", allGames.size),
        Triple(CognitiveDomain.MEMORY, "Memory & Recall", allGames.count { it.domain == CognitiveDomain.MEMORY }),
        Triple(CognitiveDomain.ATTENTION, "Attention & Focus", allGames.count { it.domain == CognitiveDomain.ATTENTION }),
        Triple(CognitiveDomain.EXECUTIVE, "Daily Routine", allGames.count { it.domain == CognitiveDomain.EXECUTIVE }),
        Triple(CognitiveDomain.VISUOSPATIAL, "Patterns & Art", allGames.count { it.domain == CognitiveDomain.VISUOSPATIAL }),
        Triple(CognitiveDomain.LANGUAGE, "Hands & Movement", allGames.count { it.domain == CognitiveDomain.LANGUAGE }),
        Triple(CognitiveDomain.CALM, "Calm & Music", allGames.count { it.domain == CognitiveDomain.CALM }),
        Triple(CognitiveDomain.REMINISCENCE, "Reminiscence", allGames.count { it.domain == CognitiveDomain.REMINISCENCE }),
        Triple(CognitiveDomain.ADVANCED, "Advanced 3D", allGames.count { it.domain == CognitiveDomain.ADVANCED }),
    )

    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(Color.White.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "\uD83E\uDDE0", fontSize = 16.sp)
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "CogniCare",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Green40,
                        titleContentColor = Color.White
                    )
                )
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(WarmWhite)
            ) {
                // Page header
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Green40)
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                ) {
                    Text(
                        text = "\u2728 Daily Activities",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Choose a game to exercise your brain",
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Domain filter chips (scrollable horizontal)
                LazyRow(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(domainFilters) { (domain, label, count) ->
                        DomainFilterChip(
                            label = label,
                            count = count,
                            emoji = when (domain) {
                                null -> "\uD83C\uDFAF"
                                CognitiveDomain.MEMORY -> "\uD83E\uDDE0"
                                CognitiveDomain.ATTENTION -> "\uD83D\uDCA1"
                                CognitiveDomain.EXECUTIVE -> "\u2699\uFE0F"
                                CognitiveDomain.VISUOSPATIAL -> "\uD83D\uDDFA\uFE0F"
                                CognitiveDomain.LANGUAGE -> "\uD83D\uDCD6"
                                CognitiveDomain.CALM -> "\uD83C\uDFB5"
                                CognitiveDomain.REMINISCENCE -> "\uD83E\uDDE1"
                                CognitiveDomain.ADVANCED -> "\uD83D\uDD25"
                            },
                            isSelected = selectedDomain == domain,
                            onClick = { selectedDomain = domain }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Game grid (2-column matching website)
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredGames) { game ->
                        WebsiteGameCard(
                            game = game,
                            onClick = { onGameClick(game.id) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }

        // Floating Call Caregiver button
        FloatingCallCaregiverButton(
            onClick = { },
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 16.dp, bottom = 24.dp)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun WebsiteGameCard(
    game: GameConfig,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.height(200.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = when (game.domain) {
                CognitiveDomain.CALM -> ChurchBlue
                CognitiveDomain.EXECUTIVE, CognitiveDomain.ATTENTION -> CardOrange
                else -> CardGreen
            }
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Title + speaker icon row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = game.title,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        maxLines = 2
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = game.domain.label.uppercase(),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White.copy(alpha = 0.7f),
                        letterSpacing = 1.sp
                    )
                }
                Surface(
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.2f),
                    modifier = Modifier.size(32.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(text = "\uD83D\uDD0A", fontSize = 14.sp)
                    }
                }
            }

            // Game emoji icon
            Box(
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .size(72.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White),
                contentAlignment = Alignment.Center
            ) {
                Text(text = game.emoji, fontSize = 40.sp)
            }

            // Action button
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                color = Color.White.copy(alpha = 0.2f),
                onClick = onClick
            ) {
                Text(
                    text = "Start ${game.title.split(" ").first()} \u2192",
                    modifier = Modifier.padding(vertical = 10.dp),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}
