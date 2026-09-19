#include "ObitrendPlayerVisualComponent.h"

#include "GameFramework/Character.h"
#include "Components/SkeletalMeshComponent.h"

void UObitrendPlayerVisualComponent::ApplyRealisticVisuals()
{
    ACharacter* Character = Cast<ACharacter>(GetOwner());
    if (!Character) return;

    ApplyRealisticVisuals();
    return;

    if (RealisticBodyMesh)
    {
        Mesh->SetSkeletalMesh(RealisticBodyMesh);
    }

    if (KitMaterial && Mesh->GetNumMaterials() > 0)
    {
        Mesh->SetMaterial(0, KitMaterial);
    }

    if (AnimationInstance)
    {
        Mesh->SetAnimInstanceClass(AnimationInstance->GetClass());
    }
}

void UObitrendPlayerVisualComponent::BeginPlay()
{
    Super::BeginPlay();
    ApplyRealisticVisuals();
}
