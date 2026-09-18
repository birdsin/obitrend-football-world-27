#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendAIMovementComponent.generated.h"

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendAIMovementComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendAIMovementComponent();

    UFUNCTION(BlueprintCallable, Category="Football|AI")
    void ExecuteDecision(
        EObitrendAIDecision Decision,
        const FVector& BallLocation,
        const FVector& TacticalTarget);

    UFUNCTION(BlueprintPure, Category="Football|AI")
    FVector GetDesiredLocation() const { return DesiredLocation; }

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float MovementAcceptanceRadius = 90.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float SupportOffset = 850.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float PressOffset = 220.0f;

protected:
    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

private:
    FVector DesiredLocation = FVector::ZeroVector;
    bool bMovementActive = false;
};