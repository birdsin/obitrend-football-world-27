#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendTeamAIComponent.generated.h"

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendTeamAIComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendTeamAIComponent();

    UFUNCTION(BlueprintCallable, Category="Football|AI")
    void SetTeamHasBall(bool bHasBall);

    UFUNCTION(BlueprintCallable, Category="Football|AI")
    void SetTeamAttackingDirection(float Direction);

    UFUNCTION(BlueprintPure, Category="Football|AI")
    bool HasBall() const { return bTeamHasBall; }

    UFUNCTION(BlueprintPure, Category="Football|AI")
    float GetAttackingDirection() const { return AttackingDirection; }

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float DefensiveLineY = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float Compactness = 0.72f;

private:
    bool bTeamHasBall = false;
    float AttackingDirection = 1.0f;
};