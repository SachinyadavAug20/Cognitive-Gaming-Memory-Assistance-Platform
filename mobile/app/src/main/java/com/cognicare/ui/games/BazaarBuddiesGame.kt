package com.cognicare.ui.games

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
private val InkSecondary = Color(0xFF4A4036)
private val CanvasBg = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val Brick = Color(0xFFC5221F)
private val WarmSurface = Color(0xFFFFFDF9)

data class MarketProduct(
    val id: String,
    val name: String,
    val nativeName: String,
    val price: Int,
    val emoji: String,
    val unit: String,
    val isTarget: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BazaarBuddiesGame(onBack: () -> Unit) {
    val context = LocalContext.current

    // Budget: ₹200
    val budget = 200

    // Stalls produce inventory
    val allProducts = remember {
        listOf(
            MarketProduct("1", "Fresh Assam Tea", "অসমৰ ৰঙা চাহ", 40, "🍵", "packet", isTarget = true),
            MarketProduct("2", "River Fish (Rou)", "ৰৌ মাছ", 65, "🐟", "fresh cut", isTarget = true),
            MarketProduct("3", "Organic Green Saag", "লফা শাক", 20, "🥬", "bundle", isTarget = true),
            MarketProduct("4", "Kazi Nemu Lemons", "কাজী নেমু", 15, "🍋", "3 lemons", isTarget = true),
            MarketProduct("5", "Aromatic Joha Rice", "জহা চাউল", 50, "🌾", "1 kg", isTarget = false),
            MarketProduct("6", "Coconut Laru", "নাৰিকলৰ লাৰু", 30, "🥥", "box", isTarget = false),
            MarketProduct("7", "Fresh Ginger & Garlic", "আদা-নহৰু", 25, "🧄", "pack", isTarget = false)
        )
    }

    val targetProducts = remember { allProducts.filter { it.isTarget } }
    val targetIds = remember { targetProducts.map { it.id }.toSet() }

    // Phase: "list" -> "market" -> "cashier" -> "receipt"
    var phase by remember { mutableStateOf("list") }
    val cart = remember { mutableStateMapOf<String, Int>() }

    // Cashier state
    var selectedNote by remember { mutableStateOf<Int?>(null) }
    var selectedChangeChoice by remember { mutableStateOf<Int?>(null) }
    var isChangeCorrect by remember { mutableStateOf<Boolean?>(null) }

    val totalCost = cart.entries.sumOf { (id, count) ->
        val item = allProducts.find { it.id == id }
        (item?.price ?: 0) * count
    }

    val allTargetsCollected = targetIds.all { (cart[it] ?: 0) >= 1 }
    val expectedChange = (selectedNote ?: 0) - totalCost

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🛒 Going to Market (Bazaar)",
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(CanvasBg)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            when (phase) {
                // ── PHASE 1: SHOPPING LIST MEMORIZATION ──
                "list" -> {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(4.dp, RoundedCornerShape(22.dp))
                            .border(3.dp, Ink, RoundedCornerShape(22.dp)),
                        shape = RoundedCornerShape(22.dp),
                        color = WarmSurface
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(text = "📋", fontSize = 26.sp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Today's Shopping List",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black,
                                        fontFamily = FontFamily.Serif,
                                        color = Ink
                                    )
                                }
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = Color(0xFFDCFCE7),
                                    modifier = Modifier.border(1.5.dp, TeaGreen, RoundedCornerShape(8.dp))
                                ) {
                                    Text(
                                        text = "Budget: ₹$budget",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Black,
                                        color = TeaGreen,
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Your family asked you to buy these 4 items for today's lunch & tea:",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = InkSecondary
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            targetProducts.forEach { item ->
                                Surface(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 5.dp)
                                        .shadow(1.dp, RoundedCornerShape(14.dp))
                                        .border(2.dp, Ink, RoundedCornerShape(14.dp)),
                                    shape = RoundedCornerShape(14.dp),
                                    color = Color.White
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(text = item.emoji, fontSize = 28.sp)
                                        Spacer(modifier = Modifier.width(14.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(text = item.name, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink)
                                            Text(text = item.nativeName, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TeaGreen)
                                        }
                                        Text(
                                            text = "₹${item.price}",
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Marigold
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            // Enter Market Button
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                                    .shadow(3.dp, RoundedCornerShape(14.dp))
                                    .border(2.5.dp, Ink, RoundedCornerShape(14.dp))
                                    .clickable {
                                        ElderlyFeedback.onTap(context)
                                        phase = "market"
                                        LocalizationManager.speak("Welcome to the morning bazaar! Find your items and add them to your bamboo basket.")
                                    },
                                shape = RoundedCornerShape(14.dp),
                                color = TeaGreen
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxSize(),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "ENTER MORNING BAZAAR ➔",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White,
                                        letterSpacing = 0.5.sp
                                    )
                                }
                            }
                        }
                    }
                }

                // ── PHASE 2: MARKET STALLS & BASKET COLLECTION ──
                "market" -> {
                    // Header Status (Budget & Basket Total)
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color.White,
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(3.dp, RoundedCornerShape(16.dp))
                            .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "Budget: ₹$budget",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Ink
                                )
                                Text(
                                    text = "Remaining: ₹${budget - totalCost}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (totalCost > budget) Brick else TeaGreen
                                )
                            }

                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (allTargetsCollected) TeaGreen else Marigold,
                                modifier = Modifier
                                    .shadow(2.dp, RoundedCornerShape(12.dp))
                                    .border(2.dp, Ink, RoundedCornerShape(12.dp))
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(Icons.Filled.ShoppingCart, null, tint = Color.White, modifier = Modifier.size(18.dp))
                                    Text(
                                        text = "Basket: ₹$totalCost",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Target Checklist Pill
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFFEF3C7),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.5.dp, Ink, RoundedCornerShape(12.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "🎯 Need:", fontSize = 12.sp, fontWeight = FontWeight.Black, color = Ink)
                            Spacer(modifier = Modifier.width(6.dp))
                            targetProducts.forEach { p ->
                                val inCart = (cart[p.id] ?: 0) > 0
                                Text(
                                    text = "${p.emoji} ${if (inCart) "✓" else "○"}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (inCart) TeaGreen else Color.Gray,
                                    modifier = Modifier.padding(horizontal = 4.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Market Stall Items
                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(allProducts) { item ->
                            val count = cart[item.id] ?: 0
                            val isTarget = item.isTarget
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = if (isTarget) Color.White else Color(0xFFF8F5EE),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .shadow(2.dp, RoundedCornerShape(14.dp))
                                    .border(2.dp, if (isTarget && count > 0) TeaGreen else Ink, RoundedCornerShape(14.dp))
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(48.dp)
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(if (count > 0) Color(0xFFDCFCE7) else Color(0xFFFEF3C7))
                                            .border(1.5.dp, Ink, RoundedCornerShape(12.dp)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(text = item.emoji, fontSize = 26.sp)
                                    }

                                    Spacer(modifier = Modifier.width(12.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(text = item.name, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Ink)
                                            if (isTarget) {
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Surface(
                                                    shape = RoundedCornerShape(6.dp),
                                                    color = Color(0xFFFEF3C7),
                                                    modifier = Modifier.border(1.dp, Ink, RoundedCornerShape(6.dp))
                                                ) {
                                                    Text(
                                                        text = "List",
                                                        fontSize = 9.sp,
                                                        fontWeight = FontWeight.Black,
                                                        color = Ink,
                                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                                    )
                                                }
                                            }
                                        }
                                        Text(
                                            text = "₹${item.price} • ${item.unit}",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Marigold
                                        )
                                    }

                                    // Add / Remove buttons
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        if (count > 0) {
                                            Surface(
                                                shape = RoundedCornerShape(10.dp),
                                                color = Color(0xFFFEE2E2),
                                                modifier = Modifier
                                                    .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                                                    .clickable {
                                                        ElderlyFeedback.onTap(context)
                                                        if (count == 1) cart.remove(item.id) else cart[item.id] = count - 1
                                                    }
                                            ) {
                                                Text(
                                                    text = "−",
                                                    fontSize = 18.sp,
                                                    fontWeight = FontWeight.Black,
                                                    color = Brick,
                                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                                                )
                                            }
                                            Text(text = "$count", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink)
                                        }

                                        Surface(
                                            shape = RoundedCornerShape(10.dp),
                                            color = if (totalCost + item.price <= budget) TeaGreen else Color.LightGray,
                                            modifier = Modifier
                                                .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                                                .clickable {
                                                    if (totalCost + item.price <= budget) {
                                                        ElderlyFeedback.onTap(context)
                                                        cart[item.id] = count + 1
                                                    } else {
                                                        ElderlyFeedback.onError(context)
                                                        LocalizationManager.speak("Not enough budget remaining.")
                                                    }
                                                }
                                        ) {
                                            Text(
                                                text = "+",
                                                fontSize = 18.sp,
                                                fontWeight = FontWeight.Black,
                                                color = Color.White,
                                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Proceed to Cashier Button
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = if (totalCost > 0) Marigold else Color.Gray,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                            .shadow(3.dp, RoundedCornerShape(16.dp))
                            .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
                            .clickable(enabled = totalCost > 0) {
                                ElderlyFeedback.onTap(context)
                                phase = "cashier"
                                LocalizationManager.speak("At the cashier counter. Your total bill is ₹$totalCost. Select a note from your wallet to pay.")
                            }
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = if (allTargetsCollected) "PROCEED TO CASHIER COUNTER (₹$totalCost) ➔" else "GO TO CASHIER COUNTER (₹$totalCost) ➔",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                        }
                    }
                }

                // ── PHASE 3: CASHIER COUNTER & CURRENCY CHANGE MATH ──
                "cashier" -> {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(4.dp, RoundedCornerShape(22.dp))
                            .border(3.dp, Ink, RoundedCornerShape(22.dp)),
                        shape = RoundedCornerShape(22.dp),
                        color = WarmSurface
                    ) {
                        Column(modifier = Modifier.padding(18.dp)) {
                            Text(
                                text = "🏪 Cashier Counter",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Serif,
                                color = Ink
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "The shopkeeper smiles: 'Your total comes to ₹$totalCost.'",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TeaGreen
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            // Step A: Pick currency note from wallet
                            Text(
                                text = "1. Choose a note from your wallet to pay:",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Black,
                                color = InkSecondary
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                listOf(100, 200, 500).forEach { noteValue ->
                                    val isChosen = selectedNote == noteValue
                                    val canPay = noteValue >= totalCost
                                    Surface(
                                        shape = RoundedCornerShape(12.dp),
                                        color = when {
                                            isChosen -> Marigold
                                            canPay -> Color(0xFFFEF3C7)
                                            else -> Color(0xFFE5E7EB)
                                        },
                                        modifier = Modifier
                                            .weight(1f)
                                            .shadow(2.dp, RoundedCornerShape(12.dp))
                                            .border(2.dp, if (isChosen) Color.Black else Ink, RoundedCornerShape(12.dp))
                                            .clickable(enabled = canPay) {
                                                ElderlyFeedback.onTap(context)
                                                selectedNote = noteValue
                                                selectedChangeChoice = null
                                                isChangeCorrect = null
                                                LocalizationManager.speak("You handed ₹$noteValue note. How much change should you get back?")
                                            }
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(vertical = 12.dp),
                                            horizontalAlignment = Alignment.CenterHorizontally
                                        ) {
                                            Text(
                                                text = "₹$noteValue",
                                                fontSize = 18.sp,
                                                fontWeight = FontWeight.Black,
                                                color = if (isChosen) Color.White else if (canPay) Ink else Color.Gray
                                            )
                                            Text(
                                                text = if (canPay) "Note" else "Too small",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (isChosen) Color.White else InkSecondary
                                            )
                                        }
                                    }
                                }
                            }

                            // Step B: Calculate Change
                            if (selectedNote != null) {
                                Spacer(modifier = Modifier.height(18.dp))
                                Text(
                                    text = "2. How much change should the cashier give back?",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Black,
                                    color = InkSecondary
                                )
                                Text(
                                    text = "₹$selectedNote (You Paid) − ₹$totalCost (Total) = ?",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Black,
                                    color = TeaGreen
                                )

                                Spacer(modifier = Modifier.height(10.dp))

                                // Multiple choice change options
                                val choices = remember(selectedNote, totalCost) {
                                    val real = expectedChange
                                    listOf(real, real + 10, (real - 10).coerceAtLeast(5), real + 20).distinct().shuffled()
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    choices.forEach { choice ->
                                        val isThisSelected = selectedChangeChoice == choice
                                        val isRight = choice == expectedChange
                                        Surface(
                                            shape = RoundedCornerShape(12.dp),
                                            color = when {
                                                isThisSelected && isRight -> Color(0xFFDCFCE7)
                                                isThisSelected && !isRight -> Color(0xFFFEE2E2)
                                                else -> Color.White
                                            },
                                            modifier = Modifier
                                                .weight(1f)
                                                .shadow(2.dp, RoundedCornerShape(12.dp))
                                                .border(2.dp, if (isThisSelected) TeaGreen else Ink, RoundedCornerShape(12.dp))
                                                .clickable {
                                                    selectedChangeChoice = choice
                                                    if (choice == expectedChange) {
                                                        isChangeCorrect = true
                                                        ElderlyFeedback.onSuccess(context)
                                                        LocalizationManager.speak("Correct! ₹$expectedChange is your change. Shopping complete!")
                                                    } else {
                                                        isChangeCorrect = false
                                                        ElderlyFeedback.onError(context)
                                                        LocalizationManager.speak("Not quite. Check your calculation again.")
                                                    }
                                                }
                                        ) {
                                            Box(
                                                modifier = Modifier.padding(vertical = 12.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(
                                                    text = "₹$choice",
                                                    fontSize = 17.sp,
                                                    fontWeight = FontWeight.Black,
                                                    color = if (isThisSelected && isRight) TeaGreen else Ink
                                                )
                                            }
                                        }
                                    }
                                }

                                if (isChangeCorrect == true) {
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Surface(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(52.dp)
                                            .shadow(3.dp, RoundedCornerShape(14.dp))
                                            .border(2.dp, Ink, RoundedCornerShape(14.dp))
                                            .clickable {
                                                ElderlyFeedback.onTap(context)
                                                phase = "receipt"
                                            },
                                        shape = RoundedCornerShape(14.dp),
                                        color = TeaGreen
                                    ) {
                                        Box(
                                            modifier = Modifier.fillMaxSize(),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "GET BAZAAR RECEIPT ➔",
                                                fontSize = 15.sp,
                                                fontWeight = FontWeight.Black,
                                                color = Color.White
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // ── PHASE 4: PRINTED RECEIPT & CELEBRATION ──
                "receipt" -> {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(4.dp, RoundedCornerShape(22.dp))
                            .border(3.dp, Ink, RoundedCornerShape(22.dp)),
                        shape = RoundedCornerShape(22.dp),
                        color = Color.White
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Silpukhuri Daily Bazaar",
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Black,
                                        fontFamily = FontFamily.Serif,
                                        color = Ink
                                    )
                                    Text(
                                        text = "Official Customer Receipt",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = InkSecondary
                                    )
                                }
                                Text(text = "🎉", fontSize = 28.sp)
                            }

                            Spacer(modifier = Modifier.height(14.dp))
                            HorizontalDivider(thickness = 2.dp, color = Ink)
                            Spacer(modifier = Modifier.height(10.dp))

                            // Itemized purchases
                            cart.forEach { (id, count) ->
                                val item = allProducts.find { it.id == id } ?: return@forEach
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "${item.emoji} ${item.name} × $count",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Ink
                                    )
                                    Text(
                                        text = "₹${item.price * count}",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Ink
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))
                            HorizontalDivider(thickness = 1.dp, color = Color.LightGray)
                            Spacer(modifier = Modifier.height(10.dp))

                            // Financials
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Total Bill", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink)
                                Text(text = "₹$totalCost", fontSize = 16.sp, fontWeight = FontWeight.Black, color = TeaGreen)
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Paid Note", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = InkSecondary)
                                Text(text = "₹$selectedNote", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Ink)
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Change Returned", fontSize = 14.sp, fontWeight = FontWeight.Black, color = TeaGreen)
                                Text(text = "₹$expectedChange", fontSize = 14.sp, fontWeight = FontWeight.Black, color = TeaGreen)
                            }

                            Spacer(modifier = Modifier.height(18.dp))

                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color(0xFFDCFCE7),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.5.dp, TeaGreen, RoundedCornerShape(12.dp))
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(
                                        text = "⭐ +120 Executive Function XP Earned!",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Black,
                                        color = TeaGreen
                                    )
                                    Text(
                                        text = "You successfully remembered the shopping list, managed your ₹$budget budget, and calculated the correct currency change.",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Ink,
                                        lineHeight = 16.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Action buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(48.dp)
                                        .shadow(2.dp, RoundedCornerShape(12.dp))
                                        .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                        .clickable {
                                            cart.clear()
                                            selectedNote = null
                                            selectedChangeChoice = null
                                            isChangeCorrect = null
                                            phase = "list"
                                        },
                                    shape = RoundedCornerShape(12.dp),
                                    color = Color.White
                                ) {
                                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                        Text(text = "Shop Again ⟳", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink)
                                    }
                                }

                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(48.dp)
                                        .shadow(2.dp, RoundedCornerShape(12.dp))
                                        .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                        .clickable { onBack() },
                                    shape = RoundedCornerShape(12.dp),
                                    color = TeaGreen
                                ) {
                                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                        Text(text = "Done ✓", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
