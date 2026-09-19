package com.cognicare.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*

@Composable
fun NeoBrutalistCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = Color.White,
    borderColor: Color = Color.Black,
    borderWidth: Int = 2,
    cornerRadius: Int = 16,
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = modifier
            .shadow(4.dp, RoundedCornerShape(cornerRadius.dp))
            .border(borderWidth.dp, borderColor, RoundedCornerShape(cornerRadius.dp))
            .background(backgroundColor, RoundedCornerShape(cornerRadius.dp))
            .padding(16.dp),
        content = content
    )
}

@Composable
fun DomainFilterChip(
    label: String,
    count: Int?,
    emoji: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        onClick = onClick,
        modifier = modifier.semantics { contentDescription = "$label, ${count ?: 0} items" },
        shape = RoundedCornerShape(24.dp),
        color = if (isSelected) Green40 else Color.White,
        border = if (isSelected) null else ButtonDefaults.outlinedButtonBorder,
        contentColor = if (isSelected) Color.White else Color.Black
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = emoji, fontSize = 14.sp)
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = label,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium
            )
            if (count != null) {
                Spacer(modifier = Modifier.width(6.dp))
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (isSelected) Color.White.copy(alpha = 0.25f) else Color(0xFFE8F5E9)
                ) {
                    Text(
                        text = "$count",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isSelected) Color.White else Green40
                    )
                }
            }
        }
    }
}

@Composable
fun FloatingSosButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .height(56.dp)
            .width(180.dp),
        shape = RoundedCornerShape(28.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = SOSRed,
            contentColor = Color.White
        ),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
    ) {
        Text(text = "\uD83D\uDCDE", fontSize = 18.sp)
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = "SOS HELP",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun FloatingCallCaregiverButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .height(56.dp)
            .wrapContentWidth(),
        shape = RoundedCornerShape(28.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = SOSRed,
            contentColor = Color.White
        ),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp)
    ) {
        Text(text = "\uD83D\uDCDE", fontSize = 18.sp)
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = "Call Caregiver",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun FloatingTalkSaathiButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .height(56.dp)
            .wrapContentWidth(),
        shape = RoundedCornerShape(28.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = SaathiYellow,
            contentColor = Color.Black
        ),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp)
    ) {
        Text(text = "\uD83E\uDD16", fontSize = 18.sp)
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = "Talk with Saathi",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun OnlineStatusBadge(
    isOnline: Boolean,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        color = if (isOnline) OnlineGreen else OfflinePurple,
        contentColor = Color.White
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                modifier = Modifier.size(8.dp),
                shape = MaterialTheme.shapes.small,
                color = if (isOnline) Color(0xFF90EE90) else Color(0xFFFFB6C1)
            ) {}
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = if (isOnline) "Online" else "Offline",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
