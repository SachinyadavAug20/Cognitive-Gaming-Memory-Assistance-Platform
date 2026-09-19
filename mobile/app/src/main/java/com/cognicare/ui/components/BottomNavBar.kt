package com.cognicare.ui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.outlined.Group
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.SportsEsports
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val TeaGreen = Color(0xFF1B663E)

enum class BottomNavItem(
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val route: String
) {
    Home("Home", Icons.Filled.Home, Icons.Outlined.Home, "patient_dashboard"),
    Games("Games", Icons.Filled.SportsEsports, Icons.Outlined.SportsEsports, "games_hub"),
    Family("Family", Icons.Filled.Group, Icons.Outlined.Group, "caregiver")
}

@Composable
fun CogniCareBottomBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .border(width = 2.5.dp, color = Ink),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 8.dp
    ) {
        NavigationBar(
            containerColor = Color.Transparent,
            windowInsets = NavigationBarDefaults.windowInsets,
            modifier = Modifier.fillMaxWidth()
        ) {
            BottomNavItem.entries.forEach { item ->
                val selected = currentRoute == item.route
                NavigationBarItem(
                    selected = selected,
                    onClick = {
                        ElderlyFeedback.onNavigate(context)
                        onNavigate(item.route)
                    },
                    icon = {
                        Icon(
                            imageVector = if (selected) item.selectedIcon else item.unselectedIcon,
                            contentDescription = item.label,
                            modifier = Modifier.size(28.dp)
                        )
                    },
                    label = {
                        Text(
                            text = item.label,
                            fontWeight = if (selected) FontWeight.Black else FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TeaGreen,
                        selectedTextColor = TeaGreen,
                        indicatorColor = TeaGreen.copy(alpha = 0.15f),
                        unselectedIconColor = InkSecondary,
                        unselectedTextColor = InkSecondary
                    )
                )
            }
        }
    }
}
