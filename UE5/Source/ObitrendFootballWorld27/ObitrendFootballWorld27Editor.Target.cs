using UnrealBuildTool;
using System.Collections.Generic;

public class ObitrendFootballWorld27EditorTarget : TargetRules
{
    public ObitrendFootballWorld27EditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_8;
        ExtraModuleNames.Add("ObitrendFootballWorld27");
    }
}