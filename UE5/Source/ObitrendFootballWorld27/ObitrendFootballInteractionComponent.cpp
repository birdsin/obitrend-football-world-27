#include "ObitrendFootballInteractionComponent.h"

#include "Components/PrimitiveComponent.h"
#include "GameFramework/Actor.h"
#include "Kismet/KismetMathLibrary.h"

UObitrendFootballInteractionComponent::UObitrendFootballInteractionComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

bool UObitrendFootballInteractionComponent::HasBallInControl() const
{
    return IsValid(ControlledBall);
}

bool UObitrendFootballInteractionComponent::ReceiveBall(AActor* BallActor)
{
    if (!IsValid(BallActor) || !IsValid(GetOwner())) return false;

    const float Distance = FVector::Dist(
        GetOwner()->GetActorLocation(),
        BallActor->GetActorLocation());

    if (Distance > ControlDistance) return false;

    ControlledBall = BallActor;
    CurrentAction = EObitrendBallAction::Receive;

    if (UPrimitiveComponent* Primitive =
        Cast<UPrimitiveComponent>(BallActor->GetRootComponent()))
    {
        Primitive->SetPhysicsLinearVelocity(FVector::ZeroVector);
        Primitive->SetPhysicsAngularVelocityInRadians(FVector::ZeroVector);
        Primitive->SetSimulatePhysics(false);
    }

    MoveControlledBall(
        GetOwner()->GetActorLocation() +
        GetOwner()->GetActorForwardVector() * DribbleDistance +
        FVector(0, 0, 35));

    return true;
}

bool UObitrendFootballInteractionComponent::DribbleBall(
    const FVector& Direction, float Speed)
{
    if (!HasBallInControl()) return false;

    LastDribbleDirection = Direction.GetSafeNormal();
    CurrentAction = EObitrendBallAction::Dribble;

    MoveControlledBall(
        GetOwner()->GetActorLocation() +
        LastDribbleDirection * DribbleDistance +
        FVector(0, 0, 35));

    return true;
}

bool UObitrendFootballInteractionComponent::PassBall(
    const FVector& Direction, float Power, float Lift)
{
    return LaunchBall(
        Direction,
        FMath::Clamp(Power, 0.0f, PassMaxPower),
        Lift,
        EObitrendBallAction::Pass);
}

bool UObitrendFootballInteractionComponent::ShootBall(
    const FVector& Direction, float Power, float Lift)
{
    return LaunchBall(
        Direction,
        FMath::Clamp(Power, 0.0f, ShotMaxPower),
        Lift,
        EObitrendBallAction::Shoot);
}

bool UObitrendFootballInteractionComponent::LaunchBall(
    const FVector& Direction,
    float Power,
    float Lift,
    EObitrendBallAction Action)
{
    if (!HasBallInControl()) return false;

    AActor* Ball = ControlledBall;
    CurrentAction = Action;
    ControlledBall = nullptr;

    if (UPrimitiveComponent* Primitive =
        Cast<UPrimitiveComponent>(Ball->GetRootComponent()))
    {
        Primitive->SetSimulatePhysics(true);

        const FVector LaunchVelocity =
            Direction.GetSafeNormal() * Power +
            FVector::UpVector * Lift;

        Primitive->SetPhysicsLinearVelocity(LaunchVelocity);
        Primitive->AddAngularImpulseInRadians(
            FVector(0.0f, 0.0f, Power * 0.45f),
            NAME_None,
            true);
    }

    return true;
}

void UObitrendFootballInteractionComponent::ReleaseBall()
{
    ControlledBall = nullptr;
    CurrentAction = EObitrendBallAction::None;
}

void UObitrendFootballInteractionComponent::MoveControlledBall(
    const FVector& TargetLocation)
{
    if (IsValid(ControlledBall))
    {
        ControlledBall->SetActorLocation(
            TargetLocation,
            false,
            nullptr,
            ETeleportType::TeleportPhysics);
    }
}

void UObitrendFootballInteractionComponent::TickComponent(
    float DeltaTime,
    ELevelTick TickType,
    FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    if (!HasBallInControl()) return;

    const FVector Desired =
        GetOwner()->GetActorLocation() +
        GetOwner()->GetActorForwardVector() * DribbleDistance +
        FVector(0, 0, 35);

    const FVector Current = ControlledBall->GetActorLocation();

    MoveControlledBall(
        FMath::VInterpTo(Current, Desired, DeltaTime, 14.0f));
}