#include "ObitrendMatchAIController.h"

#include "ObitrendMatchPlayerSpawner.h"
#include "ObitrendRealisticPlayer.h"
#include "ObitrendFootballInteractionComponent.h"
#include "ObitrendPlayerPhysicalInteractionComponent.h"
#include "ObitrendGoalkeeperActionComponent.h"
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
    GoalkeeperActionCooldown = 0.0f;
    DefensiveActionCooldown = 0.0f;

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
        // Fast passes are received from the ball's travel corridor rather than
        // by an instantaneous radius check. This gives the receiver a small
        // body-control window before possession is established.
        const FVector CandidateLocation = Candidate->GetActorLocation();
        const FVector BallLocation = Ball->GetActorLocation();
        const FVector ToBall = (BallLocation - CandidateLocation).GetSafeNormal2D();
        const FVector CandidateVelocity = Candidate->GetVelocity().GetSafeNormal2D();
        const FVector BallVelocity = Ball->GetVelocity().GetSafeNormal2D();
        const float BallSpeed = Ball->GetVelocity().Size2D();

        const float ReceiveAlignment =
            CandidateVelocity.IsNearlyZero()
            ? 1.0f
            : FVector::DotProduct(CandidateVelocity, ToBall);

        const float BallApproachAlignment =
            BallVelocity.IsNearlyZero()
            ? 1.0f
            : FVector::DotProduct(BallVelocity, ToBall);

        const float SideAlignment =
            BallVelocity.IsNearlyZero()
            ? 0.0f
            : FMath::Abs(FVector::DotProduct(
                FVector::CrossProduct(FVector::UpVector, BallVelocity),
                ToBall));

        const float ReceiveThreshold =
            BallSpeed > 1100.0f ? -0.02f : -0.20f;

        const bool bBallArrivingAcrossBody =
            BallApproachAlignment < -0.20f || SideAlignment > 0.55f;

        const bool bCleanApproach =
            ReceiveAlignment > ReceiveThreshold ||
            bBallArrivingAcrossBody;

        if (bCleanApproach &&
            Candidate->BallInteraction->ReceiveBall(Ball))
        {
            PossessingPlayer = Candidate;
            PossessionAccumulator = 0.0f;
            ActionCooldown =
                BallSpeed > 1100.0f ? 0.78f : 0.65f;
        }
    }
}

void AObitrendMatchAIController::UpdateGoalkeeperActions(float DeltaSeconds)
{
    if (!Spawner || !Ball || GoalkeeperActionCooldown > 0.0f)
        return;

    UPrimitiveComponent* BallPrimitive =
        Ball->FindComponentByClass<UPrimitiveComponent>();

    if (!BallPrimitive)
        return;

    const FVector BallLocation = Ball->GetActorLocation();
    const FVector BallVelocity = BallPrimitive->GetPhysicsLinearVelocity();

    if (BallVelocity.Size2D() < 250.0f)
        return;

    for (AObitrendRealisticPlayer* Player : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Player) ||
            Player->Role != EObitrendPlayerRole::Goalkeeper ||
            !Player->GoalkeeperAction)
        {
            continue;
        }

        // Home defends the negative-X goal; away defends the positive-X goal.
        const float GoalX = Player->bHomeTeam ? -5250.0f : 5250.0f;
        const FVector GoalCenter(GoalX, 0.0f, 100.0f);
        const FVector ToGoal = (GoalCenter - BallLocation).GetSafeNormal2D();

        // Only react when the ball is actually travelling toward this keeper's goal.
        if (FVector::DotProduct(BallVelocity.GetSafeNormal2D(), ToGoal) < 0.25f)
            continue;

        const float GoalDistance = FVector::Dist2D(BallLocation, GoalCenter);
        if (GoalDistance > 5200.0f)
            continue;

        // Keep the goalkeeper naturally aligned with the ball's lateral
        // position while remaining inside the goal mouth.
        const float DesiredY = FMath::Clamp(BallLocation.Y * 0.42f, -300.0f, 300.0f);
        const FVector KeeperTarget(GoalX, DesiredY, Player->GetActorLocation().Z);
        const FVector ToKeeperTarget =
            (KeeperTarget - Player->GetActorLocation()).GetSafeNormal2D();

        if (!ToKeeperTarget.IsNearlyZero())
        {
            const FVector Forward = Player->GetActorForwardVector();
            const FVector Right = Player->GetActorRightVector();
            const float DistanceToTarget =
                FVector::Dist2D(Player->GetActorLocation(), KeeperTarget);

            Player->SetMovementInput(
                FVector2D(
                    FVector::DotProduct(ToKeeperTarget, Forward),
                    FVector::DotProduct(ToKeeperTarget, Right)).GetSafeNormal()
                * FMath::Clamp(DistanceToTarget / 250.0f, 0.0f, 0.75f));
            Player->Sprint(false);
        }

        const EObitrendGoalkeeperAction Action =
            Player->GoalkeeperAction->EvaluateSave(Ball, GoalCenter, 732.0f);

        if (Action != EObitrendGoalkeeperAction::Ready)
        {
            if (Player->GoalkeeperAction->ExecuteSave(Ball, Action))
            {
                GoalkeeperActionCooldown = 0.65f;
                PossessingPlayer.Reset();
                break;
            }
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

        float NearestOpponentDistance = 5000.0f;
        for (AActor* Opponent : Opponents)
        {
            if (!IsValid(Opponent)) continue;
            NearestOpponentDistance = FMath::Min(
                NearestOpponentDistance,
                FVector::Dist2D(Mate->GetActorLocation(), Opponent->GetActorLocation()));
        }

        // Prefer forward options that are not immediately crowded, producing
        // more believable passing decisions instead of always choosing the
        // same forward-most teammate.
        const float SpaceScore =
            FMath::Clamp(NearestOpponentDistance / 1200.0f, 0.0f, 1.0f);
        const float ForwardScore = (Forward + 1.0f) * 0.5f;
        const float DistancePenalty =
            FMath::Clamp(Distance / 5000.0f, 0.0f, 1.0f);

        const float Score =
            ForwardScore * 0.55f +
            SpaceScore * 0.35f -
            DistancePenalty * 0.10f;

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
        // Lead the receiver slightly according to their current movement so
        // passes arrive into space instead of always targeting the player's
        // current feet. The lead is capped to keep short passes controllable.
        const FVector ReceiverVelocity =
            BestTarget->GetVelocity().GetClampedToMaxSize2D(900.0f);
        const float ReceiverDistance =
            FVector::Dist2D(
                Player->GetActorLocation(),
                BestTarget->GetActorLocation());
        const float PassTravelTime =
            FMath::Clamp(ReceiverDistance / 1150.0f, 0.18f, 0.85f);
        const FVector LeadLocation =
            BestTarget->GetActorLocation() +
            ReceiverVelocity * PassTravelTime * 0.42f;

        const FVector PassDirection =
            (LeadLocation - Ball->GetActorLocation()).GetSafeNormal2D();

        const float LeadDistance =
            FVector::Dist2D(
                Player->GetActorLocation(),
                LeadLocation);

        Player->BallInteraction->PassBall(
            PassDirection,
            FMath::Clamp(LeadDistance * 0.45f, 650.0f, 1450.0f),
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

void AObitrendMatchAIController::UpdateDefensivePressure(float DeltaSeconds)
{
    DefensiveActionCooldown = FMath::Max(0.0f, DefensiveActionCooldown - DeltaSeconds);
    if (DefensiveActionCooldown > 0.0f || !Spawner || !PossessingPlayer.IsValid())
        return;

    AObitrendRealisticPlayer* BallCarrier = PossessingPlayer.Get();

    // Shape pressure around the carrier's current attacking direction so
    // defenders close space without all converging on the same point.
    const FVector CarrierVelocity = BallCarrier->GetVelocity().GetSafeNormal2D();
    const FVector CarrierForward = CarrierVelocity.IsNearlyZero()
        ? BallCarrier->GetActorForwardVector()
        : CarrierVelocity;

    const FVector CarrierLateral =
        FVector::CrossProduct(FVector::UpVector, CarrierForward);

    AObitrendRealisticPlayer* ClosestDefender = nullptr;
    float ClosestDistance = BIG_NUMBER;
    AObitrendRealisticPlayer* SecondDefender = nullptr;
    float SecondDistance = BIG_NUMBER;

    for (AObitrendRealisticPlayer* Player : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Player) || Player == BallCarrier ||
            Player->bHomeTeam == BallCarrier->bHomeTeam ||
            !Player->PhysicalInteraction)
        {
            continue;
        }

        const float Distance =
            FVector::Dist2D(Player->GetActorLocation(), BallCarrier->GetActorLocation());

        const FVector ToCarrier =
            (BallCarrier->GetActorLocation() - Player->GetActorLocation()).GetSafeNormal2D();
        const float FrontPressure =
            FMath::Clamp(FVector::DotProduct(ToCarrier, CarrierForward), -1.0f, 1.0f);

        // Prefer defenders already positioned in the carrier's forward lane,
        // while still allowing a closer defender to challenge.
        const float LateralLane =
            FMath::Abs(FVector::DotProduct(ToCarrier, CarrierLateral));

        const float LanePenalty =
            LateralLane > 0.70f ? 0.96f : 1.0f;

        const float EffectiveDistance =
            Distance *
            (1.0f + FMath::Max(0.0f, FrontPressure) * 0.10f) *
            LanePenalty;

        if (EffectiveDistance < ClosestDistance)
        {
            SecondDefender = ClosestDefender;
            SecondDistance = ClosestDistance;
            ClosestDefender = Player;
            ClosestDistance = Distance;
        }
        else if (Distance < SecondDistance)
        {
            SecondDefender = Player;
            SecondDistance = Distance;
        }
    }

    // Keep the nearest defender as the active challenger so defenders do not
    // unrealistically stack tackles on the same frame.
    if (ClosestDefender && ClosestDistance <= 115.0f)
    {
        // Do not force a tackle while the carrier is already moving away from
        // the defender at a sharp angle. This creates a more believable delay
        // before the defender commits.
        const FVector ToCarrier =
            (BallCarrier->GetActorLocation() - ClosestDefender->GetActorLocation())
            .GetSafeNormal2D();
        const FVector CarrierVelocity =
            BallCarrier->GetVelocity().GetSafeNormal2D();

        const float ApproachAlignment =
            FMath::Clamp(
                FVector::DotProduct(
                    ClosestDefender->GetActorForwardVector(),
                    ToCarrier),
                -1.0f,
                1.0f);

        const FVector CarrierDirection =
            BallCarrier->GetVelocity().GetSafeNormal2D();
        const float CarrierEscapeAlignment =
            CarrierDirection.IsNearlyZero()
            ? 0.0f
            : FVector::DotProduct(CarrierDirection, ToCarrier);

        if (CarrierEscapeAlignment < -0.72f && ClosestDistance > 72.0f)
        {
            DefensiveActionCooldown = 0.12f;
            return;
        }

        // A defender approaching from behind should challenge less aggressively,
        // while a well-aligned front/side approach can commit more naturally.
        const float AngleFactor =
            FMath::GetMappedRangeValueClamped(
                FVector2D(-1.0f, 1.0f),
                FVector2D(0.55f, 1.0f),
                ApproachAlignment);

        // If the carrier is moving away quickly, reduce the commitment so the
        // challenge behaves more like a realistic attempt to contain the run.
        const float CarrierSeparation =
            CarrierVelocity.IsNearlyZero()
                ? 0.0f
                : FVector::DotProduct(CarrierVelocity, ToCarrier);
        const float ChaseFactor =
            FMath::GetMappedRangeValueClamped(
                FVector2D(-1.0f, 1.0f),
                FVector2D(0.72f, 1.0f),
                CarrierSeparation);

        const float PressureStrength =
            FMath::Clamp(
                (0.58f + (115.0f - ClosestDistance) * 0.0025f) *
                AngleFactor *
                ChaseFactor,
                0.26f,
                0.87f);

        if (ClosestDefender->PhysicalInteraction->Tackle(BallCarrier, PressureStrength))
            DefensiveActionCooldown = 0.32f;
    }
    else if (ClosestDefender && ClosestDistance <= 180.0f)
    {
        const FVector ToCarrier =
            (BallCarrier->GetActorLocation() - ClosestDefender->GetActorLocation())
            .GetSafeNormal2D();
        const float ApproachAlignment =
            FMath::Clamp(
                FVector::DotProduct(
                    ClosestDefender->GetActorForwardVector(),
                    ToCarrier),
                -1.0f,
                1.0f);

        const float AngleFactor =
            FMath::GetMappedRangeValueClamped(
                FVector2D(-1.0f, 1.0f),
                FVector2D(0.65f, 1.0f),
                ApproachAlignment);

        const float PressureStrength =
            FMath::Clamp(
                (0.36f + (180.0f - ClosestDistance) * 0.0018f) * AngleFactor,
                0.22f,
                0.58f);

        if (ClosestDefender->PhysicalInteraction->ShoulderChallenge(BallCarrier, PressureStrength))
            DefensiveActionCooldown = 0.24f;
    }

    // A second defender can provide support only when close enough, without
    // triggering a simultaneous full tackle.
    if (SecondDefender && SecondDistance <= 145.0f)
    {
        const float SupportStrength =
            FMath::Clamp(0.22f + (145.0f - SecondDistance) * 0.0012f, 0.22f, 0.38f);
        SecondDefender->PhysicalInteraction->ShoulderChallenge(BallCarrier, SupportStrength);
    }
}

void AObitrendMatchAIController::UpdateTeam(
    TArray<AObitrendRealisticPlayer*>& Team,
    float DeltaSeconds)
{
    if (!Ball) return;

    const FVector BallLocation = Ball->GetActorLocation();
    const FVector BallVelocity = Ball->GetVelocity();
    const float BallSpeed = BallVelocity.Size2D();

    // Give players a short look-ahead so they can move toward where a
    // rolling/passed ball is heading rather than reacting one frame late.
    const float LookAheadTime =
        FMath::Clamp(BallSpeed / 1800.0f, 0.08f, 0.42f);

    // Add a small amount of lateral anticipation from the ball's current
    // trajectory. This helps players meet angled passes instead of chasing
    // the ball from behind.
    const FVector BallDirection = BallVelocity.GetSafeNormal2D();
    const FVector LateralAnticipation =
        FVector::CrossProduct(FVector::UpVector, BallDirection) *
        FMath::Clamp(BallSpeed / 2400.0f, 0.0f, 1.0f) *
        28.0f;

    const FVector ProjectedBallLocation =
        BallLocation +
        BallDirection * BallSpeed * LookAheadTime +
        LateralAnticipation;

    // Keep the anticipation point inside a realistic playable corridor so
    // very fast balls cannot pull an entire team unnaturally out of shape.
    const FVector SafeProjectedBallLocation(
        FMath::Clamp(ProjectedBallLocation.X, -4700.0f, 4700.0f),
        FMath::Clamp(ProjectedBallLocation.Y, -3150.0f, 3150.0f),
        ProjectedBallLocation.Z);

    AObitrendRealisticPlayer* Closest = nullptr;
    float ClosestDistance = BIG_NUMBER;

    for (AObitrendRealisticPlayer* Player : Team)
    {
        if (!IsValid(Player)) continue;

        const float Distance =
            FVector::Dist2D(Player->GetActorLocation(), SafeProjectedBallLocation);

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
            Target = SafeProjectedBallLocation;

        if (Player == Closest && ClosestDistance < 1400.0f)
        {
            // At close range, intercept the ball's projected path rather than
            // steering directly at its current center. This reduces late,
            // robotic corrections on fast passes.
            const float InterceptSpeed =
                FMath::Max(Player->GetVelocity().Size2D(), 420.0f);
            const float InterceptTime =
                FMath::Clamp(ClosestDistance / InterceptSpeed, 0.08f, 0.38f);
            const FVector InterceptTarget =
                BallLocation +
                BallVelocity.GetSafeNormal2D() *
                BallSpeed *
                InterceptTime;

            Target = FMath::VInterpTo(
                Player->GetActorLocation(),
                InterceptTarget,
                DeltaSeconds,
                5.2f);
        }

        // Give nearby teammates a small supporting movement toward the ball
        // while keeping the rest of the formation intact.
        const float TeammateBallDistance =
            FVector::Dist2D(Player->GetActorLocation(), BallLocation);
        if (Player != Closest && TeammateBallDistance < 900.0f &&
            (Player->Role == EObitrendPlayerRole::Midfielder ||
             Player->Role == EObitrendPlayerRole::Attacker))
        {
            const FVector SupportDirection =
                (SafeProjectedBallLocation - Player->GetActorLocation()).GetSafeNormal2D();

            // Offset support runners across the ball path so they create
            // separate passing lanes instead of clustering around the ball.
            const FVector SupportLateral =
                FVector::CrossProduct(FVector::UpVector, SupportDirection);

            const float TeamSide =
                Player->bHomeTeam ? 1.0f : -1.0f;

            const float RoleOffset =
                Player->Role == EObitrendPlayerRole::Attacker ? 85.0f : 55.0f;

            const float SupportOffset =
                FMath::Clamp(
                    (900.0f - TeammateBallDistance) * 0.16f,
                    0.0f,
                    RoleOffset);

            Target +=
                SupportDirection * FMath::Clamp(
                    900.0f - TeammateBallDistance,
                    0.0f,
                    280.0f) +
                SupportLateral * SupportOffset * TeamSide;
        }

        const FVector ToTarget =
            (Target - Player->GetActorLocation()).GetSafeNormal2D();

        if (!ToTarget.IsNearlyZero())
        {
            const FVector Forward = Player->GetActorForwardVector();
            const FVector Right = Player->GetActorRightVector();

            const float TargetDistance =
                FVector::Dist2D(Player->GetActorLocation(), Target);
            const float Alignment =
                FMath::Max(0.0f, FVector::DotProduct(Forward, ToTarget));

            // Modulate the approach speed using distance and heading. Players
            // should brake earlier when arriving at an angle instead of
            // running at full input and snapping into formation.
            const float HeadingBrake =
                FMath::Lerp(0.58f, 1.0f, Alignment);
            const float DistanceInput =
                FMath::Clamp(TargetDistance / 650.0f, 0.22f, 1.0f);
            const float DesiredInputMagnitude =
                FMath::Clamp(
                    DistanceInput * HeadingBrake,
                    0.18f,
                    1.0f);

            Player->SetMovementInput(
                FVector2D(
                    FVector::DotProduct(ToTarget, Forward),
                    FVector::DotProduct(ToTarget, Right)).GetSafeNormal()
                    * DesiredInputMagnitude);

            const bool bCanSprint =
                TargetDistance > 700.0f &&
                Alignment > 0.15f &&
                !Player->GetVelocity().IsNearlyZero(30.0f);

            Player->Sprint(bCanSprint);
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
    GoalkeeperActionCooldown = 1.0f;

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
    GoalkeeperActionCooldown = 0.8f;
    ResetBallToCenter();
}

void AObitrendMatchAIController::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    if (!Spawner || !Ball) return;

    GoalkeeperActionCooldown =
        FMath::Max(0.0f, GoalkeeperActionCooldown - DeltaSeconds);

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

    UpdateGoalkeeperActions(DeltaSeconds);
    UpdatePossession(DeltaSeconds);

    if (PossessingPlayer.IsValid())
    {
        ExecutePossessionAction(DeltaSeconds);
        UpdateDefensivePressure(DeltaSeconds);
    }

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