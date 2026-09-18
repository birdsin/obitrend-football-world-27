#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "ObitrendBallContactProfile.generated.h"

UCLASS(BlueprintType)
class OBITRENDFOOTBALLWORLD27_API UObitrendBallContactProfile : public UDataAsset
{
    GENERATED_BODY()

public:
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Contact")
    float ReceiveControlDistance = 145.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Contact")
    float FirstTouchDamping = 0.35f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Contact")
    float GroundPassPower = 1050.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Contact")
    float DrivenPassPower = 1450.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Contact")
    float ShotPower = 2200.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Contact")
    float ShotLift = 160.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Contact")
    float BallSpinMultiplier = 0.45f;
};