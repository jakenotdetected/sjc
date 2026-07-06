package com.garage.app.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class VehicleType(val displayName: String) {
    MOTORBIKE("Motorbike"),
    THREE_WHEELER("Three-Wheeler"),
    CAR("Car"),
    VAN("Van"),
    SUV("SUV")
}

enum class SpecialtyCategory(val displayName: String) {
    ACCESSORIES("Accessories"),
    ENGINE("Engine"),
    OTHER_STUFF("Other Stuff")
}

enum class Specialty(val displayName: String, val category: SpecialtyCategory) {
    WIRING("Wiring", SpecialtyCategory.ACCESSORIES),
    LIGHTS("Lights", SpecialtyCategory.ACCESSORIES),
    AUDIO("Audio", SpecialtyCategory.ACCESSORIES),
    TUNE_UPS("Tune-ups", SpecialtyCategory.ENGINE),
    OVERHAULS("Overhauls", SpecialtyCategory.ENGINE),
    SENSORS("Sensors", SpecialtyCategory.ENGINE),
    FILTERS("Filters", SpecialtyCategory.ENGINE),
    BRAKES("Brakes", SpecialtyCategory.OTHER_STUFF),
    SUSPENSION("Suspension", SpecialtyCategory.OTHER_STUFF),
    AC_REPAIR("AC Repair", SpecialtyCategory.OTHER_STUFF)
}

data class MechanicProfile(
    val fullName: String,
    val homeAddress: String,
    val phoneNumber: String,
    val supportedVehicleTypes: List<VehicleType>,
    val specialties: List<Specialty>,
    val isOnline: Boolean = false,
    val currentLatitude: Double = 0.0,
    val currentLongitude: Double = 0.0
)

data class MechanicLiveState(
    val isOnline: Boolean,
    val currentLatitude: Double,
    val currentLongitude: Double
)

data class MechanicSession(
    val profile: MechanicProfile,
    val liveState: MutableStateFlow<MechanicLiveState>
) {
    val isOnline: StateFlow<Boolean> = MutableStateFlow(liveState.value.isOnline).asStateFlow()

    fun goOnline(lat: Double, lng: Double) {
        liveState.value = liveState.value.copy(
            isOnline = true,
            currentLatitude = lat,
            currentLongitude = lng
        )
    }

    fun goOffline() {
        liveState.value = liveState.value.copy(
            isOnline = false
        )
    }

    fun updateLocation(lat: Double, lng: Double) {
        if (liveState.value.isOnline) {
            liveState.value = liveState.value.copy(
                currentLatitude = lat,
                currentLongitude = lng
            )
        }
    }
}
