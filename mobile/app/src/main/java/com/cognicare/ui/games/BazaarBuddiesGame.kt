package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ShoppingCart
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
private val Brick = Color(0xFFC5221F)

data class BazaarItem(
    val id: String,
    val name: String,
    val price: Int,
    val emoji: String,
    val unit: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BazaarBuddiesGame(onBack: () -> Unit) {
    val context = LocalContext.current
    val budget = 150
    val marketItems = remember {
        listOf(
            BazaarItem("1", "Fresh Assam Tea", 40, "🍵", "packet"),
            BazaarItem("2", "River Fish (Rou)", 60, "🐟", "cut"),
            BazaarItem("3", "Organic Green Saag", 20, "🥬", "bundle"),
            BazaarItem("4", "Local Lemons (Kazi Nemu)", 15, "🍋", "3 pcs"),
            BazaarItem("5", "Coconut Laru", 25, "🥥", "box"),
            BazaarItem("6", "Fresh Ginger & Garlic", 20, "🧄", "pack")
        )
    }

    val cart = remember { mutableStateMapOf<String, Int>() }
    var isPaid by remember { mutableStateOf(false) }

    val totalCost = cart.entries.sumOf { (id, count) ->
        val item = marketItems.find { it.id == id }
        (item?.price ?: 0) * count
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🛒 " + LocalizationManager.t("games.bazaarBuddies.title"),
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
                .padding(16.dp)
        ) {
            // Budget Status Bar
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
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "Your Budget: ₹$budget", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink)
                        Text(
                            text = "Remaining: ₹${budget - totalCost}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (totalCost > budget) Brick else TeaGreen
                        )
                    }
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (totalCost > budget) Brick else TeaGreen,
                        modifier = Modifier
                            .shadow(2.dp, RoundedCornerShape(12.dp))
                            .border(1.5.dp, Ink, RoundedCornerShape(12.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Filled.ShoppingCart, null, tint = Color.White, modifier = Modifier.size(18.dp))
                            Text(text = "₹$totalCost", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Items List
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(marketItems) { item ->
                    val count = cart[item.id] ?: 0
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = Color.White,
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(2.dp, RoundedCornerShape(14.dp))
                            .border(2.dp, Ink, RoundedCornerShape(14.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(50.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0xFFFEF3C7))
                                    .border(2.dp, Ink, RoundedCornerShape(12.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = item.emoji, fontSize = 28.sp)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = item.name, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Ink)
                                Text(text = "₹${item.price} per ${item.unit}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Marigold)
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
                                                HapticUtil.vibrateTap(context)
                                                if (count == 1) cart.remove(item.id) else cart[item.id] = count - 1
                                            }
                                    ) {
                                        Text(text = "−", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Brick, modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp))
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
                                                HapticUtil.vibrateTap(context)
                                                cart[item.id] = count + 1
                                            } else {
                                                HapticUtil.vibrateError(context)
                                                LocalizationManager.speak("Not enough budget remaining.")
                                            }
                                        }
                                ) {
                                    Text(text = "+", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White, modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp))
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Pay / Checkout Button
            if (isPaid) {
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
                        Text(text = "🎉 Shopping Complete!", fontSize = 18.sp, fontWeight = FontWeight.Black, color = TeaGreen)
                        Text(text = "You paid ₹$totalCost and stayed within your ₹$budget budget. Great job!", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Ink)
                    }
                }
            } else {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = if (totalCost in 1..budget) Marigold else Color.Gray,
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(3.dp, RoundedCornerShape(16.dp))
                        .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
                        .clickable(enabled = totalCost in 1..budget) {
                            isPaid = true
                            HapticUtil.vibrateSuccess(context)
                            LocalizationManager.speak("Payment complete! You managed your budget successfully.")
                        }
                ) {
                    Box(
                        modifier = Modifier.padding(vertical = 16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (totalCost == 0) "Add items to cart" else "Pay ₹$totalCost at Counter →",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
