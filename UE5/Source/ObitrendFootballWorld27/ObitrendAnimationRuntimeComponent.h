#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendAnimationRuntimeComponent.generated.h"

UENUM(BlueprintType)
enum class EObitrendRuntimeAnimation : uint8
{
    Idle,
    Walk,
    Run,
    Sprint,
    Turn,
    Receive,
    Dribble,
    Pass,
    Shoot,
    Tackle,
    Intercept,
    ShoulderChallenge,
    GoalkeeperSave,
    Recover
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendAnimationRuntimeComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendAnimationRuntimeComponent();

    UFUNCTION(BlueprintCallable, Category="Football|Animation")
    void SetAction(EObitrendRuntimeAnimation NewAction);

    UFUNCTION(BlueprintCallable, Category="Football|Animation")
    void ClearAction();

    UFUNCTION(BlueprintCallable, Category="Football|Animation")
    void UpdateLocomotion(float Speed, float DirectionDegrees);

    UFUNCTION(BlueprintPure, Category="Football|Animation")
    EObitrendRuntimeAnimation GetAnimationState() const { return AnimationState; }

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float MovementSpeed = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float MovementDirection = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float SpeedNormalized = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bActionActive = false;

private:
    EObitrendRuntimeAnimation AnimationState = EObitrendRuntimeAnimation::Idle;
};