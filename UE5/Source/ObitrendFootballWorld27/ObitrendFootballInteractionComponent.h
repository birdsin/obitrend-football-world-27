#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendFootballInteractionComponent.generated.h"

UENUM(BlueprintType)
enum class EObitrendBallAction : uint8
{
    None,
    Receive,
    Dribble,
    Pass,
    Shoot,
    Clear
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendFootballInteractionComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendFootballInteractionComponent();

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    bool HasBallInControl() const;

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    bool ReceiveBall(AActor* BallActor);

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    bool DribbleBall(const FVector& Direction, float Speed);

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    bool PassBall(const FVector& Direction, float Power, float Lift = 40.0f);

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    bool ShootBall(const FVector& Direction, float Power, float Lift = 160.0f);

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    void ReleaseBall();

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Ball")
    float ControlDistance = 145.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Ball")
    float DribbleDistance = 110.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Ball")
    float PassMaxPower = 1450.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Ball")
    float ShotMaxPower = 2600.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Ball")
    EObitrendBallAction CurrentAction = EObitrendBallAction::None;

protected:
    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

private:
    UPROPERTY()
    TObjectPtr<AActor> ControlledBall;

    FVector LastDribbleDirection = FVector::ForwardVector;
    float DribbleTouchAccumulator = 0.0f;
    bool bLeftDribbleTouch = true;

    void MoveControlledBall(const FVector& TargetLocation);
    bool LaunchBall(const FVector& Direction, float Power, float Lift, EObitrendBallAction Action);
};