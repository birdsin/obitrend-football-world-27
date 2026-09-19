#include "ObitrendPlayerVisualComponent.h"

#include "GameFramework/Character.h"
#include "Components/SkeletalMeshComponent.h"
#include "Animation/AnimInstance.h"

void UObitrendPlayerVisualComponent::ApplyRealisticVisuals()
{
    ACharacter* Character = Cast<ACharacter>(GetOwner());
    if (!Character) return;

    USkeletalMeshComponent* Mesh = Character->GetMesh();
    if (!Mesh) return;

    if (RealisticBodyMesh)
    {
        Mesh->SetSkeletalMesh(RealisticBodyMesh);
    }

    if (KitMesh)
    {
        Mesh->SetSkeletalMesh(KitMesh);
    }

    if (SkinMaterial)
    {
        for (int32 Index = 0; Index < Mesh->GetNumMaterials(); ++Index)
        {
            if (Mesh->GetMaterial(Index) == nullptr)
            {
                Mesh->SetMaterial(Index, SkinMaterial);
            }
        }
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
