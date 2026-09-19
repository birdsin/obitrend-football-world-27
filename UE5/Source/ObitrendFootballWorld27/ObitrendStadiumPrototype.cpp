#include "ObitrendStadiumPrototype.h"

#include "Components/StaticMeshComponent.h"
#include "UObject/ConstructorHelpers.h"
#include "Materials/Material.h"

AObitrendStadiumPrototype::AObitrendStadiumPrototype()
{
    PrimaryActorTick.bCanEverTick = false;
    RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("StadiumRoot"));

    static ConstructorHelpers::FObjectFinder<UStaticMesh> CubeFinder(
        TEXT("/Engine/BasicShapes/Cube.Cube"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> CylinderFinder(
        TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));

    if (CubeFinder.Succeeded()) CubeMesh = CubeFinder.Object;
    if (CylinderFinder.Succeeded()) CylinderMesh = CylinderFinder.Object;

    static ConstructorHelpers::FObjectFinder<UMaterialInterface> FieldFinder(
        TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));
    if (FieldFinder.Succeeded())
    {
        FieldMaterial = FieldFinder.Object;
        StructureMaterial = FieldFinder.Object;
        SeatMaterial = FieldFinder.Object;
        LightMaterial = FieldFinder.Object;
    }
}

void AObitrendStadiumPrototype::BeginPlay()
{
    Super::BeginPlay();
    BuildStadium();
}

UStaticMeshComponent* AObitrendStadiumPrototype::AddBox(
    const FVector& Location,
    const FVector& Scale,
    const FRotator& Rotation)
{
    if (!CubeMesh) return nullptr;

    UStaticMeshComponent* Component =
        NewObject<UStaticMeshComponent>(this);

    Component->SetStaticMesh(CubeMesh);
    Component->SetWorldLocation(Location);
    Component->SetWorldRotation(Rotation);
    Component->SetWorldScale3D(Scale);
    Component->SetMobility(EComponentMobility::Static);
    Component->SetCollisionProfileName(TEXT("BlockAll"));
    Component->AttachToComponent(RootComponent, FAttachmentTransformRules::KeepWorldTransform);
    Component->RegisterComponent();

    return Component;
}

UStaticMeshComponent* AObitrendStadiumPrototype::AddCylinder(
    const FVector& Location,
    const FVector& Scale)
{
    if (!CylinderMesh) return nullptr;

    UStaticMeshComponent* Component =
        NewObject<UStaticMeshComponent>(this);

    Component->SetStaticMesh(CylinderMesh);
    Component->SetWorldLocation(Location);
    Component->SetWorldScale3D(Scale);
    Component->SetMobility(EComponentMobility::Static);
    Component->SetCollisionProfileName(TEXT("BlockAll"));
    Component->AttachToComponent(RootComponent, FAttachmentTransformRules::KeepWorldTransform);
    Component->RegisterComponent();

    return Component;
}

void AObitrendStadiumPrototype::BuildStadium()
{
    // Pitch: 105m x 68m. UE units are centimeters.
    AddBox(FVector(0, 0, -20), FVector(5250, 3400, 20));

    // Touchline and goal-line markings.
    const float LineZ = 23.0f;
    const float LineW = 8.0f;

    AddBox(FVector(0, -3400, LineZ), FVector(5250, LineW, 4));
    AddBox(FVector(0,  3400, LineZ), FVector(5250, LineW, 4));
    AddBox(FVector(-5250, 0, LineZ), FVector(LineW, 3400, 4));
    AddBox(FVector( 5250, 0, LineZ), FVector(LineW, 3400, 4));

    // Halfway line and centre circle approximation.
    AddBox(FVector(0, 0, LineZ + 1), FVector(LineW, 3400, 4));

    // Professional pitch markings: penalty areas, six-yard boxes and spot markers.
    const float MarkZ = LineZ + 2.0f;
    const float BoxDepth = 1650.0f;
    const float BoxWidth = 2010.0f;
    const float SixDepth = 550.0f;
    const float SixWidth = 920.0f;

    for (const float XSign : {-1.0f, 1.0f})
    {
        const float GoalX = XSign * 5250.0f;
        const float BoxX = GoalX - XSign * BoxDepth;

        AddBox(FVector(BoxX, -BoxWidth, MarkZ), FVector(BoxDepth, LineW, 4));
        AddBox(FVector(BoxX,  BoxWidth, MarkZ), FVector(BoxDepth, LineW, 4));
        AddBox(FVector(GoalX - XSign * BoxDepth, 0, MarkZ), FVector(LineW, BoxWidth, 4));

        const float SixX = GoalX - XSign * SixDepth;
        AddBox(FVector(SixX, -SixWidth, MarkZ), FVector(SixDepth, LineW, 4));
        AddBox(FVector(SixX,  SixWidth, MarkZ), FVector(SixDepth, LineW, 4));
        AddBox(FVector(GoalX - XSign * SixDepth, 0, MarkZ), FVector(LineW, SixWidth, 4));

        AddCylinder(FVector(GoalX - XSign * 1100.0f, 0, MarkZ + 1.0f), FVector(18, 18, 3));
    }

    // Center spot and a segmented center circle.
    AddCylinder(FVector(0, 0, MarkZ + 1.0f), FVector(18, 18, 3));

    const int32 CircleSegments = 48;
    const float CircleRadius = 915.0f;
    for (int32 Segment = 0; Segment < CircleSegments; ++Segment)
    {
        const float A0 = (2.0f * PI * Segment) / CircleSegments;
        const float A1 = (2.0f * PI * (Segment + 1)) / CircleSegments;
        const FVector P0(FMath::Cos(A0) * CircleRadius, FMath::Sin(A0) * CircleRadius, MarkZ);
        const FVector P1(FMath::Cos(A1) * CircleRadius, FMath::Sin(A1) * CircleRadius, MarkZ);
        const FVector Mid = (P0 + P1) * 0.5f;
        const FVector Delta = P1 - P0;
        const float Length = Delta.Size2D() * 0.5f;
        AddBox(Mid, FVector(Length, LineW, 4), FRotator(0.0f, FMath::RadiansToDegrees(FMath::Atan2(Delta.Y, Delta.X)), 0.0f));
    }

    // Four-tier surrounding stands.
    const float StandBase = 3550.0f;
    for (int32 Tier = 0; Tier < 4; ++Tier)
    {
        const float Y = StandBase + Tier * 620.0f;
        const float Height = 220.0f + Tier * 85.0f;
        AddBox(FVector(0,  Y, Height), FVector(6100, 260, 170 + Tier * 35));
        AddBox(FVector(0, -Y, Height), FVector(6100, 260, 170 + Tier * 35));
    }

    for (int32 Tier = 0; Tier < 4; ++Tier)
    {
        const float X = StandBase + Tier * 620.0f;
        const float Height = 220.0f + Tier * 85.0f;
        AddBox(FVector( X, 0, Height), FVector(260, 4000, 170 + Tier * 35));
        AddBox(FVector(-X, 0, Height), FVector(260, 4000, 170 + Tier * 35));
    }

    // Roof beams and a high roof ring.
    const float RoofZ = 3600.0f;
    AddBox(FVector(0,  5650, RoofZ), FVector(6500, 180, 90));
    AddBox(FVector(0, -5650, RoofZ), FVector(6500, 180, 90));
    AddBox(FVector(5650, 0, RoofZ), FVector(180, 5000, 90));
    AddBox(FVector(-5650, 0, RoofZ), FVector(180, 5000, 90));

    // Floodlight towers.
    const FVector Towers[] = {
        FVector(-6100, -6100, 2100),
        FVector(-6100,  6100, 2100),
        FVector( 6100, -6100, 2100),
        FVector( 6100,  6100, 2100)
    };

    for (const FVector& Tower : Towers)
    {
        AddCylinder(Tower, FVector(85, 85, 2100));
        AddBox(Tower + FVector(0, 0, 2200), FVector(420, 90, 18));
    }

    // Goal frames at both ends.
    const float GoalZ = 210.0f;
    for (const float X : {-5250.0f, 5250.0f})
    {
        const float Dir = X < 0 ? -1.0f : 1.0f;
        AddBox(FVector(X, -3660, GoalZ), FVector(55, 55, 210));
        AddBox(FVector(X,  3660, GoalZ), FVector(55, 55, 210));
        AddBox(FVector(X, 0, GoalZ + 210), FVector(55, 3600, 55));
        AddBox(FVector(X + Dir * 300, 0, 80), FVector(300, 3600, 25));
    }

    // Technical areas.
    AddBox(FVector(0, -4050, 120), FVector(1400, 260, 90));
    AddBox(FVector(0,  4050, 120), FVector(1400, 260, 90));

    // Pitch-side camera platforms.
    AddBox(FVector(-1800, -4300, 220), FVector(320, 260, 100));
    AddBox(FVector( 1800, -4300, 220), FVector(320, 260, 100));
}