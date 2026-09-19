package com.cognicare.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.FirstPage
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.FirstPage
import androidx.compose.material.icons.outlined.Group
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.cognicare.util.ElderlyFeedback

enum class BottomNavItem(
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val route: String
) {
    Home("Home", Icons.Filled.Home, Icons.Outlined.Home, "patient_dashboard"),
    Games("Games", Icons.Filled.FirstPage, Icons.Outlined.FirstPage, "games_hub"),
    Family("Family", Icons.Filled.Group, Icons.Outlined.Group, "caregiver")
}

@Composable
fun CogniCareBottomBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current

    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp,
        modifier = Modifier.size(width = 400.dp, height = 80.dp)
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
                        modifier = Modifier.size(32.dp)
                    )
                },
                label = {
                    Text(
                        text = item.label,
                        style = MaterialTheme.typography.labelLarge
                    )
                }
            )
        }
    }
}
