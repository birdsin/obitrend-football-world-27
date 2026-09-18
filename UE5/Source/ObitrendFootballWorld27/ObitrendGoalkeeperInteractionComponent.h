#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendGoalkeeperInteractionComponent.generated.h"

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendGoalkeeperInteractionComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendGoalkeeperInteractionComponent();

    UFUNCTION(BlueprintCallable, Category="Football|Goalkeeper")
    bool CanSave(AActor* BallActor, const FVector& GoalCenter) const;

    UFUNCTION(BlueprintCallable, Category="Football|Goalkeeper")
    bool SaveBall(AActor* BallActor, const FVector& GoalCenter);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Goalkeeper")
    float ReachRadius = 240.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Goalkeeper")
    float CatchSpeedLimit = 1200.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Goalkeeper")
    float ParryImpulse = 900.0f;
};