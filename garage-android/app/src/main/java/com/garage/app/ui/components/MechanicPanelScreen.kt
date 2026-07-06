package com.garage.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.garage.app.data.BookingState
import com.garage.app.data.MechanicSession
import com.garage.app.data.Specialty
import com.garage.app.data.VehicleType
import com.garage.app.ui.map.MiniMapPlaceholder
import com.garage.app.ui.theme.CardShape
import com.garage.app.ui.theme.CeylonTea
import com.garage.app.ui.theme.GoldenSand
import com.garage.app.ui.theme.IndianOceanBlue
import com.garage.app.ui.theme.LushCanopy
import com.garage.app.ui.theme.PillShape
import com.garage.app.ui.theme.TempleLotus

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MechanicPanelScreen(
    mechanicSession: MechanicSession,
    bookingState: BookingState,
    onToggleOnline: (Boolean) -> Unit,
    onAcceptJob: () -> Unit,
    onTimerExpired: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val profile = mechanicSession.profile
    val liveState by mechanicSession.liveState.collectAsState()
    val isOnline = liveState.isOnline

    var name by remember(profile.fullName) { mutableStateOf(profile.fullName) }
    var address by remember(profile.homeAddress) { mutableStateOf(profile.homeAddress) }
    var phone by remember(profile.phoneNumber) { mutableStateOf(profile.phoneNumber) }
    var selectedVehicleTypes by remember {
        mutableStateOf(profile.supportedVehicleTypes.toMutableSet())
    }
    var selectedSpecialties by remember {
        mutableStateOf(profile.specialties.toMutableSet())
    }

    Box(modifier = modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            HeaderSection(
                fullName = profile.fullName,
                isOnline = isOnline,
                onToggleOnline = onToggleOnline
            )

            Spacer(modifier = Modifier.height(20.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = CardShape,
                colors = CardDefaults.cardColors(
                    containerColor = TempleLotus
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "Mechanic Profile",
                        style = MaterialTheme.typography.titleLarge,
                        color = IndianOceanBlue,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = CardShape,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = IndianOceanBlue,
                            unfocusedBorderColor = CeylonTea.copy(alpha = 0.5f),
                            focusedLabelColor = IndianOceanBlue,
                            unfocusedLabelColor = CeylonTea
                        ),
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = "Name",
                                tint = CeylonTea
                            )
                        }
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Home Address") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = CardShape,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = IndianOceanBlue,
                            unfocusedBorderColor = CeylonTea.copy(alpha = 0.5f),
                            focusedLabelColor = IndianOceanBlue,
                            unfocusedLabelColor = CeylonTea
                        ),
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = "Address",
                                tint = CeylonTea
                            )
                        }
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone Number") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = CardShape,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = IndianOceanBlue,
                            unfocusedBorderColor = CeylonTea.copy(alpha = 0.5f),
                            focusedLabelColor = IndianOceanBlue,
                            unfocusedLabelColor = CeylonTea
                        ),
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Phone,
                                contentDescription = "Phone",
                                tint = CeylonTea
                            )
                        }
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "Vehicle Types",
                        style = MaterialTheme.typography.titleMedium,
                        color = IndianOceanBlue,
                        fontWeight = FontWeight.SemiBold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        VehicleType.entries.forEach { vehicleType ->
                            val isSelected = vehicleType in selectedVehicleTypes
                            Surface(
                                shape = PillShape,
                                color = if (isSelected) LushCanopy else CeylonTea.copy(alpha = 0.1f),
                                modifier = Modifier.clickable {
                                    if (isSelected) {
                                        selectedVehicleTypes.remove(vehicleType)
                                    } else {
                                        selectedVehicleTypes.add(vehicleType)
                                    }
                                }
                            ) {
                                Text(
                                    text = vehicleType.displayName,
                                    modifier = Modifier.padding(
                                        horizontal = 16.dp,
                                        vertical = 8.dp
                                    ),
                                    color = if (isSelected) TempleLotus else CeylonTea,
                                    style = MaterialTheme.typography.labelLarge,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "Specialties",
                        style = MaterialTheme.typography.titleMedium,
                        color = IndianOceanBlue,
                        fontWeight = FontWeight.SemiBold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Specialty.entries.forEach { specialty ->
                            val isSelected = specialty in selectedSpecialties
                            Surface(
                                shape = PillShape,
                                color = if (isSelected) IndianOceanBlue else CeylonTea.copy(alpha = 0.1f),
                                modifier = Modifier.clickable {
                                    if (isSelected) {
                                        selectedSpecialties.remove(specialty)
                                    } else {
                                        selectedSpecialties.add(specialty)
                                    }
                                }
                            ) {
                                Text(
                                    text = specialty.displayName,
                                    modifier = Modifier.padding(
                                        horizontal = 16.dp,
                                        vertical = 8.dp
                                    ),
                                    color = if (isSelected) TempleLotus else CeylonTea,
                                    style = MaterialTheme.typography.labelLarge,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        }
                    }
                }
            }

            if (isOnline) {
                Spacer(modifier = Modifier.height(12.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = CardShape,
                    colors = CardDefaults.cardColors(
                        containerColor = LushCanopy.copy(alpha = 0.08f)
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(CircleShape)
                                .background(LushCanopy)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "You are online and visible to nearby customers",
                            style = MaterialTheme.typography.bodyMedium,
                            color = LushCanopy,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

        AnimatedVisibility(
            visible = bookingState is BookingState.Searching,
            enter = fadeIn() + slideInVertically { it / 2 },
            exit = fadeOut() + slideOutVertically { it / 2 },
            modifier = Modifier.fillMaxSize()
        ) {
            IncomingRequestOverlay(
                bookingState = bookingState,
                onAcceptJob = onAcceptJob,
                onTimerExpired = onTimerExpired,
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Composable
private fun HeaderSection(
    fullName: String,
    isOnline: Boolean,
    onToggleOnline: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = CardShape,
        colors = CardDefaults.cardColors(containerColor = IndianOceanBlue)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Hello,",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TempleLotus.copy(alpha = 0.7f)
                    )
                    Text(
                        text = fullName.split(" ").first(),
                        style = MaterialTheme.typography.headlineMedium,
                        color = TempleLotus,
                        fontWeight = FontWeight.Bold
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = if (isOnline) "Online" else "Offline",
                        style = MaterialTheme.typography.labelLarge,
                        color = TempleLotus.copy(alpha = 0.8f),
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Switch(
                        checked = isOnline,
                        onCheckedChange = onToggleOnline,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = TempleLotus,
                            checkedTrackColor = LushCanopy,
                            uncheckedThumbColor = TempleLotus,
                            uncheckedTrackColor = CeylonTea.copy(alpha = 0.4f)
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun IncomingRequestOverlay(
    bookingState: BookingState,
    onAcceptJob: () -> Unit,
    onTimerExpired: () -> Unit,
    modifier: Modifier = Modifier
) {
    var countdownSeconds by remember { mutableIntStateOf(30) }

    LaunchedEffect(bookingState) {
        countdownSeconds = 30
        while (countdownSeconds > 0) {
            kotlinx.coroutines.delay(1000)
            countdownSeconds--
        }
        onTimerExpired()
    }

    val infiniteTransition = rememberInfiniteTransition(label = "pulseTimer")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Box(
        modifier = modifier
            .background(TempleLotus.copy(alpha = 0.92f))
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = CardShape,
            colors = CardDefaults.cardColors(containerColor = TempleLotus),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier.size(100.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(modifier = Modifier.size(100.dp)) {
                        val strokeWidth = 6.dp.toPx() * pulseScale
                        drawCircle(
                            color = GoldenSand,
                            radius = size.minDimension / 2 - strokeWidth / 2,
                            style = Stroke(
                                width = strokeWidth,
                                cap = StrokeCap.Round
                            )
                        )
                        drawCircle(
                            color = GoldenSand.copy(alpha = 0.3f),
                            radius = size.minDimension / 2 - 2.dp.toPx(),
                            style = Stroke(
                                width = 2.dp.toPx(),
                                cap = StrokeCap.Round
                            )
                        )
                    }
                    Text(
                        text = "${countdownSeconds}s",
                        style = MaterialTheme.typography.headlineLarge,
                        color = IndianOceanBlue,
                        fontWeight = FontWeight.Bold,
                        fontSize = 32.sp
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = GoldenSand,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Incoming Request",
                        style = MaterialTheme.typography.titleLarge,
                        color = IndianOceanBlue,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "A customer needs breakdown assistance nearby",
                    style = MaterialTheme.typography.bodyMedium,
                    color = CeylonTea,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(16.dp))

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp),
                    shape = CardShape,
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    MiniMapPlaceholder()
                }

                Spacer(modifier = Modifier.height(16.dp))

                HorizontalDivider(color = CeylonTea.copy(alpha = 0.2f))

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = IndianOceanBlue,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Car",
                            style = MaterialTheme.typography.labelLarge,
                            color = IndianOceanBlue,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.Timer,
                            contentDescription = null,
                            tint = IndianOceanBlue,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Engine",
                            style = MaterialTheme.typography.labelLarge,
                            color = IndianOceanBlue,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = GoldenSand,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "4.8",
                            style = MaterialTheme.typography.labelLarge,
                            color = IndianOceanBlue,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = onAcceptJob,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = PillShape,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = LushCanopy,
                        contentColor = TempleLotus
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Text(
                        text = "Accept Job",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                }
            }
        }
    }
}
