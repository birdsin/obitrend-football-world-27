#include "ObitrendRealisticPlayer.h"

#include "GameFramework/CharacterMovementComponent.h"

AObitrendRealisticPlayer::AObitrendRealisticPlayer()
{
    PrimaryActorTick.bCanEverTick = true;

    GetCharacterMovement()->MaxWalkSpeed = SprintSpeed;
    GetCharacterMovement()->MaxAcceleration = Acceleration;
    GetCharacterMovement()->BrakingDecelerationWalking = Deceleration;
    GetCharacterMovement()->GroundFriction = 7.0f;
    GetCharacterMovement()->RotationRate = FRotator(0.0f, 720.0f, 0.0f);
    GetCharacterMovement()->bOrientRotationToMovement = true;

    bUseControllerRotationYaw = false;
}

void AObitrendRealisticPlayer::SetMovementInput(const FVector2D& Input)
{
    DesiredInput = Input.GetClampedToMaxSize(1.0f);

    const FVector Forward = FVector::ForwardVector;
    const FVector Right = FVector::RightVector;

    const FVector Direction =
        (Forward * DesiredInput.Y + Right * DesiredInput.X).GetClampedToMaxSize(1.0f);

    AddMovementInput(Direction, 1.0f);
}

void AObitrendRealisticPlayer::Sprint(bool bEnabled)
{
    bSprintRequested = bEnabled;
    GetCharacterMovement()->MaxWalkSpeed =
        bSprintRequested ? SprintSpeed : SprintSpeed * 0.58f;
}

void AObitrendRealisticPlayer::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    const FVector Velocity = GetVelocity();
    const FVector FlatVelocity(Velocity.X, Velocity.Y, 0.0f);

    if (!FlatVelocity.IsNearlyZero())
    {
        const FRotator TargetRotation =
            FlatVelocity.ToOrientationRotator();

        const FRotator NewRotation = FMath::RInterpTo(
            GetActorRotation(),
            TargetRotation,
            DeltaSeconds,
            TurnResponsiveness);

        SetActorRotation(NewRotation);
    }
}