package com.garage.app.ui.components

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Mechanic
import androidx.compose.material.icons.filled.NearMe
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.garage.app.data.BookingState
import com.garage.app.data.CustomerBookingRequest
import com.garage.app.data.SpecialtyCategory
import com.garage.app.data.VehicleType
import com.garage.app.ui.map.GarageMapView
import com.garage.app.ui.theme.CardShape
import com.garage.app.ui.theme.CeylonTea
import com.garage.app.ui.theme.GoldenSand
import com.garage.app.ui.theme.IndianOceanBlue
import com.garage.app.ui.theme.LushCanopy
import com.garage.app.ui.theme.PillShape
import com.garage.app.ui.theme.TempleLotus

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CustomerPanelScreen(
    customerRequest: CustomerBookingRequest,
    bookingState: BookingState,
    selectedVehicleType: VehicleType,
    selectedSpecialtyCategory: SpecialtyCategory,
    problemDescription: String,
    onVehicleTypeSelected: (VehicleType) -> Unit,
    onSpecialtyCategorySelected: (SpecialtyCategory) -> Unit,
    onProblemDescriptionChanged: (String) -> Unit,
    onRequestMechanic: () -> Unit,
    modifier: Modifier = Modifier
) {
    val customer = customerRequest.customer

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(TempleLotus)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(0.45f)
        ) {
            GarageMapView(
                centerLatitude = customer.currentLatitude,
                centerLongitude = customer.currentLongitude,
                markerLatitude = customer.currentLatitude,
                markerLongitude = customer.currentLongitude,
                zoomLevel = 15f
            )
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(0.55f)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = CardShape,
                colors = CardDefaults.cardColors(containerColor = TempleLotus),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Vehicle & Issue",
                        style = MaterialTheme.typography.titleMedium,
                        color = IndianOceanBlue,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Vehicle Type",
                        style = MaterialTheme.typography.labelLarge,
                        color = CeylonTea
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        VehicleType.entries.forEach { vehicleType ->
                            val isSelected = vehicleType == selectedVehicleType
                            Surface(
                                shape = PillShape,
                                color = if (isSelected) IndianOceanBlue else CeylonTea.copy(alpha = 0.1f),
                                modifier = Modifier.clickable {
                                    onVehicleTypeSelected(vehicleType)
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

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Issue Category",
                        style = MaterialTheme.typography.labelLarge,
                        color = CeylonTea
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        SpecialtyCategory.entries.forEach { category ->
                            val isSelected = category == selectedSpecialtyCategory
                            Surface(
                                shape = PillShape,
                                color = if (isSelected) LushCanopy else CeylonTea.copy(alpha = 0.1f),
                                modifier = Modifier.clickable {
                                    onSpecialtyCategorySelected(category)
                                }
                            ) {
                                Text(
                                    text = category.displayName,
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

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = problemDescription,
                        onValueChange = onProblemDescriptionChanged,
                        label = { Text("Describe the problem") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = CardShape,
                        minLines = 2,
                        maxLines = 4,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = IndianOceanBlue,
                            unfocusedBorderColor = CeylonTea.copy(alpha = 0.5f),
                            focusedLabelColor = IndianOceanBlue,
                            unfocusedLabelColor = CeylonTea
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            AnimatedContent(
                targetState = bookingState,
                transitionSpec = {
                    fadeIn() togetherWith fadeOut()
                },
                label = "bookingStateContent"
            ) { state ->
                when (state) {
                    is BookingState.Idle -> {
                        RequestMechanicButton(onClick = onRequestMechanic)
                    }
                    is BookingState.Searching -> {
                        SearchingOverlay()
                    }
                    is BookingState.Accepted -> {
                        MatchedBanner(
                            mechanicName = state.mechanicName,
                            mechanicPhone = state.mechanicPhone
                        )
                    }
                    is BookingState.ActiveRoute -> {
                        MatchedBanner(
                            mechanicName = state.mechanicName,
                            mechanicPhone = state.mechanicPhone
                        )
                    }
                    is BookingState.Completed -> {
                        RequestMechanicButton(onClick = onRequestMechanic)
                    }
                }
            }
        }
    }
}

@Composable
private fun RequestMechanicButton(onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp),
        shape = PillShape,
        colors = ButtonDefaults.buttonColors(
            containerColor = LushCanopy,
            contentColor = TempleLotus
        ),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
    ) {
        Icon(
            imageVector = Icons.Default.NearMe,
            contentDescription = null,
            modifier = Modifier.size(22.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = "Request Nearby Mechanic",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp
        )
    }
}

@Composable
private fun SearchingOverlay() {
    val infiniteTransition = rememberInfiniteTransition(label = "searchPulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.92f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "searchPulseScale"
    )

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = CardShape,
        colors = CardDefaults.cardColors(containerColor = TempleLotus),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier.size(72.dp),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.size(72.dp)) {
                    val strokeWidth = 4.dp.toPx() * pulseScale
                    drawCircle(
                        color = GoldenSand,
                        radius = size.minDimension / 2 - strokeWidth / 2,
                        style = Stroke(
                            width = strokeWidth,
                            cap = StrokeCap.Round
                        )
                    )
                    drawCircle(
                        color = GoldenSand.copy(alpha = 0.2f),
                        radius = size.minDimension / 2 - 1.dp.toPx(),
                        style = Stroke(
                            width = 1.5.dp.toPx(),
                            cap = StrokeCap.Round
                        )
                    )
                }
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = null,
                    tint = IndianOceanBlue,
                    modifier = Modifier.size(28.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Finding closest mechanics within 5km...",
                style = MaterialTheme.typography.titleMedium,
                color = IndianOceanBlue,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            LinearProgressIndicator(
                modifier = Modifier.fillMaxWidth(),
                color = GoldenSand,
                trackColor = GoldenSand.copy(alpha = 0.15f)
            )
        }
    }
}

@Composable
private fun MatchedBanner(
    mechanicName: String,
    mechanicPhone: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = CardShape,
        colors = CardDefaults.cardColors(containerColor = LushCanopy),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                tint = TempleLotus,
                modifier = Modifier.size(48.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Mechanic is on the way!",
                style = MaterialTheme.typography.titleLarge,
                color = TempleLotus,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Mechanic,
                    contentDescription = null,
                    tint = TempleLotus.copy(alpha = 0.8f),
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = mechanicName,
                    style = MaterialTheme.typography.titleMedium,
                    color = TempleLotus,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            FilledIconButton(
                onClick = { /* Dial mechanic - external intent */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = PillShape,
                colors = IconButtonDefaults.filledIconButtonColors(
                    containerColor = TempleLotus,
                    contentColor = LushCanopy
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Call,
                    contentDescription = "Call Mechanic"
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Call $mechanicName",
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold,
                    color = LushCanopy
                )
            }
        }
    }
}
