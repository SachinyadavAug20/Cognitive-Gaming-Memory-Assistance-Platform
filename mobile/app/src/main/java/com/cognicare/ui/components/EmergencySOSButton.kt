package com.cognicare.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Sos
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.cognicare.util.ElderlyFeedback

@Composable
fun EmergencySOSButton(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    FloatingActionButton(
        onClick = {
            ElderlyFeedback.onError(context)
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108"))
            context.startActivity(intent)
        },
        modifier = modifier
            .size(64.dp)
            .shadow(8.dp, CircleShape)
            .border(3.dp, Color(0xFFC5221F), CircleShape),
        shape = CircleShape,
        containerColor = Color(0xFFC5221F),
        contentColor = Color.White
    ) {
        Icon(
            imageVector = Icons.Filled.Sos,
            contentDescription = "Emergency SOS - Call 108",
            modifier = Modifier.size(32.dp)
        )
    }
}
