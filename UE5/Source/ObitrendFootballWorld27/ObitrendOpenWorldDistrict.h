#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ObitrendOpenWorldDistrict.generated.h"

UCLASS()
class OBITRENDFOOTBALLWORLD27_API AObitrendOpenWorldDistrict : public AActor
{
    GENERATED_BODY()

public:
    AObitrendOpenWorldDistrict();

protected:
    virtual void BeginPlay() override;

private:
    void BuildDistrict();

    UPROPERTY()
    TObjectPtr<class UInstancedStaticMeshComponent> RoadInstances;

    UPROPERTY()
    TObjectPtr<class UInstancedStaticMeshComponent> BuildingInstances;

    UPROPERTY()
    TObjectPtr<class UInstancedStaticMeshComponent> PlazaInstances;

    UPROPERTY()
    TObjectPtr<class UInstancedStaticMeshComponent> GreenSpaceInstances;

    UPROPERTY()
    TObjectPtr<class UStaticMesh> CubeMesh;
};