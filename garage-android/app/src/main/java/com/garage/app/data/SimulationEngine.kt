package com.garage.app.data

object SimulationEngine {

    val mockMechanic = MechanicProfile(
        fullName = "Kamal Perera",
        homeAddress = "42, Galle Road, Colombo 03",
        phoneNumber = "+94 77 123 4567",
        supportedVehicleTypes = listOf(
            VehicleType.MOTORBIKE,
            VehicleType.THREE_WHEELER,
            VehicleType.CAR,
            VehicleType.VAN,
            VehicleType.SUV
        ),
        specialties = listOf(
            Specialty.WIRING,
            Specialty.LIGHTS,
            Specialty.AUDIO,
            Specialty.TUNE_UPS,
            Specialty.OVERHAULS,
            Specialty.SENSORS,
            Specialty.FILTERS,
            Specialty.BRAKES,
            Specialty.SUSPENSION,
            Specialty.AC_REPAIR
        ),
        isOnline = true,
        currentLatitude = 6.9271,
        currentLongitude = 79.8612
    )

    val mockCustomerBookingRequest = CustomerBookingRequest(
        customer = CustomerDetails(
            name = "Nimal Fernando",
            phoneNumber = "+94 71 987 6543",
            currentLatitude = 6.9344,
            currentLongitude = 79.8428
        ),
        breakdown = BreakdownProfile(
            vehicleType = VehicleType.CAR,
            specialtyCategory = SpecialtyCategory.ENGINE,
            problemDescription = "Engine overheating and check engine light is on"
        ),
        state = BookingState.Idle
    )
}
