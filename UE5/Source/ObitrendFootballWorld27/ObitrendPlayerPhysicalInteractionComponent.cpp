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
    const FVector ToTarget =
        (TargetPlayer->GetActorLocation() - GetOwner()->GetActorLocation()).GetSafeNormal2D();
    const float ApproachFactor =
        FMath::Clamp(FVector::DotProduct(GetOwner()->GetActorForwardVector(), ToTarget), -1.0f, 1.0f);
    const float ContactAngleFactor = FMath::GetMappedRangeValueClamped(
        FVector2D(-1.0f, 1.0f), FVector2D(0.35f, 1.0f), ApproachFactor);
    const FVector RelativeVelocity = TargetPlayer->GetVelocity() - GetOwner()->GetVelocity();
    const float ClosingSpeed = FVector::DotProduct(RelativeVelocity, (TargetPlayer->GetActorLocation() - GetOwner()->GetActorLocation()).GetSafeNormal2D());
    const float ContactFactor = FMath::Clamp(FMath::Abs(ClosingSpeed) / 700.0f, 0.35f, 1.0f);
    const FVector Direction =
        (TargetPlayer->GetActorLocation() - GetOwner()->GetActorLocation())
        .GetSafeNormal2D();

    if (ACharacter* TargetCharacter = Cast<ACharacter>(TargetPlayer))
    {
        if (UCharacterMovementComponent* Movement =
            TargetCharacter->GetCharacterMovement())
        {
            Movement->AddImpulse(
                Direction * TackleImpulse * ClampedStrength * ContactFactor * ContactAngleFactor,
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
    const FVector ToTarget =
        (TargetPlayer->GetActorLocation() - GetOwner()->GetActorLocation()).GetSafeNormal2D();
    const float ApproachFactor =
        FMath::Clamp(FVector::DotProduct(GetOwner()->GetActorForwardVector(), ToTarget), -1.0f, 1.0f);
    const float ContactAngleFactor = FMath::GetMappedRangeValueClamped(
        FVector2D(-1.0f, 1.0f), FVector2D(0.45f, 1.0f), ApproachFactor);
    const FVector RelativeVelocity = TargetPlayer->GetVelocity() - GetOwner()->GetVelocity();
    const float ClosingSpeed = FMath::Abs(FVector::DotProduct(RelativeVelocity, (TargetPlayer->GetActorLocation() - GetOwner()->GetActorLocation()).GetSafeNormal2D()));
    const float ContactFactor = FMath::Clamp(ClosingSpeed / 700.0f, 0.35f, 1.0f);
    const FVector Direction =
        (TargetPlayer->GetActorLocation() - GetOwner()->GetActorLocation())
        .GetSafeNormal2D();

    if (ACharacter* TargetCharacter = Cast<ACharacter>(TargetPlayer))
    {
        if (UCharacterMovementComponent* Movement =
            TargetCharacter->GetCharacterMovement())
        {
            Movement->AddImpulse(
                Direction * TackleImpulse * 0.55f * ClampedStrength * ContactFactor * ContactAngleFactor,
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
        const FVector BallVelocity = BallPrimitive->GetPhysicsLinearVelocity();
        const float IncomingSpeed = BallVelocity.Size2D();
        const FVector BallTravelDirection = BallVelocity.GetSafeNormal2D();
        const FVector ToPlayer =
            (GetOwner()->GetActorLocation() - BallActor->GetActorLocation()).GetSafeNormal2D();

        const float ApproachFactor = FMath::Clamp(
            FVector::DotProduct(BallTravelDirection, ToPlayer),
            0.0f,
            1.0f);

        const FVector SideDirection =
            FVector::CrossProduct(FVector::UpVector, BallTravelDirection).GetSafeNormal();
        const float SideDeflection =
            FMath::Clamp(ApproachFactor * 95.0f, 0.0f, 95.0f);

        const float DeflectionSpeed =
            FMath::Clamp(150.0f + IncomingSpeed * 0.22f, 150.0f, 620.0f);

        const FVector ContactDirection =
            FMath::Lerp(
                ToPlayer,
                BallTravelDirection * -1.0f,
                0.35f * ApproachFactor).GetSafeNormal2D();

        BallPrimitive->SetPhysicsLinearVelocity(
            ContactDirection * DeflectionSpeed +
            SideDirection * SideDeflection +
            FVector(0, 0, FMath::Clamp(18.0f + IncomingSpeed * 0.025f, 18.0f, 70.0f)));

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