#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendTacticalFormationComponent.generated.h"

USTRUCT(BlueprintType)
struct FObitrendTacticalSlot
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 SlotIndex = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FVector BaseLocation = FVector::ZeroVector;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float AttackBias = 0.0f;
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendTacticalFormationComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendTacticalFormationComponent();

    UFUNCTION(BlueprintCallable, Category="Football|Tactics")
    FVector GetTacticalTarget(
        int32 SlotIndex,
        const FVector& BallLocation,
        bool bTeamHasBall,
        float AttackingDirection) const;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Tactics")
    float BallInfluence = 0.34f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Tactics")
    float PossessionAdvance = 900.0f;

private:
    TArray<FObitrendTacticalSlot> Slots;
};