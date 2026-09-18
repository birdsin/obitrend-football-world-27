#pragma once

#include "CoreMinimal.h"
#include "Camera/CameraActor.h"
#include "ObitrendCinematicCamera.generated.h"

UCLASS()
class OBITRENDFOOTBALLWORLD27_API AObitrendCinematicCamera : public ACameraActor
{
    GENERATED_BODY()

public:
    AObitrendCinematicCamera();

protected:
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;

private:
    float Elapsed = 0.0f;
    FVector StartLocation;
    FVector EndLocation;
    FRotator StartRotation;
    FRotator EndRotation;
};