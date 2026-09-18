#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "ObitrendRealisticPlayer.generated.h"

UENUM(BlueprintType)
enum class EObitrendPlayerRole : uint8
{
    Goalkeeper,
    Defender,
    Midfielder,
    Attacker
};

UCLASS()
class OBITRENDFOOTBALLWORLD27_API AObitrendRealisticPlayer : public ACharacter
{
    GENERATED_BODY()

public:
    AObitrendRealisticPlayer();

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Football|Player")
    TObjectPtr<class UObitrendPlayerAnimationStateComponent> AnimationState;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Football|Player")
    TObjectPtr<class UObitrendFootballInteractionComponent> BallInteraction;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Football|Player")
    TObjectPtr<class UObitrendFootContactComponent> FootContact;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Football|Player")
    TObjectPtr<class UObitrendPlayerVisualComponent> Visual;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Player")
    EObitrendPlayerRole Role = EObitrendPlayerRole::Midfielder;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Player")
    float SprintSpeed = 720.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Player")
    float Acceleration = 1800.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Player")
    float Deceleration = 2200.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Player")
    float TurnResponsiveness = 8.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Player")
    float KickPower = 1500.0f;

    UFUNCTION(BlueprintCallable, Category="Football|Player")
    void SetMovementInput(const FVector2D& Input);

    UFUNCTION(BlueprintCallable, Category="Football|Player")
    void Sprint(bool bEnabled);

protected:
    virtual void Tick(float DeltaSeconds) override;

private:
    FVector2D DesiredInput = FVector2D::ZeroVector;
    bool bSprintRequested = false;
};