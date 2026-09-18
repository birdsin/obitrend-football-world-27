# OBITREND FOOTBALL WORLD 27 — Unreal Engine 5 Prototype

This folder is a parallel 3D prototype. The existing HTML/JS game remains untouched on `main`.

## Target

Build a true 3D football match with:
- photorealistic adult player characters
- physically simulated ball
- full-body animation and motion matching
- cinematic stadium/tunnel startup
- broadcast and gameplay cameras
- realistic materials, lighting, shadows and crowd/audio
- 22-player match simulation
- PS5-style touch controls retained as the mobile input concept
- Android performance/scalability profiles
- multiplayer added after the offline match foundation is stable

## Engine stack

- Unreal Engine 5.8
- C++ for core gameplay systems
- Blueprints for tuning and presentation
- Enhanced Input
- Control Rig / animation systems
- Chaos physics
- Nanite/Lumen where the target Android device can support them; use mobile-scaled alternatives when profiling requires it

## Project entry point

Open:

`UE5/ObitrendFootballWorld27.uproject`

The C++ module is under:

`UE5/Source/ObitrendFootballWorld27/`

## Asset requirement

Photorealism depends on high-quality, legally usable assets: player bodies/faces, kits, boots, stadiums, animation/mocap, crowd, materials and audio. Real names/data do not by themselves grant rights to player likenesses, club branding or stadium IP.

## Build order

1. Stadium + cinematic startup
2. Player character + rig + locomotion
3. Ball physics + foot contact
4. Passing, shooting, tackling and goalkeeper behavior
5. 22-player match AI
6. Broadcast/gameplay camera system
7. Crowd/audio/presentation
8. Android optimization
9. Multiplayer

Do not delete or replace the current web game while this prototype is developed.