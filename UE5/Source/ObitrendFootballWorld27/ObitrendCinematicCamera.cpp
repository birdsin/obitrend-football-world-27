#include "ObitrendCinematicCamera.h"

#include "Camera/CameraComponent.h"
#include "Kismet/KismetMathLibrary.h"
#include "EngineUtils.h"
#include "FootballBallActor.h"

AObitrendCinematicCamera::AObitrendCinematicCamera()
{
    PrimaryActorTick.bCanEverTick = true;
    GetCameraComponent()->FieldOfView = 48.0f;
    GetCameraComponent()->PostProcessSettings.bOverride_VignetteIntensity = true;
    GetCameraComponent()->PostProcessSettings.VignetteIntensity = 0.22f;
}

void AObitrendCinematicCamera::BeginPlay()
{
    Super::BeginPlay();

    StartLocation = FVector(-18500.0f, -15000.0f, 11000.0f);
    EndLocation   = FVector(-11200.0f, -7200.0f, 5200.0f);

    StartRotation = UKismetMathLibrary::FindLookAtRotation(
        StartLocation, FVector::ZeroVector);

    EndRotation = UKismetMathLibrary::FindLookAtRotation(
        EndLocation, FVector(0.0f, 0.0f, 700.0f));

    SetActorLocation(StartLocation);
    SetActorRotation(StartRotation);

    for (TActorIterator<AFootballBallActor> It(GetWorld()); It; ++It)
    {
        Ball = *It;
        break;
    }

    BroadcastLocation = EndLocation;
    BroadcastRotation = EndRotation;
}

void AObitrendCinematicCamera::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    Elapsed += DeltaSeconds;

    const float Duration = 6.0f;
    const float Alpha = FMath::Clamp(Elapsed / Duration, 0.0f, 1.0f);
    const float Smooth = FMath::InterpEaseInOut(0.0f, 1.0f, Alpha, 2.2f);

    if (Alpha < 1.0f)
    {
        SetActorLocation(FMath::Lerp(StartLocation, EndLocation, Smooth));
        SetActorRotation(FMath::Lerp(StartRotation, EndRotation, Smooth));
    }
    else if (Ball)
    {
        const FVector BallLocation = Ball->GetActorLocation();
        const FVector TargetLocation = BallLocation + FVector(0.0f, -4300.0f, 2600.0f);
        BroadcastLocation = FMath::VInterpTo(BroadcastLocation, TargetLocation, DeltaSeconds, 2.8f);

        const FVector LookTarget = BallLocation + FVector(0.0f, 0.0f, 180.0f);
        BroadcastRotation = FMath::RInterpTo(
            BroadcastRotation,
            UKismetMathLibrary::FindLookAtRotation(BroadcastLocation, LookTarget),
            DeltaSeconds,
            4.5f);

        SetActorLocation(BroadcastLocation);
        SetActorRotation(BroadcastRotation);
    }

    const float Fov = Alpha < 1.0f ? FMath::Lerp(48.0f, 55.0f, Smooth) : 52.0f;
    GetCameraComponent()->SetFieldOfView(Fov);
}