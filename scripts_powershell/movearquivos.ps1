Get-ChildItem -Directory | ForEach-Object {
    $topLevel = $_.FullName

    Get-ChildItem -Path $topLevel -Recurse -File | ForEach-Object {
        $dest = Join-Path $topLevel $_.Name

        # Se já existir um arquivo com o mesmo nome, renomear automaticamente
        $i = 1
        while (Test-Path $dest) {
            $base = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
            $ext = $_.Extension
            $dest = Join-Path $topLevel "$base ($i)$ext"
            $i++
        }

        Move-Item $_.FullName -Destination $dest
    }
}