package com.cognicare.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Send
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
private val RoseTheme = Color(0xFFE11D48)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FamilyPortalScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var loveNote by remember { mutableStateOf("") }
    var noteSent by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "❤️ Family & Grandchildren",
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Serif,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = RoseTheme)
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
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color.White,
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(2.5.dp, Ink, RoundedCornerShape(20.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Baba's Wellbeing Status",
                            fontWeight = FontWeight.Black,
                            fontSize = 16.sp,
                            color = Ink
                        )
                        Text(
                            text = "Amma/Baba is active and feeling peaceful today. Played Card Mastery at 9:30 AM with 94% accuracy!",
                            fontSize = 13.sp,
                            color = InkSecondary
                        )
                    }
                }
            }

            // Send Note Section
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xFFFFF1F2),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(2.5.dp, Ink, RoundedCornerShape(20.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Send Love Note to Baba",
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            color = Ink
                        )

                        OutlinedTextField(
                            value = loveNote,
                            onValueChange = { loveNote = it },
                            placeholder = { Text("Write warm words for Baba...") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )

                        Button(
                            onClick = {
                                if (loveNote.isNotBlank()) {
                                    ElderlyFeedback.onSuccess(context)
                                    noteSent = true
                                    loveNote = ""
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = RoseTheme),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Filled.Send, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (noteSent) "✓ Love Note Sent to Baba!" else "Send Note",
                                fontWeight = FontWeight.Black
                            )
                        }
                    }
                }
            }
        }
    }
}
