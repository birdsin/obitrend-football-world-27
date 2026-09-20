#include "ObitrendOpenWorldDistrict.h"

#include "Components/InstancedStaticMeshComponent.h"
#include "UObject/ConstructorHelpers.h"

AObitrendOpenWorldDistrict::AObitrendOpenWorldDistrict()
{
    PrimaryActorTick.bCanEverTick = false;
    RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("WorldRoot"));

    static ConstructorHelpers::FObjectFinder<UStaticMesh> CubeFinder(
        TEXT("/Engine/BasicShapes/Cube.Cube"));

    if (CubeFinder.Succeeded())
    {
        CubeMesh = CubeFinder.Object;
    }

    RoadInstances = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("RoadInstances"));
    BuildingInstances = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("BuildingInstances"));
    PlazaInstances = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("PlazaInstances"));
    GreenSpaceInstances = CreateDefaultSubobject<UInstancedStaticMeshComponent>(TEXT("GreenSpaceInstances"));

    for (UInstancedStaticMeshComponent* Component :
        {RoadInstances.Get(), BuildingInstances.Get(), PlazaInstances.Get(), GreenSpaceInstances.Get()})
    {
        Component->SetupAttachment(RootComponent);
        Component->SetMobility(EComponentMobility::Static);
        Component->SetCollisionProfileName(TEXT("BlockAll"));
    }

    if (CubeMesh)
    {
        RoadInstances->SetStaticMesh(CubeMesh);
        BuildingInstances->SetStaticMesh(CubeMesh);
        PlazaInstances->SetStaticMesh(CubeMesh);
        GreenSpaceInstances->SetStaticMesh(CubeMesh);
    }
}

void AObitrendOpenWorldDistrict::BeginPlay()
{
    Super::BeginPlay();
    BuildDistrict();
}

void AObitrendOpenWorldDistrict::BuildDistrict()
{
    if (!CubeMesh) return;

    // Large, streaming-friendly district around the stadium. The geometry is
    // intentionally instanced so a high-end Android build can keep draw calls
    // and memory lower than spawning hundreds of individual actors.
    constexpr int32 RoadCount = 11;
    constexpr float RoadSpacing = 4200.0f;
    constexpr float RoadHalfLength = 30000.0f;
    constexpr float RoadWidth = 260.0f;

    for (int32 Index = -RoadCount / 2; Index <= RoadCount / 2; ++Index)
    {
        const float Offset = Index * RoadSpacing;

        RoadInstances->AddInstance(
            FTransform(
                FRotator::ZeroRotator,
                FVector(Offset, 0.0f, -45.0f),
                FVector(RoadWidth, RoadHalfLength, 0.35f)));

        RoadInstances->AddInstance(
            FTransform(
                FRotator::ZeroRotator,
                FVector(0.0f, Offset, -45.0f),
                FVector(RoadHalfLength, RoadWidth, 0.35f)));
    }

    // Open plazas at four corners of the stadium district.
    for (const FVector& Location :
        {
            FVector(-12500.0f, -12500.0f, -20.0f),
            FVector(-12500.0f,  12500.0f, -20.0f),
            FVector( 12500.0f, -12500.0f, -20.0f),
            FVector( 12500.0f,  12500.0f, -20.0f)
        })
    {
        PlazaInstances->AddInstance(
            FTransform(
                FRotator::ZeroRotator,
                Location,
                FVector(900.0f, 900.0f, 0.25f)));
    }

    // City blocks with varied height. Buildings stay outside the stadium
    // footprint, leaving clear routes for future shops, parking and missions.
    int32 BuildingIndex = 0;
    for (int32 X = -4; X <= 4; ++X)
    {
        for (int32 Y = -4; Y <= 4; ++Y)
        {
            if (FMath::Abs(X) <= 1 && FMath::Abs(Y) <= 1)
                continue;

            const float BaseX = X * RoadSpacing + 1350.0f;
            const float BaseY = Y * RoadSpacing + 1350.0f;

            for (int32 Slot = 0; Slot < 4; ++Slot)
            {
                const float LocalX = (Slot % 2) * 1150.0f;
                const float LocalY = (Slot / 2) * 1150.0f;

                const float Height =
                    500.0f +
                    static_cast<float>((BuildingIndex * 37 + Slot * 83) % 1800);

                const float Width =
                    420.0f +
                    static_cast<float>((BuildingIndex * 19 + Slot * 61) % 280);

                BuildingInstances->AddInstance(
                    FTransform(
                        FRotator(
                            0.0f,
                            static_cast<float>((BuildingIndex * 13 + Slot * 17) % 4) * 90.0f,
                            0.0f),
                        FVector(BaseX + LocalX, BaseY + LocalY, Height * 0.5f),
                        FVector(Width, Width, Height * 0.01f)));

                ++BuildingIndex;
            }
        }
    }

    // Small green pockets between blocks give the open world visual breaks
    // without adding a large number of individual foliage actors.
    for (int32 X = -4; X <= 4; ++X)
    {
        for (int32 Y = -4; Y <= 4; ++Y)
        {
            if ((X + Y) % 2 != 0) continue;

            GreenSpaceInstances->AddInstance(
                FTransform(
                    FRotator::ZeroRotator,
                    FVector(
                        X * RoadSpacing - 700.0f,
                        Y * RoadSpacing - 700.0f,
                        -5.0f),
                    FVector(500.0f, 500.0f, 0.12f)));
        }
    }
}