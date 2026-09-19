#include "ObitrendMatchAIController.h"

#include "ObitrendMatchPlayerSpawner.h"
#include "ObitrendRealisticPlayer.h"
#include "ObitrendFootballInteractionComponent.h"
#include "ObitrendMatchRulesComponent.h"
#include "ObitrendMatchFlowComponent.h"
#include "FootballBallActor.h"
#include "Components/PrimitiveComponent.h"

AObitrendMatchAIController::AObitrendMatchAIController()
{
    PrimaryActorTick.bCanEverTick = true;
}

void AObitrendMatchAIController::InitializeMatchAI(
    AObitrendMatchPlayerSpawner* InSpawner,
    AFootballBallActor* InBall)
{
    Spawner = InSpawner;
    Ball = InBall;
    DecisionAccumulator = 0.0f;
    PossessionAccumulator = 0.0f;
    ActionCooldown = 1.0f;

    MatchRules = NewObject<UObitrendMatchRulesComponent>(this, TEXT("MatchRules"));
    MatchFlow = NewObject<UObitrendMatchFlowComponent>(this, TEXT("MatchFlow"));

    if (MatchRules) MatchRules->RegisterComponent();
    if (MatchFlow)
    {
        MatchFlow->RegisterComponent();
        MatchFlow->StartMatch();
    }
}

bool AObitrendMatchAIController::IsBallInRange(
    const AObitrendRealisticPlayer* Player) const
{
    return Player && Ball &&
        FVector::Dist2D(
            Player->GetActorLocation(),
            Ball->GetActorLocation()) <= 170.0f;
}

FVector AObitrendMatchAIController::GetFormationTarget(
    const AObitrendRealisticPlayer* Player) const
{
    if (!Player) return FVector::ZeroVector;

    const FVector Current = Player->GetActorLocation();
    const FVector BallLocation = Ball ? Ball->GetActorLocation() : Current;

    FVector Target = Current;
    Target.Y += (BallLocation.Y - Current.Y) * 0.22f;

    if (Player->Role == EObitrendPlayerRole::Attacker)
        Target.X += Player->bHomeTeam ? 260.0f : -260.0f;
    else if (Player->Role == EObitrendPlayerRole::Midfielder)
        Target.X += Player->bHomeTeam ? 90.0f : -90.0f;

    return Target;
}

void AObitrendMatchAIController::UpdatePossession(float DeltaSeconds)
{
    if (!Ball || !Spawner) return;

    if (PossessingPlayer.IsValid() && IsBallInRange(PossessingPlayer.Get()))
        return;

    AObitrendRealisticPlayer* Candidate = nullptr;
    float BestDistance = 190.0f;

    for (AObitrendRealisticPlayer* Player : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Player)) continue;

        const float Distance =
            FVector::Dist2D(Player->GetActorLocation(), Ball->GetActorLocation());

        if (Distance < BestDistance)
        {
            BestDistance = Distance;
            Candidate = Player;
        }
    }

    if (Candidate && Candidate->BallInteraction)
    {
        if (Candidate->BallInteraction->ReceiveBall(Ball))
        {
            PossessingPlayer = Candidate;
            PossessionAccumulator = 0.0f;
            ActionCooldown = 0.65f;
        }
    }
}

void AObitrendMatchAIController::ExecutePossessionAction(float DeltaSeconds)
{
    AObitrendRealisticPlayer* Player = PossessingPlayer.Get();
    if (!Player || !Ball || !Player->BallInteraction) return;

    ActionCooldown -= DeltaSeconds;
    if (ActionCooldown > 0.0f) return;

    const FVector Goal =
        Player->bHomeTeam
        ? FVector(5250.0f, 0.0f, 100.0f)
        : FVector(-5250.0f, 0.0f, 100.0f);

    const float GoalDistance =
        FVector::Dist2D(Player->GetActorLocation(), Goal);

    TArray<AActor*> Teammates;
    TArray<AActor*> Opponents;

    for (AObitrendRealisticPlayer* Other : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Other) || Other == Player) continue;

        if (Other->bHomeTeam == Player->bHomeTeam)
            Teammates.Add(Other);
        else
            Opponents.Add(Other);
    }

    AActor* BestTarget = nullptr;
    float BestScore = -BIG_NUMBER;

    for (AActor* Mate : Teammates)
    {
        const float Distance =
            FVector::Dist2D(Player->GetActorLocation(), Mate->GetActorLocation());

        if (Distance > 3600.0f || Distance < 300.0f) continue;

        const FVector ToMate =
            (Mate->GetActorLocation() - Player->GetActorLocation()).GetSafeNormal2D();

        const FVector ToGoal =
            (Goal - Player->GetActorLocation()).GetSafeNormal2D();

        const float Forward = FVector::DotProduct(ToMate, ToGoal);
        const float Score = Forward * 0.7f -
            FMath::Clamp(Distance / 5000.0f, 0.0f, 1.0f) * 0.2f;

        if (Score > BestScore)
        {
            BestScore = Score;
            BestTarget = Mate;
        }
    }

    if (GoalDistance < 2300.0f)
    {
        const FVector ShotDirection =
            (Goal - Ball->GetActorLocation()).GetSafeNormal2D();

        Player->BallInteraction->ShootBall(
            ShotDirection,
            FMath::Clamp(2500.0f - GoalDistance * 0.12f, 1500.0f, 2500.0f),
            180.0f);

        PossessingPlayer.Reset();
        ActionCooldown = 1.0f;
        return;
    }

    if (BestTarget && BestScore > 0.15f)
    {
        const FVector PassDirection =
            (BestTarget->GetActorLocation() - Ball->GetActorLocation())
            .GetSafeNormal2D();

        Player->BallInteraction->PassBall(
            PassDirection,
            FMath::Clamp(
                FVector::Dist2D(
                    Player->GetActorLocation(),
                    BestTarget->GetActorLocation()) * 0.45f,
                650.0f,
                1450.0f),
            45.0f);

        PossessingPlayer.Reset();
        ActionCooldown = 0.85f;
        return;
    }

    Player->BallInteraction->DribbleBall(
        Player->GetActorForwardVector(),
        Player->SprintSpeed * 0.72f);

    ActionCooldown = 0.45f;
}

void AObitrendMatchAIController::UpdateTeam(
    TArray<AObitrendRealisticPlayer*>& Team,
    float DeltaSeconds)
{
    if (!Ball) return;

    const FVector BallLocation = Ball->GetActorLocation();

    AObitrendRealisticPlayer* Closest = nullptr;
    float ClosestDistance = BIG_NUMBER;

    for (AObitrendRealisticPlayer* Player : Team)
    {
        if (!IsValid(Player)) continue;

        const float Distance =
            FVector::Dist2D(Player->GetActorLocation(), BallLocation);

        if (Distance < ClosestDistance)
        {
            ClosestDistance = Distance;
            Closest = Player;
        }
    }

    for (AObitrendRealisticPlayer* Player : Team)
    {
        if (!IsValid(Player)) continue;

        FVector Target = GetFormationTarget(Player);

        if (Player == Closest && ClosestDistance < 2600.0f)
            Target = BallLocation;

        const FVector ToTarget =
            (Target - Player->GetActorLocation()).GetSafeNormal2D();

        if (!ToTarget.IsNearlyZero())
        {
            const FVector Forward = Player->GetActorForwardVector();
            const FVector Right = Player->GetActorRightVector();

            Player->SetMovementInput(
                FVector2D(
                    FVector::DotProduct(ToTarget, Forward),
                    FVector::DotProduct(ToTarget, Right)).GetSafeNormal());

            Player->Sprint(
                FVector::Dist2D(Player->GetActorLocation(), Target) > 700.0f);
        }
        else
        {
            Player->SetMovementInput(FVector2D::ZeroVector);
            Player->Sprint(false);
        }
    }
}

void AObitrendMatchAIController::HandleGoal(int32 ScoringTeam)
{
    if (MatchRules) MatchRules->RegisterGoal(ScoringTeam);
    if (MatchFlow) MatchFlow->RegisterGoal(ScoringTeam);

    PossessingPlayer.Reset();
    ActionCooldown = 4.0f;
    PossessionAccumulator = 0.0f;

    ResetBallToCenter();

    if (Spawner)
        Spawner->SpawnStartingXI();
}

void AObitrendMatchAIController::ResetBallToCenter()
{
    if (!Ball) return;

    Ball->SetActorLocation(FVector(0.0f, 0.0f, 35.0f), false);

    if (UPrimitiveComponent* Primitive =
        Ball->FindComponentByClass<UPrimitiveComponent>())
    {
        Primitive->SetPhysicsLinearVelocity(FVector::ZeroVector);
        Primitive->SetPhysicsAngularVelocityInDegrees(FVector::ZeroVector);
        Primitive->SetSimulatePhysics(true);
        Primitive->WakeAllRigidBodies();
    }
}

void AObitrendMatchAIController::ResetForKickoff()
{
    PossessingPlayer.Reset();
    ActionCooldown = 0.8f;
    PossessionAccumulator = 0.0f;
    ResetBallToCenter();
}

void AObitrendMatchAIController::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    if (!Spawner || !Ball) return;

    if (MatchFlow)
    {
        const EObitrendMatchPhase Phase = MatchFlow->GetPhase();

        if (Phase == EObitrendMatchPhase::FullTime)
            return;

        if (Phase == EObitrendMatchPhase::HalfTime)
            return;

    }

    int32 ScoringTeam = -1;
    if (MatchRules &&
        MatchRules->CheckGoal(Ball->GetActorLocation(), ScoringTeam))
    {
        HandleGoal(ScoringTeam);
        return;
    }

    UpdatePossession(DeltaSeconds);

    if (PossessingPlayer.IsValid())
        ExecutePossessionAction(DeltaSeconds);

    DecisionAccumulator += DeltaSeconds;
    if (DecisionAccumulator < 0.10f) return;

    DecisionAccumulator = 0.0f;

    TArray<AObitrendRealisticPlayer*> Home;
    TArray<AObitrendRealisticPlayer*> Away;

    for (AObitrendRealisticPlayer* Player : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Player)) continue;

        if (Player->bHomeTeam) Home.Add(Player);
        else Away.Add(Player);
    }

    UpdateTeam(Home, DeltaSeconds);
    UpdateTeam(Away, DeltaSeconds);
}