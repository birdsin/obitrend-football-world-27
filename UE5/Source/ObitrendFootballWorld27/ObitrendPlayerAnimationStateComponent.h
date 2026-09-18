#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendPlayerAnimationStateComponent.generated.h"

UENUM(BlueprintType)
enum class EObitrendPlayerAnimationState : uint8
{
    Idle,
    Walk,
    Run,
    Sprint,
    Turn,
    Receive,
    Dribble,
    Pass,
    Shoot
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendPlayerAnimationStateComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendPlayerAnimationStateComponent();

    UFUNCTION(BlueprintCallable, Category="Football|Animation")
    void SetBallAction(EObitrendPlayerAnimationState Action);

    UFUNCTION(BlueprintCallable, Category="Football|Animation")
    void ClearBallAction();

    UFUNCTION(BlueprintPure, Category="Football|Animation")
    EObitrendPlayerAnimationState GetAnimationState() const
    {
        return AnimationState;
    }

    UFUNCTION(BlueprintPure, Category="Football|Animation")
    float GetLocomotionSpeed() const;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    EObitrendPlayerAnimationState AnimationState = EObitrendPlayerAnimationState::Idle;

protected:
    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

private:
    EObitrendPlayerAnimationState BallAction = EObitrendPlayerAnimationState::Idle;
};