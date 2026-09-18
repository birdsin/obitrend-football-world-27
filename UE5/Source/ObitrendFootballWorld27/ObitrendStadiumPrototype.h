#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ObitrendStadiumPrototype.generated.h"

UCLASS()
class OBITRENDFOOTBALLWORLD27_API AObitrendStadiumPrototype : public AActor
{
    GENERATED_BODY()

public:
    AObitrendStadiumPrototype();

protected:
    virtual void BeginPlay() override;

private:
    void BuildStadium();
    UStaticMeshComponent* AddBox(const FVector& Location, const FVector& Scale, const FRotator& Rotation = FRotator::ZeroRotator);
    UStaticMeshComponent* AddCylinder(const FVector& Location, const FVector& Scale);

    UPROPERTY()
    TObjectPtr<UStaticMesh> CubeMesh;

    UPROPERTY()
    TObjectPtr<UStaticMesh> CylinderMesh;

    UPROPERTY()
    TObjectPtr<UMaterialInterface> FieldMaterial;

    UPROPERTY()
    TObjectPtr<UMaterialInterface> StructureMaterial;

    UPROPERTY()
    TObjectPtr<UMaterialInterface> SeatMaterial;

    UPROPERTY()
    TObjectPtr<UMaterialInterface> LightMaterial;
};