package com.garage.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.garage.app.data.BookingState
import com.garage.app.data.MechanicLiveState
import com.garage.app.data.MechanicSession
import com.garage.app.data.SimulationEngine
import com.garage.app.data.SpecialtyCategory
import com.garage.app.data.VehicleType
import com.garage.app.ui.theme.CeylonTea
import com.garage.app.ui.theme.GoldenSand
import com.garage.app.ui.theme.IndianOceanBlue
import com.garage.app.ui.theme.LushCanopy
import com.garage.app.ui.theme.TempleLotus
import kotlinx.coroutines.flow.MutableStateFlow

@Preview(showBackground = true, widthDp = 900, heightDp = 850)
@Composable
fun GarageSimulationSandbox() {
    var bookingState by remember { mutableStateOf<BookingState>(BookingState.Idle) }
    var mechanicOnline by remember { mutableStateOf(false) }
    var selectedVehicleType by remember { mutableStateOf(VehicleType.CAR) }
    var selectedSpecialtyCategory by remember { mutableStateOf(SpecialtyCategory.ENGINE) }
    var problemDescription by remember { mutableStateOf("Engine overheating and check engine light is on") }

    val liveState = remember {
        MutableStateFlow(
            MechanicLiveState(
                isOnline = false,
                currentLatitude = 0.0,
                currentLongitude = 0.0
            )
        )
    }

    val mechanicSession = remember {
        MechanicSession(
            profile = SimulationEngine.mockMechanic,
            liveState = liveState
        )
    }

    val customerRequest = remember { SimulationEngine.mockCustomerBookingRequest }

    fun handleToggleOnline(isOnline: Boolean) {
        mechanicOnline = isOnline
        if (isOnline) {
            mechanicSession.goOnline(6.9271, 79.8612)
        } else {
            mechanicSession.goOffline()
        }
    }

    fun handleRequestMechanic() {
        if (mechanicOnline) {
            bookingState = BookingState.Searching
        }
    }

    fun handleAcceptJob() {
        if (bookingState is BookingState.Searching) {
            bookingState = BookingState.Accepted(
                mechanicName = SimulationEngine.mockMechanic.fullName,
                mechanicPhone = SimulationEngine.mockMechanic.phoneNumber,
                mechanicLatitude = 6.9271,
                mechanicLongitude = 79.8612
            )
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = TempleLotus
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Text(
                text = "Garage Simulation",
                style = MaterialTheme.typography.headlineMedium,
                color = IndianOceanBlue,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Interactive Dual-Device Preview",
                style = MaterialTheme.typography.bodyMedium,
                color = CeylonTea,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                PhoneFrame(
                    label = "Customer",
                    modifier = Modifier.weight(1f)
                ) {
                    CustomerPanelScreen(
                        customerRequest = customerRequest,
                        bookingState = bookingState,
                        selectedVehicleType = selectedVehicleType,
                        selectedSpecialtyCategory = selectedSpecialtyCategory,
                        problemDescription = problemDescription,
                        onVehicleTypeSelected = { selectedVehicleType = it },
                        onSpecialtyCategorySelected = { selectedSpecialtyCategory = it },
                        onProblemDescriptionChanged = { problemDescription = it },
                        onRequestMechanic = { handleRequestMechanic() },
                        modifier = Modifier.fillMaxSize()
                    )
                }

                PhoneFrame(
                    label = "Mechanic",
                    modifier = Modifier.weight(1f)
                ) {
                    MechanicPanelScreen(
                        mechanicSession = mechanicSession,
                        bookingState = bookingState,
                        onToggleOnline = { handleToggleOnline(it) },
                        onAcceptJob = { handleAcceptJob() },
                        onTimerExpired = { bookingState = BookingState.Idle },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = IndianOceanBlue.copy(alpha = 0.05f),
                shape = MaterialTheme.shapes.medium
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val statusColor = when (bookingState) {
                        is BookingState.Idle -> CeylonTea
                        is BookingState.Searching -> GoldenSand
                        is BookingState.Accepted -> LushCanopy
                        is BookingState.ActiveRoute -> LushCanopy
                        is BookingState.Completed -> IndianOceanBlue
                    }
                    val statusText = when (bookingState) {
                        is BookingState.Idle -> "Idle — toggle mechanic online, then request"
                        is BookingState.Searching -> "Searching — accept the job on the right panel"
                        is BookingState.Accepted -> "Matched — mechanic is on the way"
                        is BookingState.ActiveRoute -> "En Route"
                        is BookingState.Completed -> "Completed"
                    }
                    Box(
                        modifier = Modifier
                            .width(10.dp)
                            .height(10.dp)
                            .background(statusColor, MaterialTheme.shapes.extraSmall)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = statusText,
                        style = MaterialTheme.typography.bodySmall,
                        color = IndianOceanBlue
                    )
                }
            }
        }
    }
}
