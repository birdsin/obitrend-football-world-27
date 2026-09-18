#include "ObitrendPlayerPhysicalInteractionComponent.h"

#include "GameFramework/Actor.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Components/PrimitiveComponent.h"
#include "ObitrendRealisticPlayer.h"
#include "ObitrendAnimationRuntimeComponent.h"

UObitrendPlayerPhysicalInteractionComponent::UObitrendPlayerPhysicalInteractionComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

bool UObitrendPlayerPhysicalInteractionComponent::CanChallenge(AActor* TargetPlayer) const
{
    if (!IsValid(GetOwner()) || !IsValid(TargetPlayer) || TargetPlayer == GetOwner())
    {
        return false;
    }

    return FVector::Dist2D(
        GetOwner()->GetActorLocation(),
        TargetPlayer->GetActorLocation()) <= ChallengeRange;
}

bool UObitrendPlayerPhysicalInteractionComponent::Tackle(
    AActor* TargetPlayer,
    float Strength)
{
    if (!CanChallenge(TargetPlayer))
    {
        return false;
    }

    const float ClampedStrength = FMath::Clamp(Strength, 0.25f, 1.0f);
    const FVector Direction =
        (TargetPlayer->GetActorLocation() - GetOwner()->GetActorLocation())
        .GetSafeNormal2D();

    if (ACharacter* TargetCharacter = Cast<ACharacter>(TargetPlayer))
    {
        if (UCharacterMovementComponent* Movement =
            TargetCharacter->GetCharacterMovement())
        {
            Movement->AddImpulse(
                Direction * TackleImpulse * ClampedStrength,
                true);
        }
    }

    LastAction = EObitrendPhysicalAction::Tackle;
    if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
    {
        if (Player->AnimationRuntime)
            Player->AnimationRuntime->SetAction(EObitrendRuntimeAnimation::Tackle);
    }
    return true;
}

bool UObitrendPlayerPhysicalInteractionComponent::ShoulderChallenge(
    AActor* TargetPlayer,
    float Strength)
{
    if (!IsValid(GetOwner()) || !IsValid(TargetPlayer))
    {
        return false;
    }

    const float Distance = FVector::Dist2D(
        GetOwner()->GetActorLocation(),
        TargetPlayer->GetActorLocation());

    if (Distance > ShoulderRange)
    {
        return false;
    }

    const float ClampedStrength = FMath::Clamp(Strength, 0.2f, 1.0f);
    const FVector Direction =
        (TargetPlayer->GetActorLocation() - GetOwner()->GetActorLocation())
        .GetSafeNormal2D();

    if (ACharacter* TargetCharacter = Cast<ACharacter>(TargetPlayer))
    {
        if (UCharacterMovementComponent* Movement =
            TargetCharacter->GetCharacterMovement())
        {
            Movement->AddImpulse(
                Direction * TackleImpulse * 0.55f * ClampedStrength,
                true);
        }
    }

    LastAction = EObitrendPhysicalAction::ShoulderChallenge;
    if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
    {
        if (Player->AnimationRuntime)
            Player->AnimationRuntime->SetAction(EObitrendRuntimeAnimation::ShoulderChallenge);
    }
    return true;
}

bool UObitrendPlayerPhysicalInteractionComponent::Intercept(AActor* BallActor)
{
    if (!IsValid(GetOwner()) || !IsValid(BallActor))
    {
        return false;
    }

    const float Distance = FVector::Dist2D(
        GetOwner()->GetActorLocation(),
        BallActor->GetActorLocation());

    if (Distance > ChallengeRange * 1.25f)
    {
        return false;
    }

    if (UPrimitiveComponent* BallPrimitive =
        BallActor->FindComponentByClass<UPrimitiveComponent>())
    {
        const FVector ContactDirection =
            (GetOwner()->GetActorLocation() - BallActor->GetActorLocation())
            .GetSafeNormal2D();

        BallPrimitive->SetPhysicsLinearVelocity(
            ContactDirection * 180.0f + FVector(0, 0, 25.0f));

        LastAction = EObitrendPhysicalAction::Intercept;
        if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
        {
            if (Player->AnimationRuntime)
                Player->AnimationRuntime->SetAction(EObitrendRuntimeAnimation::Intercept);
        }
        return true;
    }

    return false;
}