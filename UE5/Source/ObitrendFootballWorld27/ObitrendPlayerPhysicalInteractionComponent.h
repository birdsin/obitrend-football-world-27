#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendPlayerPhysicalInteractionComponent.generated.h"

UENUM(BlueprintType)
enum class EObitrendPhysicalAction : uint8
{
    None,
    Tackle,
    Intercept,
    ShoulderChallenge,
    Shield,
    Recover
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendPlayerPhysicalInteractionComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendPlayerPhysicalInteractionComponent();

    UFUNCTION(BlueprintCallable, Category="Football|Physical")
    bool CanChallenge(AActor* TargetPlayer) const;

    UFUNCTION(BlueprintCallable, Category="Football|Physical")
    bool Tackle(AActor* TargetPlayer, float Strength = 1.0f);

    UFUNCTION(BlueprintCallable, Category="Football|Physical")
    bool ShoulderChallenge(AActor* TargetPlayer, float Strength = 1.0f);

    UFUNCTION(BlueprintCallable, Category="Football|Physical")
    bool Intercept(AActor* BallActor);

    UFUNCTION(BlueprintPure, Category="Football|Physical")
    EObitrendPhysicalAction GetLastAction() const { return LastAction; }

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Physical")
    float ChallengeRange = 115.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Physical")
    float ShoulderRange = 105.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Physical")
    float MaxChallengeSpeed = 850.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Physical")
    float TackleImpulse = 260.0f;

private:
    EObitrendPhysicalAction LastAction = EObitrendPhysicalAction::None;
};