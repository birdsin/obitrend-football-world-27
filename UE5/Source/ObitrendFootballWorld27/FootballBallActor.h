#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "FootballBallActor.generated.h"

UCLASS()
class OBITRENDFOOTBALLWORLD27_API AFootballBallActor : public AActor
{
    GENERATED_BODY()

public:
    AFootballBallActor();

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    void Kick(const FVector& Direction, float Speed, float Lift);

protected:
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Football|Ball")
    TObjectPtr<class USphereComponent> BallCollision;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Football|Ball")
    TObjectPtr<class UStaticMeshComponent> BallMesh;
};