def check_compatibility(components: dict) -> dict:
    notes = []
    is_compatible = True

    cpu = components.get('CPU')
    motherboard = components.get('MOTHERBOARD')
    ram = components.get('RAM')
    psu = components.get('PSU')
    gpu = components.get('GPU')

    if cpu and motherboard:
        cpu_name = cpu.name.lower() if cpu else ''
        mb_name = motherboard.name.lower() if motherboard else ''

        intel_cpu = any(x in cpu_name for x in ['intel', 'core i', 'i3', 'i5', 'i7', 'i9'])
        amd_cpu = any(x in cpu_name for x in ['amd', 'ryzen'])

        intel_mb = any(x in mb_name for x in ['intel', 'lga', 'z790', 'z690', 'b760', 'h770'])
        amd_mb = any(x in mb_name for x in ['amd', 'am4', 'am5', 'x570', 'b550', 'x670'])

        if intel_cpu and amd_mb:
            is_compatible = False
            notes.append('⚠️ Intel CPU is not compatible with AMD motherboard!')
        elif amd_cpu and intel_mb:
            is_compatible = False
            notes.append('⚠️ AMD CPU is not compatible with Intel motherboard!')

    if psu and gpu:
        psu_name = psu.name.lower() if psu else ''
        gpu_name = gpu.name.lower() if gpu else ''

        high_end_gpu = any(x in gpu_name for x in ['rtx 4090', 'rtx 4080', 'rtx 3090', 'rx 7900'])
        low_psu = any(x in psu_name for x in ['450w', '500w', '550w'])

        if high_end_gpu and low_psu:
            is_compatible = False
            notes.append('⚠️ PSU wattage may be insufficient for this GPU. Recommend 750W+')

    critical = ['CPU', 'MOTHERBOARD', 'RAM', 'STORAGE', 'PSU']
    missing = [c for c in critical if c not in components]
    if missing:
        notes.append(f'ℹ️ Missing components: {", ".join(missing)}')

    if not notes:
        notes.append('✅ All components are compatible!')

    return {
        'is_compatible': is_compatible,
        'notes': '\n'.join(notes)
    }