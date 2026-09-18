#include "ObitrendRealisticPlayer.h"

#include "GameFramework/CharacterMovementComponent.h"
#include "ObitrendPlayerAnimationStateComponent.h"
#include "ObitrendFootballInteractionComponent.h"
#include "ObitrendFootContactComponent.h"
#include "ObitrendPlayerVisualComponent.h"
#include "ObitrendAnimationRuntimeComponent.h"
#include "ObitrendFootballAnimInstance.h"
#include "ObitrendPlayerAnimationProfile.h"

AObitrendRealisticPlayer::AObitrendRealisticPlayer()
{
    PrimaryActorTick.bCanEverTick = true;

    AnimationState = CreateDefaultSubobject<UObitrendPlayerAnimationStateComponent>(
        TEXT("AnimationState"));
    BallInteraction = CreateDefaultSubobject<UObitrendFootballInteractionComponent>(
        TEXT("BallInteraction"));
    FootContact = CreateDefaultSubobject<UObitrendFootContactComponent>(
        TEXT("FootContact"));
    Visual = CreateDefaultSubobject<UObitrendPlayerVisualComponent>(
        TEXT("Visual"));
    AnimationRuntime = CreateDefaultSubobject<UObitrendAnimationRuntimeComponent>(
        TEXT("AnimationRuntime"));

    GetCharacterMovement()->MaxWalkSpeed = SprintSpeed;
    GetCharacterMovement()->MaxAcceleration = Acceleration;
    GetCharacterMovement()->BrakingDecelerationWalking = Deceleration;
    GetCharacterMovement()->GroundFriction = 7.0f;
    GetCharacterMovement()->RotationRate = FRotator(0.0f, 540.0f, 0.0f);
    GetCharacterMovement()->bOrientRotationToMovement = false;

    bUseControllerRotationYaw = false;
}

void AObitrendRealisticPlayer::BeginPlay()
{
    Super::BeginPlay();

    if (GetMesh())
    {
        GetMesh()->SetRelativeRotation(FRotator(0.0f, -90.0f, 0.0f));
        GetMesh()->SetRelativeLocation(FVector(0.0f, 0.0f, -90.0f));
        GetMesh()->SetAnimInstanceClass(UObitrendFootballAnimInstance::StaticClass());

        if (AnimationProfile)
        {
            if (UObitrendFootballAnimInstance* AnimInstance =
                Cast<UObitrendFootballAnimInstance>(GetMesh()->GetAnimInstance()))
            {
                AnimInstance->SetAnimationProfile(AnimationProfile);
            }
        }
    }
}

void AObitrendRealisticPlayer::SetMovementInput(const FVector2D& Input)
{
    DesiredInput = Input.GetClampedToMaxSize(1.0f);

    const FVector Direction =
        (FVector::ForwardVector * DesiredInput.X +
         FVector::RightVector * DesiredInput.Y).GetClampedToMaxSize(1.0f);

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
    const float Speed = FlatVelocity.Size2D();

    if (AnimationRuntime)
    {
        const float PreviousDirection = AnimationRuntime->MovementDirection;
        float DirectionDegrees = 0.0f;

        if (!FlatVelocity.IsNearlyZero())
        {
            const FVector Direction = FlatVelocity.GetSafeNormal2D();
            const FVector Forward = GetActorForwardVector();
            const FVector Right = GetActorRightVector();

            DirectionDegrees = FMath::RadiansToDegrees(
                FMath::Atan2(
                    FVector::DotProduct(Direction, Right),
                    FVector::DotProduct(Direction, Forward)));
        }

        AnimationRuntime->UpdateLocomotion(Speed, DirectionDegrees);

        if (Speed > 20.0f && FMath::Abs(DirectionDegrees - PreviousDirection) > 18.0f)
        {
            AnimationRuntime->SetAction(EObitrendRuntimeAnimation::Turn);
        }
    }

    if (!FlatVelocity.IsNearlyZero())
    {
        const FRotator TargetRotation = FlatVelocity.ToOrientationRotator();

        SetActorRotation(
            FMath::RInterpTo(
                GetActorRotation(),
                TargetRotation,
                DeltaSeconds,
                TurnResponsiveness));
    }
}