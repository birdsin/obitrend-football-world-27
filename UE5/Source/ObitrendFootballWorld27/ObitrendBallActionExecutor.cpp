#include "ObitrendBallActionExecutor.h"

#include "FootballBallActor.h"
#include "GameFramework/Actor.h"
#include "Components/PrimitiveComponent.h"

UObitrendBallActionExecutor::UObitrendBallActionExecutor()
{
    PrimaryComponentTick.bCanEverTick = false;
}

bool UObitrendBallActionExecutor::IsUsableBall(AFootballBallActor* Ball) const
{
    return IsValid(Ball) && IsValid(GetOwner());
}

bool UObitrendBallActionExecutor::FirstTouch(
    AFootballBallActor* Ball,
    const FVector& DesiredDirection,
    float ControlStrength)
{
    if (!IsUsableBall(Ball)) return false;

    UPrimitiveComponent* Collision = Ball->FindComponentByClass<UPrimitiveComponent>();
    if (!Collision) return false;

    const FVector Direction = DesiredDirection.GetSafeNormal2D();
    const FVector CurrentVelocity = Collision->GetPhysicsLinearVelocity();
    const float Strength = FMath::Clamp(ControlStrength, 0.0f, 1.0f);

    Collision->SetPhysicsLinearVelocity(
        FMath::Lerp(CurrentVelocity, Direction * CurrentVelocity.Size2D(), Strength));

    return true;
}

bool UObitrendBallActionExecutor::Dribble(
    AFootballBallActor* Ball,
    const FVector& Direction,
    float Speed)
{
    if (!IsUsableBall(Ball)) return false;

    UPrimitiveComponent* Collision = Ball->FindComponentByClass<UPrimitiveComponent>();
    if (!Collision) return false;

    const FVector OwnerLocation = GetOwner()->GetActorLocation();
    const FVector MoveDirection = Direction.GetSafeNormal2D();

    if (MoveDirection.IsNearlyZero()) return false;

    const FVector Target = OwnerLocation + MoveDirection * 115.0f + FVector(0, 0, 18.0f);
    const FVector ToTarget = Target - Ball->GetActorLocation();

    Collision->SetPhysicsLinearVelocity(
        ToTarget.GetSafeNormal() * FMath::Clamp(Speed, 100.0f, 1200.0f));

    return true;
}

bool UObitrendBallActionExecutor::Pass(
    AFootballBallActor* Ball,
    const FVector& TargetLocation,
    float Power)
{
    if (!IsUsableBall(Ball)) return false;

    UPrimitiveComponent* Collision = Ball->FindComponentByClass<UPrimitiveComponent>();
    if (!Collision) return false;

    const FVector Direction =
        (TargetLocation - Ball->GetActorLocation()).GetSafeNormal2D();

    if (Direction.IsNearlyZero()) return false;

    Collision->SetSimulatePhysics(true);
    Collision->SetPhysicsLinearVelocity(
        Direction * FMath::Clamp(Power, 450.0f, 1900.0f) +
        FVector(0, 0, 35.0f));

    Collision->AddAngularImpulseInRadians(
        FVector(0, 0, Power * 0.35f),
        NAME_None,
        true);

    return true;
}

bool UObitrendBallActionExecutor::Shoot(
    AFootballBallActor* Ball,
    const FVector& GoalLocation,
    float Power,
    float Lift)
{
    if (!IsUsableBall(Ball)) return false;

    UPrimitiveComponent* Collision = Ball->FindComponentByClass<UPrimitiveComponent>();
    if (!Collision) return false;

    const FVector FlatDirection =
        (GoalLocation - Ball->GetActorLocation()).GetSafeNormal2D();

    if (FlatDirection.IsNearlyZero()) return false;

    Collision->SetSimulatePhysics(true);

    const float ClampedPower = FMath::Clamp(Power, 900.0f, 3000.0f);
    const float ClampedLift = FMath::Clamp(Lift, 0.0f, 550.0f);

    Collision->SetPhysicsLinearVelocity(
        FlatDirection * ClampedPower +
        FVector(0, 0, ClampedLift));

    Collision->AddAngularImpulseInRadians(
        FVector(0, 0, ClampedPower * 0.7f),
        NAME_None,
        true);

    return true;
}

bool UObitrendBallActionExecutor::Tackle(
    AFootballBallActor* Ball,
    const FVector& Direction,
    float Power)
{
    if (!IsUsableBall(Ball)) return false;

    UPrimitiveComponent* Collision = Ball->FindComponentByClass<UPrimitiveComponent>();
    if (!Collision) return false;

    const FVector TackleDirection = Direction.GetSafeNormal2D();
    if (TackleDirection.IsNearlyZero()) return false;

    Collision->SetSimulatePhysics(true);
    Collision->SetPhysicsLinearVelocity(
        TackleDirection * FMath::Clamp(Power, 300.0f, 1400.0f));

    Collision->AddAngularImpulseInRadians(
        FVector(0, 0, Power * 0.5f),
        NAME_None,
        true);

    return true;
}