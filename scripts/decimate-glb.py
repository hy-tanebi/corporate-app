# Blender headless: GLB を decimate して draco 付きで再エクスポートする
# 使い方: Blender --background --python decimate.py -- <in.glb> <out.glb> <ratio>
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
src, dst, ratio = argv[0], argv[1], float(argv[2])

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    bpy.context.view_layer.objects.active = obj
    mod = obj.modifiers.new(name="dec", type="DECIMATE")
    mod.ratio = ratio
    # Armature モディファイアより前に置いて、レストポーズのメッシュに対して適用する
    bpy.ops.object.modifier_move_to_index(modifier="dec", index=0)
    bpy.ops.object.modifier_apply(modifier="dec")
    tris = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    print(f"DECIMATED: {obj.name} -> {len(obj.data.polygons)} polys / ~{tris} tris")

bpy.ops.export_scene.gltf(
    filepath=dst,
    export_format="GLB",
    export_animations=True,
    export_skins=True,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=12,
    export_draco_normal_quantization=8,
    export_draco_texcoord_quantization=10,
    export_image_format="WEBP",
    export_image_quality=80,
)
print("EXPORTED:", dst)
