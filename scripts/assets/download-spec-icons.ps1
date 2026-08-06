# Downloads WotLK talent spec icons from Wowhead's zamimg CDN and saves as PNG.
Add-Type -AssemblyName System.Drawing

$specIcons = @{
    "death-knight-blood"         = "spell_deathknight_bloodpresence"
    "death-knight-frost"         = "spell_deathknight_frostpresence"
    "death-knight-unholy"        = "spell_deathknight_unholypresence"
    "druid-balance"              = "spell_nature_starfall"
    "druid-feral"                = "ability_druid_catform"
    "druid-restoration"          = "spell_nature_healingtouch"
    "hunter-beast-mastery"       = "ability_hunter_beasttaming"
    "hunter-marksmanship"        = "ability_marksmanship"
    "hunter-survival"            = "ability_hunter_swiftstrike"
    "mage-arcane"                = "spell_holy_magicalsentry"
    "mage-fire"                  = "spell_fire_flamebolt"
    "mage-frost"                 = "spell_frost_frostbolt02"
    "paladin-holy"               = "spell_holy_holybolt"
    "paladin-protection"         = "ability_paladin_shieldofthetemplar"
    "paladin-retribution"        = "spell_holy_auraoflight"
    "priest-discipline"          = "spell_holy_powerwordshield"
    "priest-holy"                = "spell_holy_guardianspirit"
    "priest-shadow"              = "spell_shadow_shadowwordpain"
    "rogue-assassination"        = "ability_rogue_eviscerate"
    "rogue-combat"               = "ability_backstab"
    "rogue-subtlety"             = "ability_stealth"
    "shaman-elemental"           = "spell_nature_lightning"
    "shaman-enhancement"         = "spell_nature_lightningshield"
    "shaman-restoration"         = "spell_nature_magicimmunity"
    "warlock-affliction"         = "spell_shadow_deathcoil"
    "warlock-demonology"         = "spell_shadow_metamorphosis"
    "warlock-destruction"        = "spell_shadow_rainoffire"
    "warrior-arms"               = "ability_warrior_savageblow"
    "warrior-fury"               = "ability_warrior_innerrage"
    "warrior-protection"         = "ability_warrior_defensivestance"
}

$outDir = Join-Path $PSScriptRoot "..\src\assets\class-icons\specs"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$failed = @()
foreach ($entry in $specIcons.GetEnumerator()) {
    $fileName = "$($entry.Key).png"
    $iconName = $entry.Value
    $url = "https://wow.zamimg.com/images/wow/icons/large/$iconName.jpg"
    $tempJpg = Join-Path $env:TEMP "wow-icon-$($entry.Key).jpg"
    $outPath = Join-Path $outDir $fileName

    try {
        Invoke-WebRequest -Uri $url -OutFile $tempJpg -UseBasicParsing
        $image = [System.Drawing.Image]::FromFile($tempJpg)
        $image.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $image.Dispose()
        Remove-Item $tempJpg -Force
        Write-Host "OK $fileName ($iconName)"
    } catch {
        $failed += "$fileName ($iconName): $_"
        Write-Host "FAIL $fileName ($iconName)"
    }
}

if ($failed.Count -gt 0) {
    Write-Host "`nFailed downloads:"
    $failed | ForEach-Object { Write-Host $_ }
    exit 1
}

Write-Host "`nAll $($specIcons.Count) spec icons downloaded."
