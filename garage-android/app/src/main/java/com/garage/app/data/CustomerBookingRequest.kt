package com.garage.app.data

data class CustomerDetails(
    val name: String,
    val phoneNumber: String,
    val currentLatitude: Double,
    val currentLongitude: Double
)

data class BreakdownProfile(
    val vehicleType: VehicleType,
    val specialtyCategory: SpecialtyCategory,
    val problemDescription: String
)

data class CustomerBookingRequest(
    val customer: CustomerDetails,
    val breakdown: BreakdownProfile,
    val state: BookingState = BookingState.Idle
)

sealed interface BookingState {
    data object Idle : BookingState
    data object Searching : BookingState
    data class Accepted(
        val mechanicName: String,
        val mechanicPhone: String,
        val mechanicLatitude: Double,
        val mechanicLongitude: Double
    ) : BookingState
    data class ActiveRoute(
        val mechanicName: String,
        val mechanicPhone: String,
        val mechanicLatitude: Double,
        val mechanicLongitude: Double
    ) : BookingState
    data object Completed : BookingState
}
