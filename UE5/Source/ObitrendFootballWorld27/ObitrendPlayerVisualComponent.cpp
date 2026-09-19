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

    // Keep the body skeletal mesh intact. A separate KitMesh asset can only be
    // applied when the character has a dedicated clothing component; replacing the
    // body mesh here would remove the realistic body/rig.
    const TArray<FName> SlotNames = Mesh->GetMaterialSlotNames();

    bool bAppliedSkin = false;
    bool bAppliedKit = false;

    for (int32 Index = 0; Index < Mesh->GetNumMaterials(); ++Index)
    {
        const FString SlotName =
            SlotNames.IsValidIndex(Index)
            ? SlotNames[Index].ToString().ToLower()
            : FString();

        const bool bSkinSlot =
            SlotName.Contains(TEXT("skin")) ||
            SlotName.Contains(TEXT("body")) ||
            SlotName.Contains(TEXT("face"));

        const bool bKitSlot =
            SlotName.Contains(TEXT("kit")) ||
            SlotName.Contains(TEXT("jersey")) ||
            SlotName.Contains(TEXT("shirt")) ||
            SlotName.Contains(TEXT("short")) ||
            SlotName.Contains(TEXT("sock"));

        if (SkinMaterial && bSkinSlot)
        {
            Mesh->SetMaterial(Index, SkinMaterial);
            bAppliedSkin = true;
        }
        else if (KitMaterial && bKitSlot)
        {
            Mesh->SetMaterial(Index, KitMaterial);
            bAppliedKit = true;
        }
    }

    // Safe fallback for simple prototype meshes whose slots are unnamed.
    if (KitMaterial && !bAppliedKit && Mesh->GetNumMaterials() > 0)
    {
        Mesh->SetMaterial(0, KitMaterial);
    }

    // SkinMaterial remains opt-in by slot name so it cannot accidentally cover the kit.

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
